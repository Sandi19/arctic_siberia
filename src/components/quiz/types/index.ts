// File: src/components/quiz/types/index.ts

/**
 * =================================================================
 * 🧩 QUIZ TYPES DEFINITION
 * =================================================================
 * Complete TypeScript interfaces for Arctic Siberia Quiz System
 * Created: July 2025
 * Phase: 1 - Foundation & Types
 * =================================================================
 */

// =================================================================
// 🎯 CORE QUIZ TYPES
// =================================================================

/**
 * Quiz Question Types
 */
export type QuestionType = 
  | 'MCQ'           // Multiple Choice Question
  | 'TRUE_FALSE'    // True/False Question
  | 'ESSAY'         // Essay Question
  | 'CHECKBOX'      // Multiple Selection (Checkbox)
  | 'FILL_BLANK'    // Fill in the Blank
  | 'MATCHING'      // Matching Question
  | 'DRAG_DROP'     // Drag & Drop Question
  | 'CODE_INPUT';   // Code Input Question

/**
 * Quiz Difficulty Levels
 */
export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

/**
 * Quiz Status
 */
export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * Quiz Mode
 */
export type QuizMode = 'PRACTICE' | 'ASSESSMENT' | 'EXAM';

// =================================================================
// 🎯 QUESTION INTERFACES
// =================================================================

/**
 * Base Question Interface
 */
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  points: number;
  difficulty: QuizDifficulty;
  order: number;
  required: boolean;
  timeLimit?: number; // in seconds
  explanation?: string;
  image?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Multiple Choice Question
 */
export interface MCQQuestion extends BaseQuestion {
  type: 'MCQ';
  options: MCQOption[];
  correctAnswerId: string;
  shuffleOptions?: boolean;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  order: number;
}

/**
 * True/False Question
 */
export interface TrueFalseQuestion extends BaseQuestion {
  type: 'TRUE_FALSE';
  correctAnswer: boolean;
  trueExplanation?: string;
  falseExplanation?: string;
}

/**
 * Essay Question
 */
export interface EssayQuestion extends BaseQuestion {
  type: 'ESSAY';
  minWords?: number;
  maxWords?: number;
  sampleAnswer?: string;
  gradingRubric?: string;
  autoGrade?: boolean;
}

/**
 * Checkbox Question (Multiple Selection)
 */
export interface CheckboxQuestion extends BaseQuestion {
  type: 'CHECKBOX';
  options: CheckboxOption[];
  minSelections?: number;
  maxSelections?: number;
  shuffleOptions?: boolean;
}

export interface CheckboxOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  order: number;
}

/**
 * Fill in the Blank Question
 */
