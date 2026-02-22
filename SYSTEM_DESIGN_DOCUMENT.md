# Prompt Course App — System Design Document

_Last updated: 2025-11-17_

Prompt Course App is a Firebase-backed learning platform where authenticated users consume curated lessons and practice tasks. This document mirrors the provided component-template format so first‑time contributors can see every moving piece at a glance.

---

## Frontend Components (`src/`)

### 1. App (Routing Shell)
| | |
|---|---|
| **Class Name** | App (Routing Shell) (`src/App.jsx`) |
| **Parent Class** | React functional component |
| **Responsibilities** | • Instantiate `BrowserRouter` and declare `/login`, `/signup`, `/dashboard`, `/lesson/:lessonId`, `/` → `/login`.<br>• Wrap protected routes with `PrivateRoute` to enforce auth guards.<br>• Mounts the entire tree beneath `UserProvider` supplied in `main.jsx`. |
| **Collaborators** | • `react-router-dom` (`Routes`, `Route`, `Navigate`).<br>• `PrivateRoute`, `Login`, `SignUp`, `Dashboard`, `LessonPage` components.<br>• `src/context/UserContext.jsx` (host render). |

### 2. UserProvider
| | |
|---|---|
| **Class Name** | UserProvider (`src/context/UserContext.jsx`) |
| **Parent Class** | React functional component (Context provider) |
| **Responsibilities** | • Subscribe to Firebase Auth via `onAuthStateChanged`.<br>• Store `{ user }` in context and block UI rendering until auth initializes.<br>• Offer `useUser` hook so children can access the signed-in user. |
| **Collaborators** | • Firebase Auth singleton from `src/firebase.js`. <br>• React Context consumers (Dashboard, LessonPage, future profile views). |

### 3. PrivateRoute
| | |
|---|---|
| **Class Name** | PrivateRoute (`src/components/PrivateRoute.jsx`) |
| **Parent Class** | React functional component |
| **Responsibilities** | • Guard wrapped children by checking `auth.currentUser`.<br>• Redirect unauthenticated visitors to `/login` with `<Navigate />`. |
| **Collaborators** | • Firebase Auth instance (`src/firebase.js`).<br>• `react-router-dom/Navigate`.<br>• Host routes defined in `App.jsx`. |

### 4. Login Page
| | |
|---|---|
| **Class Name** | Login (`src/components/Login.jsx`) |
| **Parent Class** | React functional component |
| **Responsibilities** | • Manage controlled state for `email`, `password`, error, and loading flags.<br>• Invoke `logIn` helper and route to `/dashboard` on success.<br>• Present marketing copy plus Tailwind-styled form and error banners. |
| **Collaborators** | • `src/firebaseAuth.js` (`logIn`).<br>• `react-router-dom`’s `useNavigate` and `Link`.<br>• Tailwind utility classes from `src/index.css`. |

### 5. SignUp Page
| | |
|---|---|
| **Class Name** | SignUp (`src/components/SignUp.jsx`) |
| **Parent Class** | React functional component |
| **Responsibilities** | • Mirror Login form handling for account creation.<br>• Call `signUp`, then redirect to `/dashboard` upon success.<br>• Communicate errors and submission state to the user. |
| **Collaborators** | • `src/firebaseAuth.js` (`signUp`).<br>• `react-router-dom` (`useNavigate`, `Link`).<br>• Shared Tailwind component classes. |

### 6. Dashboard
| | |
|---|---|
| **Class Name** | Dashboard (`src/components/Dashboard.jsx`) |
| **Parent Class** | React functional component |
| **Responsibilities** | • Fetch lesson catalog through `useLessons` and display derived stats (progress, recommendations).<br>• Render logout, greeting, and lesson cards linking to `/lesson/:lessonId`.<br>• Call `logOut` and navigate to `/login` on sign-out. |
| **Collaborators** | • Firebase Auth for greeting + logout.<br>• `useLessons` (Firestore fetch).<br>• `react-router-dom/Link`. |

