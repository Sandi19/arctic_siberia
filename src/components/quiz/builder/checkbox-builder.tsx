// File: src/components/quiz/builder/checkbox-builder.tsx

'use client'

// ✅ FIXED: Framework & Core Imports
import React, { useState, useCallback, useEffect } from 'react'

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
  Checkbox,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Progress
} from '@/components/ui'

// Feature Components
import { OptionEditor } from '../shared/option-editor'

// Icons
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckSquare2, 
  Square, 
  GripVertical,
  AlertTriangle,
  Eye,
  EyeOff,
  Shuffle,
  RotateCcw,
  Save,
  Target,
  CheckCircle2,
  Settings
} from 'lucide-react'

// External Libraries
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { CheckboxQuestion, CheckboxOption } from '../types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const checkboxOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required').max(500, 'Option text too long'),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  explanation: z.string().optional()
})

const checkboxQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(1000, 'Question too long'),
  instructions: z.string().optional(),
  options: z.array(checkboxOptionSchema).min(2, 'At least 2 options required').max(15, 'Maximum 15 options allowed'),
  correctAnswers: z.array(z.string()).min(1, 'At least one correct answer required'),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  minSelections: z.number().min(0).optional(),
  maxSelections: z.number().min(1).optional(),
  exactSelections: z.number().min(1).optional(),
  shuffleOptions: z.boolean().default(false),
  allowPartialCredit: z.boolean().default(true),
  showExplanation: z.boolean().default(true),
  penalizeIncorrect: z.boolean().default(false)
})

type CheckboxFormData = z.infer<typeof checkboxQuestionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface CheckboxBuilderProps {
  initialData?: Partial<CheckboxQuestion>
  onSave: (question: CheckboxQuestion) => void
  onCancel: () => void
  onPreview?: (question: CheckboxQuestion) => void
  isEditing?: boolean
  className?: string
}

interface OptionItemProps {
  option: CheckboxOption
  index: number
  isCorrect: boolean
  onEdit: (index: number, option: CheckboxOption) => void
  onDelete: (index: number) => void
  onToggleCorrect: (index: number) => void
  isDragDisabled?: boolean
}

interface SelectionConstraintsProps {
  minSelections?: number
  maxSelections?: number
  exactSelections?: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
  onExactChange: (value: number | undefined) => void
  totalOptions: number
}

