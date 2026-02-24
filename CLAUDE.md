# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a prompt engineering course platform with:
- **Frontend**: React + Vite app with Firebase authentication and Firestore
- **Backend**: Firebase Cloud Functions (Express.js API in `prompt-admin-backend/functions/`)
- **Database**: Firestore with collections for `lessons` and lesson `tasks`
- **Authentication**: Firebase Auth with email/password

### Key Components
- `src/App.jsx`: Main router with protected routes
- `src/components/Dashboard.jsx`: Main dashboard with stats and progress
- `src/components/LessonDetailPage.jsx`: Individual lesson viewer with practice questions
- `src/api/catalog.js`: API client for fetching lessons/modules from backend
- `src/context/UserContext.jsx`: Authentication context
- `src/context/ProgressContext.jsx`: Progress and bookmarks context

### Data Structure
- Lessons contain: title, description, content, order, createdAt
- Tasks are subcollections under lessons with: type, question, options, correct_answer, explanation

## Development Commands

### Frontend (React app)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Firebase Functions)
```bash
cd prompt-admin-backend/functions
npm run serve        # Start Firebase emulator
npm run deploy       # Deploy functions to Firebase
npm run lint         # Run ESLint on functions
```

### Database Seeding
Lesson data is managed through the Admin Dashboard (Bulk Import page) or via the backend API.
No local seeding scripts are used — all content management goes through the Cloud Functions API.

## Firebase Configuration

Firebase client config is in `src/firebase.js`, reading all credentials from environment variables (`import.meta.env.VITE_*`). Copy `.env.example` to `.env` and fill in your project values. The backend API endpoint base URL defaults to the deployed Cloud Functions URL and can be overridden via `VITE_API_BASE_URL`.

## Tech Stack
- React 19 with React Router
- Vite for build tooling
- Tailwind CSS for styling
- Firebase (Auth, Firestore, Functions)
- ESLint for code quality