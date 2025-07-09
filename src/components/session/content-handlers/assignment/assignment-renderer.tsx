// File: src/components/session/content-handlers/assignment/assignment-renderer.tsx

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, isAfter, isBefore, differenceInDays } from 'date-fns'
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
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Clock,
  FileText,
  Upload,
  Link,
  Code,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  Send,
  Save,
  X,
  Info,
  Star,
  UserCheck,
  Timer,
  Target
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  AssignmentContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const submissionSchema = z.object({
  type: z.enum(['TEXT', 'FILE', 'LINK', 'CODE']),
  content: z.string().min(1, 'Submission content is required'),
  files: z.array(z.instanceof(File)).optional(),
  links: z.array(z.string().url()).optional(),
  notes: z.string().optional()
})

type SubmissionFormData = z.infer<typeof submissionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface AssignmentRendererProps {
  content: AssignmentContent
  onSubmit?: (submission: StudentSubmission) => void
  onSaveDraft?: (draft: Partial<StudentSubmission>) => void
  existingSubmission?: StudentSubmission
  isReadOnly?: boolean
  showGrading?: boolean
  className?: string
}

interface StudentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  submissionType: 'TEXT' | 'FILE' | 'LINK' | 'CODE'
  content: string
  files?: File[]
  links?: string[]
  notes?: string
  submittedAt: Date
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RETURNED'
  grade?: number
  feedback?: string
  rubricScores?: Array<{
    criteria: string
    score: number
    feedback?: string
  }>
  isLate: boolean
}

interface AssignmentStatusProps {
  assignment: AssignmentContent
  submission?: StudentSubmission
}

interface SubmissionFormProps {
  assignment: AssignmentContent
  onSubmit: (submission: StudentSubmission) => void
  onSaveDraft: (draft: Partial<StudentSubmission>) => void
  existingSubmission?: StudentSubmission
}

