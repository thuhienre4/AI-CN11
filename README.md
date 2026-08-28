# EngineLab AI - EdTech Graduation Project

EngineLab AI is an EdTech web application for high-school Technology learning. It combines structured lessons, interactive 3D simulations, quizzes, an AI Tutor, classroom workflows, reference materials, and learning analytics for teacher/student use.

## Main Features

- Student learning path, lesson detail pages, quiz practice, warm-up games, and 3D simulation activities.
- AI Tutor for lesson-focused Q&A with chat history and learning-event tracking.
- Personal Learning Analytics: progress, quiz score, time spent, mastery, engagement, risk score, weak lessons, and suggested learning path.
- Teacher Analytics: class overview, at-risk students, weak knowledge units, and intervention suggestions.
- Classroom: announcements, assignments, submissions, grading, and reference materials.
- Role-based access control for `student`, `teacher`, `admin`, and `moderator`.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Zustand, Axios, Three.js.
- Backend: FastAPI, SQLAlchemy, Pydantic v2, JWT auth.
- Database: SQLite by default for local demo; configurable for PostgreSQL.

## Project Structure

```text
AI-CN11/
  backend/
    auth/            JWT, password hashing, role dependencies
    models/          SQLAlchemy models
    routes/          API routers
    schemas/         Pydantic request/response schemas
    config.py        Environment settings
    database.py      SQLAlchemy engine/session
    main.py          FastAPI app entry
  frontend/
    src/
      components/    Shared UI
      data/          Demo curriculum and simulations
      pages/         App screens
      services/      API client
      store/         Zustand stores
      utils/         Local analytics fallback
```

## Requirements

- Node.js 18+
- Python 3.11+ recommended
- Optional: Docker and Docker Compose

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by execution policy.

## Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs at:

- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

## Frontend Setup

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Frontend runs at:

- `http://localhost:5173`
- Login page: `http://localhost:5173/login`

Create `frontend/.env` if the backend is on a custom URL:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Environment Variables

Backend settings use the `ENGINE_LAB_` prefix. Create `backend/.env` when needed:

```env
ENGINE_LAB_DEBUG=true
ENGINE_LAB_DATABASE_URL=sqlite:///../ai_education.db
ENGINE_LAB_SECRET_KEY=change-this-secret
ENGINE_LAB_ACCESS_TOKEN_EXPIRE_MINUTES=120
ENGINE_LAB_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Optional Nova3D integration:

```env
ENGINE_LAB_NOVA3D_AUTH_TOKEN=...
ENGINE_LAB_NOVA3D_PROVIDER_API_KEY=...
```

Set `ENGINE_LAB_ENVIRONMENT=production` in production. Startup will stop if the
default JWT secret is still in use. The AI Tutor shows whether each answer came
from Gemini, the safe backend fallback, or offline browser fallback.

## Catalog and Offline Event Synchronization

Fresh backend databases are automatically seeded from
`backend/data/course_catalog.json` (19 courses, 73 lessons, and 146 questions).
After editing the frontend curriculum, regenerate this artifact with:

```powershell
cd frontend
npm.cmd run export:backend-catalog
```

Learning events are written locally first, assigned a stable client event ID,
and synchronized to the backend in batches. Replayed batches are idempotent.
Authenticated WebSocket updates refresh student progress and notify teacher
sessions after learning evidence changes.

## Roles and Permissions

- `student`: learns lessons, submits quizzes, asks AI Tutor, submits assignments, views own analytics.
- `teacher`: manages classroom content, assignments, materials, course/lesson/question content, and teacher analytics.
- `admin` / `moderator`: can manage teacher-facing content.

Students can only access their own learning, quiz, and chat data. Teachers/admins can inspect class-level analytics and student evidence for intervention.

## Useful API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/courses`
- `GET /api/courses/{course_id}/lessons`
- `POST /api/chat/message?user_id={id}`
- `POST /api/quiz/submit?user_id={id}`
- `POST /api/quiz/attempts?user_id={id}`
- `POST /api/quiz/attempts/{attempt_id}/finalize`
- `POST /api/learning/users/{user_id}/events/batch`
- `GET /api/learning/users/{user_id}/dashboard`
- `GET /api/learning/teacher/analytics`
- `GET /api/classroom/posts`
- `GET /api/classroom/assignments`
- `GET /api/materials`

## Testing and Build

```powershell
# Backend
cd backend
pytest

# Frontend tests
cd frontend
npm.cmd test -- --run

# Frontend production build
npm.cmd run build
```

Backend tests cover JWT/RBAC, answer-key privacy, quiz attempt accounting,
idempotent learning evidence, and risk scoring. A repeatable local load check is
also available:

```powershell
cd backend
python scripts/benchmark_api.py --requests 100 --concurrency 10
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that builds the Vite frontend and publishes `frontend/dist` to GitHub Pages after every push to `main`.

To enable the site on GitHub:

1. Open the repository Settings.
2. Go to Pages.
3. Set Source to `GitHub Actions`.
4. Push to `main` and wait for the `Deploy Frontend to GitHub Pages` action to finish.

The frontend build is configured for the repository path `/AI-CN11/`. The deployed URL will usually be:

```text
https://thuhienre4.github.io/AI-CN11/
```

The static GitHub Pages version uses the bundled demo curriculum data in
`frontend/src/data`. JWT, centralized analytics, Gemini, PostgreSQL, uploads,
and realtime updates require the FastAPI server to be deployed separately and
connected with `VITE_API_URL`. GitHub Pages alone is therefore a demo frontend,
not the complete Client-Server deployment.

## Local Demo Notes

The frontend includes a local-auth fallback for classroom demos when the backend is unavailable. When the backend is running, real JWT auth and role checks are used. Local analytics are also kept as a fallback, then merged with backend analytics when available.

## Docker

```powershell
docker compose up --build
```

Default service URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Graduation Project Positioning

EngineLab AI is structured as a scalable EdTech prototype:

- Clear separation between frontend, backend, database, and optional AI/3D services.
- Role-aware workflows for teachers and students.
- Learning analytics based on evidence: lesson views, simulations, AI questions, quiz attempts, time spent, and scores.
- AI Tutor designed to support explanation, remediation, and personalized recommendations.
