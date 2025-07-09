// File: src/components/session/content-handlers/discussion/discussion-builder.tsx

'use client'

import React, { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// ✅ UI Components - Arctic Siberia Import Standard
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Checkbox
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Save,
  Eye,
  Plus,
  Trash2,
  MessageSquare,
  Users,
  Shield,
  Clock,
  Tag,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  Paperclip
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  DiscussionContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  color: z.string().optional(),
  description: z.string().optional()
})

const discussionSchema = z.object({
  title: z.string().min(1, 'Discussion title is required'),
  description: z.string().optional(),
  topic: z.string().min(5, 'Topic must be at least 5 characters'),
  discussionType: z.enum(['OPEN', 'Q_AND_A', 'THREADED'], {
    required_error: 'Discussion type is required'
  }),
  isAnonymous: z.boolean().default(false),
  allowAttachments: z.boolean().default(true),
  moderationEnabled: z.boolean().default(false),
  categories: z.array(categorySchema).optional(),
  minimumPosts: z.number().min(0).max(20).default(1),
  autoCloseAt: z.date().optional(),
  duration: z.number().min(5).optional(),
  points: z.number().min(0).max(100).default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  participationGrading: z.boolean().default(false),
  qualityWeight: z.number().min(0).max(1).default(0.5),
  quantityWeight: z.number().min(0).max(1).default(0.3),
  timeliness: z.number().min(0).max(1).default(0.2)
})

type DiscussionFormData = z.infer<typeof discussionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface DiscussionBuilderProps {
  initialData?: Partial<DiscussionContent>
  onSave: (content: DiscussionContent) => void
  onCancel: () => void
  onPreview?: (content: DiscussionContent) => void
  isEditing?: boolean
  sessionId: string
  className?: string
}

interface CategoryEditorProps {
  categories: Array<{ id: string; name: string; color?: string; description?: string }>
  onUpdate: (categories: Array<{ id: string; name: string; color?: string; description?: string }>) => void
}

