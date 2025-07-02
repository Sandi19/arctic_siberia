// File: middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// 🎯 KONFIGURASI RUTE BERDASARKAN 3 ROLE SYSTEM
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/courses', // Halaman daftar kursus publik (hanya yang APPROVED)
  '/about',
  '/contact',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
]

// 👑 ADMIN - Full access, dapat approve/reject kursus
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/admin',
  '/admin/courses',        // ✅ Kelola semua kursus (approve/reject)
  '/admin/users',          // ✅ Kelola semua user
  '/admin/analytics',      // ✅ Statistik platform
  '/admin/settings',       // ✅ Pengaturan sistem
  '/courses/create',       // Admin bisa buat kursus langsung APPROVED
  '/courses/edit',
  '/courses/manage',       // Kelola semua kursus
  '/users/manage',         // Kelola semua user
  '/analytics',
  '/settings/admin',
  '/course-builder',       // ✅ NEW: ADMIN bisa akses course builder
]

// 👨‍🏫 INSTRUCTOR - Buat dan kelola kursus sendiri (status PENDING)
const INSTRUCTOR_ROUTES = [
  '/dashboard/instructor',
  '/instructor',
  '/instructor/courses',      // ✅ Kursus milik sendiri
  '/instructor/create',       // ✅ Buat kursus baru (status: PENDING)
  '/instructor/students',     // ✅ Siswa di kursus sendiri
  '/instructor/analytics',    // ✅ Analytics kursus sendiri
  '/my-classes',             // LEGACY: Pertahankan untuk backward compatibility
  '/course-analytics',       // LEGACY: Pertahankan untuk backward compatibility
  '/course-builder',         // ✅ NEW: INSTRUCTOR bisa akses course builder
]

// 🎓 STUDENT - Akses kursus yang sudah APPROVED saja
const STUDENT_ROUTES = [
  '/dashboard/student',
  '/dashboard',
  '/student',
  '/my-courses',
  '/my-progress',
  '/certificates',
  '/profile',
]

// 🔐 API routes yang butuh auth tapi tidak role-specific
const PROTECTED_API_ROUTES = [
  '/api/courses/enroll',
  '/api/user/profile',
  '/api/auth/me',
  '/api/upload',
]

// 🔧 API routes berdasarkan role
const ADMIN_API_ROUTES = [
  '/api/admin',
  '/api/courses/approve',
  '/api/courses/reject',
  '/api/users/manage',
]

const INSTRUCTOR_API_ROUTES = [
  '/api/instructor',
  '/api/courses/create',
  '/api/courses/update',
  '/api/lessons',
]

const STUDENT_API_ROUTES = [
  '/api/student',
  '/api/progress',
  '/api/certificates',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  console.log(`🔍 Middleware check: ${pathname}`)

  try {
    // ✅ Skip jika rute publik
    if (isPublicRoute(pathname)) {
      console.log(`✅ Public route allowed: ${pathname}`)
      return response
    }

    // 🍪 Ambil token dari cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      console.log(`❌ No token found, redirecting to login`)
      return redirectToLogin(request)
    }

    // 🔐 Verifikasi token
    const payload = verifyToken(token)
    if (!payload) {
      console.log(`❌ Invalid token, redirecting to login`)
      const loginResponse = redirectToLogin(request)
      loginResponse.cookies.delete('auth-token')
      return loginResponse
    }

    const { role, userId } = payload
    console.log(`🔐 Token valid - User: ${userId}, Role: ${role}`)

    // 🎯 ROLE-BASED ACCESS CONTROL dengan 3 ROLE SYSTEM
    
    // 👑 ADMIN - Full access dengan smart redirects
    if (role === 'ADMIN') {
      // Admin trying to access student or instructor specific routes
      if (isStudentRoute(pathname) && !isGeneralRoute(pathname)) {
        console.log(`🔄 Admin redirected from student-specific route to admin dashboard`)
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
      if (isInstructorRoute(pathname) && !isGeneralRoute(pathname) && pathname !== '/course-builder') {
        console.log(`🔄 Admin redirected from instructor-specific route to admin dashboard`)
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
      // ✅ Admin bisa akses semua route lainnya termasuk course-builder
    }

    // 🎓 STUDENT - Hanya bisa akses kursus APPROVED dan student routes
    if (role === 'STUDENT') {
      if (isAdminRoute(pathname)) {
        console.log(`🔄 Student redirected from admin route to student dashboard`)
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }
      if (isInstructorRoute(pathname)) {
        console.log(`🔄 Student redirected from instructor route to student dashboard`)
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }
      // ✅ SPECIAL: Block student dari course-builder secara eksplisit
      if (pathname === '/course-builder') {
        console.log(`🚫 Student blocked from course-builder, redirecting to student dashboard`)
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }
      // Check API access
      if (isAdminAPIRoute(pathname) || isInstructorAPIRoute(pathname)) {
        console.log(`🚫 Student blocked from ${role.toLowerCase()} API`)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // 👨‍🏫 INSTRUCTOR - Buat kursus (PENDING), kelola kursus sendiri
    if (role === 'INSTRUCTOR') {
      if (isAdminRoute(pathname) && pathname !== '/course-builder') {
        console.log(`🔄 Instructor redirected from admin route to instructor dashboard`)
        return NextResponse.redirect(new URL('/dashboard/instructor', request.url))
      }
      if (isStudentRoute(pathname) && !isGeneralRoute(pathname)) {
        console.log(`🔄 Instructor redirected from student-specific route to instructor dashboard`)
        return NextResponse.redirect(new URL('/dashboard/instructor', request.url))
      }
      // Check API access
      if (isAdminAPIRoute(pathname)) {
        console.log(`🚫 Instructor blocked from admin API`)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // ✅ Route diizinkan
    console.log(`✅ Access granted for ${role} to ${pathname}`)
    
    // Set user info di headers untuk komponen
    response.headers.set('x-user-id', userId)
    response.headers.set('x-user-role', role)
    
    return response

  } catch (error) {
    console.error('❌ Middleware error:', error)
    return redirectToLogin(request)
  }
}

// 🔧 HELPER FUNCTIONS
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === pathname) return true
    if (route.endsWith('*')) {
      const baseRoute = route.slice(0, -1)
      return pathname.startsWith(baseRoute)
    }
    return false
  })
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

function isStudentRoute(pathname: string): boolean {
  return STUDENT_ROUTES.some(route => pathname.startsWith(route))
}

function isInstructorRoute(pathname: string): boolean {
  return INSTRUCTOR_ROUTES.some(route => pathname.startsWith(route))
}

function isProtectedAPIRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
}

function isAdminAPIRoute(pathname: string): boolean {
  return ADMIN_API_ROUTES.some(route => pathname.startsWith(route))
}

function isInstructorAPIRoute(pathname: string): boolean {
  return INSTRUCTOR_API_ROUTES.some(route => pathname.startsWith(route))
}

function isStudentAPIRoute(pathname: string): boolean {
  return STUDENT_API_ROUTES.some(route => pathname.startsWith(route))
}

function isGeneralRoute(pathname: string): boolean {
  const generalRoutes = [
    '/profile',
    '/courses',
    '/my-courses',
  ]
  return generalRoutes.some(route => pathname.startsWith(route))
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url)
  
  if (!isPublicRoute(request.nextUrl.pathname) && request.nextUrl.pathname !== '/') {
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
  }
  
  console.log(`🔄 Redirecting to: ${loginUrl.toString()}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}