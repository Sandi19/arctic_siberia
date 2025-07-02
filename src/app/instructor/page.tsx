// File: src/app/instructor/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
 Card, CardContent, CardHeader, CardTitle,
 Button,
 Input,
 Badge,
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui'

import { 
 Plus, 
 Search, 
 Filter, 
 Eye, 
 Edit, 
 Trash2, 
 Users, 
 Clock, 
 DollarSign,
 BarChart3,
 BookOpen,
 AlertCircle,
 CheckCircle,
 XCircle,
 RefreshCw
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  level: string
  price: number
  totalSessions: number
  totalDuration: number
  thumbnail?: string
  createdAt: string
  updatedAt: string
  _count: {
    enrollments: number
    reviews: number
  }
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',  
  REJECTED: 'bg-red-100 text-red-800',
  PUBLISHED: 'bg-blue-100 text-blue-800'
}

const STATUS_ICONS = {
  DRAFT: Edit,
  PENDING_REVIEW: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  PUBLISHED: Eye
}

export default function InstructorCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchCourses()
  }, [statusFilter])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      const response = await fetch(`/api/courses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
    setLoading(false)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCourses(courses.filter(course => course.id !== courseId))
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-gray-600">Manage all your courses and content</p>
        </div>
        <Button 
          onClick={() => router.push('/course-builder')}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {courses.filter(c => c.status === 'APPROVED' || c.status === 'PUBLISHED').length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {courses.reduce((total, course) => total + course._count.enrollments, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {formatPrice(courses.reduce((total, course) => total + course.price, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchCourses} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first course'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => router.push('/course-builder')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map(course => {
            const StatusIcon = STATUS_ICONS[course.status as keyof typeof STATUS_ICONS]
            
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={STATUS_COLORS[course.status as keyof typeof STATUS_COLORS]}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {course.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.totalSessions} sessions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(course.totalDuration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course._count.enrollments} students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{course.price === 0 ? 'Free' : formatPrice(course.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/courses/${course.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/course-builder?edit=${course.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/instructor/analytics?course=${course.id}`)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>

                      {(course.status === 'DRAFT' || course.status === 'REJECTED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}