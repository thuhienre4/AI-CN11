"""Reproducible classroom-scale verification against a real uvicorn process.

Each repetition starts a fresh server on a fresh database, so runs are independent.

    python scripts/review_load_test.py --workdir <empty dir> --out results.json
"""
import argparse
import asyncio
import json
import os
import platform
import random
import sqlite3
import statistics
import subprocess
import sys
import time
from pathlib import Path

import aiohttp

BACKEND = Path(os.environ.get("REVIEW_BACKEND_DIR", Path(__file__).resolve().parents[1]))
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}"
CATALOG = json.loads((BACKEND / "data" / "course_catalog.json").read_text(encoding="utf-8"))
ENGINE_LESSONS = [lesson for lesson in CATALOG["lessons"] if "Bài 18" in lesson["title"] or "Bài 19" in lesson["title"]]
LESSON = ENGINE_LESSONS[0]["id"]
SECOND_LESSON = ENGINE_LESSONS[1]["id"]
COURSE = ENGINE_LESSONS[0]["course_id"]


def percentile(values, share):
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, round((len(ordered) - 1) * share))] if ordered else 0


def summarize(samples, elapsed):
    latencies = [latency for _, latency in samples]
    success = sum(1 for status, _ in samples if 200 <= status < 300)
    errors = {}
    for status, _ in samples:
        if not 200 <= status < 300:
            errors[str(status)] = errors.get(str(status), 0) + 1
    return {
        "requests": len(samples),
        "success_percent": round(success / max(len(samples), 1) * 100, 2),
        "throughput_rps": round(len(samples) / max(elapsed, 0.001), 2),
        "mean_ms": round(statistics.mean(latencies), 2) if latencies else 0,
        "p50_ms": round(percentile(latencies, 0.50), 2),
        "p95_ms": round(percentile(latencies, 0.95), 2),
        "p99_ms": round(percentile(latencies, 0.99), 2),
        "max_ms": round(max(latencies, default=0), 2),
        "errors": errors,
    }


class Recorder:
    def __init__(self, session):
        self.session = session
        self.samples = []

    async def call(self, method, path, token=None, **kwargs):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        started = time.perf_counter()
        try:
            async with self.session.request(method, BASE + path, headers=headers, **kwargs) as response:
                body = await response.read()
                status = response.status
        except (aiohttp.ClientError, asyncio.TimeoutError):
            body, status = b"", 0
        self.samples.append((status, (time.perf_counter() - started) * 1000))
        try:
            return status, json.loads(body) if body else None
        except ValueError:
            return status, None


async def scenario(session, jobs, concurrency):
    """Run jobs (callables taking a Recorder) with bounded concurrency."""
    recorder = Recorder(session)
    gate = asyncio.Semaphore(concurrency)

    async def guarded(job):
        async with gate:
            await job(recorder)

    started = time.perf_counter()
    await asyncio.gather(*(guarded(job) for job in jobs))
    return summarize(recorder.samples, time.perf_counter() - started)


def start_server(database, log_path):
    env = {
        **os.environ,
        "ENGINE_LAB_DATABASE_URL": f"sqlite:///{database.as_posix()}",
        "ENGINE_LAB_ALLOW_TEACHER_SELF_REGISTRATION": "true",
        "ENGINE_LAB_REQUIRE_STUDENT_VERIFICATION": "false",
        "ENGINE_LAB_SECRET_KEY": "review-load-test-secret",
        "GEMINI_API_KEY": "",
        "ENGINE_LAB_AI_API_KEY": "",
    }
    log = open(log_path, "ab")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--port", str(PORT), "--log-level", "warning"],
        cwd=BACKEND, env=env, stdout=log, stderr=log,
    )


async def wait_until_ready(session):
    for _ in range(300):
        try:
            async with session.get(BASE + "/health") as response:
                if response.status == 200:
                    return
        except aiohttp.ClientError:
            await asyncio.sleep(0.1)
    raise RuntimeError("server did not start")


async def create_people(session, students):
    recorder = Recorder(session)
    people = []
    gate = asyncio.Semaphore(4)

    async def register(index):
        role = "teacher" if index == students else "student"
        name = f"load_{role}_{index}"
        async with gate:
            status, user = await recorder.call("POST", "/api/auth/register", json={
                "username": name, "email": f"{name}@example.com", "password": "load-test-pass-1",
                "full_name": name, "role": role, "student_class": "11A1",
            })
        assert status == 201, status
        people.append({"name": name, "id": user["id"], "role": role})

    await asyncio.gather(*(register(index) for index in range(students + 1)))
    return [p for p in people if p["role"] == "student"], next(p for p in people if p["role"] == "teacher")


