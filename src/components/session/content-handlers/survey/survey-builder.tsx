// File: src/components/session/content-handlers/survey/survey-builder.tsx

'use client'

import React, { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Checkbox
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  Move,
  BarChart3,
  MessageSquare,
  CheckSquare,
  Star,
  Sliders,
  Settings,
  Users,
  Clock,
  Target,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Info,
  CalendarIcon,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Download,
  Upload,
  FileText,
  Hash,
  Zap
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  SurveyContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const questionValidationSchema = z.object({
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).optional(),
  pattern: z.string().optional()
})

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'TEXT', 'RATING', 'LIKERT', 'CHECKBOX'], {
    required_error: 'Question type is required'
  }),
  question: z.string().min(1, 'Question text is required'),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
  validation: questionValidationSchema.optional(),
  order: z.number(),
  logic: z.object({
    showWhen: z.string().optional(),
    hideWhen: z.string().optional(),
    requiredWhen: z.string().optional()
  }).optional()
})

const surveySchema = z.object({
  title: z.string().min(1, 'Survey title is required'),
  description: z.string().optional(),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
  isAnonymous: z.boolean().default(false),
  allowMultipleSubmissions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  resultsVisibility: z.enum(['IMMEDIATE', 'AFTER_SUBMISSION', 'NEVER']).default('AFTER_SUBMISSION'),
  expiresAt: z.date().optional(),
  duration: z.number().min(5).optional(),
  points: z.number().min(0).max(100).default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
  collectEmail: z.boolean().default(false),
  collectName: z.boolean().default(false),
  shuffleQuestions: z.boolean().default(false),
  progressBar: z.boolean().default(true),
  customTheme: z.object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional()
  }).optional()
})

type SurveyFormData = z.infer<typeof surveySchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface SurveyBuilderProps {
  initialData?: Partial<SurveyContent>
  onSave: (content: SurveyContent) => void
  onCancel: () => void
  onPreview?: (content: SurveyContent) => void
  isEditing?: boolean
  sessionId: string
  className?: string
}

interface QuestionEditorProps {
  question: {
    id: string
    type: 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'LIKERT' | 'CHECKBOX'
    question: string
    description?: string
    options?: string[]
    isRequired: boolean
    validation?: {
      minLength?: number
      maxLength?: number
      pattern?: string
    }
    order: number
  }
  index: number
  onUpdate: (index: number, question: any) => void
  onDelete: (index: number) => void
  onDuplicate: (index: number) => void
}

