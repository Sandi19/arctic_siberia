// src/components/layout/dashboard-navbar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Bell,
  Home,
  BookOpen,
  Users,
  BarChart3,
  PlusCircle,
  Award,
  Search,
  GraduationCap
} from 'lucide-react'

interface DashboardNavbarProps {
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  className?: string
}

// Menu items berdasarkan role
const getMenuItems = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return [
        { href: '/dashboard/admin', label: 'Dashboard', icon: Home },
        { href: '/dashboard/admin/courses', label: 'Kelola Kursus', icon: BookOpen },
        { href: '/dashboard/admin/users', label: 'Kelola User', icon: Users },
        { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: Settings },
      ]
    
    case 'INSTRUCTOR':
      return [
        { href: '/dashboard/instructor', label: 'Dashboard', icon: Home },
        { href: '/dashboard/instructor/courses', label: 'Kursus Saya', icon: BookOpen },
        { href: '/dashboard/instructor/create', label: 'Buat Kursus', icon: PlusCircle },
        { href: '/dashboard/instructor/students', label: 'Siswa', icon: Users },
        { href: '/dashboard/instructor/analytics', label: 'Analytics', icon: BarChart3 },
      ]
    
    case 'STUDENT':
      return [
        { href: '/dashboard/student', label: 'Dashboard', icon: Home },
        { href: '/dashboard/student/courses', label: 'Kursus Saya', icon: BookOpen },
        { href: '/dashboard/student/progress', label: 'Progress', icon: BarChart3 },
        { href: '/dashboard/student/certificates', label: 'Sertifikat', icon: Award },
        { href: '/courses', label: 'Jelajahi Kursus', icon: Search },
      ]
    
    default:
      return []
  }
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ role, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const menuItems = getMenuItems(role)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Logout berhasil')
        router.push('/?logout=success')
      } else {
        console.error('❌ Logout gagal:', data.message)
        router.push('/')
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'INSTRUCTOR': return 'Instruktur'
      case 'STUDENT': return 'Siswa'
      default: return 'User'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'INSTRUCTOR': return 'bg-blue-100 text-blue-800'
      case 'STUDENT': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Arctic Siberia</span>
            </Link>
            
            {/* Role Badge */}
            <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}>
              {getRoleLabel(role)}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Pengaturan
                  </Link>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 block px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              <hr className="my-2" />
              
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/dashboard/settings"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 text-red-700 hover:text-red-800 py-2 text-sm w-full disabled:opacity-50"
                >
                  <LogOut size={16} />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  )
}

export default DashboardNavbar