### 7. Lesson Page
| | |
|---|---|
| **Class Name** | LessonPage (`src/components/LessonPage.jsx`) |
| **Parent Class** | React functional component |
| **Responsibilities** | • Read `lessonId` via `useParams`, load lesson doc + `tasks` subcollection from Firestore.<br>• Render lesson content and MCQ practice interface with optimistic feedback.<br>• Persist attempt metadata to `users/{uid}/taskHistory` and surface sync errors. |
| **Collaborators** | • Firebase Auth (current user).<br>• Firestore helpers (`doc`, `getDoc`, `collection`, `getDocs`, `setDoc`, `updateDoc`).<br>• `react-router-dom` (`Link`, `useParams`). |

### 8. useLessons Hook
| | |
|---|---|
| **Class Name** | useLessons (`src/hooks/useLessons.js`) |
| **Parent Class** | React custom hook |
| **Responsibilities** | • Issue a Firestore query against `lessons` collection (ordered by `number`).<br>• Map snapshot docs to JS objects and expose `{ lessons, loading }`.<br>• Log failures for developer visibility. |
| **Collaborators** | • Firestore client (`collection`, `query`, `orderBy`, `getDocs`).<br>• Components such as `Dashboard` and potential lesson menus. |

### 9. Firebase Auth Helpers
| | |
|---|---|
| **Class Name** | Firebase Auth Helpers (`src/firebaseAuth.js`) |
| **Parent Class** | Node-style module exporting functions |
| **Responsibilities** | • Provide `signUp`, `logIn`, `logOut` wrappers over Firebase Auth SDK.<br>• Normalize error handling for UI components.<br>• Encourage single import site for auth logic. |
| **Collaborators** | • Firebase Auth (`src/firebase.js`).<br>• Login/SignUp/Dashboard components. |

### 10. Firebase Client Config
| | |
|---|---|
| **Class Name** | Firebase Config (`src/firebase.js`) |
| **Parent Class** | ES module |
| **Responsibilities** | • Initialize Firebase App with project credentials.<br>• Export configured Auth (`getAuth`) and Firestore (`getFirestore`) singletons.<br>• Act as root dependency for every data/auth interaction. |
| **Collaborators** | • All frontend modules needing `auth` or `db` (UserProvider, PrivateRoute, useLessons, LessonPage). |

---

## Backend & Tooling Components (`prompt-admin-backend/`, `scripts/`)

### 11. Cloud Function API
| | |
|---|---|
| **Class Name** | Firebase HTTPS Function (`prompt-admin-backend/functions/index.js`) |
| **Parent Class** | Node.js module exporting `functions.https.onRequest` |
| **Responsibilities** | • Initialize Firebase Admin SDK (`admin.initializeApp`) and Firestore admin client.<br>• Spin up Express app with JSON body parsing and permissive CORS.<br>• Route `POST /admin/lessons` to create lesson docs and `GET /lessons` to list them.<br>• Log/return 404 for unexpected paths. |
| **Collaborators** | • `firebase-functions` deployment runtime.<br>• Firebase Admin Firestore (`admin.firestore()`).<br>• Consumers such as admin dashboards or CLI clients. |

### 12. Admin Lesson Routes
| | |
|---|---|
| **Class Name** | Lesson Route Handlers (`prompt-admin-backend/functions/index.js`) |
| **Parent Class** | Express route handlers |
| **Responsibilities** | • Validate presence of `title` and `content` inputs on create.<br>• Persist lesson metadata plus timestamps to `lessons` collection.<br>• Query Firestore ordered by `createdAt` for listing responses.<br>• Return structured JSON (IDs + payload) to callers. |
| **Collaborators** | • Express instance from Cloud Function.<br>• Firestore admin client.<br>• Future authentication middleware (not yet implemented). |

