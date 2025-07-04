// File: src/components/quiz/shared/option-editor.tsx

/**
 * =================================================================
 * ✏️ OPTION EDITOR COMPONENT
 * =================================================================
 * Editor untuk membuat dan mengedit opsi jawaban dalam quiz
 * Created: July 2025
 * Phase: 2 - Shared Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Button,
  Input,
  Textarea,
  Card, CardContent, CardHeader, CardTitle,
  Badge,
  Checkbox,
  RadioGroup, RadioGroupItem,
  Label
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Check, 
  X, 
  AlertCircle,
  Image,
  Type,
  List,
  CheckCircle2
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface BaseOption {
  id: string;
  text: string;
  order: number;
  explanation?: string;
  image?: string;
}

interface MCQOption extends BaseOption {
  isCorrect: boolean;
}

interface CheckboxOption extends BaseOption {
  isCorrect: boolean;
}

interface MatchingOption extends BaseOption {
  pairId?: string;
}

interface OptionEditorProps {
  type: 'mcq' | 'checkbox' | 'matching' | 'custom';
  options: BaseOption[];
  correctAnswers?: string[];
  allowMultipleCorrect?: boolean;
  allowImages?: boolean;
  allowExplanations?: boolean;
  allowReorder?: boolean;
  minOptions?: number;
  maxOptions?: number;
  placeholder?: string;
  onChange: (options: BaseOption[]) => void;
  onCorrectAnswersChange?: (correctAnswers: string[]) => void;
  className?: string;
}

interface OptionItemProps {
  option: BaseOption;
  index: number;
  isCorrect: boolean;
  allowMultipleCorrect: boolean;
  allowImages: boolean;
  allowExplanations: boolean;
  allowReorder: boolean;
  onUpdate: (id: string, updates: Partial<BaseOption>) => void;
  onDelete: (id: string) => void;
  onToggleCorrect: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

// =================================================================
// 🎯 OPTION ITEM COMPONENT
// =================================================================

function OptionItem({
  option,
  index,
  isCorrect,
  allowMultipleCorrect,
  allowImages,
  allowExplanations,
  allowReorder,
  onUpdate,
  onDelete,
  onToggleCorrect,
  onReorder,
}: OptionItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(option.text);
  const [editExplanation, setEditExplanation] = React.useState(option.explanation || '');
  const [showExplanation, setShowExplanation] = React.useState(false);

  const handleSave = () => {
    onUpdate(option.id, {
      text: editText,
      explanation: editExplanation,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(option.text);
    setEditExplanation(option.explanation || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card className={cn(
      'group relative transition-all duration-200',
      isCorrect && 'ring-2 ring-green-200 bg-green-50',
      isEditing && 'ring-2 ring-blue-200 bg-blue-50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Drag Handle */}
          {allowReorder && (
            <div className="flex-shrink-0 mt-1">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            </div>
          )}

          {/* Correct Answer Indicator */}
          <div className="flex-shrink-0 mt-1">
            {allowMultipleCorrect ? (
              <Checkbox
                checked={isCorrect}
                onCheckedChange={() => onToggleCorrect(option.id)}
                className="w-4 h-4"
              />
            ) : (
              <RadioGroupItem
                value={option.id}
                id={option.id}
                checked={isCorrect}
                onClick={() => onToggleCorrect(option.id)}
                className="w-4 h-4"
              />
            )}
          </div>

          {/* Option Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter option text..."
                  className="min-h-[60px]"
                  autoFocus
                />
                
                {allowExplanations && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">
                      Explanation (optional)
                    </Label>
                    <Textarea
                      value={editExplanation}
                      onChange={(e) => setEditExplanation(e.target.value)}
                      placeholder="Add explanation for this option..."
                      className="min-h-[40px]"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="h-8"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div 
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  <p className="text-sm text-gray-900">
                    {option.text || (
                      <span className="text-gray-400 italic">
                        Click to add option text...
                      </span>
                    )}
                  </p>
                </div>
                
                {option.explanation && (
                  <div className="mt-2">
                    <Button
                      onClick={() => setShowExplanation(!showExplanation)}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-gray-600 hover:text-gray-900"
                    >
                      {showExplanation ? 'Hide' : 'Show'} explanation
                    </Button>
                    
                    {showExplanation && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        {option.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {allowImages && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Add image"
              >
                <Image className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={() => onDelete(option.id)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Delete option"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Correct Answer Badge */}
        {isCorrect && (
          <div className="mt-2 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              Correct Answer
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

export default function OptionEditor({
  type,
  options,
  correctAnswers = [],
  allowMultipleCorrect = false,
  allowImages = false,
  allowExplanations = true,
  allowReorder = true,
  minOptions = 2,
  maxOptions = 10,
  placeholder = 'Option text...',
  onChange,
  onCorrectAnswersChange,
  className,
}: OptionEditorProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const canAddMore = options.length < maxOptions;
  const canDeleteMore = options.length > minOptions;
  const correctCount = correctAnswers.length;
  const hasValidOptions = options.every(opt => opt.text.trim().length > 0);

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleAddOption = () => {
    if (!canAddMore) return;
    
    const newOption: BaseOption = {
      id: `option-${Date.now()}-${Math.random()}`,
      text: '',
      order: options.length,
    };
    
    onChange([...options, newOption]);
  };

  const handleUpdateOption = (id: string, updates: Partial<BaseOption>) => {
    const updatedOptions = options.map(option =>
      option.id === id ? { ...option, ...updates } : option
    );
    onChange(updatedOptions);
  };

  const handleDeleteOption = (id: string) => {
    if (!canDeleteMore) return;
    
    const updatedOptions = options.filter(option => option.id !== id);
    onChange(updatedOptions);
    
    // Remove from correct answers if it was correct
    if (correctAnswers.includes(id)) {
      const newCorrectAnswers = correctAnswers.filter(answerId => answerId !== id);
      onCorrectAnswersChange?.(newCorrectAnswers);
    }
  };

  const handleToggleCorrect = (id: string) => {
    let newCorrectAnswers;
    
    if (allowMultipleCorrect) {
      // Toggle for multiple selection
      newCorrectAnswers = correctAnswers.includes(id)
        ? correctAnswers.filter(answerId => answerId !== id)
        : [...correctAnswers, id];
    } else {
      // Single selection
      newCorrectAnswers = correctAnswers.includes(id) ? [] : [id];
    }
    
    onCorrectAnswersChange?.(newCorrectAnswers);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const reorderedOptions = [...options];
    const [removed] = reorderedOptions.splice(fromIndex, 1);
    reorderedOptions.splice(toIndex, 0, removed);
    
    // Update order values
    const updatedOptions = reorderedOptions.map((option, index) => ({
      ...option,
      order: index,
    }));
    
    onChange(updatedOptions);
  };

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderValidationMessage = () => {
    if (!hasValidOptions) {
      return (
        <div className="flex items-center space-x-2 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>Please fill in all option texts</span>
        </div>
      );
    }
    
    if (correctCount === 0) {
      return (
        <div className="flex items-center space-x-2 text-sm text-yellow-600 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>Please mark at least one correct answer</span>
        </div>
      );
    }
    
    return null;
  };

  const renderAddButton = () => {
    if (!canAddMore) return null;
    
    return (
      <Button
        onClick={handleAddOption}
        variant="outline"
        className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Option ({options.length}/{maxOptions})
      </Button>
    );
  };

  const renderInstructions = () => {
    return (
      <div className="text-sm text-gray-600 mb-4">
        <p>
          {allowMultipleCorrect 
            ? '✅ Select multiple correct answers by checking the boxes'
            : '⭕ Select one correct answer by clicking the radio button'
          }
        </p>
        <p className="mt-1">
          Click on option text to edit • {allowReorder && 'Drag to reorder • '}
          Min: {minOptions} • Max: {maxOptions} options
        </p>
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <List className="w-5 h-5" />
          <span>Answer Options</span>
          {correctCount > 0 && (
            <Badge variant="outline" className="ml-2">
              {correctCount} correct
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Instructions */}
        {renderInstructions()}
        
        {/* Validation Messages */}
        {renderValidationMessage()}
        
        {/* Options List */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <OptionItem
              key={option.id}
              option={option}
              index={index}
              isCorrect={correctAnswers.includes(option.id)}
              allowMultipleCorrect={allowMultipleCorrect}
              allowImages={allowImages}
              allowExplanations={allowExplanations}
              allowReorder={allowReorder}
              onUpdate={handleUpdateOption}
              onDelete={handleDeleteOption}
              onToggleCorrect={handleToggleCorrect}
              onReorder={handleReorder}
            />
          ))}
        </div>
        
        {/* Add Option Button */}
        {renderAddButton()}
        
        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
          <span>
            {options.length} option{options.length !== 1 ? 's' : ''} • {correctCount} correct
          </span>
          <span>
            {allowMultipleCorrect ? 'Multiple selection' : 'Single selection'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useOptionEditor(initialOptions: BaseOption[] = [], type: 'mcq' | 'checkbox' = 'mcq') {
  const [options, setOptions] = React.useState<BaseOption[]>(initialOptions);
  const [correctAnswers, setCorrectAnswers] = React.useState<string[]>([]);

  const allowMultipleCorrect = type === 'checkbox';

  const actions = React.useMemo(() => ({
    addOption: (text: string = '') => {
      const newOption: BaseOption = {
        id: `option-${Date.now()}-${Math.random()}`,
        text,
        order: options.length,
      };
      setOptions(prev => [...prev, newOption]);
    },
    
    updateOption: (id: string, updates: Partial<BaseOption>) => {
      setOptions(prev => prev.map(option =>
        option.id === id ? { ...option, ...updates } : option
      ));
    },
    
    deleteOption: (id: string) => {
      setOptions(prev => prev.filter(option => option.id !== id));
      setCorrectAnswers(prev => prev.filter(answerId => answerId !== id));
    },
    
    toggleCorrect: (id: string) => {
      setCorrectAnswers(prev => {
        if (allowMultipleCorrect) {
          return prev.includes(id)
            ? prev.filter(answerId => answerId !== id)
            : [...prev, id];
        } else {
          return prev.includes(id) ? [] : [id];
        }
      });
    },
    
    reorderOptions: (fromIndex: number, toIndex: number) => {
      setOptions(prev => {
        const reordered = [...prev];
        const [removed] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, removed);
        return reordered.map((option, index) => ({ ...option, order: index }));
      });
    },
    
    reset: () => {
      setOptions(initialOptions);
      setCorrectAnswers([]);
    },
  }), [options.length, allowMultipleCorrect, initialOptions]);

  const validation = React.useMemo(() => {
    const hasValidOptions = options.every(opt => opt.text.trim().length > 0);
    const hasCorrectAnswers = correctAnswers.length > 0;
    
    return {
      isValid: hasValidOptions && hasCorrectAnswers,
      hasValidOptions,
      hasCorrectAnswers,
      correctCount: correctAnswers.length,
    };
  }, [options, correctAnswers]);

  return {
    options,
    correctAnswers,
    allowMultipleCorrect,
    validation,
    actions,
    setOptions,
    setCorrectAnswers,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export { 
  OptionItem, 
  useOptionEditor, 
  type OptionEditorProps, 
  type OptionItemProps,
  type BaseOption,
  type MCQOption,
  type CheckboxOption,
  type MatchingOption
}