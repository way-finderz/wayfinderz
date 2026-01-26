# Multiplayer Feature Implementation Plan

## Overview
Add real-time multiplayer racing functionality to the language learning game using WebSockets. Players can see who's online, challenge opponents, and race to reach Rome first.

## Architecture Summary

**Key Principle:** Single-player remains completely unchanged. Multiplayer uses separate routes, stores, and services.

- **WebSocket Library:** Socket.IO (built-in rooms, reconnection, acknowledgments)
- **Server-side game state:** Server is source of truth for multiplayer (prevents cheating)
- **Separate stores:** New Zustand store for multiplayer, existing game store untouched

---

## Database Schema Changes

**New tables in `/apps/api/src/db/schema/multiplayer.ts`:**

| Table | Purpose |
|-------|---------|
| `online_users` | Track connected users for lobby display |
| `challenges` | Pending game challenges (60s expiry) |
| `multiplayer_games` | Active/completed game sessions |
| `player_stats` | Win/loss records per opponent pair |
| `player_overall_stats` | Total multiplayer wins/losses/games per user |
| `game_moves_history` | Move audit trail (optional) |

---

## Backend Implementation

### 1. Socket.IO Server Setup
**Files to create:**
- `/apps/api/src/websocket/server.ts` - Socket.IO server attached to HTTP server
- `/apps/api/src/websocket/auth.ts` - Authenticate via BetterAuth session cookie (middleware)
- `/apps/api/src/websocket/namespaces/lobby.ts` - Lobby namespace for online users
- `/apps/api/src/websocket/namespaces/game.ts` - Game namespace with room per game

**Modify:** `/apps/api/src/index.ts` - Initialize Socket.IO server on startup

**Dependencies:** `socket.io` (backend), `socket.io-client` (frontend)

### 2. New Services
| Service | File | Responsibility |
|---------|------|----------------|
| PresenceService | `/apps/api/src/services/presence.service.ts` | Online/offline tracking, heartbeats |
| ChallengeService | `/apps/api/src/services/challenge.service.ts` | Create/accept/decline challenges |
| MultiplayerGameService | `/apps/api/src/services/multiplayer-game.service.ts` | Game logic, answer validation, win detection |
| PlayerStatsService | `/apps/api/src/services/player-stats.service.ts` | Record results, query stats |

### 3. WebSocket Event Handlers
**Directory:** `/apps/api/src/websocket/handlers/`

**Client → Server Events:**
- `HEARTBEAT` - Keep connection alive
- `CHALLENGE_PLAYER` - Initiate challenge
- `ACCEPT_CHALLENGE` / `DECLINE_CHALLENGE` / `CANCEL_CHALLENGE`
- `SUBMIT_ANSWER` - Submit translation during game
- `LEAVE_GAME` - Forfeit/exit

**Server → Client Events:**
- `CONNECTED` - Connection confirmed with online users list
- `USER_ONLINE` / `USER_OFFLINE` - Presence updates
- `CHALLENGE_RECEIVED` / `CHALLENGE_ACCEPTED` / `CHALLENGE_DECLINED`
- `GAME_STATE` - Full game state on game start
- `OPPONENT_MOVED` - Real-time opponent progress
- `ANSWER_RESULT` - Correct/incorrect feedback
- `GAME_OVER` - Winner declared with stats

---

## Frontend Implementation

### 1. Socket.IO Client & Store
**Files to create:**
- `/apps/web/src/features/multiplayer/api/socket-client.ts` - Socket.IO connection management
- `/apps/web/src/features/multiplayer/model/multiplayer-store.ts` - Zustand store for multiplayer state

### 2. Lobby Components (Dashboard)
**Modify:** `/apps/web/src/views/dashboard/ui/DashboardPage.tsx`
- Add fixed sidebar on right side for online players

**New widgets:**
- `/apps/web/src/widgets/online-players/` - List of online users with status (Available/In Game) and "Challenge" buttons (disabled for users in game)
- `/apps/web/src/widgets/challenge-modal/` - Journey selection, incoming challenge notifications with accept/decline

### 3. Multiplayer Game View
**New route:** `/multiplayer/[gameId]`

**New files:**
- `/apps/web/src/views/multiplayer-game/ui/MultiplayerGamePage.tsx` - Main game page
- `/apps/web/src/widgets/multiplayer-game-graph/` - Graph showing both players
- `/apps/web/src/widgets/opponent-progress/` - Opponent position indicator
- `/apps/web/src/widgets/multiplayer-win-screen/` - Results with head-to-head stats

