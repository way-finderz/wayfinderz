import { describe, expect, it } from "vitest";

import { formatTime } from "../format";

describe("formatTime", () => {
  describe("basic formatting", () => {
    it("formats 0 milliseconds as 0:00", () => {
      expect(formatTime(0)).toBe("0:00");
    });

    it("formats 1 second as 0:01", () => {
      expect(formatTime(1000)).toBe("0:01");
    });

    it("formats 59 seconds as 0:59", () => {
      expect(formatTime(59000)).toBe("0:59");
    });

    it("formats 60 seconds as 1:00", () => {
      expect(formatTime(60000)).toBe("1:00");
    });

    it("formats 61 seconds as 1:01", () => {
      expect(formatTime(61000)).toBe("1:01");
    });

    it("formats 90 seconds as 1:30", () => {
      expect(formatTime(90000)).toBe("1:30");
    });
  });

  describe("longer times", () => {
    it("formats 5 minutes as 5:00", () => {
      expect(formatTime(5 * 60 * 1000)).toBe("5:00");
    });

    it("formats 10 minutes 30 seconds as 10:30", () => {
      expect(formatTime(10 * 60 * 1000 + 30 * 1000)).toBe("10:30");
    });

    it("formats 59 minutes 59 seconds as 59:59", () => {
      expect(formatTime(59 * 60 * 1000 + 59 * 1000)).toBe("59:59");
    });

    it("formats 60 minutes as 60:00", () => {
      expect(formatTime(60 * 60 * 1000)).toBe("60:00");
    });

    it("formats 120 minutes as 120:00", () => {
      expect(formatTime(120 * 60 * 1000)).toBe("120:00");
    });
  });

  describe("padding behavior", () => {
    it("pads single digit seconds with zero", () => {
      expect(formatTime(5000)).toBe("0:05");
      expect(formatTime(9000)).toBe("0:09");
    });

    it("does not pad minutes", () => {
      expect(formatTime(60000)).toBe("1:00");
      expect(formatTime(540000)).toBe("9:00");
    });

    it("pads seconds consistently across all minute values", () => {
      expect(formatTime(61000)).toBe("1:01");
      expect(formatTime(121000)).toBe("2:01");
      expect(formatTime(601000)).toBe("10:01");
    });
  });

  describe("edge cases", () => {
    it("rounds down fractional milliseconds", () => {
      expect(formatTime(1500)).toBe("0:01");
      expect(formatTime(1999)).toBe("0:01");
    });

    it("handles very small values", () => {
      expect(formatTime(1)).toBe("0:00");
      expect(formatTime(999)).toBe("0:00");
    });

    it("produces negative output for negative values (edge case)", () => {
      // Negative times don't make sense for game times, but we document current behavior
      // Math.floor(-1) = -1, and -1 % 60 = -1
      expect(formatTime(-1000)).toBe("-1:-1");
    });

    it("handles very large values", () => {
      // 1000 minutes = 1000:00
      expect(formatTime(1000 * 60 * 1000)).toBe("1000:00");
    });
  });

  describe("real-world game times", () => {
    it("formats typical fast game time (45 seconds)", () => {
      expect(formatTime(45000)).toBe("0:45");
    });

    it("formats typical average game time (2 minutes 15 seconds)", () => {
      expect(formatTime(135000)).toBe("2:15");
    });

    it("formats typical slow game time (5 minutes 30 seconds)", () => {
      expect(formatTime(330000)).toBe("5:30");
    });

    it("formats exact boundary time (1 minute)", () => {
      expect(formatTime(60000)).toBe("1:00");
    });
  });
});