### 13. Firebase Function Deployment Config
| | |
|---|---|
| **Class Name** | Functions Config (`prompt-admin-backend/firebase.json`, `prompt-admin-backend/functions/package.json`) |
| **Parent Class** | Configuration files |
| **Responsibilities** | • Specify codebase, ignore rules, and predeploy lint hook.<br>• Pin Node engine (v22) and declare dependencies (`express`, `cors`, `firebase-admin`, `firebase-functions`).<br>• Provide npm scripts for linting, emulator, logs, deploy. |
| **Collaborators** | • Firebase CLI workflows.<br>• Local developers running `npm run serve`/`deploy`. |

### 14. Seed Lessons Script
| | |
|---|---|
| **Class Name** | SeedLessons (`scripts/seedLessons.js`) |
| **Parent Class** | Node script (ES module) |
| **Responsibilities** | • Initialize Firebase client SDK with same config as frontend.<br>• Loop through curated lesson objects (including nested `tasks`).<br>• Write lessons to Firestore under deterministic IDs and create subcollection docs for exercises. |
| **Collaborators** | • Firestore client (`doc`, `setDoc`, `collection`).<br>• Developers bootstrapping environments or refreshing data sets. |

### 15. Firestore Data Model
| | |
|---|---|
| **Class Name** | Firestore Schema (conceptual) |
| **Parent Class** | Cloud Firestore collections/subcollections |
| **Responsibilities** | • Maintain `lessons` collection with metadata (`title`, `description`, `content`, `order`, `topic`, `duration`, `level`, `tags`, `createdAt`).<br>• Store practice tasks either embedded within lesson docs (seed data) or as `tasks` subcollections consumed by the app.<br>• Track per-user attempt state via `users/{uid}/taskHistory.{taskId}` (fields: `attempts`, `correct`). |
| **Collaborators** | • `useLessons`, `LessonPage` (reads).<br>• `LessonPage` (writes attempts).<br>• Cloud Function / seeding utilities (writes lessons/tasks). |

### 16. Environment & Build Config
| | |
|---|---|
| **Class Name** | Tooling Config (`vite.config.js`, `tailwind.config.js`, `eslint.config.js`, Firebase config constants) |
| **Parent Class** | Configuration files |
| **Responsibilities** | • Define Vite plugins and build pipeline.<br>• Configure Tailwind content scanning and shared utility classes.<br>• Enforce lint rules (React Hooks plugin, refresh safety).<br>• Supply Firebase credentials (currently inline; should migrate to `.env`). |
| **Collaborators** | • Frontend build process (`npm run dev/build`).<br>• Components relying on Tailwind classes or lint feedback.<br>• Firebase initialization modules. |

---

## System Architecture Design

1. **Auth & Routing Flow**  
   The app boots through `main.jsx`, mounts `UserProvider`, and renders `App`. Guests land on `/login` or `/signup`. Successful auth sets `auth.currentUser`, allowing `PrivateRoute` to reveal `/dashboard` and `/lesson/:lessonId`.

2. **Lesson Retrieval**  
   `Dashboard` executes `useLessons`, which queries Firestore and feeds UI modules (progress indicators, card list). Lessons are ordered by `number` (align with `order` field in data set).

3. **Lesson Detail & Practice**  
   `LessonPage` fetches the targeted lesson plus tasks, displays the content, and records MCQ attempts back to Firestore. The UI shows optimistic feedback plus syncing/error states.

4. **Admin Content Lifecycle**  
   - During development or initial deployment, run `node scripts/seedLessons.js` to load canonical content.  
   - Operational teams can POST to the Cloud Function `/admin/lessons` endpoint to add modules and use `/lessons` for audits or dashboards.

5. **Future Hardening**  
   Implement Firestore security rules, restrict admin endpoints, reconcile `order` vs `number` fields, and consider App Check / environment-driven configs for production readiness.

This template-aligned reference should make it easy to trace how each file contributes to the final learner experience while preserving the requested document style.

