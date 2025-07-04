// File: src/components/quiz/components/quiz-true-false.tsx

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
  Badge,
  Alert,
  AlertDescription,
  RadioGroup,
  RadioGroupItem,
  Label,
  Separator
} from '@/components/ui'

// Feature Components
import { QuizProgress } from '../shared/quiz-progress'

// Icons
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Lightbulb,
  Target
} from 'lucide-react'

// External Libraries  
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { 
  TrueFalseQuestion, 
  QuizAnswer, 
  QuizAttemptResult
} from '../types'

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface QuizTrueFalseProps {
  question: TrueFalseQuestion
  questionIndex: number
  totalQuestions: number
  value?: boolean | null
  onChange: (value: boolean | null) => void
  onSubmit: (answer: QuizAnswer) => void
  isSubmitted?: boolean
  result?: QuizAttemptResult
  showCorrect?: boolean
  timeLimit?: number
  className?: string
}

interface TrueFalseOptionProps {
  value: boolean
  label: string
  icon: React.ComponentType<{ className?: string }>
  isSelected: boolean
  isCorrect?: boolean
  isIncorrect?: boolean
  showFeedback?: boolean
  onSelect: (value: boolean) => void
  disabled?: boolean
  description?: string
}

interface QuestionAnalysis {
  hasSelectedAnswer: boolean
  isAnswerCorrect: boolean | null
  confidence: 'low' | 'medium' | 'high'
  reasoning?: string
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const analyzeAnswer = (
  selectedValue: boolean | null,
  correctAnswer: boolean,
  question: TrueFalseQuestion
): QuestionAnalysis => {
  const hasSelectedAnswer = selectedValue !== null
  const isAnswerCorrect = hasSelectedAnswer ? selectedValue === correctAnswer : null
  
  // Simple confidence calculation based on question complexity
  let confidence: 'low' | 'medium' | 'high' = 'medium'
  
  if (question.question.length > 200) {
    confidence = 'low' // Long questions might be more complex
  } else if (question.hints && question.hints.length > 0) {
    confidence = 'high' // Questions with hints might be easier
  }
  
  return {
    hasSelectedAnswer,
    isAnswerCorrect,
    confidence,
    reasoning: question.reasoning
  }
}

const getOptionColor = (
  isSelected: boolean,
  isCorrect?: boolean,
  isIncorrect?: boolean,
  showFeedback?: boolean
): string => {
  if (showFeedback) {
    if (isCorrect) return 'border-green-500 bg-green-50 text-green-800'
    if (isIncorrect) return 'border-red-500 bg-red-50 text-red-800'
  }
  
  if (isSelected) {
    return 'border-blue-500 bg-blue-50 text-blue-800'
  }
  
  return 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
}

const getConfidenceColor = (confidence: 'low' | 'medium' | 'high'): string => {
  switch (confidence) {
    case 'high': return 'text-green-600'
    case 'medium': return 'text-yellow-600'
    case 'low': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function TrueFalseOption({ 
  value, 
  label, 
  icon: Icon, 
  isSelected, 
  isCorrect, 
  isIncorrect, 
  showFeedback = false, 
  onSelect, 
  disabled = false,
  description 
}: TrueFalseOptionProps) {
  const handleSelect = useCallback(() => {
    if (!disabled) {
      onSelect(value)
    }
  }, [value, onSelect, disabled])

  return (
    <div
      className={cn(
        "group relative p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer",
        getOptionColor(isSelected, isCorrect, isIncorrect, showFeedback),
        disabled && "cursor-not-allowed opacity-75"
      )}
      onClick={handleSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Radio Button */}
          <div className="flex items-center justify-center">
            <RadioGroupItem
              value={value.toString()}
              checked={isSelected}
              disabled={disabled}
              className={cn(
                "w-5 h-5",
                showFeedback && isCorrect && "border-green-500 text-green-500",
                showFeedback && isIncorrect && "border-red-500 text-red-500"
              )}
            />
          </div>

          {/* Icon */}
          <div className={cn(
            "p-3 rounded-full transition-colors",
            isSelected && !showFeedback && "bg-blue-100",
            showFeedback && isCorrect && "bg-green-100",
            showFeedback && isIncorrect && "bg-red-100",
            !isSelected && !showFeedback && "bg-gray-100"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              isSelected && !showFeedback && "text-blue-600",
              showFeedback && isCorrect && "text-green-600",
              showFeedback && isIncorrect && "text-red-600",
              !isSelected && !showFeedback && "text-gray-600"
            )} />
          </div>

          {/* Label and Description */}
          <div className="flex-1">
            <div className="text-lg font-semibold mb-1">
              {label}
            </div>
            {description && (
              <div className="text-sm opacity-75">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Icon */}
        {showFeedback && (
          <div className="ml-4">
            {isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
            {isIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && !showFeedback && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        </div>
      )}
    </div>
  )
}

function QuestionStats({ 
  analysis, 
  showStats = false 
}: {
  analysis: QuestionAnalysis
  showStats?: boolean
}) {
  if (!showStats) return null

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Answer Analysis
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Status:</span>
          <span className={cn(
            "ml-2 font-medium",
            analysis.hasSelectedAnswer ? "text-blue-600" : "text-gray-500"
          )}>
            {analysis.hasSelectedAnswer ? "Answered" : "Pending"}
          </span>
        </div>
        
        <div>
          <span className="text-gray-600">Confidence:</span>
          <span className={cn("ml-2 font-medium", getConfidenceColor(analysis.confidence))}>
            {analysis.confidence.charAt(0).toUpperCase() + analysis.confidence.slice(1)}
          </span>
        </div>
      </div>

      {analysis.isAnswerCorrect !== null && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {analysis.isAnswerCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              analysis.isAnswerCorrect ? "text-green-600" : "text-red-600"
            )}>
              {analysis.isAnswerCorrect ? "Correct Answer" : "Incorrect Answer"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function QuestionHints({ 
  hints, 
  isVisible 
}: {
  hints?: string[]
  isVisible: boolean
}) {
  if (!isVisible || !hints || hints.length === 0) return null

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Lightbulb className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="space-y-2">
          <div className="font-medium">Hints:</div>
          <ul className="list-disc list-inside space-y-1">
            {hints.map((hint, index) => (
              <li key={index} className="text-sm">{hint}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizTrueFalse({
  question,
  questionIndex,
  totalQuestions,
  value = null,
  onChange,
  onSubmit,
  isSubmitted = false,
  result,
  showCorrect = false,
  timeLimit,
  className
}: QuizTrueFalseProps) {
  // State Management
  const [selectedValue, setSelectedValue] = useState<boolean | null>(value)
  const [showHints, setShowHints] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  // Sync with parent component
  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value)
    }
  }, [value])

  useEffect(() => {
    onChange(selectedValue)
  }, [selectedValue, onChange])

  // Event Handlers
  const handleSelect = useCallback((newValue: boolean) => {
    if (!isSubmitted) {
      setSelectedValue(newValue)
      
      // Provide immediate feedback
      if (newValue === true) {
        toast.success('Selected: True')
      } else {
        toast.success('Selected: False')
      }
    }
  }, [isSubmitted])

  const handleClear = useCallback(() => {
    if (!isSubmitted) {
      setSelectedValue(null)
      toast.success('Selection cleared')
    }
  }, [isSubmitted])

  const handleSubmit = useCallback(() => {
    if (selectedValue === null) {
      toast.error('Please select an answer before submitting')
      return
    }

    const answer: QuizAnswer = {
      questionId: question.id,
      type: 'true_false',
      answer: selectedValue,
      metadata: {
        submittedAt: new Date().toISOString(),
        timeToAnswer: Date.now() // In real implementation, track actual time
      }
    }

    onSubmit(answer)
    toast.success('Answer submitted successfully!')
  }, [selectedValue, question.id, onSubmit])

  // Computed Values
  const isCorrect = result?.isCorrect ?? false
  const analysis = useMemo(() => 
    analyzeAnswer(selectedValue, question.correctAnswer, question), 
    [selectedValue, question]
  )

  const trueOption = {
    value: true,
    label: 'True',
    icon: CheckCircle2,
    description: 'This statement is correct'
  }

  const falseOption = {
    value: false,
    label: 'False', 
    icon: XCircle,
    description: 'This statement is incorrect'
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Question {questionIndex + 1}</span>
              <Badge variant="outline">True/False</Badge>
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
          <p className="text-gray-700 leading-relaxed text-lg">
            {question.question}
          </p>
          
          {question.context && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Context:</h4>
              <p className="text-sm text-gray-600">{question.context}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        {!isSubmitted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
                disabled={!question.hints || question.hints.length === 0}
              >
                {showHints ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                <Target className="w-4 h-4 mr-1" />
                {showAnalysis ? 'Hide' : 'Show'} Analysis
              </Button>
              
              {question.hints && question.hints.length > 0 && (
                <Badge variant="outline" className="text-blue-600">
                  {question.hints.length} hint(s) available
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={selectedValue === null}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Hints */}
        <QuestionHints hints={question.hints} isVisible={showHints} />

        {/* Analysis */}
        <QuestionStats analysis={analysis} showStats={showAnalysis} />

        {/* Answer Selection */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Select your answer:</h4>
          
          <RadioGroup 
            value={selectedValue?.toString() || ""} 
            onValueChange={(value) => handleSelect(value === 'true')}
            disabled={isSubmitted}
          >
            <div className="space-y-4">
              {/* True Option */}
              <TrueFalseOption
                {...trueOption}
                isSelected={selectedValue === true}
                isCorrect={showCorrect && question.correctAnswer === true && selectedValue === true}
                isIncorrect={showCorrect && question.correctAnswer === false && selectedValue === true}
                showFeedback={showCorrect}
                onSelect={handleSelect}
                disabled={isSubmitted}
              />

              {/* False Option */}
              <TrueFalseOption
                {...falseOption}
                isSelected={selectedValue === false}
                isCorrect={showCorrect && question.correctAnswer === false && selectedValue === false}
                isIncorrect={showCorrect && question.correctAnswer === true && selectedValue === false}
                showFeedback={showCorrect}
                onSelect={handleSelect}
                disabled={isSubmitted}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Selection Summary */}
        {selectedValue !== null && !isSubmitted && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                You selected: <strong>{selectedValue ? 'True' : 'False'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Correct Answer Display */}
        {showCorrect && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Correct Answer: <strong>{question.correctAnswer ? 'True' : 'False'}</strong>
              </span>
            </div>
            
            {question.reasoning && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <h5 className="text-sm font-medium text-green-800 mb-1">Reasoning:</h5>
                <p className="text-sm text-green-700">{question.reasoning}</p>
              </div>
            )}
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
              disabled={selectedValue === null}
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
QuizTrueFalse.displayName = 'QuizTrueFalse'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default QuizTrueFalse
export { 
  TrueFalseOption, 
  QuestionStats, 
  QuestionHints,
  analyzeAnswer,
  getOptionColor,
  getConfidenceColor,
  type QuizTrueFalseProps,
  type TrueFalseOptionProps,
  type QuestionAnalysis
}