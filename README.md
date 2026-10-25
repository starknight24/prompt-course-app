# PromptCraft

A full-stack learning platform that teaches prompt engineering through structured
lessons, practice questions, and LLM-generated feedback on learners' answers.

**Live:** [prompt-engineering-course.web.app](https://prompt-engineering-course.web.app)

## Overview

Most prompt-engineering material is a list of tips with no way to practise or get
feedback. PromptCraft structures the topic as a course: learners move from
fundamentals (what a prompt is, common mistakes) through intermediate techniques
(chain-of-thought, prompt chaining) to production skills (testing, optimisation,
prompt libraries), and answer practice questions after each lesson. Short answers
can be sent to an LLM for a hint, a rubric-style evaluation against the reference
answer, or a suggested improvement. The app is a React front end backed by an
Express API on Firebase Cloud Functions, with Firestore for data and Algolia for
search.

## Key features

- **Curriculum:** 5 modules, 18 lessons and 54 practice questions (multiple choice
  and short answer), with a visual roadmap from beginner to advanced.
- **LLM feedback:** three modes (hint, rubric, improve) using OpenAI `gpt-4o-mini`,
  called only from the backend so the API key never reaches the browser.
- **Progress tracking:** lesson completion, streaks, statistics and bookmarks.
- **Search:** full-text search across modules and lessons with Algolia.
- **Admin dashboard:** create, edit and publish modules, lessons and questions;
  bulk import from JSON; engagement analytics.
- **Security:** Firebase ID-token verification on every API route, an admin
  custom claim, deny-by-default Firestore rules with owner-only access to user
  data, and DOMPurify sanitisation of lesson HTML.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Firebase JS SDK, DOMPurify
- **Backend:** Node.js, Express on Firebase Cloud Functions, Firebase Admin SDK
- **Data and services:** Cloud Firestore, Firebase Auth, Firebase Hosting, Algolia, OpenAI API

## How to run

Requirements: Node.js 18+ (the Cloud Functions runtime uses Node 22), the Firebase
CLI (`npm install -g firebase-tools`), a Firebase project on the Blaze plan, an
OpenAI API key, and optionally an Algolia account for search.

```bash
git clone https://github.com/starknight24/prompt-course-app.git
cd prompt-course-app

# Frontend
npm install
cp .env.example .env          # fill in the VITE_FIREBASE_* values (and VITE_ALGOLIA_* for search)
npm run dev                   # http://localhost:5173

# Backend (new terminal)
cd prompt-admin-backend/functions
npm install
cp .env.example .env          # OPENAI_API_KEY, ALGOLIA_* keys
npm run serve                 # Firebase emulator
```

Deploy:

```bash
cd prompt-admin-backend
firebase use <your-project-id>
firebase deploy --only functions
firebase deploy --only firestore:rules
cd .. && npm run build && firebase deploy --only hosting
```

Load the course content by uploading
`prompt-admin-backend/functions/scripts/course-content.json` on the admin
**Bulk Import** page (`/admin/import`), then run
`node scripts/algolia-sync.js` from `prompt-admin-backend/functions` to index it
for search.

## Project structure

```
prompt-course-app/
├── src/
│   ├── api/              API client modules (catalog, practice, progress, admin, ...)
│   ├── components/       pages, admin screens, layout and UI components
│   ├── context/          user, progress and theme state
│   └── firebase.js       Firebase client initialisation (reads VITE_* env vars)
├── prompt-admin-backend/
│   └── functions/
│       ├── index.js      Express app entry point
│       ├── routes/       auth, catalog, practice, progress, search, roadmap, feedback, admin
│       ├── middleware/   token verification, admin check, request validation
│       ├── services/     Algolia indexing and search
│       └── scripts/      course content (JSON) and Algolia sync
├── firestore.rules       Firestore security rules
└── SYSTEM_DESIGN_DOCUMENT.md
```

## API

All routes are served from Cloud Functions under `/v1` and require a Firebase ID
token, except `GET /health`.

| Area | Endpoints |
|---|---|
| Catalog | `GET /v1/modules`, `GET /v1/modules/:id`, `GET /v1/lessons`, `GET /v1/lessons/:id`, `GET /v1/roadmap`, `GET /v1/search?q=` |
| Practice | `POST /v1/submit-response`, `POST /v1/llm-feedback` |
| Progress | `POST /v1/save-progress`, `GET /v1/progress`, `GET /v1/progress/stats`, `PATCH /v1/bookmarks` |
| Feedback | `POST /v1/report` |
| Admin | CRUD on `/v1/admin/modules`, `/v1/admin/lessons`, `/v1/admin/questions`; `POST /v1/admin/bulk-import`; `POST /v1/admin/publish-lesson`; `GET /v1/admin/analytics/engagement` |

## Next steps

- Add automated tests for the API routes and Firestore rules (for example with the Firebase emulator).
- Add more practice question types and per-question analytics for admins.
- Store LLM feedback alongside responses so learners can review it later.
