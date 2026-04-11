# PromptCraft — Prompt Engineering Learning Platform

An interactive web-based learning platform that teaches **prompt engineering** for large language models (LLMs) like ChatGPT, Claude, and Gemini. Inspired by the Duolingo learning experience, PromptCraft delivers curated lessons, AI-powered feedback, practice questions, and progress tracking to help users write sharper, more effective prompts.

**Live app:** [https://prompt-engineering-course.web.app](https://prompt-engineering-course.web.app)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Dependencies](#dependencies)
- [Setup & Installation](#setup--installation)
- [Development Commands](#development-commands)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Building with AI](#building-with-ai)

---

## Project Overview

PromptCraft is a full-stack course platform designed to teach prompt engineering through structured, progressive modules. Users move from beginner fundamentals (what a prompt is, common mistakes) through intermediate strategies (chain-of-thought, prompt chaining) to advanced production skills (testing, optimization, building prompt libraries).

The platform features:
- **5 modules** spanning beginner to advanced levels
- **18 lessons** with rich HTML content and real prompt examples
- **54 practice questions** (multiple choice and short answer)
- **AI-powered feedback** on student responses via OpenAI
- **Progress tracking** with streaks, completion stats, and bookmarks
- **Full admin dashboard** for content management

---

## Key Features

### For Learners
- **Structured Curriculum** — Lessons organized into modules with a visual roadmap showing progression from beginner to advanced
- **Practice Questions** — Multiple choice and short-answer questions after each lesson to reinforce learning
- **AI Feedback** — OpenAI-powered hints, rubric grading, and improvement suggestions on practice answers
- **Progress Tracking** — Tracks lesson completion, in-progress status, streak days, and bookmarks
- **Search** — Full-text search across modules and lessons powered by Algolia
- **Bookmarks** — Save lessons for later review
- **Dark Mode** — Toggle between light and dark themes
- **Feedback System** — Report bugs, content issues, or suggest improvements directly from the app

### For Admins
- **Content Management** — Full CRUD for modules, lessons, and questions
- **Bulk Import** — Upload JSON files to seed content in batch
- **Analytics Dashboard** — View engagement metrics and content stats
- **Publish Control** — Toggle lesson visibility without deleting content

### Security
- **Firebase Authentication** — Email/password sign-up with password strength validation
- **Firestore Security Rules** — Role-based access control with admin custom claims
- **XSS Protection** — All user-facing HTML content sanitized via DOMPurify
- **API Authentication** — All backend endpoints protected with Firebase ID token verification
- **Admin Middleware** — Cached admin role checks with 5-minute TTL

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│   React 19 + Vite + Tailwind CSS + React Router              │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ Dashboard │  │ Lessons  │  │ Roadmap  │  │  Admin   │    │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│         │              │             │             │          │
│         └──────────────┴─────────────┴─────────────┘         │
│                         │                                     │
│                    API Client                                 │
│              (Firebase Auth tokens)                           │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┴───────────────────────────────────┐
│                    Backend (Cloud Functions)                  │
│              Express.js API on Firebase Functions             │
│                                                              │
│   ┌──────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ │
│   │ Auth │ │Catalog │ │Practice  │ │Progress│ │  Admin   │  │
│   └──────┘ └────────┘ └──────────┘ └────────┘ └──────────┘  │
│                │            │                        │        │
│         ┌──────┴────────────┴────────────────────────┘       │
│         │                                                     │
│   ┌─────┴─────┐    ┌──────────┐    ┌──────────┐             │
│   │ Firestore │    │  OpenAI  │    │ Algolia  │             │
│   │   (DB)    │    │  (LLM)   │    │ (Search) │             │
│   └───────────┘    └──────────┘    └──────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Data Model (Firestore)

| Collection | Purpose | Access |
|---|---|---|
| `users` | User profiles and roles | Owner read, admin write |
| `modules` | Course modules (title, level, order) | Authenticated read, admin write |
| `lessons` | Lesson content, metadata, moduleId | Authenticated read, admin write |
| `lessons/{id}/questions` | Practice questions per lesson | Authenticated read, admin write |
| `progress` | User lesson progress and bookmarks | Owner only |
| `responses` | User practice question submissions | Owner create/read (immutable) |
| `reports` | User feedback and bug reports | Authenticated create, admin read |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19.1 | UI framework with hooks and Context API |
| [Vite](https://vite.dev/) | 6.3 | Build tooling and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-first CSS styling |
| [React Router](https://reactrouter.com/) | 7.6 | Client-side routing |
| [Firebase JS SDK](https://firebase.google.com/docs/web/setup) | 10.12 | Authentication and Firestore client |
| [Heroicons](https://heroicons.com/) | 2.2 | SVG icon library |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.2 | HTML sanitization (XSS prevention) |
| [Algoliasearch](https://www.algolia.com/doc/) | 5.50 | Client-side search (optional) |
| [React Hot Toast](https://react-hot-toast.com/) | 2.6 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Firebase Cloud Functions](https://firebase.google.com/docs/functions) | 6.0 | Serverless API hosting |
| [Express.js](https://expressjs.com/) | 5.1 | HTTP routing and middleware |
| [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) | 12.6 | Server-side Firestore and Auth |
| [OpenAI SDK](https://platform.openai.com/docs/) | 4.73 | AI-powered practice feedback (gpt-4o-mini) |
| [Algoliasearch](https://www.algolia.com/doc/) | 5.50 | Search indexing and querying |
| [CORS](https://github.com/expressjs/cors) | 2.8 | Cross-origin request handling |

### Infrastructure
| Service | Purpose |
|---|---|
| [Firebase Authentication](https://firebase.google.com/docs/auth) | User sign-up/login (email/password) |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | NoSQL document database |
| [Firebase Hosting](https://firebase.google.com/docs/hosting) | Static frontend hosting |
| [Algolia](https://www.algolia.com/) | Full-text search across content |
| [OpenAI API](https://platform.openai.com/) | LLM-powered student feedback |

---

## Dependencies

### Prerequisites
- **Node.js** >= 18 (backend requires Node 22 for Cloud Functions)
- **npm** >= 9
- **Firebase CLI** (`npm install -g firebase-tools`)
- A **Firebase project** on the Blaze (pay-as-you-go) plan
- An **OpenAI API key** (for AI feedback features)
- An **Algolia account** (for search — free tier available)

### Frontend Dependencies
```
react, react-dom, react-router-dom    — Core UI and routing
firebase                               — Auth and Firestore client
@heroicons/react                       — Icon components
dompurify                              — HTML sanitization
algoliasearch                          — Search client
react-hot-toast                        — Toast notifications
tailwindcss, postcss, autoprefixer     — Styling
vite, @vitejs/plugin-react             — Build tooling
eslint, eslint-plugin-react-*          — Code quality
```

### Backend Dependencies
```
firebase-functions, firebase-admin     — Cloud Functions runtime
express, cors                          — HTTP API framework
openai                                 — LLM feedback integration
algoliasearch                          — Search indexing
eslint, eslint-config-google           — Code quality
```

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/prompt-course-app.git
cd prompt-course-app
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment

Copy the example env file and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Algolia (optional — search will be empty without it)
VITE_ALGOLIA_APP_ID=your-algolia-app-id
VITE_ALGOLIA_SEARCH_KEY=your-search-only-key

# Override backend URL (optional — defaults to Cloud Functions URL)
VITE_API_BASE_URL=
```

### 4. Install Backend Dependencies

```bash
cd prompt-admin-backend/functions
npm install
```

### 5. Configure Backend Environment

```bash
cp .env.example .env
```

Edit `prompt-admin-backend/functions/.env`:

```env
NODE_ENV=development
OPENAI_API_KEY=sk-your-openai-key
ALGOLIA_APP_ID=your-algolia-app-id
ALGOLIA_ADMIN_API_KEY=your-algolia-admin-key
ALGOLIA_SEARCH_API_KEY=your-algolia-search-key
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 6. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Set your project
cd prompt-admin-backend
firebase use your-project-id
```

### 7. Deploy

```bash
# Deploy Cloud Functions (requires Blaze plan)
firebase deploy --only functions

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Build and deploy frontend
cd ..
npm run build
firebase deploy --only hosting
```

### 8. Seed Content

After deploying, seed the course content into Firestore:

```bash
cd prompt-admin-backend/functions
node scripts/algolia-sync.js    # Sync existing Firestore data to Algolia
```

Or use the Admin Dashboard at `/admin/import` to upload `scripts/course-content.json` via the Bulk Import page.

---

## Development Commands

### Frontend (React App)
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Backend (Cloud Functions)
```bash
cd prompt-admin-backend/functions
npm run serve        # Start Firebase emulator locally
npm run deploy       # Deploy functions to Firebase
npm run lint         # Run ESLint on functions
npm run logs         # View Cloud Functions logs
```

---

## Project Structure

```
prompt-course-app/
├── public/                          # Static assets
├── src/
│   ├── api/                         # API client modules
│   │   ├── client.js                # Base HTTP client (auth, retry logic)
│   │   ├── admin.js                 # Admin CRUD endpoints
│   │   ├── auth.js                  # Auth profile endpoint
│   │   ├── catalog.js               # Modules & lessons fetching
│   │   ├── feedback.js              # Feedback/report submission
│   │   ├── practice.js              # Practice responses & LLM feedback
│   │   ├── progress.js              # Progress saving & stats
│   │   ├── roadmap.js               # Roadmap data
│   │   └── search.js                # Search queries
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        # Main authenticated layout shell
│   │   │   ├── Header.jsx           # Top navigation bar
│   │   │   └── Sidebar.jsx          # Side navigation with progress
│   │   ├── ui/
│   │   │   ├── Badge.jsx            # Level/status badges
│   │   │   ├── EmptyState.jsx       # Empty content placeholder
│   │   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   │   ├── Modal.jsx            # Reusable modal component
│   │   │   └── Pagination.jsx       # Cursor-based pagination
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx   # Admin analytics overview
│   │   │   ├── AdminModules.jsx     # Module CRUD management
│   │   │   ├── AdminLessons.jsx     # Lesson CRUD management
│   │   │   ├── AdminQuestions.jsx   # Question CRUD management
│   │   │   └── BulkImportPage.jsx   # JSON bulk content import
│   │   ├── Dashboard.jsx            # Main user dashboard
│   │   ├── Login.jsx                # Login page
│   │   ├── SignUp.jsx               # Sign-up with password validation
│   │   ├── ModulesPage.jsx          # Module browsing with filters
│   │   ├── ModuleDetailPage.jsx     # Single module view
│   │   ├── LessonListPage.jsx       # Lesson browsing with filters
│   │   ├── LessonDetailPage.jsx     # Lesson content + practice questions
│   │   ├── BookmarksPage.jsx        # Saved lessons
│   │   ├── SearchPage.jsx           # Full-text search
│   │   ├── RoadmapPage.jsx          # Visual learning path
│   │   ├── FeedbackModal.jsx        # Bug/feature feedback form
│   │   └── PrivateRoute.jsx         # Auth guard (+ admin check)
│   ├── constants/
│   │   └── levels.js                # Shared level ordering constants
│   ├── context/
│   │   ├── UserContext.jsx          # Auth state & profile management
│   │   ├── ProgressContext.jsx      # Progress & bookmark state
│   │   └── ThemeContext.jsx         # Dark/light mode toggle
│   ├── firebase.js                  # Firebase client initialization
│   ├── firebaseAuth.js              # Auth helper functions
│   ├── App.jsx                      # Root component with routing
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Tailwind base styles
├── prompt-admin-backend/
│   ├── firebase.json                # Firebase deployment config
│   ├── .firebaserc                  # Project binding
│   └── functions/
│       ├── index.js                 # Express app entry point
│       ├── config/
│       │   └── index.js             # Environment configuration
│       ├── constants/
│       │   └── levels.js            # Shared level constants
│       ├── middleware/
│       │   ├── authenticate.js      # Firebase ID token verification
│       │   ├── requireAdmin.js      # Admin role check (cached)
│       │   └── validate.js          # Request body validation
│       ├── routes/
│       │   ├── auth.js              # GET /v1/auth/me
│       │   ├── catalog.js           # Modules & lessons endpoints
│       │   ├── practice.js          # Submit responses + LLM feedback
│       │   ├── progress.js          # Save/fetch progress + streak
│       │   ├── search.js            # Algolia-powered search
│       │   ├── feedback.js          # Report submission
│       │   ├── roadmap.js           # Roadmap data
│       │   └── admin.js             # Admin CRUD + bulk import
│       ├── services/
│       │   └── algolia.js           # Algolia indexing & search service
│       └── scripts/
│           ├── course-content.json  # Full curriculum (5 modules, 18 lessons)
│           └── algolia-sync.js      # One-time Algolia sync script
├── firestore.rules                  # Firestore security rules
├── .env.example                     # Frontend env template
├── package.json                     # Frontend dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
└── CLAUDE.md                        # AI assistant instructions
```

---

## API Endpoints

All endpoints are prefixed with `/v1` and served from Firebase Cloud Functions.

### Public
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |

### Authenticated
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/auth/me` | Get current user profile |
| `GET` | `/v1/modules` | List modules (with pagination, filtering) |
| `GET` | `/v1/modules/:id` | Get single module |
| `GET` | `/v1/lessons` | List lessons (with pagination, filtering) |
| `GET` | `/v1/lessons/:id` | Get lesson with questions |
| `GET` | `/v1/search?q=...` | Search modules and lessons |
| `GET` | `/v1/roadmap` | Get learning roadmap |
| `POST` | `/v1/submit-response` | Submit practice answer |
| `POST` | `/v1/llm-feedback` | Get AI feedback on answer |
| `POST` | `/v1/save-progress` | Save lesson progress |
| `GET` | `/v1/progress` | Get user progress |
| `GET` | `/v1/progress/stats` | Get progress statistics |
| `PATCH` | `/v1/bookmarks` | Toggle lesson bookmark |
| `POST` | `/v1/report` | Submit feedback/bug report |

### Admin Only
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/admin/check` | Verify admin status |
| `POST` | `/v1/admin/modules` | Create module |
| `PUT` | `/v1/admin/modules/:id` | Update module |
| `DELETE` | `/v1/admin/modules/:id` | Delete module |
| `POST` | `/v1/admin/lessons` | Create lesson |
| `PUT` | `/v1/admin/lessons/:id` | Update lesson |
| `DELETE` | `/v1/admin/lessons/:id` | Delete lesson |
| `POST` | `/v1/admin/lessons/:id/questions` | Add question to lesson |
| `PUT` | `/v1/admin/questions/:id` | Update question |
| `DELETE` | `/v1/admin/questions/:id` | Delete question |
| `POST` | `/v1/admin/bulk-import` | Bulk import content |
| `POST` | `/v1/admin/publish-lesson` | Toggle lesson publish status |
| `GET` | `/v1/admin/analytics/engagement` | Get engagement metrics |

---

## License

This project is for educational purposes.