interface RubricDisplayProps {
  rubric: Array<{ criteria: string; points: number; description: string }>
  scores?: Array<{ criteria: string; score: number; feedback?: string }>
  isGrading?: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateSubmissionId = (): string => {
  return `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getSubmissionIcon = (type: string) => {
  switch (type) {
    case 'TEXT': return FileText
    case 'FILE': return Upload
    case 'LINK': return Link
    case 'CODE': return Code
    default: return FileText
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUBMITTED': return 'bg-green-100 text-green-800'
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
    case 'GRADED': return 'bg-blue-100 text-blue-800'
    case 'RETURNED': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function AssignmentRenderer({
  content,
  onSubmit,
  onSaveDraft,
  existingSubmission,
  isReadOnly = false,
  showGrading = false,
  className = ''
}: AssignmentRendererProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showRubric, setShowRubric] = useState(false)

  // ===============================================================
  // 🎯 COMPUTED VALUES
  // ===============================================================
  
  const isOverdue = isAfter(new Date(), content.assignmentData.dueDate)
  const daysUntilDue = differenceInDays(content.assignmentData.dueDate, new Date())
  const hasSubmission = !!existingSubmission
  const isSubmitted = existingSubmission?.status === 'SUBMITTED' || existingSubmission?.status === 'GRADED'

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {content.title}
              </CardTitle>
              
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{content.points} points</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>Due: {format(content.assignmentData.dueDate, 'PPP', { locale: id })}</span>
                </div>
                
                <Badge variant={content.difficulty === 'hard' ? 'destructive' : content.difficulty === 'medium' ? 'default' : 'secondary'}>
                  {content.difficulty}
                </Badge>
              </div>
            </div>
            
            <AssignmentStatus assignment={content} submission={existingSubmission} />
          </div>
        </CardHeader>
      </Card>

      {/* Due Date Alert */}
      {!isSubmitted && (
        <Alert className={isOverdue ? 'border-red-200 bg-red-50' : daysUntilDue <= 1 ? 'border-yellow-200 bg-yellow-50' : ''}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isOverdue ? (
              <span className="text-red-700">This assignment is overdue by {Math.abs(daysUntilDue)} day(s)</span>
            ) : daysUntilDue <= 1 ? (
              <span className="text-yellow-700">Due in {daysUntilDue} day(s)</span>
            ) : (
              <span>Due in {daysUntilDue} day(s)</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Assignment Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Instructions
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        
        {showInstructions && (
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.assignmentData.instructions }} />
            </div>
            
            {/* Submission Requirements */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Submission Requirements</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  {React.createElement(getSubmissionIcon(content.assignmentData.submissionType), { className: "w-4 h-4" })}
                  <span>
                    Submit as: {content.assignmentData.submissionType === 'TEXT' ? 'Text Response' :
                               content.assignmentData.submissionType === 'FILE' ? 'File Upload' :
                               content.assignmentData.submissionType === 'LINK' ? 'Web Link' : 'Code Submission'}
                  </span>
                </div>
                
                {content.assignmentData.submissionType === 'FILE' && (
                  <>
                    {content.assignmentData.maxFileSize && (
                      <div>Maximum file size: {content.assignmentData.maxFileSize}MB</div>
                    )}
                    {content.assignmentData.allowedFileTypes && content.assignmentData.allowedFileTypes.length > 0 && (
                      <div>Allowed file types: {content.assignmentData.allowedFileTypes.join(', ')}</div>
                    )}
                  </>
                )}
                
                {content.assignmentData.isGroupAssignment && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Group assignment (max {content.assignmentData.maxGroupSize} members)</span>
                  </div>
                )}
                
                {content.assignmentData.plagiarismCheck && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Plagiarism detection enabled</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Grading Rubric */}
      {content.assignmentData.rubric && content.assignmentData.rubric.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Grading Rubric
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRubric(!showRubric)}
              >
                {showRubric ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          
          {showRubric && (
            <CardContent>
              <RubricDisplay 
                rubric={content.assignmentData.rubric}
                scores={existingSubmission?.rubricScores}
                isGrading={showGrading}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* Existing Submission Display */}
      {hasSubmission && isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Your Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Submitted: {format(existingSubmission.submittedAt, 'PPP p', { locale: id })}</span>
                <Badge className={getStatusColor(existingSubmission.status)}>
                  {existingSubmission.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: existingSubmission.content }} />
              </div>
              
              {existingSubmission.files && existingSubmission.files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Attached Files</h4>
                  {existingSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="w-4 h-4" />
                      <span className="flex-1">{file.name}</span>
                      <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {existingSubmission.links && existingSubmission.links.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Submitted Links</h4>
                  {existingSubmission.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Link className="w-4 h-4" />
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Grade Display */}
              {existingSubmission.status === 'GRADED' && existingSubmission.grade !== undefined && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Grade</h4>
                    <div className="text-2xl font-bold text-green-700">
                      {existingSubmission.grade}/{content.points}
                    </div>
                  </div>
                  
                  <Progress 
                    value={(existingSubmission.grade / content.points) * 100} 
                    className="mb-3"
                  />
                  
                  {existingSubmission.feedback && (
                    <div className="mt-3">
                      <h5 className="font-medium text-green-900 mb-1">Feedback</h5>
                      <p className="text-green-800">{existingSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
      {!isReadOnly && (!hasSubmission || existingSubmission?.status === 'DRAFT') && (
        <SubmissionForm 
          assignment={content}
          onSubmit={onSubmit!}
          onSaveDraft={onSaveDraft!}
          existingSubmission={existingSubmission}
        />
      )}
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
AssignmentRenderer.displayName = 'AssignmentRenderer'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function AssignmentStatus({ assignment, submission }: AssignmentStatusProps) {
  const isOverdue = isAfter(new Date(), assignment.assignmentData.dueDate)
  const daysUntilDue = differenceInDays(assignment.assignmentData.dueDate, new Date())
  
  if (!submission) {
    return (
      <div className="text-right">
        <Badge variant="secondary" className="mb-2">
          Not Started
        </Badge>
        <div className="text-sm text-gray-600">
          {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} day(s)` : `Due in ${daysUntilDue} day(s)`}
        </div>
      </div>
    )
  }
  
  return (
    <div className="text-right">
      <Badge className={getStatusColor(submission.status)} variant="secondary">
        {submission.status}
      </Badge>
      
      {submission.status === 'GRADED' && submission.grade !== undefined && (
        <div className="text-lg font-bold text-green-600 mt-1">
          {submission.grade}/{assignment.points}
        </div>
      )}
      
      <div className="text-sm text-gray-600 mt-1">
        {submission.submittedAt ? 
          `Submitted: ${format(submission.submittedAt, 'MMM d', { locale: id })}` :
          'Draft saved'
        }
      </div>
    </div>
  )
}

