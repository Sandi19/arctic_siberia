// File: src/components/layout/dashboard-navbar.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
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
  AlertCircle,
  Wrench,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  Heart,
  Star
} from 'lucide-react'

interface DashboardNavbarProps {
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  className?: string
}

// 🎯 Enhanced menu items dengan beautiful icons dan proper navigation
const getMenuItems = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return [
        { 
          href: '/dashboard/admin', 
          label: 'Dashboard', 
          icon: Home,
          description: 'Overview & analytics'
        },
        { 
          href: '/dashboard/admin/courses', 
          label: 'Review Courses', 
          icon: CheckCircle,
          badge: '3', 
          badgeColor: 'bg-orange-500',
          description: 'Approve pending courses'
        },
        { 
          href: '/dashboard/admin/users', 
          label: 'Manage Users', 
          icon: Users,
          description: 'User management'
        },
        { 
          href: '/dashboard/admin/analytics', 
          label: 'Platform Analytics', 
          icon: TrendingUp,
          description: 'System insights'
        },
        { 
          href: '/course-builder', 
          label: 'Create Course', 
          icon: Wrench,
          badge: 'Pro',
          badgeColor: 'bg-purple-500',
          description: 'Advanced course creation'
        },
      ]
    
    case 'INSTRUCTOR':
      return [
        { 
          href: '/dashboard/instructor', 
          label: 'Dashboard', 
          icon: Home,
          description: 'Your overview'
        },
        { 
          href: '/dashboard/instructor/courses', 
          label: 'My Courses', 
          icon: BookOpen,
          description: 'Manage your content'
        },
        { 
          href: '/course-builder', 
          label: 'Create Course', 
          icon: Wrench,
          badge: 'Pro',
          badgeColor: 'bg-purple-500',
          description: 'Advanced course creation'
        },
        { 
          href: '/dashboard/instructor/students', 
          label: 'Students', 
          icon: UserCheck,
          description: 'Your enrolled students'
        },
        { 
          href: '/dashboard/instructor/analytics', 
          label: 'Analytics', 
          icon: BarChart3,
          description: 'Course performance'
        },
      ]
    
    case 'STUDENT':
      return [
        { 
          href: '/dashboard/student', 
          label: 'Dashboard', 
          icon: Home,
          description: 'Your learning hub'
        },
        { 
          href: '/dashboard/student/courses', 
          label: 'My Courses', 
          icon: BookOpen,
          description: 'Continue learning'
        },
        { 
          href: '/courses', 
          label: 'Explore Courses', 
          icon: Search,
          badge: 'Hot',
          badgeColor: 'bg-red-500',
          description: 'Discover new skills'
        },
        { 
          href: '/dashboard/student/progress', 
          label: 'Progress', 
          icon: TrendingUp,
          description: 'Track your learning'
        },
        { 
          href: '/dashboard/student/certificates', 
          label: 'Certificates', 
          icon: Award,
          description: 'Your achievements'
        },
      ]
    
    default:
      return []
  }
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ role, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications] = useState(3) // Mock notification count
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const menuItems = getMenuItems(role)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard/admin' || href === '/dashboard/instructor' || href === '/dashboard/student') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'from-red-500 to-pink-500'
      case 'INSTRUCTOR': return 'from-blue-500 to-purple-600'
      case 'STUDENT': return 'from-green-500 to-blue-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return { icon: Shield, label: 'Admin', color: 'bg-red-100 text-red-700' }
      case 'INSTRUCTOR': return { icon: GraduationCap, label: 'Instructor', color: 'bg-blue-100 text-blue-700' }
      case 'STUDENT': return { icon: User, label: 'Student', color: 'bg-green-100 text-green-700' }
      default: return { icon: User, label: 'User', color: 'bg-gray-100 text-gray-700' }
    }
  }

  const roleBadge = getRoleBadge(role)

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 pt-5 pb-3 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getRoleColor(role)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Arctic Siberia
                </div>
                <div className="text-xs text-gray-500 -mt-1">Learning Platform</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center px-4 py-2 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                    ${item.isSpecial ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.isSpecial ? 'text-white' : ''}`} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${item.isSpecial ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                    <span className={`text-xs ${item.isSpecial ? 'text-blue-100' : 'text-gray-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      {item.description}
                    </span>
                  </div>
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className={`
                      ml-2 px-2 py-1 text-xs font-medium rounded-full text-white
                      ${item.badgeColor?.includes('gradient') ? item.badgeColor : item.badgeColor || 'bg-blue-500'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side - Profile & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleColor(role)} flex items-center justify-center shadow-md`}>
                    <roleBadge.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${roleBadge.color} inline-block`}>
                      {roleBadge.label}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRoleColor(role)} flex items-center justify-center`}>
                        <roleBadge.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${roleBadge.color} inline-block mt-1`}>
                          {roleBadge.label}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Preferences
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                      ${item.isSpecial ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${item.isSpecial ? 'text-white' : ''}`} />
                      <div>
                        <div className={`font-medium ${item.isSpecial ? 'text-white' : ''}`}>
                          {item.label}
                        </div>
                        <div className={`text-xs ${item.isSpecial ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full text-white
                        ${item.badgeColor?.includes('gradient') ? 'bg-blue-500' : item.badgeColor || 'bg-blue-500'}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Background overlay for mobile menu */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  )
}

export default DashboardNavbar