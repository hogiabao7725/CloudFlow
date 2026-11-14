import { describe, it, expect } from "vitest";
import { SHOW_AI_COPILOT } from "@/utils/ai";

describe("AI Utils & Feature Flags", () => {
  it("should export SHOW_AI_COPILOT as a boolean", () => {
    expect(typeof SHOW_AI_COPILOT).toBe("boolean");
  });
});
