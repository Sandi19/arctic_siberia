// File: src/components/quiz/components/quiz-matching.tsx

/**
 * =================================================================
 * 🔗 QUIZ MATCHING COMPONENT
 * =================================================================
 * Matching Question renderer dengan drag & drop functionality
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
  Button,
  Alert, AlertDescription
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  Link2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Lightbulb,
  RotateCcw,
  Shuffle
} from 'lucide-react';

// ✅ FIXED: External libraries
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// ✅ FIXED: Quiz types
import type { 
  MatchingQuestion, 
  MatchingAnswer, 
  QuestionComponentProps 
} from '../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizMatchingProps extends QuestionComponentProps<MatchingQuestion> {
  onPairChange?: (leftId: string, rightId: string | null) => void;
  showExplanation?: boolean;
  showCorrectAnswer?: boolean;
  timeLeft?: number;
  isSubmitted?: boolean;
}

interface MatchingItemProps {
  item: MatchingQuestion['leftColumn'][0] | MatchingQuestion['rightColumn'][0];
  column: 'left' | 'right';
  isMatched?: boolean;
  matchedWith?: string;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onMatch?: (itemId: string) => void;
  disabled?: boolean;
  className?: string;
}

// =================================================================
// 🎯 MATCHING ITEM COMPONENT
// =================================================================

function MatchingItem({
  item,
  column,
  isMatched = false,
  matchedWith,
  isCorrect = false,
  isRevealed = false,
  onMatch,
  disabled = false,
  className,
}: MatchingItemProps) {
  const handleClick = () => {
    if (!disabled && onMatch) {
      onMatch(item.id);
    }
  };

  const getStatusStyles = () => {
    if (isRevealed && isMatched) {
      return isCorrect 
        ? 'border-green-300 bg-green-50 text-green-800'
        : 'border-red-300 bg-red-50 text-red-800';
    }
    
    if (isMatched) {
      return 'border-blue-300 bg-blue-50 text-blue-800 ring-2 ring-blue-200';
    }
    
    return 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50';
  };

  const getStatusIcon = () => {
    if (!isRevealed || !isMatched) return null;
    
    return isCorrect 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
        'flex items-center space-x-3',
        getStatusStyles(),
        disabled && 'cursor-not-allowed opacity-70',
        className
      )}
    >
      {/* Item Content */}
      <div className="flex-1">
        {item.image && (
          <img
            src={item.image}
            alt={item.text}
            className="w-12 h-12 object-cover rounded mb-2"
          />
        )}
        <div className="text-sm font-medium">
          {item.text}
        </div>
      </div>

      {/* Status Icon */}
      {getStatusIcon() && (
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
      )}

      {/* Match Indicator */}
      {isMatched && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="outline" className="text-xs bg-white">
            <Link2 className="w-3 h-3" />
          </Badge>
        </div>
      )}
    </div>
  );
}

// =================================================================
// 🎯 MAIN MATCHING COMPONENT
// =================================================================

