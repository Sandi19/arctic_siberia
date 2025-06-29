// src/app/dashboard/instructor/page.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardNavbar from '@/components/layout/dashboard-navbar'

export default function InstructorDashboard() {
  const { user, loading, isInstructor } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isInstructor) {
      // Jika bukan instructor, redirect ke dashboard yang sesuai
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
      {/* Dashboard Navbar */}
      <DashboardNavbar role="INSTRUCTOR" />

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
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Kursus Aktif"
            value="8"
            description="kursus yang sedang berjalan"
            icon="📚"
            color="blue"
            trend="+2 dari bulan lalu"
          />
          <StatsCard
            title="Total Siswa"
            value="245"
            description="siswa mengikuti kursus"
            icon="👥"
            color="green"
            trend="+12 siswa baru"
          />
          <StatsCard
            title="Rating Rata-rata"
            value="4.8"
            description="dari 5 bintang"
            icon="⭐"
            color="yellow"
            trend="Sangat baik!"
          />
          <StatsCard
            title="Pendapatan"
            value="Rp 8.5M"
            description="bulan ini"
            icon="💰"
            color="purple"
            trend="+15% dari bulan lalu"
          />
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Kursus yang Anda Kelola
            </h2>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                + Buat Kursus Baru
              </button>
              <a
                href="/instructor/courses"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm px-4 py-2"
              >
                Lihat Semua →
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InstructorCourseCard
              title="Bahasa Rusia Dasar"
              students={89}
              rating={4.9}
              revenue="Rp 2.1M"
              status="active"
              thumbnail="🇷🇺"
              lastActivity="2 siswa baru hari ini"
            />
            <InstructorCourseCard
              title="Alfabet Cyrillic"
              students={156}
              rating={4.7}
              revenue="Rp 3.2M"
              status="active"
              thumbnail="🔤"
              lastActivity="5 assignment menunggu"
            />
            <InstructorCourseCard
              title="Conversation Rusia Lanjutan"
              students={45}
              rating={4.8}
              revenue="Rp 1.8M"
              status="active"
              thumbnail="💬"
              lastActivity="Live session besok"
            />
            <InstructorCourseCard
              title="Grammar Rusia Menengah"
              students={0}
              rating={0}
              revenue="Rp 0"
              status="draft"
              thumbnail="📝"
              lastActivity="Siap untuk dipublikasi"
            />
          </div>
        </div>

        {/* Recent Activity & Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aktivitas Terbaru
            </h3>
            <div className="space-y-4">
              <ActivityItem
                type="new_enrollment"
                message="3 siswa baru mendaftar di 'Bahasa Rusia Dasar'"
                time="2 jam lalu"
                icon="👥"
              />
              <ActivityItem
                type="assignment_submitted"
                message="12 assignment baru perlu direview"
                time="4 jam lalu"
                icon="📝"
                actionRequired
              />
              <ActivityItem
                type="course_review"
                message="Review baru (5⭐) dari Ivan Petrov"
                time="6 jam lalu"
                icon="⭐"
              />
              <ActivityItem
                type="live_session"
                message="Live session 'Conversation Practice' selesai"
                time="1 hari lalu"
                icon="🎥"
              />
              <ActivityItem
                type="course_completion"
                message="8 siswa menyelesaikan 'Alfabet Cyrillic'"
                time="2 hari lalu"
                icon="🎓"
              />
            </div>
          </div>

          {/* Top Students */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Siswa Terbaik Bulan Ini
            </h3>
            <div className="space-y-4">
              <StudentItem
                name="Maria Doe"
                course="Bahasa Rusia Dasar"
                progress={95}
                badge="🏆"
                achievement="Siswa Terbaik"
              />
              <StudentItem
                name="John Smith"
                course="Conversation Rusia"
                progress={88}
                badge="🔥"
                achievement="Streak 30 Hari"
              />
              <StudentItem
                name="Anna Kowalski"
                course="Alfabet Cyrillic"
                progress={100}
                badge="🎓"
                achievement="Lulus dengan Sempurna"
              />
              <StudentItem
                name="David Chen"
                course="Grammar Rusia"
                progress={82}
                badge="⚡"
                achievement="Fast Learner"
              />
              <StudentItem
                name="Sarah Wilson"
                course="Bahasa Rusia Dasar"
                progress={79}
                badge="📚"
                achievement="Aktif Belajar"
              />
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Analisis Performa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Enrollment Mingguan</h3>
              <div className="space-y-2">
                <WeeklyStats day="Sen" value={12} maxValue={20} />
                <WeeklyStats day="Sel" value={8} maxValue={20} />
                <WeeklyStats day="Rab" value={15} maxValue={20} />
                <WeeklyStats day="Kam" value={6} maxValue={20} />
                <WeeklyStats day="Jum" value={18} maxValue={20} />
                <WeeklyStats day="Sab" value={20} maxValue={20} />
                <WeeklyStats day="Min" value={14} maxValue={20} />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Kursus Terpopuler</h3>
              <div className="space-y-3">
                <PopularCourse name="Alfabet Cyrillic" students={156} percentage={35} />
                <PopularCourse name="Bahasa Rusia Dasar" students={89} percentage={25} />
                <PopularCourse name="Conversation Rusia" students={45} percentage={20} />
                <PopularCourse name="Grammar Rusia" students={32} percentage={15} />
                <PopularCourse name="Budaya Rusia" students={18} percentage={5} />
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Rating Kursus</h3>
              <div className="space-y-3">
                <RatingBreakdown stars={5} count={145} percentage={82} />
                <RatingBreakdown stars={4} count={28} percentage={16} />
                <RatingBreakdown stars={3} count={3} percentage={2} />
                <RatingBreakdown stars={2} count={0} percentage={0} />
                <RatingBreakdown stars={1} count={0} percentage={0} />
              </div>
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
  description: string
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
  trend: string
}

function StatsCard({ title, value, description, icon, color, trend }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{description}</p>
      <p className="text-xs text-green-600 font-medium">{trend}</p>
    </div>
  )
}

