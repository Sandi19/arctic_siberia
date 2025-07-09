// File: src/components/session/content-handlers/survey/survey-renderer.tsx

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, formatDistanceToNow, isAfter } from 'date-fns'
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
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Badge,
  Alert,
  AlertDescription,
  Progress,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Send,
  Save,
  Eye,
  EyeOff,
  Clock,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  ThumbsUp,
  MessageSquare,
  Award,
  Download,
  Share,
  RefreshCw,
  Calendar,
  Hash,
  Zap,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  SurveyContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const responseSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.array(z.string()), z.number()]),
  textValue: z.string().optional()
})

const submissionSchema = z.object({
  responses: z.array(responseSchema),
  participantName: z.string().optional(),
  participantEmail: z.string().email().optional(),
  notes: z.string().optional()
})

type SubmissionFormData = z.infer<typeof submissionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface SurveyRendererProps {
  content: SurveyContent
  onSubmit?: (submission: SurveySubmission) => void
  onSaveDraft?: (draft: Partial<SurveySubmission>) => void
  existingSubmission?: SurveySubmission
  showResults?: boolean
  isReadOnly?: boolean
  className?: string
}

interface SurveySubmission {
  id: string
  surveyId: string
  participantId: string
  participantName?: string
  participantEmail?: string
  responses: SurveyResponse[]
  submittedAt: Date
  status: 'DRAFT' | 'SUBMITTED' | 'COMPLETED'
  completionTime: number // in seconds
  isAnonymous: boolean
  notes?: string
  ipAddress?: string
  userAgent?: string
}

interface SurveyResponse {
  questionId: string
  questionType: 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'LIKERT' | 'CHECKBOX'
  value: string | string[] | number
  textValue?: string
  answeredAt: Date
}

interface QuestionRendererProps {
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
  }
  index: number
  response?: SurveyResponse
  isReadOnly: boolean
  onResponseChange: (questionId: string, response: Partial<SurveyResponse>) => void
  error?: string
}

interface SurveyResultsProps {
  survey: SurveyContent
  submissions: SurveySubmission[]
  currentSubmission?: SurveySubmission
}