function QuizMatching({
  question,
  answer,
  onChange,
  readonly = false,
  showExplanation = false,
  showCorrectAnswer = false,
  timeLeft,
  isSubmitted = false,
  onPairChange,
  className,
}: QuizMatchingProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================

  const [pairs, setPairs] = React.useState<{ leftId: string; rightId: string }[]>(
    answer?.questionType === 'MATCHING' ? answer.pairs : []
  );
  const [selectedLeft, setSelectedLeft] = React.useState<string | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<string | null>(null);

  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const correctPairs = question.pairs;
  const correctMatches = pairs.filter(pair => 
    correctPairs.some(correct => correct.leftId === pair.leftId && correct.rightId === pair.rightId)
  ).length;

  const totalPairs = correctPairs.length;
  const isFullyCorrect = correctMatches === totalPairs && pairs.length === totalPairs;
  const hasPartialCredit = correctMatches > 0;
  const isComplete = pairs.length === totalPairs;

  // Shuffle items if enabled
  const [leftItems, rightItems] = React.useMemo(() => {
    const left = question.shuffleItems 
      ? [...question.leftColumn].sort(() => Math.random() - 0.5)
      : [...question.leftColumn].sort((a, b) => a.order - b.order);
    
    const right = question.shuffleItems 
      ? [...question.rightColumn].sort(() => Math.random() - 0.5)
      : [...question.rightColumn].sort((a, b) => a.order - b.order);
    
    return [left, right];
  }, [question.leftColumn, question.rightColumn, question.shuffleItems]);

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleItemClick = React.useCallback((itemId: string, column: 'left' | 'right') => {
    if (readonly || isSubmitted) return;

    if (column === 'left') {
      if (selectedLeft === itemId) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(itemId);
        if (selectedRight) {
          createPair(itemId, selectedRight);
        }
      }
    } else {
      if (selectedRight === itemId) {
        setSelectedRight(null);
      } else {
        setSelectedRight(itemId);
        if (selectedLeft) {
          createPair(selectedLeft, itemId);
        }
      }
    }
  }, [readonly, isSubmitted, selectedLeft, selectedRight]);

  const createPair = React.useCallback((leftId: string, rightId: string) => {
    // Remove existing pairs for these items
    const newPairs = pairs.filter(p => p.leftId !== leftId && p.rightId !== rightId);
    newPairs.push({ leftId, rightId });
    
    setPairs(newPairs);
    setSelectedLeft(null);
    setSelectedRight(null);
    onPairChange?.(leftId, rightId);

    // Calculate score
    const newCorrectMatches = newPairs.filter(pair => 
      correctPairs.some(correct => correct.leftId === pair.leftId && correct.rightId === pair.rightId)
    ).length;
    const points = (newCorrectMatches / totalPairs) * question.points;

    // Create answer object
    const newAnswer: MatchingAnswer = {
      id: `answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'MATCHING',
      pairs: newPairs,
      isCorrect: newCorrectMatches === totalPairs && newPairs.length === totalPairs,
      points: Math.round(points * 100) / 100,
      maxPoints: question.points,
      timeSpent: 0,
      submittedAt: new Date(),
    };

    onChange(newAnswer);
  }, [pairs, correctPairs, totalPairs, question.points, onPairChange, onChange]);

  const handleReset = React.useCallback(() => {
    if (readonly || isSubmitted) return;
    
    setPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [readonly, isSubmitted]);

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderQuestionHeader = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="text-xs">MATCHING</Badge>
            <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
            <Badge variant="outline" className="text-xs">{question.points} pts</Badge>
            <Badge variant="outline" className="text-xs">{totalPairs} pairs</Badge>
          </div>

          {timeLeft !== undefined && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        <div className="text-lg font-medium text-gray-900">{question.title}</div>
        {question.description && <div className="text-sm text-gray-600">{question.description}</div>}
      </div>
    );
  };

  const renderInstructions = () => {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Link2 className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">Instructions</div>
          <AlertDescription className="text-sm text-blue-700 mt-1">
            Click items from the left column, then click the corresponding items from the right column to create matches.
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderMatchingArea = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 text-center">Column A</div>
          <div className="space-y-2">
            {leftItems.map((item) => {
              const pair = pairs.find(p => p.leftId === item.id);
              const isMatched = Boolean(pair);
              const isCorrect = pair ? correctPairs.some(c => c.leftId === pair.leftId && c.rightId === pair.rightId) : false;
              
              return (
                <MatchingItem
                  key={item.id}
                  item={item}
                  column="left"
                  isMatched={isMatched}
                  matchedWith={pair?.rightId}
                  isCorrect={isCorrect}
                  isRevealed={showCorrectAnswer || (isSubmitted && showExplanation)}
                  onMatch={(id) => handleItemClick(id, 'left')}
                  disabled={readonly || isSubmitted}
                  className={cn(
                    selectedLeft === item.id && 'ring-2 ring-blue-500 bg-blue-100'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 text-center">Column B</div>
          <div className="space-y-2">
            {rightItems.map((item) => {
              const pair = pairs.find(p => p.rightId === item.id);
              const isMatched = Boolean(pair);
              const isCorrect = pair ? correctPairs.some(c => c.leftId === pair.leftId && c.rightId === pair.rightId) : false;
              
              return (
                <MatchingItem
                  key={item.id}
                  item={item}
                  column="right"
                  isMatched={isMatched}
                  matchedWith={pair?.leftId}
                  isCorrect={isCorrect}
                  isRevealed={showCorrectAnswer || (isSubmitted && showExplanation)}
                  onMatch={(id) => handleItemClick(id, 'right')}
                  disabled={readonly || isSubmitted}
                  className={cn(
                    selectedRight === item.id && 'ring-2 ring-blue-500 bg-blue-100'
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    return (
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Progress: {pairs.length}/{totalPairs} pairs matched</span>
        <div className="flex items-center space-x-2">
          <span>{Math.round((pairs.length / totalPairs) * 100)}% complete</span>
          {!readonly && !isSubmitted && (
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
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
          : hasPartialCredit ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'
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
              You got {correctMatches} out of {totalPairs} matches correct.
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
        <Lightbulb className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">Explanation</div>
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
              <Link2 className="w-5 h-5" />
              <span>Matching Question</span>
            </span>
            {renderRequiredIndicator()}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderQuestionHeader()}
        {renderInstructions()}
        {renderMatchingArea()}
        {renderProgress()}
        {renderAnswerFeedback()}
        {renderExplanation()}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <div>Pairs: {JSON.stringify(pairs)}</div>
            <div>Correct: {correctMatches}/{totalPairs}</div>
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

export function useMatchingLogic(question: MatchingQuestion) {
  const [pairs, setPairs] = React.useState<{ leftId: string; rightId: string }[]>([]);
  const [timeSpent, setTimeSpent] = React.useState(0);
  const [startTime] = React.useState(Date.now());

  const correctPairs = question.pairs;
  const correctMatches = pairs.filter(pair => 
    correctPairs.some(correct => correct.leftId === pair.leftId && correct.rightId === pair.rightId)
  ).length;

  const totalPairs = correctPairs.length;
  const isFullyCorrect = correctMatches === totalPairs && pairs.length === totalPairs;
  const isComplete = pairs.length === totalPairs;

  const addPair = React.useCallback((leftId: string, rightId: string) => {
    setPairs(prev => {
      const newPairs = prev.filter(p => p.leftId !== leftId && p.rightId !== rightId);
      return [...newPairs, { leftId, rightId }];
    });
    setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
  }, [startTime]);

  const getAnswer = React.useCallback((): MatchingAnswer => {
    const points = (correctMatches / totalPairs) * question.points;

    return {
      id: `matching-answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'MATCHING',
      pairs,
      isCorrect: isFullyCorrect,
      points: Math.round(points * 100) / 100,
      maxPoints: question.points,
      timeSpent,
      submittedAt: new Date(),
    };
  }, [question, pairs, isFullyCorrect, correctMatches, totalPairs, timeSpent]);

  const reset = React.useCallback(() => {
    setPairs([]);
    setTimeSpent(0);
  }, []);

  return {
    pairs,
    correctMatches,
    totalPairs,
    isFullyCorrect,
    isComplete,
    timeSpent,
    addPair,
    getAnswer,
    reset,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuizMatching
export { 
  MatchingItem, 
  useMatchingLogic, 
  type QuizMatchingProps, 
  type MatchingItemProps 
}