// File: src/components/quiz/builder/checkbox-builder.tsx

/**
 * =================================================================
 * 🔧 CHECKBOX BUILDER COMPONENT - Migrated to @dnd-kit
 * =================================================================
 * Multiple Selection Question builder with drag & drop options
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
  Checkbox,
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
  CheckSquare2,
  Square,
  Lightbulb,
  Calculator,
  Info,
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
import type { CheckboxQuestion, BuilderComponentProps } from '../types';

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface CheckboxBuilderProps extends BuilderComponentProps<CheckboxQuestion> {
  className?: string;
}

interface CheckboxOption {
  id: string;
  text: string;
  explanation?: string;
  weight?: number; // For partial credit scoring
}

interface CheckboxFormData {
  question: string;
  instructions?: string;
  options: CheckboxOption[];
  correctAnswers: string[]; // Array of option IDs
  explanation?: string;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  hints?: string[];
  minSelections?: number;
  maxSelections?: number;
  partialCredit?: boolean;
  penalizeIncorrect?: boolean;
  shuffleOptions?: boolean;
  showExplanationAfter?: boolean;
  tags?: string[];
}

interface OptionItemProps {
  option: CheckboxOption;
  index: number;
  isCorrect: boolean;
  onUpdate: (field: keyof CheckboxOption, value: string | number) => void;
  onDelete: () => void;
  onToggleCorrect: () => void;
  disabled?: boolean;
  showWeight?: boolean;
}

interface SortableOptionItemProps extends OptionItemProps {
  id: string;
}

interface SelectionConstraintsProps {
  minSelections?: number;
  maxSelections?: number;
  totalOptions: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

interface QuestionPreview {
  id: string;
  type: string;
  question: string;
  instructions?: string;
  options: CheckboxOption[];
  correctAnswers: string[];
  minSelections?: number;
  maxSelections?: number;
  partialCredit?: boolean;
  penalizeIncorrect?: boolean;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const checkboxQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  instructions: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Option text is required'),
    explanation: z.string().optional(),
    weight: z.number().optional(),
  })).min(2, 'At least 2 options are required').max(15, 'Maximum 15 options allowed'),
  correctAnswers: z.array(z.string()).min(1, 'At least 1 correct answer is required'),
  explanation: z.string().optional(),
  points: z.number().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  timeLimit: z.number().optional(),
  hints: z.array(z.string()).optional(),
  minSelections: z.number().optional(),
  maxSelections: z.number().optional(),
  partialCredit: z.boolean().optional(),
  penalizeIncorrect: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showExplanationAfter: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createEmptyOption = (): CheckboxOption => ({
  id: generateId(),
  text: '',
  explanation: undefined,
  weight: 1,
});

const createDefaultQuestion = (): CheckboxFormData => ({
  question: '',
  instructions: undefined,
  options: [
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
  ],
  correctAnswers: [],
  explanation: '',
  points: 1,
  difficulty: 'MEDIUM',
  timeLimit: undefined,
  hints: [],
  minSelections: 1,
  maxSelections: undefined,
  partialCredit: false,
  penalizeIncorrect: false,
  shuffleOptions: false,
  showExplanationAfter: true,
  tags: [],
});

const validateFormData = (data: CheckboxFormData): string[] => {
  const errors: string[] = [];
  
  // Check if all options have text
  const emptyOptions = data.options.filter(opt => !opt.text.trim());
  if (emptyOptions.length > 0) {
    errors.push('All options must have text');
  }
  
  // Check if at least one correct answer is selected
  if (data.correctAnswers.length === 0) {
    errors.push('At least one correct answer must be selected');
  }
  
  // Check if correct answers are valid
  const validOptionIds = data.options.map(opt => opt.id);
  const invalidCorrectAnswers = data.correctAnswers.filter(id => !validOptionIds.includes(id));
  if (invalidCorrectAnswers.length > 0) {
    errors.push('Invalid correct answer selection');
  }
  
  // Check selection constraints
  if (data.minSelections !== undefined && data.maxSelections !== undefined) {
    if (data.minSelections > data.maxSelections) {
      errors.push('Minimum selections cannot be greater than maximum selections');
    }
  }
  
  if (data.minSelections !== undefined && data.minSelections > data.correctAnswers.length) {
    errors.push('Minimum selections cannot be greater than number of correct answers');
  }
  
  return errors;
};

const calculateScorePreview = (
  correctAnswers: number,
  incorrectAnswers: number,
  totalCorrect: number,
  totalPoints: number,
  partialCredit: boolean,
  penalizeIncorrect: boolean
): number => {
  if (!partialCredit) {
    // All or nothing scoring
    return incorrectAnswers === 0 && correctAnswers === totalCorrect ? totalPoints : 0;
  }
  
  // Partial credit scoring
  let score = (correctAnswers / totalCorrect) * totalPoints;
  
  if (penalizeIncorrect) {
    const penalty = (incorrectAnswers / totalCorrect) * totalPoints;
    score = Math.max(0, score - penalty);
  }
  
  return Math.round(score * 100) / 100;
};

// =================================================================
// 🎯 SORTABLE OPTION ITEM COMPONENT
// =================================================================

function SortableOptionItem({
  id,
  option,
  index,
  isCorrect,
  onUpdate,
  onDelete,
  onToggleCorrect,
  disabled = false,
  showWeight = false,
}: SortableOptionItemProps) {
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
      className={cn(
        "group relative p-4 border rounded-lg transition-all duration-200",
        isCorrect ? "border-green-500 bg-green-50" : "border-gray-200 bg-white",
        isSortableDragging && "shadow-lg",
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

      {/* Option Content */}
      <div className="ml-8 space-y-3">
        <div className="flex items-start gap-3">
          {/* Checkbox Indicator */}
          <div
            onClick={onToggleCorrect}
            className="mt-1 cursor-pointer"
          >
            {isCorrect ? (
              <CheckSquare2 className="w-5 h-5 text-green-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </div>

          {/* Option Text */}
          <div className="flex-1 space-y-2">
            <Input
              value={option.text}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder={`Option ${index + 1} text...`}
              disabled={disabled}
              className="w-full"
            />
            
            {/* Option Explanation (optional) */}
            <Textarea
              value={option.explanation || ''}
              onChange={(e) => onUpdate('explanation', e.target.value)}
              placeholder="Explanation for this option (optional)..."
              disabled={disabled}
              className="w-full min-h-[60px] text-sm"
              rows={2}
            />
            
            {/* Weight for Partial Credit (optional) */}
            {showWeight && (
              <div className="flex items-center gap-2">
                <Label htmlFor={`weight-${option.id}`} className="text-sm">
                  Weight:
                </Label>
                <Input
                  id={`weight-${option.id}`}
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={option.weight || 1}
                  onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 1)}
                  disabled={disabled}
                  className="w-20"
                />
              </div>
            )}
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
    </div>
  );
}

