// File: src/components/session/index.ts

/**
 * =================================================================
 * 🎯 SESSION COMPONENTS BARREL EXPORTS
 * =================================================================
 * Central export file for Arctic Siberia Session System
 * Following Arctic Siberia Export Standard
 * Created: July 2025 - Step 4
 * =================================================================
 */

// =================================================================
// 🎯 TYPES & INTERFACES - Pure export (no default export)
// =================================================================
export * from './types';


// =================================================================
// 🎯 CONTENT RENDERERS - Default exports with 'as' alias
// =================================================================
export { default as VideoRenderer } from './content-handlers/video/video-renderer';
export { default as DocumentRenderer } from './content-handlers/document/document-renderer';
export { default as LiveSessionRenderer } from './content-handlers/live-session/live-session-renderer';
export { default as QuizRenderer } from './content-handlers/quiz/quiz-renderer';
export { default as AssignmentRenderer } from './content-handlers/assignment/assignment-renderer';


// Add these exports (with unique names to avoid conflicts)
export { default as VideoContentBuilder } from './content-handlers/video/video-builder';
export { default as QuizContentBuilder } from './content-handlers/quiz/quiz-builder';
export { default as DocumentContentBuilder } from './content-handlers/document/document-builder';
export { default as LiveSessionContentBuilder } from './content-handlers/live-session/live-session-builder';
export { default as AssignmentContentBuilder } from './content-handlers/assignment/assignment-builder';

// =================================================================
// 🎯 HOOKS - Default exports with 'as' alias
// =================================================================
export { default as useSessionCrud } from './hooks/use-session-crud';
export { default as useSessionReorder } from './hooks/use-session-reorder';

// =================================================================
// Session builder
// Tambahkan di src/components/session/index.ts

// =================================================================
// 🎯 MAIN COMPONENTS - Default exports with 'as' alias  
// =================================================================
export { default as SessionBuilder } from './session-builder';
export { default as SessionRenderer } from './session-renderer';

// Tambahkan di src/components/session/index.ts setelah main components

// =================================================================
// 🎯 SESSION MANAGEMENT COMPONENTS - Default exports with 'as' alias
// =================================================================
export { default as SessionCard } from './components/session-management/session-card';
export { default as SessionForm } from './components/session-management/session-form';
export { default as SessionList } from './components/session-management/session-list';

// =================================================================
// 🎯 SESSION STATISTICS - Default exports with 'as' alias
// =================================================================
export { default as SessionStats } from './components/session-statistics/session-stats';