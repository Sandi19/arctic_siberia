// File: src/components/quiz/builder/essay-builder.tsx

'use client'

// ✅ FIXED: Framework & Core Imports
import React, { useState, useCallback, useMemo } from 'react'

// ✅ FIXED: UI Components menggunakan barrel imports dari index.ts
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress
} from '@/components/ui'

// Icons
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  Target,
  Type,
  Hash
} from 'lucide-react'

// External Libraries
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { EssayQuestion, GradingCriteria, EssayRequirement } from '../types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const gradingCriteriaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Criteria name is required'),
  description: z.string().optional(),
  maxPoints: z.number().min(1).max(100),
  weight: z.number().min(0.1).max(1.0).default(1.0),
  rubric: z.array(z.object({
    level: z.string(),
    description: z.string(),
    points: z.number()
  })).optional()
})

const essayRequirementSchema = z.object({
  id: z.string(),
  type: z.enum(['word_count', 'paragraph_count', 'sentence_count', 'time_limit', 'format', 'topic_coverage']),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  required: z.boolean().default(true)
})

const essayQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(2000, 'Question too long'),
  prompt: z.string().min(20, 'Essay prompt must be at least 20 characters').max(3000, 'Prompt too long'),
  instructions: z.string().optional(),
  requirements: z.array(essayRequirementSchema).optional(),
  gradingCriteria: z.array(gradingCriteriaSchema).min(1, 'At least one grading criteria required'),
  sampleAnswer: z.string().optional(),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  timeLimit: z.number().min(5).max(180).optional(), // in minutes
  wordCountMin: z.number().min(10).optional(),
  wordCountMax: z.number().min(50).optional(),
  allowRichText: z.boolean().default(false),
  showWordCount: z.boolean().default(true),
  showCharacterCount: z.boolean().default(false),
  autoSave: z.boolean().default(true),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
})

type EssayFormData = z.infer<typeof essayQuestionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface EssayBuilderProps {
  initialData?: Partial<EssayQuestion>
  onSave: (question: EssayQuestion) => void
  onCancel: () => void
  onPreview?: (question: EssayQuestion) => void
  isEditing?: boolean
  className?: string
}

interface GradingCriteriaEditorProps {
  criteria: GradingCriteria
  index: number
  onUpdate: (index: number, criteria: GradingCriteria) => void
  onDelete: (index: number) => void
}

interface RequirementEditorProps {
  requirement: EssayRequirement
  index: number
  onUpdate: (index: number, requirement: EssayRequirement) => void
  onDelete: (index: number) => void
}

