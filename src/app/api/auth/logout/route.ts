import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'

/**
 * Logout endpoint - POST method
 * Menghapus auth cookie dan mengembalikan response sukses
 */
export async function POST(request: NextRequest) {
  try {
    // 📊 Opsional: Log aktivitas logout (untuk analytics)
    const user = await getCurrentUserFromRequest(request)
    if (user) {
      console.log(`🔓 User logout: ${user.email} (${user.role}) at ${new Date().toISOString()}`)
    }

    // Create response
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

    // 🍪 Hapus auth cookie dengan opsi yang sama seperti saat set
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    // 🧹 Opsional: Hapus cookie lain yang terkait auth (jika ada)
    // response.cookies.set('refresh-token', '', { maxAge: 0, path: '/' })
    // response.cookies.set('session-id', '', { maxAge: 0, path: '/' })

    return response

  } catch (error) {
    console.error('❌ Logout error:', error)

    // Tetap hapus cookie meskipun ada error
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat logout, tapi Anda tetap akan di-logout' 
      },
      { status: 500 }
    )

    // Hapus cookie bahkan jika ada error
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  }
}

/**
 * Logout endpoint - DELETE method (alternatif)
 * Beberapa client mungkin menggunakan DELETE untuk logout
 */
export async function DELETE(request: NextRequest) {
  // Redirect ke POST method untuk konsistensi
  return POST(request)
}

/**
 * GET method - untuk cek status atau info logout
 * Berguna untuk debugging atau health check
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Logout endpoint aktif',
      methods: ['POST', 'DELETE'],
      info: {
        description: 'Gunakan POST atau DELETE untuk logout',
        example: 'POST /api/auth/logout'
      }
    },
    { status: 200 }
  )
}

// Handle method not allowed
export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method PUT tidak diizinkan. Gunakan POST untuk logout.' 
    },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method PATCH tidak diizinkan. Gunakan POST untuk logout.' 
    },
    { status: 405 }
  )
}

/*
🎯 FITUR LOGOUT ENDPOINT:

✅ **Dual Method Support**
   - POST (recommended)
   - DELETE (alternative)

✅ **Secure Cookie Clearing**
   - Hapus cookie dengan opsi yang tepat
   - Expire immediately dengan maxAge: 0

✅ **Comprehensive Response**
   - Success message
   - Redirect information untuk client
   - Error handling yang robust

✅ **Logging & Analytics**
   - Log aktivitas logout untuk monitoring
   - User info untuk debugging

✅ **Error Resilience**
   - Hapus cookie bahkan jika ada error
   - Graceful error handling

✅ **Development Support**
   - GET method untuk info endpoint
   - Clear error messages untuk wrong methods

📝 CARA PENGGUNAAN DI CLIENT:

```typescript
// Dari useAuth hook
const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    
    const data = await response.json()
    if (data.success) {
      router.push(data.redirect.url)
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Tetap redirect ke login meskipun error
    router.push('/auth/login')
  }
}
```

🔒 SECURITY FEATURES:
- Cookie dihapus dengan opsi keamanan yang sama
- Tidak ada sensitive data di response
- Graceful handling untuk semua skenario error
*/