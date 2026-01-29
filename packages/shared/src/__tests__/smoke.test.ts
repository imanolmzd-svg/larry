import { describe, expect, it } from "vitest";

describe("shared smoke", () => {
  it("runs basic assertions", () => {
    expect("larry").toBe("larry");
  });
});
