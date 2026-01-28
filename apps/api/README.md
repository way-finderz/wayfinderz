# Way Finderz - API Server

Koa-based API server providing authentication, game data, and administrative functionality via tRPC endpoints.

## Tech Stack

- **Framework**: Koa 3.x with TypeScript
- **API Layer**: tRPC 11.8 (type-safe RPC)
- **Authentication**: BetterAuth with email/password
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: Resend with React Email templates
- **Background Jobs**: Inngest
- **Testing**: Vitest

## Architecture

```
src/
├── app.ts                 # Koa app initialization & middleware
├── auth.ts                # BetterAuth configuration
├── env.ts                 # Environment validation
├── index.ts               # Server entry point
├── db/
│   ├── index.ts           # Drizzle client with connection pool
│   └── schema/            # Table definitions
├── emails/                # React Email templates
│   ├── verification-email.tsx
│   └── password-reset-email.tsx
├── inngest-functions/     # Inngest background job handlers
│   ├── send-verification-email.tsx
│   └── send-password-reset-email.tsx
├── lib/
│   ├── error-codes.ts     # Standardized error codes
│   ├── inngest.ts         # Inngest client & event types
│   ├── logger.ts          # Pino logger
│   └── resend.ts          # Resend email client
├── middleware/
│   ├── better-auth.ts     # Auth handler
│   ├── rate-limit.ts      # Rate limiting
│   └── request-id.ts      # Request tracing
├── services/              # Business logic layer
│   ├── game.service.ts    # Game operations
│   ├── invite.service.ts  # Invite code management
│   └── email.service.ts   # Email queuing via Inngest
├── trpc/
│   ├── index.ts           # Context & procedures
│   ├── router.ts          # Main router
│   └── routers/           # Domain routers
└── scripts/               # Seed scripts
```

## Request Flow

```
Request
  ↓
Request ID (X-Request-ID)
  ↓
Security Headers
  ↓
Error Handler
  ↓
CORS
  ↓
BetterAuth (/api/auth/*)
  ↓
Body Parser (1MB limit)
  ↓
Health Check (/health)
  ↓
Inngest Handler (/api/inngest)
  ↓
Rate Limiter
  ↓
tRPC Handler (/api/trpc/*)
  ↓
Response
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:push

# Seed the database
pnpm db:seed

# Start development server
pnpm dev
```

The server will be available at http://localhost:3000

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Session signing key (min 32 chars) |
| `BETTER_AUTH_URL` | Auth server URL |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `API_PORT` | `3000` | Server port |
| `FRONTEND_URL` | `http://localhost:3001` | Frontend URL for CORS |
| `ALLOWED_ORIGINS` | - | Comma-separated CORS origins |

### Email & Background Jobs

| Variable | Description |
|----------|-------------|
| `MOCK_EMAILS` | Set to `true` to log emails instead of sending |
| `RESEND_API_KEY` | Resend API key for email delivery |
| `EMAIL_FROM` | Sender email (default: `Way Finderz <noreply@wayfinderz.com>`) |
| `INNGEST_EVENT_KEY` | Inngest event key for sending events |
| `INNGEST_SIGNING_KEY` | Inngest signing key for webhook verification |

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:integration` | Run integration tests |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database with initial data |
| `pnpm inngest:dev` | Start Inngest dev server |
| `pnpm email:dev` | Start React Email preview server |

## Local Development

### Quick Start (Mock Emails)

The simplest way to develop locally is with mock emails enabled:

```bash
# In .env
MOCK_EMAILS=true

# Start the API
pnpm dev
```

With `MOCK_EMAILS=true`, emails are logged to the console instead of being sent. This is perfect for most development work.

### Full Email Testing with Inngest Dev Server

To test the complete email flow locally with Inngest:

1. **Start the API server:**
   ```bash
   pnpm dev
   ```

2. **Start the Inngest dev server** (in a separate terminal):
   ```bash
   pnpm inngest:dev
   ```
   This starts the Inngest dev UI at http://localhost:8288

3. **Set environment variables:**
   ```bash
   # In .env - remove MOCK_EMAILS or set to false
   MOCK_EMAILS=false
   RESEND_API_KEY=re_your_test_key  # Get from resend.com
   EMAIL_FROM=Way Finderz <noreply@your-verified-domain.com>
   ```

4. **Test the flow:**
   - Sign up a new user or trigger password reset
   - Watch the Inngest dev UI to see functions execute
   - Check Resend dashboard for sent emails

### Email Template Preview

Preview and develop React Email templates with hot reload:

```bash
pnpm email:dev
```

This opens a preview server at http://localhost:3002 where you can:
- See all email templates
- Preview with sample data
- Test responsive layouts
- Copy generated HTML

### Testing Workflow

1. **Unit tests** (no external services needed):
   ```bash
   pnpm test
   ```

2. **Manual testing with mock emails:**
   ```bash
   MOCK_EMAILS=true pnpm dev
   # Trigger signup/password reset, check console for logged emails
   ```

3. **End-to-end email testing:**
   ```bash
   # Terminal 1: API server
   pnpm dev

   # Terminal 2: Inngest dev server
   pnpm inngest:dev

   # Now trigger email flows and monitor both terminals + Inngest UI
   ```

## Email System

### How It Works

1. **Trigger**: User action (signup, password reset) calls `email.service.ts`
2. **Queue**: Service sends event to Inngest via `inngest.send()`
3. **Process**: Inngest function receives event, renders React Email template
4. **Deliver**: Resend API sends the email
5. **Monitor**: View execution in Inngest dashboard

### Email Templates

Templates are React components in `src/emails/`:

```tsx
// Example: src/emails/verification-email.tsx
import { Button, Container, Text } from "@react-email/components";