**Reuse:** `TranslationInput` component (or adapted version)

### 4. Stats & Rematch Display
- Add stats section to multiplayer win screen:
  - Head-to-head record vs current opponent
  - Overall multiplayer win/loss record
- "Rematch" button - starts new game if both players accept
- "Return to Lobby" button - go back to dashboard

---

## Shared Types

**File:** `/packages/shared/src/schemas/multiplayer.ts`
- WebSocket event type definitions
- Zod schemas for validation
- Shared interfaces (OnlineUser, Challenge, MultiplayerGameState)

---

## Key Design Decisions

### Server as Source of Truth
Unlike single-player, multiplayer validates answers server-side:
- Translations assigned server-side (each player gets different words)
- Prevents seeing opponent's translations
- Race condition handling via database transactions with row locking

### Translation Assignment
- **Separate pools:** Each player gets their own shuffled copy of all 50 translations
- No need to add more translations - current 50 per journey is sufficient
- Players progress independently through their own word lists
- No overlap or shared word concerns

### Socket.IO Rooms
- Each active game gets its own room (`game:{gameId}`)
- Lobby namespace for online user presence
- Easy to broadcast events to both players: `io.to(roomId).emit(...)`

### Challenge Rules
- **Only available users can be challenged** - Users currently in a game are shown as "In Game" and cannot be challenged
- Challenge expires after 60 seconds if not accepted/declined

### Challenge Flow
1. Player A challenges Player B (selects journey)
2. Player B has 60 seconds to accept/decline
3. On accept: game created, both redirected to `/multiplayer/[gameId]`
4. Game starts with both at starting city

### Disconnection Handling
- **30-second grace period** for reconnection (using Socket.IO's built-in reconnection)
- If no reconnect within grace period, opponent wins by forfeit
- Socket.IO handles heartbeat/ping automatically

### Stats Tracking
- **Per-opponent stats:** Wins/losses/games played against each specific opponent
- **Overall stats:** Total multiplayer wins, losses, games played, win rate

### Rematch Feature
- After game ends, both players see "Rematch" button
- If both accept, new game starts immediately with same journey
- If one declines or leaves, both return to lobby

---

## Implementation Phases

### Phase 1: Socket.IO Infrastructure
1. Add `socket.io` dependency to API, `socket.io-client` to web
2. Create Socket.IO server with BetterAuth middleware
3. Add multiplayer database schema and run migrations
4. Implement PresenceService
5. Test basic connection/disconnection with rooms

### Phase 2: Lobby System
1. Implement ConnectionManager for user tracking
2. Build OnlinePlayersList widget
3. Create multiplayer Zustand store
4. Modify dashboard layout to include sidebar
5. Handle user online/offline events

### Phase 3: Challenge System
1. Implement ChallengeService
2. Create challenge event handlers
3. Build ChallengeModal component
4. Handle challenge lifecycle (send/accept/decline/expire)

### Phase 4: Multiplayer Game
1. Implement MultiplayerGameService with server-side game logic
2. Create game event handlers (submit answer, opponent moved)
3. Build MultiplayerGamePage and components
4. Implement win/loss detection
5. Handle disconnection/forfeit

### Phase 5: Stats & Polish
1. Implement PlayerStatsService
2. Add stats to win screen
3. Add rematch functionality
4. Edge case handling and testing

---

## Files to Modify (Existing)

| File | Change |
|------|--------|
| `/apps/api/src/index.ts` | Initialize Socket.IO server |
| `/apps/api/src/db/schema/index.ts` | Export multiplayer schema |
| `/apps/api/package.json` | Add `socket.io` dependency |
| `/apps/web/package.json` | Add `socket.io-client` dependency |
| `/apps/web/src/views/dashboard/ui/DashboardPage.tsx` | Add online players sidebar |
| `/apps/web/src/app/layout.tsx` | Add Socket.IO connection provider |
| `/packages/shared/src/index.ts` | Export multiplayer types |

---

## Verification Plan

1. **Unit tests:** Services (presence, challenge, game logic)
2. **Integration tests:** WebSocket connection, event handling
3. **Manual testing:**
   - Open two browser windows with different users
   - Verify lobby shows both users online
   - Test full challenge → game → win flow
   - Test disconnection handling
   - Verify single-player still works unchanged
