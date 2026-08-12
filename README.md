# ❤️ Shared Study & Progress Tracker

A full-stack app for couples to track daily study tasks, streaks, and unlock
hidden surprise rewards together. Split into two independently deployable
apps:

```
shared-study-progress-tracker/
├── backend/     Express + TypeScript API (auth, tasks, surprises, etc.)
└── frontend/    React + Vite app (the UI)
```

## The "bridge"

The frontend and backend are separate apps that can be deployed to different
hosts (e.g. backend on Render/Railway, frontend on Vercel/Netlify). They're
connected by a single setting:

- **`frontend/.env` → `VITE_API_URL`**: the backend's public URL
  (e.g. `https://your-backend.onrender.com`). The frontend prefixes every
  API call with this. Leave it empty for local dev.
- **`backend/.env` → `FRONTEND_ORIGIN`**: the frontend's public URL
  (e.g. `https://your-app.vercel.app`). The backend uses this to lock down
  CORS so only your frontend can call the API. Leave it empty for local dev
  (defaults to allowing any origin).

## Local development

Run both apps in separate terminals:

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env   # fill in JWT_SECRET if you want
npm run dev             # → http://localhost:3000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev              # → http://localhost:5173
```

You don't need to set `VITE_API_URL` locally — Vite's dev server proxies
`/api/*` requests straight to `http://localhost:3000` for you (see
`frontend/vite.config.ts`).

Login with the seeded demo accounts: `admin` / `password123` and
`learner` / `password123`.

## Deploying

**Backend** (Render, Railway, Fly.io, a VPS — anything that runs a
long-lived Node process):
1. Deploy the `backend/` folder.
2. Set env vars: `JWT_SECRET` (a long random string) and, once you know your
   frontend's URL, `FRONTEND_ORIGIN`.
3. Data persists to `backend/data/store.json` on that host's disk — fine for
   platforms with a persistent filesystem (a VPS, or Render's persistent
   disks); on platforms with ephemeral storage, data will reset on restart/
   redeploy.

**Frontend** (Vercel, Netlify, or any static host):
1. Deploy the `frontend/` folder (build command `npm run build`, output
   dir `dist`).
2. Set env var `VITE_API_URL` to your deployed backend's URL.
3. Redeploy after setting it — Vite bakes env vars in at build time.

## Features

- Role-based access (Admin / Learner) with JWT auth
- Daily task tracking with streaks and milestone unlocks
- Server-enforced surprise rewards — content is stripped from API responses
  until the backend verifies the unlock condition is actually met
- Encouragement messages, reactions, cute notes, and in-browser voice notes
- A fixed daily routine timetable with live "current slot" detection
- Japanese N4/N5 lesson progress tracking
