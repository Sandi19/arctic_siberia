import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

interface RegisterRequest {
  name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    
    // Validasi input
    const { name, email, password } = body

    // Validasi required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nama, email, dan password wajib diisi' 
        },
        { status: 400 }
      )
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Format email tidak valid' 
        },
        { status: 400 }
      )
    }

    // Validasi panjang password
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password minimal 6 karakter' 
        },
        { status: 400 }
      )
    }

    // Validasi panjang nama
    if (name.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nama minimal 2 karakter' 
        },
        { status: 400 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' 
        },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Buat user baru di database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'STUDENT', // Default role
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Response sukses (tanpa password)
    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil! Silakan login dengan akun Anda.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)

    // Handle Prisma specific errors
    if (error instanceof Error) {
      // Unique constraint violation (email sudah ada)
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email sudah terdaftar. Silakan gunakan email lain.' 
          },
          { status: 409 }
        )
      }
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan server. Silakan coba lagi nanti.' 
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

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method DELETE tidak diizinkan untuk endpoint ini' 
    },
    { status: 405 }
  )
}