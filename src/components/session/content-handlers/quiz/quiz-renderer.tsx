// File: src/components/session/content-handlers/quiz/quiz-renderer.tsx

/**
 * =================================================================
 * 🧩 QUIZ RENDERER COMPONENT (WRAPPER)
 * =================================================================
 * Quiz content wrapper renderer untuk session integration
 * Following Arctic Siberia Import/Export Standard
 * Phase 2 - Priority 2.6 (HIGH)
 * Created: July 2025
 * =================================================================
 */

'use client';

// =================================================================
// 🎯 FRAMEWORK IMPORTS
// =================================================================
import { 
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator
} from '@/components/ui';

// =================================================================
// 🎯 QUIZ COMPONENTS - ✅ FIXED: Barrel imports dari quiz system
// =================================================================
import {
  QuizRenderer as CoreQuizRenderer,
  QuizProgress,
  QuizResult,
  QuizTimer,
  useQuizProgress
} from '@/components/quiz';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Target,
  Trophy,
  X
} from 'lucide-react';

// =================================================================
// 🎯 EXTERNAL LIBRARIES
// =================================================================
import { toast } from 'sonner';

// =================================================================
// 🎯 LOCAL UTILITIES - Session types
// =================================================================
import type {
  QuizContent,
  ContentType
} from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizRendererProps {
  content: QuizContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onAttemptComplete?: (result: QuizAttemptResult) => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
  className?: string;
}

interface QuizAttemptResult {
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: Record<string, any>;
  completedAt: Date;
}

interface QuizSessionState {
  hasStarted: boolean;
  isActive: boolean;
  isCompleted: boolean;
  currentAttempt: number;
  maxAttempts: number;
  timeRemaining: number | null;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  attempts: QuizAttemptResult[];
  startTime: Date | null;
  endTime: Date | null;
  canRetake: boolean;
}

interface QuizOverviewProps {
  content: QuizContent;
  state: QuizSessionState;
  onStart: () => void;
  onRetake: () => void;
}

interface QuizResultsProps {
  content: QuizContent;
  result: QuizAttemptResult;
  onRetake?: () => void;
  onReview?: () => void;
  canRetake: boolean;
}