interface ProgressIndicatorProps {
  currentQuestion: number
  totalQuestions: number
  completedQuestions: number
  showProgressBar: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateSubmissionId = (): string => {
  return `survey_submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const calculateProgress = (responses: SurveyResponse[], totalQuestions: number): number => {
  return Math.round((responses.length / totalQuestions) * 100)
}

const calculateCompletionTime = (startTime: Date, endTime: Date): number => {
  return Math.round((endTime.getTime() - startTime.getTime()) / 1000)
}

const validateResponse = (question: any, value: any): string | null => {
  if (question.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
    return 'This question is required'
  }

  if (question.type === 'TEXT' && question.validation) {
    const textValue = value as string
    if (question.validation.minLength && textValue.length < question.validation.minLength) {
      return `Minimum ${question.validation.minLength} characters required`
    }
    if (question.validation.maxLength && textValue.length > question.validation.maxLength) {
      return `Maximum ${question.validation.maxLength} characters allowed`
    }
    if (question.validation.pattern && !new RegExp(question.validation.pattern).test(textValue)) {
      return 'Invalid format'
    }
  }

  return null
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function SurveyRenderer({
  content,
  onSubmit,
  onSaveDraft,
  existingSubmission,
  showResults = false,
  isReadOnly = false,
  className = ''
}: SurveyRendererProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [responses, setResponses] = useState<SurveyResponse[]>(existingSubmission?.responses || [])
  const [currentPage, setCurrentPage] = useState(0)
  const [startTime] = useState(new Date())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [participantInfo, setParticipantInfo] = useState({
    name: existingSubmission?.participantName || '',
    email: existingSubmission?.participantEmail || ''
  })

  // ===============================================================
  // 🎯 COMPUTED VALUES
  // ===============================================================
  
  const questions = content.surveyData.shuffleQuestions 
    ? shuffleArray(content.surveyData.questions)
    : content.surveyData.questions

  const questionsPerPage = 1 // Single question per page for better UX
  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  )
  
  const completedQuestions = questions.filter(q => 
    responses.some(r => r.questionId === q.id)
  ).length
  
  const progress = calculateProgress(responses, questions.length)
  const isLastPage = currentPage === totalPages - 1
  const isFirstPage = currentPage === 0
  const canGoNext = currentQuestions.every(q => 
    !q.isRequired || responses.some(r => r.questionId === q.id)
  )
  
  const isSurveyExpired = content.surveyData.expiresAt ? 
    isAfter(new Date(), content.surveyData.expiresAt) : false

  const hasSubmission = !!existingSubmission
  const isCompleted = existingSubmission?.status === 'COMPLETED'

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleResponseChange = useCallback((questionId: string, responseData: Partial<SurveyResponse>) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId)
      const question = questions.find(q => q.id === questionId)
      
      if (existing) {
        return prev.map(r => 
          r.questionId === questionId 
            ? { ...r, ...responseData, answeredAt: new Date() }
            : r
        )
      } else {
        return [...prev, {
          questionId,
          questionType: question?.type || 'TEXT',
          answeredAt: new Date(),
          ...responseData
        } as SurveyResponse]
      }
    })

    // Clear error for this question
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[questionId]
      return newErrors
    })
  }, [questions])

  const validateCurrentPage = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    currentQuestions.forEach(question => {
      const response = responses.find(r => r.questionId === question.id)
      const error = validateResponse(question, response?.value)
      if (error) {
        newErrors[question.id] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentQuestions, responses])

  const handleNextPage = useCallback(() => {
    if (validateCurrentPage() && !isLastPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [validateCurrentPage, isLastPage])

  const handlePrevPage = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [isFirstPage])

  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return
    
    setIsDraftSaving(true)
    try {
      const draft: Partial<SurveySubmission> = {
        surveyId: content.id,
        responses,
        status: 'DRAFT',
        participantName: participantInfo.name || undefined,
        participantEmail: participantInfo.email || undefined,
        isAnonymous: content.surveyData.isAnonymous
      }
      
      await onSaveDraft(draft)
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }, [content, responses, participantInfo, onSaveDraft])

  const handleSubmit = useCallback(async () => {
    if (!onSubmit || !validateCurrentPage()) return
    
    // Validate all questions
    const allErrors: Record<string, string> = {}
    questions.forEach(question => {
      const response = responses.find(r => r.questionId === question.id)
      const error = validateResponse(question, response?.value)
      if (error) {
        allErrors[question.id] = error
      }
    })
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      return
    }
    
    setIsSubmitting(true)
    try {
      const submission: SurveySubmission = {
        id: existingSubmission?.id || generateSubmissionId(),
        surveyId: content.id,
        participantId: 'current-participant-id', // Would come from auth context
        participantName: content.surveyData.isAnonymous ? undefined : participantInfo.name,
        participantEmail: content.surveyData.isAnonymous ? undefined : participantInfo.email,
        responses,
        submittedAt: new Date(),
        status: 'COMPLETED',
        completionTime: calculateCompletionTime(startTime, new Date()),
        isAnonymous: content.surveyData.isAnonymous
      }
      
      await onSubmit(submission)
      
      // Show results if enabled
      if (content.surveyData.showResults && content.surveyData.resultsVisibility === 'IMMEDIATE') {
        setShowResultsDialog(true)
      }
      
    } catch (error) {
      console.error('Error submitting survey:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [content, questions, responses, participantInfo, startTime, onSubmit, existingSubmission, validateCurrentPage])

  // ===============================================================
  // 🎯 AUTO-SAVE EFFECT
  // ===============================================================
  
  useEffect(() => {
    if (responses.length > 0 && !isReadOnly) {
      const timer = setTimeout(() => {
        handleSaveDraft()
      }, 10000) // Auto-save every 10 seconds
      
      return () => clearTimeout(timer)
    }
  }, [responses, isReadOnly, handleSaveDraft])

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Survey Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {content.title}
              </CardTitle>
              
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{questions.length} questions</span>
                </div>
                
                {content.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{content.duration} min</span>
                  </div>
                )}
                
                {content.points > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{content.points} points</span>
                  </div>
                )}
                
                {content.surveyData.isAnonymous && (
                  <Badge variant="secondary">Anonymous</Badge>
                )}
                
                {isSurveyExpired && (
                  <Badge variant="destructive">Expired</Badge>
                )}
              </div>
            </div>
            
            {hasSubmission && (
              <div className="text-right text-sm">
                <Badge className={isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {existingSubmission?.status}
                </Badge>
                {existingSubmission?.submittedAt && (
                  <div className="text-gray-600 mt-1">
                    {format(existingSubmission.submittedAt, 'PPp', { locale: id })}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Survey Expired Alert */}
      {isSurveyExpired && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            This survey has expired on {format(content.surveyData.expiresAt!, 'PPP', { locale: id })}
          </AlertDescription>
        </Alert>
      )}

      {/* Already Completed Alert */}
      {isCompleted && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            You have already completed this survey. 
            {content.surveyData.showResults && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-green-700"
                onClick={() => setShowResultsDialog(true)}
              >
                View results
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      {content.surveyData.instructions && !isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: content.surveyData.instructions 
              }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      {!isCompleted && !isSurveyExpired && (
        <ProgressIndicator
          currentQuestion={currentPage + 1}
          totalQuestions={totalPages}
          completedQuestions={completedQuestions}
          showProgressBar={true}
        />
      )}

      {/* Participant Information */}
      {!content.surveyData.isAnonymous && !isCompleted && !isSurveyExpired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participantName">Name</Label>
                <Input
                  id="participantName"
                  value={participantInfo.name}
                  onChange={(e) => setParticipantInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="participantEmail">Email</Label>
                <Input
                  id="participantEmail"
                  type="email"
                  value={participantInfo.email}
                  onChange={(e) => setParticipantInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Survey Questions */}
      {!isCompleted && !isSurveyExpired && (
        <div className="space-y-6">
          {currentQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <QuestionRenderer
                  question={question}
                  index={currentPage * questionsPerPage + index}
                  response={responses.find(r => r.questionId === question.id)}
                  isReadOnly={isReadOnly}
                  onResponseChange={handleResponseChange}
                  error={errors[question.id]}
                />
              </CardContent>
            </Card>
          ))}

          {/* Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={isFirstPage}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      onClick={handleSaveDraft}
                      disabled={isDraftSaving}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isDraftSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  Question {currentPage + 1} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  {!isLastPage ? (
                    <Button
                      onClick={handleNextPage}
                      disabled={!canGoNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !canGoNext}
                      className="flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Survey Completed!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your participation. Your response has been recorded.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Completed in {Math.round((existingSubmission?.completionTime || 0) / 60)} minutes</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{responses.length}/{questions.length} questions answered</span>
              </div>
            </div>
            
            {content.surveyData.showResults && (
              <Button 
                onClick={() => setShowResultsDialog(true)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Results
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Dialog */}
      {showResultsDialog && content.surveyData.showResults && (
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Survey Results</DialogTitle>
            </DialogHeader>
            <SurveyResults 
              survey={content} 
              submissions={[]} // Would be populated with actual data
              currentSubmission={existingSubmission}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
SurveyRenderer.displayName = 'SurveyRenderer'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function QuestionRenderer({ 
  question, 
  index, 
  response, 
  isReadOnly, 
  onResponseChange, 
  error 
}: QuestionRendererProps) {
  const handleValueChange = (value: string | string[] | number) => {
    onResponseChange(question.id, { value })
  }

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">
            {index + 1}. {question.question}
          </span>
          {question.isRequired && (
            <span className="text-red-500">*</span>
          )}
        </div>
        
        {question.description && (
          <p className="text-gray-600 text-sm">{question.description}</p>
        )}
      </div>

      {/* Question Input */}
      <div className="space-y-3">
        {question.type === 'MULTIPLE_CHOICE' && (
          <RadioGroup
            value={response?.value as string || ''}
            onValueChange={handleValueChange}
            disabled={isReadOnly}
          >
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                <Label htmlFor={`${question.id}-${optionIndex}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'CHECKBOX' && (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${optionIndex}`}
                  checked={(response?.value as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = response?.value as string[] || []
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option)
                    handleValueChange(newValues)
                  }}
                  disabled={isReadOnly}
                />
                <Label htmlFor={`${question.id}-${optionIndex}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'TEXT' && (
          <Textarea
            value={response?.value as string || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter your response..."
            rows={4}
            disabled={isReadOnly}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {(question.type === 'RATING' || question.type === 'LIKERT') && (
          <RadioGroup
            value={response?.value as string || ''}
            onValueChange={handleValueChange}
            disabled={isReadOnly}
            className="flex flex-wrap gap-4"
          >
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex flex-col items-center space-y-1">
                <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                <Label 
                  htmlFor={`${question.id}-${optionIndex}`} 
                  className="text-sm text-center font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Info */}
      {question.type === 'TEXT' && question.validation && (
        <div className="text-xs text-gray-500">
          {question.validation.minLength && (
            <span>Min: {question.validation.minLength} characters. </span>
          )}
          {question.validation.maxLength && (
            <span>Max: {question.validation.maxLength} characters. </span>
          )}
          {response?.value && (
            <span>Current: {(response.value as string).length} characters</span>
          )}
        </div>
      )}
    </div>
  )
}

function ProgressIndicator({ 
  currentQuestion, 
  totalQuestions, 
  completedQuestions, 
  showProgressBar 
}: ProgressIndicatorProps) {
  const progress = (completedQuestions / totalQuestions) * 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">
            {completedQuestions}/{totalQuestions} completed
          </span>
        </div>
        
        {showProgressBar && (
          <Progress value={progress} className="mb-2" />
        )}
        
        <div className="text-xs text-gray-500 text-center">
          Question {currentQuestion} of {totalQuestions}
        </div>
      </CardContent>
    </Card>
  )
}

function SurveyResults({ survey, submissions, currentSubmission }: SurveyResultsProps) {
  const totalSubmissions = submissions.length
  const averageCompletionTime = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + s.completionTime, 0) / submissions.length
    : 0

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSubmissions}</div>
          <div className="text-sm text-gray-600">Total Responses</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(averageCompletionTime / 60)}m
          </div>
          <div className="text-sm text-gray-600">Avg. Completion Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {currentSubmission ? '✓' : '○'}
          </div>
          <div className="text-sm text-gray-600">Your Response</div>
        </div>
      </div>

      <Separator />

      {/* Question Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Response Breakdown</h3>
        
        {survey.surveyData.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.type === 'MULTIPLE_CHOICE' || question.type === 'LIKERT' || question.type === 'RATING' ? (
                <div className="space-y-3">
                  {question.options?.map((option, optionIndex) => {
                    const count = submissions.filter(s => 
                      s.responses.some(r => r.questionId === question.id && r.value === option)
                    ).length
                    const percentage = totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0
                    
                    return (
                      <div key={optionIndex} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{option}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : question.type === 'CHECKBOX' ? (
                <div className="space-y-3">
                  {question.options?.map((option, optionIndex) => {
                    const count = submissions.filter(s => 
                      s.responses.some(r => 
                        r.questionId === question.id && 
                        Array.isArray(r.value) && 
                        r.value.includes(option)
                      )
                    ).length
                    const percentage = totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0
                    
                    return (
                      <div key={optionIndex} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{option}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>{submissions.filter(s => 
                    s.responses.some(r => r.questionId === question.id)
                  ).length} responses</p>
                  
                  {/* Show sample responses for text questions */}
                  {submissions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="font-medium">Sample responses:</p>
                      {submissions
                        .filter(s => s.responses.some(r => r.questionId === question.id))
                        .slice(0, 3)
                        .map((submission, idx) => {
                          const response = submission.responses.find(r => r.questionId === question.id)
                          return (
                            <blockquote key={idx} className="border-l-2 border-gray-300 pl-3 text-sm italic">
                              "{response?.value}"
                            </blockquote>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
              
              {/* Show current user's response */}
              {currentSubmission && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Your Response:</p>
                  {(() => {
                    const userResponse = currentSubmission.responses.find(r => r.questionId === question.id)
                    if (!userResponse) return <span className="text-sm text-gray-600">No response</span>
                    
                    if (Array.isArray(userResponse.value)) {
                      return <span className="text-sm text-blue-800">{userResponse.value.join(', ')}</span>
                    }
                    return <span className="text-sm text-blue-800">{userResponse.value}</span>
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Download Results */}
      <div className="flex justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Results
        </Button>
      </div>
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default SurveyRenderer
export { 
  QuestionRenderer, 
  ProgressIndicator, 
  SurveyResults, 
  type SurveyRendererProps 
}