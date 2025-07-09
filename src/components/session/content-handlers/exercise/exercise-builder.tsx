// File: src/components/session/content-handlers/exercise/exercise-builder.tsx
'use client'

/**
 * =================================================================
 * 📝 EXERCISE BUILDER - SESSION CONTENT HANDLER
 * =================================================================
 * Session content handler untuk Exercise type dalam Arctic Siberia LMS
 * Handles text-based exercises, reading materials, dan practice activities
 * 
 * Features:
 * - Rich text content editor dengan word count
 * - Multiple exercise types (Reading, Practice, Reflection)
 * - Resource management (Links, PDFs, Images)
 * - Submission requirements dan instructions
 * - Auto-calculated reading time
 * - Arctic Siberia compliant architecture
 * 
 * Created: July 2025
 * =================================================================
 */

// ✅ Framework & Core Imports
import { 
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ UI Components - barrel imports
import {
  Button,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Checkbox,
  Input,
  Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Separator,
  Switch,
  Textarea
} from '@/components/ui'

// ✅ Icons
import {
  BookOpen,
  Eye,
  FileText,
  Image,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Plus,
  Target,
  Trash2,
  Type
} from 'lucide-react'

// ✅ Local Utilities
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// =================================================================
// 🎯 TYPES & VALIDATION SCHEMAS
// =================================================================

// Session content types (would be imported from session types)
interface ExerciseContent {
  type: 'EXERCISE'
  title: string
  description?: string
  accessLevel: 'FREE' | 'PREMIUM'
  duration?: number
  isRequired: boolean
  exerciseData: {
    content: string
    exerciseType: 'READING' | 'PRACTICE' | 'REFLECTION'
    estimatedReadingTime?: number
    hasSubmission: boolean
    submissionInstructions?: string
    resources: Array<{
      title: string
      url: string
      type: 'LINK' | 'PDF' | 'IMAGE'
    }>
  }
}

const resourceSchema = z.object({
  title: z.string()
    .min(1, 'Resource title is required')
    .max(100, 'Title must be less than 100 characters'),
  url: z.string()
    .min(1, 'Resource URL is required')
    .url('Please enter a valid URL'),
  type: z.enum(['LINK', 'PDF', 'IMAGE'] as const)
})

const exerciseFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  content: z.string()
    .min(1, 'Exercise content is required')
    .min(50, 'Content must be at least 50 characters'),
  
  exerciseType: z.enum(['READING', 'PRACTICE', 'REFLECTION'] as const),
  
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration cannot exceed 3 hours')
    .optional(),
  
  estimatedReadingTime: z.number()
    .min(1, 'Reading time must be at least 1 minute')
    .max(60, 'Reading time cannot exceed 1 hour')
    .optional(),
  
  isRequired: z.boolean().default(false),
  
  hasSubmission: z.boolean().default(false),
  
  submissionInstructions: z.string()
    .max(1000, 'Instructions must be less than 1000 characters')
    .optional(),
  
  resources: z.array(resourceSchema).default([])
})

type ExerciseFormData = z.infer<typeof exerciseFormSchema>

interface SessionExerciseBuilderProps {
  sessionId: string
  initialData?: Partial<ExerciseContent>
  onSave: (data: Partial<ExerciseContent>) => void
  onCancel: () => void
  className?: string
}

interface ContentEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

interface ResourceManagerProps {
  resources: Array<{
    title: string
    url: string
    type: 'LINK' | 'PDF' | 'IMAGE'
  }>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: string, value: string) => void
  errors?: any[]
}

interface ExercisePreviewProps {
  data: ExerciseFormData
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Calculate estimated reading time based on content
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200 // Average reading speed
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

/**
 * Format content for preview (basic HTML to text)
 */
function formatContentPreview(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 200) + (content.length > 200 ? '...' : '')
}

/**
 * Validate URL and determine resource type
 */
function detectResourceType(url: string): 'LINK' | 'PDF' | 'IMAGE' {
  const lowerUrl = url.toLowerCase()
  
  if (lowerUrl.includes('.pdf')) {
    return 'PDF'
  }
  
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return 'IMAGE'
  }
  
  return 'LINK'
}

// =================================================================
// 🎯 CONTENT EDITOR SUB-COMPONENT
// =================================================================

function ContentEditor({ 
  value, 
  onChange, 
  placeholder = "Write your exercise content here...",
  error 
}: ContentEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
    setReadingTime(calculateReadingTime(value))
  }, [value])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Exercise Content *</Label>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{wordCount} words</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={12}
        className={cn("resize-none", error && "border-red-500")}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className="text-xs text-gray-500">
        Support for basic HTML formatting: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
      </div>
    </div>
  )
}

