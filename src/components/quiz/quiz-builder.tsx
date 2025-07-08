// File: src/components/quiz/quiz-builder.tsx

/**
 * =================================================================
 * 🔧 MAIN QUIZ BUILDER COMPONENT - With @dnd-kit
 * =================================================================
 * Main quiz builder that integrates all question builders
 * Created: July 2025
 * Phase: 5 - Main Integration
 * =================================================================
 */

'use client';

import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
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
  FileText,
  CheckSquare2,
  Code,
  Link2,
  Move,
  Edit,
  Copy,
  Settings,
  Clock,
  Trophy,
  Shuffle,
  FileQuestion,
  ChevronUp,
  ChevronDown,
  Play,
  CheckCircle,
  XCircle,
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

// Local Utilities
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
import type { 
  Quiz, 
  QuizQuestion,
  QuizSettings,
  QuizMetadata,
  QuizDifficulty,
  QuestionType,
} from './types';

// Lazy load builders
const MCQBuilder = lazy(() => import('./builder/mcq-builder'));
const TrueFalseBuilder = lazy(() => import('./builder/true-false-builder'));
const EssayBuilder = lazy(() => import('./builder/essay-builder'));
const CheckboxBuilder = lazy(() => import('./builder/checkbox-builder'));
const FillBlankBuilder = lazy(() => import('./builder/fill-blank-builder'));
const MatchingBuilder = lazy(() => import('./builder/matching-builder'));
const DragDropBuilder = lazy(() => import('./builder/drag-drop-builder'));
const CodeInputBuilder = lazy(() => import('./builder/code-input-builder'));

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface QuizBuilderProps {
  initialData?: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
  onPreview?: (quiz: Quiz) => void;
  className?: string;
}

interface QuestionListItemProps {
  question: QuizQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  disabled?: boolean;
}

interface SortableQuestionItemProps extends QuestionListItemProps {
  id: string;
}

interface QuizFormData {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  difficulty: QuizDifficulty;
  timeLimit?: number;
  passingScore: number;
  shuffleQuestions?: boolean;
  showAnswersAfter?: boolean;
  allowRetake?: boolean;
  maxAttempts?: number;
}

interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// =================================================================
// 🎯 CONSTANTS
// =================================================================

const QUESTION_TYPES: QuestionTypeOption[] = [
  {
    value: 'MCQ',
    label: 'Multiple Choice',
    icon: <FileQuestion className="w-4 h-4" />,
    description: 'Single correct answer from multiple options'
  },
  {
    value: 'TRUE_FALSE',
    label: 'True/False',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Simple true or false question'
  },
  {
    value: 'CHECKBOX',
    label: 'Multiple Selection',
    icon: <CheckSquare2 className="w-4 h-4" />,
    description: 'Multiple correct answers'
  },
  {
    value: 'ESSAY',
    label: 'Essay',
    icon: <FileText className="w-4 h-4" />,
    description: 'Long text answer'
  },
  {
    value: 'FILL_BLANK',
    label: 'Fill in the Blank',
    icon: <Edit className="w-4 h-4" />,
    description: 'Complete the sentence'
  },
  {
    value: 'MATCHING',
    label: 'Matching',
    icon: <Link2 className="w-4 h-4" />,
    description: 'Match items from two columns'
  },
  {
    value: 'DRAG_DROP',
    label: 'Drag & Drop',
    icon: <Move className="w-4 h-4" />,
    description: 'Arrange items in correct order or zones'
  },
  {
    value: 'CODE_INPUT',
    label: 'Code Input',
    icon: <Code className="w-4 h-4" />,
    description: 'Programming question with code editor'
  },
];

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateTotalPoints = (questions: QuizQuestion[]): number => {
  return questions.reduce((total, q) => total + (q.points || 1), 0);
};

const getQuestionTypeInfo = (type: QuestionType): QuestionTypeOption => {
  return QUESTION_TYPES.find(t => t.value === type) || QUESTION_TYPES[0];
};

const createEmptyQuiz = (): QuizFormData => ({
  title: '',
  description: '',
  category: '',
  tags: [],
  difficulty: 'MEDIUM',
  timeLimit: undefined,
  passingScore: 70,
  shuffleQuestions: false,
  showAnswersAfter: true,
  allowRetake: true,
  maxAttempts: undefined,
});

// =================================================================
// 🎯 SORTABLE QUESTION ITEM
// =================================================================

