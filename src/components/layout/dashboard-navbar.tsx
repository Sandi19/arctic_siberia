// File: src/components/layout/dashboard-navbar.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  GraduationCap,
  Shield,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react'

interface DashboardNavbarProps {
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  className?: string
}

// 🎯 Enhanced menu items dengan badge notifications untuk course approval workflow
const getMenuItems = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return [
        { href: '/dashboard/admin', label: 'Dashboard', icon: Home },
        { 
          href: '/dashboard/admin/courses', 
          label: 'Kelola Kursus', 
          icon: BookOpen,
          badge: '3', // ✅ NEW: Pending courses notification
          badgeColor: 'bg-orange-500'
        },
        { href: '/dashboard/admin/users', label: 'Kelola User', icon: Users },
        { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: Settings },
      ]
    
    case 'INSTRUCTOR':
      return [
        { href: '/dashboard/instructor', label: 'Dashboard', icon: Home },
        { href: '/dashboard/instructor/courses', label: 'Kursus Saya', icon: BookOpen },
        { 
          href: '/dashboard/instructor/create', 
          label: 'Buat Kursus', 
          icon: PlusCircle,
          badge: 'New', // ✅ NEW: Highlight new course creation
          badgeColor: 'bg-blue-500'
        },
        { href: '/dashboard/instructor/students', label: 'Siswa', icon: UserCheck },
        { href: '/dashboard/instructor/analytics', label: 'Analytics', icon: BarChart3 },
      ]
    
    case 'STUDENT':
      return [
        { href: '/dashboard/student', label: 'Dashboard', icon: Home },
        { href: '/dashboard/student/courses', label: 'Kursus Saya', icon: BookOpen },
        { href: '/courses', label: 'Jelajahi Kursus', icon: Search },
        { href: '/dashboard/student/progress', label: 'Progress', icon: BarChart3 },
        { href: '/dashboard/student/certificates', label: 'Sertifikat', icon: Award },
      ]
    
    default:
      return []
  }
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ role, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, logout } = useAuth() // ✅ ENHANCED: Use logout from useAuth
  const router = useRouter()

  const menuItems = getMenuItems(role)

  // ✅ ENHANCED: Better logout handling with useAuth
  const handleLogout = async () => {
    if (isLoggingOut) return
    
    try {
      setIsLoggingOut(true)
      const result = await logout()
      
      if (result.success) {
        console.log('✅ Logout berhasil')
        // useAuth will handle redirect
      } else {
        console.error('❌ Logout gagal')
        router.push('/')
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // ✅ PRESERVED: Original UI functions
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
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'INSTRUCTOR': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'STUDENT': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // ✅ NEW: Role icons for enhanced visual identification
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Shield
      case 'INSTRUCTOR': return GraduationCap
      case 'STUDENT': return User
      default: return User
    }
  }

  const RoleIcon = getRoleIcon(role)

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand - Enhanced with better logo */}
          <div className="flex items-center">
            <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center space-x-3 mr-8">
              {/* ✅ ENHANCED: Better logo with Image component fallback */}
              <div className="relative w-8 h-8">
                <Image 
                  src="/logo.png" 
                  alt="Arctic Siberia" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    // Fallback to icon if image fails
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hidden">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">Arctic Siberia</span>
            </Link>
            
            {/* ✅ ENHANCED: Role Badge with icon */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getRoleColor(role)}`}>
              <RoleIcon className="w-4 h-4" />
              <span>{getRoleLabel(role)}</span>
            </div>
          </div>

          {/* Desktop Menu - Enhanced with badges */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 relative"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {/* ✅ NEW: Badge for notifications */}
                    {item.badge && (
                      <span className={`absolute -top-1 -right-1 ${item.badgeColor || 'bg-red-500'} text-white text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[1.25rem] text-center`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Section - Enhanced notifications */}
          <div className="hidden md:flex items-center space-x-4">
            {/* ✅ ENHANCED: Notifications with role-specific indicators */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 relative">
              <Bell size={20} />
              {/* Notification indicators based on role */}
              {role === 'ADMIN' && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
              {role === 'INSTRUCTOR' && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
              {role === 'STUDENT' && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>

            {/* Profile Dropdown - Enhanced */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name || 'Profile'} 
                      width={32} 
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* ✅ ENHANCED: Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className={`inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                      <RoleIcon className="w-3 h-3" />
                      <span>{getRoleLabel(role)}</span>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Pengaturan</span>
                  </Link>

                  {/* ✅ NEW: Role-specific quick actions */}
                  {role === 'ADMIN' && (
                    <Link
                      href="/dashboard/admin/courses"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <AlertCircle size={16} />
                      <span>Review Kursus</span>
                      <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                    </Link>
                  )}

                  {role === 'INSTRUCTOR' && (
                    <Link
                      href="/dashboard/instructor/create"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <PlusCircle size={16} />
                      <span>Buat Kursus Baru</span>
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut size={16} />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ✅ ENHANCED: Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {/* Badge in mobile */}
                    {item.badge && (
                      <span className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
              
              <hr className="my-2" />
              
              {/* Mobile User Section */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={user.name || 'Profile'} 
                        width={32} 
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className={`inline-flex items-center space-x-1 mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                      <RoleIcon className="w-3 h-3" />
                      <span>{getRoleLabel(role)}</span>
                    </div>
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