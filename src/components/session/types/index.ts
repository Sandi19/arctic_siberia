// File: src/components/session/types/index.ts

/**
 * =================================================================
 * 🎯 SESSION TYPES BARREL EXPORT
 * =================================================================
 * Central type definitions for Arctic Siberia Session System
 * Following Arctic Siberia Export Standard
 * Created: July 2025
 * =================================================================
 */

// =================================================================
// 🎯 BARREL EXPORTS - Re-export pattern
// =================================================================

// ✅ PATTERN: Export all from content-types
export * from './content-types';

// ✅ PATTERN: Export all from session-types  
export * from './session-types';

// =================================================================
// 🎯 NAMED EXPORTS - Enums dan Utility Types
// =================================================================

// Content Type Enum untuk type safety
export enum ContentType {
  // Phase 1 Content Types (Essential)
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  EXERCISE = 'EXERCISE',
  LIVE_SESSION = 'LIVE_SESSION',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  
  // Phase 2 Content Types (Advanced)
  ASSIGNMENT = 'ASSIGNMENT',
  DISCUSSION = 'DISCUSSION',
  INTERACTIVE_CODE = 'INTERACTIVE_CODE',
  NOTEBOOK = 'NOTEBOOK',
  SURVEY = 'SURVEY'
}

// Session Status untuk workflow management
export enum SessionStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

// Session Mode untuk dual rendering pattern
export enum SessionMode {
  BUILDER = 'BUILDER',    // Instructor mode
  RENDERER = 'RENDERER'   // Student mode
}

// Content Access Level
export enum ContentAccessLevel {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

// =================================================================
// 🎯 UTILITY TYPES - Generic Helper Types
// =================================================================

// Generic content interface
export interface BaseContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  order: number;
  accessLevel: ContentAccessLevel;
  createdAt: Date;
  updatedAt: Date;
}

// Session builder state
export interface SessionBuilderState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
}

// Drag and drop item interface
export interface DragDropItem {
  id: string;
  type: 'SESSION' | 'CONTENT';
  index: number;
}

// =================================================================
// 🎯 API RESPONSE TYPES - Server Communication
// =================================================================

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

// Session API responses
export interface SessionResponse extends ApiResponse<Session> {}
export interface SessionListResponse extends ApiResponse<Session[]> {}

// Content API responses
export interface ContentResponse extends ApiResponse<SessionContent> {}
export interface ContentListResponse extends ApiResponse<SessionContent[]> {}

// =================================================================
// 🎯 FORM TYPES - Form Data Interfaces
// =================================================================

// Session creation form
export interface CreateSessionForm {
  title: string;
  description?: string;
  contentType: ContentType;
  accessLevel: ContentAccessLevel;
}

// Session update form
export interface UpdateSessionForm extends Partial<CreateSessionForm> {
  id: string;
}

// Content creation form (generic)
export interface CreateContentForm {
  sessionId: string;
  type: ContentType;
  title: string;
  description?: string;
  order: number;
}

// =================================================================
// 🎯 EVENT TYPES - User Actions & Events
// =================================================================

// Session events
export interface SessionEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'REORDER';
  sessionId: string;
  data?: any;
  timestamp: Date;
}

// Content events
export interface ContentEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE';
  contentId: string;
  sessionId: string;
  data?: any;
  timestamp: Date;
}

// =================================================================
// 🎯 HOOK TYPES - Custom Hook Interfaces
// =================================================================

// Session CRUD hook return type
export interface UseSessionCrudReturn {
  sessions: Session[];
  createSession: (data: CreateSessionForm) => Promise<Session>;
  updateSession: (id: string, data: UpdateSessionForm) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Session reorder hook return type
export interface UseSessionReorderReturn {
  reorderSessions: (startIndex: number, endIndex: number) => void;
  isDragging: boolean;
  draggedItem: DragDropItem | null;
}

// =================================================================
// 🎯 COMPONENT PROP TYPES - Component Interfaces
// =================================================================

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Session builder props
export interface SessionBuilderProps extends BaseComponentProps {
  courseId?: string;
  mode: SessionMode;
  onSessionsChange?: (sessions: Session[]) => void;
}

// Session renderer props
export interface SessionRendererProps extends BaseComponentProps {
  sessionId: string;
  studentId?: string;
  onProgress?: (contentId: string, progress: number) => void;
}

// =================================================================
// 🎯 FINAL NOTE - Arctic Siberia Standard Compliance
// =================================================================

/**
 * ✅ EXPORT STANDARD APPLIED:
 * - Barrel exports menggunakan export * from pattern
 * - Named exports untuk enums dan utility types
 * - Konsisten dengan Arctic Siberia Export Standard
 * - No default export karena ini barrel file
 */