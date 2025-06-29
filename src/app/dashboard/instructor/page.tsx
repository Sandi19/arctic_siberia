'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function InstructorDashboard() {
  const { user, loading, isInstructor } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isInstructor) {
      if (user?.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else if (user?.role === 'STUDENT') {
        router.push('/dashboard/student')
      } else {
        router.push('/auth/login')
      }
    }
  }, [loading, isInstructor, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isInstructor) {
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
                Dashboard Instruktur
              </h1>
              <p className="text-gray-600">
                Добро пожаловать, {user?.name}! 👨‍🏫
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
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
            value="89"
            icon="👥"
            change="+5"
            changeType="positive"
          />
          <StatsCard
            title="Kursus Aktif"
            value="6"
            icon="📚"
            change="+1"
            changeType="positive"
          />
          <StatsCard
            title="Rating Rata-rata"
            value="4.9"
            icon="⭐"
            change="+0.1"
            changeType="positive"
          />
          <StatsCard
            title="Pendapatan Bulan Ini"
            value="Rp 12.5M"
            icon="💰"
            change="+15%"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionButton
              title="Buat Kursus Baru"
              description="Mulai kursus baru"
              icon="➕"
              href="/courses/create"
              color="blue"
            />
            <ActionButton
              title="Kelola Kursus"
              description="Edit kursus yang ada"
              icon="⚙️"
              href="/my-classes"
              color="green"
            />
            <ActionButton
              title="Lihat Analytics"
              description="Analisis performa"
              icon="📊"
              href="/course-analytics"
              color="purple"
            />
            <ActionButton
              title="Pesan Siswa"
              description="Lihat pesan masuk"
              icon="💬"
              href="/messages"
              color="orange"
            />
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Kursus Saya
            </h2>
            <a
              href="/my-classes"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Lihat Semua →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InstructorCourseCard
              title="Bahasa Rusia Dasar"
              students={35}
              rating={4.8}
              revenue="Rp 8.5M"
              status="active"
              thumbnail="🇷🇺"
            />
            <InstructorCourseCard
              title="Alfabet Cyrillic"
              students={28}
              rating={4.9}
              revenue="Rp 5.2M"
              status="active"
              thumbnail="🔤"
            />
            <InstructorCourseCard
              title="Conversation Bahasa Rusia"
              students={15}
              rating={4.7}
              revenue="Rp 3.8M"
              status="active"
              thumbnail="💬"
            />
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aktivitas Terbaru
            </h2>
            <div className="space-y-4">
              <ActivityItem
                user="Andi Wijaya"
                action="menyelesaikan pelajaran"
                target="Alfabet Cyrillic - Pelajaran 5"
                time="1 jam lalu"
                type="completion"
              />
              <ActivityItem
                user="Sari Dewi"
                action="memberikan review"
                target="Bahasa Rusia Dasar"
                time="3 jam lalu"
                type="review"
                rating={5}
              />
              <ActivityItem
                user="Budi Santoso"
                action="bergabung dengan kursus"
                target="Conversation Bahasa Rusia"
                time="5 jam lalu"
                type="enrollment"
              />
              <ActivityItem
                user="Maya Putri"
                action="mengajukan pertanyaan"
                target="Grammar Bahasa Rusia"
                time="1 hari lalu"
                type="question"
              />
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Performa
            </h2>
            <div className="space-y-4">
              <PerformanceMetric
                label="Tingkat Penyelesaian Kursus"
                value="87%"
                trend="+5%"
                trendType="positive"
              />
              <PerformanceMetric
                label="Rata-rata Waktu Belajar per Siswa"
                value="45 menit"
                trend="+8 menit"
                trendType="positive"
              />
              <PerformanceMetric
                label="Tingkat Kepuasan Siswa"
                value="4.8/5.0"
                trend="+0.2"
                trendType="positive"
              />
              <PerformanceMetric
                label="Pertumbuhan Siswa Baru"
                value="12 siswa"
                trend="+3"
                trendType="positive"
              />
            </div>
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
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function ActionButton({ title, description, icon, href, color }: ActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700'
  }

  return (
    <a
      href={href}
      className={`block p-4 rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-xs opacity-80">{description}</p>
      </div>
    </a>
  )
}

interface InstructorCourseCardProps {
  title: string
  students: number
  rating: number
  revenue: string
  status: 'active' | 'draft'
  thumbnail: string
}

function InstructorCourseCard({ title, students, rating, revenue, status, thumbnail }: InstructorCourseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-2xl">{thumbnail}</div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {status === 'active' ? 'Aktif' : 'Draft'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Siswa:</span>
          <span className="font-medium">{students}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Rating:</span>
          <span className="font-medium flex items-center">
            ⭐ {rating}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pendapatan:</span>
          <span className="font-medium text-green-600">{revenue}</span>
        </div>
      </div>
      
      <button className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
        Kelola Kursus
      </button>
    </div>
  )
}

interface ActivityItemProps {
  user: string
  action: string
  target: string
  time: string
  type: 'completion' | 'review' | 'enrollment' | 'question'
  rating?: number
}

function ActivityItem({ user, action, target, time, type, rating }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'completion': return '✅'
      case 'review': return '⭐'
      case 'enrollment': return '👋'
      case 'question': return '❓'
      default: return '📝'
    }
  }

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className="text-lg">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{user}</span> {action}{' '}
          <span className="font-medium">{target}</span>
          {rating && <span className="text-yellow-500 ml-1">({rating}⭐)</span>}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

interface PerformanceMetricProps {
  label: string
  value: string
  trend: string
  trendType: 'positive' | 'negative'
}

function PerformanceMetric({ label, value, trend, trendType }: PerformanceMetricProps) {
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
      <span
        className={`text-sm font-medium ${
          trendType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {trend}
      </span>
    </div>
  )
}