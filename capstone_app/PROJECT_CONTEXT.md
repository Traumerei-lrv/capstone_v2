# Capstone App — Project Context

> Generated: 2026-05-20

## Overview

- Project type: React (Vite) single-page frontend that uses Supabase for authentication and persistence. The UI is a gamified learning environment focusing on data structures lessons (linked lists, etc.).
- Workspace root: `capstone_app` (this file lives at the project root as `PROJECT_CONTEXT.md`).

## Top-level folders

- `frontend/` — Main application (React + Vite).
- `backend/` — (empty / not present in workspace) — no server code found.
- `db/` — (empty / not present in workspace) — no local DB migrations or schema files found.
- `others/` — miscellaneous HTML test files and notes.

## Frontend — key info

- Location: `frontend/`
- Package manager files: `frontend/package.json`, `frontend/package-lock.json`.
- Build output: `frontend/dist/` (contains built assets).
- Vite config: `frontend/vite.config.js`.

### Dependencies (from `frontend/package.json`)
- `react`, `react-dom` (React 18)
- `vite`, `@vitejs/plugin-react`
- `react-router-dom` (routing)
- `@supabase/supabase-js` and `@supabase/ssr` (Supabase client)
- `gsap` (animations)

### Entry & routing
- App entry: `frontend/src/main.jsx` — renders `<App />` into `#root`.
- Routing and auth: `frontend/src/App.jsx`
  - Routes defined:
    - `/` -> Login (or redirect to dashboard if authenticated)
    - `/playershipdashboard` -> `PlayerShipDashboard` (protected)
    - `/nodemapoverlay` -> `NodeMapOverlay` (protected)
    - `/test` -> test page
  - Uses Supabase session to gate protected routes and `LoadingScreen` while checking auth.

### Supabase
- Config: `frontend/src/supabase.js` — reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment.
- `.env.example`: `frontend/.env.example` shows expected env variables.
- Note: The workspace contains no local DB; Supabase is an external service and must be configured.

### Important pages & components (paths)
- `frontend/src/pages/LoginPage/LoginPage.jsx` — sign-in / sign-up UI, Google OAuth flow.
- `frontend/src/pages/Dashboard/Dashboard.jsx` — main dashboard (GSAP animated cards, logout via Supabase).
- `frontend/src/pages/NodeMapOverlay.jsx` — horizontal lesson map, node selection, plays `LinkedListQuestV2`.
- `frontend/src/pages/LinkedListQuestV2/LinkedListQuestV2.jsx` — lesson content (Linked List Quest).
- `frontend/src/components/` — UI helpers:
  - `HyperSpaceBackground.jsx`, `HyperSpaceHorizontal.jsx`, `Title.jsx`, `TypewriterEffect.jsx`, `PageTransition.jsx`, `LoadingBar.jsx`.
- Fonts & assets: `frontend/src/assets/` (fonts, images, logos, backgrounds).

### Styles
- `frontend/src/index.css` plus component-level CSS files such as `frontend/src/pages/LoginPage/LoginPage.css` and `frontend/src/pages/Dashboard/Dashboard.css`.

## Backend / DB status
- `backend/` and `db/` directories are present in workspace structure but contain no code or migration files.
- The app relies on Supabase for auth and persistence; there is no internal API server in the repo.

## Other artifacts
- `others/linked_list_quest_v2.html`, `others/hyperspacetest.html` — static test pages.
- Build assets in `frontend/dist/` (already built output included in repo).
- Misc images: `loginPage.png`, `loadingScreen.png` at the repo root.

## Runtime / dev requirements
- Required environment variables (for frontend dev):

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

- Common commands (from `frontend/`):

```bash
npm install
npm run dev    # start vite dev server
npm run build  # produce production build into frontend/dist/
```

## Known observations
- No internal backend or DB schema files present — if server-side endpoints or custom business logic are needed, add code under `backend/` or implement Supabase Edge Functions.
- Supabase environment variables are required; without them `frontend/src/supabase.js` will throw on startup.
- Routing and protected routes are implemented in `frontend/src/App.jsx`.

## Suggested next steps
- Add a short README at the project root if you want quick onboarding for other developers.
- If you need a local backend, scaffold `backend/` with an Express/Fastify or serverless functions project and add an API proxy or migration files under `db/`.
- If you want, I can:
  - generate a `README.md` summarizing setup and env steps, or
  - scaffold a minimal backend under `backend/`, or
  - extract a list of all component files and their purposes.

---

Generated from a workspace scan (files read: `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/supabase.js`, `frontend/src/pages/NodeMapOverlay.jsx`, `frontend/src/pages/LoginPage/LoginPage.jsx`, `frontend/src/pages/Dashboard/Dashboard.jsx`, plus file listing). If you'd like additional details (API endpoints, data model, or a README variant), tell me which format you prefer.