async def quiz_flow(recorder, student, lesson, questions):
    status, attempt = await recorder.call("POST", f"/api/quiz/attempts?user_id={student['id']}",
                                          student["token"], json={"lesson_id": lesson})
    if status != 201:
        return
    for question in questions:
        await recorder.call("POST", f"/api/quiz/submit?user_id={student['id']}", student["token"], json={
            "question_id": question["id"], "attempt_id": attempt["id"],
            "selected_answer": str(random.choice(question["options"])["id"]), "time_spent_seconds": 5,
        })
    await recorder.call("POST", f"/api/quiz/attempts/{attempt['id']}/finalize", student["token"],
                        json={"client_event_id": f"quiz-{student['id']}-{attempt['id']}"})


def scalar(database, sql, *args):
    with sqlite3.connect(database, timeout=30) as connection:
        return connection.execute(sql, args).fetchone()[0]


def status_counts(results):
    statuses = [status for status, _ in results]
    return {str(status): statuses.count(status) for status in sorted(set(statuses))}



async def open_socket(session, token, timeout):
    """Open the learning socket the way the web client does: the token goes in the first message, not the URL."""
    socket = await session.ws_connect(f"ws://127.0.0.1:{PORT}/api/ws/learning", timeout=timeout)
    await socket.send_json({"type": "auth", "token": token})
    return socket

async def websocket_scenario(session, people, teacher):
    """Open one socket per person, as the web client does after sign-in, and stop at the first failure.

    A socket only counts when its "connected" message arrives within 5 s and an ordinary
    database-backed request still answers within 5 s while every socket stays open.
    """
    connect_ms, sockets = [], []
    limit = None
    probe_timeout = aiohttp.ClientTimeout(total=5)
    for person in [teacher, *people]:
        started = time.perf_counter()
        try:
            socket = await open_socket(session, person['token'], 5)
            sockets.append(socket)
            await socket.receive_json(timeout=5)
            connect_ms.append((time.perf_counter() - started) * 1000)
            async with session.get(f"{BASE}/api/lessons/{LESSON}", timeout=probe_timeout) as probe:
                await probe.read()
                if probe.status != 200:
                    raise RuntimeError(probe.status)
        except (asyncio.TimeoutError, aiohttp.ClientError, RuntimeError, TypeError) as error:
            limit = {"failed_at_socket": len(sockets), "error": type(error).__name__}
            break
    delivery_ms = []
    if limit is None:
        for index, student in enumerate(people[:20]):
            recorder = Recorder(session)
            started = time.perf_counter()
            await recorder.call("POST", f"/api/learning/users/{student['id']}/events", student["token"],
                                json={"lesson_id": LESSON, "event_type": "lesson_viewed",
                                      "client_event_id": f"socket-delivery-{index:04d}"})
            await sockets[0].receive_json(timeout=10)
            delivery_ms.append((time.perf_counter() - started) * 1000)
    for socket in sockets:
        await socket.close()
    return {
        "requested": len(people) + 1,
        "established": len(connect_ms),
        "limit": limit,
        "connect_p95_ms": round(percentile(connect_ms, 0.95), 2),
        "post_to_teacher_delivery_p50_ms": round(percentile(delivery_ms, 0.5), 2),
        "post_to_teacher_delivery_p95_ms": round(percentile(delivery_ms, 0.95), 2),
    }


async def integrity_checks(session, database, students):
    recorder = Recorder(session)

    student = students[0]
    url = f"/api/learning/users/{student['id']}/events"
    same_id = {"lesson_id": LESSON, "event_type": "lesson_viewed", "client_event_id": "race-same-id-0001"}
    results = await asyncio.gather(*(recorder.call("POST", url, student["token"], json=same_id) for _ in range(20)))
    same_id_result = {
        "parallel_requests": 20,
        "status_counts": status_counts(results),
        "rows_stored": scalar(database, "select count(*) from learning_events where client_event_id=?",
                              same_id["client_event_id"]),
    }

    other = students[1]
    _, attempt = await recorder.call("POST", f"/api/quiz/attempts?user_id={other['id']}", other["token"],
                                     json={"lesson_id": SECOND_LESSON})
    finals = await asyncio.gather(*(
        recorder.call("POST", f"/api/quiz/attempts/{attempt['id']}/finalize", other["token"], json={})
        for _ in range(10)))
    finalize_result = {
        "parallel_requests": 10,
        "status_counts": status_counts(finals),
        "attempts_counted": scalar(
            database, "select coalesce(sum(quiz_attempt_count),0) from lesson_progress where user_id=? and lesson_id=?",
            other["id"], SECOND_LESSON),
    }

    third = students[2]
    url = f"/api/learning/users/{third['id']}/events"
    first_touch = await asyncio.gather(*(
        recorder.call("POST", url, third["token"], json={
            "lesson_id": SECOND_LESSON, "event_type": "lesson_viewed", "client_event_id": f"first-touch-{index:04d}"})
        for index in range(10)))
    first_touch_result = {
        "parallel_requests": 10,
        "status_counts": status_counts(first_touch),
        "events_stored": scalar(database, "select count(*) from learning_events where user_id=? and lesson_id=?",
                                third["id"], SECOND_LESSON),
        "view_count": scalar(database, "select coalesce(sum(view_count),0) from lesson_progress where user_id=? and lesson_id=?",
                             third["id"], SECOND_LESSON),
    }
    return {"same_event_id": same_id_result, "double_finalize": finalize_result, "first_touch_progress": first_touch_result}