interface QuizStatsProps {
  content: QuizContent;
  attempts: QuizAttemptResult[];
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Calculate quiz progress based on current question
 */
function calculateQuizProgress(currentQuestion: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((currentQuestion / totalQuestions) * 100);
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate time spent in quiz
 */
function calculateTimeSpent(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Determine if student passed based on score and passing criteria
 */
function determinePassStatus(score: number, totalScore: number, passingScore: number): boolean {
  const percentage = (score / totalScore) * 100;
  return percentage >= passingScore;
}

/**
 * Get score color based on performance
 */
function getScoreColor(percentage: number, passingScore: number): string {
  if (percentage >= passingScore + 20) return 'text-green-600';
  if (percentage >= passingScore) return 'text-blue-600';
  if (percentage >= passingScore - 10) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Generate attempt ID
 */
function generateAttemptId(): string {
  return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =================================================================
// 🎯 QUIZ OVERVIEW SUB-COMPONENT
// =================================================================

function QuizOverview({ content, state, onStart, onRetake }: QuizOverviewProps) {
  const bestAttempt = useMemo(() => {
    if (state.attempts.length === 0) return null;
    return state.attempts.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  }, [state.attempts]);

  return (
    <div className="space-y-6">
      {/* Quiz Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Questions</span>
          </div>
          <div className="text-lg font-semibold pl-6">
            {content.quizData.questionCount} questions
          </div>
        </div>

        {content.quizData.timeLimit && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Time Limit</span>
            </div>
            <div className="text-lg font-semibold pl-6">
              {content.quizData.timeLimit} minutes
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Passing Score</span>
          </div>
          <div className="text-lg font-semibold pl-6">
            {content.quizData.passingScore}%
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Attempts</span>
          </div>
          <div className="text-lg font-semibold pl-6">
            {state.currentAttempt} / {state.maxAttempts}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {content.quizData.instructions && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
          <p className="text-sm text-blue-800">{content.quizData.instructions}</p>
        </div>
      )}

      {/* Best Score Display */}
      {bestAttempt && (
        <div className="p-4 bg-gray-50 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Best Score</h4>
              <p className="text-sm text-gray-600">
                Attempt {state.attempts.findIndex(a => a === bestAttempt) + 1}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(bestAttempt.percentage, content.quizData.passingScore)}`}>
                {bestAttempt.percentage}%
              </div>
              <div className="text-sm text-gray-600">
                {bestAttempt.score} points
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!state.hasStarted && (
          <Button size="lg" onClick={onStart} className="w-full h-14">
            <Play className="w-5 h-5 mr-2" />
            Start Quiz
          </Button>
        )}

        {state.isCompleted && state.canRetake && (
          <Button 
            size="lg" 
            variant="outline" 
            onClick={onRetake} 
            className="w-full h-14"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retake Quiz ({state.maxAttempts - state.currentAttempt} attempts left)
          </Button>
        )}

        {state.isCompleted && !state.canRetake && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have used all available attempts for this quiz.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

// =================================================================
// 🎯 QUIZ RESULTS SUB-COMPONENT
// =================================================================

function QuizResults({ 
  content, 
  result, 
  onRetake, 
  onReview, 
  canRetake 
}: QuizResultsProps) {
  const isPassed = result.passed;
  const scoreColor = getScoreColor(result.percentage, content.quizData.passingScore);

  return (
    <div className="space-y-6">
      {/* Result Header */}
      <div className="text-center space-y-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
          isPassed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isPassed ? (
            <Trophy className="w-10 h-10 text-green-600" />
          ) : (
            <X className="w-10 h-10 text-red-600" />
          )}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {isPassed ? 'Congratulations!' : 'Keep Trying!'}
          </h3>
          <p className="text-gray-600">
            {isPassed 
              ? 'You have successfully passed this quiz' 
              : 'You did not meet the passing score this time'
            }
          </p>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500 mb-1">Your Score</div>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {result.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              {result.score} points
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Passing Score</div>
            <div className="text-3xl font-bold text-gray-700">
              {content.quizData.passingScore}%
            </div>
            <div className="text-sm text-gray-600">
              Required to pass
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Time Spent</div>
            <div className="text-3xl font-bold text-gray-700">
              {formatTime(result.timeSpent)}
            </div>
            <div className="text-sm text-gray-600">
              Total time
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{result.percentage}%</span>
        </div>
        <Progress value={result.percentage} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span className="font-medium">{content.quizData.passingScore}% (Pass)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {content.quizData.showCorrectAnswers && onReview && (
          <Button variant="outline" onClick={onReview} className="flex-1">
            <HelpCircle className="w-4 h-4 mr-2" />
            Review Answers
          </Button>
        )}
        
        {canRetake && onRetake && (
          <Button onClick={onRetake} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Motivational Message */}
      <div className={`p-4 rounded-lg ${
        isPassed 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <p className={`text-sm ${
          isPassed ? 'text-green-800' : 'text-yellow-800'
        }`}>
          {isPassed 
            ? '🎉 Excellent work! You have demonstrated mastery of the material.'
            : '💪 Don\'t give up! Review the material and try again when you\'re ready.'
          }
        </p>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 QUIZ STATS SUB-COMPONENT
// =================================================================

function QuizStats({ content, attempts }: QuizStatsProps) {
  const avgScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length);
  }, [attempts]);

  const bestScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map(a => a.percentage));
  }, [attempts]);

  const totalTimeSpent = useMemo(() => {
    return attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
  }, [attempts]);

  if (attempts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Your Statistics</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Attempts</div>
          <div className="text-lg font-semibold">{attempts.length}</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Best Score</div>
          <div className="text-lg font-semibold">{bestScore}%</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Average</div>
          <div className="text-lg font-semibold">{avgScore}%</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Time Spent</div>
          <div className="text-lg font-semibold">{formatTime(totalTimeSpent)}</div>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN QUIZ RENDERER COMPONENT
// =================================================================

export default function QuizRenderer({
  content,
  onProgress,
  onComplete,
  onAttemptComplete,
  onError,
  readOnly = false,
  className = ''
}: QuizRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<QuizSessionState>({
    hasStarted: false,
    isActive: false,
    isCompleted: false,
    currentAttempt: 0,
    maxAttempts: content.quizData.attemptsAllowed,
    timeRemaining: content.quizData.timeLimit ? content.quizData.timeLimit * 60 : null,
    score: null,
    percentage: null,
    passed: null,
    attempts: [],
    startTime: null,
    endTime: null,
    canRetake: true
  });

  const [showResults, setShowResults] = useState(false);
  const [currentResult, setCurrentResult] = useState<QuizAttemptResult | null>(null);

  // =================================================================
  // 🎯 QUIZ PROGRESS HOOK
  // =================================================================
  
  const { 
    progress: quizProgress, 
    currentQuestion, 
    totalQuestions 
  } = useQuizProgress();

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const canStartQuiz = useMemo(() => {
    return !readOnly && !state.isActive && state.currentAttempt < state.maxAttempts;
  }, [readOnly, state.isActive, state.currentAttempt, state.maxAttempts]);

  const canRetake = useMemo(() => {
    return !readOnly && state.isCompleted && state.currentAttempt < state.maxAttempts;
  }, [readOnly, state.isCompleted, state.currentAttempt, state.maxAttempts]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleStartQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasStarted: true,
      isActive: true,
      startTime: new Date(),
      currentAttempt: prev.currentAttempt + 1
    }));
    
    setShowResults(false);
    toast.success('Quiz started! Good luck!');
  }, []);

  const handleQuizComplete = useCallback((quizResult: any) => {
    const endTime = new Date();
    const timeSpent = state.startTime ? calculateTimeSpent(state.startTime, endTime) : 0;
    
    // Calculate score and percentage (this would come from the actual quiz component)
    const score = quizResult.score || 0;
    const totalScore = quizResult.totalScore || 100;
    const percentage = Math.round((score / totalScore) * 100);
    const passed = determinePassStatus(score, totalScore, content.quizData.passingScore);

    const attemptResult: QuizAttemptResult = {
      attemptId: generateAttemptId(),
      score,
      percentage,
      passed,
      timeSpent,
      answers: quizResult.answers || {},
      completedAt: endTime
    };

    setState(prev => ({
      ...prev,
      isActive: false,
      isCompleted: true,
      endTime,
      score,
      percentage,
      passed,
      attempts: [...prev.attempts, attemptResult],
      canRetake: prev.currentAttempt < prev.maxAttempts
    }));

    setCurrentResult(attemptResult);
    setShowResults(true);

    // Report to parent components
    onAttemptComplete?.(attemptResult);
    onProgress?.(100);
    
    if (passed) {
      onComplete?.();
      toast.success('Congratulations! You passed the quiz!');
    } else {
      toast.info('Quiz completed. Review your results below.');
    }
  }, [state.startTime, content.quizData.passingScore, onAttemptComplete, onProgress, onComplete]);

  const handleRetakeQuiz = useCallback(() => {
    handleStartQuiz();
  }, [handleStartQuiz]);

  const handleReviewAnswers = useCallback(() => {
    // This would show a review mode of the quiz
    toast.info('Review mode would be implemented here');
  }, []);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Update progress based on quiz state
  useEffect(() => {
    if (state.isActive && quizProgress) {
      onProgress?.(quizProgress);
    }
  }, [state.isActive, quizProgress, onProgress]);

  // Handle time limit
  useEffect(() => {
    if (!state.isActive || !state.timeRemaining) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (!prev.timeRemaining || prev.timeRemaining <= 1) {
          // Time's up!
          toast.warning('Time is up! Quiz will be submitted automatically.');
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isActive, state.timeRemaining]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (state.isActive && state.timeRemaining === 0) {
      handleQuizComplete({ score: 0, totalScore: 100, answers: {} });
    }
  }, [state.isActive, state.timeRemaining, handleQuizComplete]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              {content.title}
            </CardTitle>
            {content.description && (
              <CardDescription>{content.description}</CardDescription>
            )}
          </div>
          
          {state.isCompleted && state.passed && (
            <Badge className="bg-green-600 hover:bg-green-700">
              <Award className="w-3 h-3 mr-1" />
              Passed
            </Badge>
          )}
        </div>

        {/* Active Quiz Progress */}
        {state.isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Question {currentQuestion} of {totalQuestions}</span>
              {state.timeRemaining && (
                <span className="font-mono">
                  ⏰ {formatTime(state.timeRemaining)}
                </span>
              )}
            </div>
            <Progress value={quizProgress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Quiz Overview - Before Starting */}
        {!state.isActive && !showResults && (
          <QuizOverview
            content={content}
            state={state}
            onStart={handleStartQuiz}
            onRetake={handleRetakeQuiz}
          />
        )}

        {/* Active Quiz - Use Core Quiz Renderer */}
        {state.isActive && (
          <div className="space-y-4">
            {state.timeRemaining && (
              <div className="flex items-center justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Time remaining: <span className="font-mono font-bold">{formatTime(state.timeRemaining)}</span>
                </span>
              </div>
            )}
            
            <CoreQuizRenderer
              quizId={content.quizData.quizId}
              onComplete={handleQuizComplete}
              onError={onError}
              timeLimit={state.timeRemaining}
              showCorrectAnswers={false} // Only show after completion
            />
          </div>
        )}

        {/* Quiz Results */}
        {showResults && currentResult && (
          <QuizResults
            content={content}
            result={currentResult}
            onRetake={canRetake ? handleRetakeQuiz : undefined}
            onReview={content.quizData.showCorrectAnswers ? handleReviewAnswers : undefined}
            canRetake={canRetake}
          />
        )}

        {/* Quiz Statistics */}
        {state.attempts.length > 0 && (
          <>
            <Separator />
            <QuizStats content={content} attempts={state.attempts} />
          </>
        )}

        {/* Completion Status */}
        {state.isCompleted && state.passed && (
          <>
            <Separator />
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Quiz Completed Successfully!</div>
                  <div className="text-sm text-green-700">
                    You scored {state.percentage}% and passed this quiz.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default QuizRenderer;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  QuizOverview, 
  QuizResults, 
  QuizStats
};

// ✅ PATTERN: Named exports untuk utilities
export {
  calculateQuizProgress,
  formatTime,
  calculateTimeSpent,
  determinePassStatus,
  getScoreColor,
  generateAttemptId
};

// ✅ PATTERN: Named exports untuk types
export type { 
  QuizRendererProps,
  QuizAttemptResult,
  QuizSessionState,
  QuizOverviewProps,
  QuizResultsProps,
  QuizStatsProps
};

// ✅ PATTERN: Display name untuk debugging
QuizRenderer.displayName = 'QuizRenderer';