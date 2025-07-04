// File: src/components/quiz/builder/fill-blank-builder.tsx

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
  SelectValue
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
  Target,
  Hash,
  Type,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Settings
} from 'lucide-react'

// External Libraries
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { FillBlankQuestion, BlankItem } from '../types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const blankItemSchema = z.object({
  id: z.string(),
  placeholder: z.string().optional(),
  correctAnswers: z.array(z.string()).min(1, 'At least one correct answer required'),
  caseSensitive: z.boolean().default(false),
  exactMatch: z.boolean().default(false),
  hints: z.array(z.string()).optional(),
  points: z.number().min(1).max(10).default(1)
})

const fillBlankQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(2000, 'Question too long'),
  instructions: z.string().optional(),
  questionText: z.string().min(10, 'Question text with blanks is required'),
  blanks: z.array(blankItemSchema).min(1, 'At least one blank required').max(20, 'Maximum 20 blanks allowed'),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  allowPartialCredit: z.boolean().default(true),
  showExplanation: z.boolean().default(true),
  caseSensitive: z.boolean().default(false),
  exactMatch: z.boolean().default(false),
  blankStyle: z.enum(['underline', 'box', 'highlight']).default('underline')
})

type FillBlankFormData = z.infer<typeof fillBlankQuestionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface FillBlankBuilderProps {
  initialData?: Partial<FillBlankQuestion>
  onSave: (question: FillBlankQuestion) => void
  onCancel: () => void
  onPreview?: (question: FillBlankQuestion) => void
  isEditing?: boolean
  className?: string
}

interface BlankEditorProps {
  blank: BlankItem
  index: number
  onUpdate: (index: number, blank: BlankItem) => void
  onDelete: (index: number) => void
}

interface QuestionTextEditorProps {
  value: string
  onChange: (value: string) => void
  blanks: BlankItem[]
  onBlanksChange: (blanks: BlankItem[]) => void
}

