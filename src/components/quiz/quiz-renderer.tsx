// File: src/components/quiz/quiz-renderer.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Import quiz components
import QuizMCQ from './components/quiz-mcq';
import QuizTrueFalse from './components/quiz-true-false';
import QuizEssay from './components/quiz-essay';
import QuizCheckbox from './components/quiz-checkbox';
import QuizFillBlank from './components/quiz-fill-blank';
import QuizMatching from './components/quiz-matching';
import QuizDragDrop from './components/quiz-drag-drop';
import QuizCodeInput from './components/quiz-code-input';

// Import shared components
import QuizProgress from './shared/quiz-progress';
import QuizTimer from './shared/quiz-timer';
import QuestionNavigation from './shared/question-navigation';
import QuizResult from './shared/quiz-result';

// Import types
import type { 
  Quiz, 
  QuizQuestion, 
  QuizAnswer, 
  QuizResult as QuizResultType,
  QuizSettings,
  QuizAttempt 
} from './types';

interface QuizRendererProps {
  quiz: Quiz;
  onComplete?: (result: QuizResultType) => void;
  onSave?: (answers: QuizAnswer[]) => void;
  initialAnswers?: QuizAnswer[];
  isPreview?: boolean;
  showTimer?: boolean;
  allowNavigation?: boolean;
  autoSubmit?: boolean;
  className?: string;
}

