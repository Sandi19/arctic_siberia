// File: src/hooks/use-auth.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  avatar?: string | null
  isActive: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })
  const router = useRouter()

  // 🔄 Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setState({
          user: userData.user,
          loading: false,
          error: null
        })
      } else {
        setState({
          user: null,
          loading: false,
          error: null
        })
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setState({
        user: null,
        loading: false,
        error: 'Failed to fetch user data'
      })
    }
  }, [])

  // 🚪 Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState({
          user: data.user,
          loading: false,
          error: null
        })

        // Redirect based on role or 'from' parameter (restored from old version)
        const urlParams = new URLSearchParams(window.location.search)
        const fromUrl = urlParams.get('from')
        
        if (fromUrl && fromUrl !== '/auth/login') {
          router.push(fromUrl)
        } else {
          router.push(data.redirect_url || getRoleRedirectPath(data.user.role))
        }
        
        return { success: true, message: data.message }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.message
        }))
        return { success: false, message: data.message }
      }
    } catch (error) {
      const errorMessage = 'Terjadi kesalahan jaringan. Silakan coba lagi.'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { success: false, message: errorMessage }
    }
  }

  // 🚪 Logout function (FIXED: Restored to redirect to homepage like old version)
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Always clear state regardless of response
      setState({
        user: null,
        loading: false,
        error: null
      })

      // ✅ FIXED: Redirect to homepage instead of login page (like old version)
      router.push('/')
      
      // ✅ FIXED: Show success alert (like old version)
      // Note: You may need to implement toast/alert system for this
      console.log('Logout berhasil')
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear state even if API call fails
      setState({
        user: null,
        loading: false,
        error: null
      })
      // ✅ FIXED: Still redirect to homepage on error
      router.push('/')
      return { success: false }
    }
  }

  // 📝 Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null
        }))
        return { success: true, message: data.message }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.message
        }))
        return { success: false, message: data.message }
      }
    } catch (error) {
      const errorMessage = 'Terjadi kesalahan jaringan. Silakan coba lagi.'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { success: false, message: errorMessage }
    }
  }

  // 🔄 Refresh user data
  const refreshUser = useCallback(() => {
    fetchUser()
  }, [fetchUser])

  // Load user on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // 🔐 Role checking helpers
  const isAdmin = state.user?.role === 'ADMIN'
  const isInstructor = state.user?.role === 'INSTRUCTOR'
  const isStudent = state.user?.role === 'STUDENT'
  const isAuthenticated = !!state.user

  // 🔓 Permission helpers (NEW: Enhanced for 3-role system)
  const canCreateCourse = isAdmin || isInstructor
  const canApproveCourse = isAdmin
  const canManageUsers = isAdmin
  const canManageAllCourses = isAdmin

  return {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    
    // Auth functions
    login,
    logout,
    register,
    refreshUser,
    
    // Role checks
    isAdmin,
    isInstructor,
    isStudent,
    isAuthenticated,
    
    // Permission checks
    canCreateCourse,
    canApproveCourse,
    canManageUsers,
    canManageAllCourses,
  }
}

// 🎯 Helper function untuk redirect berdasarkan role
function getRoleRedirectPath(role: string): string {
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

/*
🎯 FIXED ISSUES:

✅ **Logout Redirect Fixed**
   - Changed from `/auth/login` back to `/` (homepage)
   - Matches behavior from old version

✅ **Maintained Enhanced Features**
   - 3-role system (ADMIN, INSTRUCTOR, STUDENT)
   - Permission helpers
   - Enhanced login with 'from' parameter support

✅ **Preserved Old Version Logic**
   - Login redirect with 'from' parameter
   - Logout to homepage
   - Success feedback (console.log for now)

🔧 TODO: 
   - Implement toast/alert system for logout success message
   - Replace console.log with proper notification
*/