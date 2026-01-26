import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:3000";

// Mock user for authenticated sessions
export const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  image: null,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAdminUser = {
  ...mockUser,
  id: "admin-user-id",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
};

export const mockSession = {
  id: "test-session-id",
  userId: mockUser.id,
  token: "test-session-token",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// Mock journey data
const mockJourney = {
  id: "journey-1",
  slug: "road-to-rome",
  name: "Road to Rome",
  description: "Travel from Venice to Rome by translating Italian words!",
  language: "italian",
  startCityName: "venice",
  targetCityName: "rome",
  emoji: "🇮🇹",
  winMessage: "You Made It to Rome!",
};

// Mock game data - all data needed for offline play
const mockGameData = {
  journey: mockJourney,
  startCity: { id: "venice-id", name: "Venice" },
  targetCity: { id: "rome-id", name: "Rome" },
  allCities: [
    { id: "venice-id", name: "Venice", displayName: "Venice", position: 0 },
    { id: "padua-id", name: "Padua", displayName: "Padua", position: 1 },
    { id: "ferrara-id", name: "Ferrara", displayName: "Ferrara", position: 1 },
    { id: "bologna-id", name: "Bologna", displayName: "Bologna", position: 2 },
    { id: "rome-id", name: "Rome", displayName: "Rome", position: 5 },
  ],
  allEdges: [
    { id: "edge-1", fromCityId: "venice-id", toCityId: "padua-id" },
    { id: "edge-2", fromCityId: "venice-id", toCityId: "ferrara-id" },
    { id: "edge-3", fromCityId: "padua-id", toCityId: "bologna-id" },
    { id: "edge-4", fromCityId: "ferrara-id", toCityId: "bologna-id" },
    { id: "edge-5", fromCityId: "bologna-id", toCityId: "rome-id" },
  ],
  allTranslations: [
    { id: "trans-1", sourceWord: "ciao", targetWord: "hello" },
    { id: "trans-2", sourceWord: "grazie", targetWord: "thank you" },
    { id: "trans-3", sourceWord: "acqua", targetWord: "water" },
    { id: "trans-4", sourceWord: "pane", targetWord: "bread" },
    { id: "trans-5", sourceWord: "vino", targetWord: "wine" },
    { id: "trans-6", sourceWord: "formaggio", targetWord: "cheese" },
    { id: "trans-7", sourceWord: "amore", targetWord: "love" },
    { id: "trans-8", sourceWord: "casa", targetWord: "house" },
    { id: "trans-9", sourceWord: "sole", targetWord: "sun" },
    { id: "trans-10", sourceWord: "luna", targetWord: "moon" },
  ],
};

// Helper to create tRPC response format
function trpcResult<T>(data: T) {
  return { result: { data } };
}

// Helper to extract input from tRPC POST body
// Handles multiple formats: {"0":{"json":...}}, {"json":...}, or raw input
function extractPostInput(body: unknown, index: number): unknown {
  if (!body || typeof body !== "object") return {};

  const bodyObj = body as Record<string, unknown>;
  const key = String(index);
  const indexed = bodyObj[key];

  // Format: {"0": {"json": {...}}} (indexed with json wrapper)
  if (indexed && typeof indexed === "object" && "json" in indexed) {
    return (indexed as Record<string, unknown>).json;
  }

  // Format: {"0": {...}} (indexed without json wrapper)
  if (indexed !== undefined) {
    return indexed;
  }

  // Format: {"json": {...}} (single item with json wrapper)
  if ("json" in bodyObj) {
    return bodyObj.json;
  }

  // Format: {...} (raw input)
  return body;
}

// tRPC handlers
const trpcHandlers = [
  // Handle all tRPC requests via the batch endpoint
  http.all(`${API_URL}/api/trpc/*`, async ({ request }) => {
    const url = new URL(request.url);
    const procedure = url.pathname.replace("/api/trpc/", "");

    // Parse the procedure path (e.g., "game.start", "invites.validate")
    const procedures = procedure.split(",");

    // Check if this is a batch request by looking for batch=1 query param
    const isBatch = url.searchParams.get("batch") === "1";

    // Get body for mutations
    let body: unknown = null;
    if (request.method === "POST") {
      try {
        body = await request.clone().json();
      } catch {
        // No JSON body - this is expected for some requests
      }
    }

    if (!isBatch && procedures.length === 1) {
      // Single procedure call
      const input = await getInputForProcedure(request.method, url, body);
      const data = await handleSingleProcedureData(procedures[0], input);

      return HttpResponse.json(trpcResult(data));
    } else {
      // Batch call - tRPC batches inputs in the query string for GET or body for POST
      const results = await Promise.all(
        procedures.map(async (p, i) => {
          let input;
          if (request.method === "GET") {
            // For GET batch, input is in query: ?batch=1&input={"0":...,"1":...}
            const inputParam = url.searchParams.get("input");
            if (inputParam) {
              const parsed = JSON.parse(inputParam);
              input = parsed[String(i)]?.json ?? parsed[String(i)] ?? {};
            } else {
              input = {};
            }
          } else {
            // For POST batch, extract input using helper
            input = extractPostInput(body, i);
          }

          return handleSingleProcedureData(p, input);
        })
      );

      return HttpResponse.json(results.map((data) => trpcResult(data)));
    }
  }),
];

 
function getInputForProcedure(method: string, url: URL, body: any): any {
  // GET request: input in query param
  if (method === "GET") {
    const inputParam = url.searchParams.get("input");
    if (inputParam) {
      try {
        const parsed = JSON.parse(inputParam);

        return parsed?.json ?? parsed;
      } catch (error) {
        console.warn("[Test Mock] Failed to parse input param:", inputParam, error);

        return {};
      }
    }

    return {};
  }

  // POST request: input in body
  return body?.json ?? body ?? {};
}

async function handleSingleProcedureData(
  procedure: string,
   
  input: any
 
): Promise<any> {
  switch (procedure) {
    case "game.listJourneys":
      return [mockJourney];

    case "game.start":
      return mockGameData;

    case "invites.validate": {
      const { code } = input as { code: string };
      if (code === "VALIDCODE") {
        return { valid: true, message: "Invite code is valid" };
      }

      return { valid: false, message: "Invalid or expired invite code" };
    }

    case "invites.use":
      return { message: "Invite code marked as used" };

    case "invites.create": {
      const { expiresAt } = input as { expiresAt?: string };

      return {
        id: "new-invite-id",
        code: "NEWCODE1",
        createdById: "admin-user-id",
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdAt: new Date(),
        deletedAt: null,
      };
    }

    case "invites.list":
      return [
        {
          id: "invite-1",
          code: "TESTCODE",
          createdById: "admin-user-id",
          isActive: true,
          expiresAt: null,
          createdAt: new Date().toISOString(),
          deletedAt: null,
        },
      ];

    case "invites.deactivate":
      return { message: "Invite code deactivated" };

    default:
      throw new Error(`Unknown procedure: ${procedure}`);
  }
}

// Default handlers
export const handlers = [
  // Auth session endpoint - defaults to no session (unauthenticated)
  http.get(`${API_URL}/api/auth/get-session`, () => {
    return HttpResponse.json(null);
  }),

  // Sign in
  http.post(`${API_URL}/api/auth/sign-in/email`, async () => {
    return HttpResponse.json({
      user: mockUser,
      session: mockSession,
    });
  }),

  // Sign up
  http.post(`${API_URL}/api/auth/sign-up/email`, async () => {
    return HttpResponse.json({
      user: mockUser,
      session: mockSession,
    });
  }),

  // Sign out
  http.post(`${API_URL}/api/auth/sign-out`, () => {
    return HttpResponse.json({ success: true });
  }),

  // tRPC handlers
  ...trpcHandlers,
];

// Helper to create authenticated session handlers
export function createAuthenticatedHandlers(user = mockUser) {
  return [
    http.get(`${API_URL}/api/auth/get-session`, () => {
      return HttpResponse.json({
        user,
        session: { ...mockSession, userId: user.id },
      });
    }),
  ];
}

// Helper to create admin session handlers
export function createAdminHandlers() {
  return createAuthenticatedHandlers(mockAdminUser);
}

// Export game handlers for backward compatibility
export const gameHandlers = trpcHandlers;
