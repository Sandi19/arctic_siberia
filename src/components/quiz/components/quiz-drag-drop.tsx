// File: src/components/quiz/components/quiz-drag-drop.tsx

'use client'

// ✅ FIXED: Framework & Core Imports
import React, { useState, useEffect, useCallback, useMemo } from 'react'

// ✅ FIXED: UI Components menggunakan barrel imports dari index.ts
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  Progress,
  Separator
} from '@/components/ui'

// Feature Components
import { QuizProgress } from '@/components/quiz'

// Icons
import { 
  CheckCircle2, 
  Move, 
  RotateCcw, 
  Target, 
  XCircle, 
  AlertTriangle,
  GripVertical,
  Shuffle,
  Eye,
  EyeOff
} from 'lucide-react'

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
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { 
  DragDropQuestion, 
  QuizAnswer, 
  QuizAttemptResult,
  DragDropItem,
  DropZone
} from '../types'

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface QuizDragDropProps {
  question: DragDropQuestion
  questionIndex: number
  totalQuestions: number
  value?: DragDropAnswer
  onChange: (value: DragDropAnswer) => void
  onSubmit: (answer: QuizAnswer) => void
  isSubmitted?: boolean
  result?: QuizAttemptResult
  showCorrect?: boolean
  timeLimit?: number
  className?: string
}

interface DragDropAnswer {
  placements: Record<string, string[]> // dropZoneId -> itemIds[]
  submittedAt?: string
}

interface SortableItemProps {
  id: string
  item: DragDropItem
  isDragging?: boolean
  isCorrect?: boolean
  isIncorrect?: boolean
  showFeedback?: boolean
  disabled?: boolean
}

