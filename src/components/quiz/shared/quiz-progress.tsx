// File: src/components/quiz/shared/quiz-progress.tsx

/**
 * =================================================================
 * 🎯 QUIZ PROGRESS COMPONENT
 * =================================================================
 * Progress bar untuk menampilkan kemajuan quiz
 * Created: July 2025
 * Phase: 2 - Shared Components
 * =================================================================
 */

// =================================================================
// 🎯 IMPORTS - ARCTIC SIBERIA STANDARD 7 CATEGORIES
// =================================================================

// 1. Client Directive & Framework
'use client';
import React from 'react';

// 2. UI Components (Barrel Imports)
// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Badge,
  Card, 
  CardContent,
  Progress
} from '@/components/ui';

// 3. Feature Components
// (none for this component)

// 4. Icons (lucide-react grouped together)
// ✅ FIXED: Icons grouped together
import { 
  AlertCircle,
  CheckCircle, 
  Circle, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

// 5. External Libraries
// (none for this component)

// 6. Local Utilities
import { cn } from '@/lib/utils';

// 7. Constants & Configs
// (none for this component)

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizProgressProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: number;
  correctAnswers?: number;
  timeSpent?: number;
  showStats?: boolean;
  showQuestionNumbers?: boolean;
  compact?: boolean;
  className?: string;
}

interface QuestionStatus {
  questionNumber: number;
  status: 'answered' | 'current' | 'unanswered';
  isCorrect?: boolean;
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizProgress({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  correctAnswers,
  timeSpent,
  showStats = true,
  showQuestionNumbers = true,
  compact = false,
  className,
}: QuizProgressProps) {
  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  const accuracyPercentage = correctAnswers !== undefined 
    ? Math.round((correctAnswers / Math.max(answeredQuestions, 1)) * 100)
    : undefined;

  // =================================================================
  // 📝 QUESTION STATUS MAPPING
  // =================================================================

  const questionStatuses: QuestionStatus[] = React.useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, index) => {
      const questionNumber = index + 1;
      let status: QuestionStatus['status'] = 'unanswered';
      
      if (questionNumber < currentQuestion) {
        status = 'answered';
      } else if (questionNumber === currentQuestion) {
        status = 'current';
      }
      
      return {
        questionNumber,
        status,
        isCorrect: status === 'answered' && correctAnswers !== undefined 
          ? Math.random() > 0.3 // Placeholder - should come from actual data
          : undefined,
      };
    });
  }, [totalQuestions, currentQuestion, answeredQuestions, correctAnswers]);

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderQuestionIndicator = (questionStatus: QuestionStatus) => {
    const { questionNumber, status, isCorrect } = questionStatus;
    
    let icon;
    let colorClass;
    
    switch (status) {
      case 'answered':
        icon = isCorrect ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        );
        colorClass = isCorrect 
          ? 'bg-green-100 border-green-300 text-green-800' 
          : 'bg-red-100 border-red-300 text-red-800';
        break;
      case 'current':
        icon = <Circle className="w-4 h-4 text-blue-600 fill-blue-600" />;
        colorClass = 'bg-blue-100 border-blue-300 text-blue-800 ring-2 ring-blue-500';
        break;
      default:
        icon = <Circle className="w-4 h-4 text-gray-400" />;
        colorClass = 'bg-gray-100 border-gray-300 text-gray-600';
    }
    
    return (
      <div
        key={questionNumber}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all duration-200',
          colorClass
        )}
        title={`Question ${questionNumber} - ${status}`}
      >
        {compact ? icon : questionNumber}
      </div>
    );
  };

  const renderProgressStats = () => {
    if (!showStats) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Progress Stats */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
          <div className="text-sm text-gray-600">Answered</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{totalQuestions - answeredQuestions}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
        
        {/* Accuracy Stats */}
        {accuracyPercentage !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{accuracyPercentage}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        )}
        
        {/* Time Stats */}
        {timeSpent !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
        )}
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  if (compact) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion} of {totalQuestions}
            </span>
            <Badge variant="outline" className="text-xs">
              {progressPercentage}% Complete
            </Badge>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2 mb-2"
          />
          
          {accuracyPercentage !== undefined && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Accuracy: {accuracyPercentage}%</span>
              {timeSpent !== undefined && (
                <span>Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quiz Progress
            </h3>
            <p className="text-sm text-gray-600">
              Question {currentQuestion} of {totalQuestions}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <Badge variant="outline" className="text-sm">
              {progressPercentage}% Complete
            </Badge>
          </div>
        </div>

        {/* Stats */}
        {renderProgressStats()}

        {/* Main Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600">
              {answeredQuestions}/{totalQuestions}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
        </div>

        {/* Question Numbers */}
        {showQuestionNumbers && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Question Status
              </span>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Circle className="w-3 h-3 text-blue-600 fill-blue-600" />
                  <span>Current</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Circle className="w-3 h-3 text-gray-400" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {questionStatuses.map(renderQuestionIndicator)}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(timeSpent !== undefined || accuracyPercentage !== undefined) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              {timeSpent !== undefined && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              
              {accuracyPercentage !== undefined && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Accuracy: {accuracyPercentage}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useQuizProgress(totalQuestions: number, currentQuestion: number) {
  const [answeredQuestions, setAnsweredQuestions] = React.useState(0);
  const [correctAnswers, setCorrectAnswers] = React.useState(0);
  const [timeSpent, setTimeSpent] = React.useState(0);

  // Progress calculations
  const progress = React.useMemo(() => {
    const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
    const accuracyPercentage = answeredQuestions > 0 
      ? Math.round((correctAnswers / answeredQuestions) * 100)
      : 0;
    
    return {
      progressPercentage,
      accuracyPercentage,
      completed: answeredQuestions,
      remaining: totalQuestions - answeredQuestions,
      isComplete: answeredQuestions === totalQuestions,
    };
  }, [totalQuestions, answeredQuestions, correctAnswers]);

  // Actions
  const actions = React.useMemo(() => ({
    incrementAnswered: () => setAnsweredQuestions(prev => prev + 1),
    incrementCorrect: () => setCorrectAnswers(prev => prev + 1),
    updateTimeSpent: (time: number) => setTimeSpent(time),
    reset: () => {
      setAnsweredQuestions(0);
      setCorrectAnswers(0);
      setTimeSpent(0);
    },
  }), []);

  return {
    ...progress,
    timeSpent,
    actions,
  };
}

// Set display name for debugging
QuizProgress.displayName = 'QuizProgress';

// =================================================================
// 🎯 EXPORTS - ARCTIC SIBERIA STANDARD ✅ FIXED
// =================================================================

// ✅ FIXED: Main component as default export (tanpa semicolon!)
export default QuizProgress

// ✅ FIXED: Named exports dengan proper grouping
export { 
  useQuizProgress, 
  type QuizProgressProps, 
  type QuestionStatus 
}