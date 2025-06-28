import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized - Please login' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get current user error:', error)

    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    )
  }
}

// Handle method not allowed
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method POST tidak diizinkan untuk endpoint ini' 
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