async def failure_injection(session, database, log_path, server, student):
    url = f"/api/learning/users/{student['id']}/events/batch"
    recorder = Recorder(session)
    batch = [{"lesson_id": LESSON, "event_type": "lesson_viewed", "client_event_id": f"outage-event-{i:04d}"}
             for i in range(30)]
    status, _ = await recorder.call("POST", url, student["token"], json=batch)
    stored = scalar(database, "select count(*) from learning_events where client_event_id like 'outage-event-%'")
    server.kill()
    server.wait()
    down_status, _ = await recorder.call("POST", url, student["token"], json=batch)
    restarted = start_server(database, log_path)
    await wait_until_ready(session)
    retry_status, _ = await recorder.call("POST", url, student["token"], json=batch)
    return restarted, {
        "first_delivery_status": status,
        "status_while_server_down": down_status,
        "retry_status_after_restart": retry_status,
        "rows_after_first_delivery": stored,
        "rows_after_retry": scalar(database, "select count(*) from learning_events where client_event_id like 'outage-event-%'"),
    }


async def end_to_end(session, students, teacher):
    """One student journey across every layer, ending with what the teacher sees."""
    student = students[-1]
    recorder = Recorder(session)
    token, uid = student["token"], student["id"]
    steps = []

    def step(name, condition):
        steps.append({"step": name, "passed": bool(condition)})

    status, lesson = await recorder.call("GET", f"/api/lessons/{LESSON}")
    step("open_lesson", status == 200 and lesson["id"] == LESSON)
    status, questions = await recorder.call("GET", f"/api/lessons/{LESSON}/questions", token)
    step("questions_hide_answers", status == 200 and all("is_correct" not in o for q in questions for o in q["options"]))
    status, _ = await recorder.call("POST", f"/api/learning/users/{uid}/events", token, json={
        "lesson_id": LESSON, "event_type": "simulation_opened", "client_event_id": "e2e-simulation-01"})
    step("record_simulation", status == 201)
    _, attempt = await recorder.call("POST", f"/api/quiz/attempts?user_id={uid}", token, json={"lesson_id": LESSON})
    for question in questions:
        await recorder.call("POST", f"/api/quiz/submit?user_id={uid}", token, json={
            "question_id": question["id"], "attempt_id": attempt["id"],
            "selected_answer": str(question["options"][0]["id"]), "time_spent_seconds": 10})
    status, finished = await recorder.call("POST", f"/api/quiz/attempts/{attempt['id']}/finalize", token,
                                           json={"client_event_id": "e2e-quiz-final-01"})
    step("finish_quiz", status == 200 and finished["status"] == "submitted")
    status, reply = await recorder.call("POST", f"/api/chat/message?user_id={uid}", token, json={
        "user_message": "Kỳ nào sinh công?", "lesson_id": LESSON})
    step("labelled_fallback_reply", status == 201 and reply["response_mode"] == "fallback")
    status, dashboard = await recorder.call("GET", f"/api/learning/users/{uid}/dashboard", token)
    row = next(item for item in dashboard["lesson_progress"] if item["lesson_id"] == LESSON)
    step("student_dashboard", status == 200 and row["quiz_attempt_count"] >= 1 and row["simulation_count"] >= 1)
    status, analytics = await recorder.call("GET", "/api/learning/teacher/analytics", teacher["token"])
    step("teacher_analytics", status == 200 and analytics["summary"]["total_students"] == len(students))
    return steps