export interface FillBlankQuestion extends BaseQuestion {
  type: 'FILL_BLANK';
  template: string; // Text with {blank} placeholders
  blanks: FillBlankItem[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface FillBlankItem {
  id: string;
  position: number;
  correctAnswers: string[]; // Multiple acceptable answers
  placeholder?: string;
  explanation?: string;
}

/**
 * Matching Question
 */
export interface MatchingQuestion extends BaseQuestion {
  type: 'MATCHING';
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  pairs: MatchingPair[];
  shuffleItems?: boolean;
}

export interface MatchingItem {
  id: string;
  text: string;
  image?: string;
  order: number;
}

export interface MatchingPair {
  leftId: string;
  rightId: string;
  explanation?: string;
}

/**
 * Drag & Drop Question
 */
export interface DragDropQuestion extends BaseQuestion {
  type: 'DRAG_DROP';
  items: DragDropItem[];
  dropZones: DropZone[];
  correctPlacements: DragDropPlacement[];
  allowMultipleItems?: boolean;
}

export interface DragDropItem {
  id: string;
  text: string;
  image?: string;
  category?: string;
  order: number;
}

export interface DropZone {
  id: string;
  label: string;
  category?: string;
  maxItems?: number;
  order: number;
}

export interface DragDropPlacement {
  itemId: string;
  dropZoneId: string;
  explanation?: string;
}

/**
 * Code Input Question
 */
export interface CodeInputQuestion extends BaseQuestion {
  type: 'CODE_INPUT';
  language: string; // e.g., 'javascript', 'python', 'java'
  starterCode?: string;
  expectedOutput?: string;
  testCases?: CodeTestCase[];
  allowedLanguages?: string[];
}

export interface CodeTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden?: boolean;
  points?: number;
}

// =================================================================
// 🎯 QUIZ INTERFACES
// =================================================================

/**
 * Quiz Configuration
 */
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  status: QuizStatus;
  mode: QuizMode;
  timeLimit?: number; // in minutes
  attempts: number;
  passingScore?: number; // percentage
  shuffleQuestions?: boolean;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
  questions: QuizQuestion[];
  totalPoints: number;
  estimatedDuration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/**
 * Union type for all question types
 */
export type QuizQuestion = 
  | MCQQuestion
  | TrueFalseQuestion
  | EssayQuestion
  | CheckboxQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | DragDropQuestion
  | CodeInputQuestion;

// =================================================================
// 🎯 QUIZ ATTEMPT & RESULT INTERFACES
// =================================================================

/**
 * Quiz Attempt
 */
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: QuizAnswer[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  attemptNumber: number;
}

/**
 * Quiz Answer (Union type)
 */
export type QuizAnswer = 
  | MCQAnswer
  | TrueFalseAnswer
  | EssayAnswer
  | CheckboxAnswer
  | FillBlankAnswer
  | MatchingAnswer
  | DragDropAnswer
  | CodeInputAnswer;

/**
 * Base Answer Interface
 */
export interface BaseAnswer {
  id: string;
  questionId: string;
  questionType: QuestionType;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  timeSpent: number;
  submittedAt: Date;
}

/**
 * Specific Answer Types
 */
export interface MCQAnswer extends BaseAnswer {
  questionType: 'MCQ';
  selectedOptionId: string;
}

export interface TrueFalseAnswer extends BaseAnswer {
  questionType: 'TRUE_FALSE';
  selectedAnswer: boolean;
}

export interface EssayAnswer extends BaseAnswer {
  questionType: 'ESSAY';
  text: string;
  wordCount: number;
  autoGradeScore?: number;
  manualGradeScore?: number;
  feedback?: string;
}

export interface CheckboxAnswer extends BaseAnswer {
  questionType: 'CHECKBOX';
  selectedOptionIds: string[];
}

export interface FillBlankAnswer extends BaseAnswer {
  questionType: 'FILL_BLANK';
  answers: { [blankId: string]: string };
}

export interface MatchingAnswer extends BaseAnswer {
  questionType: 'MATCHING';
  pairs: { leftId: string; rightId: string }[];
}

export interface DragDropAnswer extends BaseAnswer {
  questionType: 'DRAG_DROP';
  placements: { itemId: string; dropZoneId: string }[];
}

export interface CodeInputAnswer extends BaseAnswer {
  questionType: 'CODE_INPUT';
  code: string;
  language: string;
  testResults?: CodeTestResult[];
}

export interface CodeTestResult {
  testCaseId: string;
  passed: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

// =================================================================
// 🎯 QUIZ RESULT & ANALYTICS
// =================================================================

/**
 * Quiz Result Summary
 */
export interface QuizResult {
  attemptId: string;
  quiz: Quiz;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: Date;
  questionResults: QuestionResult[];
  analytics: QuizAnalytics;
}

/**
 * Question Result
 */
export interface QuestionResult {
  questionId: string;
  question: QuizQuestion;
  answer: QuizAnswer;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  timeSpent: number;
  difficulty: QuizDifficulty;
}

/**
 * Quiz Analytics
 */
export interface QuizAnalytics {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  averageTimePerQuestion: number;
  strongAreas: string[];
  weakAreas: string[];
  difficultyBreakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

// =================================================================
// 🎯 QUIZ BUILDER INTERFACES
// =================================================================

/**
 * Quiz Builder State
 */
export interface QuizBuilderState {
  quiz: Partial<Quiz>;
  currentQuestion?: QuizQuestion;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: ValidationError[];
}

/**
 * Quiz Builder Actions
 */
export interface QuizBuilderActions {
  updateQuiz: (updates: Partial<Quiz>) => void;
  addQuestion: (question: QuizQuestion) => void;
  updateQuestion: (questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (questions: QuizQuestion[]) => void;
  setCurrentQuestion: (question: QuizQuestion | undefined) => void;
  saveQuiz: () => Promise<void>;
  publishQuiz: () => Promise<void>;
  previewQuiz: () => void;
  validateQuiz: () => ValidationError[];
}

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'min' | 'max' | 'custom';
}

// =================================================================
// 🎯 QUIZ COMPONENT PROPS
// =================================================================

/**
 * Quiz Renderer Props
 */
export interface QuizRendererProps {
  quiz: Quiz;
  mode: 'PRACTICE' | 'ASSESSMENT' | 'PREVIEW';
  onComplete: (result: QuizResult) => void;
  onSave?: (attempt: Partial<QuizAttempt>) => void;
  className?: string;
}

/**
 * Quiz Builder Props
 */
export interface QuizBuilderProps {
  initialQuiz?: Partial<Quiz>;
  onSave: (quiz: Quiz) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

/**
 * Question Component Props
 */
export interface QuestionComponentProps<T extends QuizQuestion = QuizQuestion> {
  question: T;
  answer?: QuizAnswer;
  onChange: (answer: QuizAnswer) => void;
  readonly?: boolean;
  showExplanation?: boolean;
  className?: string;
}

/**
 * Question Builder Props
 */
export interface QuestionBuilderProps<T extends QuizQuestion = QuizQuestion> {
  question?: T;
  onSave: (question: T) => void;
  onCancel?: () => void;
  className?: string;
}

// =================================================================
// 🎯 QUIZ HOOKS INTERFACES
// =================================================================

/**
 * Quiz Timer Hook
 */
export interface UseQuizTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  autoStart?: boolean;
}

export interface UseQuizTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * Quiz Progress Hook
 */
export interface UseQuizProgressProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: QuizAnswer[];
}

export interface UseQuizProgressReturn {
  progress: number;
  completed: number;
  remaining: number;
  percentage: number;
  isComplete: boolean;
}

// =================================================================
// 🎯 UTILITY TYPES
// =================================================================

/**
 * Quiz Creation Payload
 */
export type CreateQuizPayload = Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;

/**
 * Quiz Update Payload
 */
export type UpdateQuizPayload = Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Question Creation Payload
 */
export type CreateQuestionPayload<T extends QuizQuestion = QuizQuestion> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Question Update Payload
 */
export type UpdateQuestionPayload<T extends QuizQuestion = QuizQuestion> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Quiz Settings
 */
export interface QuizSettings {
  allowRetake: boolean;
  maxAttempts: number;
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  passingScore: number;
}

/**
 * Quiz Statistics
 */
export interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionAnalytics: {
    questionId: string;
    correctRate: number;
    averageTimeSpent: number;
    skipRate: number;
  }[];
}

// =================================================================
// 🎯 CONSTANTS
// =================================================================

/**
 * Available question types
 */
export const QUESTION_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice', icon: '⭕' },
  { value: 'TRUE_FALSE', label: 'True/False', icon: '✅' },
  { value: 'ESSAY', label: 'Essay', icon: '📝' },
  { value: 'CHECKBOX', label: 'Multiple Selection', icon: '☑️' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank', icon: '⬜' },
  { value: 'MATCHING', label: 'Matching', icon: '🔗' },
  { value: 'DRAG_DROP', label: 'Drag & Drop', icon: '🎯' },
  { value: 'CODE_INPUT', label: 'Code Input', icon: '💻' },
] as const;

/**
 * Quiz difficulty levels
 */
export const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: 'Easy', color: 'green' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
  { value: 'HARD', label: 'Hard', color: 'red' },
] as const;

/**
 * Quiz modes
 */
export const QUIZ_MODES = [
  { value: 'PRACTICE', label: 'Practice', description: 'Learning mode with immediate feedback' },
  { value: 'ASSESSMENT', label: 'Assessment', description: 'Graded quiz with final results' },
  { value: 'EXAM', label: 'Exam', description: 'Formal exam with strict rules' },
] as const;