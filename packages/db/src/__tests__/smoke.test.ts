import { describe, expect, it } from "vitest";

describe("db smoke", () => {
  it("runs basic assertions", () => {
    expect(Array.isArray([])).toBe(true);
  });
});
