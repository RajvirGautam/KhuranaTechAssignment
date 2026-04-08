# AI Job Application Tracker

A full-stack TypeScript web app for tracking job applications in a Kanban board with AI-assisted job description parsing and resume bullet point suggestions.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + React Query + dnd-kit
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt + Google OAuth
- AI: OpenRouter API (Nemotron) with strict JSON validation

## Features

- Register and login with JWT auth
- Login with Google OAuth
- Protected frontend and backend routes
- Persistent login via local storage token + `/auth/me`
- Kanban board with five stages:
  - Applied
  - Phone Screen
  - Interview
  - Offer
  - Rejected
- Drag and drop cards between columns
- Create, edit, and delete application cards
- AI Job Description parser for:
  - Company name
  - Role
  - Required skills
  - Nice-to-have skills
  - Seniority
  - Location
  - Paste job text or provide a public job URL for scraping
- AI-generated resume bullet suggestions (3 to 5) with copy buttons
- Frontend loading, empty, and error states
- Service-layer AI implementation (no provider logic in route handlers)

## Setup

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Build

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/applications`
- `POST /api/applications`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`
- `POST /api/ai/parse`
  - Accepts `jobDescription` or `jobLink`
- `POST /api/ai/suggestions`

## Notes

- Add `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` for Google sign-in.
- Add your own `AI_API` key in `backend/.env`.
- Never commit secrets.
- If the AI provider returns invalid JSON, backend returns a safe `422` response and frontend shows an error message instead of crashing.
- Public job pages can be scraped when they are accessible server-side. Some sites may block bots or require login/JS rendering, so site-specific adapters may still be needed for perfect coverage.
