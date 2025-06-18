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
- `src/components/Dashboard.jsx`: Main lesson listing page
- `src/components/LessonPage.jsx`: Individual lesson viewer
- `src/hooks/useLessons.js`: Custom hook for fetching lessons from Firestore
- `src/context/UserContext.jsx`: Authentication context
- `scripts/seedLessons.js`: Database seeding script

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
```bash
node scripts/seedLessons.js    # Seed sample lesson data
```

## Firebase Configuration

Firebase config is in `src/firebase.js` with project ID `prompt-engineering-course`. The backend API endpoint is at `/admin/lessons` for creating new lessons via POST requests.

## Tech Stack
- React 19 with React Router
- Vite for build tooling
- Tailwind CSS for styling
- Firebase (Auth, Firestore, Functions)
- ESLint for code quality