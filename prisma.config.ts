import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env first, then override with .env.local (same order as Next.js)
config({ path: ".env" });
config({ path: ".env.local", override: true });
config({ path: `.env.${process.env.NODE_ENV}.local`, override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
