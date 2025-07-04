// File: src/components/quiz/shared/question-navigation.tsx

/**
 * =================================================================
 * 🧭 QUESTION NAVIGATION COMPONENT
 * =================================================================
 * Navigation controls untuk quiz questions dengan berbagai mode
 * Created: July 2025
 * Phase: 2 - Shared Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Button,
  Card, CardContent,
  Badge
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  ChevronLeft, 
  ChevronRight, 
  Skip, 
  Flag, 
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number[];
  flaggedQuestions: number[];
  allowPrevious?: boolean;
  allowNext?: boolean;
  allowSkip?: boolean;
  allowFlag?: boolean;
  allowJump?: boolean;
  showProgress?: boolean;
  mode?: 'linear' | 'free' | 'exam';
  onPrevious?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  onFlag?: (questionNumber: number) => void;
  onJumpTo?: (questionNumber: number) => void;
  onFinish?: () => void;
  className?: string;
}

interface QuestionStatus {
  number: number;
  isAnswered: boolean;
  isFlagged: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions = [],
  flaggedQuestions = [],
  allowPrevious = true,
  allowNext = true,
  allowSkip = true,
  allowFlag = true,
  allowJump = true,
  showProgress = true,
  mode = 'free',
  onPrevious,
  onNext,
  onSkip,
  onFlag,
  onJumpTo,
  onFinish,
  className,
}: QuestionNavigationProps) {
  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  const isCurrentAnswered = answeredQuestions.includes(currentQuestion);
  const isCurrentFlagged = flaggedQuestions.includes(currentQuestion);
  const progressPercentage = Math.round((answeredQuestions.length / totalQuestions) * 100);

  // =================================================================
  // 📝 QUESTION STATUS MAPPING
  // =================================================================

  const questionStatuses: QuestionStatus[] = React.useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const isAnswered = answeredQuestions.includes(questionNumber);
      const isFlagged = flaggedQuestions.includes(questionNumber);
      const isCurrent = questionNumber === currentQuestion;
      
      // Determine accessibility based on mode
      let isAccessible = true;
      if (mode === 'linear') {
        // In linear mode, only current and previous questions are accessible
        isAccessible = questionNumber <= currentQuestion;
      } else if (mode === 'exam') {
        // In exam mode, all questions are accessible
        isAccessible = true;
      }
      
      return {
        number: questionNumber,
        isAnswered,
        isFlagged,
        isCurrent,
        isAccessible,
      };
    });
  }, [totalQuestions, answeredQuestions, flaggedQuestions, currentQuestion, mode]);

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handlePrevious = () => {
    if (!isFirstQuestion && allowPrevious) {
      onPrevious?.();
    }
  };

  const handleNext = () => {
    if (!isLastQuestion && allowNext) {
      onNext?.();
    }
  };

  const handleSkip = () => {
    if (allowSkip) {
      onSkip?.();
    }
  };

  const handleFlag = () => {
    if (allowFlag) {
      onFlag?.(currentQuestion);
    }
  };

  const handleJumpTo = (questionNumber: number) => {
    if (allowJump && questionNumber !== currentQuestion) {
      const questionStatus = questionStatuses.find(q => q.number === questionNumber);
      if (questionStatus?.isAccessible) {
        onJumpTo?.(questionNumber);
      }
    }
  };

  const handleFinish = () => {
    onFinish?.();
  };

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderQuestionIndicator = (status: QuestionStatus) => {
    const { number, isAnswered, isFlagged, isCurrent, isAccessible } = status;
    
    let icon;
    let colorClass;
    let onClick;
    
    if (isCurrent) {
      icon = <Circle className="w-4 h-4 text-blue-600 fill-blue-600" />;
      colorClass = 'bg-blue-100 border-blue-300 text-blue-800 ring-2 ring-blue-500';
    } else if (isAnswered) {
      icon = <CheckCircle className="w-4 h-4 text-green-600" />;
      colorClass = 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      onClick = isAccessible ? () => handleJumpTo(number) : undefined;
    } else if (isFlagged) {
      icon = <Flag className="w-4 h-4 text-yellow-600" />;
      colorClass = 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
      onClick = isAccessible ? () => handleJumpTo(number) : undefined;
    } else {
      icon = <Circle className="w-4 h-4 text-gray-400" />;
      colorClass = isAccessible 
        ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 cursor-pointer'
        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed';
      onClick = isAccessible ? () => handleJumpTo(number) : undefined;
    }
    
    return (
      <button
        key={number}
        onClick={onClick}
        disabled={!isAccessible}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all duration-200',
          colorClass,
          onClick && 'hover:scale-105'
        )}
        title={`Question ${number}${isAnswered ? ' - Answered' : ''}${isFlagged ? ' - Flagged' : ''}${!isAccessible ? ' - Not accessible' : ''}`}
      >
        {number}
      </button>
    );
  };

  const renderMainNavigation = () => {
    return (
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion || !allowPrevious}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        {/* Current Question Info */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              Question {currentQuestion}
            </div>
            <div className="text-sm text-gray-600">
              of {totalQuestions}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            {isCurrentAnswered && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Answered
              </Badge>
            )}
            
            {isCurrentFlagged && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                <Flag className="w-3 h-3 mr-1" />
                Flagged
              </Badge>
            )}
          </div>
        </div>

        {/* Next/Skip/Finish Button */}
        <div className="flex items-center space-x-2">
          {allowSkip && !isLastQuestion && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Skip className="w-4 h-4" />
              <span>Skip</span>
            </Button>
          )}
          
          {!isLastQuestion ? (
            <Button
              onClick={handleNext}
              disabled={!allowNext}
              size="sm"
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              size="sm"
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
            >
              <span>Finish Quiz</span>
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderQuestionGrid = () => {
    if (!allowJump) return null;
    
    return (
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Question Overview
          </h4>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flag className="w-3 h-3 text-yellow-600" />
              <span>Flagged</span>
            </div>
            <div className="flex items-center space-x-1">
              <Circle className="w-3 h-3 text-blue-600 fill-blue-600" />
              <span>Current</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-10 gap-2">
          {questionStatuses.map(renderQuestionIndicator)}
        </div>
      </div>
    );
  };

  const renderProgressSummary = () => {
    if (!showProgress) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress:</span>
          <span className="font-medium text-gray-900">
            {answeredQuestions.length}/{totalQuestions} ({progressPercentage}%)
          </span>
        </div>
        
        {flaggedQuestions.length > 0 && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Flagged:</span>
            <span className="font-medium text-yellow-600">
              {flaggedQuestions.length}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        {allowFlag && (
          <Button
            onClick={handleFlag}
            variant="outline"
            size="sm"
            className={cn(
              'flex items-center space-x-1',
              isCurrentFlagged && 'bg-yellow-100 border-yellow-300 text-yellow-800'
            )}
          >
            <Flag className="w-4 h-4" />
            <span>{isCurrentFlagged ? 'Unflag' : 'Flag'}</span>
          </Button>
        )}
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {/* Main Navigation */}
        {renderMainNavigation()}
        
        {/* Action Buttons */}
        {renderActionButtons()}
        
        {/* Progress Summary */}
        {renderProgressSummary()}
        
        {/* Question Grid */}
        {renderQuestionGrid()}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 COMPACT NAVIGATION COMPONENT
// =================================================================

export function CompactQuestionNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions = [],
  onPrevious,
  onNext,
  className,
}: Partial<QuestionNavigationProps>) {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  const progressPercentage = Math.round((answeredQuestions.length / totalQuestions) * 100);

  return (
    <div className={cn(
      'flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm',
      className
    )}>
      {/* Previous Button */}
      <Button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Current Question Info */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900">
          {currentQuestion} / {totalQuestions}
        </span>
        <Badge variant="outline" className="text-xs">
          {progressPercentage}%
        </Badge>
      </div>

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={isLastQuestion}
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useQuestionNavigation(totalQuestions: number, initialQuestion = 1) {
  const [currentQuestion, setCurrentQuestion] = React.useState(initialQuestion);
  const [answeredQuestions, setAnsweredQuestions] = React.useState<number[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = React.useState<number[]>([]);

  const navigation = React.useMemo(() => ({
    isFirstQuestion: currentQuestion === 1,
    isLastQuestion: currentQuestion === totalQuestions,
    isCurrentAnswered: answeredQuestions.includes(currentQuestion),
    isCurrentFlagged: flaggedQuestions.includes(currentQuestion),
    progressPercentage: Math.round((answeredQuestions.length / totalQuestions) * 100),
  }), [currentQuestion, totalQuestions, answeredQuestions, flaggedQuestions]);

  const actions = React.useMemo(() => ({
    goToPrevious: () => setCurrentQuestion(prev => Math.max(1, prev - 1)),
    goToNext: () => setCurrentQuestion(prev => Math.min(totalQuestions, prev + 1)),
    goToQuestion: (questionNumber: number) => {
      if (questionNumber >= 1 && questionNumber <= totalQuestions) {
        setCurrentQuestion(questionNumber);
      }
    },
    markAnswered: (questionNumber: number = currentQuestion) => {
      setAnsweredQuestions(prev => 
        prev.includes(questionNumber) ? prev : [...prev, questionNumber]
      );
    },
    markUnanswered: (questionNumber: number = currentQuestion) => {
      setAnsweredQuestions(prev => prev.filter(q => q !== questionNumber));
    },
    toggleFlag: (questionNumber: number = currentQuestion) => {
      setFlaggedQuestions(prev => 
        prev.includes(questionNumber) 
          ? prev.filter(q => q !== questionNumber)
          : [...prev, questionNumber]
      );
    },
    reset: () => {
      setCurrentQuestion(1);
      setAnsweredQuestions([]);
      setFlaggedQuestions([]);
    },
  }), [currentQuestion, totalQuestions]);

  return {
    currentQuestion,
    answeredQuestions,
    flaggedQuestions,
    ...navigation,
    ...actions,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuestionNavigation
export { 
  CompactQuestionNavigation, 
  useQuestionNavigation, 
  type QuestionNavigationProps, 
  type QuestionStatus 
}