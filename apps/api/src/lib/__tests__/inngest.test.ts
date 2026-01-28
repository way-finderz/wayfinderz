import { describe, expect, it } from "vitest";

import {
  inngest,
  PASSWORD_RESET_EMAIL_EVENT,
  VERIFICATION_EMAIL_EVENT,
} from "../inngest";

describe("Inngest client", () => {
  describe("event constants", () => {
    it("exports VERIFICATION_EMAIL_EVENT", () => {
      expect(VERIFICATION_EMAIL_EVENT).toBe("email/verification");
    });

    it("exports PASSWORD_RESET_EMAIL_EVENT", () => {
      expect(PASSWORD_RESET_EMAIL_EVENT).toBe("email/password-reset");
    });
  });

  describe("client configuration", () => {
    it("has correct app id", () => {
      expect(inngest.id).toBe("way-finderz");
    });

    it("has send method for dispatching events", () => {
      expect(typeof inngest.send).toBe("function");
    });

    it("has createFunction method for creating functions", () => {
      expect(typeof inngest.createFunction).toBe("function");
    });
  });
});
