// File: src/components/course/course-preview.tsx - FIXED IMPORT STATEMENTS

'use client'

import { useState, useEffect } from 'react'

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Badge,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Avatar, AvatarFallback, AvatarImage,
  Progress,
  Alert,
  AlertDescription,
  Separator,
  ScrollArea
} from '@/components/ui'

import { 
  Play, 
  Lock, 
  Eye,
  Clock, 
  Users, 
  Star,
  BookOpen,
  Video,
  FileQuestion,
  FileText,
  Volume2,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Target,
  Award,
  Download,
  Share2,
  Heart,
  MessageSquare,
  ThumbsUp,
  BarChart3,
  PlayCircle,
  Globe
} from 'lucide-react'

// ... (semua interfaces tetap sama)
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

interface Session {
  id: string
  title: string
  description?: string
  order: number
  isFree: boolean
  duration?: number
  contents: SessionContent[]
}

interface CourseData {
  id?: string
  title: string
  description: string
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  price: number
  thumbnail?: string
  trailerUrl?: string
  freeContentLimit: number
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
}

interface CoursePreviewProps {
  courseData: CourseData
  sessions: Session[]
  viewMode?: 'instructor' | 'student' | 'admin'
  showPurchaseButton?: boolean
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
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800'
}

const MOCK_INSTRUCTOR = {
  name: 'Dr. Elena Volkov',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena', // ✅ FIXED: Use dicebear instead of placeholder
  bio: 'Native Russian speaker with 10+ years of teaching experience',
  rating: 4.8,
  students: 2547,
  courses: 12
}

const MOCK_REVIEWS = [
  {
    id: '1',
    student: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', // ✅ FIXED: Use dicebear
    rating: 5,
    comment: 'Excellent course! Very well structured and easy to follow.',
    date: '2024-01-15'
  },
  {
    id: '2',
    student: 'Maria Garcia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', // ✅ FIXED: Use dicebear
    rating: 4,
    comment: 'Great content, learned a lot about Russian grammar.',
    date: '2024-01-10'
  }
]

