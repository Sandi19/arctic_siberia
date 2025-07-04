// File: src/components/quiz/components/quiz-fill-blank.tsx

/**
 * =================================================================
 * ⬜ QUIZ FILL IN THE BLANK COMPONENT
 * =================================================================
 * Fill in the Blank Question renderer dengan multiple blanks support
 * Created: July 2025
 * Phase: 3 - Quiz Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Card, CardContent, CardHeader, CardTitle,
  Badge,
  Input,
  Alert, AlertDescription
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Lightbulb,
  Target,
  Hash
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// ✅ FIXED: Quiz types
import type { 
  FillBlankQuestion, 
  FillBlankAnswer, 
  QuestionComponentProps 
} from '../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizFillBlankProps extends QuestionComponentProps<FillBlankQuestion> {
  onAnswerChange?: (blankId: string, value: string) => void;
  showExplanation?: boolean;
  showCorrectAnswer?: boolean;
  timeLeft?: number;
  isSubmitted?: boolean;
}

interface BlankInputProps {
  blank: FillBlankQuestion['blanks'][0];
  value: string;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  className?: string;
}

// =================================================================
// 🎯 BLANK INPUT COMPONENT
// =================================================================

function BlankInput({
  blank,
  value,
  isCorrect = false,
  isRevealed = false,
  onChange,
  disabled = false,
  showResult = false,
  className,
}: BlankInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.value);
    }
  };

  const getInputStatus = () => {
    if (!showResult && !isRevealed) {
      return value ? 'filled' : 'empty';
    }

    return isCorrect ? 'correct' : 'incorrect';
  };

  const status = getInputStatus();

  const getStatusStyles = () => {
    switch (status) {
      case 'correct':
        return 'border-green-400 bg-green-50 text-green-800 focus:ring-green-200';
      case 'incorrect':
        return 'border-red-400 bg-red-50 text-red-800 focus:ring-red-200';
      case 'filled':
        return 'border-blue-300 bg-blue-50 text-blue-800 focus:ring-blue-200';
      default:
        return 'border-gray-300 bg-white text-gray-800 focus:ring-blue-200';
    }
  };

  const getStatusIcon = () => {
    if (!showResult && !isRevealed) return null;

    switch (status) {
      case 'correct':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'incorrect':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={blank.placeholder || `Blank ${blank.position}`}
        disabled={disabled}
        className={cn(
          'w-32 text-center font-medium transition-all duration-200',
          getStatusStyles()
        )}
      />
      
      {getStatusIcon() && (
        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      )}

      {/* Position indicator */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <Badge variant="outline" className="text-xs bg-white">
          {blank.position}
        </Badge>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN FILL BLANK COMPONENT
// =================================================================

