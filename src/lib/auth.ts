import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

// Type definitions
export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  avatar?: string | null
  isActive: boolean
}

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Generate JWT token for user
 */
export function generateToken(user: { id: string; email: string; role: string }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Get current user from request (using cookies)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    console.error('Get current user failed:', error)
    return null
  }
}

/**
 * Get current user from request headers (for API routes)
 */
export async function getCurrentUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Try to get token from cookies first
    const cookieToken = request.cookies.get('auth-token')?.value
    
    // Then try Authorization header
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const token = cookieToken || headerToken

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    console.error('Get current user from request failed:', error)
    return null
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * Check if user is instructor
 */
export function isInstructor(user: AuthUser): boolean {
  return user.role === 'INSTRUCTOR'
}

/**
 * Check if user is student
 */
export function isStudent(user: AuthUser): boolean {
  return user.role === 'STUDENT'
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' }
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password maksimal 128 karakter' }
  }

  // Check for at least one letter and one number (optional, comment out if not needed)
  // const hasLetter = /[a-zA-Z]/.test(password)
  // const hasNumber = /[0-9]/.test(password)
  // if (!hasLetter || !hasNumber) {
  //   return { valid: false, message: 'Password harus mengandung huruf dan angka' }
  // }

  return { valid: true, message: 'Password valid' }
}

/**
 * Generate secure random string
 */
export function generateSecureString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}