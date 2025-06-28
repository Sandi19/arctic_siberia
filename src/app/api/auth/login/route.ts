import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { comparePassword, generateToken, isValidEmail } from '@/lib/auth'

interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, rememberMe = false } = body

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
        },
        token, // Include token in response for client-side storage if needed
      },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set('auth-token', token, cookieOptions)

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

// Logout endpoint
export async function DELETE() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout berhasil',
      },
      { status: 200 }
    )

    // Clear auth cookie
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
      message: 'Method GET tidak diizinkan untuk endpoint ini' 
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method PUT tidak diizinkan untuk endpoint ini' 
    },
    { status: 405 }
  )
}