interface QuestionPreview {
  question: FillBlankQuestion
  isVisible: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `blank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createEmptyBlank = (): BlankItem => ({
  id: generateId(),
  placeholder: '',
  correctAnswers: [''],
  caseSensitive: false,
  exactMatch: false,
  hints: [],
  points: 1
})

const createDefaultQuestion = (): Partial<FillBlankQuestion> => ({
  question: '',
  instructions: '',
  questionText: '',
  blanks: [],
  explanation: '',
  hints: [],
  points: 10,
  allowPartialCredit: true,
  showExplanation: true,
  caseSensitive: false,
  exactMatch: false,
  blankStyle: 'underline'
})

const detectBlanksInText = (text: string): string[] => {
  // Detect patterns like _____, [blank], {blank}, or __1__, __2__ etc.
  const patterns = [
    /_{3,}/g,                    // Underscores: _____
    /\[([^\]]*)\]/g,            // Brackets: [blank]
    /\{([^}]*)\}/g,             // Braces: {blank}
    /__\d+__/g,                 // Numbered: __1__, __2__
    /\(\s*\)/g                  // Empty parentheses: ( )
  ]
  
  const blanks: string[] = []
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      blanks.push(...matches)
    }
  })
  
  return [...new Set(blanks)] // Remove duplicates
}

const formatQuestionWithBlanks = (text: string, blanks: BlankItem[], style: string): string => {
  let formattedText = text
  
  blanks.forEach((blank, index) => {
    const blankNumber = index + 1
    let replacement = ''
    
    switch (style) {
      case 'underline':
        replacement = `______${blankNumber}______`
        break
      case 'box':
        replacement = `[BLANK ${blankNumber}]`
        break
      case 'highlight':
        replacement = `{BLANK ${blankNumber}}`
        break
      default:
        replacement = `______${blankNumber}______`
    }
    
    // Replace first occurrence of blank pattern
    const patterns = [/_{3,}/, /\[([^\]]*)\]/, /\{([^}]*)\}/, /__\d+__/, /\(\s*\)/]
    for (const pattern of patterns) {
      if (pattern.test(formattedText)) {
        formattedText = formattedText.replace(pattern, replacement)
        break
      }
    }
  })
  
  return formattedText
}

const validateFormData = (data: FillBlankFormData): string[] => {
  const errors: string[] = []
  
  // Check if question text contains blank patterns
  const detectedBlanks = detectBlanksInText(data.questionText)
  if (detectedBlanks.length === 0) {
    errors.push('Question text must contain blank patterns (_____, [blank], {blank}, etc.)')
  }
  
  // Check if number of blanks matches detected patterns
  if (data.blanks.length !== detectedBlanks.length) {
    errors.push(`Number of blank definitions (${data.blanks.length}) must match detected blanks (${detectedBlanks.length})`)
  }
  
  // Validate each blank
  data.blanks.forEach((blank, index) => {
    if (blank.correctAnswers.every(answer => !answer.trim())) {
      errors.push(`Blank ${index + 1} must have at least one correct answer`)
    }
  })
  
  return errors
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function QuestionTextEditor({ 
  value, 
  onChange, 
  blanks, 
  onBlanksChange 
}: QuestionTextEditorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const detectedBlanks = useMemo(() => detectBlanksInText(value), [value])
  
  const handleAnalyzeBlanks = useCallback(() => {
    setIsAnalyzing(true)
    
    // Create blank items for detected patterns
    const newBlanks = detectedBlanks.map((pattern, index) => ({
      ...createEmptyBlank(),
      placeholder: `Blank ${index + 1}`,
      correctAnswers: ['']
    }))
    
    onBlanksChange(newBlanks)
    setIsAnalyzing(false)
    toast.success(`Detected ${detectedBlanks.length} blank(s)`)
  }, [detectedBlanks, onBlanksChange])
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Question Text with Blanks <span className="text-red-500">*</span>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyzeBlanks}
          disabled={isAnalyzing || detectedBlanks.length === 0}
        >
          <Target className="w-4 h-4 mr-1" />
          Analyze Blanks ({detectedBlanks.length})
        </Button>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your question with blanks. Use patterns like: _____, [blank], {blank}, __1__, or ( )"
        rows={4}
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Blank patterns:</strong></p>
        <p>• <code>_____</code> - Underscores (3 or more)</p>
        <p>• <code>[blank]</code> - Square brackets</p>
        <p>• <code>{`{blank}`}</code> - Curly braces</p>
        <p>• <code>__1__</code> - Numbered blanks</p>
        <p>• <code>( )</code> - Empty parentheses</p>
      </div>
      
      {detectedBlanks.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Detected {detectedBlanks.length} blank(s):</strong> {detectedBlanks.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function BlankEditor({ blank, index, onUpdate, onDelete }: BlankEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleAddAnswer = () => {
    const newAnswers = [...blank.correctAnswers, '']
    onUpdate(index, { ...blank, correctAnswers: newAnswers })
  }
  
  const handleRemoveAnswer = (answerIndex: number) => {
    if (blank.correctAnswers.length <= 1) {
      toast.error('At least one correct answer required')
      return
    }
    
    const newAnswers = blank.correctAnswers.filter((_, i) => i !== answerIndex)
    onUpdate(index, { ...blank, correctAnswers: newAnswers })
  }
  
  const handleUpdateAnswer = (answerIndex: number, value: string) => {
    const newAnswers = [...blank.correctAnswers]
    newAnswers[answerIndex] = value
    onUpdate(index, { ...blank, correctAnswers: newAnswers })
  }
  
  const handleAddHint = () => {
    const newHints = [...(blank.hints || []), '']
    onUpdate(index, { ...blank, hints: newHints })
  }
  
  const handleRemoveHint = (hintIndex: number) => {
    const newHints = (blank.hints || []).filter((_, i) => i !== hintIndex)
    onUpdate(index, { ...blank, hints: newHints })
  }
  
  const handleUpdateHint = (hintIndex: number, value: string) => {
    const newHints = [...(blank.hints || [])]
    newHints[hintIndex] = value
    onUpdate(index, { ...blank, hints: newHints })
  }
  
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Blank {index + 1}
            {blank.placeholder && (
              <Badge variant="outline">{blank.placeholder}</Badge>
            )}
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
          {/* Placeholder */}
          <div className="space-y-2">
            <Label className="text-xs">Placeholder (Optional)</Label>
            <Input
              value={blank.placeholder || ''}
              onChange={(e) => onUpdate(index, { ...blank, placeholder: e.target.value })}
              placeholder="e.g., Enter country name..."
              className="text-sm"
            />
          </div>
          
          {/* Correct Answers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Correct Answers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAnswer}
                disabled={blank.correctAnswers.length >= 10}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Answer
              </Button>
            </div>
            
            <div className="space-y-2">
              {blank.correctAnswers.map((answer, answerIndex) => (
                <div key={answerIndex} className="flex gap-2">
                  <Input
                    value={answer}
                    onChange={(e) => handleUpdateAnswer(answerIndex, e.target.value)}
                    placeholder={`Answer ${answerIndex + 1}...`}
                    className="flex-1 text-sm"
                  />
                  {blank.correctAnswers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAnswer(answerIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={blank.caseSensitive}
                onCheckedChange={(checked) => onUpdate(index, { ...blank, caseSensitive: checked })}
              />
              <Label className="text-xs">Case Sensitive</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={blank.exactMatch}
                onCheckedChange={(checked) => onUpdate(index, { ...blank, exactMatch: checked })}
              />
              <Label className="text-xs">Exact Match</Label>
            </div>
          </div>
          
          {/* Points */}
          <div className="space-y-2">
            <Label className="text-xs">Points</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={blank.points}
              onChange={(e) => onUpdate(index, { ...blank, points: parseInt(e.target.value) || 1 })}
              className="w-20 text-sm"
            />
          </div>
          
          {/* Hints */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Hints
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHint}
                disabled={(blank.hints?.length || 0) >= 3}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Hint
              </Button>
            </div>
            
            {blank.hints && blank.hints.length > 0 && (
              <div className="space-y-2">
                {blank.hints.map((hint, hintIndex) => (
                  <div key={hintIndex} className="flex gap-2">
                    <Input
                      value={hint}
                      onChange={(e) => handleUpdateHint(hintIndex, e.target.value)}
                      placeholder={`Hint ${hintIndex + 1}...`}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveHint(hintIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function QuestionPreviewPanel({ question, isVisible }: QuestionPreview) {
  if (!isVisible) return null
  
  const formattedText = formatQuestionWithBlanks(
    question.questionText, 
    question.blanks, 
    question.blankStyle || 'underline'
  )
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Question Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="prose prose-sm max-w-none">
          <h4 className="text-base font-medium text-gray-900">
            {question.question || "Question will appear here..."}
          </h4>
          
          {question.instructions && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Instructions:</strong> {question.instructions}
            </p>
          )}
        </div>
        
        {/* Question Text with Blanks */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Fill in the blanks:</h5>
          <div className="text-base leading-relaxed">
            {formattedText.split(/(\[[^\]]+\]|_{3,}|\{[^}]+\}|__\d+__|BLANK \d+)/g).map((part, index) => {
              if (part.includes('BLANK') || part.match(/_{3,}/) || part.match(/\[[^\]]+\]/) || part.match(/\{[^}]+\}/)) {
                return (
                  <span 
                    key={index} 
                    className={cn(
                      "inline-block mx-1 px-2 py-1 min-w-20 text-center",
                      question.blankStyle === 'box' && "border border-gray-400 bg-white rounded",
                      question.blankStyle === 'underline' && "border-b-2 border-gray-400 bg-transparent",
                      question.blankStyle === 'highlight' && "bg-yellow-200 border border-yellow-400 rounded"
                    )}
                  >
                    {question.blankStyle === 'underline' ? '' : part}
                  </span>
                )
              }
              return <span key={index}>{part}</span>
            })}
          </div>
        </div>
        
        {/* Blanks Summary */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Blanks Summary:</h5>
          {question.blanks.map((blank, index) => (
            <div key={blank.id} className="p-3 border rounded bg-white">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium">Blank {index + 1}</span>
                <Badge variant="outline">{blank.points} point{blank.points !== 1 ? 's' : ''}</Badge>
              </div>
              
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Answers:</strong> {blank.correctAnswers.filter(a => a.trim()).join(', ')}
                </div>
                {blank.caseSensitive && (
                  <div className="text-orange-600">• Case sensitive</div>
                )}
                {blank.exactMatch && (
                  <div className="text-blue-600">• Exact match required</div>
                )}
                {blank.hints && blank.hints.length > 0 && (
                  <div className="text-gray-600">
                    <strong>Hints:</strong> {blank.hints.filter(h => h.trim()).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
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

function FillBlankBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: FillBlankBuilderProps) {
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
  } = useForm<FillBlankFormData>({
    resolver: zodResolver(fillBlankQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedData = watch()

  // Event Handlers
  const handleUpdateBlank = useCallback((index: number, updatedBlank: BlankItem) => {
    const newBlanks = [...watchedData.blanks]
    newBlanks[index] = updatedBlank
    setValue('blanks', newBlanks)
  }, [watchedData.blanks, setValue])

  const handleDeleteBlank = useCallback((index: number) => {
    const newBlanks = watchedData.blanks.filter((_, i) => i !== index)
    setValue('blanks', newBlanks)
    toast.success('Blank deleted')
  }, [watchedData.blanks, setValue])

  const handleAddBlank = useCallback(() => {
    if (watchedData.blanks.length >= 20) {
      toast.error('Maximum 20 blanks allowed')
      return
    }
    
    const newBlanks = [...watchedData.blanks, createEmptyBlank()]
    setValue('blanks', newBlanks)
    toast.success('Blank added')
  }, [watchedData.blanks, setValue])

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), '']
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index)
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const onSubmit = useCallback((data: FillBlankFormData) => {
    const customErrors = validateFormData(data)
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors)
      toast.error('Please fix validation errors')
      return
    }

    setValidationErrors([])

    const question: FillBlankQuestion = {
      id: initialData?.id || generateId(),
      type: 'fill_blank',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(question)
    toast.success(isEditing ? 'Question updated' : 'Question created')
  }, [initialData, onSave, isEditing])

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: FillBlankQuestion = {
        id: initialData?.id || generateId(),
        type: 'fill_blank',
        ...watchedData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onPreview(question)
    }
  }, [onPreview, isValid, watchedData, initialData])

  // Computed values
  const totalBlanks = watchedData.blanks.length
  const totalPoints = watchedData.blanks.reduce((sum, blank) => sum + blank.points, 0)

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Fill in the Blanks Question' : 'Create Fill in the Blanks Question'}
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
                <Textarea
                  {...field}
                  id="question"
                  placeholder="Enter the main question or topic..."
                  rows={2}
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

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Instructions (Optional)
            </Label>
            <Controller
              name="instructions"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="instructions"
                  placeholder="Instructions for students..."
                  rows={2}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* Question Text with Blanks */}
          <Controller
            name="questionText"
            control={control}
            render={({ field }) => (
              <QuestionTextEditor
                value={field.value}
                onChange={field.onChange}
                blanks={watchedData.blanks}
                onBlanksChange={(blanks) => setValue('blanks', blanks)}
              />
            )}
          />

          {/* Blanks Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Blank Definitions
                <Badge variant="outline" className="ml-2">
                  {totalBlanks} blanks • {totalPoints} points
                </Badge>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBlank}
                disabled={totalBlanks >= 20}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Blank
              </Button>
            </div>

            {watchedData.blanks.length === 0 ? (
              <Alert className="border-blue-200 bg-blue-50">
                <Target className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Add blank patterns to your question text first, then click "Analyze Blanks" to automatically detect them.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {watchedData.blanks.map((blank, index) => (
                  <BlankEditor
                    key={blank.id}
                    blank={blank}
                    index={index}
                    onUpdate={handleUpdateBlank}
                    onDelete={handleDeleteBlank}
                  />
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Global Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Global Settings
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <p className="text-xs text-gray-500">
                  Individual blank points: {totalPoints} • Total question points: {watchedData.points}
                </p>
              </div>

              {/* Blank Style */}
              <div className="space-y-2">
                <Label className="text-sm">Blank Display Style</Label>
                <Controller
                  name="blankStyle"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="underline">Underline ______</SelectItem>
                        <SelectItem value="box">[Input Box]</SelectItem>
                        <SelectItem value="highlight">{`{Highlight}`}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Global Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allow Partial Credit */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Allow Partial Credit</Label>
                  <p className="text-xs text-gray-600">Score based on correct blanks</p>
                </div>
                <Controller
                  name="allowPartialCredit"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Show Explanation */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Show Explanation</Label>
                  <p className="text-xs text-gray-600">Display explanation after answering</p>
                </div>
                <Controller
                  name="showExplanation"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Global Case Sensitive */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Case Sensitive (Global)</Label>
                  <p className="text-xs text-gray-600">Apply to all blanks by default</p>
                </div>
                <Controller
                  name="caseSensitive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Global Exact Match */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Exact Match (Global)</Label>
                  <p className="text-xs text-gray-600">Require exact spelling by default</p>
                </div>
                <Controller
                  name="exactMatch"
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
                  placeholder="Explain the correct answers..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* Global Hints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                Global Hints (Optional)
              </Label>
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
                      placeholder={`Global hint ${index + 1}...`}
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
                {isEditing ? 'Update Question' : 'Create Question'}
              </Button>
            </div>
          </div>
        </form>

        {/* Preview Panel */}
        {showPreview && (
          <QuestionPreviewPanel 
            question={{
              id: generateId(),
              type: 'fill_blank',
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
FillBlankBuilder.displayName = 'FillBlankBuilder'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default FillBlankBuilder
export { 
  QuestionTextEditor,
  BlankEditor,
  QuestionPreviewPanel,
  generateId,
  createEmptyBlank,
  createDefaultQuestion,
  detectBlanksInText,
  formatQuestionWithBlanks,
  validateFormData,
  type FillBlankBuilderProps,
  type BlankEditorProps,
  type QuestionTextEditorProps,
  type QuestionPreview
}