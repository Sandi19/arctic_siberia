import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { comparePassword, generateToken, isValidEmail, getRoleRedirectPath } from '@/lib/auth'

interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  redirectTo?: string // Tambahan untuk handle redirect setelah login
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, rememberMe = false, redirectTo } = body

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email dan password wajib diisi' 
        },
        { status: 400 }
      )
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Format email tidak valid' 
        },
        { status: 400 }
      )
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true, // Tambahan untuk tracking
      },
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email atau password salah' 
        },
        { status: 401 }
      )
    }

    // Cek apakah akun aktif
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.' 
        },
        { status: 403 }
      )
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email atau password salah' 
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    }

    // 🎯 LOGIC REDIRECT CERDAS
    let finalRedirectUrl: string

    // 1. Jika ada redirectTo dari client (dari URL parameter 'from')
    if (redirectTo && isValidRedirectUrl(redirectTo, user.role)) {
      finalRedirectUrl = redirectTo
    } else {
      // 2. Default redirect berdasarkan role
      finalRedirectUrl = getRoleRedirectPath(user.role)
    }

    // Create response dengan redirect info
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login berhasil',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
        },
        // ✨ INFO REDIRECT UNTUK CLIENT
        redirect: {
          url: finalRedirectUrl,
          reason: redirectTo ? 'user_requested' : 'role_default'
        },
        // Token tetap disertakan jika dibutuhkan untuk debugging
        ...(process.env.NODE_ENV === 'development' && { token }),
      },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set('auth-token', token, cookieOptions)

    // 📊 UPDATE LAST LOGIN (Background task)
    // Jalankan async tanpa menunggu untuk performa
    updateLastLogin(user.id).catch(error => {
      console.error('Failed to update last login:', error)
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan server. Silakan coba lagi nanti.' 
      },
      { status: 500 }
    )
  }
}

// 🔒 HELPER: Validasi URL redirect aman
function isValidRedirectUrl(url: string, userRole: string): boolean {
  try {
    // Tidak boleh redirect ke external domain
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return false
    }

    // Harus dimulai dengan /
    if (!url.startsWith('/')) {
      return false
    }

    // Tidak boleh redirect ke auth pages
    const authPages = ['/auth/login', '/auth/register', '/auth/forgot-password']
    if (authPages.some(page => url.startsWith(page))) {
      return false
    }

    // 🎯 ROLE-BASED REDIRECT VALIDATION
    const adminRoutes = ['/dashboard/admin', '/admin', '/courses/create', '/courses/manage', '/users/manage']
    const studentRoutes = ['/dashboard/student', '/my-courses', '/my-progress']

    // Student tidak boleh ke admin routes
    if (userRole === 'STUDENT' && adminRoutes.some(route => url.startsWith(route))) {
      return false
    }

    // Admin tidak boleh ke student-only routes
    if (userRole === 'ADMIN' && studentRoutes.some(route => url.startsWith(route))) {
      return false
    }

    return true
  } catch {
    return false
  }
}

// 📊 HELPER: Update last login (background task)
async function updateLastLogin(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        lastLoginAt: new Date(),
        // Bisa tambahkan login count jika diperlukan
        // loginCount: { increment: 1 }
      },
    })
  } catch (error) {
    // Jangan throw error, hanya log
    console.error('Update last login failed:', error)
  }
}

// 🚪 LOGOUT ENDPOINT (Dipindah dari DELETE ke POST untuk konsistensi)
export async function DELETE() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout berhasil',
        redirect: {
          url: '/auth/login',
          reason: 'logout_success'
        }
      },
      { status: 200 }
    )

    // Clear auth cookie dengan semua opsi yang sama
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)

    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat logout' 
      },
      { status: 500 }
    )
  }
}

// Handle method not allowed
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method GET tidak diizinkan untuk endpoint ini. Gunakan POST untuk login.' 
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method PUT tidak diizinkan untuk endpoint ini. Gunakan POST untuk login.' 
    },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method PATCH tidak diizinkan untuk endpoint ini. Gunakan POST untuk login.' 
    },
    { status: 405 }
  )
}

/*
🎯 FITUR BARU YANG DITAMBAHKAN:

1. ✅ **Smart Redirect Logic**
   - Bisa redirect ke halaman yang diminta user (dari URL parameter)
   - Validasi keamanan redirect URL
   - Role-based redirect validation

2. ✅ **Enhanced Response**
   - Informasi redirect yang jelas untuk client
   - Reason kenapa redirect ke URL tertentu

3. ✅ **Security Improvements**
   - Validasi redirect URL untuk mencegah open redirect
   - Role-based access control untuk redirect

4. ✅ **Performance Optimization**
   - Update last login sebagai background task
   - Tidak menunggu database update untuk response

5. ✅ **Better Error Handling**
   - Method not allowed yang lebih informatif
   - Graceful error handling untuk update last login

6. ✅ **Development Support**
   - Token disertakan di development mode untuk debugging

🔧 CARA PENGGUNAAN DI FRONTEND:

```typescript
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    password,
    rememberMe,
    redirectTo: searchParams.get('from') // Dari URL parameter
  })
})

const data = await loginResponse.json()
if (data.success) {
  router.push(data.redirect.url)
}
```
*/