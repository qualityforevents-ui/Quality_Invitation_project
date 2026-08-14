import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// The URL here is read by the Prisma CLI only: migrate, db push, studio, introspect.
// It is deliberately the DIRECT connection on port 5432, because migrations issue
// statements that a transaction pooler cannot carry.
//
// Runtime queries never come through this file. They go through the pg driver adapter
// in src/lib/db.ts, which is pointed at the port 6543 pooler.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
