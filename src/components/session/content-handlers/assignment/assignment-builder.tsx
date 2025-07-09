// File: src/components/session/content-handlers/assignment/assignment-builder.tsx

'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
  AlertCircle,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Clock,
  FileText,
  Upload,
  Link,
  Code,
  Users,
  CheckCircle,
  AlertTriangle,
  CalendarIcon,
  Info
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  AssignmentContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const rubricItemSchema = z.object({
  criteria: z.string().min(1, 'Criteria is required'),
  points: z.number().min(1, 'Points must be at least 1'),
  description: z.string().min(1, 'Description is required')
})

const assignmentSchema = z.object({
  title: z.string().min(1, 'Assignment title is required'),
  description: z.string().optional(),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  dueDate: z.date({ required_error: 'Due date is required' }),
  submissionType: z.enum(['TEXT', 'FILE', 'LINK', 'CODE'], {
    required_error: 'Submission type is required'
  }),
  maxFileSize: z.number().min(1).max(100).optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  rubric: z.array(rubricItemSchema).optional(),
  isGroupAssignment: z.boolean().default(false),
  maxGroupSize: z.number().min(2).max(10).optional(),
  plagiarismCheck: z.boolean().default(false),
  duration: z.number().min(5).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
})

type AssignmentFormData = z.infer<typeof assignmentSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface AssignmentBuilderProps {
  initialData?: Partial<AssignmentContent>
  onSave: (content: AssignmentContent) => void
  onCancel: () => void
  onPreview?: (content: AssignmentContent) => void
  isEditing?: boolean
  sessionId: string
  className?: string
}

