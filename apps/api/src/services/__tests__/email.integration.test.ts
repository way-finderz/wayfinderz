import request from "supertest";
import { describe, expect, it } from "vitest";

import { getTestServer } from "@/test/setup.integration";

describe("Email integration with Inngest endpoint", () => {
  describe("GET /api/inngest", () => {
    it("returns 200 status", async () => {
      const server = getTestServer();
      const response = await request(server).get("/api/inngest");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("returns valid JSON response", async () => {
      const server = getTestServer();
      const response = await request(server).get("/api/inngest");

      expect(response.status).toBe(200);

      // Inngest introspection includes metadata about registered functions
      const body = response.body;

      // The response should be a valid JSON object with content
      expect(body).toBeDefined();
      expect(typeof body).toBe("object");
      expect(Object.keys(body).length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/inngest (function execution)", () => {
    it("responds to PUT requests (not 404)", async () => {
      const server = getTestServer();
      const response = await request(server)
        .put("/api/inngest")
        .set("Content-Type", "application/json")
        .send({});

      // Should respond (not 404), even if it returns an error for missing fields
      expect(response.status).not.toBe(404);
    });
  });

  describe("CORS", () => {
    it("includes CORS headers for allowed origins", async () => {
      const server = getTestServer();
      const response = await request(server)
        .get("/api/inngest")
        .set("Origin", "http://localhost:3001");

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("handles OPTIONS preflight requests", async () => {
      const server = getTestServer();
      const response = await request(server)
        .options("/api/inngest")
        .set("Origin", "http://localhost:3001")
        .set("Access-Control-Request-Method", "PUT");

      // Should return 2xx or 204 for preflight
      expect(response.status).toBeLessThan(300);
    });
  });
});