function SortableQuestionItem({
  id,
  question,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  disabled = false,
}: SortableQuestionItemProps) {
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

  const typeInfo = getQuestionTypeInfo(question.type);

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

      {/* Question Content */}
      <div className="ml-8 pr-32">
        <div className="flex items-start gap-3">
          {/* Question Number */}
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>

          {/* Question Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {typeInfo.icon}
              <span className="text-sm font-medium text-gray-700">
                {typeInfo.label}
              </span>
              <Badge variant="outline" className="text-xs">
                {question.points || 1} pts
              </Badge>
              {question.difficulty && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    question.difficulty === 'EASY' && "text-green-600 border-green-300",
                    question.difficulty === 'MEDIUM' && "text-yellow-600 border-yellow-300",
                    question.difficulty === 'HARD' && "text-red-600 border-red-300"
                  )}
                >
                  {question.difficulty}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-900 truncate">
              {question.title || question.question || 'Untitled Question'}
            </p>
            
            {question.description && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {question.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          disabled={disabled}
        >
          <Edit className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          disabled={disabled}
        >
          <Copy className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 DRAG OVERLAY QUESTION
// =================================================================

function DragOverlayQuestion({ question, index }: { question: QuizQuestion; index: number }) {
  const typeInfo = getQuestionTypeInfo(question.type);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <div className="flex items-center gap-2">
          {typeInfo.icon}
          <span className="text-sm font-medium">
            {question.title || 'Question'}
          </span>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 QUESTION TYPE SELECTOR
// =================================================================

function QuestionTypeSelector({ 
  onSelect,
  onClose 
}: { 
  onSelect: (type: QuestionType) => void;
  onClose: () => void;
}) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Select Question Type</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-2 gap-4 py-4">
        {QUESTION_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              onSelect(type.value);
              onClose();
            }}
            className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {type.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{type.label}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {type.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </DialogContent>
  );
}

// =================================================================
// 🎯 QUESTION BUILDER WRAPPER
// =================================================================

function QuestionBuilderWrapper({
  type,
  initialData,
  onSave,
  onCancel,
}: {
  type: QuestionType;
  initialData?: QuizQuestion;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
}) {
  const builderProps = {
    initialData,
    onSave,
    onCancel,
    isEditing: !!initialData,
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading question builder...</p>
        </div>
      </div>
    }>
      {type === 'MCQ' && <MCQBuilder {...builderProps} />}
      {type === 'TRUE_FALSE' && <TrueFalseBuilder {...builderProps} />}
      {type === 'ESSAY' && <EssayBuilder {...builderProps} />}
      {type === 'CHECKBOX' && <CheckboxBuilder {...builderProps} />}
      {type === 'FILL_BLANK' && <FillBlankBuilder {...builderProps} />}
      {type === 'MATCHING' && <MatchingBuilder {...builderProps} />}
      {type === 'DRAG_DROP' && <DragDropBuilder {...builderProps} />}
      {type === 'CODE_INPUT' && <CodeInputBuilder {...builderProps} />}
    </Suspense>
  );
}

// =================================================================
// 🎯 MAIN QUIZ BUILDER COMPONENT
// =================================================================

function QuizBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  className
}: QuizBuilderProps) {
  // State Management
  const [formData, setFormData] = useState<QuizFormData>(() => ({
    ...createEmptyQuiz(),
    ...initialData,
  }));
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialData?.questions || []
  );
  const [activeTab, setActiveTab] = useState('settings');
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    index: number;
    question: QuizQuestion;
  } | null>(null);
  const [addingQuestionType, setAddingQuestionType] = useState<QuestionType | null>(null);
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

  // Computed values
  const totalPoints = useMemo(() => calculateTotalPoints(questions), [questions]);
  const isValid = formData.title.trim() && questions.length > 0;

  // Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);
    }
  }, [questions]);

  const handleAddQuestion = (type: QuestionType) => {
    setAddingQuestionType(type);
  };

  const handleSaveNewQuestion = (question: QuizQuestion) => {
    setQuestions([...questions, question]);
    setAddingQuestionType(null);
    toast.success('Question added');
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestion({
      index,
      question: questions[index]
    });
  };

  const handleSaveEditedQuestion = (updatedQuestion: QuizQuestion) => {
    if (editingQuestion) {
      const newQuestions = [...questions];
      newQuestions[editingQuestion.index] = updatedQuestion;
      setQuestions(newQuestions);
      setEditingQuestion(null);
      toast.success('Question updated');
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    toast.success('Question deleted');
  };

  const handleDuplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicated = {
      ...questionToDuplicate,
      id: generateId(),
      title: `${questionToDuplicate.title || 'Question'} (Copy)`,
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    setQuestions(newQuestions);
    toast.success('Question duplicated');
  };

  const handleSaveQuiz = () => {
    if (!isValid) {
      toast.error('Please add a title and at least one question');
      return;
    }

    const quiz: Quiz = {
      id: initialData?.id || generateId(),
      ...formData,
      questions,
      totalPoints,
      metadata: {
        version: '1.0',
        createdAt: initialData?.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: initialData?.metadata?.createdBy || 'current-user',
        lastModifiedBy: 'current-user',
      },
    };

    onSave(quiz);
    toast.success('Quiz saved successfully');
  };

  const handlePreview = () => {
    if (onPreview && isValid) {
      const quiz: Quiz = {
        id: initialData?.id || generateId(),
        ...formData,
        questions,
        totalPoints,
        metadata: {
          version: '1.0',
          createdAt: initialData?.metadata?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: initialData?.metadata?.createdBy || 'current-user',
          lastModifiedBy: 'current-user',
        },
      };
      onPreview(quiz);
    }
  };

  const activeQuestion = activeId 
    ? questions.find(q => q.id === activeId)
    : null;
  const activeIndex = activeId
    ? questions.findIndex(q => q.id === activeId)
    : -1;

  // Render
  return (
    <>
      <Card className={cn("w-full max-w-6xl mx-auto", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {initialData ? 'Edit Quiz' : 'Create New Quiz'}
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-lg font-bold">{totalPoints}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-lg font-bold">{questions.length}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Quiz Settings
              </TabsTrigger>
              <TabsTrigger value="questions">
                <FileQuestion className="w-4 h-4 mr-2" />
                Questions ({questions.length})
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="required">
                    Quiz Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter quiz title..."
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this quiz covers..."
                    rows={3}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Mathematics, Science..."
                  />
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: QuizDifficulty) => 
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">
                    Time Limit (minutes, optional)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min={1}
                    value={formData.timeLimit || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="No time limit"
                  />
                </div>

                {/* Passing Score */}
                <div className="space-y-2">
                  <Label htmlFor="passingScore">
                    Passing Score (%)
                  </Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      passingScore: parseInt(e.target.value) || 70 
                    })}
                  />
                </div>
              </div>

              <Separator />

              {/* Quiz Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Quiz Options</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                      <p className="text-xs text-gray-500">
                        Randomize question order for each attempt
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        shuffleQuestions: e.target.checked 
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showAnswersAfter">Show Answers After</Label>
                      <p className="text-xs text-gray-500">
                        Display correct answers after submission
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="showAnswersAfter"
                      checked={formData.showAnswersAfter}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        showAnswersAfter: e.target.checked 
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowRetake">Allow Retake</Label>
                      <p className="text-xs text-gray-500">
                        Users can attempt the quiz multiple times
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="allowRetake"
                      checked={formData.allowRetake}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        allowRetake: e.target.checked 
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {formData.allowRetake && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="maxAttempts">
                        Max Attempts (optional)
                      </Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        min={1}
                        value={formData.maxAttempts || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxAttempts: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Unlimited attempts"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Start building your quiz by adding questions
                  </p>
                  <Button
                    onClick={() => setShowQuestionSelector(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Questions</h3>
                    <Button
                      onClick={() => setShowQuestionSelector(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={questions.map(q => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <SortableQuestionItem
                            key={question.id}
                            id={question.id}
                            question={question}
                            index={index}
                            onEdit={() => handleEditQuestion(index)}
                            onDelete={() => handleDeleteQuestion(index)}
                            onDuplicate={() => handleDuplicateQuestion(index)}
                            disabled={false}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={dropAnimationConfig}>
                      {activeId && activeQuestion && activeIndex !== -1 ? (
                        <DragOverlayQuestion 
                          question={activeQuestion} 
                          index={activeIndex} 
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!isValid}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Quiz
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
                onClick={handleSaveQuiz}
                disabled={!isValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {initialData ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Type Selector Dialog */}
      <Dialog open={showQuestionSelector} onOpenChange={setShowQuestionSelector}>
        <QuestionTypeSelector
          onSelect={handleAddQuestion}
          onClose={() => setShowQuestionSelector(false)}
        />
      </Dialog>

      {/* Add Question Dialog */}
      {addingQuestionType && (
        <Dialog open={true} onOpenChange={() => setAddingQuestionType(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <QuestionBuilderWrapper
              type={addingQuestionType}
              onSave={handleSaveNewQuestion}
              onCancel={() => setAddingQuestionType(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={true} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <QuestionBuilderWrapper
              type={editingQuestion.question.type}
              initialData={editingQuestion.question}
              onSave={handleSaveEditedQuestion}
              onCancel={() => setEditingQuestion(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Component Display Name
QuizBuilder.displayName = 'QuizBuilder';

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default QuizBuilder;
export { 
  QuestionTypeSelector,
  QuestionBuilderWrapper,
  SortableQuestionItem,
  generateId,
  calculateTotalPoints,
  getQuestionTypeInfo,
  createEmptyQuiz,
  QUESTION_TYPES,
  type QuizBuilderProps
};