export default function CoursePreview({ 
  courseData, 
  sessions, 
  viewMode = 'student',
  showPurchaseButton = true 
}: CoursePreviewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [isWishlisted, setIsWishlisted] = useState(false)

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

  const getTotalStats = () => {
    const totalDuration = sessions.reduce((total, session) => 
      total + session.contents.reduce((sessionTotal, content) => 
        sessionTotal + (content.duration || 0), 0
      ), 0
    )
    
    const totalContents = sessions.reduce((total, session) => 
      total + session.contents.length, 0
    )
    
    const freeContents = sessions.reduce((total, session) => 
      total + session.contents.filter(content => content.isFree).length, 0
    )
    
    const videoCount = sessions.reduce((total, session) => 
      total + session.contents.filter(content => content.type === 'VIDEO').length, 0
    )
    
    const quizCount = sessions.reduce((total, session) => 
      total + session.contents.filter(content => content.type === 'QUIZ').length, 0
    )

    return {
      totalDuration,
      totalContents,
      freeContents,
      videoCount,
      quizCount,
      totalSessions: sessions.length
    }
  }

  const stats = getTotalStats()

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId)
    } else {
      newExpanded.add(sessionId)
    }
    setExpandedSessions(newExpanded)
  }

  const canAccessContent = (content: SessionContent) => {
    // For preview purposes, show free content logic
    return content.isFree || viewMode === 'instructor' || viewMode === 'admin'
  }

  const getPreviewYouTubeEmbed = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  // Helper function for content quality scoring
  const getContentQualityScore = () => {
    let score = 0
    let maxScore = 0
    
    // Basic info (30 points)
    maxScore += 30
    if (courseData.title && courseData.title.length >= 10) score += 10
    if (courseData.description && courseData.description.length >= 100) score += 10
    if (courseData.thumbnail || courseData.trailerUrl) score += 10
    
    // Content structure (40 points)
    maxScore += 40
    if (sessions.length >= 3) score += 20
    if (stats.totalContents >= 10) score += 10
    if (stats.totalDuration >= 120) score += 10
    
    // Content variety (30 points)
    maxScore += 30
    if (stats.videoCount > 0) score += 10
    if (stats.quizCount > 0) score += 10
    if (sessions.some(s => s.contents.some(c => c.type === 'LIVE_SESSION'))) score += 10
    
    return Math.round((score / maxScore) * 100)
  }

  // Helper function for completeness scoring
  const getCompletenessScore = () => {
    let score = 0
    let maxScore = 0
    
    // Required fields (60 points)
    maxScore += 60
    if (courseData.title) score += 15
    if (courseData.description) score += 15
    if (courseData.category) score += 15
    if (courseData.price >= 0) score += 15
    
    // Content (40 points)
    maxScore += 40
    if (sessions.length > 0) score += 20
    if (stats.totalContents > 0) score += 20
    
    return Math.round((score / maxScore) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Course Header */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {courseData.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${LEVEL_COLORS[courseData.level]}`}
                >
                  {courseData.level}
                </Badge>
                {viewMode === 'instructor' && (
                  <Badge variant="outline" className="text-xs">
                    {courseData.status}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">
                {courseData.title || 'Course Title'}
              </h1>
              
              <p className="text-lg text-gray-600">
                {courseData.description || 'Course description will appear here...'}
              </p>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">4.8</span>
                <span>(1,234 reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>2,547 students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(stats.totalDuration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{stats.totalSessions} sessions</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Russian</span>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={MOCK_INSTRUCTOR.avatar} alt={MOCK_INSTRUCTOR.name} />
                <AvatarFallback>EV</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{MOCK_INSTRUCTOR.name}</p>
                <p className="text-sm text-gray-600">{MOCK_INSTRUCTOR.bio}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{MOCK_INSTRUCTOR.rating}</span>
                  </span>
                  <span>{MOCK_INSTRUCTOR.students} students</span>
                  <span>{MOCK_INSTRUCTOR.courses} courses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Preview Card */}
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {courseData.trailerUrl ? (
                <iframe
                  src={getPreviewYouTubeEmbed(courseData.trailerUrl) || ''}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : courseData.thumbnail ? (
                <img 
                  src={courseData.thumbnail} 
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Course Preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatPrice(courseData.price)}
              </div>
              {courseData.price > 0 && (
                <p className="text-sm text-gray-600">
                  One-time payment • Lifetime access
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {viewMode === 'student' && showPurchaseButton && (
              <div className="space-y-2">
                {courseData.price === 0 ? (
                  <Button className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning for Free
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" size="lg">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Add to Cart
                    </Button>
                  </>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}

            {/* Course Includes */}
            <div className="space-y-3 text-sm">
              <h4 className="font-semibold">This course includes:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-gray-500" />
                  <span>{stats.videoCount} video lectures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileQuestion className="w-4 h-4 text-gray-500" />
                  <span>{stats.quizCount} quizzes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-gray-500" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-gray-500" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Course Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Master Russian alphabet and pronunciation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Build essential vocabulary for daily conversations</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Understand basic Russian grammar rules</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm">Practice reading and writing in Cyrillic</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span>No prior knowledge of Russian required</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span>Access to computer or mobile device</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span>Willingness to practice speaking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {courseData.description || `
                    This comprehensive Russian course is designed for complete beginners who want to start their journey 
                    learning the Russian language. Through a carefully structured curriculum, you'll master the fundamentals 
                    of Russian including the Cyrillic alphabet, essential vocabulary, basic grammar, and pronunciation.
                    
                    Our interactive approach combines video lessons, practical exercises, and quizzes to ensure 
                    you're actively engaged throughout your learning journey. By the end of this course, you'll have 
                    the confidence to engage in basic Russian conversations and continue your language learning journey.
                  `}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Course Curriculum</span>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{stats.totalSessions} sessions</span>
                  <span>{stats.totalContents} lectures</span>
                  <span>{formatDuration(stats.totalDuration)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Free Content Info */}
              {stats.freeContents > 0 && (
                <Alert className="mb-4">
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{stats.freeContents}</strong> free preview contents available. 
                    {courseData.price > 0 && ' Purchase the course to unlock all content.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sessions List */}
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No sessions added yet</p>
                  </div>
                ) : (
                  sessions.map((session, index) => (
                    <div key={session.id} className="border rounded-lg">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSessionExpansion(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">{session.title}</h3>
                              {session.description && (
                                <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                <span>{session.contents.length} lectures</span>
                                <span>{formatDuration(session.contents.reduce((total, content) => total + (content.duration || 0), 0))}</span>
                                {session.isFree && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    Free Preview
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedSessions.has(session.id) ? (
                              <span className="text-sm text-gray-500">▲</span>
                            ) : (
                              <span className="text-sm text-gray-500">▼</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Session Contents */}
                      {expandedSessions.has(session.id) && (
                        <div className="border-t bg-gray-50">
                          <div className="p-4 space-y-2">
                            {session.contents.map((content) => {
                              const ContentIcon = CONTENT_ICONS[content.type]
                              const hasAccess = canAccessContent(content)
                              
                              return (
                                <div key={content.id} className="flex items-center justify-between p-2 bg-white rounded">
                                  <div className="flex items-center space-x-3">
                                    <ContentIcon className="w-4 h-4 text-gray-500" />
                                    <div>
                                      <span className={`text-sm font-medium ${!hasAccess ? 'text-gray-400' : ''}`}>
                                        {content.title}
                                      </span>
                                      {content.description && (
                                        <p className="text-xs text-gray-500 mt-1">{content.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {content.type.replace('_', ' ')}
                                      </Badge>
                                      {content.isFree && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                                          Free
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {content.duration && (
                                      <span className="text-xs text-gray-500">
                                        {content.duration}min
                                      </span>
                                    )}
                                    {hasAccess ? (
                                      <Eye className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructor Tab */}
        <TabsContent value="instructor">
          <Card>
            <CardHeader>
              <CardTitle>Meet Your Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={MOCK_INSTRUCTOR.avatar} alt={MOCK_INSTRUCTOR.name} />
                  <AvatarFallback>EV</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{MOCK_INSTRUCTOR.name}</h3>
                  <p className="text-gray-600 mb-4">{MOCK_INSTRUCTOR.bio}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{MOCK_INSTRUCTOR.rating}</div>
                      <div className="text-sm text-gray-600">Instructor Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">1,234</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{MOCK_INSTRUCTOR.students.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{MOCK_INSTRUCTOR.courses}</div>
                      <div className="text-sm text-gray-600">Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Student Reviews</span>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold">4.8</span>
                  <span className="text-gray-600">(1,234 reviews)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Rating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm w-8">{rating} ★</span>
                      <Progress value={rating === 5 ? 75 : rating === 4 ? 20 : 5} className="flex-1" />
                      <span className="text-sm text-gray-600 w-8">
                        {rating === 5 ? '75%' : rating === 4 ? '20%' : '5%'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">4.8</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <div className="text-gray-600">Course Rating</div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Individual Reviews */}
              <div className="space-y-4">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.avatar} alt={review.student} />
                        <AvatarFallback>{review.student[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{review.student}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Mode Indicator */}
      {viewMode === 'instructor' && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            <strong>Preview Mode:</strong> This is how your course will appear to students. 
            Some features like purchase buttons and student interactions are simulated.
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Review Indicators */}
      {viewMode === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Admin Review Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Content Quality Score */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getContentQualityScore()}%
                </div>
                <div className="text-sm text-gray-600">Content Quality</div>
              </div>
              
              {/* Completeness Score */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getCompletenessScore()}%
                </div>
                <div className="text-sm text-gray-600">Completeness</div>
              </div>
              
              {/* Free Content Ratio */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.freeContents / Math.max(stats.totalContents, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Free Content</div>
              </div>
            </div>

            {/* Quality Checklist */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Quality Checklist</h4>
              <div className="space-y-2">
                <QualityCheckItem 
                  checked={courseData.title && courseData.title.length >= 10}
                  text="Course title is descriptive (10+ characters)"
                />
                <QualityCheckItem 
                  checked={courseData.description && courseData.description.length >= 100}
                  text="Course description is comprehensive (100+ characters)"
                />
                <QualityCheckItem 
                  checked={sessions.length >= 3}
                  text="Course has at least 3 sessions"
                />
                <QualityCheckItem 
                  checked={stats.videoCount >= 5}
                  text="Course has at least 5 video lectures"
                />
                <QualityCheckItem 
                  checked={stats.quizCount >= 2}
                  text="Course has at least 2 quizzes"
                />
                <QualityCheckItem 
                  checked={stats.totalDuration >= 120}
                  text="Total course duration is at least 2 hours"
                />
                <QualityCheckItem 
                  checked={stats.freeContents >= 2}
                  text="Has free preview content"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Content Warning */}
      {sessions.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>No content added yet.</strong> Add sessions and content to see the full course preview.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Quality Check Item Component
function QualityCheckItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <div className="flex items-center space-x-2">
      {checked ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      )}
      <span className={`text-sm ${checked ? 'text-gray-700' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  )
}