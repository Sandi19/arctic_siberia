// src/app/dashboard/student/page.tsx (UPDATED dengan navbar)
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardNavbar from '@/components/layout/dashboard-navbar'

export default function StudentDashboard() {
  const { user, loading, isStudent } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isStudent) {
      // Jika bukan student, redirect ke dashboard yang sesuai
      if (user?.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else if (user?.role === 'INSTRUCTOR') {
        router.push('/dashboard/instructor')
      } else {
        router.push('/auth/login')
      }
    }
  }, [loading, isStudent, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isStudent) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navbar */}
      <DashboardNavbar role="STUDENT" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Siswa
              </h1>
              <p className="text-gray-600">
                Привет, {user?.name}! 🇷🇺
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
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ProgressCard
            title="Kursus Aktif"
            value="3"
            description="kursus sedang diambil"
            icon="📚"
            color="blue"
          />
          <ProgressCard
            title="Kursus Selesai"
            value="1"
            description="kursus telah diselesaikan"
            icon="✅"
            color="green"
          />
          <ProgressCard
            title="Jam Belajar"
            value="24"
            description="jam total pembelajaran"
            icon="⏱️"
            color="purple"
          />
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Kursus Saya
            </h2>
            <a
              href="/my-courses"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Lihat Semua →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Bahasa Rusia Dasar"
              progress={75}
              instructor="Dmitri Volkov"
              nextLesson="Pelajaran 8: Angka dalam Bahasa Rusia"
              thumbnail="🇷🇺"
            />
            <CourseCard
              title="Alfabet Cyrillic"
              progress={100}
              instructor="Dmitri Volkov"
              nextLesson="Kursus Selesai! 🎉"
              thumbnail="🔤"
              completed
            />
            <CourseCard
              title="Conversation Bahasa Rusia"
              progress={30}
              instructor="Dmitri Volkov"
              nextLesson="Pelajaran 3: Perkenalan Diri"
              thumbnail="💬"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <QuickAction
              title="Lanjutkan Belajar"
              icon="▶️"
              href="/my-courses"
              color="blue"
            />
            <QuickAction
              title="Cari Kursus Baru"
              icon="🔍"
              href="/courses"
              color="green"
            />
            <QuickAction
              title="Lihat Sertifikat"
              icon="🏆"
              href="/certificates"
              color="yellow"
            />
            <QuickAction
              title="Profil Saya"
              icon="👤"
              href="/profile"
              color="purple"
            />
          </div>
        </div>

        {/* Learning Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statistik Pembelajaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Aktivitas Mingguan</h3>
              <div className="space-y-2">
                <WeeklyActivity day="Sen" hours={2} />
                <WeeklyActivity day="Sel" hours={1.5} />
                <WeeklyActivity day="Rab" hours={3} />
                <WeeklyActivity day="Kam" hours={0} />
                <WeeklyActivity day="Jum" hours={2.5} />
                <WeeklyActivity day="Sab" hours={1} />
                <WeeklyActivity day="Min" hours={0} />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Pencapaian Terbaru</h3>
              <div className="space-y-3">
                <Achievement
                  title="Streak 7 Hari!"
                  description="Belajar 7 hari berturut-turut"
                  icon="🔥"
                  date="2 hari lalu"
                />
                <Achievement
                  title="Menguasai Alfabet"
                  description="Menyelesaikan kursus Alfabet Cyrillic"
                  icon="🎓"
                  date="1 minggu lalu"
                />
                <Achievement
                  title="Siswa Rajin"
                  description="Menyelesaikan 50 pelajaran"
                  icon="⭐"
                  date="2 minggu lalu"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Components tetap sama seperti code Anda
interface ProgressCardProps {
  title: string
  value: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple'
}

function ProgressCard({ title, value, description, icon, color }: ProgressCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  )
}

interface CourseCardProps {
  title: string
  progress: number
  instructor: string
  nextLesson: string
  thumbnail: string
  completed?: boolean
}

function CourseCard({ title, progress, instructor, nextLesson, thumbnail, completed }: CourseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-2xl">{thumbnail}</div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{instructor}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mb-3">{nextLesson}</p>
      
      <button
        className={`w-full py-2 px-3 rounded text-sm font-medium ${
          completed
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {completed ? 'Selesai' : 'Lanjutkan'}
      </button>
    </div>
  )
}

interface QuickActionProps {
  title: string
  icon: string
  href: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function QuickAction({ title, icon, href, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700'
  }

  return (
    <a
      href={href}
      className={`block p-4 rounded-lg text-center transition-colors ${colorClasses[color]}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
    </a>
  )
}

function WeeklyActivity({ day, hours }: { day: string; hours: number }) {
  const maxHours = 4
  const percentage = (hours / maxHours) * 100

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-600 w-8">{day}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-600 w-12">{hours}h</span>
    </div>
  )
}

function Achievement({ title, description, icon, date }: {
  title: string
  description: string
  icon: string
  date: string
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  )
}