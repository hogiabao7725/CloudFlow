import { describe, it, expect } from "vitest";
import proxy, { config } from "./proxy";

describe("Proxy Configuration", () => {
  it("should export a valid proxy handler", () => {
    expect(proxy).toBeDefined();
    expect(typeof proxy).toBe("function");
  });

  it("should define a matcher array targeting API routes", () => {
    expect(config).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher).toContain("/(api|trpc)(.*)");
  });
});
