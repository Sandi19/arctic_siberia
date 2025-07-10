// File: src/components/session/content-handlers/quiz/quiz-builder.tsx

/**
 * =================================================================
 * 🎯 QUIZ CONTENT BUILDER - WRAPPER IMPLEMENTATION
 * =================================================================
 * Wrapper untuk existing quiz system (/components/quiz/)
 * Integrates quiz system ke dalam session content creation
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Phase 3
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
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
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui';

// ✅ Icons
import {
  HelpCircle,
  Settings,
  Clock,
  Users,
  Trophy,
  Target,
  Brain,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Edit3,
  Plus,
  Play,
  Eye,
  BarChart3
} from 'lucide-react';

// ✅ Quiz system imports (existing system)
import { 
  QuizBuilder as CoreQuizBuilder,
  type Quiz,
  type QuizQuestion,
  type QuizMode,
  type QuizStatus,
  type QuizDifficulty,
  type QuestionType
} from '@/components/quiz';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { QuizData, ContentAccessLevel } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

export interface QuizBuilderProps {
  initialData?: Partial<QuizBuilderFormData>;
  onSave?: (data: QuizBuilderFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface QuizBuilderFormData {
  title: string;
  description?: string;
  accessLevel: ContentAccessLevel;
  duration?: number;
  quizData: QuizData;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const quizBuilderSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration must not exceed 180 minutes')
    .optional(),
  quizData: z.object({
    quizId: z.string().min(1, 'Quiz ID is required'),
    title: z.string().min(1, 'Quiz title is required'),
    questionCount: z.number().min(1, 'At least one question is required'),
    timeLimit: z.number().min(1, 'Time limit must be at least 1 minute').optional(),
    passingScore: z.number().min(0).max(100).optional(),
    attempts: z.number().min(1).max(10).optional()
  })
});

type QuizBuilderFormSchema = z.infer<typeof quizBuilderSchema>;

// =================================================================
// 🎯 QUIZ BUILDER COMPONENT
// =================================================================

function QuizBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  className 
}: QuizBuilderProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // =================================================================
  // 🎯 FORM CONFIGURATION
  // =================================================================

  const form = useForm<QuizBuilderFormSchema>({
    resolver: zodResolver(quizBuilderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || undefined,
      quizData: {
        quizId: initialData?.quizData?.quizId || '',
        title: initialData?.quizData?.title || '',
        questionCount: initialData?.quizData?.questionCount || 0,
        timeLimit: initialData?.quizData?.timeLimit || undefined,
        passingScore: initialData?.quizData?.passingScore || 70,
        attempts: initialData?.quizData?.attempts || 1
      }
    }
  });

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleCreateNewQuiz = useCallback(() => {
    setShowQuizBuilder(true);
    setCurrentQuiz(null);
  }, []);

  const handleEditQuiz = useCallback(() => {
    if (currentQuiz) {
      setShowQuizBuilder(true);
    }
  }, [currentQuiz]);

  const handleQuizSave = useCallback((quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setShowQuizBuilder(false);
    
    // Auto-update form values
    form.setValue('quizData.quizId', quiz.id);
    form.setValue('quizData.title', quiz.title);
    form.setValue('quizData.questionCount', quiz.questions.length);
    form.setValue('quizData.timeLimit', quiz.timeLimit);
    form.setValue('quizData.passingScore', quiz.passingScore);
    form.setValue('quizData.attempts', quiz.attempts);
    
    // Auto-generate content title if empty
    if (!form.getValues('title')) {
      form.setValue('title', `Quiz: ${quiz.title}`);
    }
    
    toast.success('Quiz saved successfully!');
  }, [form]);

  const handleQuizCancel = useCallback(() => {
    setShowQuizBuilder(false);
  }, []);

  const handleSubmit = useCallback((data: QuizBuilderFormSchema) => {
    if (!currentQuiz) {
      toast.error('Please create or select a quiz first');
      return;
    }

    const formData: QuizBuilderFormData = {
      title: data.title,
      description: data.description,
      accessLevel: data.accessLevel,
      duration: data.duration,
      quizData: {
        quizId: data.quizData.quizId,
        title: data.quizData.title,
        questionCount: data.quizData.questionCount,
        timeLimit: data.quizData.timeLimit,
        passingScore: data.quizData.passingScore,
        attempts: data.quizData.attempts
      }
    };

    onSave?.(formData);
  }, [currentQuiz, onSave]);

  const handlePreview = useCallback(() => {
    setIsPreviewMode(true);
  }, []);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================

  useEffect(() => {
    if (initialData?.quizData?.quizId) {
      // Mock quiz data for initial load
      const mockQuiz: Quiz = {
        id: initialData.quizData.quizId,
        title: initialData.quizData.title,
        description: '',
        status: 'DRAFT' as QuizStatus,
        mode: 'PRACTICE' as QuizMode,
        timeLimit: initialData.quizData.timeLimit,
        attempts: initialData.quizData.attempts || 1,
        passingScore: initialData.quizData.passingScore,
        questions: [],
        totalPoints: 0,
        estimatedDuration: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCurrentQuiz(mockQuiz);
    }
  }, [initialData]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Quiz Content Builder
          </CardTitle>
          <CardDescription>
            Create interactive quizzes for language learning assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Basic Information</Label>
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., English Grammar Quiz - Present Tense"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your quiz content a descriptive title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this quiz covers and its learning objectives..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional context about the quiz content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Level</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={field.value === 'FREE' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('FREE')}
                            >
                              Free
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'PREMIUM' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('PREMIUM')}
                            >
                              Premium
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="e.g., 15"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated completion time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Quiz Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium">Quiz Configuration</Label>
                </div>

                {/* Quiz Status */}
                {currentQuiz ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Quiz Connected</p>
                          <p className="text-sm text-green-600">
                            {currentQuiz.title} ({currentQuiz.questions.length} questions)
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {currentQuiz.questions.length} Questions
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {currentQuiz.timeLimit || 'No'} Time Limit
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {currentQuiz.passingScore || 70}% Pass Score
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {currentQuiz.attempts} Attempts
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleEditQuiz}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Quiz
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePreview}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">No Quiz Connected</p>
                          <p className="text-sm text-yellow-600">
                            Create a new quiz or select an existing one to proceed
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCreateNewQuiz}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Quiz
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Quiz Settings (when quiz is connected) */}
                {currentQuiz && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quizData.timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="180"
                              placeholder="No limit"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Set quiz time limit (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quizData.passingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="70"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum score to pass
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quizData.attempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Attempts</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum attempts allowed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!currentQuiz}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Quiz Content
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Quiz Builder Dialog */}
      <Dialog open={showQuizBuilder} onOpenChange={setShowQuizBuilder}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {currentQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CoreQuizBuilder
              initialData={currentQuiz || undefined}
              onSave={handleQuizSave}
              onCancel={handleQuizCancel}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Quiz Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {currentQuiz && (
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{currentQuiz.title}</CardTitle>
                    <CardDescription>
                      {currentQuiz.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {currentQuiz.questions.length}
                          </p>
                          <p className="text-sm text-muted-foreground">Questions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {currentQuiz.timeLimit || '∞'}
                          </p>
                          <p className="text-sm text-muted-foreground">Minutes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">
                            {currentQuiz.passingScore || 70}%
                          </p>
                          <p className="text-sm text-muted-foreground">Pass Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {currentQuiz.attempts}
                          </p>
                          <p className="text-sm text-muted-foreground">Attempts</p>
                        </div>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This is a preview of your quiz configuration. 
                          Students will see the actual quiz interface when taking the assessment.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default QuizBuilder;

// ✅ PATTERN: Type exports
export type {
  QuizBuilderProps,
  QuizBuilderFormData
};