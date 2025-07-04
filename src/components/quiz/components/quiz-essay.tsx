// File: src/components/quiz/components/quiz-essay.tsx

/**
 * =================================================================
 * 📝 QUIZ ESSAY COMPONENT
 * =================================================================
 * Essay Question renderer dengan rich text editing dan word count
 * Created: July 2025
 * Phase: 3 - Quiz Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Button,
  Card, CardContent, CardHeader, CardTitle,
  Badge,
  Textarea,
  Progress,
  Alert, AlertDescription
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Save,
  RotateCcw,
  Lightbulb,
  Target
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// ✅ FIXED: Quiz types
import type { 
  EssayQuestion, 
  EssayAnswer, 
  QuestionComponentProps 
} from '../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizEssayProps extends QuestionComponentProps<EssayQuestion> {
  onTextChange?: (text: string) => void;
  showExplanation?: boolean;
  showSampleAnswer?: boolean;
  timeLeft?: number;
  isSubmitted?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

interface WordCountDisplayProps {
  current: number;
  min?: number;
  max?: number;
  className?: string;
}

// =================================================================
// 🎯 WORD COUNT DISPLAY COMPONENT
// =================================================================

function WordCountDisplay({ current, min, max, className }: WordCountDisplayProps) {
  const getStatus = () => {
    if (min && current < min) return 'under';
    if (max && current > max) return 'over';
    return 'good';
  };

  const getProgress = () => {
    if (!min && !max) return 100;
    if (min && max) {
      return Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100));
    }
    if (min) {
      return Math.min(100, (current / min) * 100);
    }
    if (max) {
      return (current / max) * 100;
    }
    return 100;
  };

  const status = getStatus();
  const progress = getProgress();

  const getStatusColor = () => {
    switch (status) {
      case 'under': return 'text-orange-600';
      case 'over': return 'text-red-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'under': return 'bg-orange-500';
      case 'over': return 'bg-red-500';
      case 'good': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Word Count</span>
        <span className={cn('font-medium', getStatusColor())}>
          {current}
          {(min || max) && (
            <span className="text-gray-400 ml-1">
              / {min && max ? `${min}-${max}` : min ? `min ${min}` : `max ${max}`}
            </span>
          )}
        </span>
      </div>

      {(min || max) && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn('h-2 rounded-full transition-all duration-300', getProgressColor())}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}

      {status === 'under' && min && (
        <div className="text-xs text-orange-600">
          Need {min - current} more words to meet minimum requirement
        </div>
      )}

      {status === 'over' && max && (
        <div className="text-xs text-red-600">
          {current - max} words over the maximum limit
        </div>
      )}
    </div>
  );
}

// =================================================================
// 🎯 MAIN ESSAY COMPONENT
// =================================================================

function QuizEssay({
  question,
  answer,
  onChange,
  readonly = false,
  showExplanation = false,
  showSampleAnswer = false,
  timeLeft,
  isSubmitted = false,
  autoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  onTextChange,
  className,
}: QuizEssayProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================

  const [text, setText] = React.useState<string>(
    answer?.questionType === 'ESSAY' ? answer.text : ''
  );
  const [wordCount, setWordCount] = React.useState(0);
  const [charCount, setCharCount] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();

  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const countWords = React.useCallback((text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }, []);

  const isValidLength = React.useMemo(() => {
    const { minWords, maxWords } = question;
    if (minWords && wordCount < minWords) return false;
    if (maxWords && wordCount > maxWords) return false;
    return true;
  }, [wordCount, question.minWords, question.maxWords]);

  const hasContent = text.trim().length > 0;

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const updateCounts = React.useCallback((newText: string) => {
    setWordCount(countWords(newText));
    setCharCount(newText.length);
  }, [countWords]);

  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readonly || isSubmitted) return;

    const newText = e.target.value;
    setText(newText);
    updateCounts(newText);
    setHasUnsavedChanges(true);
    onTextChange?.(newText);

    // Auto-save logic
    if (autoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave(newText);
      }, autoSaveInterval);
    }
  }, [readonly, isSubmitted, updateCounts, onTextChange, autoSave, autoSaveInterval]);

  const handleSave = React.useCallback(async (textToSave = text) => {
    setIsSaving(true);
    setHasUnsavedChanges(false);

    // Create answer object
    const newAnswer: EssayAnswer = {
      id: `answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'ESSAY',
      text: textToSave,
      wordCount: countWords(textToSave),
      isCorrect: true, // Essays are typically manually graded
      points: 0, // Will be set by manual grading
      maxPoints: question.points,
      timeSpent: 0, // Should be calculated by parent
      submittedAt: new Date(),
    };

    onChange(newAnswer);
    setLastSaved(new Date());
    setIsSaving(false);
  }, [text, question, countWords, onChange]);

  const handleClear = React.useCallback(() => {
    if (readonly || isSubmitted) return;

    setText('');
    updateCounts('');
    setHasUnsavedChanges(true);
    onTextChange?.('');

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [readonly, isSubmitted, updateCounts, onTextChange]);

  // =================================================================
  // ⚡ EFFECTS
  // =================================================================

  // Initialize counts
  React.useEffect(() => {
    updateCounts(text);
  }, [text, updateCounts]);

  // Cleanup auto-save timeout
  React.useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderQuestionHeader = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <Badge variant="outline" className="text-xs">
              ESSAY
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.points} pts
            </Badge>
            {question.autoGrade && (
              <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                Auto-Grade
              </Badge>
            )}
          </div>

          {timeLeft !== undefined && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        <div className="text-lg font-medium text-gray-900">
          {question.title}
        </div>

        {question.description && (
          <div className="text-sm text-gray-600">
            {question.description}
          </div>
        )}

        {question.image && (
          <div className="mt-4">
            <img
              src={question.image}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>
    );
  };

  const renderWritingGuidelines = () => {
    const guidelines = [];
    
    if (question.minWords) guidelines.push(`Minimum ${question.minWords} words`);
    if (question.maxWords) guidelines.push(`Maximum ${question.maxWords} words`);
    if (question.gradingRubric) guidelines.push('Will be graded based on rubric');

    if (guidelines.length === 0) return null;

    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Target className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">Writing Guidelines</div>
          <AlertDescription className="text-sm text-blue-700 mt-1">
            <ul className="list-disc list-inside space-y-1">
              {guidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ul>
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderTextEditor = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <div className="flex items-center space-x-2">
              {!readonly && !isSubmitted && (
                <>
                  <Button
                    onClick={() => handleSave()}
                    disabled={isSaving || !hasContent}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  
                  <Button
                    onClick={handleClear}
                    disabled={!hasContent}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>

          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Write your answer here..."
            className={cn(
              'min-h-[200px] resize-y',
              !isValidLength && hasContent && 'border-orange-300',
              readonly && 'bg-gray-50'
            )}
            disabled={readonly || isSubmitted}
          />
        </div>

        {/* Word Count Display */}
        <WordCountDisplay
          current={wordCount}
          min={question.minWords}
          max={question.maxWords}
        />

        {/* Save Status */}
        {(lastSaved || hasUnsavedChanges) && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              {hasUnsavedChanges ? (
                <>
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <span>Unsaved changes</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>
                    Saved {lastSaved ? `at ${lastSaved.toLocaleTimeString()}` : ''}
                  </span>
                </>
              )}
            </div>
            <div>{charCount} characters</div>
          </div>
        )}
      </div>
    );
  };

  const renderSampleAnswer = () => {
    if (!showSampleAnswer || !question.sampleAnswer) return null;

    return (
      <Alert className="mt-4 border-green-200 bg-green-50">
        <Eye className="w-4 h-4 text-green-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-green-800">Sample Answer</div>
          <AlertDescription className="text-sm text-green-700 mt-2 whitespace-pre-wrap">
            {question.sampleAnswer}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderGradingRubric = () => {
    if (!showExplanation || !question.gradingRubric) return null;

    return (
      <Alert className="mt-4 border-purple-200 bg-purple-50">
        <Target className="w-4 h-4 text-purple-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-purple-800">Grading Rubric</div>
          <AlertDescription className="text-sm text-purple-700 mt-2 whitespace-pre-wrap">
            {question.gradingRubric}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderExplanation = () => {
    if (!showExplanation || !question.explanation) return null;

    return (
      <Alert className="mt-4 border-blue-200 bg-blue-50">
        <Lightbulb className="w-4 h-4 text-blue-600" />
        <div className="ml-2">
          <div className="font-medium text-sm text-blue-800">Additional Information</div>
          <AlertDescription className="text-sm text-blue-700 mt-1">
            {question.explanation}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  const renderRequiredIndicator = () => {
    if (!question.required) return null;

    return (
      <div className="flex items-center space-x-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>Required</span>
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-base">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Essay Question</span>
            </span>
            {renderRequiredIndicator()}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Header */}
        {renderQuestionHeader()}

        {/* Writing Guidelines */}
        {renderWritingGuidelines()}

        {/* Text Editor */}
        {renderTextEditor()}

        {/* Sample Answer */}
        {renderSampleAnswer()}

        {/* Grading Rubric */}
        {renderGradingRubric()}

        {/* General Explanation */}
        {renderExplanation()}

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <div>Word Count: {wordCount}</div>
            <div>Character Count: {charCount}</div>
            <div>Valid Length: {isValidLength ? 'Yes' : 'No'}</div>
            <div>Has Content: {hasContent ? 'Yes' : 'No'}</div>
            <div>Has Unsaved Changes: {hasUnsavedChanges ? 'Yes' : 'No'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useEssayLogic(question: EssayQuestion) {
  const [text, setText] = React.useState('');
  const [timeSpent, setTimeSpent] = React.useState(0);
  const [startTime] = React.useState(Date.now());

  const countWords = React.useCallback((text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }, []);

  const wordCount = countWords(text);
  const charCount = text.length;
  const hasContent = text.trim().length > 0;

  const isValidLength = React.useMemo(() => {
    const { minWords, maxWords } = question;
    if (minWords && wordCount < minWords) return false;
    if (maxWords && wordCount > maxWords) return false;
    return true;
  }, [wordCount, question.minWords, question.maxWords]);

  const updateText = React.useCallback((newText: string) => {
    setText(newText);
    setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
  }, [startTime]);

  const getAnswer = React.useCallback((): EssayAnswer => {
    return {
      id: `essay-answer-${Date.now()}`,
      questionId: question.id,
      questionType: 'ESSAY',
      text,
      wordCount,
      isCorrect: true, // Essays are typically manually graded
      points: 0, // Will be set by manual grading
      maxPoints: question.points,
      timeSpent,
      submittedAt: new Date(),
    };
  }, [question, text, wordCount, timeSpent]);

  const reset = React.useCallback(() => {
    setText('');
    setTimeSpent(0);
  }, []);

  return {
    text,
    wordCount,
    charCount,
    hasContent,
    isValidLength,
    timeSpent,
    updateText,
    getAnswer,
    reset,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuizEssay
export { 
  WordCountDisplay, 
  useEssayLogic, 
  type QuizEssayProps, 
  type WordCountDisplayProps 
}