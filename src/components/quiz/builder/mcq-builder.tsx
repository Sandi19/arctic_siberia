// File: src/components/quiz/builder/mcq-builder.tsx

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
  RadioGroup,
  RadioGroupItem,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Separator
} from '@/components/ui'

// Feature Components
import { OptionEditor } from '../shared/option-editor'

// Icons
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  GripVertical,
  AlertTriangle,
  Eye,
  EyeOff,
  Shuffle,
  RotateCcw,
  Save,
  FileQuestion
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
import type { MCQQuestion, MCQOption } from '../types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required').max(500, 'Option text too long'),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  explanation: z.string().optional()
})

const mcqQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(1000, 'Question too long'),
  instructions: z.string().optional(),
  options: z.array(mcqOptionSchema).min(2, 'At least 2 options required').max(10, 'Maximum 10 options allowed'),
  correctAnswerIndex: z.number().min(0, 'Must select a correct answer'),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  shuffleOptions: z.boolean().default(false),
  allowPartialCredit: z.boolean().default(false),
  showExplanation: z.boolean().default(true)
})

type MCQFormData = z.infer<typeof mcqQuestionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface MCQBuilderProps {
  initialData?: Partial<MCQQuestion>
  onSave: (question: MCQQuestion) => void
  onCancel: () => void
  onPreview?: (question: MCQQuestion) => void
  isEditing?: boolean
  className?: string
}

interface OptionItemProps {
  option: MCQOption
  index: number
  isCorrect: boolean
  onEdit: (index: number, option: MCQOption) => void
  onDelete: (index: number) => void
  onSetCorrect: (index: number) => void
  isDragDisabled?: boolean
}

