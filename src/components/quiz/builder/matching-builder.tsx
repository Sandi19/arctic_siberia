// File: src/components/quiz/builder/matching-builder.tsx

'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Alert,
  AlertDescription,
  Badge,
  Separator
} from '@/components/ui'
import { 
  Plus, 
  Trash2, 
  Move, 
  AlertCircle, 
  CheckCircle,
  GripVertical,
  ArrowRight,
  Shuffle
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface MatchingPair {
  id: string
  left: string
  right: string
}

interface MatchingQuestion {
  id: string
  type: 'matching'
  question: string
  pairs: MatchingPair[]
  instructions?: string
  points?: number
}

interface MatchingBuilderProps {
  initialData?: MatchingQuestion
  onSave: (question: MatchingQuestion) => void
  onCancel: () => void
}

export default function MatchingBuilder({ 
  initialData, 
  onSave, 
  onCancel 
}: MatchingBuilderProps) {
  const [question, setQuestion] = useState(initialData?.question || '')
  const [instructions, setInstructions] = useState(initialData?.instructions || 'Match the items on the left with the corresponding items on the right.')
  const [points, setPoints] = useState(initialData?.points || 1)
  const [pairs, setPairs] = useState<MatchingPair[]>(
    initialData?.pairs || [
      { id: '1', left: '', right: '' },
      { id: '2', left: '', right: '' }
    ]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addPair = () => {
    const newPair: MatchingPair = {
      id: Date.now().toString(),
      left: '',
      right: ''
    }
    setPairs([...pairs, newPair])
  }

  const removePair = (pairId: string) => {
    if (pairs.length > 2) {
      setPairs(pairs.filter(pair => pair.id !== pairId))
    }
  }

  const updatePair = (pairId: string, field: 'left' | 'right', value: string) => {
    setPairs(pairs.map(pair => 
      pair.id === pairId 
        ? { ...pair, [field]: value }
        : pair
    ))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedPairs = Array.from(pairs)
    const [removed] = reorderedPairs.splice(result.source.index, 1)
    reorderedPairs.splice(result.destination.index, 0, removed)

    setPairs(reorderedPairs)
  }

  const shufflePairs = () => {
    const shuffled = [...pairs].sort(() => Math.random() - 0.5)
    setPairs(shuffled)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate question
    if (!question.trim()) {
      newErrors.question = 'Question is required'
    }

    // Validate pairs
    let hasValidPair = false
    pairs.forEach((pair, index) => {
      if (!pair.left.trim() && !pair.right.trim()) {
        newErrors[`pair_${pair.id}`] = 'Both items in the pair are required'
      } else if (!pair.left.trim()) {
        newErrors[`pair_${pair.id}_left`] = 'Left item is required'
      } else if (!pair.right.trim()) {
        newErrors[`pair_${pair.id}_right`] = 'Right item is required'
      } else {
        hasValidPair = true
      }
    })

    if (!hasValidPair) {
      newErrors.pairs = 'At least one complete pair is required'
    }

    // Check for duplicates
    const leftItems = pairs.map(p => p.left.trim().toLowerCase()).filter(Boolean)
    const rightItems = pairs.map(p => p.right.trim().toLowerCase()).filter(Boolean)
    
    if (leftItems.length !== new Set(leftItems).size) {
      newErrors.duplicate_left = 'Duplicate items found on the left side'
    }
    
    if (rightItems.length !== new Set(rightItems).size) {
      newErrors.duplicate_right = 'Duplicate items found on the right side'
    }

    // Validate points
    if (points < 1) {
      newErrors.points = 'Points must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const matchingQuestion: MatchingQuestion = {
      id: initialData?.id || Date.now().toString(),
      type: 'matching',
      question: question.trim(),
      pairs: pairs.filter(pair => pair.left.trim() && pair.right.trim()),
      instructions: instructions.trim(),
      points
    }

    onSave(matchingQuestion)
  }

  const previewPairs = pairs.filter(pair => pair.left.trim() && pair.right.trim())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-500" />
            Matching Question Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              placeholder="Enter your matching question (e.g., 'Match the countries with their capitals')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={errors.question ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.question && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.question}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Instructions for students on how to complete the matching"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Points */}
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              className={`w-24 ${errors.points ? 'border-red-500' : ''}`}
            />
            {errors.points && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.points}
              </p>
            )}
          </div>

          <Separator />

          {/* Matching Pairs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Matching Pairs</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={shufflePairs}
                  disabled={pairs.length < 2}
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Shuffle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPair}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Pair
                </Button>
              </div>
            </div>

            {errors.pairs && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{errors.pairs}</AlertDescription>
              </Alert>
            )}

            {(errors.duplicate_left || errors.duplicate_right) && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {errors.duplicate_left || errors.duplicate_right}
                </AlertDescription>
              </Alert>
            )}

            {/* Drag and Drop Pairs */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pairs">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {pairs.map((pair, index) => (
                      <Draggable key={pair.id} draggableId={pair.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-4 border rounded-lg bg-white ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${errors[`pair_${pair.id}`] ? 'border-red-500' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex flex-col items-center text-gray-400 hover:text-gray-600"
                              >
                                <GripVertical className="w-5 h-5" />
                                <span className="text-xs">{index + 1}</span>
                              </div>

                              {/* Left Item */}
                              <div className="flex-1">
                                <Label className="text-sm text-gray-600">Left Item</Label>
                                <Input
                                  placeholder="Enter left item..."
                                  value={pair.left}
                                  onChange={(e) => updatePair(pair.id, 'left', e.target.value)}
                                  className={errors[`pair_${pair.id}_left`] ? 'border-red-500' : ''}
                                />
                              </div>

                              {/* Arrow */}
                              <div className="flex items-center justify-center">
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                              </div>

                              {/* Right Item */}
                              <div className="flex-1">
                                <Label className="text-sm text-gray-600">Right Item</Label>
                                <Input
                                  placeholder="Enter right item..."
                                  value={pair.right}
                                  onChange={(e) => updatePair(pair.id, 'right', e.target.value)}
                                  className={errors[`pair_${pair.id}_right`] ? 'border-red-500' : ''}
                                />
                              </div>

                              {/* Remove Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePair(pair.id)}
                                disabled={pairs.length <= 2}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Error Display */}
                            {errors[`pair_${pair.id}`] && (
                              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors[`pair_${pair.id}`]}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <Separator />

          {/* Preview */}
          {previewPairs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Preview
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="font-medium">{question}</p>
                {instructions && (
                  <p className="text-sm text-gray-600 italic">{instructions}</p>
                )}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Items to Match:</h4>
                    <div className="space-y-2">
                      {previewPairs.map((pair, index) => (
                        <div key={`left-${pair.id}`} className="p-2 bg-white border rounded text-sm">
                          {pair.left}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Options:</h4>
                    <div className="space-y-2">
                      {previewPairs
                        .map(pair => pair.right)
                        .sort(() => Math.random() - 0.5) // Shuffle for preview
                        .map((rightItem, index) => (
                          <div key={`right-${index}`} className="p-2 bg-white border rounded text-sm">
                            {rightItem}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-2">
                  {points} {points === 1 ? 'point' : 'points'}
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={pairs.length < 2 || !question.trim()}
            >
              Save Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}