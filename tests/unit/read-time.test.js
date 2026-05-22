import { describe, it, expect } from "vitest";
import { calculateReadTime } from "../../scripts/build.js";

describe("calculateReadTime", () => {
  it("returns 1 min for very short text", () => {
    expect(calculateReadTime("word ".repeat(100))).toBe(1);
  });

  it("returns ceiling of words / 200", () => {
    expect(calculateReadTime("word ".repeat(201))).toBe(2);
    expect(calculateReadTime("word ".repeat(400))).toBe(2);
    expect(calculateReadTime("word ".repeat(401))).toBe(3);
  });

  it("handles empty string", () => {
    expect(calculateReadTime("")).toBe(1);
  });

  it("handles multiline text correctly", () => {
    const text = Array(600).fill("word").join("\n");
    expect(calculateReadTime(text)).toBe(3);
  });
});