interface QuestionPreview {
  question: MCQQuestion
  isVisible: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `mcq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createEmptyOption = (): MCQOption => ({
  id: generateId(),
  text: '',
  imageUrl: '',
  imageAlt: '',
  explanation: ''
})

const createDefaultQuestion = (): Partial<MCQQuestion> => ({
  question: '',
  instructions: '',
  options: [
    { id: generateId(), text: '', imageUrl: '', imageAlt: '', explanation: '' },
    { id: generateId(), text: '', imageUrl: '', imageAlt: '', explanation: '' }
  ],
  correctAnswerIndex: 0,
  explanation: '',
  hints: [],
  points: 10,
  shuffleOptions: false,
  allowPartialCredit: false,
  showExplanation: true
})

const validateFormData = (data: MCQFormData): string[] => {
  const errors: string[] = []
  
  // Check if at least one option has text
  const hasValidOptions = data.options.some(opt => opt.text.trim().length > 0)
  if (!hasValidOptions) {
    errors.push('At least one option must have text')
  }
  
  // Check if correct answer index is valid
  if (data.correctAnswerIndex >= data.options.length) {
    errors.push('Invalid correct answer selection')
  }
  
  // Check if correct answer option has text
  const correctOption = data.options[data.correctAnswerIndex]
  if (!correctOption?.text.trim()) {
    errors.push('Correct answer option must have text')
  }
  
  return errors
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
  onSetCorrect, 
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

            {/* Radio Button */}
            <div className="mt-1">
              <RadioGroupItem
                value={index.toString()}
                checked={isCorrect}
                onChange={() => onSetCorrect(index)}
                className={isCorrect ? "border-green-500 text-green-500" : ""}
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

function QuestionPreviewPanel({ question, isVisible }: QuestionPreview) {
  if (!isVisible) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Question Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Options:</h5>
          {question.options.map((option, index) => (
            <div 
              key={option.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded border",
                index === question.correctAnswerIndex ? "border-green-500 bg-green-50" : "border-gray-200"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-sm">
                {option.text || `Option ${String.fromCharCode(65 + index)}`}
              </span>
              {index === question.correctAnswerIndex && (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
            </div>
          ))}
        </div>

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

function MCQBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: MCQBuilderProps) {
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
  } = useForm<MCQFormData>({
    resolver: zodResolver(mcqQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedData = watch()

  // Event Handlers
  const handleAddOption = useCallback(() => {
    if (watchedData.options.length >= 10) {
      toast.error('Maximum 10 options allowed')
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

    const newOptions = watchedData.options.filter((_, i) => i !== index)
    setValue('options', newOptions)

    // Adjust correct answer index if necessary
    if (watchedData.correctAnswerIndex >= newOptions.length) {
      setValue('correctAnswerIndex', newOptions.length - 1)
    } else if (watchedData.correctAnswerIndex > index) {
      setValue('correctAnswerIndex', watchedData.correctAnswerIndex - 1)
    }

    toast.success('Option deleted')
  }, [watchedData.options, watchedData.correctAnswerIndex, setValue])

  const handleEditOption = useCallback((index: number, updatedOption: MCQOption) => {
    const newOptions = [...watchedData.options]
    newOptions[index] = updatedOption
    setValue('options', newOptions)
  }, [watchedData.options, setValue])

  const handleSetCorrectAnswer = useCallback((index: number) => {
    setValue('correctAnswerIndex', index)
  }, [setValue])

  const handleReorderOptions = useCallback((result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(watchedData.options)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update correct answer index
    const oldCorrectIndex = watchedData.correctAnswerIndex
    let newCorrectIndex = oldCorrectIndex

    if (oldCorrectIndex === result.source.index) {
      newCorrectIndex = result.destination.index
    } else if (
      oldCorrectIndex > result.source.index && 
      oldCorrectIndex <= result.destination.index
    ) {
      newCorrectIndex = oldCorrectIndex - 1
    } else if (
      oldCorrectIndex < result.source.index && 
      oldCorrectIndex >= result.destination.index
    ) {
      newCorrectIndex = oldCorrectIndex + 1
    }

    setValue('options', items)
    setValue('correctAnswerIndex', newCorrectIndex)
  }, [watchedData.options, watchedData.correctAnswerIndex, setValue])

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), '']
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index)
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const onSubmit = useCallback((data: MCQFormData) => {
    const customErrors = validateFormData(data)
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors)
      toast.error('Please fix validation errors')
      return
    }

    setValidationErrors([])

    const question: MCQQuestion = {
      id: initialData?.id || generateId(),
      type: 'multiple_choice',
      ...data,
      correctAnswer: data.correctAnswerIndex,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(question)
    toast.success(isEditing ? 'Question updated' : 'Question created')
  }, [initialData, onSave, isEditing])

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: MCQQuestion = {
        id: initialData?.id || generateId(),
        type: 'multiple_choice',
        ...watchedData,
        correctAnswer: watchedData.correctAnswerIndex,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onPreview(question)
    }
  }, [onPreview, isValid, watchedData, initialData])

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Multiple Choice Question' : 'Create Multiple Choice Question'}
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
                  placeholder="Enter your multiple choice question..."
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
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={watchedData.options.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>

            <Controller
              name="correctAnswerIndex"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                  <DragDropContext onDragEnd={handleReorderOptions}>
                    <Droppable droppableId="options">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {watchedData.options.map((option, index) => (
                            <OptionItem
                              key={option.id}
                              option={option}
                              index={index}
                              isCorrect={index === watchedData.correctAnswerIndex}
                              onEdit={handleEditOption}
                              onDelete={handleDeleteOption}
                              onSetCorrect={handleSetCorrectAnswer}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </RadioGroup>
              )}
            />
          </div>

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
                  placeholder="Explain why this is the correct answer..."
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
              type: 'multiple_choice',
              ...watchedData,
              correctAnswer: watchedData.correctAnswerIndex,
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
MCQBuilder.displayName = 'MCQBuilder'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default MCQBuilder
export { 
  OptionItem,
  QuestionPreviewPanel,
  generateId,
  createEmptyOption,
  createDefaultQuestion,
  validateFormData,
  type MCQBuilderProps,
  type OptionItemProps,
  type QuestionPreview
}