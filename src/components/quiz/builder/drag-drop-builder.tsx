// File: src/components/quiz/builder/drag-drop-builder.tsx

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
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { 
  Plus, 
  Trash2, 
  Move, 
  AlertCircle, 
  CheckCircle,
  GripVertical,
  ArrowUpDown,
  Shuffle,
  Eye,
  RotateCcw,
  Target
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface DragDropItem {
  id: string
  content: string
  correctPosition: number
}

interface DragDropQuestion {
  id: string
  type: 'drag_drop'
  question: string
  items: DragDropItem[]
  instructions?: string
  points?: number
  shuffleItems?: boolean
  allowPartialCredit?: boolean
}

interface DragDropBuilderProps {
  initialData?: DragDropQuestion
  onSave: (question: DragDropQuestion) => void
  onCancel: () => void
}

export default function DragDropBuilder({ 
  initialData, 
  onSave, 
  onCancel 
}: DragDropBuilderProps) {
  const [question, setQuestion] = useState(initialData?.question || '')
  const [instructions, setInstructions] = useState(
    initialData?.instructions || 'Drag and drop the items below to arrange them in the correct order.'
  )
  const [points, setPoints] = useState(initialData?.points || 1)
  const [shuffleItems, setShuffleItems] = useState(initialData?.shuffleItems ?? true)
  const [allowPartialCredit, setAllowPartialCredit] = useState(initialData?.allowPartialCredit ?? false)
  const [items, setItems] = useState<DragDropItem[]>(
    initialData?.items || [
      { id: '1', content: '', correctPosition: 1 },
      { id: '2', content: '', correctPosition: 2 },
      { id: '3', content: '', correctPosition: 3 }
    ]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)
  const [previewItems, setPreviewItems] = useState<DragDropItem[]>([])

  const addItem = () => {
    const newItem: DragDropItem = {
      id: Date.now().toString(),
      content: '',
      correctPosition: items.length + 1
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: string) => {
    if (items.length > 2) {
      const updatedItems = items
        .filter(item => item.id !== itemId)
        .map((item, index) => ({
          ...item,
          correctPosition: index + 1
        }))
      setItems(updatedItems)
    }
  }

  const updateItemContent = (itemId: string, content: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, content }
        : item
    ))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedItems = Array.from(items)
    const [removed] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, removed)

    // Update correct positions based on new order
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      correctPosition: index + 1
    }))

    setItems(updatedItems)
  }

  const handlePreviewDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedItems = Array.from(previewItems)
    const [removed] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, removed)

    setPreviewItems(reorderedItems)
  }

  const shufflePreviewItems = () => {
    const validItems = items.filter(item => item.content.trim())
    const shuffled = [...validItems].sort(() => Math.random() - 0.5)
    setPreviewItems(shuffled)
  }

  const resetPreview = () => {
    shufflePreviewItems()
  }

  const moveItemUp = (index: number) => {
    if (index > 0) {
      const newItems = [...items]
      ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
      
      // Update correct positions
      const updatedItems = newItems.map((item, idx) => ({
        ...item,
        correctPosition: idx + 1
      }))
      
      setItems(updatedItems)
    }
  }

  const moveItemDown = (index: number) => {
    if (index < items.length - 1) {
      const newItems = [...items]
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
      
      // Update correct positions
      const updatedItems = newItems.map((item, idx) => ({
        ...item,
        correctPosition: idx + 1
      }))
      
      setItems(updatedItems)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate question
    if (!question.trim()) {
      newErrors.question = 'Question is required'
    }

    // Validate items
    let validItemCount = 0
    items.forEach((item, index) => {
      if (!item.content.trim()) {
        newErrors[`item_${item.id}`] = 'Item content is required'
      } else {
        validItemCount++
      }
    })

    if (validItemCount < 2) {
      newErrors.items = 'At least 2 items are required'
    }

    // Check for duplicate content
    const itemContents = items
      .map(item => item.content.trim().toLowerCase())
      .filter(Boolean)
    
    if (itemContents.length !== new Set(itemContents).size) {
      newErrors.duplicates = 'Duplicate items found'
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

    const dragDropQuestion: DragDropQuestion = {
      id: initialData?.id || Date.now().toString(),
      type: 'drag_drop',
      question: question.trim(),
      items: items.filter(item => item.content.trim()),
      instructions: instructions.trim(),
      points,
      shuffleItems,
      allowPartialCredit
    }

    onSave(dragDropQuestion)
  }

  const togglePreview = () => {
    if (!previewMode) {
      shufflePreviewItems()
    }
    setPreviewMode(!previewMode)
  }

  const validItems = items.filter(item => item.content.trim())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-purple-500" />
            Drag & Drop Question Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              placeholder="Enter your drag and drop question (e.g., 'Arrange the following steps in chronological order')"
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
              placeholder="Instructions for students on how to complete the drag and drop"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                className={errors.points ? 'border-red-500' : ''}
              />
              {errors.points && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.points}
                </p>
              )}
            </div>

            {/* Shuffle Items */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Shuffle Items</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shuffleItems"
                  checked={shuffleItems}
                  onChange={(e) => setShuffleItems(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="shuffleItems" className="text-sm text-gray-600">
                  Randomize item order for students
                </Label>
              </div>
            </div>

            {/* Partial Credit */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Partial Credit</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowPartialCredit"
                  checked={allowPartialCredit}
                  onChange={(e) => setAllowPartialCredit(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="allowPartialCredit" className="text-sm text-gray-600">
                  Award points for partially correct answers
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Items to Order</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={previewMode}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </div>

            {errors.items && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{errors.items}</AlertDescription>
              </Alert>
            )}

            {errors.duplicates && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{errors.duplicates}</AlertDescription>
              </Alert>
            )}

            {!previewMode ? (
              /* Edit Mode */
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="items">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 border rounded-lg bg-white ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              } ${errors[`item_${item.id}`] ? 'border-red-500' : ''}`}
                            >
                              <div className="flex items-center gap-4">
                                {/* Drag Handle & Position */}
                                <div className="flex items-center gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex flex-col items-center text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <Badge variant="outline" className="min-w-[2rem] text-center">
                                    {index + 1}
                                  </Badge>
                                </div>

                                {/* Item Content */}
                                <div className="flex-1">
                                  <Input
                                    placeholder={`Enter item ${index + 1}...`}
                                    value={item.content}
                                    onChange={(e) => updateItemContent(item.id, e.target.value)}
                                    className={errors[`item_${item.id}`] ? 'border-red-500' : ''}
                                  />
                                </div>

                                {/* Move Buttons */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItemUp(index)}
                                    disabled={index === 0}
                                    className="h-6 w-6 p-0"
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItemDown(index)}
                                    disabled={index === items.length - 1}
                                    className="h-6 w-6 p-0"
                                  >
                                    ↓
                                  </Button>
                                </div>

                                {/* Remove Button */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  disabled={items.length <= 2}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Error Display */}
                              {errors[`item_${item.id}`] && (
                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {errors[`item_${item.id}`]}
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
            ) : (
              /* Preview Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Target className="w-4 h-4 inline mr-1" />
                    Preview: Try dragging items to reorder them
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetPreview}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>

                <DragDropContext onDragEnd={handlePreviewDragEnd}>
                  <Droppable droppableId="preview-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {previewItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 border rounded-lg bg-white cursor-move ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                  <span>{item.content}</span>
                                </div>
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
            )}
          </div>

          {/* Summary */}
          {validItems.length > 0 && !previewMode && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Question Summary
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="font-medium">{question}</p>
                {instructions && (
                  <p className="text-sm text-gray-600 italic">{instructions}</p>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Correct Order:</p>
                  <ol className="space-y-1">
                    {validItems.map((item, index) => (
                      <li key={item.id} className="text-sm">
                        {index + 1}. {item.content}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex gap-4 text-sm">
                  <Badge variant="secondary">
                    {points} {points === 1 ? 'point' : 'points'}
                  </Badge>
                  {shuffleItems && (
                    <Badge variant="outline">Shuffled</Badge>
                  )}
                  {allowPartialCredit && (
                    <Badge variant="outline">Partial Credit</Badge>
                  )}
                </div>
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
              disabled={items.length < 2 || !question.trim() || previewMode}
            >
              Save Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}