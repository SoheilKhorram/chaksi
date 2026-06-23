import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  // Return a dummy client or throw an error. In local generation, DATABASE_URL might be undefined.
  // We throw a clear descriptive error to help the developer configure it.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL environment variable is missing!')
  }
}

// In local environment without DATABASE_URL, we fallback safely or let it throw when queried.
const pool = globalForPrisma.pool ?? new Pool({ connectionString: connectionString || '' })
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
