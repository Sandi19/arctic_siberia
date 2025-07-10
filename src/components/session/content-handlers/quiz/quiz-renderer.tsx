// File: src/components/session/content-handlers/quiz/quiz-renderer.tsx

/**
 * =================================================================
 * 🎯 QUIZ CONTENT RENDERER - MOCK IMPLEMENTATION
 * =================================================================
 * Wrapper untuk existing quiz system
 * Mengintegrasikan dengan quiz system di /components/quiz/
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 3D
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useState } from 'react';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';

// ✅ Icons
import {
  HelpCircle,
  Clock,
  CheckCircle,
  AlarmClock,
  BrainCircuit,
  Award,
  BarChart,
  BookOpen,
  Star
} from 'lucide-react';

// ✅ Quiz system integration
import { QuizRenderer as CoreQuizRenderer } from '@/components/quiz';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { ContentRendererProps } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface QuizRendererProps extends ContentRendererProps {
  // Quiz-specific props bisa ditambah nanti
}

interface QuizState {
  isStarted: boolean;
  isCompleted: boolean;
  score: number | null;
  maxScore: number;
  progress: number;
  timeElapsed: number;
  attempts: number;
  isLoading: boolean;
}

// =================================================================
// 🎯 MOCK QUIZ RENDERER COMPONENT
// =================================================================

function QuizRenderer({ 
  content, 
  isActive, 
  onComplete, 
  onProgress 
}: QuizRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [quizState, setQuizState] = useState<QuizState>({
    isStarted: false,
    isCompleted: false,
    score: null,
    maxScore: 100,
    progress: 0,
    timeElapsed: 0,
    attempts: 0,
    isLoading: false
  });

  // Extract quiz data
  const quizData = content.quizData;
  const quizId = quizData?.quizId || '';
  const questionCount = quizData?.questionCount || 0;
  const timeLimit = quizData?.timeLimit || 0;
  const passingScore = quizData?.passingScore || 70;
  const maxAttempts = quizData?.attempts || 3;

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleStartQuiz = useCallback(() => {
    setQuizState(prev => ({ ...prev, isStarted: true, isLoading: false }));
  }, []);

  const handleQuizProgress = useCallback((progress: number) => {
    setQuizState(prev => ({ ...prev, progress }));
    onProgress?.(progress);
  }, [onProgress]);

  const handleQuizComplete = useCallback((score: number) => {
    setQuizState(prev => ({ 
      ...prev, 
      isCompleted: true, 
      score, 
      progress: 100,
      attempts: prev.attempts + 1
    }));
    onProgress?.(100);
    onComplete?.();
  }, [onProgress, onComplete]);

  const handleRestartQuiz = useCallback(() => {
    if (quizState.attempts >= maxAttempts) {
      return; // Reached max attempts
    }
    
    setQuizState(prev => ({
      ...prev,
      isStarted: false,
      isCompleted: false,
      score: null,
      progress: 0,
      timeElapsed: 0
    }));
    
    onProgress?.(0);
  }, [maxAttempts, onProgress]);

  // =================================================================
  // 🎯 RENDER HELPERS
  // =================================================================

  const renderQuizInfo = useCallback(() => {
    return (
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span>Questions: {questionCount}</span>
        </div>
        
        {timeLimit > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Time Limit: {timeLimit} minutes</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span>Passing Score: {passingScore}%</span>
        </div>
        
        <div className="flex items-center gap-2">
          <BarChart className="h-4 w-4 text-muted-foreground" />
          <span>Attempts: {quizState.attempts} of {maxAttempts}</span>
        </div>
      </div>
    );
  }, [questionCount, timeLimit, passingScore, maxAttempts, quizState.attempts]);

  const renderResults = useCallback(() => {
    if (!quizState.isCompleted || quizState.score === null) return null;
    
    const isPassed = (quizState.score / quizState.maxScore) * 100 >= passingScore;
    
    return (
      <Card className={`mt-4 ${isPassed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isPassed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertClock className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className={`font-medium ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
                {isPassed ? 'Quiz Passed!' : 'Quiz Failed'}
              </p>
              <p className={`text-sm ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                Score: {quizState.score} / {quizState.maxScore} ({Math.round((quizState.score / quizState.maxScore) * 100)}%)
              </p>
            </div>
          </div>
          
          {!isPassed && quizState.attempts < maxAttempts && (
            <div className="mt-4">
              <Button onClick={handleRestartQuiz} variant="outline" size="sm">
                Try Again ({maxAttempts - quizState.attempts} attempts remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [quizState.isCompleted, quizState.score, quizState.maxScore, passingScore, maxAttempts, quizState.attempts, handleRestartQuiz]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className="space-y-4">
      {/* Quiz Header */}
      <Card className={cn(
        "overflow-hidden",
        isActive ? "ring-2 ring-primary" : "",
        quizState.isCompleted && "border-green-200"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
                {content.title}
              </CardTitle>
              <CardDescription>
                {content.description || 'Quiz assessment'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {questionCount} Questions
              </Badge>
              {content.isFree && (
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Quiz Info */}
          {renderQuizInfo()}
          
          {/* Progress Bar (only when started) */}
          {quizState.isStarted && !quizState.isCompleted && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(quizState.progress)}%</span>
              </div>
              <Progress value={quizState.progress} />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quiz Content */}
      {!quizState.isStarted && !quizState.isCompleted ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Start Quiz</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This quiz contains {questionCount} questions and has a {timeLimit > 0 ? `${timeLimit} minute time limit` : 'no time limit'}.
                </p>
                <Button onClick={handleStartQuiz} disabled={quizState.attempts >= maxAttempts}>
                  {quizState.attempts === 0 ? 'Start Quiz' : 'Restart Quiz'}
                </Button>
                
                {quizState.attempts >= maxAttempts && (
                  <p className="text-sm text-red-500 mt-2">
                    You have reached the maximum number of attempts.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : quizState.isStarted && !quizState.isCompleted ? (
        <Card>
          <CardContent className="pt-6">
            {quizState.isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading quiz...</p>
              </div>
            ) : (
              <div>
                {/* Integrate with Core Quiz System */}
                <CoreQuizRenderer
                  quizId={quizId}
                  isPreview={false}
                  onProgress={handleQuizProgress}
                  onComplete={handleQuizComplete}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
      
      {/* Quiz Results */}
      {renderResults()}
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default QuizRenderer;

// ✅ PATTERN: Named exports untuk sub-components dan utilities
export {
  renderQuizInfo,
  renderResults
};

// ✅ PATTERN: Type exports
export type {
  QuizRendererProps,
  QuizState
};