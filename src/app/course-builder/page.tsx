// File: src/app/course-builder/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

// ✅ PRESERVED: Original UI imports
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui'

import { 
  Save, 
  Eye, 
  Send, 
  Plus, 
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  DollarSign,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Lock,
  ArrowLeft
} from 'lucide-react'

import SessionBuilder from '@/components/course/session-builder'
import CoursePreview from '@/components/course/course-preview'
import BasicInfoForm from '@/components/course/basic-info-form'
import PricingForm from '@/components/course/pricing-form'

// ✅ PRESERVED: Original interfaces
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

const CATEGORIES = [
  'Russian Grammar',
  'Russian Vocabulary', 
  'Russian Pronunciation',
  'Russian Conversation',
  'Russian Literature',
  'Russian Culture',
  'Business Russian',
  'Russian for Beginners'
]

export default function CourseBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, isInstructor, isAdmin } = useAuth()
  
  // ✅ NEW: Authentication & authorization states
  const [authChecked, setAuthChecked] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const editCourseId = searchParams.get('edit')
  const isEditing = !!editCourseId

  // ✅ PRESERVED: Original course builder states
  const [activeTab, setActiveTab] = useState('basic')
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category: '',
    level: 'BEGINNER',
    price: 0,
    freeContentLimit: 3,
    status: 'DRAFT'
  })
  const [sessions, setSessions] = useState<any[]>([])
  const [courseLoading, setCourseLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // ✅ NEW: Authentication & authorization check
  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return

      // 1. Check if user is logged in
      if (!user) {
        router.push('/auth/login?from=/course-builder')
        return
      }

      // 2. Check if user has proper role (INSTRUCTOR or ADMIN)
      if (!isInstructor && !isAdmin) {
        setPermissionError('Access denied. Only instructors and administrators can access the course builder.')
        setHasPermission(false)
        setAuthChecked(true)
        return
      }

      // 3. If editing, check ownership
      if (isEditing && editCourseId) {
        try {
          const response = await fetch(`/api/courses/${editCourseId}`, {
            credentials: 'include'
          })

          if (!response.ok) {
            if (response.status === 404) {
              setPermissionError('Course not found.')
            } else if (response.status === 403) {
              setPermissionError('You do not have permission to edit this course.')
            } else {
              setPermissionError('Failed to load course data.')
            }
            setHasPermission(false)
            setAuthChecked(true)
            return
          }

          const data = await response.json()
          const course = data.course || data

          // Check if user owns this course (unless admin)
          if (!isAdmin && course.instructorId !== user.id) {
            setPermissionError('You can only edit courses that you created.')
            setHasPermission(false)
            setAuthChecked(true)
            return
          }

          // ✅ PRESERVED: Load course data for editing (original logic)
          setCourseData({
            id: course.id,
            title: course.title || '',
            description: course.description || '',
            category: course.category || '',
            level: course.level || 'BEGINNER',
            price: course.price || 0,
            thumbnail: course.thumbnail,
            trailerUrl: course.trailerUrl,
            freeContentLimit: course.freeContentLimit || 3,
            status: course.status || 'DRAFT'
          })

          if (course.sessions) {
            setSessions(course.sessions)
          }

        } catch (error) {
          console.error('Error loading course:', error)
          setPermissionError('Failed to load course data.')
          setHasPermission(false)
          setAuthChecked(true)
          return
        }
      }

      // ✅ All checks passed
      setHasPermission(true)
      setAuthChecked(true)
    }

    checkAccess()
  }, [user, loading, isInstructor, isAdmin, isEditing, editCourseId, router])

   // ✅ PRESERVED: All original course builder logic from here onwards...
  // Auto-save functionality - FIXED
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (courseData.title.trim() && courseData.description.trim()) {
        handleSaveDraft()
      }
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSave)
  }, [courseData, sessions]) // Added sessions dependency

  
  // ✅ NEW: Show loading spinner while checking auth
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // ✅ NEW: Show permission error
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{permissionError}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            {isInstructor && (
              <Button 
                onClick={() => router.push('/dashboard/instructor')} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            )}
            {isAdmin && (
              <Button 
                onClick={() => router.push('/dashboard/admin')} 
                className="w-full"
              >
                Go to Admin Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null) // Clear error when user types
  }

  const handleSaveDraft = async () => {
    if (saveStatus === 'saving') return // Prevent multiple saves
    
    setSaveStatus('saving')
    setError(null)
    
    try {
      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        thumbnail: courseData.thumbnail,
        trailerUrl: courseData.trailerUrl,
        freeContentLimit: courseData.freeContentLimit,
        sessions,
        submitForReview: false // Always save as draft
      }

      console.log('Saving payload:', payload) // Debug log

      const url = courseData.id ? `/api/courses/${courseData.id}` : '/api/courses'
      const method = courseData.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Check if response has content
      const contentType = response.headers.get('content-type')
      let result

      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text()
        console.log('Raw response:', responseText)
        
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            throw new Error(`Invalid JSON response: ${responseText}`)
          }
        } else {
          throw new Error('Empty response from server')
        }
      } else {
        const responseText = await response.text()
        console.error('Non-JSON response:', responseText)
        throw new Error(`Server returned ${response.status}: ${responseText || 'Unknown error'}`)
      }

      if (response.ok) {
        // Even if result structure is different, if response is 200/201, treat as success
        if (result?.success !== false) {
          // Update courseData with returned ID if it's a new course
          if (!courseData.id && result?.course?.id) {
            setCourseData(prev => ({ ...prev, id: result.course.id }))
          } else if (!courseData.id && result?.id) {
            // Alternative structure - sometimes API returns course directly
            setCourseData(prev => ({ ...prev, id: result.id }))
          }
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 3000)
          return // Exit function successfully
        }
      }
      
      // Only throw error if response is not ok OR explicitly failed
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || `HTTP ${response.status}: Failed to save course`)
      }
    } catch (error: any) {
      console.error('Save error:', error)
      setSaveStatus('error')
      
      // More specific error messages
      if (error.message.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to server')
      } else if (error.message.includes('Unexpected end of JSON')) {
        setError('Server error: Invalid response format')
      } else {
        setError(error.message || 'Failed to save course')
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // ✅ PRESERVED: All remaining original functions unchanged
  const validateForSubmission = () => {
    const errors: string[] = []
    
    // Basic course validation
    if (!courseData.title.trim() || courseData.title.trim().length < 5) {
      errors.push('Course title must be at least 5 characters long')
    }
    
    if (!courseData.description.trim() || courseData.description.trim().length < 50) {
      errors.push('Course description must be at least 50 characters long')
    }
    
    if (!courseData.category) {
      errors.push('Course category is required')
    }
    
    if (sessions.length === 0) {
      errors.push('At least one session is required')
    }

    // Session validation
    sessions.forEach((session: any, sessionIndex: number) => {
      if (!session.title || session.title.trim().length < 3) {
        errors.push(`Session ${sessionIndex + 1}: Title must be at least 3 characters long`)
      }
      
      if (!session.contents || session.contents.length === 0) {
        errors.push(`Session ${sessionIndex + 1}: At least one content item is required`)
      } else {
        // Content validation
        session.contents.forEach((content: any, contentIndex: number) => {
          if (!content.title || content.title.trim().length < 3) {
            errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}: Title must be at least 3 characters long`)
          }
          
          if (content.type === 'VIDEO') {
            if (!content.youtubeUrl || !content.youtubeUrl.trim()) {
              errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}: YouTube URL is required for video content`)
            } else if (!isValidYouTubeUrl(content.youtubeUrl)) {
              errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}: Please provide a valid YouTube URL`)
            }
          }
          
          if (content.type === 'QUIZ') {
            if (!content.quizData || !content.quizData.questions || content.quizData.questions.length === 0) {
              errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}: Quiz must have at least one question`)
            } else {
              content.quizData.questions.forEach((question: any, qIndex: number) => {
                if (!question.question || question.question.trim().length < 5) {
                  errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}, Question ${qIndex + 1}: Question text must be at least 5 characters`)
                }
                if (!question.options || question.options.length < 2) {
                  errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}, Question ${qIndex + 1}: At least 2 answer options required`)
                }
                if (question.correct === undefined || question.correct === null) {
                  errors.push(`Session ${sessionIndex + 1}, Content ${contentIndex + 1}, Question ${qIndex + 1}: Correct answer must be specified`)
                }
              })
            }
          }
        })
      }
    })

    // Business rules validation
    const freeSessionsCount = sessions.filter((s: any) => s.isFree).length
    if (freeSessionsCount === 0) {
      errors.push('At least one session must be marked as free for preview')
    }

    if (freeSessionsCount > courseData.freeContentLimit) {
      errors.push(`Too many free sessions (${freeSessionsCount}). Limit is ${courseData.freeContentLimit}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/
    return youtubeRegex.test(url)
  }

  const handleSubmitForReview = async () => {
    // Comprehensive validation
    const validation = validateForSubmission()
    
    if (!validation.isValid) {
      setError(`Please fix the following issues:\n• ${validation.errors.join('\n• ')}`)
      return
    }

    setCourseLoading(true)
    setError(null)
    
    try {
      // First ensure course is saved as draft
      if (!courseData.id) {
        await handleSaveDraft()
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (saveStatus === 'error') {
          throw new Error('Failed to save course before submitting for review')
        }
      }

      const payload = {
        courseId: courseData.id,
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        shortDesc: courseData.description.trim().substring(0, 150),
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        thumbnail: courseData.thumbnail,
        trailerUrl: courseData.trailerUrl,
        freeContentLimit: courseData.freeContentLimit,
        sessions: sessions.map((session: any, index: number) => ({
          title: session.title.trim(),
          description: session.description?.trim() || session.title.trim(),
          order: session.order || index + 1,
          isFree: session.isFree || index < courseData.freeContentLimit,
          duration: session.duration || 0,
          contents: session.contents.map((content: any, contentIndex: number) => ({
            type: content.type?.toUpperCase() || 'VIDEO',
            title: content.title.trim(),
            description: content.description?.trim() || '',
            youtubeUrl: content.type === 'VIDEO' ? content.youtubeUrl?.trim() : undefined,
            zoomLink: content.zoomLink?.trim(),
            quizData: content.type === 'QUIZ' ? content.quizData : undefined,
            exerciseContent: content.exerciseContent?.trim(),
            materialUrl: content.materialUrl?.trim(),
            order: content.order || contentIndex + 1,
            duration: content.duration || 0,
            isFree: content.isFree || false
          }))
        }))
      }

      console.log('Submit payload:', payload)

      const response = await fetch('/api/courses/submit-review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      console.log('Submit response status:', response.status)

      // Handle response
      if (response.status === 200 || response.status === 201) {
        // Success - redirect immediately
        console.log('Submit successful, redirecting...')
        router.push('/instructor?tab=courses&status=pending')
        return
      }

      // Handle error responses
      const responseText = await response.text()
      console.log('Submit error response:', responseText)
      
      if (responseText.trim()) {
        const result = JSON.parse(responseText)
        
        if (result.errors && Array.isArray(result.errors)) {
          setError(`Validation failed:\n• ${result.errors.join('\n• ')}`)
        } else {
          setError(result.message || result.error || `HTTP ${response.status}: Submit failed`)
        }
      } else {
        setError(`HTTP ${response.status}: No response from server`)
      }

    } catch (error: any) {
      console.error('Submit error:', error)
      setError(error.message || 'Failed to submit course for review')
    }
    
    setCourseLoading(false)
  }

  const getCompletionPercentage = () => {
    let completed = 0
    const total = 6 // Total required fields

    if (courseData.title.trim()) completed++
    if (courseData.description.trim()) completed++
    if (courseData.category) completed++
    if (courseData.price >= 0) completed++
    if (sessions.length > 0) completed++
    if (courseData.thumbnail) completed++

    return Math.round((completed / total) * 100)
  }

  const canSubmitForReview = () => {
    const validation = validateForSubmission()
    return validation.isValid && 
           courseData.title.trim() && 
           courseData.description.trim().length >= 50 && 
           courseData.category &&
           sessions.length > 0
  }
  // ✅ PRESERVED: Original UI render with enhanced header
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {courseData.id ? 'Edit Course' : 'Create New Course'}
              </h1>
              <p className="text-sm text-gray-500">
                Build your Russian language course step by step
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Save Status */}
            <div className="flex items-center space-x-2">
              {saveStatus === 'saving' && (
                <Badge variant="outline" className="text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2" />
                  Saving...
                </Badge>
              )}
              {saveStatus === 'saved' && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Saved
                </Badge>
              )}
              {saveStatus === 'error' && (
                <Badge variant="outline" className="text-red-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>

            {/* Completion Progress */}
            <div className="text-sm text-gray-500">
              {getCompletionPercentage()}% Complete
            </div>

            {/* Action Buttons */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveDraft}
              disabled={courseLoading || saveStatus === 'saving'}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>

            <Button 
              size="sm"
              onClick={handleSubmitForReview}
              disabled={courseLoading || !canSubmitForReview()}
            >
              <Send className="w-4 h-4 mr-2" />
              {courseLoading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="h-1 bg-gray-200">
          <div 
            className="h-1 bg-blue-600 transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-6 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <BasicInfoForm 
              courseData={courseData}
              onDataChange={handleInputChange}
              isEditing={isEditing}
            />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <SessionBuilder 
              sessions={sessions}
              onSessionsChange={setSessions}
              freeContentLimit={courseData.freeContentLimit}
            />
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <PricingForm 
              courseData={courseData}
              onDataChange={handleInputChange}
              totalSessions={sessions.length}
              totalContents={sessions.reduce((total, session) => total + session.contents.length, 0)}
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <CoursePreview 
              courseData={courseData}
              sessions={sessions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}