interface RubricEditorProps {
  rubric: Array<{ criteria: string; points: number; description: string }>
  onUpdate: (rubric: Array<{ criteria: string; points: number; description: string }>) => void
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createDefaultAssignment = (): Partial<AssignmentContent> => ({
  type: ContentType.ASSIGNMENT,
  assignmentData: {
    instructions: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    submissionType: 'TEXT',
    isGroupAssignment: false,
    plagiarismCheck: false
  }
})

const SUBMISSION_TYPES = [
  { value: 'TEXT', label: 'Text Submission', icon: FileText, description: 'Students submit text answers' },
  { value: 'FILE', label: 'File Upload', icon: Upload, description: 'Students upload files' },
  { value: 'LINK', label: 'URL/Link', icon: Link, description: 'Students submit web links' },
  { value: 'CODE', label: 'Code Submission', icon: Code, description: 'Students submit code' }
]

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'doc', label: 'Word (.doc, .docx)' },
  { value: 'txt', label: 'Text (.txt)' },
  { value: 'jpg', label: 'Image (.jpg, .jpeg, .png)' },
  { value: 'zip', label: 'Archive (.zip, .rar)' }
]

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function AssignmentBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  sessionId,
  className = ''
}: AssignmentBuilderProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // ===============================================================
  // 🎯 FORM SETUP
  // ===============================================================
  
  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      instructions: initialData?.assignmentData?.instructions || '',
      dueDate: initialData?.assignmentData?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      submissionType: initialData?.assignmentData?.submissionType || 'TEXT',
      maxFileSize: initialData?.assignmentData?.maxFileSize || 10,
      allowedFileTypes: initialData?.assignmentData?.allowedFileTypes || [],
      rubric: initialData?.assignmentData?.rubric || [],
      isGroupAssignment: initialData?.assignmentData?.isGroupAssignment || false,
      maxGroupSize: initialData?.assignmentData?.maxGroupSize || 3,
      plagiarismCheck: initialData?.assignmentData?.plagiarismCheck || false,
      duration: initialData?.duration || 60,
      points: initialData?.points || 10,
      difficulty: initialData?.difficulty || 'medium'
    }
  })

  const { fields: rubricFields, append: appendRubric, remove: removeRubric } = useFieldArray({
    control: form.control,
    name: 'rubric'
  })

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleSave = useCallback(async (formData: AssignmentFormData) => {
    try {
      setIsSaving(true)
      
      const assignmentContent: AssignmentContent = {
        id: initialData?.id || generateId(),
        sessionId,
        type: ContentType.ASSIGNMENT,
        title: formData.title,
        description: formData.description,
        order: initialData?.order || 0,
        isFree: initialData?.isFree || true,
        duration: formData.duration,
        points: formData.points,
        difficulty: formData.difficulty,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        assignmentData: {
          instructions: formData.instructions,
          dueDate: formData.dueDate,
          submissionType: formData.submissionType,
          maxFileSize: formData.submissionType === 'FILE' ? formData.maxFileSize : undefined,
          allowedFileTypes: formData.submissionType === 'FILE' ? formData.allowedFileTypes : undefined,
          rubric: formData.rubric,
          isGroupAssignment: formData.isGroupAssignment,
          maxGroupSize: formData.isGroupAssignment ? formData.maxGroupSize : undefined,
          plagiarismCheck: formData.plagiarismCheck
        }
      }

      await onSave(assignmentContent)
    } catch (error) {
      console.error('Error saving assignment:', error)
    } finally {
      setIsSaving(false)
    }
  }, [initialData, sessionId, onSave])

  const handlePreview = useCallback(() => {
    const formData = form.getValues()
    const assignmentContent: AssignmentContent = {
      id: generateId(),
      sessionId,
      type: ContentType.ASSIGNMENT,
      title: formData.title,
      description: formData.description,
      order: 0,
      isFree: true,
      duration: formData.duration,
      points: formData.points,
      difficulty: formData.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignmentData: {
        instructions: formData.instructions,
        dueDate: formData.dueDate,
        submissionType: formData.submissionType,
        maxFileSize: formData.maxFileSize,
        allowedFileTypes: formData.allowedFileTypes,
        rubric: formData.rubric,
        isGroupAssignment: formData.isGroupAssignment,
        maxGroupSize: formData.maxGroupSize,
        plagiarismCheck: formData.plagiarismCheck
      }
    }
    
    onPreview?.(assignmentContent)
    setIsPreviewOpen(true)
  }, [form, sessionId, onPreview])

  const addRubricItem = useCallback(() => {
    appendRubric({
      criteria: '',
      points: 10,
      description: ''
    })
  }, [appendRubric])

  // ===============================================================
  // 🎯 WATCH VALUES
  // ===============================================================
  
  const watchSubmissionType = form.watch('submissionType')
  const watchIsGroupAssignment = form.watch('isGroupAssignment')

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Assignment' : 'Create Assignment'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create homework assignments with submission and grading options
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
            {isSaving ? 'Saving...' : 'Save Assignment'}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="e.g., Essay on Russian Literature"
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
                placeholder="Brief description of the assignment..."
                rows={2}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions *</Label>
              <Textarea
                id="instructions"
                {...form.register('instructions')}
                placeholder="Detailed instructions for students..."
                rows={4}
                className={form.formState.errors.instructions ? 'border-red-500' : ''}
              />
              {form.formState.errors.instructions && (
                <p className="text-sm text-red-600">{form.formState.errors.instructions.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Assignment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !form.watch('dueDate') && 'text-muted-foreground'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('dueDate') ? (
                      format(form.watch('dueDate'), 'PPP', { locale: id })
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch('dueDate')}
                    onSelect={(date) => form.setValue('dueDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Submission Type */}
            <div className="space-y-2">
              <Label>Submission Type *</Label>
              <Select
                value={form.watch('submissionType')}
                onValueChange={(value) => form.setValue('submissionType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select submission type" />
                </SelectTrigger>
                <SelectContent>
                  {SUBMISSION_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-600">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Settings */}
            {watchSubmissionType === 'FILE' && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">File Upload Settings</h4>
                
                {/* Max File Size */}
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    {...form.register('maxFileSize', { valueAsNumber: true })}
                  />
                </div>

                {/* Allowed File Types */}
                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FILE_TYPES.map((fileType) => (
                      <label key={fileType.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={fileType.value}
                          checked={form.watch('allowedFileTypes')?.includes(fileType.value) || false}
                          onChange={(e) => {
                            const currentTypes = form.watch('allowedFileTypes') || []
                            if (e.target.checked) {
                              form.setValue('allowedFileTypes', [...currentTypes, fileType.value])
                            } else {
                              form.setValue('allowedFileTypes', currentTypes.filter(t => t !== fileType.value))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{fileType.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Points and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="100"
                  {...form.register('points', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Advanced Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Group Assignment */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Group Assignment</Label>
                <p className="text-sm text-gray-600">Allow students to work in groups</p>
              </div>
              <Switch
                checked={form.watch('isGroupAssignment')}
                onCheckedChange={(checked) => form.setValue('isGroupAssignment', checked)}
              />
            </div>

            {/* Max Group Size */}
            {watchIsGroupAssignment && (
              <div className="space-y-2">
                <Label htmlFor="maxGroupSize">Maximum Group Size</Label>
                <Input
                  id="maxGroupSize"
                  type="number"
                  min="2"
                  max="10"
                  {...form.register('maxGroupSize', { valueAsNumber: true })}
                />
              </div>
            )}

            {/* Plagiarism Check */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Plagiarism Check</Label>
                <p className="text-sm text-gray-600">Enable automatic plagiarism detection</p>
              </div>
              <Switch
                checked={form.watch('plagiarismCheck')}
                onCheckedChange={(checked) => form.setValue('plagiarismCheck', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grading Rubric */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Grading Rubric
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rubricFields.length === 0 ? (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No grading criteria added yet</p>
                <Button type="button" onClick={addRubricItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grading Criteria
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {rubricFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Criteria {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRubric(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Criteria Name</Label>
                          <Input
                            {...form.register(`rubric.${index}.criteria`)}
                            placeholder="e.g., Content Quality"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            min="1"
                            {...form.register(`rubric.${index}.points`, { valueAsNumber: true })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            {...form.register(`rubric.${index}.description`)}
                            placeholder="Criteria description..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button type="button" onClick={addRubricItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Criteria
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
AssignmentBuilder.displayName = 'AssignmentBuilder'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function RubricEditor({ rubric, onUpdate }: RubricEditorProps) {
  const addCriteria = () => {
    onUpdate([...rubric, { criteria: '', points: 10, description: '' }])
  }

  const updateCriteria = (index: number, field: string, value: any) => {
    const updated = rubric.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onUpdate(updated)
  }

  const removeCriteria = (index: number) => {
    onUpdate(rubric.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {rubric.map((item, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="grid grid-cols-3 gap-3">
            <Input
              placeholder="Criteria name"
              value={item.criteria}
              onChange={(e) => updateCriteria(index, 'criteria', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Points"
              value={item.points}
              onChange={(e) => updateCriteria(index, 'points', parseInt(e.target.value) || 0)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateCriteria(index, 'description', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCriteria(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <Button type="button" onClick={addCriteria} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Criteria
      </Button>
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default AssignmentBuilder
export { RubricEditor, type AssignmentBuilderProps }