function SubmissionForm({ assignment, onSubmit, onSaveDraft, existingSubmission }: SubmissionFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      type: assignment.assignmentData.submissionType,
      content: existingSubmission?.content || '',
      links: existingSubmission?.links || [],
      notes: existingSubmission?.notes || ''
    }
  })
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleSaveDraft = async () => {
    try {
      setIsDraftSaving(true)
      const formData = form.getValues()
      
      const draft: Partial<StudentSubmission> = {
        assignmentId: assignment.id,
        submissionType: formData.type,
        content: formData.content,
        files: files,
        links: formData.links,
        notes: formData.notes,
        status: 'DRAFT'
      }
      
      await onSaveDraft(draft)
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }
  
  const handleSubmit = async (formData: SubmissionFormData) => {
    try {
      setIsSubmitting(true)
      
      const submission: StudentSubmission = {
        id: existingSubmission?.id || generateSubmissionId(),
        assignmentId: assignment.id,
        studentId: 'current-student-id', // Would come from auth context
        studentName: 'Current Student', // Would come from auth context
        submissionType: formData.type,
        content: formData.content,
        files: files,
        links: formData.links,
        notes: formData.notes,
        submittedAt: new Date(),
        status: 'SUBMITTED',
        isLate: isAfter(new Date(), assignment.assignmentData.dueDate)
      }
      
      await onSubmit(submission)
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Submit Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Text Submission */}
          {assignment.assignmentData.submissionType === 'TEXT' && (
            <div className="space-y-2">
              <Label htmlFor="content">Your Answer *</Label>
              <Textarea
                id="content"
                {...form.register('content')}
                placeholder="Type your answer here..."
                rows={8}
                className={form.formState.errors.content ? 'border-red-500' : ''}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
              )}
            </div>
          )}
          
          {/* File Upload */}
          {assignment.assignmentData.submissionType === 'FILE' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Files</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={assignment.assignmentData.allowedFileTypes?.map(type => `.${type}`).join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Max {assignment.assignmentData.maxFileSize}MB per file
                  </p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files</Label>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="w-4 h-4" />
                      <span className="flex-1">{file.name}</span>
                      <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Link Submission */}
          {assignment.assignmentData.submissionType === 'LINK' && (
            <div className="space-y-2">
              <Label htmlFor="content">Web Link/URL *</Label>
              <Input
                id="content"
                type="url"
                {...form.register('content')}
                placeholder="https://example.com"
                className={form.formState.errors.content ? 'border-red-500' : ''}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
              )}
            </div>
          )}
          
          {/* Code Submission */}
          {assignment.assignmentData.submissionType === 'CODE' && (
            <div className="space-y-2">
              <Label htmlFor="content">Your Code *</Label>
              <Textarea
                id="content"
                {...form.register('content')}
                placeholder="Paste your code here..."
                rows={12}
                className={`font-mono text-sm ${form.formState.errors.content ? 'border-red-500' : ''}`}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
              )}
            </div>
          )}
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Any additional comments or notes..."
              rows={3}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isDraftSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isDraftSaving ? 'Saving Draft...' : 'Save Draft'}
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function RubricDisplay({ rubric, scores, isGrading = false }: RubricDisplayProps) {
  return (
    <div className="space-y-4">
      {rubric.map((criteria, index) => {
        const score = scores?.find(s => s.criteria === criteria.criteria)
        return (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{criteria.criteria}</h4>
              <div className="flex items-center gap-2">
                {score && (
                  <Badge variant="secondary">
                    {score.score}/{criteria.points}
                  </Badge>
                )}
                <span className="text-sm text-gray-600">{criteria.points} points</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{criteria.description}</p>
            
            {score && (
              <>
                <Progress value={(score.score / criteria.points) * 100} className="mb-2" />
                {score.feedback && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <strong>Feedback:</strong> {score.feedback}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default AssignmentRenderer
export { AssignmentStatus, SubmissionForm, RubricDisplay, type AssignmentRendererProps }