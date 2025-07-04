// File: src/components/quiz/index.ts

/**
 * =================================================================
 * 🧩 QUIZ COMPONENTS BARREL EXPORTS
 * =================================================================
 * Central export file for Arctic Siberia Quiz System
 * Following Arctic Siberia Export Standard Pattern
 * Created: July 2025
 * Phase: 1 - Foundation & Types
 * =================================================================
 */

// =================================================================
// 🎯 TYPES & INTERFACES - Pure export (no default export)
// =================================================================
export * from './types';

// =================================================================
// 🎯 MAIN COMPONENTS - Default exports with 'as' alias
// =================================================================

// Main Quiz System Components
export { default as QuizRenderer } from './quiz-renderer';
export { default as QuizBuilder } from './quiz-builder';

// =================================================================
// 🎯 SHARED COMPONENTS - Default exports with 'as' alias
// =================================================================

// Quiz Shared Components - Default Exports
export { default as QuizProgress } from './shared/quiz-progress';
export { default as QuizTimer } from './shared/quiz-timer';
export { default as QuestionNavigation } from './shared/question-navigation';
export { default as OptionEditor } from './shared/option-editor';
export { default as QuizResult } from './shared/quiz-result';

// Quiz Shared Components - Named Exports
export { 
  useQuizProgress, 
  type QuizProgressProps, 
  type QuestionStatus 
} from './shared/quiz-progress';

export { 
  useQuizTimer, 
  type QuizTimerProps, 
  type TimerState 
} from './shared/quiz-timer';

export { 
  CompactQuestionNavigation, 
  useQuestionNavigation, 
  type QuestionNavigationProps 
} from './shared/question-navigation';

export { 
  OptionItem, 
  useOptionEditor, 
  type OptionEditorProps, 
  type OptionItemProps,
  type BaseOption,
  type MCQOption,
  type CheckboxOption,
  type MatchingOption 
} from './shared/option-editor';

export { 
  useQuizResult, 
  type QuizResultProps, 
  type QuestionResult as QuizQuestionResult, 
  type QuizAnalytics 
} from './shared/quiz-result';

// =================================================================
// 🎯 QUIZ COMPONENTS (Question Renderers) - Default exports
// =================================================================

// Question Components - Default Exports
export { default as QuizMCQ } from './components/quiz-mcq';
export { default as QuizTrueFalse } from './components/quiz-true-false';
export { default as QuizEssay } from './components/quiz-essay';
export { default as QuizCheckbox } from './components/quiz-checkbox';
export { default as QuizFillBlank } from './components/quiz-fill-blank';
export { default as QuizMatching } from './components/quiz-matching';
export { default as QuizDragDrop } from './components/quiz-drag-drop';
export { default as QuizCodeInput } from './components/quiz-code-input';

// =================================================================
// 🎯 QUIZ BUILDERS (Question Builders) - Default exports
// =================================================================

// Question Builders - Default Exports
export { default as MCQBuilder } from './builder/mcq-builder';
export { default as TrueFalseBuilder } from './builder/true-false-builder';
export { default as EssayBuilder } from './builder/essay-builder';
export { default as CheckboxBuilder } from './builder/checkbox-builder';
export { default as FillBlankBuilder } from './builder/fill-blank-builder';
export { default as MatchingBuilder } from './builder/matching-builder';
export { default as DragDropBuilder } from './builder/drag-drop-builder';
export { default as CodeInputBuilder } from './builder/code-input-builder';

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Get question component by type
 */
export function getQuestionComponent(type: string) {
  const componentMap = {
    'MCQ': () => import('./components/quiz-mcq'),
    'TRUE_FALSE': () => import('./components/quiz-true-false'),
    'ESSAY': () => import('./components/quiz-essay'),
    'CHECKBOX': () => import('./components/quiz-checkbox'),
    'FILL_BLANK': () => import('./components/quiz-fill-blank'),
    'MATCHING': () => import('./components/quiz-matching'),
    'DRAG_DROP': () => import('./components/quiz-drag-drop'),
    'CODE_INPUT': () => import('./components/quiz-code-input'),
  };
  
  return componentMap[type as keyof typeof componentMap];
}

/**
 * Get question builder by type
 */
export function getQuestionBuilder(type: string) {
  const builderMap = {
    'MCQ': () => import('./builder/mcq-builder'),
    'TRUE_FALSE': () => import('./builder/true-false-builder'),
    'ESSAY': () => import('./builder/essay-builder'),
    'CHECKBOX': () => import('./builder/checkbox-builder'),
    'FILL_BLANK': () => import('./builder/fill-blank-builder'),
    'MATCHING': () => import('./builder/matching-builder'),
    'DRAG_DROP': () => import('./builder/drag-drop-builder'),
    'CODE_INPUT': () => import('./builder/code-input-builder'),
  };
  
  return builderMap[type as keyof typeof builderMap];
}

/**
 * Get question type display name
 */
export function getQuestionTypeDisplayName(type: string): string {
  const displayNames = {
    'MCQ': 'Multiple Choice',
    'TRUE_FALSE': 'True/False',
    'ESSAY': 'Essay',
    'CHECKBOX': 'Multiple Selection',
    'FILL_BLANK': 'Fill in the Blank',
    'MATCHING': 'Matching',
    'DRAG_DROP': 'Drag & Drop',
    'CODE_INPUT': 'Code Input',
  };
  
  return displayNames[type as keyof typeof displayNames] || type;
}

/**
 * Get question type icon
 */
export function getQuestionTypeIcon(type: string): string {
  const iconMap = {
    'MCQ': '⭕',
    'TRUE_FALSE': '✅',
    'ESSAY': '📝',
    'CHECKBOX': '☑️',
    'FILL_BLANK': '⬜',
    'MATCHING': '🔗',
    'DRAG_DROP': '🎯',
    'CODE_INPUT': '💻',
  };
  
  return iconMap[type as keyof typeof iconMap] || '❓';
}

// =================================================================
// 🎯 VERSION INFO
// =================================================================

/**
 * Quiz System Version
 */
export const QUIZ_SYSTEM_VERSION = '1.0.0';

/**
 * Quiz System Info
 */
export const QUIZ_SYSTEM_INFO = {
  name: 'Arctic Siberia Quiz System',
  version: QUIZ_SYSTEM_VERSION,
  description: 'Complete quiz system for Arctic Siberia LMS',
  author: 'Arctic Siberia Development Team',
  createdAt: '2025-07-04',
  supportedQuestionTypes: 8,
  features: [
    'Multiple question types',
    'Drag & drop interface',
    'Code input support',
    'Real-time timer',
    'Progress tracking',
    'Detailed analytics',
    'Responsive design',
    'Accessibility support',
  ],
} as const;