interface QuestionPreview {
  question: EssayQuestion
  isVisible: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `essay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createEmptyGradingCriteria = (): GradingCriteria => ({
  id: generateId(),
  name: '',
  description: '',
  maxPoints: 10,
  weight: 1.0,
  rubric: [
    { level: 'Excellent', description: '', points: 10 },
    { level: 'Good', description: '', points: 8 },
    { level: 'Satisfactory', description: '', points: 6 },
    { level: 'Needs Improvement', description: '', points: 4 },
    { level: 'Poor', description: '', points: 2 }
  ]
})

const createEmptyRequirement = (): EssayRequirement => ({
  id: generateId(),
  type: 'word_count',
  label: '',
  value: '',
  required: true
})

const createDefaultQuestion = (): Partial<EssayQuestion> => ({
  question: '',
  prompt: '',
  instructions: '',
  requirements: [],
  gradingCriteria: [createEmptyGradingCriteria()],
  sampleAnswer: '',
  explanation: '',
  hints: [],
  points: 20,
  timeLimit: undefined,
  wordCountMin: 100,
  wordCountMax: 500,
  allowRichText: false,
  showWordCount: true,
  showCharacterCount: false,
  autoSave: true,
  difficulty: 'medium'
})

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'hard': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const calculateTotalMaxPoints = (criteria: GradingCriteria[]): number => {
  return criteria.reduce((total, criterion) => total + criterion.maxPoints, 0)
}

const validateFormData = (data: EssayFormData): string[] => {
  const errors: string[] = []
  
  // Validate word count constraints
  if (data.wordCountMin && data.wordCountMax && data.wordCountMin >= data.wordCountMax) {
    errors.push('Minimum word count must be less than maximum word count')
  }
  
  // Validate grading criteria
  if (data.gradingCriteria.length === 0) {
    errors.push('At least one grading criteria is required')
  }
  
  data.gradingCriteria.forEach((criteria, index) => {
    if (!criteria.name.trim()) {
      errors.push(`Grading criteria ${index + 1} must have a name`)
    }
    if (criteria.maxPoints <= 0) {
      errors.push(`Grading criteria ${index + 1} must have points greater than 0`)
    }
  })
  
  return errors
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function GradingCriteriaEditor({ 
  criteria, 
  index, 
  onUpdate, 
  onDelete 
}: GradingCriteriaEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleUpdateCriteria = (field: keyof GradingCriteria, value: any) => {
    onUpdate(index, { ...criteria, [field]: value })
  }
  
  const handleUpdateRubricLevel = (levelIndex: number, field: string, value: any) => {
    const newRubric = [...(criteria.rubric || [])]
    newRubric[levelIndex] = { ...newRubric[levelIndex], [field]: value }
    handleUpdateCriteria('rubric', newRubric)
  }
  
  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            Criteria {index + 1}: {criteria.name || 'Untitled'}
            <Badge variant="outline">{criteria.maxPoints} pts</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Criteria Name *</Label>
              <Input
                value={criteria.name}
                onChange={(e) => handleUpdateCriteria('name', e.target.value)}
                placeholder="e.g., Content Quality, Grammar, Structure..."
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Max Points</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={criteria.maxPoints}
                onChange={(e) => handleUpdateCriteria('maxPoints', parseInt(e.target.value) || 1)}
                className="text-sm"
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={criteria.description || ''}
              onChange={(e) => handleUpdateCriteria('description', e.target.value)}
              placeholder="Describe what this criteria evaluates..."
              rows={2}
              className="text-sm"
            />
          </div>
          
          {/* Weight */}
          <div className="space-y-2">
            <Label className="text-xs">Weight (0.1 - 1.0)</Label>
            <Input
              type="number"
              min="0.1"
              max="1.0"
              step="0.1"
              value={criteria.weight}
              onChange={(e) => handleUpdateCriteria('weight', parseFloat(e.target.value) || 1.0)}
              className="w-20 text-sm"
            />
            <p className="text-xs text-gray-500">
              1.0 = full weight, 0.5 = half weight, etc.
            </p>
          </div>
          
          {/* Rubric Levels */}
          <div className="space-y-3">
            <Label className="text-xs">Grading Rubric</Label>
            {criteria.rubric && criteria.rubric.map((level, levelIndex) => (
              <div key={levelIndex} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Input
                    value={level.level}
                    onChange={(e) => handleUpdateRubricLevel(levelIndex, 'level', e.target.value)}
                    placeholder="Level name"
                    className="text-xs"
                  />
                </div>
                <div className="col-span-7">
                  <Input
                    value={level.description}
                    onChange={(e) => handleUpdateRubricLevel(levelIndex, 'description', e.target.value)}
                    placeholder="Description of this performance level..."
                    className="text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    max={criteria.maxPoints}
                    value={level.points}
                    onChange={(e) => handleUpdateRubricLevel(levelIndex, 'points', parseInt(e.target.value) || 0)}
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function RequirementEditor({ 
  requirement, 
  index, 
  onUpdate, 
  onDelete 
}: RequirementEditorProps) {
  const requirementTypes = [
    { value: 'word_count', label: 'Word Count', placeholder: 'e.g., 300-500 words' },
    { value: 'paragraph_count', label: 'Paragraph Count', placeholder: 'e.g., 3-5 paragraphs' },
    { value: 'sentence_count', label: 'Sentence Count', placeholder: 'e.g., minimum 10 sentences' },
    { value: 'time_limit', label: 'Time Limit', placeholder: 'e.g., 30 minutes' },
    { value: 'format', label: 'Format', placeholder: 'e.g., MLA format, include citations' },
    { value: 'topic_coverage', label: 'Topic Coverage', placeholder: 'e.g., address 3 main points' }
  ]
  
  const currentType = requirementTypes.find(t => t.value === requirement.type)
  
  return (
    <div className="flex items-center gap-3 p-3 border rounded bg-white">
      <Switch
        checked={requirement.required}
        onCheckedChange={(checked) => onUpdate(index, { ...requirement, required: checked })}
      />
      
      <Select 
        value={requirement.type} 
        onValueChange={(value) => onUpdate(index, { ...requirement, type: value as any })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {requirementTypes.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        value={requirement.label}
        onChange={(e) => onUpdate(index, { ...requirement, label: e.target.value })}
        placeholder="Requirement name..."
        className="flex-1"
      />
      
      <Input
        value={requirement.value.toString()}
        onChange={(e) => onUpdate(index, { ...requirement, value: e.target.value })}
        placeholder={currentType?.placeholder || 'Value...'}
        className="flex-1"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

function QuestionPreviewPanel({ question, isVisible }: QuestionPreview) {
  if (!isVisible) return null
  
  const totalCriteriaPoints = calculateTotalMaxPoints(question.gradingCriteria || [])
  const wordCountRange = question.wordCountMin && question.wordCountMax 
    ? `${question.wordCountMin}-${question.wordCountMax} words`
    : question.wordCountMin 
      ? `min ${question.wordCountMin} words`
      : question.wordCountMax 
        ? `max ${question.wordCountMax} words`
        : 'No word limit'
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Essay Question Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Header */}
        <div className="prose prose-sm max-w-none">
          <h4 className="text-base font-medium text-gray-900">
            {question.question || "Essay question will appear here..."}
          </h4>
          
          {question.instructions && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Instructions:</strong> {question.instructions}
            </p>
          )}
        </div>
        
        {/* Essay Prompt */}
        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <h5 className="text-sm font-medium text-purple-800 mb-2">Essay Prompt:</h5>
          <div className="text-sm text-purple-700 leading-relaxed">
            {question.prompt || "Essay prompt will appear here..."}
          </div>
        </div>
        
        {/* Requirements */}
        {question.requirements && question.requirements.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Requirements:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.requirements.map((req, index) => (
                <div key={req.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {req.required ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">{req.label}: {req.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Word Count & Time */}
        <div className="flex items-center gap-4 text-sm">
          <Badge className="bg-blue-100 text-blue-800">
            <Type className="w-3 h-3 mr-1" />
            {wordCountRange}
          </Badge>
          
          {question.timeLimit && (
            <Badge className="bg-orange-100 text-orange-800">
              <Clock className="w-3 h-3 mr-1" />
              {question.timeLimit} minutes
            </Badge>
          )}
          
          <Badge className={getDifficultyColor(question.difficulty || 'medium')}>
            {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1)}
          </Badge>
          
          <Badge className="bg-purple-100 text-purple-800">
            {question.points} points total
          </Badge>
        </div>
        
        {/* Essay Input Area Simulation */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h6 className="text-sm font-medium text-gray-700">Student Essay Area</h6>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {question.showWordCount && <span>Word count: 0</span>}
              {question.showCharacterCount && <span>Characters: 0</span>}
              {question.autoSave && <span>Auto-save enabled</span>}
            </div>
          </div>
          <div className="min-h-32 p-3 bg-white border rounded text-sm text-gray-400 italic">
            Student will type their essay here...
            {question.allowRichText && <span className="block mt-2">Rich text formatting enabled</span>}
          </div>
        </div>
        
        {/* Grading Criteria */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Grading Criteria:</h5>
          <div className="space-y-3">
            {question.gradingCriteria?.map((criteria, index) => (
              <div key={criteria.id} className="p-3 border rounded bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{criteria.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{criteria.maxPoints} points</Badge>
                    <Badge variant="outline">Weight: {criteria.weight}</Badge>
                  </div>
                </div>
                
                {criteria.description && (
                  <p className="text-sm text-gray-600 mb-2">{criteria.description}</p>
                )}
                
                {criteria.rubric && (
                  <div className="space-y-1">
                    {criteria.rubric.map((level, levelIndex) => (
                      <div key={levelIndex} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{level.level}:</span>
                        <span className="flex-1 mx-2 text-gray-600">{level.description}</span>
                        <span className="font-medium">{level.points} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-purple-50 rounded border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-purple-800">Total Criteria Points:</span>
              <span className="font-bold text-purple-900">{totalCriteriaPoints} points</span>
            </div>
          </div>
        </div>
        
        {/* Sample Answer */}
        {question.sampleAnswer && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="text-sm font-medium text-green-800 mb-2">Sample Answer:</h5>
            <div className="text-sm text-green-700 leading-relaxed whitespace-pre-wrap">
              {question.sampleAnswer}
            </div>
          </div>
        )}
        
        {/* Explanation */}
        {question.explanation && (
          <div className="p-3 bg-blue-50 rounded">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Explanation:</h5>
            <p className="text-sm text-blue-700">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function EssayBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: EssayBuilderProps) {
  // State Management
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Form Setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<EssayFormData>({
    resolver: zodResolver(essayQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedData = watch()

  // Event Handlers
  const handleAddGradingCriteria = useCallback(() => {
    if (watchedData.gradingCriteria.length >= 10) {
      toast.error('Maximum 10 grading criteria allowed')
      return
    }
    
    const newCriteria = [...watchedData.gradingCriteria, createEmptyGradingCriteria()]
    setValue('gradingCriteria', newCriteria)
    toast.success('Grading criteria added')
  }, [watchedData.gradingCriteria, setValue])

  const handleUpdateGradingCriteria = useCallback((index: number, updatedCriteria: GradingCriteria) => {
    const newCriteria = [...watchedData.gradingCriteria]
    newCriteria[index] = updatedCriteria
    setValue('gradingCriteria', newCriteria)
  }, [watchedData.gradingCriteria, setValue])

  const handleDeleteGradingCriteria = useCallback((index: number) => {
    if (watchedData.gradingCriteria.length <= 1) {
      toast.error('At least one grading criteria required')
      return
    }
    
    const newCriteria = watchedData.gradingCriteria.filter((_, i) => i !== index)
    setValue('gradingCriteria', newCriteria)
    toast.success('Grading criteria deleted')
  }, [watchedData.gradingCriteria, setValue])

  const handleAddRequirement = useCallback(() => {
    const newRequirements = [...(watchedData.requirements || []), createEmptyRequirement()]
    setValue('requirements', newRequirements)
    toast.success('Requirement added')
  }, [watchedData.requirements, setValue])

  const handleUpdateRequirement = useCallback((index: number, updatedRequirement: EssayRequirement) => {
    const newRequirements = [...(watchedData.requirements || [])]
    newRequirements[index] = updatedRequirement
    setValue('requirements', newRequirements)
  }, [watchedData.requirements, setValue])

  const handleDeleteRequirement = useCallback((index: number) => {
    const newRequirements = (watchedData.requirements || []).filter((_, i) => i !== index)
    setValue('requirements', newRequirements)
    toast.success('Requirement deleted')
  }, [watchedData.requirements, setValue])

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), '']
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index)
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const onSubmit = useCallback((data: EssayFormData) => {
    const customErrors = validateFormData(data)
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors)
      toast.error('Please fix validation errors')
      return
    }

    setValidationErrors([])

    const question: EssayQuestion = {
      id: initialData?.id || generateId(),
      type: 'essay',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(question)
    toast.success(isEditing ? 'Essay question updated' : 'Essay question created')
  }, [initialData, onSave, isEditing])

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: EssayQuestion = {
        id: initialData?.id || generateId(),
        type: 'essay',
        ...watchedData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onPreview(question)
    }
  }, [onPreview, isValid, watchedData, initialData])

  // Computed values
  const totalCriteriaPoints = calculateTotalMaxPoints(watchedData.gradingCriteria)
  const hasWordCountLimits = watchedData.wordCountMin || watchedData.wordCountMax

  return (
    <Card className={cn("w-full max-w-5xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Essay Question' : 'Create Essay Question'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium">
              Question Title <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="question"
                  placeholder="Enter a concise question title..."
                  className={cn(
                    "transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                    errors.question && "border-red-500"
                  )}
                />
              )}
            />
            {errors.question && (
              <p className="text-sm text-red-600">{errors.question.message}</p>
            )}
          </div>

          {/* Essay Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Essay Prompt <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="prompt"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="prompt"
                  placeholder="Write the detailed essay prompt that students will respond to..."
                  rows={4}
                  className={cn(
                    "transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                    errors.prompt && "border-red-500"
                  )}
                />
              )}
            />
            {errors.prompt && (
              <p className="text-sm text-red-600">{errors.prompt.message}</p>
            )}
            <p className="text-xs text-gray-500">
              This is the main prompt that students will see. Be clear and specific about what you want them to write.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Additional Instructions (Optional)
            </Label>
            <Controller
              name="instructions"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="instructions"
                  placeholder="Any additional instructions or guidelines for students..."
                  rows={2}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Essay Requirements (Optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Requirement
              </Button>
            </div>

            {watchedData.requirements && watchedData.requirements.length > 0 ? (
              <div className="space-y-3">
                {watchedData.requirements.map((requirement, index) => (
                  <RequirementEditor
                    key={requirement.id}
                    requirement={requirement}
                    index={index}
                    onUpdate={handleUpdateRequirement}
                    onDelete={handleDeleteRequirement}
                  />
                ))}
              </div>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <Target className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Add specific requirements like word count, format, or topic coverage to guide students.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Basic Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Basic Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Points */}
              <div className="space-y-2">
                <Label htmlFor="points" className="text-sm">Total Points</Label>
                <Controller
                  name="points"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="points"
                      type="number"
                      min="1"
                      max="100"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  )}
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-sm">Difficulty Level</Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="text-sm">Time Limit (minutes)</Label>
                <Controller
                  name="timeLimit"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="timeLimit"
                      type="number"
                      min="5"
                      max="180"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Optional"
                      className="w-full"
                    />
                  )}
                />
              </div>

              {/* Word Count Min */}
              <div className="space-y-2">
                <Label htmlFor="wordCountMin" className="text-sm">Min Word Count</Label>
                <Controller
                  name="wordCountMin"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="wordCountMin"
                      type="number"
                      min="10"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Optional"
                      className="w-full"
                    />
                  )}
                />
              </div>

              {/* Word Count Max */}
              <div className="space-y-2">
                <Label htmlFor="wordCountMax" className="text-sm">Max Word Count</Label>
                <Controller
                  name="wordCountMax"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="wordCountMax"
                      type="number"
                      min="50"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Optional"
                      className="w-full"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Essay Features</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allow Rich Text */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Rich Text Editor</Label>
                  <p className="text-xs text-gray-600">Allow formatting, bold, italic, etc.</p>
                </div>
                <Controller
                  name="allowRichText"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Show Word Count */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Show Word Count</Label>
                  <p className="text-xs text-gray-600">Display live word count to students</p>
                </div>
                <Controller
                  name="showWordCount"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Show Character Count */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Show Character Count</Label>
                  <p className="text-xs text-gray-600">Display character count</p>
                </div>
                <Controller
                  name="showCharacterCount"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Auto-Save</Label>
                  <p className="text-xs text-gray-600">Automatically save student progress</p>
                </div>
                <Controller
                  name="autoSave"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Grading Criteria */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Grading Criteria <span className="text-red-500">*</span>
                <Badge variant="outline" className="ml-2">
                  {watchedData.gradingCriteria.length} criteria • {totalCriteriaPoints} points
                </Badge>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGradingCriteria}
                disabled={watchedData.gradingCriteria.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Criteria
              </Button>
            </div>

            <div className="space-y-3">
              {watchedData.gradingCriteria.map((criteria, index) => (
                <GradingCriteriaEditor
                  key={criteria.id}
                  criteria={criteria}
                  index={index}
                  onUpdate={handleUpdateGradingCriteria}
                  onDelete={handleDeleteGradingCriteria}
                />
              ))}
            </div>

            {totalCriteriaPoints !== watchedData.points && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Points Mismatch:</strong> Total criteria points ({totalCriteriaPoints}) 
                  don't match question points ({watchedData.points}). 
                  Consider adjusting either the criteria points or the total question points.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Sample Answer */}
          <div className="space-y-2">
            <Label htmlFor="sampleAnswer" className="text-sm font-medium">
              Sample Answer (Optional)
            </Label>
            <Controller
              name="sampleAnswer"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="sampleAnswer"
                  placeholder="Provide a sample answer that demonstrates what you're looking for..."
                  rows={6}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            <p className="text-xs text-gray-500">
              This will be shown to instructors for grading reference and can be shared with students after submission.
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-sm font-medium">
              Explanation (Optional)
            </Label>
            <Controller
              name="explanation"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="explanation"
                  placeholder="Explain the purpose of this essay question or what students should focus on..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* Hints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hints (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHint}
                disabled={(watchedData.hints?.length || 0) >= 5}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Hint
              </Button>
            </div>

            {watchedData.hints && watchedData.hints.length > 0 && (
              <div className="space-y-2">
                {watchedData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...watchedData.hints!]
                        newHints[index] = e.target.value
                        setValue('hints', newHints)
                      }}
                      placeholder={`Hint ${index + 1}...`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteHint(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!isValid}
                >
                  <Target className="w-4 h-4 mr-1" />
                  External Preview
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid || validationErrors.length > 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? 'Update Essay Question' : 'Create Essay Question'}
              </Button>
            </div>
          </div>
        </form>

        {/* Preview Panel */}
        {showPreview && (
          <QuestionPreviewPanel 
            question={{
              id: generateId(),
              type: 'essay',
              ...watchedData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }} 
            isVisible={showPreview} 
          />
        )}
      </CardContent>
    </Card>
  )
}

// Component Display Name
EssayBuilder.displayName = 'EssayBuilder'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default EssayBuilder
export { 
  GradingCriteriaEditor,
  RequirementEditor,
  QuestionPreviewPanel,
  generateId,
  createEmptyGradingCriteria,
  createEmptyRequirement,
  createDefaultQuestion,
  getDifficultyColor,
  calculateTotalMaxPoints,
  validateFormData,
  type EssayBuilderProps,
  type GradingCriteriaEditorProps,
  type RequirementEditorProps,
  type QuestionPreview
}