interface SurveyPreviewProps {
  survey: SurveyContent
  onClose: () => void
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateQuestionId = (): string => {
  return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createDefaultSurvey = (): Partial<SurveyContent> => ({
  type: ContentType.SURVEY,
  surveyData: {
    questions: [],
    isAnonymous: false,
    allowMultipleSubmissions: false,
    showResults: true,
    resultsVisibility: 'AFTER_SUBMISSION'
  }
})

const QUESTION_TYPES = [
  {
    value: 'MULTIPLE_CHOICE',
    label: 'Multiple Choice',
    icon: RadioGroup,
    description: 'Single selection from multiple options',
    defaultOptions: ['Option 1', 'Option 2', 'Option 3'],
    color: 'bg-blue-50 border-blue-200'
  },
  {
    value: 'CHECKBOX',
    label: 'Checkbox',
    icon: CheckSquare,
    description: 'Multiple selections allowed',
    defaultOptions: ['Option 1', 'Option 2', 'Option 3'],
    color: 'bg-green-50 border-green-200'
  },
  {
    value: 'TEXT',
    label: 'Text Response',
    icon: MessageSquare,
    description: 'Open-ended text answer',
    defaultOptions: [],
    color: 'bg-purple-50 border-purple-200'
  },
  {
    value: 'RATING',
    label: 'Rating Scale',
    icon: Star,
    description: 'Numeric rating (1-5 or 1-10)',
    defaultOptions: ['1', '2', '3', '4', '5'],
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    value: 'LIKERT',
    label: 'Likert Scale',
    icon: Sliders,
    description: 'Agreement scale (Strongly Disagree to Strongly Agree)',
    defaultOptions: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    color: 'bg-orange-50 border-orange-200'
  }
]

const LIKERT_SCALES = {
  agreement5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  agreement7: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'],
  satisfaction5: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
  frequency5: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  importance5: ['Not Important', 'Slightly Important', 'Moderately Important', 'Important', 'Very Important']
}

const RATING_SCALES = {
  scale5: ['1', '2', '3', '4', '5'],
  scale10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  emoji5: ['😢', '😕', '😐', '😊', '😍']
}

// =================================================================
// 🎯 SORTABLE QUESTION ITEM COMPONENT
// =================================================================

function SortableQuestionItem({ 
  question, 
  index, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: QuestionEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        question={question}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function SurveyBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  sessionId,
  className = ''
}: SurveyBuilderProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('questions')

  // ===============================================================
  // 🎯 DND KIT SENSORS
  // ===============================================================
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ===============================================================
  // 🎯 FORM SETUP
  // ===============================================================
  
  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      instructions: initialData?.surveyData?.instructions || '',
      questions: initialData?.surveyData?.questions || [
        {
          id: generateQuestionId(),
          type: 'MULTIPLE_CHOICE' as const,
          question: 'How would you rate this content?',
          options: ['Excellent', 'Good', 'Average', 'Poor'],
          isRequired: true,
          order: 0
        }
      ],
      isAnonymous: initialData?.surveyData?.isAnonymous || false,
      allowMultipleSubmissions: initialData?.surveyData?.allowMultipleSubmissions || false,
      showResults: initialData?.surveyData?.showResults || true,
      resultsVisibility: initialData?.surveyData?.resultsVisibility || 'AFTER_SUBMISSION',
      expiresAt: initialData?.surveyData?.expiresAt,
      duration: initialData?.duration || 15,
      points: initialData?.points || 0,
      difficulty: initialData?.difficulty || 'easy',
      collectEmail: false,
      collectName: false,
      shuffleQuestions: false,
      progressBar: true,
      customTheme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937'
      }
    }
  })

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
    control: form.control,
    name: 'questions'
  })

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleSave = useCallback(async (formData: SurveyFormData) => {
    try {
      setIsSaving(true)
      
      const surveyContent: SurveyContent = {
        id: initialData?.id || generateId(),
        sessionId,
        type: ContentType.SURVEY,
        title: formData.title,
        description: formData.description,
        order: initialData?.order || 0,
        isFree: initialData?.isFree || true,
        duration: formData.duration,
        points: formData.points,
        difficulty: formData.difficulty,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        surveyData: {
          questions: formData.questions,
          isAnonymous: formData.isAnonymous,
          allowMultipleSubmissions: formData.allowMultipleSubmissions,
          showResults: formData.showResults,
          resultsVisibility: formData.resultsVisibility,
          expiresAt: formData.expiresAt
        }
      }

      await onSave(surveyContent)
    } catch (error) {
      console.error('Error saving survey:', error)
    } finally {
      setIsSaving(false)
    }
  }, [initialData, sessionId, onSave])

  const handlePreview = useCallback(() => {
    const formData = form.getValues()
    const surveyContent: SurveyContent = {
      id: generateId(),
      sessionId,
      type: ContentType.SURVEY,
      title: formData.title,
      description: formData.description,
      order: 0,
      isFree: true,
      duration: formData.duration,
      points: formData.points,
      difficulty: formData.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      surveyData: {
        questions: formData.questions,
        isAnonymous: formData.isAnonymous,
        allowMultipleSubmissions: formData.allowMultipleSubmissions,
        showResults: formData.showResults,
        resultsVisibility: formData.resultsVisibility,
        expiresAt: formData.expiresAt
      }
    }
    
    onPreview?.(surveyContent)
    setIsPreviewOpen(true)
  }, [form, sessionId, onPreview])

  const addQuestion = useCallback((type: 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'LIKERT' | 'CHECKBOX' = 'MULTIPLE_CHOICE') => {
    const questionType = QUESTION_TYPES.find(qt => qt.value === type)
    
    const newQuestion = {
      id: generateQuestionId(),
      type,
      question: `New ${questionType?.label || 'Question'}`,
      description: '',
      options: questionType?.defaultOptions || [],
      isRequired: false,
      order: questionFields.length
    }
    
    appendQuestion(newQuestion)
  }, [questionFields.length, appendQuestion])

  const duplicateQuestion = useCallback((index: number) => {
    const questions = form.getValues('questions')
    const questionToDuplicate = questions[index]
    
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: generateQuestionId(),
      question: questionToDuplicate.question + ' (Copy)',
      order: questionToDuplicate.order + 0.5
    }
    
    const newQuestions = [...questions]
    newQuestions.splice(index + 1, 0, duplicatedQuestion)
    
    // Reorder questions
    newQuestions.forEach((question, questionIndex) => {
      question.order = questionIndex
    })
    
    form.setValue('questions', newQuestions)
  }, [form])

  const updateQuestion = useCallback((index: number, updatedQuestion: any) => {
    const questions = form.getValues('questions')
    questions[index] = { ...questions[index], ...updatedQuestion }
    form.setValue('questions', questions)
  }, [form])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const questions = form.getValues('questions')
      const oldIndex = questions.findIndex(q => q.id === active.id)
      const newIndex = questions.findIndex(q => q.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(questions, oldIndex, newIndex)
        
        // Update order values
        newQuestions.forEach((question, index) => {
          question.order = index
        })
        
        form.setValue('questions', newQuestions)
      }
    }
  }, [form])

  const loadTemplate = useCallback((templateType: 'feedback' | 'satisfaction' | 'evaluation' | 'nps') => {
    let templateQuestions: any[] = []
    
    switch (templateType) {
      case 'feedback':
        templateQuestions = [
          {
            id: generateQuestionId(),
            type: 'RATING',
            question: 'How would you rate the overall quality of this content?',
            options: ['1', '2', '3', '4', '5'],
            isRequired: true,
            order: 0
          },
          {
            id: generateQuestionId(),
            type: 'MULTIPLE_CHOICE',
            question: 'What did you like most about this session?',
            options: ['Content quality', 'Presentation style', 'Practical examples', 'Interactive elements'],
            isRequired: false,
            order: 1
          },
          {
            id: generateQuestionId(),
            type: 'TEXT',
            question: 'What could be improved?',
            isRequired: false,
            order: 2
          }
        ]
        break
      
      case 'satisfaction':
        templateQuestions = [
          {
            id: generateQuestionId(),
            type: 'LIKERT',
            question: 'I found this content helpful and relevant',
            options: LIKERT_SCALES.agreement5,
            isRequired: true,
            order: 0
          },
          {
            id: generateQuestionId(),
            type: 'LIKERT',
            question: 'The content was presented clearly',
            options: LIKERT_SCALES.agreement5,
            isRequired: true,
            order: 1
          },
          {
            id: generateQuestionId(),
            type: 'RATING',
            question: 'Overall satisfaction',
            options: RATING_SCALES.scale10,
            isRequired: true,
            order: 2
          }
        ]
        break
      
      case 'evaluation':
        templateQuestions = [
          {
            id: generateQuestionId(),
            type: 'CHECKBOX',
            question: 'Which topics were covered effectively?',
            options: ['Basic concepts', 'Advanced techniques', 'Practical applications', 'Real-world examples'],
            isRequired: false,
            order: 0
          },
          {
            id: generateQuestionId(),
            type: 'RATING',
            question: 'Difficulty level (1=Too Easy, 5=Too Hard)',
            options: RATING_SCALES.scale5,
            isRequired: true,
            order: 1
          },
          {
            id: generateQuestionId(),
            type: 'TEXT',
            question: 'Additional comments or suggestions',
            isRequired: false,
            order: 2
          }
        ]
        break
      
      case 'nps':
        templateQuestions = [
          {
            id: generateQuestionId(),
            type: 'RATING',
            question: 'How likely are you to recommend this content to others?',
            options: RATING_SCALES.scale10,
            isRequired: true,
            order: 0
          },
          {
            id: generateQuestionId(),
            type: 'TEXT',
            question: 'What is the primary reason for your score?',
            isRequired: false,
            order: 1
          }
        ]
        break
    }
    
    form.setValue('questions', templateQuestions)
  }, [form])

  // ===============================================================
  // 🎯 WATCH VALUES
  // ===============================================================
  
  const watchShowResults = form.watch('showResults')
  const watchIsAnonymous = form.watch('isAnonymous')

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Survey' : 'Create Survey'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create feedback forms and surveys to collect student responses and insights
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
            {isSaving ? 'Saving...' : 'Save Survey'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Survey Details</TabsTrigger>
          <TabsTrigger value="questions">Questions ({questionFields.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Survey Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., Course Feedback Survey"
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
                  placeholder="Brief description of the survey purpose..."
                  rows={2}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  {...form.register('instructions')}
                  placeholder="Instructions for survey participants. Explain the purpose and how to complete the survey..."
                  rows={4}
                  className={form.formState.errors.instructions ? 'border-red-500' : ''}
                />
                {form.formState.errors.instructions && (
                  <p className="text-sm text-red-600">{form.formState.errors.instructions.message}</p>
                )}
              </div>

              {/* Quick Templates */}
              <div className="space-y-3">
                <Label>Quick Templates</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadTemplate('feedback')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm">Feedback</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadTemplate('satisfaction')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <Star className="w-5 h-5" />
                    <span className="text-sm">Satisfaction</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadTemplate('evaluation')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <Target className="w-5 h-5" />
                    <span className="text-sm">Evaluation</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadTemplate('nps')}
                    className="flex flex-col items-center gap-2 h-auto p-4"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">NPS</span>
                  </Button>
                </div>
              </div>

              {/* Points and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
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
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Survey Questions ({questionFields.length})
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Select
                    value="MULTIPLE_CHOICE"
                    onValueChange={(value) => addQuestion(value as any)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add Question" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((questionType) => {
                        const Icon = questionType.icon
                        return (
                          <SelectItem key={questionType.value} value={questionType.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{questionType.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {questionFields.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600 mb-6">Start building your survey by adding questions</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => addQuestion('MULTIPLE_CHOICE')} variant="outline">
                      <RadioGroup className="w-4 h-4 mr-2" />
                      Multiple Choice
                    </Button>
                    <Button onClick={() => addQuestion('TEXT')} variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Text Response
                    </Button>
                    <Button onClick={() => addQuestion('RATING')} variant="outline">
                      <Star className="w-4 h-4 mr-2" />
                      Rating Scale
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={questionFields.map(field => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {questionFields.map((field, index) => (
                        <SortableQuestionItem
                          key={field.id}
                          question={field}
                          index={index}
                          onUpdate={updateQuestion}
                          onDelete={removeQuestion}
                          onDuplicate={duplicateQuestion}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Survey Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Privacy Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Privacy & Participation</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Anonymous Responses</Label>
                      <p className="text-sm text-gray-600">Allow anonymous survey participation</p>
                    </div>
                    <Switch
                      checked={form.watch('isAnonymous')}
                      onCheckedChange={(checked) => form.setValue('isAnonymous', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Multiple Submissions</Label>
                      <p className="text-sm text-gray-600">Allow users to submit multiple times</p>
                    </div>
                    <Switch
                      checked={form.watch('allowMultipleSubmissions')}
                      onCheckedChange={(checked) => form.setValue('allowMultipleSubmissions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Collect Email</Label>
                      <p className="text-sm text-gray-600">Require email address</p>
                    </div>
                    <Switch
                      checked={form.watch('collectEmail')}
                      onCheckedChange={(checked) => form.setValue('collectEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Collect Name</Label>
                      <p className="text-sm text-gray-600">Require participant name</p>
                    </div>
                    <Switch
                      checked={form.watch('collectName')}
                      onCheckedChange={(checked) => form.setValue('collectName', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Results Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Results & Display</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Results</Label>
                    <p className="text-sm text-gray-600">Display survey results to participants</p>
                  </div>
                  <Switch
                    checked={form.watch('showResults')}
                    onCheckedChange={(checked) => form.setValue('showResults', checked)}
                  />
                </div>

                {watchShowResults && (
                  <div className="space-y-2">
                    <Label>Results Visibility</Label>
                    <Select
                      value={form.watch('resultsVisibility')}
                      onValueChange={(value) => form.setValue('resultsVisibility', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMMEDIATE">Show immediately</SelectItem>
                        <SelectItem value="AFTER_SUBMISSION">After submission</SelectItem>
                        <SelectItem value="NEVER">Never show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* Presentation Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Presentation</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Shuffle Questions</Label>
                      <p className="text-sm text-gray-600">Randomize question order</p>
                    </div>
                    <Switch
                      checked={form.watch('shuffleQuestions')}
                      onCheckedChange={(checked) => form.setValue('shuffleQuestions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Progress Bar</Label>
                      <p className="text-sm text-gray-600">Show completion progress</p>
                    </div>
                    <Switch
                      checked={form.watch('progressBar')}
                      onCheckedChange={(checked) => form.setValue('progressBar', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Time Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Time & Duration</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      {...form.register('duration', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Survey Expires</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !form.watch('expiresAt') && 'text-muted-foreground'
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('expiresAt') ? (
                            format(form.watch('expiresAt')!, 'PPP', { locale: id })
                          ) : (
                            <span>No expiration</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch('expiresAt')}
                          onSelect={(date) => form.setValue('expiresAt', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Theme & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={form.watch('customTheme.primaryColor') || '#3B82F6'}
                    onChange={(e) => form.setValue('customTheme.primaryColor', e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={form.watch('customTheme.backgroundColor') || '#FFFFFF'}
                    onChange={(e) => form.setValue('customTheme.backgroundColor', e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={form.watch('customTheme.textColor') || '#1F2937'}
                    onChange={(e) => form.setValue('customTheme.textColor', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Questions</Label>
                  <p className="font-medium">{questionFields.length} questions</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Participation</Label>
                  <p className="font-medium">{watchIsAnonymous ? 'Anonymous' : 'Identified'}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Results</Label>
                  <p className="font-medium">{watchShowResults ? 'Visible' : 'Hidden'}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Duration</Label>
                  <p className="font-medium">{form.watch('duration')} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
SurveyBuilder.displayName = 'SurveyBuilder'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function QuestionEditor({ 
  question, 
  index, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  dragHandleProps 
}: QuestionEditorProps & { dragHandleProps?: any }) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const questionTypeData = QUESTION_TYPES.find(qt => qt.value === question.type)
  const Icon = questionTypeData?.icon || MessageSquare

  const handleTypeChange = (newType: string) => {
    const typeData = QUESTION_TYPES.find(qt => qt.value === newType)
    onUpdate(index, {
      ...question,
      type: newType,
      options: typeData?.defaultOptions || []
    })
  }

  const handleAddOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
    onUpdate(index, { ...question, options: newOptions })
  }

  const handleUpdateOption = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[optionIndex] = value
    onUpdate(index, { ...question, options: newOptions })
  }

  const handleRemoveOption = (optionIndex: number) => {
    const newOptions = question.options?.filter((_, i) => i !== optionIndex) || []
    onUpdate(index, { ...question, options: newOptions })
  }

  const applyScale = (scaleType: string) => {
    let options: string[] = []
    
    if (question.type === 'LIKERT') {
      options = LIKERT_SCALES[scaleType as keyof typeof LIKERT_SCALES] || []
    } else if (question.type === 'RATING') {
      options = RATING_SCALES[scaleType as keyof typeof RATING_SCALES] || []
    }
    
    onUpdate(index, { ...question, options })
  }

  return (
    <Card className={`${questionTypeData?.color || 'bg-white'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...dragHandleProps} className="cursor-move">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">Question {index + 1}</span>
            </div>
            
            <Select
              value={question.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((questionType) => {
                  const QIcon = questionType.icon
                  return (
                    <SelectItem key={questionType.value} value={questionType.value}>
                      <div className="flex items-center gap-2">
                        <QIcon className="w-3 h-3" />
                        <span>{questionType.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Switch
              checked={question.isRequired}
              onCheckedChange={(checked) => onUpdate(index, { ...question, isRequired: checked })}
            />
            <Label className="text-xs">Required</Label>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(index)}
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={question.question}
              onChange={(e) => onUpdate(index, { ...question, question: e.target.value })}
              placeholder="Enter your question..."
              rows={2}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              value={question.description || ''}
              onChange={(e) => onUpdate(index, { ...question, description: e.target.value })}
              placeholder="Additional context or instructions..."
            />
          </div>

          {/* Options for choice-based questions */}
          {(question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX' || 
            question.type === 'RATING' || question.type === 'LIKERT') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                
                {/* Quick Scale Selectors */}
                {(question.type === 'RATING' || question.type === 'LIKERT') && (
                  <div className="flex gap-2">
                    {question.type === 'RATING' && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyScale('scale5')}
                        >
                          1-5
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyScale('scale10')}
                        >
                          1-10
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyScale('emoji5')}
                        >
                          😢-😍
                        </Button>
                      </>
                    )}
                    
                    {question.type === 'LIKERT' && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyScale('agreement5')}
                        >
                          Agreement
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyScale('satisfaction5')}
                        >
                          Satisfaction
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyScale('frequency5')}
                        >
                          Frequency
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleUpdateOption(optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(optionIndex)}
                      disabled={(question.options?.length || 0) <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Validation for text questions */}
          {question.type === 'TEXT' && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Advanced Options
              </Button>
              
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded">
                  <div className="space-y-2">
                    <Label>Min Length</Label>
                    <Input
                      type="number"
                      min="0"
                      value={question.validation?.minLength || ''}
                      onChange={(e) => onUpdate(index, {
                        ...question,
                        validation: {
                          ...question.validation,
                          minLength: parseInt(e.target.value) || undefined
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Length</Label>
                    <Input
                      type="number"
                      min="1"
                      value={question.validation?.maxLength || ''}
                      onChange={(e) => onUpdate(index, {
                        ...question,
                        validation: {
                          ...question.validation,
                          maxLength: parseInt(e.target.value) || undefined
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default SurveyBuilder
export { QuestionEditor, type SurveyBuilderProps }