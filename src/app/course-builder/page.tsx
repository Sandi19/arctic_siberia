// File: src/app/course-builder/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  CheckCircle
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
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (courseData.title && courseData.description) {
        handleSaveDraft()
      }
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSave)
  }, [courseData])

  const handleInputChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveDraft = async () => {
    setSaveStatus('saving')
    try {
      const response = await fetch('/api/courses', {
        method: courseData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseData,
          sessions
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (!courseData.id) {
          setCourseData(prev => ({ ...prev, id: result.id }))
        }
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
    }
  }

  const handleSubmitForReview = async () => {
    if (!courseData.title || !courseData.description || sessions.length === 0) {
      alert('Please complete all required fields and add at least one session')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/courses/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseData,
          sessions,
          status: 'PENDING_REVIEW'
        })
      })

      if (response.ok) {
        router.push('/instructor/courses?status=pending')
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
    setLoading(false)
  }

  const getCompletionPercentage = () => {
    let completed = 0
    const total = 6 // Total required fields

    if (courseData.title) completed++
    if (courseData.description) completed++
    if (courseData.category) completed++
    if (courseData.price >= 0) completed++
    if (sessions.length > 0) completed++
    if (courseData.thumbnail) completed++

    return Math.round((completed / total) * 100)
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
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>

            <Button 
              size="sm"
              onClick={handleSubmitForReview}
              disabled={loading || getCompletionPercentage() < 80}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Review
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
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
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