// File: src/components/quiz/components/quiz-checkbox.tsx

'use client'

// ✅ FIXED: Framework & Core Imports
import React, { useState, useEffect, useCallback, useMemo } from 'react'

// ✅ FIXED: UI Components menggunakan barrel imports dari index.ts
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Badge,
  Alert,
  AlertDescription,
  Progress,
  Separator
} from '@/components/ui'

// Feature Components
import { QuizProgress } from '../shared/quiz-progress'

// Icons
import { 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  XCircle, 
  AlertTriangle,
  Target,
  Eye,
  EyeOff,
  Shuffle
} from 'lucide-react'

// External Libraries  
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { 
  CheckboxQuestion, 
  QuizAnswer, 
  QuizAttemptResult,
  CheckboxOption
} from '../types'

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface QuizCheckboxProps {
  question: CheckboxQuestion
  questionIndex: number
  totalQuestions: number
  value?: string[]
  onChange: (value: string[]) => void
  onSubmit: (answer: QuizAnswer) => void
  isSubmitted?: boolean
  result?: QuizAttemptResult
  showCorrect?: boolean
  timeLimit?: number
  className?: string
}

interface CheckboxOptionProps {
  option: CheckboxOption
  index: number
  isSelected: boolean
  isCorrect?: boolean
  isIncorrect?: boolean
  showFeedback?: boolean
  onToggle: (optionId: string) => void
  disabled?: boolean
}

