// File: src/lib/auth.ts

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

// 🔐 ROLE CHECKING FUNCTIONS

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

// 🔒 VALIDATION FUNCTIONS

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

  return { valid: true, message: 'Password valid' }
}

// 🎯 REDIRECT & ROUTING FUNCTIONS (Untuk Middleware)

/**
 * Get user role redirect path
 */
export function getRoleRedirectPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin'
    case 'INSTRUCTOR':
      return '/dashboard/instructor'
    case 'STUDENT':
      return '/dashboard/student'
    default:
      return '/dashboard/student'
  }
}

/**
 * Check if user has permission for route (untuk middleware)
 */
export function hasRoutePermission(userRole: string, pathname: string): boolean {
  // Admin can access everything except student-specific routes
  if (userRole === 'ADMIN') {
    const studentOnlyRoutes = ['/dashboard/student', '/my-courses', '/my-progress']
    return !studentOnlyRoutes.some(route => pathname.startsWith(route))
  }

  // Student can access student routes and general protected routes
  if (userRole === 'STUDENT') {
    const adminOnlyRoutes = ['/dashboard/admin', '/admin', '/courses/create', '/courses/manage', '/users/manage']
    return !adminOnlyRoutes.some(route => pathname.startsWith(route))
  }

  // Instructor permissions
  if (userRole === 'INSTRUCTOR') {
    const restrictedRoutes = ['/dashboard/admin', '/users/manage']
    return !restrictedRoutes.some(route => pathname.startsWith(route))
  }

  return false
}

/**
 * Get default dashboard for user role (alias untuk getRoleRedirectPath)
 */
export function getDefaultDashboard(role: string): string {
  return getRoleRedirectPath(role)
}

/**
 * Check if route is public (tidak perlu auth)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/courses',
    '/about',
    '/contact',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
  ]

  return publicRoutes.some(route => {
    if (route === pathname) return true
    if (route.endsWith('*')) {
      const baseRoute = route.slice(0, -1)
      return pathname.startsWith(baseRoute)
    }
    return false
  })
}

/**
 * Check if route requires admin role
 */
export function isAdminRoute(pathname: string): boolean {
  const adminRoutes = [
    '/dashboard/admin',
    '/admin',
    '/admin/courses',
    '/admin/users',
    '/admin/analytics',
    '/admin/settings',
    '/courses/create',
    '/courses/edit',
    '/courses/manage',
    '/users/manage',
    '/analytics',
    '/settings/admin',
  ]

  return adminRoutes.some(route => pathname.startsWith(route))
}

/**
 * Check if route is student-specific
 */
export function isStudentRoute(pathname: string): boolean {
  const studentRoutes = [
    '/dashboard/student',
    '/student',
    '/my-courses',
    '/my-progress',
    '/certificates',
  ]

  return studentRoutes.some(route => pathname.startsWith(route))
}

/**
 * Check if route is instructor-specific
 */
export function isInstructorRoute(pathname: string): boolean {
  const instructorRoutes = [
    '/dashboard/instructor',
    '/instructor',
    '/instructor/courses',
    '/instructor/create',
    '/instructor/students',
    '/instructor/analytics',
    '/my-classes',
    '/course-analytics',
  ]

  return instructorRoutes.some(route => pathname.startsWith(route))
}

// 🛠️ UTILITY FUNCTIONS

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

/**
 * Extract user ID from token without verification (untuk middleware)
 */
export function extractUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded?.userId || null
  } catch {
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded?.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

// 🔓 PERMISSION FUNCTIONS (Enhanced for 3-role system)

/**
 * Check if user can create courses
 */
export function canCreateCourse(user: AuthUser): boolean {
  return user.role === 'ADMIN' || user.role === 'INSTRUCTOR'
}

/**
 * Check if user can approve courses
 */
export function canApproveCourse(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * Check if user can manage all users
 */
export function canManageUsers(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * Check if user can access course
 */
export function canAccessCourse(
  user: AuthUser, 
  courseStatus: string, 
  instructorId: string
): boolean {
  switch (user.role) {
    case 'ADMIN':
      return true
    case 'INSTRUCTOR':
      return instructorId === user.id || courseStatus === 'APPROVED'
    case 'STUDENT':
      return courseStatus === 'APPROVED'
    default:
      return false
  }
}

/**
 * Check if user can edit course
 */
export function canEditCourse(user: AuthUser, instructorId: string): boolean {
  return user.role === 'ADMIN' || 
         (user.role === 'INSTRUCTOR' && instructorId === user.id)
}

/**
 * Check if user can delete course
 */
export function canDeleteCourse(user: AuthUser, instructorId: string): boolean {
  return user.role === 'ADMIN' || 
         (user.role === 'INSTRUCTOR' && instructorId === user.id)
}

/**
 * Get default course status untuk role
 */
export function getDefaultCourseStatus(userRole: string): string {
  switch (userRole) {
    case 'ADMIN':
      return 'APPROVED'
    case 'INSTRUCTOR':
      return 'PENDING'
    default:
      return 'PENDING'
  }
}

/**
 * Check if user can view course analytics
 */
export function canViewCourseAnalytics(user: AuthUser, instructorId?: string): boolean {
  if (user.role === 'ADMIN') return true
  if (user.role === 'INSTRUCTOR' && instructorId === user.id) return true
  return false
}

/**
 * Check if user can manage course students
 */
export function canManageCourseStudents(user: AuthUser, instructorId: string): boolean {
  return user.role === 'ADMIN' || 
         (user.role === 'INSTRUCTOR' && instructorId === user.id)
}

/**
 * Get allowed course statuses for user role
 */
export function getAllowedCourseStatuses(userRole: string): string[] {
  switch (userRole) {
    case 'ADMIN':
      return ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED']
    case 'INSTRUCTOR':
      return ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']
    case 'STUDENT':
      return ['APPROVED']
    default:
      return ['APPROVED']
  }
}

/**
 * Check if user can enroll in course
 */
export function canEnrollInCourse(user: AuthUser, courseStatus: string): boolean {
  return user.role === 'STUDENT' && courseStatus === 'APPROVED'
}