// =================================================================
// 🎯 RESOURCE MANAGER SUB-COMPONENT
// =================================================================

function ResourceManager({ 
  resources, 
  onAdd, 
  onRemove, 
  onUpdate, 
  errors = [] 
}: ResourceManagerProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'IMAGE':
        return <Image className="w-4 h-4 text-blue-500" />
      case 'LINK':
      default:
        return <LinkIcon className="w-4 h-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Additional Resources</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No resources added yet</p>
          <p className="text-xs">Add links, PDFs, or images to help students</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                {getResourceIcon(resource.type)}
                <span className="text-sm font-medium">Resource {index + 1}</span>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={resource.title}
                    onChange={(e) => onUpdate(index, 'title', e.target.value)}
                    placeholder="Resource title"
                    className={errors[index]?.title ? 'border-red-500' : ''}
                  />
                  {errors[index]?.title && (
                    <p className="text-xs text-red-600">{errors[index].title.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={resource.url}
                    onChange={(e) => {
                      onUpdate(index, 'url', e.target.value)
                      // Auto-detect type based on URL
                      const detectedType = detectResourceType(e.target.value)
                      onUpdate(index, 'type', detectedType)
                    }}
                    placeholder="https://example.com"
                    className={errors[index]?.url ? 'border-red-500' : ''}
                  />
                  {errors[index]?.url && (
                    <p className="text-xs text-red-600">{errors[index].url.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={resource.type}
                    onValueChange={(value) => onUpdate(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LINK">Web Link</SelectItem>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =================================================================
// 🎯 EXERCISE PREVIEW SUB-COMPONENT
// =================================================================

function ExercisePreview({ data }: ExercisePreviewProps) {
  const getTypeConfig = () => {
    switch (data.exerciseType) {
      case 'READING':
        return {
          icon: <BookOpen className="w-4 h-4" />,
          label: 'Reading',
          className: 'bg-blue-100 text-blue-800'
        }
      case 'PRACTICE':
        return {
          icon: <Target className="w-4 h-4" />,
          label: 'Practice',
          className: 'bg-green-100 text-green-800'
        }
      case 'REFLECTION':
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          label: 'Reflection',
          className: 'bg-purple-100 text-purple-800'
        }
    }
  }

  const typeConfig = getTypeConfig()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {data.title}
            </CardTitle>
            {data.description && (
              <CardDescription>{data.description}</CardDescription>
            )}
          </div>
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            typeConfig.className
          )}>
            {typeConfig.icon}
            <span>{typeConfig.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{data.estimatedReadingTime || calculateReadingTime(data.content)} min read</span>
          {data.hasSubmission && <span>• Submission required</span>}
          {data.resources.length > 0 && <span>• {data.resources.length} resources</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <div className="p-4 bg-gray-50 rounded-lg">
            {formatContentPreview(data.content)}
          </div>
        </div>

        {data.resources.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resources:</h4>
            <div className="space-y-1">
              {data.resources.map((resource, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {resource.title} ({resource.type})
                </div>
              ))}
            </div>
          </div>
        )}

        {data.hasSubmission && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">
              Submission Required
            </div>
            {data.submissionInstructions && (
              <div className="text-sm text-blue-800">
                {data.submissionInstructions}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =================================================================
// 🎯 MAIN EXERCISE BUILDER COMPONENT
// =================================================================

export default function SessionExerciseBuilder({
  sessionId,
  initialData,
  onSave,
  onCancel,
  className
}: SessionExerciseBuilderProps) {
  
  // =================================================================
  // 🎯 FORM SETUP
  // =================================================================
  
  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.exerciseData?.content || '',
      exerciseType: initialData?.exerciseData?.exerciseType || 'READING',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || undefined,
      estimatedReadingTime: initialData?.exerciseData?.estimatedReadingTime || undefined,
      isRequired: initialData?.isRequired || false,
      hasSubmission: initialData?.exerciseData?.hasSubmission || false,
      submissionInstructions: initialData?.exerciseData?.submissionInstructions || '',
      resources: initialData?.exerciseData?.resources || []
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "resources"
  })

  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // =================================================================
  // 🎯 WATCH FORM VALUES
  // =================================================================
  
  const watchedContent = form.watch('content')
  const watchedHasSubmission = form.watch('hasSubmission')
  const watchedEstimatedTime = form.watch('estimatedReadingTime')

  // =================================================================
  // 🎯 AUTO-CALCULATE READING TIME
  // =================================================================
  
  useEffect(() => {
    if (watchedContent && !watchedEstimatedTime) {
      const autoCalculated = calculateReadingTime(watchedContent)
      form.setValue('estimatedReadingTime', autoCalculated)
    }
  }, [watchedContent, watchedEstimatedTime, form])

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleSave = useCallback(() => {
    const data = form.getValues()
    setIsSaving(true)
    
    try {
      const exerciseContent: Partial<ExerciseContent> = {
        type: 'EXERCISE',
        title: data.title,
        description: data.description,
        accessLevel: data.accessLevel,
        duration: data.duration,
        isRequired: data.isRequired,
        exerciseData: {
          content: data.content,
          exerciseType: data.exerciseType,
          estimatedReadingTime: data.estimatedReadingTime,
          hasSubmission: data.hasSubmission,
          submissionInstructions: data.submissionInstructions,
          resources: data.resources
        }
      }

      onSave(exerciseContent)
      toast.success('Exercise session content saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save exercise content')
    } finally {
      setIsSaving(false)
    }
  }, [form, onSave])

  const handleAddResource = useCallback(() => {
    append({
      title: '',
      url: '',
      type: 'LINK'
    })
  }, [append])

  const handleRemoveResource = useCallback((index: number) => {
    remove(index)
  }, [remove])

  const handleUpdateResource = useCallback((index: number, field: string, value: string) => {
    update(index, { ...fields[index], [field]: value })
  }, [update, fields])

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const isFormValid = useMemo(() => {
    return form.formState.isValid && !!watchedContent
  }, [form.formState.isValid, watchedContent])

  // =================================================================
  // 🎯 MAIN RENDER
  // =================================================================
  
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-green-600" />
            Add Exercise Content
          </CardTitle>
          <CardDescription>
            Create text-based learning exercises with reading materials, practice activities, or reflection prompts.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter exercise title"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exerciseType">Exercise Type</Label>
                <Controller
                  name="exerciseType"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="READING">Reading Material</SelectItem>
                        <SelectItem value="PRACTICE">Practice Exercise</SelectItem>
                        <SelectItem value="REFLECTION">Reflection Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn or practice"
                rows={2}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Exercise Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Exercise Content</h3>
            
            <ContentEditor
              value={watchedContent}
              onChange={(value) => form.setValue('content', value)}
              error={form.formState.errors.content?.message}
            />
          </div>

          <Separator />

          {/* Timing & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timing & Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedReadingTime">Reading Time (minutes)</Label>
                <Input
                  id="estimatedReadingTime"
                  type="number"
                  placeholder="Auto-calculated"
                  {...form.register('estimatedReadingTime', { valueAsNumber: true })}
                />
                {form.formState.errors.estimatedReadingTime && (
                  <p className="text-xs text-red-600">{form.formState.errors.estimatedReadingTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Total Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 15"
                  {...form.register('duration', { valueAsNumber: true })}
                />
                {form.formState.errors.duration && (
                  <p className="text-xs text-red-600">{form.formState.errors.duration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Controller
                  name="accessLevel"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free Content</SelectItem>
                        <SelectItem value="PREMIUM">Premium Content</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="isRequired"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="isRequired"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isRequired">Required content</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="hasSubmission"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="hasSubmission"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasSubmission">Require student submission</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Submission Instructions */}
          {watchedHasSubmission && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Submission Instructions</h3>
                <div className="space-y-2">
                  <Label htmlFor="submissionInstructions">Instructions for Students</Label>
                  <Textarea
                    id="submissionInstructions"
                    placeholder="Explain what students should submit and how..."
                    rows={3}
                    {...form.register('submissionInstructions')}
                  />
                  {form.formState.errors.submissionInstructions && (
                    <p className="text-xs text-red-600">{form.formState.errors.submissionInstructions.message}</p>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Resources</h3>
            
            <ResourceManager
              resources={fields}
              onAdd={handleAddResource}
              onRemove={handleRemoveResource}
              onUpdate={handleUpdateResource}
              errors={form.formState.errors.resources}
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!watchedContent}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Exercise Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && watchedContent && (
        <ExercisePreview data={form.getValues()} />
      )}
    </div>
  )
}

// =================================================================
// 🎯 EXPORT - ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default + Named Exports + Types
export default SessionExerciseBuilder
export { 
  ContentEditor, 
  ResourceManager, 
  ExercisePreview,
  calculateReadingTime,
  formatContentPreview,
  detectResourceType,
  exerciseFormSchema
}
export type { 
  SessionExerciseBuilderProps,
  ContentEditorProps,
  ResourceManagerProps,
  ExercisePreviewProps,
  ExerciseFormData
}