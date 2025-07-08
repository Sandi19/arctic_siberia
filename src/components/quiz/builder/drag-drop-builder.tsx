// File: src/components/quiz/builder/drag-drop-builder.tsx

/**
 * =================================================================
 * 🔧 DRAG DROP BUILDER COMPONENT - Migrated to @dnd-kit
 * =================================================================
 * Drag & Drop Question builder with sortable items
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
  Move,
  Target,
  ArrowUpDown,
  Shuffle,
  RotateCcw,
  CheckCircle,
  Package,
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
import type { DragDropQuestion, BuilderComponentProps } from '../types';

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface DragDropBuilderProps extends BuilderComponentProps<DragDropQuestion> {
  className?: string;
}

interface DragDropItem {
  id: string;
  text: string;
  image?: string;
  correctPosition: number;
}

interface DropZone {
  id: string;
  label: string;
  description?: string;
  capacity?: number;
  hint?: string;
  required?: boolean;
}

interface DragDropFormData {
  title: string;
  description?: string;
  items: DragDropItem[];
  zones: DropZone[];
  correctAnswer: Record<string, string[]>; // zoneId -> itemIds[]
  explanation?: string;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  hints?: string[];
  shuffleItems?: boolean;
  allowMultiple?: boolean;
  showZoneHints?: boolean;
  showExplanationAfter?: boolean;
  tags?: string[];
}

interface ItemFormProps {
  item: DragDropItem;
  index: number;
  onUpdate: (field: keyof DragDropItem, value: string | number) => void;
  onDelete: () => void;
  disabled?: boolean;
}

interface SortableItemFormProps extends ItemFormProps {
  id: string;
}

interface ZoneFormProps {
  zone: DropZone;
  index: number;
  onUpdate: (field: keyof DropZone, value: string | number | boolean) => void;
  onDelete: () => void;
  disabled?: boolean;
}

interface PreviewModeProps {
  items: DragDropItem[];
  zones: DropZone[];
  correctAnswer: Record<string, string[]>;
  onReset: () => void;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const dragDropQuestionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Item text is required'),
    image: z.string().optional(),
    correctPosition: z.number().min(0),
  })).min(2, 'At least 2 items are required').max(20, 'Maximum 20 items allowed'),
  zones: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Zone label is required'),
    description: z.string().optional(),
    capacity: z.number().optional(),
    hint: z.string().optional(),
    required: z.boolean().optional(),
  })).min(1, 'At least 1 zone is required').max(6, 'Maximum 6 zones allowed'),
  correctAnswer: z.record(z.array(z.string())),
  explanation: z.string().optional(),
  points: z.number().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  timeLimit: z.number().optional(),
  hints: z.array(z.string()).optional(),
  shuffleItems: z.boolean().optional(),
  allowMultiple: z.boolean().optional(),
  showZoneHints: z.boolean().optional(),
  showExplanationAfter: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `dd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createEmptyItem = (): DragDropItem => ({
  id: generateId(),
  text: '',
  image: undefined,
  correctPosition: 0,
});

const createEmptyZone = (): DropZone => ({
  id: generateId(),
  label: '',
  description: undefined,
  capacity: undefined,
  hint: undefined,
  required: false,
});

const createDefaultQuestion = (): DragDropFormData => ({
  title: '',
  description: undefined,
  items: [
    { id: generateId(), text: 'Item 1', correctPosition: 0 },
    { id: generateId(), text: 'Item 2', correctPosition: 1 },
    { id: generateId(), text: 'Item 3', correctPosition: 2 },
  ],
  zones: [
    { id: generateId(), label: 'Drop Zone 1', required: true },
  ],
  correctAnswer: {},
  explanation: '',
  points: 1,
  difficulty: 'MEDIUM',
  timeLimit: undefined,
  hints: [],
  shuffleItems: true,
  allowMultiple: false,
  showZoneHints: true,
  showExplanationAfter: true,
  tags: [],
});

const validateFormData = (data: DragDropFormData): string[] => {
  const errors: string[] = [];
  
  // Check if all items have text
  const emptyItems = data.items.filter(item => !item.text.trim());
  if (emptyItems.length > 0) {
    errors.push('All items must have text');
  }
  
  // Check if all zones have labels
  const emptyZones = data.zones.filter(zone => !zone.label.trim());
  if (emptyZones.length > 0) {
    errors.push('All zones must have labels');
  }
  
  // Check if correct answer is defined
  const totalItemsInAnswer = Object.values(data.correctAnswer).flat().length;
  if (totalItemsInAnswer === 0) {
    errors.push('Correct answer must be defined');
  }
  
  // Check if all items are assigned in correct answer
  const assignedItemIds = new Set(Object.values(data.correctAnswer).flat());
  const unassignedItems = data.items.filter(item => !assignedItemIds.has(item.id));
  if (unassignedItems.length > 0) {
    errors.push('All items must be assigned to zones in the correct answer');
  }
  
  // Check zone capacities
  for (const zone of data.zones) {
    if (zone.capacity) {
      const itemsInZone = data.correctAnswer[zone.id]?.length || 0;
      if (itemsInZone > zone.capacity) {
        errors.push(`Zone "${zone.label}" exceeds capacity (${itemsInZone}/${zone.capacity})`);
      }
    }
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
// 🎯 SORTABLE ITEM FORM COMPONENT
// =================================================================

function SortableItemForm({
  id,
  item,
  index,
  onUpdate,
  onDelete,
  disabled = false,
}: SortableItemFormProps) {
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

      {/* Item Content */}
      <div className="ml-8 space-y-3">
        <div className="flex items-start gap-3">
          {/* Item Number */}
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>

          {/* Item Text */}
          <div className="flex-1 space-y-2">
            <Input
              value={item.text}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder={`Item ${index + 1} text...`}
              disabled={disabled}
              className="w-full"
            />
            
            {/* Item Image URL (optional) */}
            <Input
              value={item.image || ''}
              onChange={(e) => onUpdate('image', e.target.value)}
              placeholder="Image URL (optional)..."
              disabled={disabled}
              className="w-full text-sm"
            />
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

