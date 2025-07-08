// File: src/components/quiz/components/quiz-checkbox.tsx

/**
 * =================================================================
 * ☑️ QUIZ CHECKBOX COMPONENT
 * =================================================================
 * Multiple Selection Question renderer dengan validation & feedback
 * Created: July 2025
 * Phase: 3 - Quiz Components
 * Following Arctic Siberia Export Standard
 * =================================================================
 */

'use client';

// ✅ CATEGORY 1: Framework & Core Imports
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ✅ CATEGORY 2: UI Components - BARREL IMPORT dengan comment sesuai standard
// ✅ FIXED: Menggunakan barrel imports dari index.ts
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Progress,
  Separator
} from '@/components/ui';

// ✅ CATEGORY 4: Icons - grouped together
import { 
  AlertTriangle,
  CheckCircle2, 
  CheckSquare, 
  Eye,
  EyeOff,
  RotateCcw, 
  Shuffle,
  Square, 
  Target,
  XCircle
} from 'lucide-react';

// ✅ CATEGORY 5: External Libraries
import { toast } from 'sonner';

// ✅ CATEGORY 6: Local Utilities & Types
import { cn } from '@/lib/utils';
import type { 
  CheckboxQuestion, 
  CheckboxOption,
  QuizAnswer
} from '../types';

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface QuizCheckboxProps {
  question: CheckboxQuestion;
  questionIndex?: number;
  totalQuestions?: number;
  value?: string[];
  onChange: (value: string[]) => void;
  onSubmit?: (answer: QuizAnswer) => void;
  isSubmitted?: boolean;
  showCorrect?: boolean;
  showExplanation?: boolean;
  timeLimit?: number;
  className?: string;
  readonly?: boolean;
}

interface CheckboxOptionItemProps {
  option: CheckboxOption;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  showFeedback?: boolean;
  onToggle: (optionId: string) => void;
  disabled?: boolean;
  className?: string;
}

