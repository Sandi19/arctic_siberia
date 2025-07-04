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
import { QuizProgress } from '../shared/quiz-progress'

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

// External Libraries  
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from '@hello-pangea/dnd'
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

interface DroppableItemProps {
  item: DragDropItem
  index: number
  isDragDisabled?: boolean
  isCorrect?: boolean
  isIncorrect?: boolean
  showFeedback?: boolean
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
// 🎯 SUB-COMPONENTS
// =================================================================

function DraggableItem({ 
  item, 
  index, 
  isDragDisabled = false, 
  isCorrect, 
  isIncorrect, 
  showFeedback = false 
}: DroppableItemProps) {
  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group relative p-3 rounded-lg border-2 border-dashed transition-all duration-200 cursor-move",
            "bg-white hover:bg-gray-50 hover:border-blue-300",
            snapshot.isDragging && "shadow-lg border-blue-400 bg-blue-50 rotate-2 z-50",
            isDragDisabled && "cursor-not-allowed opacity-75",
            showFeedback && isCorrect && "border-green-500 bg-green-50",
            showFeedback && isIncorrect && "border-red-500 bg-red-50",
            "min-h-[60px] flex items-center justify-center text-center"
          )}
        >
          {!isDragDisabled && (
            <GripVertical className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
          
          <div className="flex-1 px-6">
            {item.type === 'text' && (
              <span className="text-sm font-medium text-gray-700">
                {item.content}
              </span>
            )}
            
            {item.type === 'image' && (
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={item.imageUrl} 
                  alt={item.alt || 'Drag item'}
                  className="max-w-16 max-h-16 object-contain rounded"
                />
                {item.caption && (
                  <span className="text-xs text-gray-600">{item.caption}</span>
                )}
              </div>
            )}
          </div>

          {showFeedback && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {isIncorrect && <XCircle className="w-4 h-4 text-red-600" />}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

function DropZoneArea({ 
  zone, 
  items, 
  isDragDisabled = false, 
  showCorrectness = false, 
  correctItems = [],
  className 
}: DroppableZoneProps) {
  const isCorrectZone = showCorrectness && items.length > 0 && 
    items.every(item => correctItems.includes(item.id))
  const hasIncorrectItems = showCorrectness && items.some(item => !correctItems.includes(item.id))

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-medium text-gray-700">{zone.label}</h4>
        {zone.description && (
          <span className="text-xs text-gray-500">({zone.description})</span>
        )}
        {showCorrectness && (
          <div className="ml-auto">
            {isCorrectZone && items.length > 0 && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Correct
              </Badge>
            )}
            {hasIncorrectItems && (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Incorrect
              </Badge>
            )}
          </div>
        )}
      </div>

      <Droppable droppableId={zone.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-all duration-200",
              "border-gray-300 bg-gray-50",
              snapshot.isDraggingOver && "border-blue-400 bg-blue-50",
              showCorrectness && isCorrectZone && "border-green-400 bg-green-50",
              showCorrectness && hasIncorrectItems && "border-red-400 bg-red-50",
              zone.maxItems && items.length >= zone.maxItems && "border-orange-400 bg-orange-50"
            )}
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Target className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">
                  {zone.placeholder || `Drop items here (${zone.label})`}
                </span>
                {zone.maxItems && (
                  <span className="text-xs mt-1">
                    Max {zone.maxItems} item{zone.maxItems !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => {
                  const isCorrect = showCorrectness && correctItems.includes(item.id)
                  const isIncorrect = showCorrectness && !correctItems.includes(item.id)
                  
                  return (
                    <DraggableItem
                      key={item.id}
                      item={item}
                      index={index}
                      isDragDisabled={isDragDisabled}
                      isCorrect={isCorrect}
                      isIncorrect={isIncorrect}
                      showFeedback={showCorrectness}
                    />
                  )
                })}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

function ItemBank({ 
  items, 
  isDragDisabled = false,
  showTitle = true
}: {
  items: DragDropItem[]
  isDragDisabled?: boolean
  showTitle?: boolean
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">Available Items</h4>
          <Badge variant="outline">{items.length}</Badge>
        </div>
      )}

      <Droppable droppableId="item-bank">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[100px] p-4 rounded-lg border-2 border-dashed",
              "border-gray-300 bg-gray-50",
              snapshot.isDraggingOver && "border-blue-400 bg-blue-50"
            )}
          >
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <span className="text-sm">All items have been placed</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((item, index) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    index={index}
                    isDragDisabled={isDragDisabled}
                  />
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
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
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    const sourceId = source.droppableId
    const destId = destination.droppableId

    // If dropped in the same position, do nothing
    if (sourceId === destId && source.index === destination.index) {
      return
    }

    setAnswer(prev => {
      const newPlacements = { ...prev.placements }

      // Remove item from source
      if (sourceId !== 'item-bank') {
        newPlacements[sourceId] = (newPlacements[sourceId] || [])
          .filter(id => id !== draggableId)
      }

      // Add item to destination
      if (destId !== 'item-bank') {
        const destZone = question.dropZones.find(zone => zone.id === destId)
        const currentItems = newPlacements[destId] || []

        // Check if zone has max items limit
        if (destZone?.maxItems && currentItems.length >= destZone.maxItems) {
          toast.error(`${destZone.label} can only hold ${destZone.maxItems} item(s)`)
          return prev
        }

        // Add the item
        newPlacements[destId] = [...currentItems, draggableId]
      }

      return { ...prev, placements: newPlacements }
    })

    setValidationErrors([])
  }, [question.dropZones])

  const handleReset = useCallback(() => {
    setAnswer({ placements: {} })
    setValidationErrors([])
    toast.success('Items reset to bank')
  }, [])

  const handleShuffle = useCallback(() => {
    if (isSubmitted) return
    
    setShuffledItems(shuffleArray(question.items))
    toast.success('Items shuffled')
  }, [question.items, isSubmitted])

  const handleSubmit = useCallback(() => {
    const errors: string[] = []

    // Validate required zones
    question.dropZones.forEach(zone => {
      const items = answer.placements[zone.id] || []
      
      if (zone.minItems && items.length < zone.minItems) {
        errors.push(`${zone.label} requires at least ${zone.minItems} item(s)`)
      }
      
      if (zone.maxItems && items.length > zone.maxItems) {
        errors.push(`${zone.label} can hold maximum ${zone.maxItems} item(s)`)
      }
    })

    // Check if all items are placed (if required)
    if (question.requireAllItems) {
      const unplacedItems = getUnplacedItems(shuffledItems, answer.placements)
      if (unplacedItems.length > 0) {
        errors.push('All items must be placed in drop zones')
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const finalAnswer: QuizAnswer = {
      questionId: question.id,
      type: 'drag_drop',
      answer: {
        ...answer,
        submittedAt: new Date().toISOString()
      }
    }

    onSubmit(finalAnswer)
    toast.success('Answer submitted successfully!')
  }, [answer, question, shuffledItems, onSubmit])

  // Computed values
  const unplacedItems = useMemo(() => 
    getUnplacedItems(shuffledItems, answer.placements), 
    [shuffledItems, answer.placements]
  )

  const isCorrect = result?.isCorrect ?? false
  const validation = useMemo(() => {
    if (!question.correctAnswer) return null
    return validateAnswer(answer, question.correctAnswer)
  }, [answer, question.correctAnswer])

  const completionPercentage = useMemo(() => {
    const totalItems = shuffledItems.length
    const placedItems = totalItems - unplacedItems.length
    return totalItems > 0 ? (placedItems / totalItems) * 100 : 0
  }, [shuffledItems.length, unplacedItems.length])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Move className="w-5 h-5 text-blue-600" />
              <span>Question {questionIndex + 1}</span>
              {!isSubmitted && (
                <Badge variant="outline">
                  {Math.round(completionPercentage)}% Complete
                </Badge>
              )}
            </CardTitle>
            
            {timeLimit && (
              <QuizProgress 
                current={questionIndex + 1} 
                total={totalQuestions}
                timeLimit={timeLimit}
                className="mt-2"
              />
            )}
          </div>

          {isSubmitted && (
            <Badge className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {question.question}
          </p>
          
          {question.instructions && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions:</h4>
              <p className="text-sm text-blue-700">{question.instructions}</p>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        {!isSubmitted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                {showHints ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
              
              {question.hints && showHints && (
                <Badge variant="outline" className="text-blue-600">
                  {question.hints.length} hint(s) available
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                disabled={isSubmitted}
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSubmitted}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Hints */}
        {showHints && question.hints && question.hints.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <ul className="list-disc list-inside space-y-1">
                {question.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{shuffledItems.length - unplacedItems.length} / {shuffledItems.length} items placed</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}

        {/* Drag & Drop Interface */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {/* Item Bank */}
            <ItemBank 
              items={unplacedItems} 
              isDragDisabled={isSubmitted}
            />

            <Separator />

            {/* Drop Zones */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Drop Zones
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.dropZones.map(zone => {
                  const items = getItemsByZone(shuffledItems, answer.placements, zone.id)
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
            </div>
          </div>
        </DragDropContext>

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

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={validationErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          </div>
        )}
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
  DraggableItem, 
  DropZoneArea, 
  ItemBank,
  generateId,
  shuffleArray,
  validateAnswer,
  getItemsByZone,
  getUnplacedItems,
  type QuizDragDropProps,
  type DragDropAnswer,
  type DroppableItemProps,
  type DroppableZoneProps
}