function DragOverlayItem({ item, index }: { item: DragDropItem; index: number }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <span className="text-sm font-medium">{item.text || `Item ${index + 1}`}</span>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 ZONE FORM COMPONENT
// =================================================================

function ZoneForm({
  zone,
  index,
  onUpdate,
  onDelete,
  disabled = false,
}: ZoneFormProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
      <div className="flex items-start gap-3">
        <Target className="w-5 h-5 text-gray-600 mt-1" />
        
        <div className="flex-1 space-y-3">
          {/* Zone Label */}
          <div className="flex items-center gap-2">
            <Input
              value={zone.label}
              onChange={(e) => onUpdate('label', e.target.value)}
              placeholder={`Zone ${index + 1} label...`}
              disabled={disabled}
              className="flex-1"
            />
            
            {/* Required Toggle */}
            <div className="flex items-center gap-2">
              <Label htmlFor={`required-${zone.id}`} className="text-sm">
                Required
              </Label>
              <Switch
                id={`required-${zone.id}`}
                checked={zone.required}
                onCheckedChange={(checked) => onUpdate('required', checked)}
                disabled={disabled}
              />
            </div>
          </div>
          
          {/* Zone Description */}
          <Input
            value={zone.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Zone description (optional)..."
            disabled={disabled}
            className="text-sm"
          />
          
          {/* Zone Hint */}
          <Input
            value={zone.hint || ''}
            onChange={(e) => onUpdate('hint', e.target.value)}
            placeholder="Hint for this zone (optional)..."
            disabled={disabled}
            className="text-sm"
          />
          
          {/* Zone Capacity */}
          <div className="flex items-center gap-2">
            <Label htmlFor={`capacity-${zone.id}`} className="text-sm">
              Capacity:
            </Label>
            <Input
              id={`capacity-${zone.id}`}
              type="number"
              min={1}
              value={zone.capacity || ''}
              onChange={(e) => onUpdate('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Unlimited"
              disabled={disabled}
              className="w-24"
            />
          </div>
        </div>

        {/* Delete Button */}
        {index > 0 && (
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
// 🎯 PREVIEW MODE COMPONENT
// =================================================================

function PreviewMode({
  items,
  zones,
  correctAnswer,
  onReset,
}: PreviewModeProps) {
  const [previewItems, setPreviewItems] = useState(() => shuffleArray(items));
  const [placements, setPlacements] = useState<Record<string, string[]>>({});
  
  const handleDrop = (itemId: string, zoneId: string) => {
    setPlacements(prev => {
      const newPlacements = { ...prev };
      
      // Remove item from all zones
      Object.keys(newPlacements).forEach(zone => {
        newPlacements[zone] = newPlacements[zone].filter(id => id !== itemId);
      });
      
      // Add item to new zone
      if (!newPlacements[zoneId]) {
        newPlacements[zoneId] = [];
      }
      newPlacements[zoneId].push(itemId);
      
      return newPlacements;
    });
  };

  const checkAnswer = () => {
    let correct = true;
    
    // Check if all placements match correct answer
    for (const zoneId of Object.keys(correctAnswer)) {
      const correctItems = correctAnswer[zoneId] || [];
      const placedItems = placements[zoneId] || [];
      
      if (correctItems.length !== placedItems.length) {
        correct = false;
        break;
      }
      
      for (const itemId of correctItems) {
        if (!placedItems.includes(itemId)) {
          correct = false;
          break;
        }
      }
    }
    
    return correct;
  };

  const isCorrect = checkAnswer();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <Eye className="w-4 h-4 inline mr-1" />
          Preview Mode: Try arranging the items
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPreviewItems(shuffleArray(items));
            setPlacements({});
            onReset();
          }}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Items Bank */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Items</h4>
          <div className="border rounded-lg p-4 min-h-[200px] bg-white">
            {previewItems
              .filter(item => !Object.values(placements).flat().includes(item.id))
              .map(item => (
                <div
                  key={item.id}
                  className="p-2 border rounded bg-gray-50 mb-2 cursor-move"
                >
                  {item.text}
                </div>
              ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Drop Zones</h4>
          <div className="space-y-3">
            {zones.map(zone => (
              <div
                key={zone.id}
                className="border-2 border-dashed rounded-lg p-4 min-h-[100px] bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {zone.label}
                </div>
                <div className="space-y-2">
                  {(placements[zone.id] || []).map(itemId => {
                    const item = items.find(i => i.id === itemId);
                    return item ? (
                      <div
                        key={itemId}
                        className="p-2 border rounded bg-white"
                      >
                        {item.text}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {Object.values(placements).flat().length === items.length && (
        <Alert className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {isCorrect ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className={isCorrect ? "text-green-700" : "text-red-700"}>
            {isCorrect ? "Correct! All items are in the right places." : "Not quite right. Try again!"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function DragDropBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  className
}: DragDropBuilderProps) {
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
  } = useForm<DragDropFormData>({
    resolver: zodResolver(dragDropQuestionSchema),
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

    const oldIndex = watchedData.items.findIndex(item => item.id === active.id);
    const newIndex = watchedData.items.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(watchedData.items, oldIndex, newIndex);
      
      // Update correct positions
      newItems.forEach((item, index) => {
        item.correctPosition = index;
      });
      
      setValue('items', newItems);
    }
  }, [watchedData.items, setValue]);

  const handleAddItem = useCallback(() => {
    if (watchedData.items.length >= 20) {
      toast.error('Maximum 20 items allowed');
      return;
    }

    const newItem = createEmptyItem();
    newItem.correctPosition = watchedData.items.length;
    setValue('items', [...watchedData.items, newItem]);
    toast.success('Item added');
  }, [watchedData.items, setValue]);

  const handleDeleteItem = useCallback((index: number) => {
    if (watchedData.items.length <= 2) {
      toast.error('Minimum 2 items required');
      return;
    }

    const itemToDelete = watchedData.items[index];
    const newItems = watchedData.items.filter((_, i) => i !== index);
    
    // Update correct positions
    newItems.forEach((item, idx) => {
      item.correctPosition = idx;
    });
    
    setValue('items', newItems);
    
    // Remove from correct answer
    const newCorrectAnswer = { ...watchedData.correctAnswer };
    Object.keys(newCorrectAnswer).forEach(zoneId => {
      newCorrectAnswer[zoneId] = newCorrectAnswer[zoneId].filter(id => id !== itemToDelete.id);
    });
    setValue('correctAnswer', newCorrectAnswer);
    
    toast.success('Item deleted');
  }, [watchedData.items, watchedData.correctAnswer, setValue]);

  const handleUpdateItem = useCallback((index: number, field: keyof DragDropItem, value: string | number) => {
    const newItems = [...watchedData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setValue('items', newItems);
  }, [watchedData.items, setValue]);

  const handleAddZone = useCallback(() => {
    if (watchedData.zones.length >= 6) {
      toast.error('Maximum 6 zones allowed');
      return;
    }

    setValue('zones', [...watchedData.zones, createEmptyZone()]);
    toast.success('Zone added');
  }, [watchedData.zones, setValue]);

  const handleDeleteZone = useCallback((index: number) => {
    if (watchedData.zones.length <= 1) {
      toast.error('At least 1 zone required');
      return;
    }

    const zoneToDelete = watchedData.zones[index];
    const newZones = watchedData.zones.filter((_, i) => i !== index);
    setValue('zones', newZones);
    
    // Remove from correct answer
    const newCorrectAnswer = { ...watchedData.correctAnswer };
    delete newCorrectAnswer[zoneToDelete.id];
    setValue('correctAnswer', newCorrectAnswer);
    
    toast.success('Zone deleted');
  }, [watchedData.zones, watchedData.correctAnswer, setValue]);

  const handleUpdateZone = useCallback((index: number, field: keyof DropZone, value: string | number | boolean | undefined) => {
    const newZones = [...watchedData.zones];
    newZones[index] = { ...newZones[index], [field]: value };
    setValue('zones', newZones);
  }, [watchedData.zones, setValue]);

  const handleAssignItem = useCallback((itemId: string, zoneId: string) => {
    const newCorrectAnswer = { ...watchedData.correctAnswer };
    
    // Remove item from all zones
    Object.keys(newCorrectAnswer).forEach(zone => {
      newCorrectAnswer[zone] = newCorrectAnswer[zone].filter(id => id !== itemId);
    });
    
    // Add item to new zone
    if (!newCorrectAnswer[zoneId]) {
      newCorrectAnswer[zoneId] = [];
    }
    newCorrectAnswer[zoneId].push(itemId);
    
    setValue('correctAnswer', newCorrectAnswer);
  }, [watchedData.correctAnswer, setValue]);

  const handleAddHint = useCallback(() => {
    const newHints = [...(watchedData.hints || []), ''];
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const handleDeleteHint = useCallback((index: number) => {
    const newHints = (watchedData.hints || []).filter((_, i) => i !== index);
    setValue('hints', newHints);
  }, [watchedData.hints, setValue]);

  const onSubmit = useCallback((data: DragDropFormData) => {
    const customErrors = validateFormData(data);
    
    if (customErrors.length > 0) {
      setValidationErrors(customErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setValidationErrors([]);

    const question: DragDropQuestion = {
      id: initialData?.id || generateId(),
      type: 'DRAG_DROP',
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(question);
    toast.success(isEditing ? 'Question updated' : 'Question created');
  }, [initialData, onSave, isEditing]);

  const handlePreview = useCallback(() => {
    if (onPreview && isValid) {
      const question: DragDropQuestion = {
        id: initialData?.id || generateId(),
        type: 'DRAG_DROP',
        ...watchedData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onPreview(question);
    }
  }, [onPreview, isValid, watchedData, initialData]);

  const activeItem = activeId 
    ? watchedData.items.find(item => item.id === activeId)
    : null;
  const activeIndex = activeId
    ? watchedData.items.findIndex(item => item.id === activeId)
    : -1;

  return (
    <Card className={cn("w-full max-w-5xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Drag & Drop Question' : 'Create Drag & Drop Question'}
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
                  placeholder="Enter your drag and drop question..."
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

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="required">Draggable Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={watchedData.items.length >= 20}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={watchedData.items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {watchedData.items.map((item, index) => (
                    <SortableItemForm
                      key={item.id}
                      id={item.id}
                      item={item}
                      index={index}
                      onUpdate={(field, value) => handleUpdateItem(index, field, value)}
                      onDelete={() => handleDeleteItem(index)}
                      disabled={false}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeId && activeItem && activeIndex !== -1 ? (
                  <DragOverlayItem item={activeItem} index={activeIndex} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {errors.items && (
              <p className="text-sm text-red-600">{errors.items.message}</p>
            )}
          </div>

          <Separator />

          {/* Zones Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="required">Drop Zones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddZone}
                disabled={watchedData.zones.length >= 6}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Zone
              </Button>
            </div>

            <div className="space-y-3">
              {watchedData.zones.map((zone, index) => (
                <ZoneForm
                  key={zone.id}
                  zone={zone}
                  index={index}
                  onUpdate={(field, value) => handleUpdateZone(index, field, value)}
                  onDelete={() => handleDeleteZone(index)}
                  disabled={false}
                />
              ))}
            </div>

            {errors.zones && (
              <p className="text-sm text-red-600">{errors.zones.message}</p>
            )}
          </div>

          <Separator />

          {/* Correct Answer Assignment */}
          <div className="space-y-4">
            <Label className="required">Correct Answer Assignment</Label>
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              {watchedData.zones.map(zone => (
                <div key={zone.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">{zone.label || 'Unnamed Zone'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {watchedData.items.map(item => {
                      const isAssigned = watchedData.correctAnswer[zone.id]?.includes(item.id);
                      return (
                        <Button
                          key={item.id}
                          type="button"
                          variant={isAssigned ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAssignItem(item.id, zone.id)}
                          className={cn(
                            "transition-all",
                            isAssigned && "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          {item.text || `Item ${watchedData.items.indexOf(item) + 1}`}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {errors.correctAnswer && (
              <p className="text-sm text-red-600">{errors.correctAnswer.message}</p>
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
                  placeholder="Explain the correct arrangement..."
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
                <Label htmlFor="shuffleItems">Shuffle Items</Label>
                <Controller
                  name="shuffleItems"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="shuffleItems"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowMultiple">Allow Multiple Items per Zone</Label>
                <Controller
                  name="allowMultiple"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="allowMultiple"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showZoneHints">Show Zone Hints</Label>
                <Controller
                  name="showZoneHints"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="showZoneHints"
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
                <Plus className="w-4 h-4 mr-1" />
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
        {showPreview && watchedData.items.length > 0 && watchedData.zones.length > 0 && (
          <div className="mt-6">
            <Separator className="mb-6" />
            <PreviewMode
              items={watchedData.items}
              zones={watchedData.zones}
              correctAnswer={watchedData.correctAnswer}
              onReset={() => setShowPreview(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component Display Name
DragDropBuilder.displayName = 'DragDropBuilder';

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default DragDropBuilder;
export { 
  SortableItemForm as ItemForm,
  ZoneForm,
  PreviewMode,
  generateId,
  createEmptyItem,
  createEmptyZone,
  createDefaultQuestion,
  validateFormData,
  shuffleArray,
  type DragDropBuilderProps,
  type ItemFormProps,
  type ZoneFormProps,
  type PreviewModeProps
};