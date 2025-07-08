// File: src/components/quiz/builder/matching-builder.tsx

/**
 * =================================================================
 * 🔧 MATCHING BUILDER COMPONENT - Migrated to @dnd-kit
 * =================================================================
 * Matching Question builder with drag & drop pairs
 * Created: July 2025
 * Phase: 4 - Quiz Builders
 * =================================================================
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';

// ✅ FIXED: UI Components dari barrel imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Badge,
  Alert,
  AlertDescription,
  Switch,
  Separator,
} from '@/components/ui';

// Icons
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  Link2,
  ArrowRight,
  Shuffle,
  Image,
  Info,
  Lightbulb,
  RotateCcw,
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
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Form & Validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Local Utilities
import { cn } from '@/lib/utils';

// Types
import type { MatchingQuestion, BuilderComponentProps } from '../types';

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface MatchingBuilderProps extends BuilderComponentProps<MatchingQuestion> {
  className?: string;
}

interface MatchingPair {
  id: string;
  leftId: string;
  rightId: string;
}

interface MatchingItem {
  id: string;
  text: string;
  image?: string;
}

interface MatchingFormData {
  title: string;
  description?: string;
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  pairs: MatchingPair[];
  explanation?: string;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  hints?: string[];
  shuffleColumns?: boolean;
  showExplanationAfter?: boolean;
  tags?: string[];
}

interface PairFormProps {
  pair: MatchingPair;
  index: number;
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  onUpdate: (leftId: string, rightId: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

interface SortablePairFormProps extends PairFormProps {
  id: string;
}

interface ItemFormProps {
  item: MatchingItem;
  index: number;
  column: 'left' | 'right';
  onUpdate: (field: keyof MatchingItem, value: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

interface PreviewModeProps {
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  correctPairs: MatchingPair[];
  onReset: () => void;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const matchingQuestionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().optional(),
  leftColumn: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Item text is required'),
    image: z.string().optional(),
  })).min(2, 'At least 2 items in left column').max(10, 'Maximum 10 items per column'),
  rightColumn: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Item text is required'),
    image: z.string().optional(),
  })).min(2, 'At least 2 items in right column').max(10, 'Maximum 10 items per column'),
  pairs: z.array(z.object({
    id: z.string(),
    leftId: z.string(),
    rightId: z.string(),
  })).min(2, 'At least 2 pairs required'),
  explanation: z.string().optional(),
  points: z.number().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  timeLimit: z.number().optional(),
  hints: z.array(z.string()).optional(),
  shuffleColumns: z.boolean().optional(),
  showExplanationAfter: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createEmptyItem = (): MatchingItem => ({
  id: generateId(),
  text: '',
  image: undefined,
});

const createEmptyPair = (leftId: string = '', rightId: string = ''): MatchingPair => ({
  id: generateId(),
  leftId,
  rightId,
});

const createDefaultQuestion = (): MatchingFormData => ({
  title: '',
  description: undefined,
  leftColumn: [
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
  ],
  rightColumn: [
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
  ],
  pairs: [],
  explanation: '',
  points: 1,
  difficulty: 'MEDIUM',
  timeLimit: undefined,
  hints: [],
  shuffleColumns: true,
  showExplanationAfter: true,
  tags: [],
});

const validateFormData = (data: MatchingFormData): string[] => {
  const errors: string[] = [];
  
  // Check if all items have text
  const emptyLeftItems = data.leftColumn.filter(item => !item.text.trim());
  const emptyRightItems = data.rightColumn.filter(item => !item.text.trim());
  
  if (emptyLeftItems.length > 0) {
    errors.push('All items in left column must have text');
  }
  
  if (emptyRightItems.length > 0) {
    errors.push('All items in right column must have text');
  }
  
  // Check if pairs are valid
  if (data.pairs.length === 0) {
    errors.push('At least 2 matching pairs must be defined');
  }
  
  // Check if columns have same length
  if (data.leftColumn.length !== data.rightColumn.length) {
    errors.push('Left and right columns must have the same number of items');
  }
  
  // Check for duplicate pairs
  const pairStrings = data.pairs.map(p => `${p.leftId}-${p.rightId}`);
  if (pairStrings.length !== new Set(pairStrings).size) {
    errors.push('Duplicate pairs found');
  }
  
  // Check if all pairs reference valid items
  const leftIds = data.leftColumn.map(item => item.id);
  const rightIds = data.rightColumn.map(item => item.id);
  
  data.pairs.forEach((pair, index) => {
    if (!leftIds.includes(pair.leftId)) {
      errors.push(`Pair ${index + 1}: Invalid left item reference`);
    }
    if (!rightIds.includes(pair.rightId)) {
      errors.push(`Pair ${index + 1}: Invalid right item reference`);
    }
  });
  
  // Check if all items are paired
  const pairedLeftIds = new Set(data.pairs.map(p => p.leftId));
  const pairedRightIds = new Set(data.pairs.map(p => p.rightId));
  
  const unpairedLeft = leftIds.filter(id => !pairedLeftIds.has(id));
  const unpairedRight = rightIds.filter(id => !pairedRightIds.has(id));
  
  if (unpairedLeft.length > 0 || unpairedRight.length > 0) {
    errors.push('All items must be paired');
  }
  
  return errors;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// =================================================================
// 🎯 SORTABLE PAIR FORM COMPONENT
// =================================================================

function SortablePairForm({
  id,
  pair,
  index,
  leftItems,
  rightItems,
  onUpdate,
  onDelete,
  disabled = false,
}: SortablePairFormProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    disabled: disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative p-4 border rounded-lg transition-all duration-200",
        "bg-white hover:bg-gray-50",
        isDragging && "shadow-lg",
        disabled && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      </div>

      {/* Pair Content */}
      <div className="ml-8 flex items-center gap-3">
        {/* Pair Number */}
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>

        {/* Left Item Select */}
        <div className="flex-1">
          <Select
            value={pair.leftId}
            onValueChange={(value) => onUpdate(value, pair.rightId)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select left item..." />
            </SelectTrigger>
            <SelectContent>
              {leftItems.map((item, idx) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.text || `Left Item ${idx + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Arrow Icon */}
        <ArrowRight className="w-5 h-5 text-gray-400" />

        {/* Right Item Select */}
        <div className="flex-1">
          <Select
            value={pair.rightId}
            onValueChange={(value) => onUpdate(pair.leftId, value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select right item..." />
            </SelectTrigger>
            <SelectContent>
              {rightItems.map((item, idx) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.text || `Right Item ${idx + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delete Button */}
        {index > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// =================================================================
// 🎯 DRAG OVERLAY PAIR
// =================================================================

function DragOverlayPair({ 
  pair, 
  index,
  leftItems,
  rightItems 
}: { 
  pair: MatchingPair; 
  index: number;
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
}) {
  const leftItem = leftItems.find(item => item.id === pair.leftId);
  const rightItem = rightItems.find(item => item.id === pair.rightId);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <span className="text-sm font-medium">
          {leftItem?.text || 'Left Item'} → {rightItem?.text || 'Right Item'}
        </span>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 ITEM FORM COMPONENT
// =================================================================

function ItemForm({
  item,
  index,
  column,
  onUpdate,
  onDelete,
  disabled = false,
}: ItemFormProps) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
      <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
        {String.fromCharCode(65 + index)}
      </span>

      <div className="flex-1 space-y-2">
        <Input
          value={item.text}
          onChange={(e) => onUpdate('text', e.target.value)}
          placeholder={`${column === 'left' ? 'Left' : 'Right'} item ${index + 1}...`}
          disabled={disabled}
        />
        
        <Input
          value={item.image || ''}
          onChange={(e) => onUpdate('image', e.target.value)}
          placeholder="Image URL (optional)..."
          disabled={disabled}
          className="text-sm"
        />
      </div>

      {index > 1 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// =================================================================
// 🎯 PREVIEW MODE COMPONENT
// =================================================================

function PreviewMode({
  leftColumn,
  rightColumn,
  correctPairs,
  onReset,
}: PreviewModeProps) {
  const [userPairs, setUserPairs] = useState<MatchingPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  
  const shuffledLeft = useMemo(() => shuffleArray(leftColumn), [leftColumn]);
  const shuffledRight = useMemo(() => shuffleArray(rightColumn), [rightColumn]);

  const handleLeftClick = (leftId: string) => {
    if (userPairs.some(p => p.leftId === leftId)) {
      // Remove existing pair
      setUserPairs(userPairs.filter(p => p.leftId !== leftId));
    } else {
      setSelectedLeft(leftId);
    }
  };

  const handleRightClick = (rightId: string) => {
    if (!selectedLeft) return;

    // Remove any existing pairs with these items
    const filtered = userPairs.filter(
      p => p.leftId !== selectedLeft && p.rightId !== rightId
    );

    // Add new pair
    filtered.push(createEmptyPair(selectedLeft, rightId));
    setUserPairs(filtered);
    setSelectedLeft(null);
  };

  const checkAnswer = () => {
    if (userPairs.length !== correctPairs.length) return false;

    return userPairs.every(userPair =>
      correctPairs.some(correctPair =>
        correctPair.leftId === userPair.leftId && correctPair.rightId === userPair.rightId
      )
    );
  };

  const isComplete = userPairs.length === leftColumn.length;
  const isCorrect = isComplete && checkAnswer();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <Eye className="w-4 h-4 inline mr-1" />
          Preview Mode: Click items to create matches
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setUserPairs([]);
            setSelectedLeft(null);
            onReset();
          }}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Left Column</h4>
          {shuffledLeft.map((item, index) => {
            const isPaired = userPairs.some(p => p.leftId === item.id);
            const isSelected = selectedLeft === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all",
                  isSelected && "border-blue-500 bg-blue-50",
                  isPaired && !isSelected && "border-green-500 bg-green-50",
                  !isSelected && !isPaired && "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm">{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Right Column</h4>
          {shuffledRight.map((item, index) => {
            const pairedWith = userPairs.find(p => p.rightId === item.id)?.leftId;
            const isPaired = !!pairedWith;

            return (
              <div
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                className={cn(
                  "p-3 border rounded-lg transition-all",
                  selectedLeft && !isPaired && "cursor-pointer hover:border-blue-300",
                  isPaired && "border-green-500 bg-green-50",
                  !isPaired && "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm">{item.text}</span>
                  {isPaired && (
                    <span className="ml-auto text-xs text-green-600">
                      ← {String.fromCharCode(65 + shuffledLeft.findIndex(i => i.id === pairedWith))}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <Alert className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {isCorrect ? (
            <Link2 className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className={isCorrect ? "text-green-700" : "text-red-700"}>
            {isCorrect ? "Correct! All matches are right." : "Not quite right. Try again!"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function MatchingBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: MatchingBuilderProps) {
  // State Management
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
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
  
  // Form Setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<MatchingFormData>({
    resolver: zodResolver(matchingQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  });

  const watchedData = watch();

  // Initialize pairs if empty
  React.useEffect(() => {
    if (watchedData.pairs.length === 0 && 
        watchedData.leftColumn.length >= 2 && 
        watchedData.rightColumn.length >= 2) {
      const initialPairs: MatchingPair[] = [];
      for (let i = 0; i < Math.min(watchedData.leftColumn.length, watchedData.rightColumn.length); i++) {
        initialPairs.push(createEmptyPair(
          watchedData.leftColumn[i].id,
          watchedData.rightColumn[i].id
        ));
      }
      setValue('pairs', initialPairs);
    }
  }, []);

  // Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = watchedData.pairs.findIndex(pair => pair.id === active.id);
    const newIndex = watchedData.pairs.findIndex(pair => pair.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newPairs = arrayMove(watchedData.pairs, oldIndex, newIndex);
      setValue('pairs', newPairs);
    }
  }, [watchedData.pairs, setValue]);

  const handleAddItem = useCallback((column: 'left' | 'right') => {
    const columnData = column === 'left' ? watchedData.leftColumn : watchedData.rightColumn;
    
    if (columnData.length >= 10) {
      toast.error(`Maximum 10 items per column`);
      return;
    }

    const newItem = createEmptyItem();
    
    if (column === 'left') {
      setValue('leftColumn', [...watchedData.leftColumn, newItem]);
    } else {
      setValue('rightColumn', [...watchedData.rightColumn, newItem]);
    }

    // Maintain equal columns
    if (watchedData.leftColumn.length !== watchedData.rightColumn.length) {
      const otherColumn = column === 'left' ? 'rightColumn' : 'leftColumn';
      const otherData = column === 'left' ? watchedData.rightColumn : watchedData.leftColumn;
      
      if (columnData.length + 1 > otherData.length) {
        setValue(otherColumn as any, [...otherData, createEmptyItem()]);
      }
    }

    toast.success(`Item added to ${column} column`);
  }, [watchedData, setValue]);

  const handleDeleteItem = useCallback((column: 'left' | 'right', index: number) => {
    const columnKey = column === 'left' ? 'leftColumn' : 'rightColumn';
    const columnData = watchedData[columnKey];
    
    if (columnData.length <= 2) {
      toast.error('Minimum 2 items per column');
      return;
    }

    const itemToDelete = columnData[index];
    const newColumn = columnData.filter((_, i) => i !== index);
    setValue(columnKey, newColumn);

    // Remove pairs containing this item
    const pairKey = column === 'left' ? 'leftId' : 'rightId';
    const newPairs = watchedData.pairs.filter(pair => pair[pairKey] !== itemToDelete.id);
    setValue('pairs', newPairs);

    toast.success('Item deleted');
  }, [watchedData, setValue]);

  const handleUpdateItem = useCallback((
    column: 'left' | 'right',
    index: number,
    field: keyof MatchingItem,
    value: string
  ) => {
    const columnKey = column === 'left' ? 'leftColumn' : 'rightColumn';
    const newColumn = [...watchedData[columnKey]];
    newColumn[index] = { ...newColumn[index], [field]: value };
    setValue(columnKey, newColumn);
  }, [watchedData, setValue]);

  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    setValue('pairs', [...watchedData.pairs, newPair]);
    toast.success('Pair added');
  }, [watchedData.pairs, setValue]);

  const handleDeletePair = useCallback((index: number) => {
    if (watchedData.pairs.length <= 2) {
      toast.error('Minimum 2 pairs required');
      return;
    }

    const newPairs = watchedData.pairs.filter((_, i) => i !== index);
    setValue('pairs', newPairs);
    toast.success('Pair deleted');
  }, [watchedData.pairs, setValue]);

  const handleUpdatePair = useCallback((index: number, leftId: string, rightId: string) => {
    const newPairs = [...watchedData.pairs];
    newPairs[index] = { ...newPairs[index], leftId, rightId };
    setValue('pairs', newPairs);
  }, [watchedData.pairs, setValue]);

  const handleShufflePairs = useCallback(() => {
    const shuffled = shuffleArray(watchedData.pairs);
    setValue('pairs', shuffled);
    toast.success('Pairs shuffled');
  }, [watchedData.pairs, setValue]);

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), ''];
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index);
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const onSubmit = useCallback((data: MatchingFormData) => {
    const customErrors = validateFormData(data);
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setValidationErrors([]);

    const question: MatchingQuestion = {
      id: initialData?.id || generateId(),
      type: 'MATCHING',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(question);
    toast.success(isEditing ? 'Question updated' : 'Question created');
  }, [initialData, onSave, isEditing]);

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: MatchingQuestion = {
        id: initialData?.id || generateId(),
        type: 'MATCHING',
        ...watchedData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onPreview(question);
    }
  }, [onPreview, isValid, watchedData, initialData]);

  const activePair = activeId 
    ? watchedData.pairs.find(pair => pair.id === activeId)
    : null;
  const activeIndex = activeId
    ? watchedData.pairs.findIndex(pair => pair.id === activeId)
    : -1;

  return (
    <Card className={cn("w-full max-w-5xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Matching Question' : 'Create Matching Question'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <div className="ml-2">
              <div className="font-medium text-sm text-red-800">Validation Errors:</div>
              {validationErrors.map((error, index) => (
                <AlertDescription key={index} className="text-sm text-red-700">
                  • {error}
                </AlertDescription>
              ))}
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              Question Title
            </Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="title"
                  placeholder="Enter your matching question..."
                  className="min-h-[100px]"
                  rows={3}
                />
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Additional instructions or context..."
                  className="min-h-[60px]"
                  rows={2}
                />
              )}
            />
          </div>

          {/* Columns Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="required">Left Column</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem('left')}
                  disabled={watchedData.leftColumn.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {watchedData.leftColumn.map((item, index) => (
                  <ItemForm
                    key={item.id}
                    item={item}
                    index={index}
                    column="left"
                    onUpdate={(field, value) => handleUpdateItem('left', index, field, value)}
                    onDelete={() => handleDeleteItem('left', index)}
                    disabled={false}
                  />
                ))}
              </div>

              {errors.leftColumn && (
                <p className="text-sm text-red-600">{errors.leftColumn.message}</p>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="required">Right Column</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem('right')}
                  disabled={watchedData.rightColumn.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {watchedData.rightColumn.map((item, index) => (
                  <ItemForm
                    key={item.id}
                    item={item}
                    index={index}
                    column="right"
                    onUpdate={(field, value) => handleUpdateItem('right', index, field, value)}
                    onDelete={() => handleDeleteItem('right', index)}
                    disabled={false}
                  />
                ))}
              </div>

              {errors.rightColumn && (
                <p className="text-sm text-red-600">{errors.rightColumn.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Pairs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="required">Matching Pairs</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShufflePairs}
                  disabled={watchedData.pairs.length < 2}
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Shuffle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPair}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Pair
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Define which items from the left column match with items from the right column.
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={watchedData.pairs.map(pair => pair.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {watchedData.pairs.map((pair, index) => (
                    <SortablePairForm
                      key={pair.id}
                      id={pair.id}
                      pair={pair}
                      index={index}
                      leftItems={watchedData.leftColumn}
                      rightItems={watchedData.rightColumn}
                      onUpdate={(leftId, rightId) => handleUpdatePair(index, leftId, rightId)}
                      onDelete={() => handleDeletePair(index)}
                      disabled={false}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeId && activePair && activeIndex !== -1 ? (
                  <DragOverlayPair 
                    pair={activePair} 
                    index={activeIndex}
                    leftItems={watchedData.leftColumn}
                    rightItems={watchedData.rightColumn}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {errors.pairs && (
              <p className="text-sm text-red-600">{errors.pairs.message}</p>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">
              Explanation (shown after answering)
            </Label>
            <Controller
              name="explanation"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="explanation"
                  placeholder="Explain the correct matches..."
                  className="min-h-[80px]"
                  rows={3}
                />
              )}
            />
          </div>

          {/* Points & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points" className="required">Points</Label>
              <Controller
                name="points"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="points"
                    type="number"
                    min={1}
                    max={100}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
              {errors.points && (
                <p className="text-sm text-red-600">{errors.points.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="required">Difficulty</Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Time Limit (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (seconds, optional)</Label>
            <Controller
              name="timeLimit"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="timeLimit"
                  type="number"
                  min={10}
                  placeholder="No time limit"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              )}
            />
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700">Question Options</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleColumns">Shuffle Columns</Label>
                <Controller
                  name="shuffleColumns"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="shuffleColumns"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showExplanationAfter">Show Explanation After Answer</Label>
                <Controller
                  name="showExplanationAfter"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="showExplanationAfter"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Hints */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hints (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHint}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Add Hint
              </Button>
            </div>

            {watchedData.hints && watchedData.hints.length > 0 && (
              <div className="space-y-2">
                {watchedData.hints.map((hint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...watchedData.hints!];
                        newHints[index] = e.target.value;
                        setValue('hints', newHints);
                      }}
                      placeholder={`Hint ${index + 1}...`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteHint(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!isValid}
                >
                  External Preview
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid || validationErrors.length > 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? 'Update Question' : 'Create Question'}
              </Button>
            </div>
          </div>
        </form>

        {/* Preview Mode */}
        {showPreview && watchedData.leftColumn.length > 0 && watchedData.rightColumn.length > 0 && (
          <div className="mt-6">
            <Separator className="mb-6" />
            <PreviewMode
              leftColumn={watchedData.leftColumn}
              rightColumn={watchedData.rightColumn}
              correctPairs={watchedData.pairs}
              onReset={() => setShowPreview(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component Display Name
MatchingBuilder.displayName = 'MatchingBuilder';

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default MatchingBuilder;
export { 
  SortablePairForm as PairForm,
  ItemForm,
  PreviewMode,
  generateId,
  createEmptyItem,
  createEmptyPair,
  createDefaultQuestion,
  validateFormData,
  shuffleArray,
  type MatchingBuilderProps,
  type PairFormProps,
  type ItemFormProps,
  type PreviewModeProps
};