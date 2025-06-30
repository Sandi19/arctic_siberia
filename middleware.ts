// File: middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth' // ✅ FIXED: Gunakan alias path, bukan relative

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
  '/api/auth/logout', // ✅ FIXED: Allow logout without redirect loops
]

// 👑 ADMIN - Full access, dapat approve/reject kursus
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/admin',
  '/admin/courses',        // ✅ NEW: Kelola semua kursus (approve/reject)
  '/admin/users',          // ✅ NEW: Kelola semua user
  '/admin/analytics',      // ✅ NEW: Statistik platform
  '/admin/settings',       // ✅ NEW: Pengaturan sistem
  '/courses/create',       // Admin bisa buat kursus langsung APPROVED
  '/courses/edit',
  '/courses/manage',       // Kelola semua kursus
  '/users/manage',         // Kelola semua user
  '/analytics',
  '/settings/admin',
]

// 👨‍🏫 INSTRUCTOR - Buat dan kelola kursus sendiri (status PENDING)
const INSTRUCTOR_ROUTES = [
  '/dashboard/instructor',
  '/instructor',
  '/instructor/courses',      // ✅ NEW: Kursus milik sendiri
  '/instructor/create',       // ✅ NEW: Buat kursus baru (status: PENDING)
  '/instructor/students',     // ✅ NEW: Siswa di kursus sendiri
  '/instructor/analytics',    // ✅ NEW: Analytics kursus sendiri
  '/my-classes',             // LEGACY: Pertahankan untuk backward compatibility
  '/course-analytics',       // LEGACY: Pertahankan untuk backward compatibility
]

// 🎓 STUDENT - Akses kursus yang sudah APPROVED saja
const STUDENT_ROUTES = [
  '/dashboard/student',
  '/dashboard',              // ✅ FIXED: /dashboard umum untuk student
  '/student',                // ✅ NEW: Student specific routes
  '/my-courses',             // Kursus yang didaftarkan
  '/my-progress',            // Progress belajar
  '/certificates',           // Sertifikat yang diperoleh
  '/profile',               // Profile student
]

// 🔐 API routes yang butuh auth tapi tidak role-specific
const PROTECTED_API_ROUTES = [
  '/api/courses/enroll',     // Student enroll kursus
  '/api/user/profile',       // Update profile
  '/api/auth/me',           // Get current user
  '/api/upload',            // Upload file (instructor & student)
]

// 🔧 API routes berdasarkan role
const ADMIN_API_ROUTES = [
  '/api/admin',             // ✅ NEW: Admin API endpoints
  '/api/courses/approve',   // ✅ NEW: Approve kursus
  '/api/courses/reject',    // ✅ NEW: Reject kursus
  '/api/users/manage',      // ✅ NEW: User management API
]

const INSTRUCTOR_API_ROUTES = [
  '/api/instructor',        // ✅ NEW: Instructor API endpoints
  '/api/courses/create',    // ✅ NEW: Buat kursus (akan jadi PENDING)
  '/api/courses/update',    // Update kursus sendiri
  '/api/lessons',          // Kelola lessons
]

const STUDENT_API_ROUTES = [
  '/api/student',          // ✅ NEW: Student API endpoints
  '/api/progress',         // Progress tracking
  '/api/certificates',     // Certificate requests
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 🔍 DEBUGGING (hapus di production)
  console.log(`🔍 Middleware check: ${pathname}`)

  try {
    // ✅ Skip jika rute publik (FIXED: No interference with logout)
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
      // Hapus cookie yang tidak valid
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
      if (isInstructorRoute(pathname) && !isGeneralRoute(pathname)) {
        console.log(`🔄 Admin redirected from instructor-specific route to admin dashboard`)
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
      // Admin bisa akses semua route lainnya
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
      // Check API access
      if (isAdminAPIRoute(pathname) || isInstructorAPIRoute(pathname)) {
        console.log(`🚫 Student blocked from ${role.toLowerCase()} API`)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // 👨‍🏫 INSTRUCTOR - Buat kursus (PENDING), kelola kursus sendiri
    if (role === 'INSTRUCTOR') {
      if (isAdminRoute(pathname)) {
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
    
    // Set user info di headers untuk komponen (opsional)
    response.headers.set('x-user-id', userId)
    response.headers.set('x-user-role', role)
    
    return response

  } catch (error) {
    console.error('❌ Middleware error:', error)
    // Fallback: redirect ke login jika terjadi error
    return redirectToLogin(request)
  }
}

// 🔧 HELPER FUNCTIONS (Enhanced dari versi lama)

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

// ✅ NEW: Role-specific API route checkers
function isAdminAPIRoute(pathname: string): boolean {
  return ADMIN_API_ROUTES.some(route => pathname.startsWith(route))
}

function isInstructorAPIRoute(pathname: string): boolean {
  return INSTRUCTOR_API_ROUTES.some(route => pathname.startsWith(route))
}

function isStudentAPIRoute(pathname: string): boolean {
  return STUDENT_API_ROUTES.some(route => pathname.startsWith(route))
}

// ✅ NEW: Check if route is general (can be accessed by multiple roles)
function isGeneralRoute(pathname: string): boolean {
  const generalRoutes = [
    '/profile',
    '/courses', // Public course listing
    '/my-courses', // Could be shared
  ]
  return generalRoutes.some(route => pathname.startsWith(route))
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url)
  
  // ✅ FIXED: Only set 'from' parameter for protected routes, not for homepage
  if (!isPublicRoute(request.nextUrl.pathname) && request.nextUrl.pathname !== '/') {
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
  }
  
  console.log(`🔄 Redirecting to: ${loginUrl.toString()}`)
  return NextResponse.redirect(loginUrl)
}

// 🎯 MATCHER CONFIGURATION
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

/*
🎯 FIXED ISSUES IN MIDDLEWARE:

✅ **Logout Route Added to Public Routes**
   - `/api/auth/logout` is now in PUBLIC_ROUTES
   - No interference with logout process

✅ **Improved Redirect Logic**
   - Homepage (/) won't set 'from' parameter
   - Prevents unnecessary redirects after logout

✅ **Maintained Enhanced Features**
   - 3-role system support
   - Role-specific API route protection
   - Smart redirects

🔧 KEY FIXES:
   1. Added `/api/auth/logout` to PUBLIC_ROUTES
   2. Fixed redirectToLogin to not set 'from' for homepage
   3. Maintained all enhanced role-based features

This should resolve the logout redirect issue while maintaining the enhanced 3-role system.
*/