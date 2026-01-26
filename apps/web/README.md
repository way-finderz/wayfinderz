# Way Finderz - Web App

A language learning flashcard game built with Next.js and React.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS
- **State Management**: Zustand (client-side game state)
- **Data Fetching**: tRPC with React Query
- **Animation**: Framer Motion
- **Testing**: Vitest, Playwright, jest-axe
- **Component Development**: Storybook

## Architecture

```
src/
├── app/                    # Next.js App Router pages
├── features/               # Feature modules (auth, game, invite-codes)
│   └── [feature]/
│       ├── api/            # API hooks and functions
│       ├── model/          # State management (stores, types)
│       └── ui/             # Feature-specific components
├── shared/                 # Shared utilities and components
│   ├── config/             # Environment configuration
│   ├── lib/                # Utility functions
│   └── ui/                 # Reusable UI components
├── views/                  # Page-level components
│   └── [view]/
│       └── ui/             # View components and error boundaries
├── widgets/                # Complex composed components
│   └── [widget]/
│       └── ui/             # Widget components
├── trpc/                   # tRPC client setup
└── test/                   # Test setup and mocks
```

### Key Patterns

- **Feature Sliced Design**: Code organized by feature, not by type
- **Error Boundaries**: Component-level and view-level error handling
- **React Query**: Server state management with automatic retry
- **Zustand**: Client-side game state with synchronous updates
- **Accessibility**: ARIA attributes, live regions, jest-axe testing

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at http://localhost:3001

### Environment Variables

Create a `.env.local` file:

```env
API_URL=http://localhost:3000
```

## Scripts

| Script                 | Description                  |
| ---------------------- | ---------------------------- |
| `pnpm dev`             | Start development server     |
| `pnpm build`           | Build for production         |
| `pnpm start`           | Start production server      |
| `pnpm lint`            | Run ESLint                   |
| `pnpm typecheck`       | Run TypeScript type checking |
| `pnpm test`            | Run unit tests in watch mode |
| `pnpm test:run`        | Run unit tests once          |
| `pnpm test:coverage`   | Run tests with coverage      |
| `pnpm test:e2e`        | Run Playwright E2E tests     |
| `pnpm test:e2e:ui`     | Run E2E tests with UI        |
| `pnpm storybook`       | Start Storybook              |
| `pnpm build-storybook` | Build Storybook              |

## Testing

### Unit Tests

```bash
# Run tests
pnpm test:run

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test
```

### Accessibility Tests

Accessibility tests use jest-axe to check for WCAG violations:

```bash
pnpm test:run src/shared/ui/__tests__/accessibility.test.tsx
pnpm test:run src/features/game/__tests__/accessibility.test.tsx
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with Playwright UI
pnpm test:e2e:ui

# Run in headed mode
pnpm test:e2e:headed
```

## Component Development

Start Storybook to develop and preview components:

```bash
pnpm storybook
```

View at http://localhost:6006

### Key Components

- `Skeleton` - Loading placeholder with variants (text, circular, rectangular)
- `ErrorBoundary` - React error boundary with fallback UI
- `LiveRegion` - Accessible screen reader announcements
- `Button`, `Input`, `FormError` - Form components with accessibility

## Error Handling

### Error Boundaries

The app uses multiple levels of error boundaries:

1. **Root ErrorBoundary** (`app/layout.tsx`) - Catches app-wide errors
2. **GameErrorBoundary** (`views/game/ui/`) - Game-specific error handling
3. **DashboardErrorBoundary** (`views/dashboard/ui/`) - Dashboard error handling

### React Query Retry

API calls automatically retry with exponential backoff:

- Queries: 3 retries (1s, 2s, 4s delay)
- Mutations: 1 retry (1s delay)

### Error Screen

`GameErrorScreen` provides context-aware error messages:

- **Network errors**: Connection troubleshooting
- **Not found**: Journey selection guidance
- **Unauthorized**: Session expiration handling
- **Generic**: General retry suggestions

## Accessibility

- All interactive elements have proper ARIA attributes
- Form errors use `aria-live="polite"` for screen readers
- `LiveRegion` component announces game feedback
- Loading states use skeleton placeholders
- Color contrast meets WCAG AA standards

## State Management

### Game Store (Zustand)

```typescript
// Initialize game with pre-fetched data
const { initializeGame, setLoading, setError } = useGameStore();

// Start game flow
setLoading();
const data = await fetchGameData(journeySlug);
initializeGame(data);
```

### React Query Hooks

```typescript
// Fetch journey data with caching
const { data: journey } = useJourney(slug);

// Fetch game data with retry
const { data: gameData, refetch } = useGameData(slug, enabled);

// Fetch user progress
const { data: progress } = useJourneyProgress(journeyId);
```
