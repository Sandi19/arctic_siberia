// File: src/components/quiz/components/quiz-mcq.tsx

/**
 * =================================================================
 * ⭕ QUIZ MCQ COMPONENT
 * =================================================================
 * Multiple Choice Question renderer dengan interactive features
 * Created: July 2025
 * Phase: 3 - Quiz Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Button,
  Card, CardContent, CardHeader, CardTitle,
  Badge,
  RadioGroup, RadioGroupItem,
  Label,
  Alert, AlertDescription
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  CheckCircle,
  Circle,
  XCircle,
  AlertCircle,
  Clock,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// ✅ FIXED: Quiz types
import type { 
  MCQQuestion, 
  MCQAnswer, 
  QuestionComponentProps 
} from '../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizMCQProps extends QuestionComponentProps<MCQQuestion> {
  onAnswerSelect?: (optionId: string) => void;
  showExplanation?: boolean;
  showCorrectAnswer?: boolean;
  timeLeft?: number;
  isSubmitted?: boolean;
}

interface MCQOptionProps {
  option: MCQQuestion['options'][0];
  isSelected: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  className?: string;
}

// =================================================================
// 🎯 MCQ OPTION COMPONENT
// =================================================================

function MCQOption({
  option,
  isSelected,
  isCorrect = false,
  isRevealed = false,
  onSelect,
  disabled = false,
  showResult = false,
  className,
}: MCQOptionProps) {
  const handleSelect = () => {
    if (!disabled) {
      onSelect(option.id);
    }
  };

  const getOptionStatus = () => {
    if (!showResult && !isRevealed) {
      return isSelected ? 'selected' : 'default';
    }

    if (isCorrect) {
      return 'correct';
    }

    if (isSelected && !isCorrect) {
      return 'incorrect';
    }

    return 'default';
  };

  const status = getOptionStatus();

  const getStatusStyles = () => {
    switch (status) {
      case 'correct':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'incorrect':
        return 'border-red-300 bg-red-50 text-red-800';
      case 'selected':
        return 'border-blue-300 bg-blue-50 text-blue-800 ring-2 ring-blue-200';
      default:
        return 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'incorrect':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'selected':
        return <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={cn(
        'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
        getStatusStyles(),
        disabled && 'cursor-not-allowed opacity-70',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Radio Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>

        {/* Option Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">
            {option.text}
          </div>

          {/* Option Explanation */}
          {showResult && option.explanation && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <div className="flex items-start space-x-1">
                <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500" />
                <span>{option.explanation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Badge */}
        <div className="flex-shrink-0">
          <Badge variant="outline" className="text-xs">
            {String.fromCharCode(65 + option.order)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN MCQ COMPONENT
// =================================================================

function QuizMCQ({
  question,
  answer,
  onChange,
  readonly = false,
  showExplanation = false,
  showCorrectAnswer = false,
  timeLeft,
  isSubmitted = false,
  onAnswerSelect,
  className,
}: QuizMCQProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================

  const [selectedOptionId, setSelectedOptionId] = React.useState<string>(
    answer?.questionType === 'MCQ' ? answer.selectedOptionId : ''
  );

  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
  const correctOption = question.options.find(opt => opt.isCorrect);
  const isCorrect = selectedOptionId === question.correctAnswerId;
  const hasAnswer = Boolean(selectedOptionId);

  // Sort options by order for consistent display
  const sortedOptions = React.useMemo(() => {
    return [...question.options].sort((a, b) => a.order - b.order);
  }, [question.options]);

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleOptionSelect = React.useCallback((optionId: string) => {
    if (readonly || isSubmitted) return;

    setSelectedOptionId(optionId);
    onAnswerSelect?.(optionId);

    // Create answer object
    const newAnswer: MCQAnswer = {
      id: `answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'MCQ',
      selectedOptionId: optionId,
      isCorrect: optionId === question.correctAnswerId,
      points: optionId === question.correctAnswerId ? question.points : 0,
      maxPoints: question.points,
      timeSpent: 0, // Should be calculated by parent
      submittedAt: new Date(),
    };

    onChange(newAnswer);
  }, [readonly, isSubmitted, onAnswerSelect, onChange, question]);

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderQuestionHeader = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="text-xs">
              MCQ
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.points} pts
            </Badge>
          </div>

          {timeLeft !== undefined && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        <div className="text-lg font-medium text-gray-900">
          {question.title}
        </div>

        {question.description && (
          <div className="text-sm text-gray-600">
            {question.description}
          </div>
        )}

        {question.image && (
          <div className="mt-4">
            <img
              src={question.image}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>
    );
  };

  const renderOptions = () => {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">
          Select the best answer:
        </div>

        <RadioGroup
          value={selectedOptionId}
          onValueChange={handleOptionSelect}
          disabled={readonly || isSubmitted}
          className="space-y-2"
        >
          {sortedOptions.map((option) => (
            <MCQOption
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              isCorrect={option.isCorrect}
              isRevealed={showCorrectAnswer || (isSubmitted && showExplanation)}
              onSelect={handleOptionSelect}
              disabled={readonly || isSubmitted}
              showResult={showCorrectAnswer || (isSubmitted && showExplanation)}
            />
          ))}
        </RadioGroup>
      </div>
    );
  };

  const renderAnswerFeedback = () => {
    if (!hasAnswer || (!showCorrectAnswer && !isSubmitted)) return null;

    return (
      <Alert className={cn(
        'mt-4',
        isCorrect 
          ? 'border-green-200 bg-green-50' 
          : 'border-red-200 bg-red-50'
      )}>
        <div className="flex items-start space-x-2">
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <div className={cn(
              'font-medium text-sm',
              isCorrect ? 'text-green-800' : 'text-red-800'
            )}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            <AlertDescription className={cn(
              'text-sm mt-1',
              isCorrect ? 'text-green-700' : 'text-red-700'
            )}>
              {isCorrect 
                ? 'Well done! You selected the right answer.'
                : `The correct answer is: ${correctOption?.text}`
              }
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  };

  const renderExplanation = () => {
    if (!showExplanation || !question.explanation) return null;

    return (
      <Alert className="mt-4 border-blue-200 bg-blue-50">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">
            Explanation
          </div>
          <AlertDescription className="text-sm text-blue-700 mt-1">
            {question.explanation}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderRequiredIndicator = () => {
    if (!question.required) return null;

    return (
      <div className="flex items-center space-x-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>Required</span>
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-base">
          <div className="flex items-center justify-between">
            <span>Multiple Choice Question</span>
            {renderRequiredIndicator()}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Header */}
        {renderQuestionHeader()}

        {/* Options */}
        {renderOptions()}

        {/* Answer Feedback */}
        {renderAnswerFeedback()}

        {/* Explanation */}
        {renderExplanation()}

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <div>Selected: {selectedOptionId || 'None'}</div>
            <div>Correct: {question.correctAnswerId}</div>
            <div>Is Correct: {isCorrect ? 'Yes' : 'No'}</div>
            <div>Has Answer: {hasAnswer ? 'Yes' : 'No'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useMCQLogic(question: MCQQuestion) {
  const [selectedOptionId, setSelectedOptionId] = React.useState<string>('');
  const [timeSpent, setTimeSpent] = React.useState(0);
  const [startTime] = React.useState(Date.now());

  const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
  const correctOption = question.options.find(opt => opt.isCorrect);
  const isCorrect = selectedOptionId === question.correctAnswerId;
  const hasAnswer = Boolean(selectedOptionId);

  const selectOption = React.useCallback((optionId: string) => {
    setSelectedOptionId(optionId);
    setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
  }, [startTime]);

  const getAnswer = React.useCallback((): MCQAnswer => {
    return {
      id: `mcq-answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'MCQ',
      selectedOptionId,
      isCorrect,
      points: isCorrect ? question.points : 0,
      maxPoints: question.points,
      timeSpent,
      submittedAt: new Date(),
    };
  }, [question, selectedOptionId, isCorrect, timeSpent]);

  const reset = React.useCallback(() => {
    setSelectedOptionId('');
    setTimeSpent(0);
  }, []);

  return {
    selectedOptionId,
    selectedOption,
    correctOption,
    isCorrect,
    hasAnswer,
    timeSpent,
    selectOption,
    getAnswer,
    reset,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuizMCQ
export { 
  MCQOption, 
  useMCQLogic, 
  type QuizMCQProps, 
  type MCQOptionProps 
}