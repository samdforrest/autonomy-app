# Architectural Patterns

This document describes the architectural patterns, design decisions, and conventions used across the Autonomy App codebase.

## State Management

### React Context + useReducer Pattern

Complex global state is managed via React Context with useReducer for predictable state updates.

**AppModeContext** (`contexts/AppModeContext.tsx:98-248`)
- Reducer pattern with typed actions (SWITCH_MODE, SET_FAMILY_CONTEXT, etc.)
- Custom hook `useAppMode()` at line 317 exposes state and action creators
- Manages: user mode (parent/student), family context, student progress, parent insights

**CompletionContext** (`contexts/CompletionContext.tsx:1-31`)
- Simpler pub/sub pattern using useState for refresh triggers
- `triggerRefresh()` method forces re-renders across components

**TutorialContext** (`contexts/TutorialContext.tsx:33-141`)
- Manages tutorial visibility and completion state
- Family-specific tracking with AsyncStorage persistence
- Storage key prefix: `@autonomy_tutorial_*`

### Persistence Pattern

- **localStorage** for web with JSON serialization and expiration (7 days) - `AppModeContext.tsx:164-173`
- **AsyncStorage** for mobile/Expo compatibility - `TutorialContext.tsx:44`
- Error handling with try-catch, graceful fallback on corrupted data - `AppModeContext.tsx:301-305`

## Service Layer

### Singleton Service Classes

All services are exported as singleton instances for consistent state and API access.

| Service | File | Purpose |
|---------|------|---------|
| `apiService` | `services/api.ts:430` | Google Docs API integration |
| `familyService` | `services/family-service.ts:497` | Firestore family CRUD operations |
| `assessmentService` | `services/assessment-service.ts` | Assessment scoring and storage |
| `surveyService` | `services/survey-service.ts` | Survey collection and storage |

**ApiService** (`services/api.ts:65-427`)
- Environment-aware URL configuration (dev/prod) at lines 72-103
- Auto-detection for mobile simulator backend at lines 362-411
- Methods: `fetchDocument()`, `fetchTabDay()`, `fetchMultipleDocuments()`, `testConnection()`

**FamilyService** (`services/family-service.ts:40-497`)
- Firestore operations with typed interfaces
- Family code generation: `ANIMAL-####` format at line 45-55
- Error handling with Firebase error codes at lines 118-126

## Data Fetching

### Custom Hooks Pattern

Custom hooks wrap services to provide React-friendly loading/error states.

**useGoogleDocsContent** (`hooks/useGoogleDocsContent.ts:15-63`)
- Wraps `apiService.fetchDocument()` with loading/error/refetch states
- Supports conditional auto-fetch via `autoFetch` option at line 20
- Variants: `useMultipleGoogleDocsContent()`, `useDocumentTabs()`, `useTabDays()`

## Component Patterns

### Guard Components

Wrapper components for conditional rendering based on auth/onboarding state.

**AuthGuard** (`components/AuthGuard.tsx:11-54`)
- Checks `isInFamilyMode` from AppModeContext at line 12
- Loading state with 100ms delay for context initialization at lines 18-21
- Renders JoinFamily screen if not authenticated at line 48

**IntroGuard** (`components/IntroGuard.tsx:10-59`)
- Enforces intro flow (tutorial -> parent intro -> student intro)
- Uses `familyService.getRequiredScreen()` at line 22
- Router navigation based on completion state at lines 34-51

### Themed Components

Base components with theme support for consistent styling.

**ThemedText** (`components/ThemedText.tsx`)
- Wrapper around RN Text with type variants: 'default', 'title', 'subtitle', 'link'
- Uses `useThemeColor` hook for theming

**ThemedView** (`components/ThemedView.tsx`)
- Theme wrapper for View component with props composition

## Authentication

### Family Code-Based Access

Authentication uses family codes (no traditional user accounts).

**Family Context Model** (`contexts/AppModeContext.tsx:7-13`):
```typescript
familyCode: string | null;
familyData: FamilyData | null;
currentStudentId: string | null;
isActive: boolean;
isAdmin: boolean;
```

**Flow**:
1. User enters family code in join-family screen
2. Validates format: 4-letter animal + hyphen + 4 digits (`family-service.ts:60-62`)
3. Fetches family data from Firestore
4. Increments login count for tutorial auto-trigger (`family-service.ts:402`)

## Routing

### Expo Router File-Based Navigation

Routes are defined by file structure in the `app/` directory.

**Dynamic Routes**:
- `/family/[code]` - Family home page
- `/family/[code]/student/[studentId]/assessment` - Student-specific assessment

**Navigation Methods**:
- `router.replace()` for intro flow (prevents back navigation) - `IntroGuard.tsx:41`
- `router.push()` for normal navigation

## Error Handling

### Console Logging with Emoji Prefixes

Consistent emoji prefixes for log categorization:

| Emoji | Usage | Example |
|-------|-------|---------|
| `✅` | Success | `console.log('✅ Family data loaded')` |
| `❌` | Error | `console.error('❌ Failed to fetch')` |
| `🔍` | Debug/Search | `console.log('🔍 Fetching family data')` |
| `📊` | Data/Stats | `console.log('📊 Module progress')` |
| `🔄` | Refresh/Update | `console.log('🔄 Completion refresh')` |
| `📚` | Tutorial | `console.log('📚 Tutorial status')` |

### Firebase Error Handling

Specific error code handling (`family-service.ts:117-126`):
```typescript
if (error.code === 'unavailable') {
  throw new Error('Unable to connect to the database...');
} else if (error.code === 'permission-denied') {
  throw new Error('Permission denied...');
}
```

### React Native Alert Pattern

User-facing errors use Alert dialogs (see `app/assessment.tsx`).

## Styling

### StyleSheet Convention

- Each component defines `const styles = StyleSheet.create({})` at bottom
- No CSS-in-JS libraries; pure React Native StyleSheet
- Consistent spacing: 8, 12, 16, 20, 40px
- Border radius: 4, 8, 12, 20, 25px

### Common Colors

| Purpose | Color |
|---------|-------|
| Primary/Success | `#27AE60` |
| Text | `#2C3E50` |
| Accent Blue | `#3498DB` |
| Error/Red | `#E74C3C` |
| Background | `#F8F9FA` |

## Module Structure

Each learning module follows a consistent pattern:

**Files**: `app/{module-name}-module.tsx` (student) and `app/{module-name}-parent-module.tsx` (parent)

**State**:
- `expandedDay` - Currently expanded day card
- `currentDay` - Current day number
- `revealedAnswers` - Tracking answer reveals

**Integration**:
- `useGoogleDocsContent` hook for fetching tab-specific content
- `ModuleCompletionTracker` component for progress tracking