interface DiscussionPreview {
  discussion: DiscussionContent
  isVisible: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateCategoryId = (): string => {
  return `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createDefaultDiscussion = (): Partial<DiscussionContent> => ({
  type: ContentType.DISCUSSION,
  discussionData: {
    topic: '',
    description: '',
    isAnonymous: false,
    allowAttachments: true,
    moderationEnabled: false,
    minimumPosts: 1,
    discussionType: 'OPEN'
  }
})

const DISCUSSION_TYPES = [
  {
    value: 'OPEN',
    label: 'Open Discussion',
    description: 'Free-flowing conversation where anyone can respond to any post',
    icon: MessageSquare
  },
  {
    value: 'Q_AND_A',
    label: 'Q&A Format',
    description: 'Question and answer format with instructor responses',
    icon: HelpCircle
  },
  {
    value: 'THREADED',
    label: 'Threaded Discussion',
    description: 'Organized replies in threaded conversations',
    icon: ChevronDown
  }
]

const PRESET_CATEGORIES = [
  { name: 'General', color: '#3B82F6', description: 'General discussion topics' },
  { name: 'Questions', color: '#EF4444', description: 'Student questions and clarifications' },
  { name: 'Ideas', color: '#10B981', description: 'Creative ideas and suggestions' },
  { name: 'Resources', color: '#F59E0B', description: 'Shared resources and materials' },
  { name: 'Feedback', color: '#8B5CF6', description: 'Feedback and reviews' }
]

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function DiscussionBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  sessionId,
  className = ''
}: DiscussionBuilderProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // ===============================================================
  // 🎯 FORM SETUP
  // ===============================================================
  
  const form = useForm<DiscussionFormData>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      topic: initialData?.discussionData?.topic || '',
      discussionType: initialData?.discussionData?.discussionType || 'OPEN',
      isAnonymous: initialData?.discussionData?.isAnonymous || false,
      allowAttachments: initialData?.discussionData?.allowAttachments || true,
      moderationEnabled: initialData?.discussionData?.moderationEnabled || false,
      categories: initialData?.discussionData?.categories || [],
      minimumPosts: initialData?.discussionData?.minimumPosts || 1,
      autoCloseAt: initialData?.discussionData?.autoCloseAt,
      duration: initialData?.duration || 60,
      points: initialData?.points || 0,
      difficulty: initialData?.difficulty || 'medium',
      participationGrading: false,
      qualityWeight: 0.5,
      quantityWeight: 0.3,
      timeliness: 0.2
    }
  })

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: 'categories'
  })

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleSave = useCallback(async (formData: DiscussionFormData) => {
    try {
      setIsSaving(true)
      
      const discussionContent: DiscussionContent = {
        id: initialData?.id || generateId(),
        sessionId,
        type: ContentType.DISCUSSION,
        title: formData.title,
        description: formData.description,
        order: initialData?.order || 0,
        isFree: initialData?.isFree || true,
        duration: formData.duration,
        points: formData.points,
        difficulty: formData.difficulty,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        discussionData: {
          topic: formData.topic,
          description: formData.description || '',
          isAnonymous: formData.isAnonymous,
          allowAttachments: formData.allowAttachments,
          moderationEnabled: formData.moderationEnabled,
          categories: formData.categories?.map(cat => cat.name),
          minimumPosts: formData.minimumPosts,
          discussionType: formData.discussionType,
          autoCloseAt: formData.autoCloseAt
        }
      }

      await onSave(discussionContent)
    } catch (error) {
      console.error('Error saving discussion:', error)
    } finally {
      setIsSaving(false)
    }
  }, [initialData, sessionId, onSave])

  const handlePreview = useCallback(() => {
    const formData = form.getValues()
    const discussionContent: DiscussionContent = {
      id: generateId(),
      sessionId,
      type: ContentType.DISCUSSION,
      title: formData.title,
      description: formData.description,
      order: 0,
      isFree: true,
      duration: formData.duration,
      points: formData.points,
      difficulty: formData.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      discussionData: {
        topic: formData.topic,
        description: formData.description || '',
        isAnonymous: formData.isAnonymous,
        allowAttachments: formData.allowAttachments,
        moderationEnabled: formData.moderationEnabled,
        categories: formData.categories?.map(cat => cat.name),
        minimumPosts: formData.minimumPosts,
        discussionType: formData.discussionType,
        autoCloseAt: formData.autoCloseAt
      }
    }
    
    onPreview?.(discussionContent)
    setIsPreviewOpen(true)
  }, [form, sessionId, onPreview])

  const addCategory = useCallback((preset?: { name: string; color: string; description: string }) => {
    const newCategory = {
      id: generateCategoryId(),
      name: preset?.name || '',
      color: preset?.color || '#3B82F6',
      description: preset?.description || ''
    }
    appendCategory(newCategory)
  }, [appendCategory])

  const addPresetCategories = useCallback(() => {
    PRESET_CATEGORIES.forEach(preset => {
      const exists = form.watch('categories')?.some(cat => cat.name === preset.name)
      if (!exists) {
        addCategory(preset)
      }
    })
  }, [form, addCategory])

  // ===============================================================
  // 🎯 WATCH VALUES
  // ===============================================================
  
  const watchDiscussionType = form.watch('discussionType')
  const watchParticipationGrading = form.watch('participationGrading')
  const watchPoints = form.watch('points')

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Discussion' : 'Create Discussion'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create forum-style discussions for student collaboration and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            onClick={form.handleSubmit(handleSave)}
            disabled={isSaving}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Discussion'}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Discussion Title *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="e.g., Russian Literature Discussion"
                className={form.formState.errors.title ? 'border-red-500' : ''}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Brief description of the discussion..."
                rows={2}
              />
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Discussion Topic *</Label>
              <Textarea
                id="topic"
                {...form.register('topic')}
                placeholder="What would you like students to discuss? Provide context, questions, or prompts..."
                rows={4}
                className={form.formState.errors.topic ? 'border-red-500' : ''}
              />
              {form.formState.errors.topic && (
                <p className="text-sm text-red-600">{form.formState.errors.topic.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discussion Type & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Discussion Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discussion Type */}
            <div className="space-y-3">
              <Label>Discussion Type *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DISCUSSION_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = watchDiscussionType === type.value
                  return (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => form.setValue('discussionType', type.value as any)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Basic Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumPosts">Minimum Posts Required</Label>
                <Input
                  id="minimumPosts"
                  type="number"
                  min="0"
                  max="20"
                  {...form.register('minimumPosts', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('points', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Permission Settings */}
            <div className="space-y-4">
              <Separator />
              <h4 className="font-medium">Discussion Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Anonymous Posts</Label>
                    <p className="text-sm text-gray-600">Allow students to post anonymously</p>
                  </div>
                  <Switch
                    checked={form.watch('isAnonymous')}
                    onCheckedChange={(checked) => form.setValue('isAnonymous', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>File Attachments</Label>
                    <p className="text-sm text-gray-600">Allow file uploads in posts</p>
                  </div>
                  <Switch
                    checked={form.watch('allowAttachments')}
                    onCheckedChange={(checked) => form.setValue('allowAttachments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Content Moderation</Label>
                    <p className="text-sm text-gray-600">Require approval before posts appear</p>
                  </div>
                  <Switch
                    checked={form.watch('moderationEnabled')}
                    onCheckedChange={(checked) => form.setValue('moderationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Participation Grading</Label>
                    <p className="text-sm text-gray-600">Grade based on participation quality</p>
                  </div>
                  <Switch
                    checked={form.watch('participationGrading')}
                    onCheckedChange={(checked) => form.setValue('participationGrading', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussion Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Discussion Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryFields.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No categories added yet</p>
                <div className="flex gap-2 justify-center">
                  <Button type="button" onClick={() => addCategory()} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  <Button type="button" onClick={addPresetCategories} variant="outline">
                    Add Preset Categories
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {categoryFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Category {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Category Name</Label>
                          <Input
                            {...form.register(`categories.${index}.name`)}
                            placeholder="e.g., Questions"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input
                            type="color"
                            {...form.register(`categories.${index}.color`)}
                            className="h-10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            {...form.register(`categories.${index}.description`)}
                            placeholder="Category description..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button type="button" onClick={() => addCategory()} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  <Button type="button" onClick={addPresetCategories} variant="outline">
                    Add Preset Categories
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          
          {showAdvancedSettings && (
            <CardContent className="space-y-4">
              {/* Auto Close Date */}
              <div className="space-y-2">
                <Label>Auto-close Discussion (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !form.watch('autoCloseAt') && 'text-muted-foreground'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('autoCloseAt') ? (
                        format(form.watch('autoCloseAt')!, 'PPP', { locale: id })
                      ) : (
                        <span>Select closing date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('autoCloseAt')}
                      onSelect={(date) => form.setValue('autoCloseAt', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-600">Discussion will automatically close on this date</p>
              </div>

              {/* Participation Grading Settings */}
              {watchParticipationGrading && watchPoints > 0 && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Participation Grading Weights</h4>
                  <p className="text-sm text-blue-800">Configure how participation is evaluated (weights should sum to 1.0)</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qualityWeight">Quality Weight</Label>
                      <Input
                        id="qualityWeight"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        {...form.register('qualityWeight', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-blue-700">Content quality and depth</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantityWeight">Quantity Weight</Label>
                      <Input
                        id="quantityWeight"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        {...form.register('quantityWeight', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-blue-700">Number of meaningful posts</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeliness">Timeliness Weight</Label>
                      <Input
                        id="timeliness"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        {...form.register('timeliness', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-blue-700">Early and consistent participation</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Current total: {(form.watch('qualityWeight') + form.watch('quantityWeight') + form.watch('timeliness')).toFixed(1)}
                      {(form.watch('qualityWeight') + form.watch('quantityWeight') + form.watch('timeliness')) !== 1.0 && (
                        <span className="text-amber-600"> (Should equal 1.0)</span>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={form.watch('difficulty')}
                  onValueChange={(value) => form.setValue('difficulty', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>
      </form>
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
DiscussionBuilder.displayName = 'DiscussionBuilder'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function CategoryEditor({ categories, onUpdate }: CategoryEditorProps) {
  const addCategory = () => {
    onUpdate([...categories, { 
      id: generateCategoryId(), 
      name: '', 
      color: '#3B82F6', 
      description: '' 
    }])
  }

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = categories.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onUpdate(updated)
  }

  const removeCategory = (index: number) => {
    onUpdate(categories.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {categories.map((category, index) => (
        <div key={category.id} className="p-3 border rounded-lg">
          <div className="grid grid-cols-4 gap-3">
            <Input
              placeholder="Category name"
              value={category.name}
              onChange={(e) => updateCategory(index, 'name', e.target.value)}
            />
            <Input
              type="color"
              value={category.color}
              onChange={(e) => updateCategory(index, 'color', e.target.value)}
            />
            <Input
              placeholder="Description"
              value={category.description}
              onChange={(e) => updateCategory(index, 'description', e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCategory(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      
      <Button type="button" onClick={addCategory} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Category
      </Button>
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default DiscussionBuilder
export { CategoryEditor, type DiscussionBuilderProps }