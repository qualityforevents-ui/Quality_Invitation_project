import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Runtime queries go through the Supavisor transaction pooler on port 6543.
 *
 * Every Vercel serverless invocation gets its own process and therefore its own
 * pool, so each one is held to a single connection. Without that cap a burst of
 * traffic opens hundreds of sockets against the pooler and everything stalls.
 */
const POOL_MAX = 1;

/**
 * `pgbouncer` and `connection_limit` are query parameters that Prisma's own query
 * engine understood. The pg driver hands anything it does not recognise straight
 * to Postgres as a startup parameter, which fails the connection outright, so they
 * are stripped here. SETUP.md still documents the URL with them appended, matching
 * what Supabase hands you, and this keeps that URL working either way.
 */
const PRISMA_ONLY_PARAMS = ['pgbouncer', 'connection_limit', 'connect_timeout', 'pool_timeout'];

function sanitiseConnectionString(raw: string): string {
  try {
    const url = new URL(raw);
    for (const param of PRISMA_ONLY_PARAMS) {
      url.searchParams.delete(param);
    }
    return url.toString();
  } catch {
    // Not a parseable URL. Hand it over untouched and let pg report the problem,
    // which produces a far clearer error than anything invented here.
    return raw;
  }
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and fill in the Supabase pooler connection string. See SETUP.md.',
    );
  }

  const adapter = new PrismaPg({
    connectionString: sanitiseConnectionString(connectionString),
    max: POOL_MAX,
  });

  return new PrismaClient({ adapter });
}

// Next.js hot reload re-evaluates modules on every edit. Without stashing the
// client on globalThis, a long dev session leaks a connection per reload until
// the pooler refuses new ones.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
