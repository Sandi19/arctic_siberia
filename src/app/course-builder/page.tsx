// File: src/app/course-builder/page.tsx - COMPLETE FIXED VERSION

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ✅ FIXED: Menggunakan barrel imports dari index.ts
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
  Info
} from 'lucide-react'

import SessionBuilder from '@/components/course/session-builder'
import CoursePreview from '@/components/course/course-preview'

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
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Auto-save functionality - FIXED
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (courseData.title.trim() && courseData.description.trim()) {
        handleSaveDraft()
      }
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSave)
  }, [courseData, sessions]) // Added sessions dependency

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

    setLoading(true)
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
    
    setLoading(false)
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
              disabled={loading || saveStatus === 'saving'}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>

            <Button 
              size="sm"
              onClick={handleSubmitForReview}
              disabled={loading || !canSubmitForReview()}
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit for Review'}
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
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Russian Grammar Fundamentals"
                      value={courseData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={courseData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    value={courseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Course Level</Label>
                    <Select 
                      value={courseData.level} 
                      onValueChange={(value) => handleInputChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailer">Trailer URL (YouTube)</Label>
                    <Input
                      id="trailer"
                      placeholder="https://youtube.com/watch?v=..."
                      value={courseData.trailerUrl || ''}
                      onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Course Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    placeholder="https://example.com/thumbnail.jpg"
                    value={courseData.thumbnail || ''}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
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
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Course Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      max="10000000"
                      placeholder="0"
                      value={courseData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-sm text-gray-500">
                      Set to 0 for free course. Maximum: 10,000,000 IDR
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeLimit">Free Content Limit</Label>
                    <Input
                      id="freeLimit"
                      type="number"
                      min="0"
                      max="10"
                      value={courseData.freeContentLimit}
                      onChange={(e) => handleInputChange('freeContentLimit', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-sm text-gray-500">
                      Number of free sessions/content students can access
                    </p>
                  </div>
                </div>

                {courseData.price > 0 && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Your course will be reviewed by our team before it can be published and sold. 
                      Revenue sharing details will be provided after approval.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
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