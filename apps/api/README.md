# Way Finderz - API Server

Koa-based API server providing authentication, game data, and administrative functionality via tRPC endpoints.

## Tech Stack

- **Framework**: Koa 3.x with TypeScript
- **API Layer**: tRPC 11.8 (type-safe RPC)
- **Authentication**: BetterAuth with email/password
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: AWS SES with SQS for async processing
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
├── lib/
│   └── error-codes.ts     # Standardized error codes
├── middleware/
│   ├── better-auth.ts     # Auth handler
│   ├── rate-limit.ts      # Rate limiting
│   └── request-id.ts      # Request tracing
├── services/              # Business logic layer
│   ├── game.service.ts    # Game operations
│   ├── invite.service.ts  # Invite code management
│   ├── email.service.ts   # Email queuing
│   ├── ses.service.ts     # AWS SES client
│   └── sqs.service.ts     # AWS SQS client
├── trpc/
│   ├── index.ts           # Context & procedures
│   ├── router.ts          # Main router
│   └── routers/           # Domain routers
├── workers/
│   └── email-worker.ts    # SQS email processor
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
Rate Limiter
  ↓
tRPC Handler (/api/trpc/*)
  ↓
Response
```

## Getting Started

### Prerequisites

- Node.js 20+
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

### Email (Production)

| Variable | Description |
|----------|-------------|
| `MOCK_EMAILS` | Set to `true` to log emails instead of sending |
| `AWS_REGION` | AWS region (default: `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `AWS_ENDPOINT_URL` | LocalStack endpoint for development |
| `SES_FROM_EMAIL` | Sender email address |
| `SQS_EMAIL_QUEUE_URL` | SQS queue URL for email jobs |

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:integration` | Run integration tests |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database with initial data |
| `pnpm worker:email` | Start email worker (development) |

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

### Query Logging

In development mode, queries are logged to console for debugging.

### Transactions

Critical operations use database transactions to prevent race conditions:
- Journey progress save/update
- Invite code validation and consumption

## Email Worker

The email worker processes queued emails asynchronously via SQS.

### Features

- Long-polling SQS consumer
- Exponential backoff on failures (1s to 60s)
- Health endpoint at `/health` (port 3002)
- Graceful shutdown handling

### Health Endpoint

```bash
curl http://localhost:3002/health
```

Response:
```json
{
  "status": "healthy",
  "lastProcessedAt": "2024-01-25T10:00:00.000Z",
  "messagesProcessed": 42,
  "messagesFailed": 0,
  "consecutiveFailures": 0,
  "uptime": 3600000
}
```

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

# Run integration tests
pnpm test:integration

# Run with coverage
pnpm test -- --coverage
```

## Development

### Local Email Testing

Set `MOCK_EMAILS=true` in your `.env` to log emails to console instead of sending via SES.

### Using LocalStack

For local AWS service emulation:

```bash
# Start LocalStack
docker-compose up -d localstack

# Set endpoint in .env
AWS_ENDPOINT_URL=http://localhost:4566
```