async def repetition(index, args):
    random.seed(index)
    workdir = Path(args.workdir)
    database = workdir / f"run_{index}.db"
    log_path = workdir / f"run_{index}.log"
    database.unlink(missing_ok=True)
    server = start_server(database, log_path)
    connector = aiohttp.TCPConnector(limit=0)
    timeout = aiohttp.ClientTimeout(total=180)
    result = {"run": index}
    try:
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            await wait_until_ready(session)
            students, teacher = await create_people(session, args.students)
            everyone = [*students, teacher]

            def login_job(person):
                async def job(recorder):
                    status, body = await recorder.call("POST", "/api/auth/login", json={
                        "username": person["name"], "password": "load-test-pass-1"})
                    if status == 200:
                        person["token"] = body["access_token"]
                return job

            result["login"] = await scenario(session, [login_job(p) for p in everyone], len(everyone))
            missing = [p for p in everyone if "token" not in p]
            if missing:  # the rest of the run needs a signed-in class
                result["login"]["accounts_needing_retry"] = len(missing)
                await scenario(session, [login_job(p) for p in missing], 2)

            result["health"] = await scenario(
                session, [lambda r: r.call("GET", "/health") for _ in range(100)], 10)
            result["catalog_read"] = await scenario(
                session, [lambda r: r.call("GET", f"/api/courses/{COURSE}/lessons") for _ in range(200)], args.students)

            _, questions = await Recorder(session).call("GET", f"/api/lessons/{LESSON}/questions", students[0]["token"])

            def quiz_job(student):
                return lambda recorder: quiz_flow(recorder, student, LESSON, questions)

            result["quiz_flow"] = await scenario(session, [quiz_job(s) for s in students], args.students)

            def batch_job(student):
                events = [{"lesson_id": LESSON, "event_type": "lesson_session", "duration_seconds": 30,
                           "client_event_id": f"sync-{student['id']}-{n:04d}"} for n in range(20)]
                return lambda recorder: recorder.call(
                    "POST", f"/api/learning/users/{student['id']}/events/batch", student["token"], json=events)

            result["offline_batch_sync"] = await scenario(session, [batch_job(s) for s in students], args.students)

            def dashboard_job(student):
                return lambda recorder: recorder.call(
                    "GET", f"/api/learning/users/{student['id']}/dashboard", student["token"])

            result["dashboard_first_open"] = await scenario(session, [dashboard_job(s) for s in students], args.students)
            result["dashboard_repeat"] = await scenario(session, [dashboard_job(s) for s in students], args.students)
            result["teacher_analytics"] = await scenario(
                session, [lambda r: r.call("GET", "/api/learning/teacher/analytics", teacher["token"]) for _ in range(5)], 1)

            def chat_job(student):
                return lambda recorder: recorder.call(
                    "POST", f"/api/chat/message?user_id={student['id']}", student["token"],
                    json={"user_message": "Động cơ 4 kỳ làm việc thế nào?", "lesson_id": LESSON})

            result["chat_fallback"] = await scenario(session, [chat_job(s) for s in students], args.students)

            async def mixed_session(recorder, student, deadline):
                sequence = 0
                while time.perf_counter() < deadline:
                    await recorder.call("GET", f"/api/lessons/{LESSON}")
                    await recorder.call("POST", f"/api/learning/users/{student['id']}/events", student["token"], json={
                        "lesson_id": LESSON, "event_type": "lesson_session", "duration_seconds": 5,
                        "client_event_id": f"mix-{student['id']}-{index}-{sequence:05d}"})
                    await quiz_flow(recorder, student, LESSON, questions)
                    sequence += 1
                    await asyncio.sleep(random.uniform(args.think_min, args.think_max))

            # The web client keeps one socket per signed-in user, so the class mix runs with all of them open.
            class_sockets = await asyncio.gather(*(open_socket(session, person['token'], 10) for person in everyone))
            deadline = time.perf_counter() + args.mixed_seconds
            result["classroom_mix"] = await scenario(
                session, [lambda r, s=s: mixed_session(r, s, deadline) for s in students], args.students)
            await asyncio.gather(*(socket.close() for socket in class_sockets))

            result["integrity"] = await integrity_checks(session, database, students)
            result["end_to_end"] = await end_to_end(session, students, teacher)
            server, result["failure_injection"] = await failure_injection(session, database, log_path, server, students[3])
            result["websocket"] = await websocket_scenario(session, students, teacher)
    finally:
        server.kill()
        server.wait()
    log_text = log_path.read_text(encoding="utf-8", errors="ignore")
    result["locked_errors_in_log"] = log_text.count("database is locked")
    result["pool_timeouts_in_log"] = log_text.count("QueuePool limit")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workdir", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--runs", type=int, default=5)
    parser.add_argument("--students", type=int, default=40)
    parser.add_argument("--mixed-seconds", type=float, default=30)
    parser.add_argument("--think-min", type=float, default=1.0)
    parser.add_argument("--think-max", type=float, default=3.0)
    args = parser.parse_args()
    Path(args.workdir).mkdir(parents=True, exist_ok=True)
    output = {
        "python": platform.python_version(),
        "architecture": platform.architecture()[0],
        "platform": platform.platform(),
        "students": args.students,
        "runs": [],
    }
    for index in range(1, args.runs + 1):
        output["runs"].append(asyncio.run(repetition(index, args)))
        Path(args.out).write_text(json.dumps(output, ensure_ascii=False, indent=1), encoding="utf-8")
        print("finished run", index, flush=True)


if __name__ == "__main__":
    main()