interface InstructorCourseCardProps {
  title: string
  students: number
  rating: number
  revenue: string
  status: 'active' | 'draft' | 'archived'
  thumbnail: string
  lastActivity: string
}

function InstructorCourseCard({ title, students, rating, revenue, status, thumbnail, lastActivity }: InstructorCourseCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    active: 'Aktif',
    draft: 'Draft',
    archived: 'Arsip'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{thumbnail}</div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-600">Siswa:</span>
          <span className="font-medium ml-1">{students}</span>
        </div>
        <div>
          <span className="text-gray-600">Rating:</span>
          <span className="font-medium ml-1">{rating > 0 ? `${rating}⭐` : '-'}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Revenue:</span>
          <span className="font-medium ml-1">{revenue}</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mb-3">{lastActivity}</p>
      
      <div className="flex space-x-2">
        <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
          {status === 'draft' ? 'Publikasi' : 'Kelola'}
        </button>
        <button className="py-2 px-3 text-gray-600 hover:text-gray-800 text-sm">
          📊
        </button>
      </div>
    </div>
  )
}

function ActivityItem({ type, message, time, icon, actionRequired = false }: {
  type: string
  message: string
  time: string
  icon: string
  actionRequired?: boolean
}) {
  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg ${actionRequired ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'}`}>
      <div className="text-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">{time}</p>
        {actionRequired && (
          <button className="text-xs text-orange-600 hover:text-orange-800 font-medium mt-1">
            Tindak Lanjuti →
          </button>
        )}
      </div>
    </div>
  )
}

function StudentItem({ name, course, progress, badge, achievement }: {
  name: string
  course: string
  progress: number
  badge: string
  achievement: string
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-lg">{badge}</div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-900 text-sm">{name}</p>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
        <p className="text-xs text-gray-600">{course}</p>
        <p className="text-xs text-blue-600">{achievement}</p>
      </div>
    </div>
  )
}

function WeeklyStats({ day, value, maxValue }: { day: string; value: number; maxValue: number }) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-600 w-8">{day}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-600 w-8">{value}</span>
    </div>
  )
}

function PopularCourse({ name, students, percentage }: {
  name: string
  students: number
  percentage: number
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-600">{students} siswa</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{percentage}%</p>
        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
          <div
            className="bg-green-500 h-1 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

function RatingBreakdown({ stars, count, percentage }: {
  stars: number
  count: number
  percentage: number
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 w-6">{stars}⭐</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-600 w-8">{count}</span>
    </div>
  )
}