interface DroppableZoneProps {
  zone: DropZone
  items: DragDropItem[]
  isDragDisabled?: boolean
  showCorrectness?: boolean
  correctItems?: string[]
  className?: string
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `dnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const validateAnswer = (
  answer: DragDropAnswer, 
  correctAnswer: Record<string, string[]>
): { score: number; feedback: Record<string, boolean> } => {
  let correctPlacements = 0
  let totalPlacements = 0
  const feedback: Record<string, boolean> = {}

  Object.keys(correctAnswer).forEach(zoneId => {
    const correctItems = correctAnswer[zoneId] || []
    const userItems = answer.placements[zoneId] || []
    
    correctItems.forEach(itemId => {
      totalPlacements++
      const isCorrect = userItems.includes(itemId)
      if (isCorrect) correctPlacements++
      feedback[`${zoneId}_${itemId}`] = isCorrect
    })

    // Check for incorrect items in this zone
    userItems.forEach(itemId => {
      if (!correctItems.includes(itemId)) {
        feedback[`${zoneId}_${itemId}`] = false
      }
    })
  })

  return {
    score: totalPlacements > 0 ? (correctPlacements / totalPlacements) * 100 : 0,
    feedback
  }
}

const getItemsByZone = (
  items: DragDropItem[], 
  placements: Record<string, string[]>, 
  zoneId: string
): DragDropItem[] => {
  const itemIds = placements[zoneId] || []
  return itemIds.map(id => items.find(item => item.id === id)).filter(Boolean) as DragDropItem[]
}

const getUnplacedItems = (
  items: DragDropItem[], 
  placements: Record<string, string[]>
): DragDropItem[] => {
  const placedItemIds = new Set(Object.values(placements).flat())
  return items.filter(item => !placedItemIds.has(item.id))
}

// =================================================================
// 🎯 SORTABLE ITEM COMPONENT
// =================================================================

function SortableItem({ 
  id,
  item, 
  isDragging = false,
  isCorrect, 
  isIncorrect, 
  showFeedback = false,
  disabled = false
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: id,
    disabled: disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative p-3 rounded-lg border-2 border-dashed transition-all duration-200 cursor-move",
        "bg-white hover:bg-gray-50 hover:border-blue-300",
        isSortableDragging && "shadow-lg border-blue-400 bg-blue-50 rotate-2 z-50",
        disabled && "cursor-not-allowed opacity-75",
        showFeedback && isCorrect && "border-green-500 bg-green-50",
        showFeedback && isIncorrect && "border-red-500 bg-red-50",
        "min-h-[60px] flex items-center justify-between"
      )}
    >
      {/* Drag Handle */}
      <div className="flex items-center space-x-3">
        <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        
        {/* Item Content */}
        <div className="flex items-center space-x-2">
          {item.image && (
            <img
              src={item.image}
              alt={item.text}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <span className="text-sm font-medium">{item.text}</span>
        </div>
      </div>

      {/* Feedback Icon */}
      {showFeedback && (
        <div className="flex-shrink-0">
          {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {isIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
        </div>
      )}
    </div>
  )
}

// =================================================================
// 🎯 DRAG OVERLAY ITEM
// =================================================================

function DragOverlayItem({ item }: { item: DragDropItem }) {
  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border-2 border-dashed",
        "bg-blue-50 border-blue-400 shadow-lg rotate-2",
        "min-h-[60px] flex items-center justify-between cursor-move"
      )}
    >
      <div className="flex items-center space-x-3">
        <GripVertical className="w-4 h-4 text-blue-600" />
        <div className="flex items-center space-x-2">
          {item.image && (
            <img
              src={item.image}
              alt={item.text}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <span className="text-sm font-medium">{item.text}</span>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 DROP ZONE COMPONENT
// =================================================================

function DropZoneArea({
  zone,
  items,
  isDragDisabled = false,
  showCorrectness = false,
  correctItems = [],
  className
}: DroppableZoneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isOver,
  } = useSortable({
    id: zone.id,
    data: {
      type: 'zone',
      zone: zone,
    },
  });

  const isCorrectZone = showCorrectness && items.every(item => 
    correctItems.includes(item.id)
  ) && items.length === correctItems.length

  const hasErrors = showCorrectness && !isCorrectZone

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-4 rounded-lg border-2 border-dashed transition-all duration-200",
        "min-h-[120px]",
        isOver && "border-blue-400 bg-blue-50",
        !isOver && "border-gray-300 bg-gray-50",
        showCorrectness && isCorrectZone && "border-green-400 bg-green-50",
        showCorrectness && hasErrors && "border-red-400 bg-red-50",
        className
      )}
    >
      {/* Zone Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">{zone.label}</h4>
          {zone.capacity && (
            <Badge variant="outline" className="text-xs">
              {items.length} / {zone.capacity}
            </Badge>
          )}
        </div>
        {showCorrectness && (
          <div>
            {isCorrectZone && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {hasErrors && <XCircle className="w-5 h-5 text-red-600" />}
          </div>
        )}
      </div>

      {/* Hint */}
      {zone.hint && !showCorrectness && (
        <p className="text-xs text-gray-500 mb-2">{zone.hint}</p>
      )}

      {/* Items in Zone */}
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-gray-400">
              <span className="text-sm">Drop items here</span>
            </div>
          ) : (
            items.map((item) => {
              const isCorrect = showCorrectness && correctItems.includes(item.id)
              const isIncorrect = showCorrectness && !correctItems.includes(item.id)

              return (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  isCorrect={isCorrect}
                  isIncorrect={isIncorrect}
                  showFeedback={showCorrectness}
                  disabled={isDragDisabled}
                />
              )
            })
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// =================================================================
// 🎯 ITEM BANK COMPONENT
// =================================================================

function ItemBank({
  items,
  isDragDisabled = false
}: {
  items: DragDropItem[]
  isDragDisabled?: boolean
}) {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
      <div className="flex items-center space-x-2 mb-3">
        <Move className="w-4 h-4 text-gray-600" />
        <h4 className="text-sm font-medium text-gray-700">Available Items</h4>
        <Badge variant="outline" className="text-xs">
          {items.length} items
        </Badge>
      </div>

      <SortableContext
        items={items.map(item => item.id)}
        strategy={rectSortingStrategy}
      >
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-gray-500">
              <span className="text-sm">All items have been placed</span>
            </div>
          ) : (
            items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                item={item}
                disabled={isDragDisabled}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizDragDrop({
  question,
  questionIndex,
  totalQuestions,
  value = { placements: {} },
  onChange,
  onSubmit,
  isSubmitted = false,
  result,
  showCorrect = false,
  timeLimit,
  className
}: QuizDragDropProps) {
  // State Management
  const [answer, setAnswer] = useState<DragDropAnswer>(value)
  const [shuffledItems, setShuffledItems] = useState<DragDropItem[]>([])
  const [showHints, setShowHints] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

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

  // Initialize shuffled items
  useEffect(() => {
    if (question.items) {
      const shuffled = question.shuffleItems 
        ? shuffleArray(question.items)
        : question.items
      setShuffledItems(shuffled)
    }
  }, [question.items, question.shuffleItems])

  // Sync with parent component
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(answer)) {
      setAnswer(value)
    }
  }, [value])

  useEffect(() => {
    onChange(answer)
  }, [answer, onChange])

  // Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which zone the active item is currently in
    let sourceZoneId: string | null = null;
    for (const [zoneId, itemIds] of Object.entries(answer.placements)) {
      if (itemIds.includes(activeId)) {
        sourceZoneId = zoneId;
        break;
      }
    }

    // Check if dropping on a zone or an item
    const targetZone = question.zones.find(z => z.id === overId);
    let targetZoneId: string | null = null;

    if (targetZone) {
      // Dropped directly on a zone
      targetZoneId = targetZone.id;
    } else {
      // Dropped on an item - find its zone
      for (const [zoneId, itemIds] of Object.entries(answer.placements)) {
        if (itemIds.includes(overId)) {
          targetZoneId = zoneId;
          break;
        }
      }
    }

    // If no target zone found, check if it's in the item bank
    if (!targetZoneId && !sourceZoneId) {
      // Item is being moved within the item bank
      return;
    }

    setAnswer(prev => {
      const newPlacements = { ...prev.placements };

      // Remove item from source zone if it exists
      if (sourceZoneId) {
        newPlacements[sourceZoneId] = (newPlacements[sourceZoneId] || [])
          .filter(id => id !== activeId);
        
        // Clean up empty arrays
        if (newPlacements[sourceZoneId].length === 0) {
          delete newPlacements[sourceZoneId];
        }
      }

      // Add item to target zone if it exists
      if (targetZoneId) {
        if (!newPlacements[targetZoneId]) {
          newPlacements[targetZoneId] = [];
        }
        
        // Check capacity
        const targetZoneInfo = question.zones.find(z => z.id === targetZoneId);
        if (targetZoneInfo?.capacity && newPlacements[targetZoneId].length >= targetZoneInfo.capacity) {
          toast.error(`Zone "${targetZoneInfo.label}" is full (max ${targetZoneInfo.capacity} items)`);
          return prev;
        }

        // Add item if not already present
        if (!newPlacements[targetZoneId].includes(activeId)) {
          newPlacements[targetZoneId].push(activeId);
        }
      }

      return { ...prev, placements: newPlacements };
    });
  };

  // Compute derived values
  const itemsByZone = useMemo(() => {
    const result: Record<string, DragDropItem[]> = {}
    question.zones.forEach(zone => {
      result[zone.id] = getItemsByZone(shuffledItems, answer.placements, zone.id)
    })
    return result
  }, [shuffledItems, answer.placements, question.zones])

  const unplacedItems = useMemo(() => {
    return getUnplacedItems(shuffledItems, answer.placements)
  }, [shuffledItems, answer.placements])

  const validation = useMemo(() => {
    if (!showCorrect || !question.correctAnswer) return null
    return validateAnswer(answer, question.correctAnswer)
  }, [answer, question.correctAnswer, showCorrect])

  // Handle submission
  const handleSubmit = useCallback(() => {
    const errors: string[] = []

    // Validate all items are placed
    if (unplacedItems.length > 0) {
      errors.push(`Please place all items. ${unplacedItems.length} items remaining.`)
    }

    // Validate required zones
    question.zones.forEach(zone => {
      if (zone.required && (!answer.placements[zone.id] || answer.placements[zone.id].length === 0)) {
        errors.push(`Zone "${zone.label}" requires at least one item.`)
      }
    })

    setValidationErrors(errors)

    if (errors.length === 0) {
      const result = question.correctAnswer 
        ? validateAnswer(answer, question.correctAnswer)
        : { score: 100, feedback: {} }

      const quizAnswer: QuizAnswer = {
        questionId: question.id,
        questionType: 'DRAG_DROP',
        answer: answer.placements,
        isCorrect: result.score === 100,
        score: result.score,
        timeSpent: 0 // Would need to track this
      }

      onSubmit(quizAnswer)
    }
  }, [answer, question, unplacedItems, onSubmit])

  const handleReset = useCallback(() => {
    setAnswer({ placements: {} })
    setValidationErrors([])
  }, [])

  const handleToggleHints = useCallback(() => {
    setShowHints(prev => !prev)
  }, [])

  const activeItem = activeId 
    ? shuffledItems.find(item => item.id === activeId)
    : null;

  // Render
  return (
    <Card className={cn("w-full max-w-6xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{question.title}</CardTitle>
          <QuizProgress current={questionIndex + 1} total={totalQuestions} />
        </div>
        {question.description && (
          <p className="text-sm text-gray-600 mt-2">{question.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructions */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-700">
            Drag items from the bank below and drop them into the appropriate zones.
            {question.allowMultiple && " Items can be placed in multiple zones."}
          </AlertDescription>
        </Alert>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="w-4 h-4 text-red-600" />
            <div className="ml-2">
              {validationErrors.map((error, index) => (
                <AlertDescription key={index} className="text-sm text-red-700">
                  {error}
                </AlertDescription>
              ))}
            </div>
          </Alert>
        )}

        {/* Hints Toggle */}
        {question.zones.some(z => z.hint) && !showCorrect && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleHints}
            className="gap-2"
          >
            {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showHints ? "Hide Hints" : "Show Hints"}
          </Button>
        )}

        {/* Main Drag and Drop Area */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {/* Drop Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.zones.map(zone => {
                const items = itemsByZone[zone.id] || []
                const correctItems = showCorrect && question.correctAnswer 
                  ? question.correctAnswer[zone.id] || []
                  : []

                return (
                  <DropZoneArea
                    key={zone.id}
                    zone={zone}
                    items={items}
                    isDragDisabled={isSubmitted}
                    showCorrectness={showCorrect}
                    correctItems={correctItems}
                  />
                )
              })}
            </div>

            {/* Item Bank */}
            <Separator className="my-6" />
            <ItemBank items={unplacedItems} isDragDisabled={isSubmitted} />
          </div>

          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeId && activeItem ? (
              <DragOverlayItem item={activeItem} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Score Display */}
        {validation && showCorrect && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Score</h4>
              <Badge className={validation.score >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {Math.round(validation.score)}%
              </Badge>
            </div>
            <Progress value={validation.score} className="h-2" />
          </div>
        )}

        {/* Explanation */}
        {isSubmitted && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Explanation:</h4>
            <p className="text-sm text-blue-700">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitted}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          {!isSubmitted && (
            <Button 
              onClick={handleSubmit}
              disabled={validationErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Component Display Name
QuizDragDrop.displayName = 'QuizDragDrop'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default QuizDragDrop
export { 
  SortableItem as DraggableItem, 
  DropZoneArea, 
  ItemBank,
  generateId,
  shuffleArray,
  validateAnswer,
  getItemsByZone,
  getUnplacedItems,
  type QuizDragDropProps,
  type DragDropAnswer,
  type SortableItemProps as DroppableItemProps,
  type DroppableZoneProps
}