// src/app/api/auth/login/route.ts
// Fixed version - Remove semua reference ke lastLoginAt

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Initialize Prisma Client
const prisma = new PrismaClient()

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  redirectTo?: string
}

export async function POST(request: NextRequest) {
  console.log('🔥 Login API called');
  
  try {
    // Parse request body
    const body: LoginRequest = await request.json()
    console.log('📥 Request body parsed:', { 
      email: body.email, 
      hasPassword: !!body.password,
      rememberMe: body.rememberMe 
    });

    const { email, password, rememberMe = false, redirectTo } = body

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email dan password wajib diisi' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Format email tidak valid' 
        },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for user with email:', email);

    // Find user in database - FIXED: Remove lastLoginAt
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
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
        updatedAt: true,
        // ❌ REMOVED: lastLoginAt (field tidak ada di schema)
      },
    })

    console.log('👤 User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found for email:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email atau password salah' 
        },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      console.log('❌ User account inactive:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Akun Anda tidak aktif. Hubungi administrator.' 
        },
        { status: 401 }
      )
    }

    console.log('🔐 Verifying password...');

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email atau password salah' 
        },
        { status: 401 }
      )
    }

    console.log('🎫 Generating JWT token...');

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    console.log('🎫 Token generated successfully');

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    }

    // Determine redirect URL
    const getRoleRedirectPath = (role: string): string => {
      switch (role) {
        case 'ADMIN':
          return '/dashboard/admin'
        case 'INSTRUCTOR':
          return '/dashboard/instructor'
        case 'STUDENT':
        default:
          return '/dashboard/student'
      }
    }

    const finalRedirectUrl = redirectTo && isValidRedirectUrl(redirectTo, user.role) 
      ? redirectTo 
      : getRoleRedirectPath(user.role)

    console.log('✅ Login successful, redirecting to:', finalRedirectUrl);

    // Create response
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
        redirect: {
          url: finalRedirectUrl,
          reason: redirectTo ? 'user_requested' : 'role_default'
        },
      },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set('auth-token', token, cookieOptions)

    return response

  } catch (error) {
    console.error('💥 Unexpected login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');

    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      },
      { status: 500 }
    )
  }
}

// Helper function untuk validasi redirect URL
function isValidRedirectUrl(url: string, userRole: string): boolean {
  try {
    if (!url.startsWith('/')) return false
    
    const authPages = ['/auth/login', '/auth/register']
    if (authPages.some(page => url.startsWith(page))) return false

    return true
  } catch {
    return false
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method GET tidak diizinkan. Gunakan POST untuk login.' 
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method PUT tidak diizinkan. Gunakan POST untuk login.' 
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method DELETE tidak diizinkan. Gunakan POST untuk login.' 
    },
    { status: 405 }
  )
}