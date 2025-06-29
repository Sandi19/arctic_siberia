'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      // Jika bukan admin, redirect ke dashboard yang sesuai
      if (user?.role === 'STUDENT') {
        router.push('/dashboard/student')
      } else if (user?.role === 'INSTRUCTOR') {
        router.push('/dashboard/instructor')
      } else {
        router.push('/auth/login')
      }
    }
  }, [loading, isAdmin, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-gray-600">
                Selamat datang, {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Siswa"
            value="156"
            icon="👥"
            change="+12%"
            changeType="positive"
          />
          <StatsCard
            title="Total Kursus"
            value="24"
            icon="📚"
            change="+3"
            changeType="positive"
          />
          <StatsCard
            title="Pendapatan Bulan Ini"
            value="Rp 45.2M"
            icon="💰"
            change="+18%"
            changeType="positive"
          />
          <StatsCard
            title="Rating Rata-rata"
            value="4.8"
            icon="⭐"
            change="+0.2"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              title="Buat Kursus Baru"
              description="Tambah kursus baru ke platform"
              icon="📝"
              href="/courses/create"
            />
            <ActionButton
              title="Kelola Pengguna"
              description="Lihat dan kelola semua pengguna"
              icon="👤"
              href="/users/manage"
            />
            <ActionButton
              title="Lihat Analytics"
              description="Analisis performa platform"
              icon="📊"
              href="/analytics"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            <ActivityItem
              user="Andi Wijaya"
              action="mendaftar ke kursus"
              target="Bahasa Rusia Dasar"
              time="2 jam yang lalu"
            />
            <ActivityItem
              user="Sari Dewi"
              action="menyelesaikan pelajaran"
              target="Alfabet Cyrillic"
              time="3 jam yang lalu"
            />
            <ActivityItem
              user="Budi Santoso"
              action="memberikan review"
              target="Kursus Conversation"
              time="5 jam yang lalu"
            />
            <ActivityItem
              user="Maya Putri"
              action="melakukan pembayaran"
              target="Kursus Premium"
              time="1 hari yang lalu"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Components
interface StatsCardProps {
  title: string
  value: string
  icon: string
  change: string
  changeType: 'positive' | 'negative'
}

function StatsCard({ title, value, icon, change, changeType }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="mt-4">
        <span
          className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">dari bulan lalu</span>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  title: string
  description: string
  icon: string
  href: string
}

function ActionButton({ title, description, icon, href }: ActionButtonProps) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  )
}

interface ActivityItemProps {
  user: string
  action: string
  target: string
  time: string
}

function ActivityItem({ user, action, target, time }: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">
            {user[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-900">
            <span className="font-medium">{user}</span> {action}{' '}
            <span className="font-medium">{target}</span>
          </p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
    </div>
  )
}