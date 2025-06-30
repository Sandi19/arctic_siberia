// File: src/app/dashboard/instructor/page.tsx

'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardNavbar from '@/components/layout/dashboard-navbar'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Star,
  Play,
  UserCheck,
  AlertCircle,
  Calendar,
  MessageSquare,
  Award
} from 'lucide-react'

// Types
interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  trend?: string
}

interface Course {
  id: string
  title: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT'
  studentsCount: number
  lessonsCount: number
  rating: number
  earnings: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

interface Student {
  id: string
  name: string
  email: string
  progress: number
  lastActive: string
  courseName: string
}

// Components
const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <span className="text-sm text-gray-600">{trend}</span>
        </div>
      )}
    </div>
  )
}

const CourseCard: React.FC<{ course: Course; onView: (id: string) => void; onEdit: (id: string) => void }> = ({ 
  course, 
  onView, 
  onEdit 
}) => {
  const statusConfig = {
    PENDING: { 
      icon: Clock, 
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200', 
      text: 'Menunggu Review Admin',
      description: 'Kursus sedang direview oleh admin'
    },
    APPROVED: { 
      icon: CheckCircle, 
      color: 'text-green-600 bg-green-100 border-green-200', 
      text: 'Disetujui',
      description: 'Kursus sudah bisa diakses siswa'
    },
    REJECTED: { 
      icon: XCircle, 
      color: 'text-red-600 bg-red-100 border-red-200', 
      text: 'Ditolak',
      description: 'Perlu perbaikan sebelum diajukan lagi'
    },
    DRAFT: { 
      icon: Edit3, 
      color: 'text-gray-600 bg-gray-100 border-gray-200', 
      text: 'Draft',
      description: 'Belum siap untuk direview'
    }
  }

  const config = statusConfig[course.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-lg">{course.title}</h4>
        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{config.text}</span>
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{config.description}</p>

      {/* Course Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{course.studentsCount} siswa</span>
        </div>
        <div className="flex items-center space-x-2">
          <Play className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{course.lessonsCount} lessons</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-600">{course.rating}/5</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-green-600">{course.earnings}</span>
        </div>
      </div>

      {/* Status Messages */}
      {course.status === 'PENDING' && course.submittedAt && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            📋 Diajukan {course.submittedAt}. Admin akan mereview dalam 1-2 hari kerja.
          </p>
        </div>
      )}

      {course.status === 'APPROVED' && course.approvedAt && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            ✅ Disetujui {course.approvedAt}. Kursus sudah bisa diakses siswa!
          </p>
        </div>
      )}

      {course.status === 'REJECTED' && course.rejectedAt && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800 mb-2">
            ❌ Ditolak {course.rejectedAt}
          </p>
          {course.rejectionReason && (
            <p className="text-sm text-red-700 font-medium">
              Alasan: {course.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onView(course.id)}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat</span>
        </button>
        <button
          onClick={() => onEdit(course.id)}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  )
}

const StudentProgressCard: React.FC<{ student: Student }> = ({ student }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <p className="text-sm text-gray-600">{student.courseName}</p>
          <p className="text-xs text-gray-500">Terakhir aktif: {student.lastActive}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{student.progress}%</p>
        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${student.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default function InstructorDashboard() {
  const { user, loading, isInstructor } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isInstructor) {
      // Redirect non-instructor users
      if (user?.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else if (user?.role === 'STUDENT') {
        router.push('/dashboard/student')
      } else {
        router.push('/auth/login')
      }
    }
  }, [loading, isInstructor, user, router])

  // Mock data - dalam implementasi nyata, fetch dari API
  useEffect(() => {
    if (isInstructor) {
      setTimeout(() => {
        setCourses([
          {
            id: '1',
            title: 'Bahasa Rusia untuk Pemula',
            status: 'APPROVED',
            studentsCount: 89,
            lessonsCount: 24,
            rating: 4.8,
            earnings: 'Rp 26.7M',
            approvedAt: '3 hari yang lalu'
          },
          {
            id: '2',
            title: 'Alfabet Cyrillic Intensif',
            status: 'PENDING',
            studentsCount: 0,
            lessonsCount: 12,
            rating: 0,
            earnings: 'Rp 0',
            submittedAt: '1 hari yang lalu'
          },
          {
            id: '3',
            title: 'Percakapan Bahasa Rusia',
            status: 'REJECTED',
            studentsCount: 0,
            lessonsCount: 8,
            rating: 0,
            earnings: 'Rp 0',
            rejectedAt: '2 hari yang lalu',
            rejectionReason: 'Kualitas audio video kurang baik, mohon diperbaiki'
          },
          {
            id: '4',
            title: 'Tata Bahasa Rusia Lanjutan',
            status: 'DRAFT',
            studentsCount: 0,
            lessonsCount: 0,
            rating: 0,
            earnings: 'Rp 0'
          }
        ])

        setStudents([
          {
            id: '1',
            name: 'Andi Wijaya',
            email: 'andi@example.com',
            progress: 75,
            lastActive: '2 jam yang lalu',
            courseName: 'Bahasa Rusia untuk Pemula'
          },
          {
            id: '2',
            name: 'Sari Dewi',
            email: 'sari@example.com',
            progress: 45,
            lastActive: '1 hari yang lalu',
            courseName: 'Bahasa Rusia untuk Pemula'
          },
          {
            id: '3',
            name: 'Budi Santoso',
            email: 'budi@example.com',
            progress: 90,
            lastActive: '30 menit yang lalu',
            courseName: 'Bahasa Rusia untuk Pemula'
          }
        ])

        setLoadingData(false)
      }, 1000)
    }
  }, [isInstructor])

  const handleViewCourse = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}`)
  }

  const handleEditCourse = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/edit`)
  }

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

  const approvedCourses = courses.filter(c => c.status === 'APPROVED')
  const pendingCourses = courses.filter(c => c.status === 'PENDING')
  const totalStudents = courses.reduce((acc, course) => acc + course.studentsCount, 0)
  const avgRating = approvedCourses.length > 0 
    ? (approvedCourses.reduce((acc, course) => acc + course.rating, 0) / approvedCourses.length).toFixed(1)
    : '0'

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
              <button 
                onClick={() => router.push('/instructor/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Kursus</span>
              </button>
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
            value={approvedCourses.length.toString()}
            description="kursus yang disetujui"
            icon="📚"
            color="blue"
            trend={`${pendingCourses.length} menunggu review`}
          />
          <StatsCard
            title="Total Siswa"
            value={totalStudents.toString()}
            description="siswa mengikuti kursus"
            icon="👥"
            color="green"
            trend="+12 siswa baru bulan ini"
          />
          <StatsCard
            title="Rating Rata-rata"
            value={avgRating}
            description="dari 5 bintang"
            icon="⭐"
            color="orange"
            trend="Sangat baik!"
          />
          <StatsCard
            title="Pendapatan"
            value="Rp 26.7M"
            description="total dari semua kursus"
            icon="💰"
            color="purple"
            trend="+15% dari bulan lalu"
          />
        </div>

        {/* Alert for Pending/Rejected Courses */}
        {(pendingCourses.length > 0 || courses.some(c => c.status === 'REJECTED')) && (
          <div className="mb-8">
            {pendingCourses.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <span className="font-medium">
                        {pendingCourses.length} kursus sedang menunggu review admin.
                      </span>
                      {' '}Proses review biasanya memakan waktu 1-2 hari kerja.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {courses.some(c => c.status === 'REJECTED') && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">
                        Beberapa kursus ditolak dan perlu diperbaiki.
                      </span>
                      {' '}Silakan periksa feedback dari admin dan lakukan perbaikan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Kursus Saya</h3>
            <button 
              onClick={() => router.push('/instructor/courses')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua →
            </button>
          </div>
          
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onView={handleViewCourse}
                  onEdit={handleEditCourse}
                />
              ))}
            </div>
          )}
        </div>

        {/* Students & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Student Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                <span>Aktivitas Siswa Terbaru</span>
              </h3>
              <button 
                onClick={() => router.push('/instructor/students')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
              </button>
            </div>
            
            {loadingData ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {students.slice(0, 3).map((student) => (
                  <StudentProgressCard key={student.id} student={student} />
                ))}
                {students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p>Belum ada siswa yang mendaftar</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Analytics Singkat</span>
            </h3>
            
            <div className="space-y-6">
              {/* Course Performance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performa Kursus</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-gray-900">73%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </div>
              </div>

              {/* Monthly Stats */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Statistik Bulan Ini</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">24</p>
                    <p className="text-xs text-gray-600">Siswa Baru</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">18</p>
                    <p className="text-xs text-gray-600">Selesai Kursus</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">4.7</p>
                    <p className="text-xs text-gray-600">Rating Avg</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">95%</p>
                    <p className="text-xs text-gray-600">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/instructor/create')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PlusCircle className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Buat Kursus</span>
              </button>
              
              <button 
                onClick={() => router.push('/instructor/students')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-6 h-6 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Lihat Siswa</span>
              </button>
              
              <button 
                onClick={() => router.push('/instructor/analytics')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Analytics</span>
              </button>
              
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-6 h-6 text-orange-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Q&A Siswa</span>
              </button>
            </div>
          </div>

          {/* Tips for Instructors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>Tips untuk Instruktur</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Kualitas Video</p>
                  <p className="text-xs text-gray-600">Pastikan audio jernih dan pencahayaan cukup</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Struktur Pembelajaran</p>
                  <p className="text-xs text-gray-600">Buat materi berurutan dari dasar ke lanjut</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Interaksi dengan Siswa</p>
                  <p className="text-xs text-gray-600">Responsi pertanyaan dalam 24 jam</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Review Admin</p>
                  <p className="text-xs text-gray-600">Kursus baru perlu disetujui admin sebelum live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}