function QuizFillBlank({
  question,
  answer,
  onChange,
  readonly = false,
  showExplanation = false,
  showCorrectAnswer = false,
  timeLeft,
  isSubmitted = false,
  onAnswerChange,
  className,
}: QuizFillBlankProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================

  const [answers, setAnswers] = React.useState<{ [blankId: string]: string }>(
    answer?.questionType === 'FILL_BLANK' ? answer.answers : {}
  );

  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const checkAnswer = React.useCallback((blankId: string, userAnswer: string) => {
    const blank = question.blanks.find(b => b.id === blankId);
    if (!blank) return false;

    const normalizedAnswer = question.caseSensitive 
      ? userAnswer.trim() 
      : userAnswer.trim().toLowerCase();

    return blank.correctAnswers.some(correct => {
      const normalizedCorrect = question.caseSensitive 
        ? correct.trim() 
        : correct.trim().toLowerCase();

      return question.exactMatch 
        ? normalizedAnswer === normalizedCorrect
        : normalizedAnswer.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedAnswer);
    });
  }, [question]);

  const correctAnswers = React.useMemo(() => {
    return Object.entries(answers).filter(([blankId, value]) => 
      checkAnswer(blankId, value)
    ).length;
  }, [answers, checkAnswer]);

  const totalBlanks = question.blanks.length;
  const filledBlanks = Object.values(answers).filter(v => v.trim()).length;
  const isFullyCorrect = correctAnswers === totalBlanks;
  const hasPartialCredit = correctAnswers > 0;
  const isComplete = filledBlanks === totalBlanks;

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleAnswerChange = React.useCallback((blankId: string, value: string) => {
    if (readonly || isSubmitted) return;

    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);
    onAnswerChange?.(blankId, value);

    // Calculate score
    const newCorrectAnswers = Object.entries(newAnswers).filter(([bId, val]) => 
      checkAnswer(bId, val)
    ).length;
    const points = (newCorrectAnswers / totalBlanks) * question.points;

    // Create answer object
    const newAnswer: FillBlankAnswer = {
      id: `answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'FILL_BLANK',
      answers: newAnswers,
      isCorrect: newCorrectAnswers === totalBlanks,
      points: Math.round(points * 100) / 100,
      maxPoints: question.points,
      timeSpent: 0, // Should be calculated by parent
      submittedAt: new Date(),
    };

    onChange(newAnswer);
  }, [readonly, isSubmitted, answers, onAnswerChange, checkAnswer, totalBlanks, question, onChange]);

  // =================================================================
  // 🎨 TEMPLATE PARSING
  // =================================================================

  const parseTemplate = React.useCallback(() => {
    const template = question.template;
    const blankPattern = /\{blank\}/g;
    const parts = template.split(blankPattern);
    const blanks = question.blanks.sort((a, b) => a.position - b.position);

    const result: (string | React.ReactNode)[] = [];
    
    parts.forEach((part, index) => {
      // Add text part
      if (part) {
        result.push(
          <span key={`text-${index}`} className="text-gray-900">
            {part}
          </span>
        );
      }

      // Add blank input if not the last part
      if (index < parts.length - 1 && blanks[index]) {
        const blank = blanks[index];
        const userAnswer = answers[blank.id] || '';
        const isCorrect = checkAnswer(blank.id, userAnswer);

        result.push(
          <BlankInput
            key={`blank-${blank.id}`}
            blank={blank}
            value={userAnswer}
            isCorrect={isCorrect}
            isRevealed={showCorrectAnswer || (isSubmitted && showExplanation)}
            onChange={(value) => handleAnswerChange(blank.id, value)}
            disabled={readonly || isSubmitted}
            showResult={showCorrectAnswer || (isSubmitted && showExplanation)}
            className="mx-2"
          />
        );
      }
    });

    return result;
  }, [question, answers, checkAnswer, showCorrectAnswer, isSubmitted, showExplanation, readonly, handleAnswerChange]);

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderQuestionHeader = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="text-xs">
              FILL BLANK
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.points} pts
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalBlanks} blank{totalBlanks > 1 ? 's' : ''}
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

  const renderInstructions = () => {
    const instructions = [];
    
    if (question.caseSensitive) {
      instructions.push('Case sensitive');
    } else {
      instructions.push('Case insensitive');
    }
    
    if (question.exactMatch) {
      instructions.push('Exact match required');
    } else {
      instructions.push('Partial matches accepted');
    }

    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Target className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">Instructions</div>
          <AlertDescription className="text-sm text-blue-700 mt-1">
            Fill in the blanks in the text below. {instructions.join(' • ')}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderTemplate = () => {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700">
          Complete the text by filling in the blanks:
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-lg leading-relaxed">
            {parseTemplate()}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {filledBlanks}/{totalBlanks} blanks filled</span>
          <span>{Math.round((filledBlanks / totalBlanks) * 100)}% complete</span>
        </div>
      </div>
    );
  };

  const renderAnswerFeedback = () => {
    if (!isComplete || (!showCorrectAnswer && !isSubmitted)) return null;

    return (
      <Alert className={cn(
        'mt-4',
        isFullyCorrect 
          ? 'border-green-200 bg-green-50' 
          : hasPartialCredit
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-red-200 bg-red-50'
      )}>
        <div className="flex items-start space-x-2">
          {isFullyCorrect ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : hasPartialCredit ? (
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <div className={cn(
              'font-medium text-sm',
              isFullyCorrect ? 'text-green-800' : hasPartialCredit ? 'text-yellow-800' : 'text-red-800'
            )}>
              {isFullyCorrect ? 'Perfect!' : hasPartialCredit ? 'Partial Credit' : 'Incorrect'}
            </div>
            <AlertDescription className={cn(
              'text-sm mt-1',
              isFullyCorrect ? 'text-green-700' : hasPartialCredit ? 'text-yellow-700' : 'text-red-700'
            )}>
              {isFullyCorrect 
                ? 'All blanks filled correctly!'
                : `You got ${correctAnswers} out of ${totalBlanks} blanks correct.`
              }
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  };

  const renderCorrectAnswers = () => {
    if (!showCorrectAnswer && !isSubmitted) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-3">Correct Answers:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.blanks.map((blank, index) => (
            <div key={blank.id} className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {index + 1}
              </Badge>
              <span className="text-sm text-gray-600">
                {blank.correctAnswers.join(' or ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBlankExplanations = () => {
    if (!showExplanation) return null;

    const blanksWithExplanations = question.blanks.filter(blank => blank.explanation);
    if (blanksWithExplanations.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <div className="text-sm font-medium text-gray-700">Explanations:</div>
        {blanksWithExplanations.map((blank, index) => (
          <Alert key={blank.id} className="border-purple-200 bg-purple-50">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            <div className="ml-2">
              <div className="font-medium text-sm text-purple-800">
                Blank {blank.position}
              </div>
              <AlertDescription className="text-sm text-purple-700 mt-1">
                {blank.explanation}
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </div>
    );
  };

  const renderGeneralExplanation = () => {
    if (!showExplanation || !question.explanation) return null;

    return (
      <Alert className="mt-4 border-blue-200 bg-blue-50">
        <Lightbulb className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">
            General Explanation
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
            <span className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>Fill in the Blank</span>
            </span>
            {renderRequiredIndicator()}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Header */}
        {renderQuestionHeader()}

        {/* Instructions */}
        {renderInstructions()}

        {/* Template with Blanks */}
        {renderTemplate()}

        {/* Answer Feedback */}
        {renderAnswerFeedback()}

        {/* Correct Answers */}
        {renderCorrectAnswers()}

        {/* Blank Explanations */}
        {renderBlankExplanations()}

        {/* General Explanation */}
        {renderGeneralExplanation()}

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <div>Answers: {JSON.stringify(answers)}</div>
            <div>Correct: {correctAnswers}/{totalBlanks}</div>
            <div>Filled: {filledBlanks}/{totalBlanks}</div>
            <div>Fully Correct: {isFullyCorrect ? 'Yes' : 'No'}</div>
            <div>Complete: {isComplete ? 'Yes' : 'No'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useFillBlankLogic(question: FillBlankQuestion) {
  const [answers, setAnswers] = React.useState<{ [blankId: string]: string }>({});
  const [timeSpent, setTimeSpent] = React.useState(0);
  const [startTime] = React.useState(Date.now());

  const checkAnswer = React.useCallback((blankId: string, userAnswer: string) => {
    const blank = question.blanks.find(b => b.id === blankId);
    if (!blank) return false;

    const normalizedAnswer = question.caseSensitive 
      ? userAnswer.trim() 
      : userAnswer.trim().toLowerCase();

    return blank.correctAnswers.some(correct => {
      const normalizedCorrect = question.caseSensitive 
        ? correct.trim() 
        : correct.trim().toLowerCase();

      return question.exactMatch 
        ? normalizedAnswer === normalizedCorrect
        : normalizedAnswer.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedAnswer);
    });
  }, [question]);

  const correctAnswers = Object.entries(answers).filter(([blankId, value]) => 
    checkAnswer(blankId, value)
  ).length;

  const totalBlanks = question.blanks.length;
  const filledBlanks = Object.values(answers).filter(v => v.trim()).length;
  const isFullyCorrect = correctAnswers === totalBlanks;
  const isComplete = filledBlanks === totalBlanks;

  const updateAnswer = React.useCallback((blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
    setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
  }, [startTime]);

  const getAnswer = React.useCallback((): FillBlankAnswer => {
    const points = (correctAnswers / totalBlanks) * question.points;

    return {
      id: `fill-blank-answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'FILL_BLANK',
      answers,
      isCorrect: isFullyCorrect,
      points: Math.round(points * 100) / 100,
      maxPoints: question.points,
      timeSpent,
      submittedAt: new Date(),
    };
  }, [question, answers, isFullyCorrect, correctAnswers, totalBlanks, timeSpent]);

  const reset = React.useCallback(() => {
    setAnswers({});
    setTimeSpent(0);
  }, []);

  return {
    answers,
    correctAnswers,
    totalBlanks,
    filledBlanks,
    isFullyCorrect,
    isComplete,
    timeSpent,
    updateAnswer,
    checkAnswer,
    getAnswer,
    reset,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuizFillBlank
export { 
  BlankInput, 
  useFillBlankLogic, 
  type QuizFillBlankProps, 
  type BlankInputProps 
}