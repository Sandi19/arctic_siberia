import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth' // ✅ FIXED: Gunakan alias path, bukan relative

// 🎯 KONFIGURASI RUTE
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password', // ✅ ADDED: Missing route
  '/courses', // Halaman daftar kursus publik
  '/about',
  '/contact',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout', // ✅ ADDED: Logout endpoint
]

const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/admin',
  '/courses/create',
  '/courses/edit',
  '/courses/manage',
  '/users/manage',
  '/analytics',
  '/settings/admin',
]

const STUDENT_ROUTES = [
  '/dashboard/student',
  '/dashboard', // ✅ FIXED: /dashboard umum untuk student
  '/my-courses',
  '/my-progress',
  '/certificates',
  '/profile',
]

const INSTRUCTOR_ROUTES = [
  '/dashboard/instructor',
  '/instructor',
  '/my-classes',
  '/course-analytics',
]

// API routes yang butuh auth tapi tidak role-specific
const PROTECTED_API_ROUTES = [
  '/api/courses/enroll',
  '/api/user/profile',
  '/api/auth/me',
  '/api/auth/logout', // ✅ ADDED
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 🔍 DEBUGGING (hapus di production)
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
      // Hapus cookie yang tidak valid
      const loginResponse = redirectToLogin(request)
      loginResponse.cookies.delete('auth-token')
      return loginResponse
    }

    const { role, userId } = payload
    console.log(`🔐 Token valid - User: ${userId}, Role: ${role}`)

    // 🎯 ROLE-BASED ACCESS CONTROL
    
    // Admin trying to access student or instructor routes
    if (role === 'ADMIN') {
      if (isStudentRoute(pathname)) {
        console.log(`🔄 Admin redirected from student route to admin dashboard`)
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
      if (isInstructorRoute(pathname)) {
        console.log(`🔄 Admin redirected from instructor route to admin dashboard`)
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
    }

    // Student trying to access admin or instructor routes
    if (role === 'STUDENT') {
      if (isAdminRoute(pathname)) {
        console.log(`🔄 Student redirected from admin route to student dashboard`)
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }
      if (isInstructorRoute(pathname)) {
        console.log(`🔄 Student redirected from instructor route to student dashboard`)
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }
    }

    // Instructor trying to access admin or student routes
    if (role === 'INSTRUCTOR') {
      if (isAdminRoute(pathname)) {
        console.log(`🔄 Instructor redirected from admin route to instructor dashboard`)
        return NextResponse.redirect(new URL('/dashboard/instructor', request.url))
      }
      if (isStudentRoute(pathname)) {
        console.log(`🔄 Instructor redirected from student route to instructor dashboard`)
        return NextResponse.redirect(new URL('/dashboard/instructor', request.url))
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

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url)
  
  // Simpan halaman yang ingin diakses untuk redirect setelah login
  if (!isPublicRoute(request.nextUrl.pathname)) {
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
🎯 PERBAIKAN YANG DILAKUKAN:

✅ **Fixed Import Path**
   - Dari: './src/lib/auth'
   - Ke: '@/lib/auth' (menggunakan alias path)

✅ **Added Missing Routes**
   - /auth/reset-password
   - /api/auth/logout
   - Instructor routes

✅ **Improved Role Logic**
   - 3-way role checking (ADMIN, STUDENT, INSTRUCTOR)
   - Lebih comprehensive redirect logic

✅ **Better Route Organization**
   - Separate INSTRUCTOR_ROUTES
   - More complete PUBLIC_ROUTES
   - Clear PROTECTED_API_ROUTES

✅ **Enhanced Security**
   - Better error handling
   - More robust token validation
   - Proper cookie cleanup

🔧 CARA KERJA:

1. **Public Routes**: Langsung diizinkan tanpa cek token
2. **Token Validation**: Cek cookie 'auth-token' dan verifikasi JWT
3. **Role-Based Routing**:
   - ADMIN → /dashboard/admin
   - STUDENT → /dashboard/student  
   - INSTRUCTOR → /dashboard/instructor
4. **Smart Redirects**: 
   - No token → login dengan 'from' parameter
   - Wrong role → redirect ke dashboard yang sesuai
5. **Security**: Invalid token → hapus cookie + redirect login

🛠️ PRODUCTION NOTES:
- Hapus console.log di production
- Set proper environment variables
- Monitor performance dengan logging yang tepat
*/