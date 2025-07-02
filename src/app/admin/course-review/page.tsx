// File: src/app/admin/course-review/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Badge,
  Alert,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Switch,
  ScrollArea,
  Separator
} from '@/components/ui'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter,
  Search,
  Users,
  DollarSign,
  BookOpen,
  Video,
  MessageSquare,
  Star,
  TrendingUp,
  ArrowLeft,
  FileQuestion,
  FileText,
  Volume2,
  Lock,
  Play,
  AlertTriangle,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  originalPrice?: number
  thumbnail?: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  instructor: {
    id: string
    name: string
    email: string
    phone?: string
    bio?: string
    profileImage?: string
    joinedAt: string
  }
  sessions: Session[]
  totalDuration: number
  totalSessions: number
  totalVideos: number
  totalQuizzes: number
  freeContentLimit: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  _count: {
    enrollments: number
    reviews: number
  }
  avgRating: number
  revenueShare?: number
}

interface Session {
  id: string
  title: string
  description?: string
  order: number
  isFree: boolean
  duration?: number
  contents: SessionContent[]
}

interface SessionContent {
  id: string
  type: 'VIDEO' | 'QUIZ' | 'EXERCISE' | 'LIVE_SESSION' | 'DOCUMENT' | 'AUDIO'
  title: string
  description?: string
  youtubeUrl?: string
  zoomLink?: string
  quizData?: any
  exerciseContent?: string
  materialUrl?: string
  order: number
  duration?: number
  isFree: boolean
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PUBLISHED: 'bg-blue-100 text-blue-800'
}

const CONTENT_ICONS = {
  VIDEO: Video,
  QUIZ: FileQuestion,
  EXERCISE: FileText,
  LIVE_SESSION: Users,
  DOCUMENT: FileText,
  AUDIO: Volume2
}

const LEVEL_COLORS = {
  BEGINNER: 'bg-green-50 text-green-700',
  INTERMEDIATE: 'bg-blue-50 text-blue-700',
  ADVANCED: 'bg-purple-50 text-purple-700',
  EXPERT: 'bg-red-50 text-red-700'
}

