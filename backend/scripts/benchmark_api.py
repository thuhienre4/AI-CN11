import argparse
import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests


def percentile(values: list[float], percentage: float) -> float:
    if not values:
        return 0
    ordered = sorted(values)
    index = min(len(ordered) - 1, round((len(ordered) - 1) * percentage))
    return ordered[index]


def main() -> None:
    parser = argparse.ArgumentParser(description="Small repeatable EngineLab API load check")
    parser.add_argument("--url", default="http://127.0.0.1:8000/health")
    parser.add_argument("--requests", type=int, default=100)
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--token", default="", help="Optional JWT for an authenticated endpoint")
    args = parser.parse_args()

    headers = {"Authorization": f"Bearer {args.token}"} if args.token else {}

    def request_once() -> tuple[int, float]:
        started = time.perf_counter()
        try:
            response = requests.get(args.url, headers=headers, timeout=15)
            return response.status_code, (time.perf_counter() - started) * 1000
        except requests.RequestException:
            return 0, (time.perf_counter() - started) * 1000

    started = time.perf_counter()
    results = []
    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = [executor.submit(request_once) for _ in range(args.requests)]
        for future in as_completed(futures):
            results.append(future.result())

    elapsed = time.perf_counter() - started
    durations = [duration for _, duration in results]
    successes = sum(1 for code, _ in results if 200 <= code < 400)
    print(
        {
            "url": args.url,
            "requests": len(results),
            "concurrency": args.concurrency,
            "success_rate_percent": round(successes / max(len(results), 1) * 100, 2),
            "throughput_requests_per_second": round(len(results) / max(elapsed, 0.001), 2),
            "latency_ms": {
                "average": round(statistics.mean(durations), 2),
                "p50": round(percentile(durations, 0.5), 2),
                "p95": round(percentile(durations, 0.95), 2),
                "maximum": round(max(durations, default=0), 2),
            },
        }
    )


if __name__ == "__main__":
    main()