export const VerificationEmail = ({ userName, verifyUrl }) => (
  <Container>
    <Text>Hi {userName},</Text>
    <Button href={verifyUrl}>Verify Email</Button>
  </Container>
);
```

### Adding a New Email

1. Create template in `src/emails/new-email.tsx`
2. Export from `src/emails/index.ts`
3. Add event type in `src/lib/inngest.ts`
4. Create Inngest function in `src/inngest-functions/`
5. Export from `src/inngest-functions/index.ts`
6. Add queue function in `src/services/email.service.ts`

## tRPC Endpoints

### Game Router (`/api/trpc/game.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `listJourneys` | Query | Public | Get all available journeys |
| `start` | Query | Protected | Get game data for a journey |
| `saveProgress` | Mutation | Protected | Save user's completion |
| `getUserProgress` | Query | Protected | Get user's progress |
| `getJourneyRecord` | Query | Public | Get best time for journey |

### Invites Router (`/api/trpc/invites.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `validate` | Mutation | Public | Check if invite code is valid |
| `use` | Mutation | Protected | Consume an invite code |
| `create` | Mutation | Admin | Generate new invite code |
| `list` | Query | Admin | List all invite codes |
| `deactivate` | Mutation | Admin | Disable an invite code |

## Error Codes

The API uses standardized error codes for machine-readable error handling:

```typescript
// Example error response
{
  "code": "BAD_REQUEST",
  "message": "Invite code has expired",
  "cause": { "errorCode": "INVITE_EXPIRED" }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `JOURNEY_NOT_FOUND` | Journey doesn't exist |
| `INVITE_INVALID` | Invalid invite code |
| `INVITE_EXPIRED` | Invite code has expired |
| `INVITE_USED` | Invite code already used |

## Database

### Connection Pool

The database connection is configured with:
- Max connections: 20
- Idle timeout: 30 seconds
- Connect timeout: 10 seconds

### Transactions

Critical operations use database transactions to prevent race conditions:
- Journey progress save/update
- Invite code validation and consumption

## Security

### Rate Limiting

- General API: 100 requests/minute
- Auth endpoints: 10 requests/minute
- Invite validation: 10 requests/minute

**Note**: Rate limiting uses in-memory storage. For multi-instance deployments, use Redis.

### Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (production only)

### Request Tracing

Each request gets a unique ID (`X-Request-ID` header) for debugging and logging.

## Testing

```bash
# Run unit tests
pnpm test

# Run in watch mode
pnpm test

# Run once
pnpm test:run

# Run integration tests (requires DATABASE_URL)
pnpm test:integration

# Run with coverage
pnpm test:coverage
```

### E2E Testing with Inngest

For full end-to-end testing of email flows with Inngest:

1. **Manual E2E testing:**
   ```bash
   # Terminal 1: Start API server
   MOCK_EMAILS=false pnpm dev

   # Terminal 2: Start Inngest dev server
   pnpm inngest:dev

   # Trigger signup/password reset flows and monitor:
   # - Console for API logs
   # - Inngest UI at http://localhost:8288 for function runs
   # - Resend dashboard for email delivery
   ```

2. **Integration tests** spin up the API server automatically and test the Inngest endpoint.
   The integration tests use `MOCK_EMAILS=true` to avoid sending real emails.

### Test Structure

```
src/
├── test/
│   ├── setup.ts                    # Unit test setup (mocks env)
│   ├── setup.integration.ts        # Integration test setup (real server)
│   └── inngest-test-utils.ts       # Inngest dev server management
├── **/__tests__/
│   ├── *.test.ts                   # Unit tests
│   └── *.integration.test.ts       # Integration tests
```

## Production Deployment

### Required Setup

1. **Resend**: Create account, verify domain, get API key
2. **Inngest**: Create account, create app, get event & signing keys
3. **Environment**: Set all required env vars in your deployment platform

### Inngest Configuration

After deploying, configure Inngest to call your API:
- App URL: `https://your-api-domain.com/api/inngest`
- This endpoint handles function registration and event delivery
