// File: src/components/quiz/components/quiz-matching.tsx

/**
 * =================================================================
 * 🔗 QUIZ MATCHING COMPONENT - Migrated to @dnd-kit
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

// ✅ NEW: @dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableMatchingItemProps extends MatchingItemProps {
  id: string;
  isDragging?: boolean;
}

// =================================================================
// 🎯 MATCHING ITEM COMPONENT WITH DND-KIT
// =================================================================

function SortableMatchingItem({
  id,
  item,
  column,
  isMatched = false,
  matchedWith,
  isCorrect = false,
  isRevealed = false,
  onMatch,
  disabled = false,
  isDragging = false,
  className,
}: SortableMatchingItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: id,
    disabled: disabled || column === 'right',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    if (!disabled && onMatch && column === 'right') {
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

  const isLeftColumn = column === 'left';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={cn(
        'relative p-4 border-2 rounded-lg transition-all duration-200',
        'flex items-center space-x-3',
        getStatusStyles(),
        disabled && 'cursor-not-allowed opacity-70',
        isLeftColumn && !disabled && 'cursor-move',
        className
      )}
      {...(isLeftColumn && !disabled ? attributes : {})}
      {...(isLeftColumn && !disabled ? listeners : {})}
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
// 🎯 DRAG OVERLAY COMPONENT
// =================================================================

function DragOverlayItem({ item }: { item: MatchingQuestion['leftColumn'][0] }) {
  return (
    <div
      className={cn(
        'relative p-4 border-2 rounded-lg',
        'flex items-center space-x-3',
        'border-blue-300 bg-blue-50 text-blue-800 shadow-lg',
        'cursor-move'
      )}
    >
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
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // DND-Kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drop animation config
  const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // =================================================================
  // 🔄 COMPUTED VALUES
  // =================================================================

  const correctPairs = question.pairs;
  const totalPairs = correctPairs.length;
  
  const currentPairs = React.useMemo(() => {
    return pairs.filter(pair => 
      question.leftColumn.some(item => item.id === pair.leftId) &&
      question.rightColumn.some(item => item.id === pair.rightId)
    );
  }, [pairs, question.leftColumn, question.rightColumn]);

  const correctMatches = React.useMemo(() => {
    return currentPairs.filter(pair => 
      correctPairs.some(correct => correct.leftId === pair.leftId && correct.rightId === pair.rightId)
    ).length;
  }, [currentPairs, correctPairs]);

  const getPairedRightId = (leftId: string): string | null => {
    const pair = currentPairs.find(p => p.leftId === leftId);
    return pair ? pair.rightId : null;
  };

  const getPairedLeftId = (rightId: string): string | null => {
    const pair = currentPairs.find(p => p.rightId === rightId);
    return pair ? pair.leftId : null;
  };

  const isCorrectPair = (leftId: string, rightId: string): boolean => {
    return correctPairs.some(pair => pair.leftId === leftId && pair.rightId === rightId);
  };

  // =================================================================
  // 🔄 EVENT HANDLERS - DND-KIT
  // =================================================================

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over || readonly || isSubmitted) return;

    const leftId = active.id as string;
    const rightId = over.id as string;

    // Check if dropping on a right column item
    const isRightItem = question.rightColumn.some(item => item.id === rightId);
    if (!isRightItem) return;

    // Update pairs
    const newPairs = pairs.filter(p => p.leftId !== leftId && p.rightId !== rightId);
    newPairs.push({ leftId, rightId });
    
    setPairs(newPairs);
    if (onPairChange) onPairChange(leftId, rightId);

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
  };

  const handleReset = React.useCallback(() => {
    if (readonly || isSubmitted) return;
    
    setPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [readonly, isSubmitted]);

  const handleShuffle = React.useCallback(() => {
    if (readonly || isSubmitted) return;
    
    // This would require updating the question prop, which should be handled by parent
    console.log('Shuffle not implemented in this version');
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
            Drag items from the left column and drop them onto the corresponding items in the right column to create matches.
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderHints = () => {
    if (!question.hints || question.hints.length === 0) return null;

    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Lightbulb className="w-4 h-4 text-yellow-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-yellow-800">Hints</div>
          <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
            {question.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      </Alert>
    );
  };

  const activeItem = activeId 
    ? question.leftColumn.find(item => item.id === activeId)
    : null;

  // =================================================================
  // 🎨 RENDER
  // =================================================================

  return (
    <Card className={cn('w-full max-w-5xl mx-auto', className)}>
      <CardHeader>
        <CardTitle>{renderQuestionHeader()}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructions */}
        {renderInstructions()}

        {/* Hints */}
        {renderHints()}

        {/* Matching Area */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Left Column</div>
              <SortableContext
                items={question.leftColumn.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {question.leftColumn.map((item) => {
                    const pairedRightId = getPairedRightId(item.id);
                    const isMatched = !!pairedRightId;
                    const isCorrect = pairedRightId ? isCorrectPair(item.id, pairedRightId) : false;

                    return (
                      <SortableMatchingItem
                        key={item.id}
                        id={item.id}
                        item={item}
                        column="left"
                        isMatched={isMatched}
                        matchedWith={pairedRightId || undefined}
                        isCorrect={isCorrect}
                        isRevealed={showCorrectAnswer}
                        disabled={readonly || isSubmitted}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Right Column</div>
              <SortableContext
                items={question.rightColumn.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {question.rightColumn.map((item) => {
                    const pairedLeftId = getPairedLeftId(item.id);
                    const isMatched = !!pairedLeftId;
                    const isCorrect = pairedLeftId ? isCorrectPair(pairedLeftId, item.id) : false;

                    return (
                      <SortableMatchingItem
                        key={item.id}
                        id={item.id}
                        item={item}
                        column="right"
                        isMatched={isMatched}
                        matchedWith={pairedLeftId || undefined}
                        isCorrect={isCorrect}
                        isRevealed={showCorrectAnswer}
                        onMatch={(id) => {
                          // Handle click matching if needed
                          console.log('Right item clicked:', id);
                        }}
                        disabled={readonly || isSubmitted}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeId && activeItem ? (
              <DragOverlayItem item={activeItem} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={readonly || isSubmitted || currentPairs.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Correct matches:</span>
            <Badge variant={correctMatches === totalPairs ? 'default' : 'outline'}>
              {correctMatches} / {totalPairs}
            </Badge>
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div className="ml-2">
              <div className="font-medium text-sm text-green-800">Explanation</div>
              <div className="text-sm text-green-700 mt-1">{question.explanation}</div>
            </div>
          </Alert>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
            <div>Current pairs: {JSON.stringify(currentPairs)}</div>
            <div>Correct matches: {correctMatches}</div>
            <div>Is submitted: {isSubmitted ? 'Yes' : 'No'}</div>
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
  SortableMatchingItem as MatchingItem, 
  useMatchingLogic, 
  type QuizMatchingProps, 
  type MatchingItemProps 
}