export default function AdminCourseReviewPage() {
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [revenueShare, setRevenueShare] = useState(70)
  const [submitting, setSubmitting] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchCourses()
    
    // Check URL params for specific course or filter
    const courseParam = searchParams.get('course')
    const filterParam = searchParams.get('filter')
    
    if (filterParam) {
      setStatusFilter(filterParam)
    }
    
    if (courseParam) {
      // Auto-select specific course for review
      setTimeout(() => {
        const course = courses.find(c => c.id === courseParam)
        if (course) {
          setSelectedCourse(course)
        }
      }, 1000)
    }
  }, [searchParams])

  useEffect(() => {
    applyFilters()
  }, [courses, statusFilter, categoryFilter, levelFilter, searchQuery, sortBy])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      } else {
        console.error('Failed to fetch courses')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...courses]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter.toUpperCase())
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(course => course.level === levelFilter.toUpperCase())
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'price_high':
          return b.price - a.price
        case 'price_low':
          return a.price - b.price
        case 'instructor':
          return a.instructor.name.localeCompare(b.instructor.name)
        default:
          return 0
      }
    })

    setFilteredCourses(filtered)
  }

  const handleReviewSubmit = async () => {
    if (!selectedCourse || !reviewAction) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/courses/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          action: reviewAction,
          notes: reviewNotes,
          revenueShare: reviewAction === 'approve' ? revenueShare : undefined
        })
      })

      if (response.ok) {
        setReviewDialog(false)
        setSelectedCourse(null)
        setReviewAction(null)
        setReviewNotes('')
        setRevenueShare(70)
        fetchCourses()
        
        // Show success message
        alert(`Course ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('An error occurred while submitting the review')
    }
    setSubmitting(false)
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(courses.map(course => course.category))]
    return categories.filter(Boolean)
  }

  const getUniqueLevels = () => {
    const levels = [...new Set(courses.map(course => course.level))]
    return levels.filter(Boolean)
  }

  const getStats = () => {
    const pending = courses.filter(c => c.status === 'PENDING_REVIEW').length
    const approved = courses.filter(c => c.status === 'APPROVED').length
    const rejected = courses.filter(c => c.status === 'REJECTED').length
    const published = courses.filter(c => c.status === 'PUBLISHED').length
    const draft = courses.filter(c => c.status === 'DRAFT').length
    
    return { pending, approved, rejected, published, draft, total: courses.length }
  }

  const stats = getStats()

  const parseFreeContentLimit = (limit: string) => {
    if (!limit) return { sessions: 0, videos: 0 }
    
    try {
      const parts = limit.split(',')
      const result: any = {}
      
      parts.forEach(part => {
        const [key, value] = part.split(':')
        result[key] = parseInt(value) || 0
      })
      
      return result
    } catch {
      return { sessions: 0, videos: 0 }
    }
  }

  const getContentQualityScore = (course: Course) => {
    let score = 0
    let maxScore = 0
    
    // Check basic course info (30 points)
    maxScore += 30
    if (course.title && course.title.length >= 10) score += 10
    if (course.description && course.description.length >= 100) score += 10
    if (course.thumbnail) score += 10
    
    // Check sessions (40 points)
    maxScore += 40
    if (course.sessions.length >= 3) score += 20
    if (course.sessions.some(s => s.description)) score += 10
    if (course.sessions.every(s => s.contents.length > 0)) score += 10
    
    // Check content variety (30 points)
    maxScore += 30
    if (course.totalVideos > 0) score += 10
    if (course.totalQuizzes > 0) score += 10
    if (course.sessions.some(s => s.contents.some(c => c.type === 'LIVE_SESSION'))) score += 10
    
    return Math.round((score / maxScore) * 100)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Course Review Center</h1>
            <p className="text-gray-600">Review and approve courses from instructors</p>
          </div>
        </div>
        <Button onClick={fetchCourses} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.published}</div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
                <div className="text-sm text-gray-600">Draft</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search courses, instructors, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {getUniqueLevels().map(level => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="price_high">Price High-Low</SelectItem>
                <SelectItem value="price_low">Price Low-High</SelectItem>
                <SelectItem value="instructor">Instructor A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 ml-auto">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500">No courses match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map(course => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={STATUS_COLORS[course.status]}
                      >
                        {course.status.replace('_', ' ')}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={LEVEL_COLORS[course.level as keyof typeof LEVEL_COLORS] || 'bg-gray-50 text-gray-700'}
                      >
                        {course.level}
                      </Badge>
                      
                      {/* Quality Score */}
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{getContentQualityScore(course)}%</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{course.instructor.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.sessions.length} sessions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>{course.totalVideos} videos</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileQuestion className="w-4 h-4" />
                        <span>{course.totalQuizzes} quizzes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.totalDuration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{formatPrice(course.price)}</span>
                      </div>
                    </div>

                    {/* Submission Info */}
                    <div className="text-xs text-gray-500">
                      <span>Created: {formatDate(course.createdAt)}</span>
                      {course.submittedAt && (
                        <span className="ml-4">Submitted: {formatDate(course.submittedAt)}</span>
                      )}
                      {course.approvedAt && (
                        <span className="ml-4">Approved: {formatDate(course.approvedAt)}</span>
                      )}
                      {course.rejectedAt && (
                        <span className="ml-4">Rejected: {formatDate(course.rejectedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    
                    {course.status === 'PENDING_REVIEW' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedCourse(course)
                            setReviewAction('approve')
                            setReviewDialog(true)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedCourse(course)
                            setReviewAction('reject')
                            setReviewDialog(true)
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Course Preview Dialog */}
      {selectedCourse && !reviewDialog && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span>{selectedCourse.title}</span>
                <Badge 
                  variant="outline" 
                  className={STATUS_COLORS[selectedCourse.status]}
                >
                  {selectedCourse.status.replace('_', ' ')}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{getContentQualityScore(selectedCourse)}% Quality</span>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[calc(90vh-100px)]">
              <div className="space-y-6 pr-4">
                {/* Course Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Course Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Category:</span> {selectedCourse.category}</div>
                      <div><span className="font-medium">Level:</span> {selectedCourse.level}</div>
                      <div><span className="font-medium">Price:</span> {formatPrice(selectedCourse.price)}</div>
                      {selectedCourse.originalPrice && selectedCourse.originalPrice !== selectedCourse.price && (
                        <div><span className="font-medium">Original Price:</span> <span className="line-through text-gray-500">{formatPrice(selectedCourse.originalPrice)}</span></div>
                      )}
                      <div><span className="font-medium">Duration:</span> {formatDuration(selectedCourse.totalDuration)}</div>
                      <div><span className="font-medium">Sessions:</span> {selectedCourse.sessions.length}</div>
                      <div><span className="font-medium">Videos:</span> {selectedCourse.totalVideos}</div>
                      <div><span className="font-medium">Quizzes:</span> {selectedCourse.totalQuizzes}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Instructor Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedCourse.instructor.name}</div>
                      <div><span className="font-medium">Email:</span> {selectedCourse.instructor.email}</div>
                      {selectedCourse.instructor.phone && (
                        <div><span className="font-medium">Phone:</span> {selectedCourse.instructor.phone}</div>
                      )}
                      <div><span className="font-medium">Joined:</span> {formatDate(selectedCourse.instructor.joinedAt)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Created:</span> {formatDate(selectedCourse.createdAt)}</div>
                      <div><span className="font-medium">Updated:</span> {formatDate(selectedCourse.updatedAt)}</div>
                      {selectedCourse.submittedAt && (
                        <div><span className="font-medium">Submitted:</span> {formatDate(selectedCourse.submittedAt)}</div>
                      )}
                      {selectedCourse.approvedAt && (
                        <div><span className="font-medium">Approved:</span> {formatDate(selectedCourse.approvedAt)}</div>
                      )}
                      {selectedCourse.rejectedAt && (
                        <div><span className="font-medium">Rejected:</span> {formatDate(selectedCourse.rejectedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Course Description */}
                <div>
                  <h4 className="font-semibold mb-3">Course Description</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedCourse.description}
                  </div>
                </div>

                {/* Free Content Strategy */}
                <div>
                  <h4 className="font-semibold mb-3">Free Content Strategy</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Free Content Limit:</span> {selectedCourse.freeContentLimit || 'Not specified'}
                    </div>
                    {selectedCourse.freeContentLimit && (
                      <div className="mt-2 text-xs text-gray-600">
                        {JSON.stringify(parseFreeContentLimit(selectedCourse.freeContentLimit), null, 2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Sessions */}
                <div>
                  <h4 className="font-semibold mb-3">Course Sessions ({selectedCourse.sessions.length})</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedCourse.sessions.map((session: Session, index: number) => (
                      <div key={session.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-lg">Session {index + 1}: {session.title}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {session.contents.length} items
                            </Badge>
                            {session.isFree && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Free Preview
                              </Badge>
                            )}
                            {session.duration && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {session.duration}min
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {session.description && (
                          <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                            {session.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Session Contents:</h6>
                          {session.contents.map((content: SessionContent) => {
                            const ContentIcon = CONTENT_ICONS[content.type as keyof typeof CONTENT_ICONS] || FileText
                            
                            return (
                              <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <ContentIcon className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm font-medium">{content.title}</span>
                                    {content.description && (
                                      <p className="text-xs text-gray-500 mt-1">{content.description}</p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {content.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {content.duration && (
                                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                      {content.duration}m
                                    </span>
                                  )}
                                  {content.isFree ? (
                                    <Eye className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                  {content.youtubeUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(content.youtubeUrl, '_blank')}
                                    >
                                      <Play className="w-3 h-3 mr-1" />
                                      Watch
                                    </Button>
                                  )}
                                  {content.zoomLink && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(content.zoomLink, '_blank')}
                                    >
                                      <Users className="w-3 h-3 mr-1" />
                                      Join
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Quality Analysis */}
                <div>
                  <h4 className="font-semibold mb-3">Content Quality Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Video className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCourse.sessions.reduce((total, session) => 
                          total + session.contents.filter(c => c.type === 'VIDEO').length, 0
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Video Contents</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <FileQuestion className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCourse.sessions.reduce((total, session) => 
                          total + session.contents.filter(c => c.type === 'QUIZ').length, 0
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Quiz Contents</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCourse.sessions.reduce((total, session) => 
                          total + session.contents.filter(c => c.type === 'LIVE_SESSION').length, 0
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Live Sessions</div>
                    </div>

                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedCourse.sessions.reduce((total, session) => 
                          total + session.contents.filter(c => c.type === 'DOCUMENT' || c.type === 'EXERCISE').length, 0
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Documents/Exercises</div>
                    </div>
                  </div>

                  {/* Quality Score Breakdown */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium mb-2">Quality Score Breakdown</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Title & Description Quality:</span>
                        <span className="font-medium">
                          {selectedCourse.title.length >= 10 && selectedCourse.description.length >= 100 ? '✅ Good' : '❌ Needs Improvement'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Session Structure:</span>
                        <span className="font-medium">
                          {selectedCourse.sessions.length >= 3 ? '✅ Good' : '❌ Too Few Sessions'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content Variety:</span>
                        <span className="font-medium">
                          {selectedCourse.totalVideos > 0 && selectedCourse.totalQuizzes > 0 ? '✅ Good' : '❌ Limited Variety'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overall Quality Score:</span>
                        <span className="font-bold text-lg">
                          {getContentQualityScore(selectedCourse)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous Review History */}
                {selectedCourse.rejectionReason && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Previous Rejection Reason
                    </h4>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm text-red-800">{selectedCourse.rejectionReason}</p>
                      {selectedCourse.rejectedAt && (
                        <p className="text-xs text-red-600 mt-2">
                          Rejected on: {formatDate(selectedCourse.rejectedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedCourse.status === 'PENDING_REVIEW' && (
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewAction('reject')
                        setReviewDialog(true)
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Course
                    </Button>
                    <Button
                      onClick={() => {
                        setReviewAction('approve')
                        setReviewDialog(true)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Course
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Action Dialog */}
      {reviewDialog && selectedCourse && reviewAction && (
        <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {reviewAction === 'approve' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>
                  {reviewAction === 'approve' ? 'Approve Course' : 'Reject Course'}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  You are about to <strong>{reviewAction}</strong> the course "{selectedCourse.title}" by {selectedCourse.instructor.name}
                </AlertDescription>
              </Alert>

              {reviewAction === 'approve' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Revenue Share Percentage for Instructor
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={revenueShare}
                        onChange={(e) => setRevenueShare(parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Instructor will receive {revenueShare}% of revenue, platform gets {100 - revenueShare}%
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Estimated Monthly Revenue:</strong><br />
                      Course Price: {formatPrice(selectedCourse.price)}<br />
                      Instructor Share: {formatPrice(selectedCourse.price * revenueShare / 100)}<br />
                      Platform Share: {formatPrice(selectedCourse.price * (100 - revenueShare) / 100)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'Add any notes or feedback for the instructor...'
                      : 'Please provide a detailed reason for rejection to help the instructor improve their course...'
                  }
                  rows={4}
                  className="resize-none"
                />
                {reviewAction === 'reject' && (
                  <p className="text-xs text-gray-500">
                    Be specific about what needs to be improved. This will help the instructor resubmit a better version.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setReviewDialog(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={reviewAction === 'reject' ? 'destructive' : 'default'}
                  disabled={submitting || (reviewAction === 'reject' && !reviewNotes.trim())}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {reviewAction === 'approve' ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {reviewAction === 'approve' ? 'Approve Course' : 'Reject Course'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}