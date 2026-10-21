// Prisma 7 configuration file.
// Prisma 7 no longer reads the datasource URL from prisma/schema.prisma — it is
// supplied here. `DATABASE_URL` should be the *pooled* Neon connection string for
// normal application traffic, and `DIRECT_URL` should be the *direct* (non-pooled)
// Neon connection string, which is what Prisma Migrate uses for DDL statements.
//
// Requires the `dotenv` package so that `.env` / `.env.local` are loaded by the CLI.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
