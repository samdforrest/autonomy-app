# Autonomy App

Educational platform helping students develop autonomy and self-regulation skills through interactive learning modules. Works with both students and parents via family-based access.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native 0.81 + Expo 54 + React 19 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router (file-based) |
| Database | Firebase Firestore |
| Backend API | Express.js (port 3001) |
| Content CMS | Google Docs API |
| State | React Context + useReducer |

## Project Structure

```
app/                    # Expo Router pages (file-based routing)
  (tabs)/               # Tab navigation screens (home, explore, profile)
  family/[code]/        # Dynamic family routes
  *-module.tsx          # Student learning modules (10 total)
  *-parent-module.tsx   # Parent view of modules
  assessment.tsx        # Multi-select assessment flow
  intro-parent.tsx      # Parent onboarding
  intro-student.tsx     # Student onboarding

components/             # React components
  AuthGuard.tsx         # Authentication wrapper
  IntroGuard.tsx        # Onboarding flow enforcement
  ModuleCompletionTracker.tsx  # Progress tracking UI
  ThemedText.tsx        # Themed text component
  ThemedView.tsx        # Themed view component

contexts/               # React Context providers
  AppModeContext.tsx    # User mode, family state, progress
  CompletionContext.tsx # Module completion refresh triggers
  TutorialContext.tsx   # Tutorial visibility and completion

hooks/                  # Custom React hooks
  useGoogleDocsContent.ts  # Data fetching with loading/error states

services/               # Business logic and API clients
  api.ts                # Google Docs API client
  family-service.ts     # Firestore family operations
  assessment-service.ts # Assessment scoring
  firebase-config.ts    # Firebase initialization

backend/                # Express.js API server
  server.js             # Main server (port 3001)
  services/             # Google Docs parsing
  routes/               # API routes

functions/              # Firebase Cloud Functions
```

## Build & Run Commands

### Frontend (Expo)
```bash
npm install            # Install dependencies
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Start web version
npm run lint           # Run ESLint
```

### Backend API
```bash
cd backend
npm install
npm run dev            # Development with hot reload (nodemon)
npm start              # Production server
npm test               # Test Google Docs integration
```

### Firebase Functions
```bash
cd functions
npm install
npm run serve          # Local emulator
npm run deploy         # Deploy to Firebase
```

## Environment Setup

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
PORT=3001
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_PROJECT_ID=<project-id>
```

## Key Concepts

**Family Codes**: Users authenticate with codes like `BEAR-1234` (animal + 4 digits). No traditional user accounts.

**Learning Modules**: 10 modules (mistakes, regulation, job, collaboration, selfcoach, curiosity, shapeoflearning, neuroplasticity, masterymoments, selfmonitoring), each with 5 days of content.

**User Modes**: Parent mode and Student mode with different UI/content views.

**Content Source**: Google Docs serves as the CMS. Backend parses and formats content for the app.

## Entry Points

| Purpose | File |
|---------|------|
| Root layout | `app/_layout.tsx` |
| Tab navigation | `app/(tabs)/_layout.tsx` |
| Main home screen | `app/(tabs)/index.tsx` |
| Assessment flow | `app/assessment.tsx` |
| Family service | `services/family-service.ts` |
| API client | `services/api.ts` |

## Additional Documentation

When working on specific areas, consult these docs:

| Topic | File |
|-------|------|
| Architectural patterns | `.claude/docs/architectural_patterns.md` |

## Testing

No formal test framework configured. Backend has manual integration tests:
- `backend/test-docs.js` - Google Docs API tests
- Run with `npm test` in backend directory
