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
  ArrowLeft,
  Construction
} from 'lucide-react'

// ✅ TEMPORARILY DISABLED: Session Builder import until session components are ready
// import SessionBuilder from '@/components/course/session-builder'

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

// ✅ TEMPORARY: Placeholder Session Builder Component
function TemporarySessionBuilderPlaceholder() {
  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Session Builder - Under Development</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          The Session Builder is currently being updated to integrate with the new component architecture. 
          It will be available once the session and quiz components are implemented.
        </p>
        <div className="bg-white border border-yellow-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-800 mb-2">Development Progress:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Session Components (/components/session/) - Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Quiz Components (/components/quiz/) - Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Session Builder Integration - Ready (disabled temporarily)</span>
            </div>
          </div>
        </div>
        <Alert className="mt-4 text-left">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>For Developers:</strong> Once the session and quiz components are implemented, 
            uncomment the SessionBuilder import and replace this placeholder component.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

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

      // 2. Check if user has instructor or admin role
      if (!isInstructor() && !isAdmin()) {
        setPermissionError('Only instructors and administrators can access the course builder.')
        setHasPermission(false)
        setAuthChecked(true)
        return
      }

      // 3. If editing, check if user owns the course or is admin
      if (isEditing) {
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
              setPermissionError('Error loading course data.')
            }
            setHasPermission(false)
            setAuthChecked(true)
            return
          }

          const course = await response.json()
          setCourseData(course)
          setSessions(course.sessions || [])
        } catch (error) {
          console.error('Error loading course:', error)
          setPermissionError('Error loading course data.')
          setHasPermission(false)
          setAuthChecked(true)
          return
        }
      }

      setHasPermission(true)
      setAuthChecked(true)
    }

    checkAccess()
  }, [user, loading, isEditing, editCourseId, router, isInstructor, isAdmin])

  // ✅ PRESERVED: Original course builder functions
  const handleSave = async (status: 'DRAFT' | 'PENDING_REVIEW' = 'DRAFT') => {
    if (!courseData.title || !courseData.description || !courseData.category) {
      setError('Please fill in all required fields')
      return
    }

    setSaveStatus('saving')
    setError(null)

    try {
      const payload = {
        ...courseData,
        status,
        sessions
      }

      const url = isEditing ? `/api/courses/${editCourseId}` : '/api/courses'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save course')
      }

      const savedCourse = await response.json()
      setCourseData(savedCourse)
      setSaveStatus('saved')

      if (status === 'PENDING_REVIEW') {
        router.push('/dashboard/instructor?submitted=true')
      } else if (!isEditing) {
        router.push(`/course-builder?edit=${savedCourse.id}&saved=true`)
      }
    } catch (error) {
      console.error('Save error:', error)
      setError(error instanceof Error ? error.message : 'Failed to save course')
      setSaveStatus('error')
    }
  }

  const handleSubmitForReview = () => {
    if (sessions.length === 0) {
      setError('Please add at least one session before submitting for review')
      return
    }
    handleSave('PENDING_REVIEW')
  }

  const getTabValidation = (tab: string) => {
    switch (tab) {
      case 'basic':
        return courseData.title && courseData.description && courseData.category
      case 'sessions':
        return sessions.length > 0
      case 'pricing':
        return courseData.price >= 0
      default:
        return true
    }
  }

  // ✅ PRESERVED: Loading state
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course builder...</p>
        </div>
      </div>
    )
  }

  // ✅ NEW: Permission denied state
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{permissionError}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              {!isInstructor() && !isAdmin() && (
                <Button 
                  variant="outline"
                  onClick={() => router.push('/instructor')}
                  className="w-full"
                >
                  Apply to Become Instructor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ✅ PRESERVED: Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Course' : 'Create New Course'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update your course content and settings' : 'Build engaging learning experiences for your students'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={courseData.status === 'DRAFT' ? 'secondary' : 'default'}>
                {courseData.status.replace('_', ' ')}
              </Badge>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard/instructor')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* ✅ PRESERVED: Save Status Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'saved' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Course saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* ✅ PRESERVED: Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Basic Info
                      {getTabValidation('basic') && <CheckCircle className="w-3 h-3 text-green-600" />}
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Sessions
                      {getTabValidation('sessions') && <CheckCircle className="w-3 h-3 text-green-600" />}
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Pricing
                      {getTabValidation('pricing') && <CheckCircle className="w-3 h-3 text-green-600" />}
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="basic">
                      <BasicInfoForm 
                        courseData={courseData}
                        setCourseData={setCourseData}
                        categories={CATEGORIES}
                      />
                    </TabsContent>

                    <TabsContent value="sessions">
                      {/* ✅ TEMPORARILY DISABLED: Session Builder */}
                      {/* <SessionBuilder 
                        sessions={sessions}
                        onSessionsChange={setSessions}
                        maxFreeSessions={courseData.freeContentLimit}
                      /> */}
                      
                      {/* ✅ TEMPORARY: Placeholder Component */}
                      <TemporarySessionBuilderPlaceholder />
                    </TabsContent>

                    <TabsContent value="pricing">
                      <PricingForm 
                        courseData={courseData}
                        setCourseData={setCourseData}
                      />
                    </TabsContent>

                    <TabsContent value="preview">
                      <CoursePreview 
                        courseData={courseData}
                        sessions={sessions}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ✅ PRESERVED: Sidebar */}
          <div className="space-y-6">
            {/* Save Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleSave('DRAFT')}
                  disabled={saveStatus === 'saving'}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
                </Button>

                <Button 
                  onClick={handleSubmitForReview}
                  disabled={saveStatus === 'saving' || !getTabValidation('basic')}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic Information</span>
                    {getTabValidation('basic') ? 
                      <CheckCircle className="w-4 h-4 text-green-600" /> : 
                      <div className="w-4 h-4 border border-gray-300 rounded-full" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessions</span>
                    {getTabValidation('sessions') ? 
                      <CheckCircle className="w-4 h-4 text-green-600" /> : 
                      <div className="w-4 h-4 border border-gray-300 rounded-full" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pricing</span>
                    {getTabValidation('pricing') ? 
                      <CheckCircle className="w-4 h-4 text-green-600" /> : 
                      <div className="w-4 h-4 border border-gray-300 rounded-full" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ NEW: Development Status */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800">Development Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Basic Info - Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Construction className="w-4 h-4 text-yellow-600" />
                    <span>Sessions - Under Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Pricing - Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Preview - Ready</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-3">
                  Session Builder will be enabled once the component architecture is complete.
                </p>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-medium">{sessions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Content:</span>
                    <span className="font-medium">
                      {sessions.filter(s => s.isFree).length}/{courseData.freeContentLimit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">
                      {courseData.price === 0 ? 'Free' : `$${courseData.price}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}