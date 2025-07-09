// File: src/components/session/content-handlers/quiz/quiz-builder.tsx
'use client'

/**
 * =================================================================
 * 🎯 QUIZ BUILDER - SESSION CONTENT HANDLER
 * =================================================================
 * Session content handler untuk Quiz type dalam Arctic Siberia LMS
 * Mengintegrasikan existing Quiz System dengan Session Builder
 * 
 * Features:
 * - Quiz creation dalam session context
 * - Integration dengan Quiz System yang sudah ada
 * - Session-specific quiz configuration
 * - Arctic Siberia compliant architecture
 * 
 * Created: July 2025
 * =================================================================
 */

// ✅ Framework & Core Imports
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ UI Components - barrel imports
import { 
  Button,
  Card, CardContent, CardHeader, CardTitle,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Textarea,
  Switch,
  Badge,
  Separator
} from '@/components/ui'

// ✅ Feature Components - Quiz System Integration
import { 
  QuizBuilder as MainQuizBuilder,
  QuizRenderer,
  type QuizType,
  type QuizData
} from '@/components/quiz'

// ✅ Icons
import { 
  Plus, 
  Settings, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  X
} from 'lucide-react'

// ✅ Local Utilities
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// =================================================================
// 🎯 TYPES & VALIDATION SCHEMAS
// =================================================================

const QuizConfigSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  passingScore: z.number().min(0).max(100).default(70),
  maxAttempts: z.number().min(1).default(3),
  isRequired: z.boolean().default(true)
})

type QuizConfig = z.infer<typeof QuizConfigSchema>

interface SessionQuizBuilderProps {
  sessionId: string
  initialData?: {
    quizConfig?: QuizConfig
    quizData?: QuizData
  }
  onSave: (data: { config: QuizConfig; quiz: QuizData }) => void
  onCancel: () => void
  className?: string
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

export default function SessionQuizBuilder({
  sessionId,
  initialData,
  onSave,
  onCancel,
  className
}: SessionQuizBuilderProps) {
  // =================================================================
  // 🔧 STATE MANAGEMENT
  // =================================================================
  
  const [currentStep, setCurrentStep] = useState<'config' | 'build' | 'preview'>('config')
  const [quizData, setQuizData] = useState<QuizData | null>(initialData?.quizData || null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Form untuk quiz configuration
  const form = useForm<QuizConfig>({
    resolver: zodResolver(QuizConfigSchema),
    defaultValues: initialData?.quizConfig || {
      title: '',
      description: '',
      shuffleQuestions: false,
      showResults: true,
      passingScore: 70,
      maxAttempts: 3,
      isRequired: true
    }
  })

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleConfigNext = (data: QuizConfig) => {
    setCurrentStep('build')
  }

  const handleQuizSave = (quiz: QuizData) => {
    setQuizData(quiz)
    toast.success('Quiz questions saved')
  }

  const handleFinalSave = () => {
    const config = form.getValues()
    
    if (!quizData) {
      toast.error('Please create quiz questions first')
      return
    }

    onSave({
      config,
      quiz: quizData
    })
    
    toast.success('Quiz session content saved successfully')
  }

  const handlePreview = () => {
    if (!quizData) {
      toast.error('No quiz data to preview')
      return
    }
    setIsPreviewOpen(true)
  }

  // =================================================================
  // 🎯 RENDER STEPS
  // =================================================================

  const renderConfigStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quiz Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleConfigNext)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter quiz title"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the quiz"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Quiz Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quiz Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="No time limit"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attempts</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Boolean Settings */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="shuffleQuestions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Shuffle Questions</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Randomize question order for each attempt
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showResults"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show Results</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Display results immediately after completion
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Required</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Students must complete this quiz to progress
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Next: Create Questions
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )

  const renderBuildStep = () => (
    <div className="space-y-4">
      {/* Header dengan progress indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Quiz Questions
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreview}
                disabled={!quizData}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentStep('config')}
              >
                Back to Config
              </Button>
            </div>
          </div>
          
          {/* Quiz Config Summary */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">
              {form.getValues('title') || 'Untitled Quiz'}
            </Badge>
            {form.getValues('timeLimit') && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {form.getValues('timeLimit')} min
              </Badge>
            )}
            <Badge variant="outline">
              <CheckCircle className="h-3 w-3 mr-1" />
              {form.getValues('passingScore')}% to pass
            </Badge>
            {form.getValues('isRequired') && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Required
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quiz Builder Integration */}
      <MainQuizBuilder
        initialData={quizData}
        onSave={handleQuizSave}
        onCancel={() => setCurrentStep('config')}
        sessionId={sessionId}
      />

      {/* Final Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleFinalSave} disabled={!quizData}>
              <Save className="h-4 w-4 mr-2" />
              Save Quiz Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // =================================================================
  // 🎯 MAIN RENDER
  // =================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
          currentStep === 'config' 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          <Settings className="h-4 w-4" />
          Configuration
        </div>
        <div className="h-px w-8 bg-border" />
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
          currentStep === 'build' 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          <Plus className="h-4 w-4" />
          Build Questions
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'config' && renderConfigStep()}
      {currentStep === 'build' && renderBuildStep()}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Preview</DialogTitle>
          </DialogHeader>
          {quizData && (
            <QuizRenderer 
              quiz={quizData}
              onComplete={(results) => {
                console.log('Preview quiz results:', results)
                toast.success('Quiz preview completed')
                setIsPreviewOpen(false)
              }}
              previewMode={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// =================================================================
// 🎯 EXPORT - ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default + Named Exports + Types
export default SessionQuizBuilder
export { type SessionQuizBuilderProps, type QuizConfig }