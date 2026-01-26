# Way Finderz

A language learning flashcard game where users progress along a virtual route from Venice to Rome by typing correct Italian translations.

## Tech Stack

| Layer           | Technology               |
| --------------- | ------------------------ |
| Frontend        | Next.js 15 (SPA mode)    |
| Backend         | Koa v3                   |
| Database        | PostgreSQL + Drizzle ORM |
| Auth            | BetterAuth               |
| Language        | TypeScript               |
| Package Manager | pnpm (monorepo)          |

## Project Structure

```
way-finderz/
├── apps/
│   ├── api/                 # Koa backend (port 3000)
│   │   └── src/
│   │       ├── auth.ts      # BetterAuth configuration
│   │       ├── db/schema/   # Drizzle database schemas
│   │       ├── middleware/  # Koa middleware (auth, rate-limit)
│   │       ├── trpc/        # tRPC router and procedures
│   │       │   └── routers/ # API endpoints (game, invites)
│   │       ├── services/    # Business logic
│   │       └── workers/     # Background workers (email)
│   │
│   └── web/                 # Next.js frontend (port 3001)
│       └── src/
│           ├── app/         # Next.js app router pages
│           ├── entities/    # Domain entities (user, session)
│           ├── features/    # Feature modules (auth, game, invite-codes)
│           ├── widgets/     # Composite UI components
│           ├── views/       # Page-level view components (named views to prevent clashing with next.js `pages`, a reserved folder name)
│           ├── shared/      # Shared utilities, config, UI components
│           └── trpc/        # tRPC client configuration
│
├── packages/
│   └── shared/              # Shared TypeScript types and Zod schemas
│
├── docker-compose.yml       # PostgreSQL database
└── pnpm-workspace.yaml      # Monorepo configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd way-finderz
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the example env file for the API
   cp .env.example apps/api/.env
   ```

   Edit `apps/api/.env` and set a secure `BETTER_AUTH_SECRET` for production.

3. **Start the database:**

   ```bash
   docker compose up -d
   ```

4. **Run database migrations:**

   ```bash
   pnpm db:push
   ```

5. **Seed the admin user:**

   ```bash
   pnpm db:seed
   ```

6. **Start development servers:**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3000` and the frontend at `http://localhost:3001`.

## Default Credentials

After running the seed script:

| Field               | Value                    |
| ------------------- | ------------------------ |
| Admin Email         | `admin@wayfinderz.local` |
| Admin Password      | `admin123`               |
| Initial Invite Code | `WELC2ME3`               |

**Important:** Change these credentials in production!

## Available Scripts

From the project root:

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start all development servers               |
| `pnpm dev:api`     | Start only the API server                   |
| `pnpm dev:web`     | Start only the web frontend                 |
| `pnpm build`       | Build all packages                          |
| `pnpm lint`        | Run ESLint across all packages              |
| `pnpm typecheck`   | Run TypeScript checks                       |
| `pnpm db:generate` | Generate Drizzle migrations                 |
| `pnpm db:migrate`  | Run Drizzle migrations                      |
| `pnpm db:push`     | Push schema to database (dev)               |
| `pnpm db:seed`     | Seed admin user, invite code, and game data |
| `pnpm db:studio`   | Open Drizzle Studio                         |

**API-specific scripts** (run from `apps/api`):

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `pnpm db:seed:admin` | Seed only admin user and invite code                 |
| `pnpm db:seed:game`  | Seed only game data (journeys, cities, translations) |
| `pnpm worker:email`  | Start email worker (dev)                             |
| `pnpm test:run`      | Run API tests                                        |

## Authentication Flow

1. **Signup requires an invite code** - Users must have a valid invite code to register
2. **Admins can create invite codes** - Via the `/admin/invites` page
3. **Invite codes are single use only**

## API Endpoints

The API uses [tRPC](https://trpc.io/) for type-safe API calls. All tRPC endpoints are available at `/api/trpc`.

### Auth (BetterAuth)

- `POST /api/auth/sign-up/email` - Register (email, password, name)
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Game (tRPC)

- `game.listJourneys` - List all available journeys (public)
- `game.start` - Get game data for a journey (public)
- `game.saveProgress` - Save user progress (authenticated)
- `game.getUserProgress` - Get user's progress on all journeys (authenticated)
- `game.getJourneyRecord` - Get best time record for a journey (public)

### Invite Codes (tRPC)

- `invites.validate` - Validate an invite code (public)
- `invites.use` - Mark invite as used (authenticated)
- `invites.create` - Create invite code (admin only)
- `invites.list` - List invite codes (admin only)
- `invites.deactivate` - Deactivate invite code (admin only)

## Environment Variables

### API (`apps/api/.env`)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/way_finderz

# BetterAuth
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Server
API_PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001

# Seed credentials (optional)
ADMIN_EMAIL=admin@wayfinderz.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```

### Web (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Architecture Notes

### Client-Centric Design

The game logic runs entirely in the browser. The backend serves as a thin API layer for:

- Authentication (BetterAuth)
- Loading routes/flashcards on game start
- Persisting user progress

### SPA Mode

Next.js is configured with `output: 'export'` for static site generation. All pages use the `'use client'` directive for client-side rendering.

## Development

### Adding New Database Tables

1. Create schema in `apps/api/src/db/schema/`
2. Export from `apps/api/src/db/schema/index.ts`
3. Run `pnpm db:push` or `pnpm db:generate` + `pnpm db:migrate`

### Adding New API Endpoints

1. Create or extend a router in `apps/api/src/trpc/routers/`
2. Register in `apps/api/src/trpc/router.ts`
3. The tRPC client in the web app will automatically have type-safe access to the new procedures

## License

MIT
