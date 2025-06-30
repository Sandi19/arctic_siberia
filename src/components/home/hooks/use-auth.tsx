// src/hooks/useAuth.ts
'use client'

import { useState, useEffect } from 'react'
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
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  // Check auth status
  const checkAuth = async () => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAuth({
            user: data.user,
            loading: false,
            error: null,
          })
        } else {
          setAuth({
            user: null,
            loading: false,
            error: data.message,
          })
        }
      } else {
        setAuth({
          user: null,
          loading: false,
          error: 'Unauthorized',
        })
      }
    } catch (error) {
      setAuth({
        user: null,
        loading: false,
        error: 'Network error',
      })
    }
  }

  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setAuth({
          user: data.user,
          loading: false,
          error: null,
        })

        // Redirect based on role or 'from' parameter
        const urlParams = new URLSearchParams(window.location.search)
        const fromUrl = urlParams.get('from')
        
        if (fromUrl && fromUrl !== '/auth/login') {
          router.push(fromUrl)
        } else {
          router.push(data.redirect_url || '/dashboard')
        }

        return { success: true }
      } else {
        setAuth(prev => ({
          ...prev,
          loading: false,
          error: data.message,
        }))
        return { success: false, message: data.message }
      }
    } catch (error) {
      const errorMessage = 'Network error'
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      return { success: false, message: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuth({
        user: null,
        loading: false,
        error: null,
      })
      router.push('/auth/login')
    }
  }

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    login,
    logout,
    refetch: checkAuth,
    isAdmin: auth.user?.role === 'ADMIN',
    isStudent: auth.user?.role === 'STUDENT',
    isInstructor: auth.user?.role === 'INSTRUCTOR',
  }
}