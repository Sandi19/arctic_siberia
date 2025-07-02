// File: src/app/dashboard/student/page.tsx

'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardNavbar from '@/components/layout/dashboard-navbar'
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Play,
  CheckCircle,
  Star,
  Calendar,
  Target,
  Zap,
  Trophy,
  Users,
  Search,
  Filter,
  ChevronRight,
  BarChart3
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

interface EnrolledCourse {
  id: string
  title: string
  instructor: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastAccessed: string
  nextLesson: string
  rating: number
  certificate?: boolean
  thumbnail?: string
}

interface RecommendedCourse {
  id: string
  title: string
  instructor: string
  rating: number
  students: number
  price: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  thumbnail?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  rarity: 'common' | 'rare' | 'epic'
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

const CourseProgressCard: React.FC<{ course: EnrolledCourse; onContinue: (id: string) => void }> = ({ 
  course, 
  onContinue 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{course.title}</h4>
          <p className="text-sm text-gray-600">oleh {course.instructor}</p>
          <p className="text-xs text-gray-500 mt-1">Terakhir diakses: {course.lastAccessed}</p>
        </div>
        {course.certificate && (
          <Award className="w-6 h-6 text-yellow-500" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{course.completedLessons} dari {course.totalLessons} lessons</span>
          <span>{course.totalLessons - course.completedLessons} tersisa</span>
        </div>
      </div>

      {/* Next Lesson */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800 font-medium">Lesson Selanjutnya:</p>
        <p className="text-sm text-blue-700">{course.nextLesson}</p>
      </div>

      {/* Course Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-600">{course.rating}/5</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => onContinue(course.id)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <Play className="w-4 h-4" />
        <span>Lanjutkan Belajar</span>
      </button>
    </div>
  )
}

const RecommendedCourseCard: React.FC<{ course: RecommendedCourse; onEnroll: (id: string) => void }> = ({ 
  course, 
  onEnroll 
}) => {
  const levelColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 text-sm">{course.title}</h4>
        <p className="text-xs text-gray-600">oleh {course.instructor}</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[course.level]}`}>
          {course.level}
        </span>
        <span className="text-sm font-bold text-green-600">{course.price}</span>
      </div>

      <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>{course.rating}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{course.students}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{course.duration}</span>
        </div>
      </div>

      <button
        onClick={() => onEnroll(course.id)}
        className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        Lihat Detail
      </button>
    </div>
  )
}

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const rarityColors = {
    'common': 'border-gray-300 bg-gray-50',
    'rare': 'border-blue-300 bg-blue-50',
    'epic': 'border-purple-300 bg-purple-50'
  }

  return (
    <div className={`border-2 rounded-lg p-3 ${rarityColors[achievement.rarity]}`}>
      <div className="text-center">
        <div className="text-2xl mb-2">{achievement.icon}</div>
        <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
        <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
        <p className="text-xs text-gray-500 mt-2">{achievement.unlockedAt}</p>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user, loading, isStudent } = useAuth()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isStudent) {
      // Redirect non-student users
      if (user?.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else if (user?.role === 'INSTRUCTOR') {
        router.push('/dashboard/instructor')
      } else {
        router.push('/auth/login')
      }
    }
  }, [loading, isStudent, user, router])

  // Mock data - dalam implementasi nyata, fetch dari API
  useEffect(() => {
    if (isStudent) {
      setTimeout(() => {
        setEnrolledCourses([
          {
            id: '1',
            title: 'Bahasa Rusia untuk Pemula',
            instructor: 'Dr. Dmitri Volkov',
            progress: 75,
            totalLessons: 24,
            completedLessons: 18,
            lastAccessed: '2 jam yang lalu',
            nextLesson: 'Angka dan Waktu dalam Bahasa Rusia',
            rating: 4.8,
            certificate: false
          },
          {
            id: '2',
            title: 'Alfabet Cyrillic Dasar',
            instructor: 'Prof. Anna Smirnova',
            progress: 100,
            totalLessons: 12,
            completedLessons: 12,
            lastAccessed: '1 hari yang lalu',
            nextLesson: 'Kursus Selesai!',
            rating: 4.9,
            certificate: true
          },
          {
            id: '3',
            title: 'Percakapan Sehari-hari',
            instructor: 'Ivan Petrov',
            progress: 30,
            totalLessons: 20,
            completedLessons: 6,
            lastAccessed: '3 hari yang lalu',
            nextLesson: 'Berbelanja di Pasar Tradisional',
            rating: 4.7,
            certificate: false
          }
        ])

        setRecommendedCourses([
          {
            id: '4',
            title: 'Bahasa Rusia Bisnis',
            instructor: 'Dr. Elena Kozlova',
            rating: 4.8,
            students: 234,
            price: 'Rp 499.000',
            level: 'Intermediate',
            duration: '8 jam'
          },
          {
            id: '5',
            title: 'Tata Bahasa Rusia Lanjutan',
            instructor: 'Prof. Mikhail Volkov',
            rating: 4.9,
            students: 189,
            price: 'Rp 699.000',
            level: 'Advanced',
            duration: '12 jam'
          },
          {
            id: '6',
            title: 'Budaya dan Tradisi Rusia',
            instructor: 'Dr. Olga Ivanova',
            rating: 4.6,
            students: 156,
            price: 'Rp 399.000',
            level: 'Beginner',
            duration: '6 jam'
          }
        ])

        setAchievements([
          {
            id: '1',
            title: 'First Steps',
            description: 'Menyelesaikan lesson pertama',
            icon: '🎯',
            unlockedAt: '2 minggu yang lalu',
            rarity: 'common'
          },
          {
            id: '2',
            title: 'Cyrillic Master',
            description: 'Menguasai semua huruf Cyrillic',
            icon: '📝',
            unlockedAt: '1 minggu yang lalu',
            rarity: 'rare'
          },
          {
            id: '3',
            title: 'Course Completionist',
            description: 'Menyelesaikan kursus pertama',
            icon: '🏆',
            unlockedAt: '1 hari yang lalu',
            rarity: 'epic'
          }
        ])

        setLoadingData(false)
      }, 1000)
    }
  }, [isStudent])

  const handleContinueCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/learn`)
  }

  const handleEnrollCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

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

  const totalCourses = enrolledCourses.length
  const completedCourses = enrolledCourses.filter(c => c.progress === 100).length
  const avgProgress = totalCourses > 0 
    ? Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / totalCourses)
    : 0
  const certificates = enrolledCourses.filter(c => c.certificate).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navbar */}
      <DashboardNavbar role="STUDENT" />

      {/* Header 
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Siswa
              </h1>
              <p className="text-gray-600">
                Добро пожаловать, {user?.name}! 🎓
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/courses')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Jelajahi Kursus</span>
              </button>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>
      */}

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Kursus Aktif"
            value={totalCourses.toString()}
            description="kursus yang diikuti"
            icon="📚"
            color="blue"
            trend={`${totalCourses - completedCourses} sedang berlangsung`}
          />
          <StatsCard
            title="Progress Rata-rata"
            value={`${avgProgress}%`}
            description="dari semua kursus"
            icon="📈"
            color="green"
            trend="Terus semangat belajar!"
          />
          <StatsCard
            title="Kursus Selesai"
            value={completedCourses.toString()}
            description="kursus yang diselesaikan"
            icon="🏆"
            color="purple"
            trend={`${certificates} sertifikat diperoleh`}
          />
          <StatsCard
            title="Waktu Belajar"
            value="47 jam"
            description="total waktu belajar"
            icon="⏰"
            color="orange"
            trend="Minggu ini: 8 jam"
          />
        </div>

        {/* Learning Path Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span>Jalur Pembelajaran Bahasa Rusia</span>
            </h3>
            <button 
              onClick={() => router.push('/dashboard/student/progress')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Detail →
            </button>
          </div>
          
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            {/* Learning Path Steps */}
            <div className="flex items-center space-x-4 min-w-max">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  ✓
                </div>
                <span className="text-sm font-medium text-gray-900">Alfabet</span>
                <span className="text-xs text-green-600">Selesai</span>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  75%
                </div>
                <span className="text-sm font-medium text-gray-900">Dasar</span>
                <span className="text-xs text-blue-600">Sedang Belajar</span>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold mb-2">
                  30%
                </div>
                <span className="text-sm font-medium text-gray-900">Percakapan</span>
                <span className="text-xs text-gray-500">Dimulai</span>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold mb-2">
                  🔒
                </div>
                <span className="text-sm font-medium text-gray-500">Menengah</span>
                <span className="text-xs text-gray-400">Terkunci</span>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold mb-2">
                  🔒
                </div>
                <span className="text-sm font-medium text-gray-500">Lanjutan</span>
                <span className="text-xs text-gray-400">Terkunci</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Kursus yang Sedang Diikuti</h3>
            <button 
              onClick={() => router.push('/dashboard/student/courses')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua →
            </button>
          </div>
          
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.filter(c => c.progress < 100).map((course) => (
                <CourseProgressCard 
                  key={course.id} 
                  course={course} 
                  onContinue={handleContinueCourse}
                />
              ))}
            </div>
          )}
        </div>

        {/* Achievements & Study Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Pencapaian Terbaru</span>
              </h3>
              <button 
                onClick={() => router.push('/dashboard/student/achievements')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>

          {/* Study Streak */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span>Streak Belajar</span>
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">7</div>
              <p className="text-gray-600">hari berturut-turut</p>
              <p className="text-sm text-gray-500">Streak terpanjang: 14 hari</p>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{day}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < 5 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {index < 5 ? '✓' : '○'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-sm text-orange-800 font-medium">
                🔥 Luar biasa! Pertahankan konsistensi belajar Anda!
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Belajar 3 hari lagi untuk mencapai streak 10 hari.
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rekomendasi Kursus</h3>
            <button 
              onClick={() => router.push('/courses')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <RecommendedCourseCard 
                key={course.id} 
                course={course} 
                onEnroll={handleEnrollCourse}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/courses')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Jelajahi Kursus</span>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/student/progress')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Lihat Progress</span>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/student/certificates')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Award className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Sertifikat</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-6 h-6 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Jadwal Belajar</span>
            </button>
          </div>
        </div>

        {/* Study Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>Tips Belajar Hari Ini</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Focus Hari Ini</h4>
              <p className="text-sm text-gray-600">
                Latih pengucapan huruf "Ы" yang merupakan salah satu huruf paling sulit dalam alfabet Cyrillic.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">💡 Quick Tip</h4>
              <p className="text-sm text-gray-600">
                Gunakan kartu flash untuk mengingat kosakata baru. Ulangi 15 menit sebelum tidur untuk retensi yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}