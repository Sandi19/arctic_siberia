'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MyCoursesPage() {
  const { user, loading, isStudent } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    if (!loading && !isStudent) {
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
    return null
  }

  // Sample data - in real app, fetch from API
  const allCourses = [
    {
      id: '1',
      title: 'Bahasa Rusia Dasar',
      instructor: 'Dmitri Volkov',
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      thumbnail: '🇷🇺',
      status: 'active' as const,
      lastAccessed: '2 jam lalu',
      nextLesson: 'Pelajaran 16: Angka dalam Bahasa Rusia'
    },
    {
      id: '2',
      title: 'Alfabet Cyrillic',
      instructor: 'Dmitri Volkov',
      progress: 100,
      totalLessons: 10,
      completedLessons: 10,
      thumbnail: '🔤',
      status: 'completed' as const,
      lastAccessed: '3 hari lalu',
      nextLesson: 'Kursus Selesai! 🎉'
    },
    {
      id: '3',
      title: 'Conversation Bahasa Rusia',
      instructor: 'Dmitri Volkov',
      progress: 30,
      totalLessons: 15,
      completedLessons: 4,
      thumbnail: '💬',
      status: 'active' as const,
      lastAccessed: '1 hari lalu',
      nextLesson: 'Pelajaran 5: Berbelanja di Toko'
    },
    {
      id: '4',
      title: 'Grammar Bahasa Rusia',
      instructor: 'Dmitri Volkov',
      progress: 60,
      totalLessons: 25,
      completedLessons: 15,
      thumbnail: '📝',
      status: 'active' as const,
      lastAccessed: '5 jam lalu',
      nextLesson: 'Pelajaran 16: Kasus Akkusativ'
    }
  ]

  const filteredCourses = allCourses.filter(course => {
    if (filter === 'all') return true
    return course.status === filter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kursus Saya
              </h1>
              <p className="text-gray-600">
                Kelola dan lanjutkan pembelajaran Anda
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/student')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Kursus"
            value={allCourses.length.toString()}
            description="kursus terdaftar"
            icon="📚"
          />
          <StatsCard
            title="Kursus Aktif"
            value={allCourses.filter(c => c.status === 'active').length.toString()}
            description="sedang dipelajari"
            icon="⚡"
          />
          <StatsCard
            title="Kursus Selesai"
            value={allCourses.filter(c => c.status === 'completed').length.toString()}
            description="telah diselesaikan"
            icon="✅"
          />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-1 mb-6">
            <FilterTab
              label="Semua Kursus"
              count={allCourses.length}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <FilterTab
              label="Sedang Dipelajari"
              count={allCourses.filter(c => c.status === 'active').length}
              active={filter === 'active'}
              onClick={() => setFilter('active')}
            />
            <FilterTab
              label="Selesai"
              count={allCourses.filter(c => c.status === 'completed').length}
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
            />
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada kursus
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'completed' 
                  ? 'Anda belum menyelesaikan kursus apapun'
                  : filter === 'active'
                  ? 'Anda belum memiliki kursus aktif'
                  : 'Anda belum mendaftar ke kursus apapun'
                }
              </p>
              <button
                onClick={() => router.push('/courses')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Jelajahi Kursus
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// ✅ HELPER COMPONENTS - Yang Missing di File Anda

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: string
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl">
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

interface FilterTabProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterTab({ label, count, active, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label} ({count})
    </button>
  )
}

interface Course {
  id: string
  title: string
  instructor: string
  progress: number
  totalLessons: number
  completedLessons: number
  thumbnail: string
  status: 'active' | 'completed'
  lastAccessed: string
  nextLesson: string
}

interface CourseCardProps {
  course: Course
}

function CourseCard({ course }: CourseCardProps) {
  const router = useRouter()
  
  const handleContinue = () => {
    if (course.status === 'completed') {
      // Redirect to certificate or review page
      router.push(`/courses/${course.id}/certificate`)
    } else {
      // Redirect to next lesson
      router.push(`/courses/${course.id}/learn`)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Course Header */}
      <div className="p-4 bg-white">
        <div className="flex items-start space-x-3 mb-3">
          <div className="text-3xl">{course.thumbnail}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600">oleh {course.instructor}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.status === 'completed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {course.status === 'completed' ? 'Selesai' : 'Aktif'}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress Pembelajaran</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${
                course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">
            {course.completedLessons} dari {course.totalLessons} pelajaran selesai
          </p>
        </div>

        {/* Next Lesson */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">
            {course.status === 'completed' ? 'Status:' : 'Selanjutnya:'}
          </p>
          <p className="text-sm text-gray-900">{course.nextLesson}</p>
        </div>

        {/* Last Accessed */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Terakhir diakses: {course.lastAccessed}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleContinue}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              course.status === 'completed'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {course.status === 'completed' ? 'Lihat Sertifikat' : 'Lanjutkan Belajar'}
          </button>
          <button
            onClick={() => router.push(`/courses/${course.id}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  )
}