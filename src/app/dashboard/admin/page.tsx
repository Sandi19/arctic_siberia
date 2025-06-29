// src/app/dashboard/admin/page.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardNavbar from '@/components/layout/dashboard-navbar'

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      // Jika bukan admin, redirect ke dashboard yang sesuai
      if (user?.role === 'INSTRUCTOR') {
        router.push('/dashboard/instructor')
      } else if (user?.role === 'STUDENT') {
        router.push('/dashboard/student')
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
      {/* Dashboard Navbar */}
      <DashboardNavbar role="ADMIN" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Добро пожаловать, {user?.name}! Система управления Arctic Siberia 🛡️
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Pengguna"
            value="1,247"
            description="pengguna terdaftar"
            icon="👥"
            color="blue"
            trend="+48 bulan ini"
            percentage={12}
          />
          <MetricCard
            title="Total Kursus"
            value="89"
            description="kursus tersedia"
            icon="📚"
            color="green"
            trend="+7 kursus baru"
            percentage={8}
          />
          <MetricCard
            title="Pendapatan"
            value="Rp 142.5M"
            description="bulan ini"
            icon="💰"
            color="purple"
            trend="+23% dari bulan lalu"
            percentage={23}
          />
          <MetricCard
            title="Active Users"
            value="892"
            description="aktif 30 hari terakhir"
            icon="⚡"
            color="orange"
            trend="71% retention rate"
            percentage={71}
          />
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Pengguna
            </h3>
            <div className="space-y-4">
              <UserDistribution role="Student" count={1089} percentage={87} color="green" />
              <UserDistribution role="Instructor" count={143} percentage={12} color="blue" />
              <UserDistribution role="Admin" count={15} percentage={1} color="red" />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Registrasi Mingguan</h4>
              <div className="space-y-2">
                <WeeklyRegistration day="Sen" students={12} instructors={2} />
                <WeeklyRegistration day="Sel" students={8} instructors={1} />
                <WeeklyRegistration day="Rab" students={15} instructors={3} />
                <WeeklyRegistration day="Kam" students={6} instructors={0} />
                <WeeklyRegistration day="Jum" students={18} instructors={1} />
                <WeeklyRegistration day="Sab" students={22} instructors={4} />
                <WeeklyRegistration day="Min" students={14} instructors={2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Instruktur
            </h3>
            <div className="space-y-4">
              <TopInstructor
                name="Dmitri Volkov"
                courses={12}
                students={456}
                rating={4.9}
                revenue="Rp 8.5M"
              />
              <TopInstructor
                name="Elena Petrov"
                courses={8}
                students={289}
                rating={4.8}
                revenue="Rp 6.2M"
              />
              <TopInstructor
                name="Ivan Kozlov"
                courses={6}
                students={178}
                rating={4.7}
                revenue="Rp 4.1M"
              />
              <TopInstructor
                name="Natasha Romanov"
                courses={5}
                students={134}
                rating={4.9}
                revenue="Rp 3.8M"
              />
            </div>
            
            <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua Instruktur →
            </button>
          </div>
        </div>

        {/* Recent Activities & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Aktivitas Sistem
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Lihat Log →
              </button>
            </div>
            <div className="space-y-4">
              <SystemActivity
                type="user_registration"
                message="24 pengguna baru terdaftar hari ini"
                time="Just now"
                icon="👤"
                priority="normal"
              />
              <SystemActivity
                type="course_published"
                message="Kursus 'Advanced Russian Grammar' dipublikasi"
                time="2 jam lalu"
                icon="📚"
                priority="normal"
              />
              <SystemActivity
                type="payment_processed"
                message="89 pembayaran berhasil diproses"
                time="4 jam lalu"
                icon="💳"
                priority="normal"
              />
              <SystemActivity
                type="system_maintenance"
                message="Maintenance server dijadwalkan besok"
                time="6 jam lalu"
                icon="🔧"
                priority="high"
              />
              <SystemActivity
                type="instructor_approved"
                message="2 aplikasi instruktur disetujui"
                time="1 hari lalu"
                icon="✅"
                priority="normal"
              />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Sistem
            </h3>
            <div className="space-y-4">
              <SystemStatus
                service="API Server"
                status="operational"
                uptime="99.9%"
                lastCheck="2 menit lalu"
              />
              <SystemStatus
                service="Database"
                status="operational"
                uptime="99.8%"
                lastCheck="2 menit lalu"
              />
              <SystemStatus
                service="CDN"
                status="operational"
                uptime="100%"
                lastCheck="1 menit lalu"
              />
              <SystemStatus
                service="Payment Gateway"
                status="degraded"
                uptime="98.5%"
                lastCheck="5 menit lalu"
              />
              <SystemStatus
                service="Email Service"
                status="operational"
                uptime="99.7%"
                lastCheck="3 menit lalu"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Server Resources</h4>
              <div className="space-y-3">
                <ResourceUsage label="CPU Usage" percentage={45} color="blue" />
                <ResourceUsage label="Memory" percentage={62} color="green" />
                <ResourceUsage label="Storage" percentage={34} color="purple" />
                <ResourceUsage label="Bandwidth" percentage={28} color="orange" />
              </div>
            </div>
          </div>
        </div>

        {/* Course Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Manajemen Kursus
            </h3>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                + Tambah Kursus
              </button>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2">
                Kelola Kategori
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CourseStats title="Published" count={89} color="green" />
            <CourseStats title="Draft" count={12} color="yellow" />
            <CourseStats title="Under Review" count={5} color="blue" />
            <CourseStats title="Archived" count={23} color="gray" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kursus
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instruktur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <CourseRow
                  title="Bahasa Rusia Dasar"
                  instructor="Dmitri Volkov"
                  students={456}
                  revenue="Rp 12.3M"
                  status="published"
                />
                <CourseRow
                  title="Alfabet Cyrillic"
                  instructor="Elena Petrov"
                  students={289}
                  revenue="Rp 8.7M"
                  status="published"
                />
                <CourseRow
                  title="Advanced Grammar"
                  instructor="Ivan Kozlov"
                  students={0}
                  revenue="Rp 0"
                  status="review"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overview Keuangan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Revenue Bulanan</h4>
              <div className="space-y-2">
                <MonthlyRevenue month="Jun 2025" amount="Rp 142.5M" growth={23} />
                <MonthlyRevenue month="May 2025" amount="Rp 115.8M" growth={18} />
                <MonthlyRevenue month="Apr 2025" amount="Rp 98.2M" growth={12} />
                <MonthlyRevenue month="Mar 2025" amount="Rp 87.6M" growth={8} />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Revenue Courses</h4>
              <div className="space-y-2">
                <RevenueCourse title="Bahasa Rusia Dasar" amount="Rp 24.5M" />
                <RevenueCourse title="Conversation Practice" amount="Rp 18.3M" />
                <RevenueCourse title="Grammar Advanced" amount="Rp 15.7M" />
                <RevenueCourse title="Russian Culture" amount="Rp 12.1M" />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
              <div className="space-y-2">
                <PaymentMethod method="Credit Card" percentage={45} amount="Rp 64.1M" />
                <PaymentMethod method="Bank Transfer" percentage={30} amount="Rp 42.8M" />
                <PaymentMethod method="E-Wallet" percentage={20} amount="Rp 28.5M" />
                <PaymentMethod method="Others" percentage={5} amount="Rp 7.1M" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Components
interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  trend: string
  percentage: number
}

function MetricCard({ title, value, description, icon, color, trend, percentage }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
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
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-green-600 font-medium">{trend}</p>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">{percentage}%</span>
          <div className="w-8 bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserDistribution({ role, count, percentage, color }: {
  role: string
  count: number
  percentage: number
  color: 'green' | 'blue' | 'red'
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500'
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></div>
        <span className="font-medium text-gray-900">{role}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{count}</span>
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
      </div>
    </div>
  )
}

// Tambahkan komponen helper lainnya...
function WeeklyRegistration({ day, students, instructors }: {
  day: string
  students: number
  instructors: number
}) {
  const total = students + instructors
  const maxTotal = 25

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-600 w-8">{day}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${(students / maxTotal) * 100}%` }}
        ></div>
        <div
          className="bg-blue-500 h-2 rounded-full absolute top-0"
          style={{ 
            left: `${(students / maxTotal) * 100}%`,
            width: `${(instructors / maxTotal) * 100}%` 
          }}
        ></div>
      </div>
      <span className="text-sm text-gray-600 w-12">{total}</span>
    </div>
  )
}

function TopInstructor({ name, courses, students, rating, revenue }: {
  name: string
  courses: number
  students: number
  rating: number
  revenue: string
}) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-600">{courses} kursus • {students} siswa</p>
        <p className="text-xs text-yellow-600">{rating}⭐ • {revenue}</p>
      </div>
      <button className="text-blue-600 hover:text-blue-800 text-xs">
        Detail
      </button>
    </div>
  )
}

function SystemActivity({ type, message, time, icon, priority }: {
  type: string
  message: string
  time: string
  icon: string
  priority: 'normal' | 'high'
}) {
  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg ${
      priority === 'high' ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
    }`}>
      <div className="text-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

function SystemStatus({ service, status, uptime, lastCheck }: {
  service: string
  status: 'operational' | 'degraded' | 'down'
  uptime: string
  lastCheck: string
}) {
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500'
  }

  const statusLabels = {
    operational: 'Operational',
    degraded: 'Degraded',
    down: 'Down'
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
        <div>
          <p className="text-sm font-medium text-gray-900">{service}</p>
          <p className="text-xs text-gray-500">Last check: {lastCheck}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-900">{statusLabels[status]}</p>
        <p className="text-xs text-gray-500">{uptime}</p>
      </div>
    </div>
  )
}

function ResourceUsage({ label, percentage, color }: {
  label: string
  percentage: number
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
      </div>
    </div>
  )
}

function CourseStats({ title, count, color }: {
  title: string
  count: number
  color: 'green' | 'yellow' | 'blue' | 'gray'
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium">{title}</p>
    </div>
  )
}

function CourseRow({ title, instructor, students, revenue, status }: {
  title: string
  instructor: string
  students: number
  revenue: string
  status: 'published' | 'draft' | 'review'
}) {
  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    review: 'bg-blue-100 text-blue-800'
  }

  const statusLabels = {
    published: 'Published',
    draft: 'Draft',
    review: 'Under Review'
  }

  return (
    <tr>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{title}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{instructor}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{students}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{revenue}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
        <button className="text-red-600 hover:text-red-900">Delete</button>
      </td>
    </tr>
  )
}

function MonthlyRevenue({ month, amount, growth }: {
  month: string
  amount: string
  growth: number
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{month}</p>
        <p className="text-xs text-gray-500">{amount}</p>
      </div>
      <div className="flex items-center space-x-1">
        <span className={`text-xs font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth > 0 ? '+' : ''}{growth}%
        </span>
        <span className="text-xs text-gray-400">
          {growth > 0 ? '↗' : '↘'}
        </span>
      </div>
    </div>
  )
}

function RevenueCourse({ title, amount }: {
  title: string
  amount: string
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-900">{title}</p>
      <p className="text-sm font-medium text-gray-900">{amount}</p>
    </div>
  )
}

function PaymentMethod({ method, percentage, amount }: {
  method: string
  percentage: number
  amount: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-900">{method}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{percentage}%</p>
        <p className="text-xs text-gray-500">{amount}</p>
      </div>
    </div>
  )
}