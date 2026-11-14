import { describe, it, expect } from "vitest";
import { getDeterministicColor, AVATAR_COLORS } from "@/utils/color";

describe("Color Utilities (src/utils/color.ts)", () => {
  it("should contain a non-empty list of valid hex color strings", () => {
    expect(AVATAR_COLORS.length).toBeGreaterThan(0);
    for (const color of AVATAR_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("should return the exact same color consistently for the same user id", () => {
    const color1 = getDeterministicColor("user_clerk_12345");
    const color2 = getDeterministicColor("user_clerk_12345");
    expect(color1).toBe(color2);
    expect(AVATAR_COLORS).toContain(color1);
  });

  it("should handle empty string without crashing and return a palette color", () => {
    const color = getDeterministicColor("");
    expect(AVATAR_COLORS).toContain(color);
  });

  it("should produce valid palette colors for various distinct user IDs", () => {
    const ids = ["user_1", "user_2", "alex", "bao_ho", "test_id_999"];
    for (const id of ids) {
      const color = getDeterministicColor(id);
      expect(AVATAR_COLORS).toContain(color);
    }
  });
});
