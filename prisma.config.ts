import { defineConfig } from "prisma/config";

// Load environment variables for Prisma CLI from .env.local or .env
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    try {
      process.loadEnvFile(".env");
    } catch {
      // Fallback to system / CI environment variables
    }
  }
}

// Uses DIRECT_URL for migrations, falls back to DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});

