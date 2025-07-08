// File: src/components/quiz/builder/mcq-builder.tsx

/**
 * =================================================================
 * 🔧 MCQ BUILDER COMPONENT - Migrated to @dnd-kit
 * =================================================================
 * Multiple Choice Question builder with drag & drop options
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
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  Shuffle,
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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Local Utilities
import { cn } from '@/lib/utils';

// Types
import type { MCQQuestion, BuilderComponentProps } from '../types';

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface MCQBuilderProps extends BuilderComponentProps<MCQQuestion> {
  className?: string;
}

interface MCQOption {
  id: string;
  text: string;
  explanation?: string;
}

interface MCQFormData {
  question: string;
  instructions?: string;
  options: MCQOption[];
  correctAnswerIndex: number;
  explanation?: string;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  hints?: string[];
  shuffleOptions?: boolean;
  showExplanationAfter?: boolean;
  tags?: string[];
}

interface OptionItemProps {
  option: MCQOption;
  index: number;
  isCorrect: boolean;
  onUpdate: (field: keyof MCQOption, value: string) => void;
  onDelete: () => void;
  onSetCorrect: () => void;
  isDragging?: boolean;
  disabled?: boolean;
}

interface SortableOptionItemProps extends OptionItemProps {
  id: string;
}

interface QuestionPreview {
  id: string;
  type: string;
  question: string;
  instructions?: string;
  options: MCQOption[];
  correctAnswerIndex: number;
  correctAnswer: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const mcqQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  instructions: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Option text is required'),
    explanation: z.string().optional(),
  })).min(2, 'At least 2 options are required').max(6, 'Maximum 6 options allowed'),
  correctAnswerIndex: z.number().min(0),
  explanation: z.string().optional(),
  points: z.number().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  timeLimit: z.number().optional(),
  hints: z.array(z.string()).optional(),
  shuffleOptions: z.boolean().optional(),
  showExplanationAfter: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `mcq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createEmptyOption = (): MCQOption => ({
  id: generateId(),
  text: '',
  explanation: undefined,
});

const createDefaultQuestion = (): MCQFormData => ({
  question: '',
  instructions: undefined,
  options: [
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
  ],
  correctAnswerIndex: 0,
  explanation: '',
  points: 1,
  difficulty: 'MEDIUM',
  timeLimit: undefined,
  hints: [],
  shuffleOptions: false,
  showExplanationAfter: true,
  tags: [],
});

const validateFormData = (data: MCQFormData): string[] => {
  const errors: string[] = [];
  
  // Check if all options have text
  const emptyOptions = data.options.filter(opt => !opt.text.trim());
  if (emptyOptions.length > 0) {
    errors.push('All options must have text');
  }
  
  // Check if correct answer index is valid
  if (data.correctAnswerIndex >= data.options.length) {
    errors.push('Invalid correct answer selection');
  }
  
  return errors;
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
  onSetCorrect,
  isDragging = false,
  disabled = false,
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

      {/* Option Content */}
      <div className="ml-8 space-y-3">
        <div className="flex items-start gap-3">
          {/* Option Label */}
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {String.fromCharCode(65 + index)}
          </span>

          {/* Option Text */}
          <div className="flex-1 space-y-2">
            <Input
              value={option.text}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)} text...`}
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
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isCorrect ? "default" : "outline"}
              size="sm"
              onClick={onSetCorrect}
              disabled={disabled}
              className={cn(
                "transition-all",
                isCorrect && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : "Set Correct"}
            </Button>

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
    </div>
  );
}

// =================================================================
// 🎯 DRAG OVERLAY ITEM
// =================================================================

function DragOverlayOption({ option, index }: { option: MCQOption; index: number }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="text-sm font-medium">{option.text || `Option ${String.fromCharCode(65 + index)}`}</span>
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
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Options:</h5>
          {question.options.map((option, index) => (
            <div 
              key={option.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded border",
                index === question.correctAnswerIndex ? "border-green-500 bg-green-50" : "border-gray-200"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-sm">
                {option.text || `Option ${String.fromCharCode(65 + index)}`}
              </span>
              {index === question.correctAnswerIndex && (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
            </div>
          ))}
        </div>

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

function MCQBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: MCQBuilderProps) {
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
  } = useForm<MCQFormData>({
    resolver: zodResolver(mcqQuestionSchema),
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

      // Update correct answer index if needed
      let newCorrectIndex = watchedData.correctAnswerIndex;
      
      if (watchedData.correctAnswerIndex === oldIndex) {
        newCorrectIndex = newIndex;
      } else if (
        oldIndex < watchedData.correctAnswerIndex && 
        newIndex >= watchedData.correctAnswerIndex
      ) {
        newCorrectIndex = watchedData.correctAnswerIndex - 1;
      } else if (
        oldIndex > watchedData.correctAnswerIndex && 
        newIndex <= watchedData.correctAnswerIndex
      ) {
        newCorrectIndex = watchedData.correctAnswerIndex + 1;
      }

      setValue('options', newOptions);
      setValue('correctAnswerIndex', newCorrectIndex);
    }
  }, [watchedData.options, watchedData.correctAnswerIndex, setValue]);

  const handleAddOption = useCallback(() => {
    if (watchedData.options.length < 6) {
      setValue('options', [...watchedData.options, createEmptyOption()]);
    }
  }, [watchedData.options, setValue]);

  const handleDeleteOption = useCallback((index: number) => {
    if (watchedData.options.length > 2) {
      const newOptions = watchedData.options.filter((_, i) => i !== index);
      setValue('options', newOptions);
      
      // Adjust correct answer index if needed
      if (watchedData.correctAnswerIndex >= index && watchedData.correctAnswerIndex > 0) {
        setValue('correctAnswerIndex', watchedData.correctAnswerIndex - 1);
      } else if (watchedData.correctAnswerIndex >= newOptions.length) {
        setValue('correctAnswerIndex', newOptions.length - 1);
      }
    }
  }, [watchedData.options, watchedData.correctAnswerIndex, setValue]);

  const handleUpdateOption = useCallback((index: number, field: keyof MCQOption, value: string) => {
    const newOptions = [...watchedData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setValue('options', newOptions);
  }, [watchedData.options, setValue]);

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), ''];
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index);
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const onSubmit = useCallback((data: MCQFormData) => {
    const customErrors = validateFormData(data);
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setValidationErrors([]);

    const question: MCQQuestion = {
      id: initialData?.id || generateId(),
      type: 'multiple_choice',
      ...data,
      correctAnswer: data.correctAnswerIndex,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(question);
    toast.success(isEditing ? 'Question updated' : 'Question created');
  }, [initialData, onSave, isEditing]);

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: MCQQuestion = {
        id: initialData?.id || generateId(),
        type: 'multiple_choice',
        ...watchedData,
        correctAnswer: watchedData.correctAnswerIndex,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onPreview(question);
    }
  }, [onPreview, isValid, watchedData, initialData]);

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
          <FileQuestion className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Multiple Choice Question' : 'Create Multiple Choice Question'}
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
                disabled={watchedData.options.length >= 6}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
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
                      isCorrect={index === watchedData.correctAnswerIndex}
                      onUpdate={(field, value) => handleUpdateOption(index, field, value)}
                      onDelete={() => handleDeleteOption(index)}
                      onSetCorrect={() => setValue('correctAnswerIndex', index)}
                      disabled={false}
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
                  placeholder="Explain the correct answer..."
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
              type: 'multiple_choice',
              ...watchedData,
              correctAnswer: watchedData.correctAnswerIndex,
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
MCQBuilder.displayName = 'MCQBuilder';

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default MCQBuilder;
export { 
  SortableOptionItem as OptionItem,
  QuestionPreviewPanel,
  generateId,
  createEmptyOption,
  createDefaultQuestion,
  validateFormData,
  type MCQBuilderProps,
  type OptionItemProps,
  type QuestionPreview
};