export default function QuizRenderer({
  quiz,
  onComplete,
  onSave,
  initialAnswers = [],
  isPreview = false,
  showTimer = true,
  allowNavigation = true,
  autoSubmit = true,
  className = ''
}: QuizRendererProps) {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(initialAnswers);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.settings?.timeLimit ? quiz.settings.timeLimit * 60 : null
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultType | null>(null);
  const [startTime] = useState(new Date());

  // Current question
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Progress calculation
  const answeredCount = answers.filter(answer => 
    answer.answer !== null && answer.answer !== undefined && answer.answer !== ''
  ).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      const newAnswer: QuizAnswer = {
        questionId,
        answer,
        timestamp: new Date()
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });

    // Auto-save if enabled
    if (onSave && !isPreview) {
      const updatedAnswers = answers.map(a => 
        a.questionId === questionId ? { ...a, answer } : a
      );
      if (!updatedAnswers.find(a => a.questionId === questionId)) {
        updatedAnswers.push({ questionId, answer, timestamp: new Date() });
      }
      onSave(updatedAnswers);
    }
  }, [answers, onSave, isPreview]);

  // Navigation handlers
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }, [totalQuestions]);

  const goToNextQuestion = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [isLastQuestion]);

  const goToPreviousQuestion = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [isFirstQuestion]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isCompleted) return;

    setIsSubmitting(true);
    
    try {
      // Calculate result
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      let correctAnswers = 0;
      const questionResults = quiz.questions.map(question => {
        const userAnswer = answers.find(a => a.questionId === question.id);
        const isCorrect = checkAnswer(question, userAnswer?.answer);
        if (isCorrect) correctAnswers++;
        
        return {
          questionId: question.id,
          question: question.question,
          userAnswer: userAnswer?.answer || null,
          correctAnswer: getCorrectAnswer(question),
          isCorrect,
          points: isCorrect ? (question.points || 1) : 0
        };
      });

      const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const earnedPoints = questionResults.reduce((sum, r) => sum + r.points, 0);
      const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      
      const quizResult: QuizResultType = {
        id: `result-${Date.now()}`,
        quizId: quiz.id,
        totalQuestions,
        correctAnswers,
        totalPoints,
        earnedPoints,
        percentage,
        duration,
        completedAt: endTime,
        passed: quiz.settings?.passingScore ? percentage >= quiz.settings.passingScore : true,
        answers: questionResults
      };

      setResult(quizResult);
      setIsCompleted(true);
      
      if (onComplete) {
        onComplete(quizResult);
      }

      toast.success('Quiz berhasil diselesaikan!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Gagal menyelesaikan quiz. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, answers, startTime, onComplete, isSubmitting, isCompleted, totalQuestions]);

  // Timer expiry handler
  const handleTimerExpiry = useCallback(() => {
    if (!isCompleted && autoSubmit) {
      toast.warning('Waktu habis! Quiz akan otomatis diselesaikan.');
      handleSubmit();
    }
  }, [isCompleted, autoSubmit, handleSubmit]);

  // Check if answer is correct
  const checkAnswer = (question: QuizQuestion, userAnswer: any): boolean => {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer === question.correctAnswer;
      case 'checkbox':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        return userAnswer.length === question.correctAnswer.length &&
               userAnswer.every(answer => question.correctAnswer.includes(answer));
      case 'fill-blank':
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        return correctAnswers.some(correct => 
          userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
        );
      case 'matching':
        if (!userAnswer || typeof userAnswer !== 'object') return false;
        return Object.keys(question.correctAnswer).every(key =>
          userAnswer[key] === question.correctAnswer[key]
        );
      case 'drag-drop':
        if (!Array.isArray(userAnswer)) return false;
        return JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswer.sort());
      case 'essay':
      case 'code-input':
        // These require manual grading
        return false;
      default:
        return false;
    }
  };

  // Get correct answer for display
  const getCorrectAnswer = (question: QuizQuestion): any => {
    return question.correctAnswer;
  };

  // Get current answer
  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.answer;
  };

  // Restart quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsCompleted(false);
    setResult(null);
    setTimeRemaining(quiz.settings?.timeLimit ? quiz.settings.timeLimit * 60 : null);
  };

  // Render question component based on type
  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = getCurrentAnswer(question.id);
    const commonProps = {
      question,
      value: currentAnswer,
      onChange: (answer: any) => handleAnswerChange(question.id, answer),
      disabled: isCompleted || isSubmitting,
      isPreview
    };

    switch (question.type) {
      case 'multiple-choice':
        return <QuizMCQ {...commonProps} />;
      case 'true-false':
        return <QuizTrueFalse {...commonProps} />;
      case 'essay':
        return <QuizEssay {...commonProps} />;
      case 'checkbox':
        return <QuizCheckbox {...commonProps} />;
      case 'fill-blank':
        return <QuizFillBlank {...commonProps} />;
      case 'matching':
        return <QuizMatching {...commonProps} />;
      case 'drag-drop':
        return <QuizDragDrop {...commonProps} />;
      case 'code-input':
        return <QuizCodeInput {...commonProps} />;
      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tipe pertanyaan tidak dikenali: {question.type}
            </AlertDescription>
          </Alert>
        );
    }
  };

  // Show result if completed
  if (isCompleted && result) {
    return (
      <div className={`space-y-6 ${className}`}>
        <QuizResult 
          result={result}
          quiz={quiz}
          onRestart={isPreview ? handleRestart : undefined}
        />
        
        {isPreview && (
          <div className="flex justify-center">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Ulangi Quiz
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {quiz.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quiz Info Badges */}
              <Badge variant="secondary">
                {totalQuestions} Pertanyaan
              </Badge>
              
              {quiz.settings?.passingScore && (
                <Badge variant="outline">
                  Nilai Lulus: {quiz.settings.passingScore}%
                </Badge>
              )}
              
              {/* Timer */}
              {showTimer && timeRemaining !== null && (
                <QuizTimer
                  initialTime={timeRemaining}
                  onExpiry={handleTimerExpiry}
                  className="text-sm"
                />
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <QuizProgress
            current={answeredCount}
            total={totalQuestions}
            percentage={progressPercentage}
            className="mt-4"
          />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
              </Badge>
              {currentQuestion.points && currentQuestion.points > 1 && (
                <Badge variant="secondary">
                  {currentQuestion.points} Poin
                </Badge>
              )}
            </div>
            
            {currentQuestion.required && (
              <Badge variant="destructive" className="text-xs">
                Wajib
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question Content */}
          {renderQuestion(currentQuestion)}
          
          <Separator />
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {allowNavigation && (
                <QuestionNavigation
                  currentIndex={currentQuestionIndex}
                  totalQuestions={totalQuestions}
                  answeredQuestions={answers.map(a => a.questionId)}
                  onNavigate={goToQuestion}
                  onPrevious={goToPreviousQuestion}
                  onNext={goToNextQuestion}
                  disabled={isSubmitting}
                />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Next/Submit Button */}
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Selesaikan Quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNextQuestion}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Notice */}
      {isPreview && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ini adalah mode preview. Jawaban tidak akan disimpan.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}