// File: src/components/course/basic-info-form.tsx

'use client'

import { 
  Card, CardContent, CardHeader, CardTitle,
  Input,
  Label,
  Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui'

import { 
  BookOpen,
  Globe,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface CourseData {
  title: string
  description: string
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  thumbnail?: string
  trailerUrl?: string
}

interface BasicInfoFormProps {
  courseData: CourseData
  onDataChange: (field: keyof CourseData, value: string) => void
  isEditing?: boolean
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

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', color: 'bg-green-100 text-green-800', desc: 'No prior knowledge required' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-blue-100 text-blue-800', desc: 'Some basic knowledge needed' },
  { value: 'ADVANCED', label: 'Advanced', color: 'bg-purple-100 text-purple-800', desc: 'Strong foundation required' }
]

export default function BasicInfoForm({ courseData, onDataChange, isEditing = false }: BasicInfoFormProps) {
  const getCharacterCount = (text: string, max: number) => {
    const remaining = max - text.length
    const isOver = remaining < 0
    return (
      <span className={`text-xs ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
        {text.length}/{max} characters {isOver && '(over limit)'}
      </span>
    )
  }

  const selectedLevel = LEVELS.find(level => level.value === courseData.level)

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-6">
      {/* Course Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Course Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center space-x-1">
                <span>Course Title</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Russian Grammar Fundamentals"
                value={courseData.title}
                onChange={(e) => onDataChange('title', e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">Make it clear and descriptive</p>
                {getCharacterCount(courseData.title, 100)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center space-x-1">
                <span>Category</span>
                <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={courseData.category} 
                onValueChange={(value) => onDataChange('category', value)}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">Choose the most relevant category</p>
            </div>
          </div>

          {/* Level Selection */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-1">
              <span>Difficulty Level</span>
              <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LEVELS.map(level => (
                <div
                  key={level.value}
                  onClick={() => onDataChange('level', level.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    courseData.level === level.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={level.color}>{level.label}</Badge>
                    {courseData.level === level.value && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span>Course Description</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center space-x-1">
              <span>Detailed Description</span>
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn, the course structure, and what makes it special..."
              value={courseData.description}
              onChange={(e) => onDataChange('description', e.target.value)}
              rows={6}
              className="transition-all duration-200 focus:ring-2 focus:ring-green-500 resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Provide detailed information about course content and learning outcomes
              </p>
              {getCharacterCount(courseData.description, 1000)}
            </div>
          </div>

          {/* Description Guidelines */}
          <Alert className="border-green-200 bg-green-50">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Pro Tips:</strong> Include what students will learn, course structure, 
              prerequisites, and unique value proposition. Be specific about outcomes!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Media & Assets Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Course Media</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Course Thumbnail URL</Label>
              <Input
                id="thumbnail"
                placeholder="https://example.com/thumbnail.jpg"
                value={courseData.thumbnail || ''}
                onChange={(e) => onDataChange('thumbnail', e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-600">
                Recommended: 1280x720px, JPG/PNG format
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trailerUrl">Course Trailer URL</Label>
              <Input
                id="trailerUrl"
                placeholder="https://youtube.com/watch?v=..."
                value={courseData.trailerUrl || ''}
                onChange={(e) => onDataChange('trailerUrl', e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-600">
                YouTube URL for course preview video
              </p>
            </div>
          </div>

          {/* Thumbnail Preview */}
          {courseData.thumbnail && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Thumbnail Preview</Label>
              <div className="mt-2 border rounded-lg overflow-hidden max-w-sm">
                <img 
                  src={courseData.thumbnail} 
                  alt="Course thumbnail"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Course Information Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use a clear, descriptive title that includes main keywords</li>
                <li>• Choose the most specific category for better discoverability</li>
                <li>• Write detailed description (300+ words recommended)</li>
                <li>• Set appropriate difficulty level based on prerequisites</li>
                <li>• Add high-quality thumbnail and trailer for better conversion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}