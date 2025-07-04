// File: src/components/quiz/builder/true-false-builder.tsx

'use client'

// ✅ FIXED: Framework & Core Imports
import React, { useState, useCallback } from 'react'

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

// Icons
import { 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Eye,
  EyeOff,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Target
} from 'lucide-react'

// External Libraries
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { TrueFalseQuestion } from '../types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const trueFalseQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(1000, 'Question too long'),
  context: z.string().optional(),
  correctAnswer: z.boolean(),
  explanation: z.string().optional(),
  reasoning: z.string().optional(),
  hints: z.array(z.string()).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  showExplanation: z.boolean().default(true),
  allowMultipleAttempts: z.boolean().default(false),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
})

type TrueFalseFormData = z.infer<typeof trueFalseQuestionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface TrueFalseBuilderProps {
  initialData?: Partial<TrueFalseQuestion>
  onSave: (question: TrueFalseQuestion) => void
  onCancel: () => void
  onPreview?: (question: TrueFalseQuestion) => void
  isEditing?: boolean
  className?: string
}

interface AnswerOptionProps {
  value: boolean
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isSelected: boolean
  onSelect: (value: boolean) => void
}

interface QuestionPreview {
  question: TrueFalseQuestion
  isVisible: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `tf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createDefaultQuestion = (): Partial<TrueFalseQuestion> => ({
  question: '',
  context: '',
  correctAnswer: true,
  explanation: '',
  reasoning: '',
  hints: [],
  points: 10,
  showExplanation: true,
  allowMultipleAttempts: false,
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

const validateFormData = (data: TrueFalseFormData): string[] => {
  const errors: string[] = []
  
  // Additional custom validation
  if (data.question.trim().length < 10) {
    errors.push('Question must be at least 10 characters long')
  }
  
  if (data.question.includes('?') && data.question.split('?').length > 2) {
    errors.push('Question should contain only one question mark')
  }
  
  return errors
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function AnswerOption({ 
  value, 
  label, 
  description, 
  icon: Icon, 
  isSelected, 
  onSelect 
}: AnswerOptionProps) {
  return (
    <div
      className={cn(
        "group p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
        isSelected 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
      )}
      onClick={() => onSelect(value)}
    >
      <div className="flex items-center gap-4">
        {/* Radio Button */}
        <RadioGroupItem
          value={value.toString()}
          checked={isSelected}
          className={isSelected ? "border-blue-500 text-blue-500" : ""}
        />

        {/* Icon */}
        <div className={cn(
          "p-3 rounded-full transition-colors",
          isSelected ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-100"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            isSelected ? "text-blue-600" : "text-gray-600 group-hover:text-blue-600"
          )} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              "text-lg font-semibold",
              isSelected ? "text-blue-900" : "text-gray-900"
            )}>
              {label}
            </h4>
            {isSelected && (
              <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
            )}
          </div>
          <p className={cn(
            "text-sm mt-1",
            isSelected ? "text-blue-700" : "text-gray-600"
          )}>
            {description}
          </p>
        </div>

        {/* Check indicator */}
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
        )}
      </div>
    </div>
  )
}

function DifficultySelector({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (value: 'easy' | 'medium' | 'hard') => void 
}) {
  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Basic concept, straightforward' },
    { value: 'medium', label: 'Medium', description: 'Requires analysis or application' },
    { value: 'hard', label: 'Hard', description: 'Complex reasoning required' }
  ] as const

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Difficulty Level</Label>
      <div className="grid grid-cols-3 gap-3">
        {difficulties.map((diff) => (
          <div
            key={diff.value}
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-all duration-200",
              value === diff.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300"
            )}
            onClick={() => onChange(diff.value)}
          >
            <div className="text-center">
              <div className={cn(
                "text-sm font-medium",
                value === diff.value ? "text-blue-900" : "text-gray-900"
              )}>
                {diff.label}
              </div>
              <div className={cn(
                "text-xs mt-1",
                value === diff.value ? "text-blue-700" : "text-gray-600"
              )}>
                {diff.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
        {/* Question */}
        <div className="prose prose-sm max-w-none">
          <h4 className="text-base font-medium text-gray-900">
            {question.question || "Question text will appear here..."}
          </h4>
          
          {question.context && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Context:</h5>
              <p className="text-sm text-gray-600">{question.context}</p>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Options:</h5>
          
          <div className="grid grid-cols-2 gap-3">
            {/* True Option */}
            <div className={cn(
              "flex items-center gap-3 p-4 rounded border-2",
              question.correctAnswer === true ? "border-green-500 bg-green-50" : "border-gray-200"
            )}>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">True</span>
              {question.correctAnswer === true && (
                <Badge className="bg-green-100 text-green-800 ml-auto">Correct</Badge>
              )}
            </div>

            {/* False Option */}
            <div className={cn(
              "flex items-center gap-3 p-4 rounded border-2",
              question.correctAnswer === false ? "border-green-500 bg-green-50" : "border-gray-200"
            )}>
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium">False</span>
              {question.correctAnswer === false && (
                <Badge className="bg-green-100 text-green-800 ml-auto">Correct</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Question Info */}
        <div className="flex items-center gap-4 text-sm">
          <Badge className={getDifficultyColor(question.difficulty || 'medium')}>
            {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1)}
          </Badge>
          <span className="text-gray-600">{question.points} points</span>
          {question.showExplanation && (
            <span className="text-blue-600">Shows explanation</span>
          )}
        </div>

        {/* Reasoning */}
        {question.reasoning && (
          <div className="p-3 bg-blue-50 rounded">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Reasoning:</h5>
            <p className="text-sm text-blue-700">{question.reasoning}</p>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="p-3 bg-green-50 rounded">
            <h5 className="text-sm font-medium text-green-800 mb-1">Explanation:</h5>
            <p className="text-sm text-green-700">{question.explanation}</p>
          </div>
        )}

        {/* Hints */}
        {question.hints && question.hints.length > 0 && (
          <div className="p-3 bg-yellow-50 rounded">
            <h5 className="text-sm font-medium text-yellow-800 mb-2">Hints:</h5>
            <ul className="list-disc list-inside space-y-1">
              {question.hints.map((hint, index) => (
                <li key={index} className="text-sm text-yellow-700">{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function TrueFalseBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: TrueFalseBuilderProps) {
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
  } = useForm<TrueFalseFormData>({
    resolver: zodResolver(trueFalseQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedData = watch()

  // Event Handlers
  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), '']
    setValue('hints', newHints)
    toast.success('Hint added')
  }, [watchedData.hints, setValue])

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index)
    setValue('hints', newHints)
    toast.success('Hint removed')
  }, [watchedData.hints, setValue])

  const handleUpdateHint = useCallback((index: number, value: string) => {
    const newHints = [...(watchedData.hints || [])]
    newHints[index] = value
    setValue('hints', newHints)
  }, [watchedData.hints, setValue])

  const onSubmit = useCallback((data: TrueFalseFormData) => {
    const customErrors = validateFormData(data)
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors)
      toast.error('Please fix validation errors')
      return
    }

    setValidationErrors([])

    const question: TrueFalseQuestion = {
      id: initialData?.id || generateId(),
      type: 'true_false',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(question)
    toast.success(isEditing ? 'Question updated' : 'Question created')
  }, [initialData, onSave, isEditing])

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: TrueFalseQuestion = {
        id: initialData?.id || generateId(),
        type: 'true_false',
        ...watchedData,
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
          <HelpCircle className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit True/False Question' : 'Create True/False Question'}
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
              Question Statement <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="question"
                  placeholder="Enter a statement that can be evaluated as true or false..."
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
            <p className="text-xs text-gray-500">
              Write a clear statement that students can evaluate as true or false.
            </p>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context" className="text-sm font-medium">
              Context (Optional)
            </Label>
            <Controller
              name="context"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="context"
                  placeholder="Provide additional context or background information..."
                  rows={2}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            <p className="text-xs text-gray-500">
              Optional background information to help students understand the question.
            </p>
          </div>

          {/* Correct Answer Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Correct Answer <span className="text-red-500">*</span>
            </Label>
            
            <Controller
              name="correctAnswer"
              control={control}
              render={({ field }) => (
                <RadioGroup 
                  value={field.value.toString()} 
                  onValueChange={(value) => field.onChange(value === 'true')}
                >
                  <div className="space-y-3">
                    <AnswerOption
                      value={true}
                      label="True"
                      description="The statement is correct"
                      icon={CheckCircle2}
                      isSelected={field.value === true}
                      onSelect={(value) => field.onChange(value)}
                    />
                    
                    <AnswerOption
                      value={false}
                      label="False"
                      description="The statement is incorrect"
                      icon={XCircle}
                      isSelected={field.value === false}
                      onSelect={(value) => field.onChange(value)}
                    />
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <Separator />

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points" className="text-sm font-medium">Points</Label>
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
              {errors.points && (
                <p className="text-sm text-red-600">{errors.points.message}</p>
              )}
            </div>

            {/* Difficulty */}
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <DifficultySelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Settings Toggles */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Options</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Allow Multiple Attempts */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Multiple Attempts</Label>
                  <p className="text-xs text-gray-600">Allow students to retry</p>
                </div>
                <Controller
                  name="allowMultipleAttempts"
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

          {/* Reasoning */}
          <div className="space-y-2">
            <Label htmlFor="reasoning" className="text-sm font-medium">
              Reasoning (Optional)
            </Label>
            <Controller
              name="reasoning"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="reasoning"
                  placeholder="Explain the logic behind the correct answer..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            <p className="text-xs text-gray-500">
              Explain why the statement is true or false to help students understand.
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
                  placeholder="Additional explanation or educational content..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          {/* Hints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                Hints (Optional)
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
              <div className="space-y-3">
                {watchedData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={hint}
                      onChange={(e) => handleUpdateHint(index, e.target.value)}
                      placeholder={`Hint ${index + 1}...`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteHint(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {(watchedData.hints?.length || 0) >= 5 && (
              <p className="text-xs text-gray-500">Maximum 5 hints allowed</p>
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
              type: 'true_false',
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
TrueFalseBuilder.displayName = 'TrueFalseBuilder'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default TrueFalseBuilder
export { 
  AnswerOption,
  DifficultySelector,
  QuestionPreviewPanel,
  generateId,
  createDefaultQuestion,
  getDifficultyColor,
  validateFormData,
  type TrueFalseBuilderProps,
  type AnswerOptionProps,
  type QuestionPreview
}