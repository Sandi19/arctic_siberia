// File: src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ✅ Helper function untuk error handling
export function handlePrismaError(error: any) {
  console.error('Prisma Error:', error)
  
  if (error.code === 'P2002') {
    return {
      type: 'UNIQUE_CONSTRAINT',
      message: 'A record with this data already exists',
      field: error.meta?.target?.[0] || 'unknown'
    }
  }
  
  if (error.code === 'P2025') {
    return {
      type: 'NOT_FOUND',
      message: 'Record not found',
      field: error.meta?.cause || 'unknown'
    }
  }
  
  if (error.code === 'P2003') {
    return {
      type: 'FOREIGN_KEY_CONSTRAINT',
      message: 'Related record not found',
      field: error.meta?.field_name || 'unknown'
    }
  }
  
  return {
    type: 'UNKNOWN',
    message: 'Database operation failed',
    field: 'unknown'
  }
}