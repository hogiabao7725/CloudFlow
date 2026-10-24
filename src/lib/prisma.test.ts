import { describe, it, expect } from "vitest";
import { prisma } from "./prisma";

describe("Prisma Client Singleton", () => {
  it("should export a valid prisma client instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe("object");
  });
});
