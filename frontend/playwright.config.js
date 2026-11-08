import { defineConfig } from '@playwright/test'

// End-to-end runs against the real FastAPI server (fresh SQLite file) and the production build of the interface.
export const API = 'http://127.0.0.1:8765'
// A port of its own, so a developer's `npm run dev` on 5173 does not collide
const WEB = 'http://localhost:5180'
export const E2E_ADMIN = { username: 'e2e_admin', password: 'QuanTri#E2E2026' }

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: WEB,
    trace: 'retain-on-failure',
    // Locally an installed Chrome can be used instead of downloading a browser: E2E_CHANNEL=chrome
    ...(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {}),
  },
  webServer: [
    {
      command: 'python -c "import os; [os.remove(f) for f in (\'e2e.db\', \'e2e.db-wal\', \'e2e.db-shm\') if os.path.exists(f)]" && python -m uvicorn main:app --host 127.0.0.1 --port 8765',
      cwd: '../backend',
      url: `${API}/health`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ENGINE_LAB_DATABASE_URL: 'sqlite:///./e2e.db',
        ENGINE_LAB_ENVIRONMENT: 'development',
        ENGINE_LAB_CORS_ORIGINS: JSON.stringify([WEB]),
        // An administrator for journeys that need a verified teacher; the database is thrown away after each run
        ENGINE_LAB_BOOTSTRAP_ADMIN_USERNAME: E2E_ADMIN.username,
        ENGINE_LAB_BOOTSTRAP_ADMIN_EMAIL: 'e2e-admin@example.com',
        ENGINE_LAB_BOOTSTRAP_ADMIN_PASSWORD: E2E_ADMIN.password,
      },
    },
    {
      command: 'npx vite build && npx vite preview --port 5180 --strictPort',
      url: WEB,
      timeout: 180_000,
      reuseExistingServer: false,
      env: { VITE_API_URL: API, VITE_BASE_PATH: '/' },
    },
  ],
})