interface SelectionStats {
  selected: number;
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const validateSelection = (
  selectedIds: string[], 
  question: CheckboxQuestion
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check minimum selections
  if (question.minSelections && selectedIds.length < question.minSelections) {
    errors.push(`You must select at least ${question.minSelections} option${question.minSelections !== 1 ? 's' : ''}`);
  }
  
  // Check maximum selections
  if (question.maxSelections && selectedIds.length > question.maxSelections) {
    errors.push(`You can select maximum ${question.maxSelections} option${question.maxSelections !== 1 ? 's' : ''}`);
  }

  // Check if no selections
  if (selectedIds.length === 0) {
    errors.push('You must select at least one option');
  }

  // Warning for many selections
  if (selectedIds.length > Math.ceil(question.options.length / 2)) {
    warnings.push('You have selected many options. Please review your choices.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const calculateScore = (
  selectedIds: string[], 
  question: CheckboxQuestion
): SelectionStats => {
  const correctOptions = question.options.filter(opt => opt.isCorrect);
  const correctIds = correctOptions.map(opt => opt.id);
  
  const correctSelected = selectedIds.filter(id => correctIds.includes(id));
  const incorrectSelected = selectedIds.filter(id => !correctIds.includes(id));
  
  const correct = correctSelected.length;
  const incorrect = incorrectSelected.length;
  const total = selectedIds.length;
  
  // Calculate percentage (partial credit)
  const maxCorrect = correctIds.length;
  const penalty = incorrect; // Penalty for wrong selections
  const score = Math.max(0, correct - penalty);
  const percentage = maxCorrect > 0 ? Math.round((score / maxCorrect) * 100) : 0;

  return {
    selected: total,
    total: question.options.length,
    correct,
    incorrect,
    percentage
  };
};

// =================================================================
// 🎯 CHECKBOX OPTION ITEM COMPONENT
// =================================================================

function CheckboxOptionItem({
  option,
  index,
  isSelected,
  isCorrect = false,
  showFeedback = false,
  onToggle,
  disabled = false,
  className
}: CheckboxOptionItemProps) {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(option.id);
    }
  };

  const getOptionStatus = () => {
    if (!showFeedback) {
      return isSelected ? 'selected' : 'unselected';
    }

    if (isSelected && isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    if (!isSelected && isCorrect) return 'missed';
    return 'unselected';
  };

  const status = getOptionStatus();
  
  const statusStyles = {
    selected: 'border-blue-200 bg-blue-50',
    unselected: 'border-gray-200 bg-white hover:border-gray-300',
    correct: 'border-green-200 bg-green-50',
    incorrect: 'border-red-200 bg-red-50',
    missed: 'border-orange-200 bg-orange-50'
  };

  const iconStyles = {
    selected: 'text-blue-600',
    unselected: 'text-gray-400',
    correct: 'text-green-600',
    incorrect: 'text-red-600',
    missed: 'text-orange-600'
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 cursor-pointer transition-all duration-200',
        statusStyles[status],
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      onClick={handleToggle}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox
            checked={isSelected}
            onChange={handleToggle}
            disabled={disabled}
            className={iconStyles[status]}
          />
        </div>

        {/* Option Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {String.fromCharCode(65 + index)}) {option.text}
              </p>
              
              {/* Explanation (if available and feedback shown) */}
              {showFeedback && option.explanation && (
                <p className="text-xs text-gray-600 mt-2 pl-4 border-l-2 border-gray-200">
                  {option.explanation}
                </p>
              )}
            </div>

            {/* Status Icon */}
            {showFeedback && (
              <div className="flex-shrink-0 ml-2">
                {status === 'correct' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {status === 'incorrect' && <XCircle className="w-4 h-4 text-red-600" />}
                {status === 'missed' && <Target className="w-4 h-4 text-orange-600" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN QUIZ CHECKBOX COMPONENT
// =================================================================

function QuizCheckbox({
  question,
  questionIndex = 0,
  totalQuestions = 1,
  value = [],
  onChange,
  onSubmit,
  isSubmitted = false,
  showCorrect = false,
  showExplanation = false,
  timeLimit,
  className,
  readonly = false
}: QuizCheckboxProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value);
  const [showFeedback, setShowFeedback] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setSelectedOptions(value);
  }, [value]);

  // Show feedback when submitted or showCorrect is true
  useEffect(() => {
    if (isSubmitted || showCorrect) {
      setShowFeedback(true);
    }
  }, [isSubmitted, showCorrect]);

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================

  const options = useMemo(() => {
    return question.shuffleOptions ? shuffleArray(question.options) : question.options;
  }, [question.options, question.shuffleOptions]);

  const validation = useMemo(() => {
    return validateSelection(selectedOptions, question);
  }, [selectedOptions, question]);

  const stats = useMemo(() => {
    return calculateScore(selectedOptions, question);
  }, [selectedOptions, question]);

  const correctOptionIds = useMemo(() => {
    return question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
  }, [question.options]);

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleOptionToggle = useCallback((optionId: string) => {
    if (readonly || isSubmitted) return;

    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];

    setSelectedOptions(newSelected);
    onChange(newSelected);
  }, [selectedOptions, onChange, readonly, isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (!onSubmit || !validation.isValid) return;

    const answer: QuizAnswer = {
      id: `answer_${Date.now()}`,
      questionId: question.id,
      value: selectedOptions,
      submittedAt: new Date()
    };

    onSubmit(answer);
    setShowFeedback(true);
    toast.success('Answer submitted successfully!');
  }, [onSubmit, validation.isValid, question.id, selectedOptions]);

  const handleReset = useCallback(() => {
    if (readonly || isSubmitted) return;
    
    setSelectedOptions([]);
    onChange([]);
    setShowFeedback(false);
    toast.info('Selection cleared');
  }, [onChange, readonly, isSubmitted]);

  // =================================================================
  // 🎨 RENDER HELPERS
  // =================================================================

  const renderQuestionHeader = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline">Multiple Selection</Badge>
        {timeLimit && (
          <Badge variant="outline" className="text-orange-600">
            Time: {timeLimit}s
          </Badge>
        )}
      </div>
      
      <h3 className="text-lg font-semibold">{question.title}</h3>
      
      {question.description && (
        <p className="text-gray-600 text-sm">{question.description}</p>
      )}

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>Select all that apply</span>
        {question.minSelections && (
          <span>• Min: {question.minSelections}</span>
        )}
        {question.maxSelections && (
          <span>• Max: {question.maxSelections}</span>
        )}
      </div>
    </div>
  );

  const renderOptions = () => (
    <div className="space-y-3">
      {options.map((option, index) => (
        <CheckboxOptionItem
          key={option.id}
          option={option}
          index={index}
          isSelected={selectedOptions.includes(option.id)}
          isCorrect={correctOptionIds.includes(option.id)}
          showFeedback={showFeedback}
          onToggle={handleOptionToggle}
          disabled={readonly || isSubmitted}
        />
      ))}
    </div>
  );

  const renderValidation = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {validation.errors.map((error, index) => (
          <Alert key={index} variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ))}
        
        {validation.warnings.map((warning, index) => (
          <Alert key={index}>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  const renderStats = () => {
    if (!showFeedback) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3">Selection Results</h4>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">{stats.selected}</div>
            <div className="text-xs text-gray-600">Selected</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{stats.correct}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">{stats.incorrect}</div>
            <div className="text-xs text-gray-600">Incorrect</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">{stats.percentage}%</div>
            <div className="text-xs text-gray-600">Score</div>
          </div>
        </div>
        <Progress value={stats.percentage} className="mt-3" />
      </div>
    );
  };

  const renderExplanation = () => {
    if (!showExplanation || !question.explanation || !showFeedback) {
      return null;
    }

    return (
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle2 className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">Explanation</div>
          <AlertDescription className="text-sm text-blue-700 mt-1">
            {question.explanation}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderControls = () => {
    if (readonly || isSubmitted) return null;

    return (
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={selectedOptions.length === 0}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
          
          <span className="text-sm text-gray-500">
            {selectedOptions.length} selected
          </span>
        </div>

        {onSubmit && (
          <Button 
            onClick={handleSubmit}
            disabled={!validation.isValid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Answer
          </Button>
        )}
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Question {questionIndex + 1}</span>
          <div className="flex items-center space-x-2">
            {showFeedback && (
              <Badge variant={stats.percentage >= 60 ? "default" : "destructive"}>
                {stats.percentage}% Score
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Header */}
        {renderQuestionHeader()}

        {/* Options */}
        {renderOptions()}

        {/* Validation Messages */}
        {renderValidation()}

        {/* Statistics */}
        {renderStats()}

        {/* Controls */}
        {renderControls()}

        {/* Explanation */}
        {renderExplanation()}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 COMPONENT DISPLAY NAME
// =================================================================

QuizCheckbox.displayName = 'QuizCheckbox';

// =================================================================
// 🎯 ARCTIC SIBERIA EXPORT STANDARD COMPLIANCE
// =================================================================

// ✅ Main Component - Default Export
export default QuizCheckbox;

// ✅ Sub-components & Utilities - Named Exports
export { 
  CheckboxOptionItem,
  shuffleArray,
  validateSelection,
  calculateScore,
  type QuizCheckboxProps,
  type CheckboxOptionItemProps,
  type SelectionStats,
  type ValidationResult
};