// =================================================================
// 🎯 DRAG OVERLAY ITEM
// =================================================================

function DragOverlayOption({ option, index }: { option: CheckboxOption; index: number }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <Square className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-medium">{option.text || `Option ${index + 1}`}</span>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 SELECTION CONSTRAINTS COMPONENT
// =================================================================

function SelectionConstraints({
  minSelections,
  maxSelections,
  totalOptions,
  onMinChange,
  onMaxChange,
}: SelectionConstraintsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minSelections">Minimum Selections</Label>
        <Input
          id="minSelections"
          type="number"
          min={1}
          max={totalOptions}
          value={minSelections || ''}
          onChange={(e) => onMinChange(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxSelections">Maximum Selections</Label>
        <Input
          id="maxSelections"
          type="number"
          min={1}
          max={totalOptions}
          value={maxSelections || ''}
          onChange={(e) => onMaxChange(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder={`${totalOptions} (no limit)`}
        />
      </div>
    </div>
  );
}

// =================================================================
// 🎯 PREVIEW PANEL COMPONENT
// =================================================================

function QuestionPreviewPanel({ 
  question, 
  isVisible 
}: { 
  question: QuestionPreview; 
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  const correctCount = question.correctAnswers.length;
  const totalOptions = question.options.length;

  return (
    <Card className="mt-6 border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-blue-600" />
          Question Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <h4 className="text-base font-medium text-gray-900">
            {question.question || "Question text will appear here..."}
          </h4>
          
          {question.instructions && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Instructions:</strong> {question.instructions}
            </p>
          )}
          
          {(question.minSelections || question.maxSelections) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>
                Select {question.minSelections || 1}
                {question.maxSelections && question.maxSelections !== totalOptions 
                  ? ` to ${question.maxSelections}` 
                  : ' or more'} options
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Options:</h5>
          {question.options.map((option, index) => {
            const isCorrect = question.correctAnswers.includes(option.id);
            return (
              <div 
                key={option.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded border",
                  isCorrect ? "border-green-500 bg-green-50" : "border-gray-200"
                )}
              >
                <Checkbox
                  checked={isCorrect}
                  disabled
                  className="pointer-events-none"
                />
                <span className="flex-1 text-sm">
                  {option.text || `Option ${index + 1}`}
                  {question.partialCredit && option.weight && option.weight !== 1 && (
                    <span className="ml-2 text-xs text-gray-500">
                      (weight: {option.weight})
                    </span>
                  )}
                </span>
                {isCorrect && (
                  <CheckSquare2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            );
          })}
        </div>

        {/* Scoring Info */}
        <div className="p-3 bg-gray-50 rounded">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calculator className="w-4 h-4" />
            <div>
              <strong>Scoring:</strong>{' '}
              {correctCount} correct answer{correctCount !== 1 ? 's' : ''} • {' '}
              {question.partialCredit 
                ? "Partial credit based on correct selections"
                : "All or nothing scoring"
              }
              {question.penalizeIncorrect && " • Incorrect selections penalized"}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="p-3 bg-blue-50 rounded">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Explanation:</h5>
            <p className="text-sm text-blue-700">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function CheckboxBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: CheckboxBuilderProps) {
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
  } = useForm<CheckboxFormData>({
    resolver: zodResolver(checkboxQuestionSchema),
    defaultValues: {
      ...createDefaultQuestion(),
      ...initialData
    },
    mode: 'onChange'
  });

  const watchedData = watch();

  // Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = watchedData.options.findIndex(opt => opt.id === active.id);
    const newIndex = watchedData.options.findIndex(opt => opt.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOptions = [...watchedData.options];
      const [movedItem] = newOptions.splice(oldIndex, 1);
      newOptions.splice(newIndex, 0, movedItem);

      setValue('options', newOptions);
    }
  }, [watchedData.options, setValue]);

  const handleAddOption = useCallback(() => {
    if (watchedData.options.length >= 15) {
      toast.error('Maximum 15 options allowed');
      return;
    }

    const newOptions = [...watchedData.options, createEmptyOption()];
    setValue('options', newOptions);
    toast.success('Option added');
  }, [watchedData.options, setValue]);

  const handleDeleteOption = useCallback((index: number) => {
    if (watchedData.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }

    const optionToDelete = watchedData.options[index];
    const newOptions = watchedData.options.filter((_, i) => i !== index);
    setValue('options', newOptions);

    // Remove from correct answers if it was selected
    const newCorrectAnswers = watchedData.correctAnswers.filter(id => id !== optionToDelete.id);
    setValue('correctAnswers', newCorrectAnswers);

    toast.success('Option deleted');
  }, [watchedData.options, watchedData.correctAnswers, setValue]);

  const handleUpdateOption = useCallback((index: number, field: keyof CheckboxOption, value: string | number) => {
    const newOptions = [...watchedData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setValue('options', newOptions);
  }, [watchedData.options, setValue]);

  const handleToggleCorrectAnswer = useCallback((index: number) => {
    const option = watchedData.options[index];
    const isCurrentlyCorrect = watchedData.correctAnswers.includes(option.id);
    
    let newCorrectAnswers: string[];
    if (isCurrentlyCorrect) {
      newCorrectAnswers = watchedData.correctAnswers.filter(id => id !== option.id);
    } else {
      newCorrectAnswers = [...watchedData.correctAnswers, option.id];
    }
    
    setValue('correctAnswers', newCorrectAnswers);
  }, [watchedData.options, watchedData.correctAnswers, setValue]);

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), ''];
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index);
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const onSubmit = useCallback((data: CheckboxFormData) => {
    const customErrors = validateFormData(data);
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setValidationErrors([]);

    const question: CheckboxQuestion = {
      id: initialData?.id || generateId(),
      type: 'checkbox',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(question);
    toast.success(isEditing ? 'Question updated' : 'Question created');
  }, [initialData, onSave, isEditing]);

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: CheckboxQuestion = {
        id: initialData?.id || generateId(),
        type: 'checkbox',
        ...watchedData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onPreview(question);
    }
  }, [onPreview, isValid, watchedData, initialData]);

  // Computed values
  const correctCount = watchedData.correctAnswers.length;
  const totalOptions = watchedData.options.length;

  const activeOption = activeId 
    ? watchedData.options.find(opt => opt.id === activeId)
    : null;
  const activeIndex = activeId
    ? watchedData.options.findIndex(opt => opt.id === activeId)
    : -1;

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare2 className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Multiple Selection Question' : 'Create Multiple Selection Question'}
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
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question" className="required">
              Question Text
            </Label>
            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="question"
                  placeholder="Enter your question here..."
                  className="min-h-[100px]"
                  rows={3}
                />
              )}
            />
            {errors.question && (
              <p className="text-sm text-red-600">{errors.question.message}</p>
            )}
          </div>

          {/* Instructions (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="instructions">
              Instructions (Optional)
            </Label>
            <Controller
              name="instructions"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="instructions"
                  placeholder="Any special instructions for this question..."
                  className="min-h-[60px]"
                  rows={2}
                />
              )}
            />
          </div>

          {/* Options with Drag & Drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="required">Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={watchedData.options.length >= 15}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              Select {correctCount} correct answer{correctCount !== 1 ? 's' : ''} from {totalOptions} option{totalOptions !== 1 ? 's' : ''}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={watchedData.options.map(opt => opt.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {watchedData.options.map((option, index) => (
                    <SortableOptionItem
                      key={option.id}
                      id={option.id}
                      option={option}
                      index={index}
                      isCorrect={watchedData.correctAnswers.includes(option.id)}
                      onUpdate={(field, value) => handleUpdateOption(index, field, value)}
                      onDelete={() => handleDeleteOption(index)}
                      onToggleCorrect={() => handleToggleCorrectAnswer(index)}
                      disabled={false}
                      showWeight={watchedData.partialCredit}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeId && activeOption && activeIndex !== -1 ? (
                  <DragOverlayOption option={activeOption} index={activeIndex} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {errors.options && (
              <p className="text-sm text-red-600">{errors.options.message}</p>
            )}
            {errors.correctAnswers && (
              <p className="text-sm text-red-600">{errors.correctAnswers.message}</p>
            )}
          </div>

          {/* Selection Constraints */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700">Selection Constraints</h4>
            
            <Controller
              name="minSelections"
              control={control}
              render={({ field }) => (
                <Controller
                  name="maxSelections"
                  control={control}
                  render={({ field: maxField }) => (
                    <SelectionConstraints
                      minSelections={field.value}
                      maxSelections={maxField.value}
                      totalOptions={watchedData.options.length}
                      onMinChange={field.onChange}
                      onMaxChange={maxField.onChange}
                    />
                  )}
                />
              )}
            />
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
                  placeholder="Explain the correct answers..."
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

          {/* Scoring Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700">Scoring Options</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="partialCredit">Partial Credit</Label>
                  <p className="text-xs text-gray-500">Award points for each correct selection</p>
                </div>
                <Controller
                  name="partialCredit"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="partialCredit"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {watchedData.partialCredit && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="penalizeIncorrect">Penalize Incorrect</Label>
                    <p className="text-xs text-gray-500">Deduct points for incorrect selections</p>
                  </div>
                  <Controller
                    name="penalizeIncorrect"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="penalizeIncorrect"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                <Controller
                  name="shuffleOptions"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="shuffleOptions"
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

        {/* Preview Panel */}
        {showPreview && (
          <QuestionPreviewPanel 
            question={{
              id: generateId(),
              type: 'checkbox',
              ...watchedData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }} 
            isVisible={showPreview} 
          />
        )}
      </CardContent>
    </Card>
  );
}

// Component Display Name
CheckboxBuilder.displayName = 'CheckboxBuilder';

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default CheckboxBuilder;
export { 
  SortableOptionItem as OptionItem,
  SelectionConstraints,
  QuestionPreviewPanel,
  generateId,
  createEmptyOption,
  createDefaultQuestion,
  validateFormData,
  calculateScorePreview,
  type CheckboxBuilderProps,
  type OptionItemProps,
  type SelectionConstraintsProps,
  type QuestionPreview
};