interface SelectionStats {
  selected: number
  total: number
  required: number
  correct: number
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const validateSelection = (
  selectedIds: string[], 
  question: CheckboxQuestion
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (question.minSelections && selectedIds.length < question.minSelections) {
    errors.push(`You must select at least ${question.minSelections} option${question.minSelections !== 1 ? 's' : ''}`)
  }
  
  if (question.maxSelections && selectedIds.length > question.maxSelections) {
    errors.push(`You can select maximum ${question.maxSelections} option${question.maxSelections !== 1 ? 's' : ''}`)
  }

  if (question.exactSelections && selectedIds.length !== question.exactSelections) {
    errors.push(`You must select exactly ${question.exactSelections} option${question.exactSelections !== 1 ? 's' : ''}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

const calculateScore = (
  selectedIds: string[], 
  correctAnswers: string[]
): { score: number; details: { correct: number; incorrect: number; missed: number } } => {
  const selectedSet = new Set(selectedIds)
  const correctSet = new Set(correctAnswers)
  
  let correct = 0
  let incorrect = 0
  let missed = 0

  // Count correct selections
  selectedIds.forEach(id => {
    if (correctSet.has(id)) {
      correct++
    } else {
      incorrect++
    }
  })

  // Count missed correct answers
  correctAnswers.forEach(id => {
    if (!selectedSet.has(id)) {
      missed++
    }
  })

  // Calculate score (penalize incorrect selections)
  const maxScore = correctAnswers.length
  const rawScore = Math.max(0, correct - incorrect)
  const score = maxScore > 0 ? (rawScore / maxScore) * 100 : 0

  return {
    score: Math.max(0, score),
    details: { correct, incorrect, missed }
  }
}

const getSelectionSummary = (
  selectedIds: string[], 
  question: CheckboxQuestion,
  correctAnswers?: string[]
): SelectionStats => {
  const correctCount = correctAnswers 
    ? selectedIds.filter(id => correctAnswers.includes(id)).length
    : 0

  return {
    selected: selectedIds.length,
    total: question.options.length,
    required: question.minSelections || question.exactSelections || 0,
    correct: correctCount
  }
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function CheckboxOptionItem({ 
  option, 
  index, 
  isSelected, 
  isCorrect, 
  isIncorrect, 
  showFeedback = false, 
  onToggle, 
  disabled = false 
}: CheckboxOptionProps) {
  const handleToggle = useCallback(() => {
    if (!disabled) {
      onToggle(option.id)
    }
  }, [option.id, onToggle, disabled])

  return (
    <div
      className={cn(
        "group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
        "hover:border-blue-300 hover:bg-blue-50",
        disabled && "cursor-not-allowed opacity-75",
        isSelected && "border-blue-500 bg-blue-50",
        showFeedback && isCorrect && "border-green-500 bg-green-50",
        showFeedback && isIncorrect && "border-red-500 bg-red-50"
      )}
      onClick={handleToggle}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="flex items-center justify-center mt-0.5">
          <Checkbox
            checked={isSelected}
            onChange={handleToggle}
            disabled={disabled}
            className={cn(
              "w-5 h-5",
              showFeedback && isCorrect && "border-green-500 data-[state=checked]:bg-green-500",
              showFeedback && isIncorrect && "border-red-500 data-[state=checked]:bg-red-500"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Option Text */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  showFeedback && isCorrect && "text-green-800",
                  showFeedback && isIncorrect && "text-red-800"
                )}>
                  {option.text}
                </span>
              </div>
              
              {option.description && (
                <p className="text-sm text-gray-600 mt-1 ml-8">
                  {option.description}
                </p>
              )}
            </div>

            {/* Feedback Icons */}
            {showFeedback && (
              <div className="ml-2">
                {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {isIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
            )}
          </div>

          {/* Option Image */}
          {option.imageUrl && (
            <div className="mt-3 ml-8">
              <img 
                src={option.imageUrl} 
                alt={option.imageAlt || `Option ${String.fromCharCode(65 + index)}`}
                className="max-w-32 max-h-32 object-contain rounded-md border border-gray-200"
              />
            </div>
          )}

          {/* Option Explanation (shown after submission) */}
          {showFeedback && option.explanation && (
            <div className="mt-3 ml-8 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <strong>Explanation:</strong> {option.explanation}
            </div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && !showFeedback && (
        <div className="absolute top-2 right-2">
          <CheckSquare className="w-4 h-4 text-blue-600" />
        </div>
      )}
    </div>
  )
}

function SelectionSummary({ 
  stats, 
  question, 
  showScore = false, 
  score 
}: {
  stats: SelectionStats
  question: CheckboxQuestion
  showScore?: boolean
  score?: number
}) {
  const getStatusColor = () => {
    if (showScore) {
      return score && score >= 70 ? 'text-green-600' : 'text-red-600'
    }
    
    if (question.exactSelections) {
      return stats.selected === question.exactSelections ? 'text-green-600' : 'text-orange-600'
    }
    
    if (question.minSelections && stats.selected < question.minSelections) {
      return 'text-red-600'
    }
    
    if (question.maxSelections && stats.selected > question.maxSelections) {
      return 'text-red-600'
    }
    
    return 'text-blue-600'
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4 text-sm">
        <span className={cn("font-medium", getStatusColor())}>
          {stats.selected} of {stats.total} selected
        </span>
        
        {question.exactSelections && (
          <span className="text-gray-600">
            (exactly {question.exactSelections} required)
          </span>
        )}
        
        {question.minSelections && !question.exactSelections && (
          <span className="text-gray-600">
            (minimum {question.minSelections} required)
          </span>
        )}
        
        {question.maxSelections && !question.exactSelections && (
          <span className="text-gray-600">
            (maximum {question.maxSelections} allowed)
          </span>
        )}

        {showScore && (
          <Badge className={score && score >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {stats.correct} correct
          </Badge>
        )}
      </div>

      {showScore && score !== undefined && (
        <Badge className={score >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {Math.round(score)}% Score
        </Badge>
      )}
    </div>
  )
}

function SelectionProgress({ current, max, type }: { current: number; max: number; type: 'min' | 'max' | 'exact' }) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0
  
  const getColor = () => {
    if (type === 'exact') {
      return current === max ? 'bg-green-500' : 'bg-blue-500'
    }
    if (type === 'min') {
      return current >= max ? 'bg-green-500' : 'bg-orange-500'
    }
    return current <= max ? 'bg-green-500' : 'bg-red-500'
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>Selection Progress</span>
        <span>{current} / {max}</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        // Apply custom color through CSS custom properties
        style={{
          '--progress-background': percentage === 100 ? '#10b981' : '#3b82f6'
        } as React.CSSProperties}
      />
    </div>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizCheckbox({
  question,
  questionIndex,
  totalQuestions,
  value = [],
  onChange,
  onSubmit,
  isSubmitted = false,
  result,
  showCorrect = false,
  timeLimit,
  className
}: QuizCheckboxProps) {
  // State Management
  const [selectedIds, setSelectedIds] = useState<string[]>(value)
  const [shuffledOptions, setShuffledOptions] = useState<CheckboxOption[]>([])
  const [showHints, setShowHints] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Initialize shuffled options
  useEffect(() => {
    const options = question.shuffleOptions 
      ? shuffleArray(question.options)
      : question.options
    setShuffledOptions(options)
  }, [question.options, question.shuffleOptions])

  // Sync with parent component
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(selectedIds)) {
      setSelectedIds(value)
    }
  }, [value])

  useEffect(() => {
    onChange(selectedIds)
  }, [selectedIds, onChange])

  // Event Handlers
  const handleToggle = useCallback((optionId: string) => {
    setSelectedIds(prev => {
      const newSelection = prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
      
      // Validate max selections immediately
      if (question.maxSelections && newSelection.length > question.maxSelections) {
        toast.error(`You can select maximum ${question.maxSelections} option${question.maxSelections !== 1 ? 's' : ''}`)
        return prev
      }
      
      return newSelection
    })
    setValidationErrors([])
  }, [question.maxSelections])

  const handleSelectAll = useCallback(() => {
    if (isSubmitted) return
    
    const allIds = shuffledOptions.map(option => option.id)
    if (question.maxSelections && allIds.length > question.maxSelections) {
      toast.error(`Cannot select all: maximum ${question.maxSelections} option${question.maxSelections !== 1 ? 's' : ''} allowed`)
      return
    }
    
    setSelectedIds(allIds)
    setValidationErrors([])
    toast.success('All options selected')
  }, [shuffledOptions, question.maxSelections, isSubmitted])

  const handleClearAll = useCallback(() => {
    if (isSubmitted) return
    
    setSelectedIds([])
    setValidationErrors([])
    toast.success('All selections cleared')
  }, [isSubmitted])

  const handleShuffle = useCallback(() => {
    if (isSubmitted) return
    
    setShuffledOptions(shuffleArray(question.options))
    toast.success('Options shuffled')
  }, [question.options, isSubmitted])

  const handleSubmit = useCallback(() => {
    const validation = validateSelection(selectedIds, question)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const answer: QuizAnswer = {
      questionId: question.id,
      type: 'checkbox',
      answer: selectedIds,
      metadata: {
        submittedAt: new Date().toISOString(),
        optionsShuffled: question.shuffleOptions,
        totalOptions: question.options.length
      }
    }

    onSubmit(answer)
    toast.success('Answer submitted successfully!')
  }, [selectedIds, question, onSubmit])

  // Computed Values
  const isCorrect = result?.isCorrect ?? false
  const stats = useMemo(() => 
    getSelectionSummary(selectedIds, question, question.correctAnswers), 
    [selectedIds, question]
  )
  
  const scoreData = useMemo(() => {
    if (!question.correctAnswers) return null
    return calculateScore(selectedIds, question.correctAnswers)
  }, [selectedIds, question.correctAnswers])

  const validation = useMemo(() => 
    validateSelection(selectedIds, question), 
    [selectedIds, question]
  )

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span>Question {questionIndex + 1}</span>
              <Badge variant="outline">Multiple Select</Badge>
            </CardTitle>
            
            {timeLimit && (
              <QuizProgress 
                current={questionIndex + 1} 
                total={totalQuestions}
                timeLimit={timeLimit}
                className="mt-2"
              />
            )}
          </div>

          {isSubmitted && (
            <Badge className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {question.question}
          </p>
          
          {question.instructions && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions:</h4>
              <p className="text-sm text-blue-700">{question.instructions}</p>
            </div>
          )}
        </div>

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

        {/* Controls */}
        {!isSubmitted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                {showHints ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
              
              {question.hints && showHints && (
                <Badge variant="outline" className="text-blue-600">
                  {question.hints.length} hint(s) available
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                disabled={isSubmitted}
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isSubmitted || (question.maxSelections && shuffledOptions.length > question.maxSelections)}
              >
                <Target className="w-4 h-4 mr-1" />
                Select All
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={isSubmitted || selectedIds.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Hints */}
        {showHints && question.hints && question.hints.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <ul className="list-disc list-inside space-y-1">
                {question.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Selection Progress */}
        {!isSubmitted && (question.minSelections || question.maxSelections || question.exactSelections) && (
          <div className="space-y-3">
            {question.exactSelections && (
              <SelectionProgress 
                current={selectedIds.length} 
                max={question.exactSelections} 
                type="exact" 
              />
            )}
            {question.minSelections && !question.exactSelections && (
              <SelectionProgress 
                current={selectedIds.length} 
                max={question.minSelections} 
                type="min" 
              />
            )}
            {question.maxSelections && !question.exactSelections && (
              <SelectionProgress 
                current={selectedIds.length} 
                max={question.maxSelections} 
                type="max" 
              />
            )}
          </div>
        )}

        {/* Selection Summary */}
        <SelectionSummary 
          stats={stats} 
          question={question}
          showScore={showCorrect}
          score={scoreData?.score}
        />

        {/* Options */}
        <div className="space-y-3">
          {shuffledOptions.map((option, index) => {
            const isSelected = selectedIds.includes(option.id)
            const isCorrect = showCorrect && question.correctAnswers?.includes(option.id)
            const isIncorrect = showCorrect && isSelected && !question.correctAnswers?.includes(option.id)
            
            return (
              <CheckboxOptionItem
                key={option.id}
                option={option}
                index={index}
                isSelected={isSelected}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                showFeedback={showCorrect}
                onToggle={handleToggle}
                disabled={isSubmitted}
              />
            )
          })}
        </div>

        {/* Score Details */}
        {scoreData && showCorrect && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Score Breakdown</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-semibold">{scoreData.details.correct}</div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-semibold">{scoreData.details.incorrect}</div>
                <div className="text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-orange-600 font-semibold">{scoreData.details.missed}</div>
                <div className="text-gray-600">Missed</div>
              </div>
            </div>
            <Progress value={scoreData.score} className="h-2" />
          </div>
        )}

        {/* Explanation */}
        {isSubmitted && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Explanation:</h4>
            <p className="text-sm text-blue-700">{question.explanation}</p>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={!validation.isValid}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Component Display Name
QuizCheckbox.displayName = 'QuizCheckbox'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default QuizCheckbox
export { 
  CheckboxOptionItem, 
  SelectionSummary, 
  SelectionProgress,
  shuffleArray,
  validateSelection,
  calculateScore,
  getSelectionSummary,
  type QuizCheckboxProps,
  type CheckboxOptionProps,
  type SelectionStats
}