interface QuestionPreview {
  question: CheckboxQuestion
  isVisible: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createEmptyOption = (): CheckboxOption => ({
  id: generateId(),
  text: '',
  imageUrl: '',
  imageAlt: '',
  explanation: ''
})

const createDefaultQuestion = (): Partial<CheckboxQuestion> => ({
  question: '',
  instructions: '',
  options: [
    { id: generateId(), text: '', imageUrl: '', imageAlt: '', explanation: '' },
    { id: generateId(), text: '', imageUrl: '', imageAlt: '', explanation: '' },
    { id: generateId(), text: '', imageUrl: '', imageAlt: '', explanation: '' }
  ],
  correctAnswers: [],
  explanation: '',
  hints: [],
  points: 10,
  minSelections: undefined,
  maxSelections: undefined,
  exactSelections: undefined,
  shuffleOptions: false,
  allowPartialCredit: true,
  showExplanation: true,
  penalizeIncorrect: false
})

const validateFormData = (data: CheckboxFormData): string[] => {
  const errors: string[] = []
  
  // Check if at least one option has text
  const hasValidOptions = data.options.some(opt => opt.text.trim().length > 0)
  if (!hasValidOptions) {
    errors.push('At least one option must have text')
  }
  
  // Check if correct answers exist and are valid
  if (data.correctAnswers.length === 0) {
    errors.push('At least one correct answer must be selected')
  }
  
  // Validate correct answer IDs exist in options
  const optionIds = data.options.map(opt => opt.id)
  const invalidCorrectAnswers = data.correctAnswers.filter(id => !optionIds.includes(id))
  if (invalidCorrectAnswers.length > 0) {
    errors.push('Some correct answers reference invalid options')
  }
  
  // Validate selection constraints
  if (data.minSelections && data.maxSelections && data.minSelections > data.maxSelections) {
    errors.push('Minimum selections cannot be greater than maximum selections')
  }
  
  if (data.exactSelections) {
    if (data.minSelections || data.maxSelections) {
      errors.push('Cannot use exact selections with min/max selections')
    }
    if (data.exactSelections > data.options.length) {
      errors.push('Exact selections cannot exceed number of options')
    }
  }
  
  return errors
}

const calculateScorePreview = (
  correctAnswers: string[],
  totalOptions: number,
  allowPartialCredit: boolean,
  penalizeIncorrect: boolean
): { maxScore: number; partialExample: number } => {
  const maxScore = 100
  
  if (!allowPartialCredit) {
    return { maxScore, partialExample: 0 }
  }
  
  // Example: 3 correct out of 4 correct answers
  const exampleCorrect = Math.max(1, correctAnswers.length - 1)
  const exampleIncorrect = penalizeIncorrect ? 1 : 0
  
  const score = Math.max(0, (exampleCorrect - exampleIncorrect) / correctAnswers.length * maxScore)
  
  return { maxScore, partialExample: Math.round(score) }
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function OptionItem({ 
  option, 
  index, 
  isCorrect, 
  onEdit, 
  onDelete, 
  onToggleCorrect, 
  isDragDisabled = false 
}: OptionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(option.text)

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(index, { ...option, text: editText.trim() })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(option.text)
    setIsEditing(false)
  }

  return (
    <Draggable draggableId={option.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group p-4 border rounded-lg transition-all duration-200",
            snapshot.isDragging && "shadow-lg rotate-1 scale-105",
            isCorrect && "border-green-500 bg-green-50",
            !isCorrect && "border-gray-200 bg-white hover:border-blue-300"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            {!isDragDisabled && (
              <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
            )}

            {/* Option Letter */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
              {String.fromCharCode(65 + index)}
            </div>

            {/* Checkbox */}
            <div className="mt-1">
              <Checkbox
                checked={isCorrect}
                onCheckedChange={() => onToggleCorrect(index)}
                className={isCorrect ? "border-green-500 data-[state=checked]:bg-green-500" : ""}
              />
            </div>

            {/* Option Content */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Enter option text..."
                    className="w-full"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm",
                      option.text.trim() ? "text-gray-900" : "text-gray-400 italic"
                    )}>
                      {option.text.trim() || "Enter option text..."}
                    </span>
                    
                    {isCorrect && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Correct
                      </Badge>
                    )}
                  </div>

                  {option.imageUrl && (
                    <img 
                      src={option.imageUrl} 
                      alt={option.imageAlt || `Option ${String.fromCharCode(65 + index)}`}
                      className="max-w-20 max-h-20 object-contain rounded border"
                    />
                  )}

                  {option.explanation && (
                    <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>Explanation:</strong> {option.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}

function SelectionConstraints({ 
  minSelections, 
  maxSelections, 
  exactSelections, 
  onMinChange, 
  onMaxChange, 
  onExactChange, 
  totalOptions 
}: SelectionConstraintsProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Selection Constraints
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Minimum Selections */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Minimum Selections</Label>
          <Input
            type="number"
            min="0"
            max={totalOptions}
            value={minSelections || ''}
            onChange={(e) => onMinChange(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Optional"
            className="w-full"
            disabled={!!exactSelections}
          />
        </div>

        {/* Maximum Selections */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Maximum Selections</Label>
          <Input
            type="number"
            min="1"
            max={totalOptions}
            value={maxSelections || ''}
            onChange={(e) => onMaxChange(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Optional"
            className="w-full"
            disabled={!!exactSelections}
          />
        </div>

        {/* Exact Selections */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Exact Selections</Label>
          <Input
            type="number"
            min="1"
            max={totalOptions}
            value={exactSelections || ''}
            onChange={(e) => onExactChange(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Optional"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• <strong>Minimum:</strong> Students must select at least this many options</p>
        <p>• <strong>Maximum:</strong> Students can select at most this many options</p>
        <p>• <strong>Exact:</strong> Students must select exactly this many options (overrides min/max)</p>
      </div>
    </div>
  )
}

function QuestionPreviewPanel({ question, isVisible }: QuestionPreview) {
  if (!isVisible) return null

  const scorePreview = calculateScorePreview(
    question.correctAnswers || [],
    question.options.length,
    question.allowPartialCredit || false,
    question.penalizeIncorrect || false
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
            {question.question || "Question text will appear here..."}
          </h4>
          
          {question.instructions && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Instructions:</strong> {question.instructions}
            </p>
          )}
        </div>

        {/* Selection Requirements */}
        <div className="flex items-center gap-4 text-sm">
          {question.exactSelections && (
            <Badge variant="outline">Exactly {question.exactSelections} selections required</Badge>
          )}
          {question.minSelections && !question.exactSelections && (
            <Badge variant="outline">Min {question.minSelections} selections</Badge>
          )}
          {question.maxSelections && !question.exactSelections && (
            <Badge variant="outline">Max {question.maxSelections} selections</Badge>
          )}
          <Badge className="bg-blue-100 text-blue-800">{question.points} points</Badge>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Options:</h5>
          {question.options.map((option, index) => {
            const isCorrect = question.correctAnswers?.includes(option.id)
            return (
              <div 
                key={option.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded border",
                  isCorrect ? "border-green-500 bg-green-50" : "border-gray-200"
                )}
              >
                <Checkbox 
                  checked={isCorrect} 
                  className={isCorrect ? "border-green-500 data-[state=checked]:bg-green-500" : ""}
                />
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-sm">
                  {option.text || `Option ${String.fromCharCode(65 + index)}`}
                </span>
                {isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            )
          })}
        </div>

        {/* Scoring Preview */}
        <div className="p-3 bg-gray-50 rounded">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Scoring Preview:</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Maximum Score:</span>
              <span className="font-medium">{scorePreview.maxScore}%</span>
            </div>
            {question.allowPartialCredit && (
              <div className="flex justify-between">
                <span>Partial Credit Example:</span>
                <span className="text-yellow-600">{scorePreview.partialExample}%</span>
              </div>
            )}
            <div className="text-xs text-gray-600">
              {question.allowPartialCredit 
                ? "Partial credit based on correct selections"
                : "All or nothing scoring"
              }
              {question.penalizeIncorrect && " • Incorrect selections penalized"}
            </div>
          </div>
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

function CheckboxBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: CheckboxBuilderProps) {
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
  } = useForm<CheckboxFormData>({
    resolver: zodResolver(checkboxQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedData = watch()

  // Event Handlers
  const handleAddOption = useCallback(() => {
    if (watchedData.options.length >= 15) {
      toast.error('Maximum 15 options allowed')
      return
    }

    const newOptions = [...watchedData.options, createEmptyOption()]
    setValue('options', newOptions)
    toast.success('Option added')
  }, [watchedData.options, setValue])

  const handleDeleteOption = useCallback((index: number) => {
    if (watchedData.options.length <= 2) {
      toast.error('Minimum 2 options required')
      return
    }

    const optionToDelete = watchedData.options[index]
    const newOptions = watchedData.options.filter((_, i) => i !== index)
    setValue('options', newOptions)

    // Remove from correct answers if it was selected
    const newCorrectAnswers = watchedData.correctAnswers.filter(id => id !== optionToDelete.id)
    setValue('correctAnswers', newCorrectAnswers)

    toast.success('Option deleted')
  }, [watchedData.options, watchedData.correctAnswers, setValue])

  const handleEditOption = useCallback((index: number, updatedOption: CheckboxOption) => {
    const newOptions = [...watchedData.options]
    newOptions[index] = updatedOption
    setValue('options', newOptions)
  }, [watchedData.options, setValue])

  const handleToggleCorrectAnswer = useCallback((index: number) => {
    const option = watchedData.options[index]
    const isCurrentlyCorrect = watchedData.correctAnswers.includes(option.id)
    
    let newCorrectAnswers: string[]
    if (isCurrentlyCorrect) {
      newCorrectAnswers = watchedData.correctAnswers.filter(id => id !== option.id)
    } else {
      newCorrectAnswers = [...watchedData.correctAnswers, option.id]
    }
    
    setValue('correctAnswers', newCorrectAnswers)
  }, [watchedData.options, watchedData.correctAnswers, setValue])

  const handleReorderOptions = useCallback((result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(watchedData.options)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setValue('options', items)
  }, [watchedData.options, setValue])

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), '']
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index)
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const onSubmit = useCallback((data: CheckboxFormData) => {
    const customErrors = validateFormData(data)
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors)
      toast.error('Please fix validation errors')
      return
    }

    setValidationErrors([])

    const question: CheckboxQuestion = {
      id: initialData?.id || generateId(),
      type: 'checkbox',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(question)
    toast.success(isEditing ? 'Question updated' : 'Question created')
  }, [initialData, onSave, isEditing])

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: CheckboxQuestion = {
        id: initialData?.id || generateId(),
        type: 'checkbox',
        ...watchedData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onPreview(question)
    }
  }, [onPreview, isValid, watchedData, initialData])

  // Computed values
  const correctCount = watchedData.correctAnswers.length
  const totalOptions = watchedData.options.length

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare2 className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Multiple Selection Question' : 'Create Multiple Selection Question'}
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

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium">
              Question <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="question"
                  placeholder="Enter your multiple selection question..."
                  rows={3}
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
                  placeholder="Additional instructions for students..."
                  rows={2}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Answer Options <span className="text-red-500">*</span>
                <Badge variant="outline" className="ml-2">
                  {correctCount} of {totalOptions} correct
                </Badge>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={watchedData.options.length >= 15}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>

            <DragDropContext onDragEnd={handleReorderOptions}>
              <Droppable droppableId="options">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {watchedData.options.map((option, index) => (
                      <OptionItem
                        key={option.id}
                        option={option}
                        index={index}
                        isCorrect={watchedData.correctAnswers.includes(option.id)}
                        onEdit={handleEditOption}
                        onDelete={handleDeleteOption}
                        onToggleCorrect={handleToggleCorrectAnswer}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <Separator />

          {/* Selection Constraints */}
          <SelectionConstraints
            minSelections={watchedData.minSelections}
            maxSelections={watchedData.maxSelections}
            exactSelections={watchedData.exactSelections}
            onMinChange={(value) => setValue('minSelections', value)}
            onMaxChange={(value) => setValue('maxSelections', value)}
            onExactChange={(value) => setValue('exactSelections', value)}
            totalOptions={totalOptions}
          />

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Question Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Points */}
              <div className="space-y-2">
                <Label htmlFor="points" className="text-sm">Points</Label>
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

              {/* Shuffle Options */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="shuffleOptions"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label className="text-sm">Shuffle Options</Label>
              </div>

              {/* Allow Partial Credit */}
              <div className="flex items-center space-x-2">
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
                <Label className="text-sm">Allow Partial Credit</Label>
              </div>

              {/* Show Explanation */}
              <div className="flex items-center space-x-2">
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
                <Label className="text-sm">Show Explanation</Label>
              </div>

              {/* Penalize Incorrect */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="penalizeIncorrect"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label className="text-sm">Penalize Incorrect</Label>
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

          {/* Hints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hints (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHint}
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
              type: 'checkbox',
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
CheckboxBuilder.displayName = 'CheckboxBuilder'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default CheckboxBuilder
export { 
  OptionItem,
  SelectionConstraints,
  QuestionPreviewPanel,
  generateId,
  createEmptyOption,
  createDefaultQuestion,
  validateFormData,
  calculateScorePreview,
  type CheckboxBuilderProps,
  type OptionItemProps,
  type SelectionConstraintsProps,
  type QuestionPreview
}