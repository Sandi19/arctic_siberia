// File: src/components/session/types/session-types.ts

/**
 * =================================================================
 * 🎯 SESSION TYPES DEFINITIONS
 * =================================================================
 * Core Session interfaces untuk Arctic Siberia Session System
 * Following Arctic Siberia Export Standard
 * Created: July 2025
 * =================================================================
 */

// ✅ FIXED: Local utilities - session types
import type { 
  ContentAccessLevel,
  ContentType,
  SessionContent,
  SessionMode,
  SessionStatus
} from './index';

// =================================================================
// 🎯 CORE SESSION INTERFACE
// =================================================================

export interface Session {
  id: string;
  title: string;
  description?: string;
  slug: string;
  
  // Hierarchy & Organization
  courseId?: string; // Optional untuk standalone sessions
  order: number;
  
  // Content Management
  contents: SessionContent[];
  totalContents: number;
  freeContentsCount: number;
  premiumContentsCount: number;
  
  // Access Control
  accessLevel: ContentAccessLevel;
  isPublished: boolean;
  isVisible: boolean;
  
  // Learning Metrics
  estimatedDuration: number; // total minutes
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  completionRate?: number; // percentage
  
  // Status & Workflow
  status: SessionStatus;
  
  // Prerequisites
  prerequisites: string[]; // session IDs
  
  // Metadata
  tags: string[];
  thumbnail?: string;
  objectives: string[]; // learning objectives
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Relations
  instructor?: SessionInstructor;
  category?: SessionCategory;
  statistics?: SessionStatistics;
}

// =================================================================
// 🎯 SESSION RELATED INTERFACES
// =================================================================

// Session Instructor Info
export interface SessionInstructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  expertise: string[];
}

// Session Category
export interface SessionCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

// Session Statistics
export interface SessionStatistics {
  totalStudents: number;
  completedStudents: number;
  averageCompletionTime: number; // minutes
  averageRating: number;
  totalRatings: number;
  engagementScore: number; // 0-100
  dropoffPoints: {
    contentId: string;
    dropoffRate: number;
  }[];
}

// =================================================================
// 🎯 SESSION PROGRESS & TRACKING
// =================================================================

// Student Progress per Session
export interface SessionProgress {
  id: string;
  sessionId: string;
  studentId: string;
  
  // Progress Metrics
  completedContents: string[]; // content IDs
  currentContentId?: string;
  progressPercentage: number;
  timeSpent: number; // minutes
  
  // Completion Status
  isCompleted: boolean;
  completedAt?: Date;
  
  // Performance
  quizScores: {
    contentId: string;
    score: number;
    maxScore: number;
    attempts: number;
  }[];
  
  // Engagement
  lastAccessedAt: Date;
  accessCount: number;
  
  // Notes & Bookmarks
  notes: SessionNote[];
  bookmarks: string[]; // content IDs
  
  createdAt: Date;
  updatedAt: Date;
}

// Student Notes
export interface SessionNote {
  id: string;
  contentId: string;
  content: string;
  timestamp?: number; // for video notes - seconds
  createdAt: Date;
  updatedAt: Date;
}

// =================================================================
// 🎯 SESSION MANAGEMENT INTERFACES
// =================================================================

// Session Creation Form
export interface CreateSessionFormData {
  title: string;
  description?: string;
  courseId?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  accessLevel: ContentAccessLevel;
  objectives: string[];
  tags: string[];
  categoryId?: string;
}

// Session Update Form
export interface UpdateSessionFormData extends Partial<CreateSessionFormData> {
  id: string;
  slug?: string;
  isPublished?: boolean;
  isVisible?: boolean;
}

// Session Bulk Operations
export interface SessionBulkOperation {
  type: 'PUBLISH' | 'UNPUBLISH' | 'DELETE' | 'MOVE' | 'DUPLICATE';
  sessionIds: string[];
  targetCourseId?: string; // for MOVE operation
  newOrder?: number[]; // for reordering
}

// =================================================================
// 🎯 SESSION BUILDER INTERFACES
// =================================================================

// Session Builder Configuration
export interface SessionBuilderConfig {
  mode: SessionMode;
  courseId?: string;
  maxFreeContents?: number;
  allowedContentTypes: ContentType[];
  features: {
    dragAndDrop: boolean;
    bulkOperations: boolean;
    contentPreview: boolean;
    statistics: boolean;
    publishing: boolean;
  };
}

// Session Builder State
export interface SessionBuilderState {
  // Data
  sessions: Session[];
  currentSession: Session | null;
  
  // UI State
  selectedSessionIds: string[];
  draggedSession: Session | null;
  
  // Loading States
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  
  // Error Handling
  error: string | null;
  validationErrors: ValidationError[];
  
  // Form State
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  
  // Filters & Search
  searchQuery: string;
  filters: SessionFilters;
  sortBy: SessionSortOption;
}

// Session Filters
export interface SessionFilters {
  status: SessionStatus[];
  accessLevel: ContentAccessLevel[];
  difficulty: ('BEGINNER' | 'INTERMEDIATE' | 'ADVANCED')[];
  categoryIds: string[];
  tags: string[];
  hasContents: boolean;
  isPublished: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Session Sort Options
export interface SessionSortOption {
  field: 'title' | 'order' | 'createdAt' | 'updatedAt' | 'completionRate';
  direction: 'asc' | 'desc';
}

// =================================================================
// 🎯 SESSION RENDERER INTERFACES
// =================================================================

// Session Renderer Configuration
export interface SessionRendererConfig {
  studentId?: string;
  allowNotes: boolean;
  allowBookmarks: boolean;
  trackProgress: boolean;
  autoPlay: boolean;
  showPrerequisites: boolean;
  enableComments: boolean;
}

// Session Renderer State
export interface SessionRendererState {
  // Current State
  currentContentId: string | null;
  currentContentIndex: number;
  
  // Progress
  progress: SessionProgress | null;
  
  // UI State
  isLoading: boolean;
  isFullscreen: boolean;
  sidebarOpen: boolean;
  
  // Content State
  contentHistory: string[]; // navigation history
  
  // Error Handling
  error: string | null;
}

// =================================================================
// 🎯 SESSION VALIDATION
// =================================================================

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID' | 'TOO_LONG' | 'TOO_SHORT' | 'DUPLICATE';
  value?: any;
}

// Session Validation Rules
export interface SessionValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  description: {
    maxLength: number;
  };
  contents: {
    minCount: number;
    maxCount: number;
    maxFreeCount: number;
  };
  objectives: {
    minCount: number;
    maxCount: number;
  };
  prerequisites: {
    maxCount: number;
    preventCircularDependency: boolean;
  };
}

// =================================================================
// 🎯 SESSION API INTERFACES
// =================================================================

// Session API Request
export interface SessionApiRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Session API Response
export interface SessionApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: ValidationError[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: Date;
}

// Paginated Session Response
export interface PaginatedSessionResponse {
  sessions: Session[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: SessionFilters;
  sortBy: SessionSortOption;
}

// =================================================================
// 🎯 SESSION EVENTS & HOOKS
// =================================================================

// Session Event Types
export type SessionEventType = 
  | 'SESSION_CREATED'
  | 'SESSION_UPDATED'
  | 'SESSION_DELETED'
  | 'SESSION_PUBLISHED'
  | 'SESSION_UNPUBLISHED'
  | 'CONTENT_ADDED'
  | 'CONTENT_REMOVED'
  | 'CONTENT_REORDERED'
  | 'PROGRESS_UPDATED';

// Session Event
export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  data: any;
  userId?: string;
  timestamp: Date;
}

// Session Hook Options
export interface SessionHookOptions {
  // Data fetching
  autoFetch: boolean;
  refetchOnMount: boolean;
  refetchOnFocus: boolean;
  
  // Caching
  cacheTime: number; // minutes
  staleTime: number; // minutes
  
  // Error handling
  retryCount: number;
  retryDelay: number; // ms
  
  // Optimistic updates
  optimisticUpdates: boolean;
  
  // Real-time updates
  enableRealtime: boolean;
}

// =================================================================
// 🎯 UTILITY TYPES
// =================================================================

// Session with computed properties
export interface SessionWithComputedProps extends Session {
  // Computed fields
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  hasPrerequisites: boolean;
  isAccessible: boolean;
  nextSessionId?: string;
  prevSessionId?: string;
  
  // Content analysis
  contentTypeBreakdown: Record<ContentType, number>;
  estimatedReadingTime: number;
  estimatedWatchTime: number;
  
  // Progress (when student context available)
  studentProgress?: SessionProgress;
  isCompleted?: boolean;
  isStarted?: boolean;
}

// Session Summary for lists/cards
export interface SessionSummary {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  order: number;
  accessLevel: ContentAccessLevel;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDuration: number;
  totalContents: number;
  freeContentsCount: number;
  status: SessionStatus;
  isPublished: boolean;
  completionRate?: number;
  updatedAt: Date;
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Named exports untuk interfaces
export type {
  Session,
  SessionInstructor,
  SessionCategory,
  SessionStatistics,
  SessionProgress,
  SessionNote,
  CreateSessionFormData,
  UpdateSessionFormData,
  SessionBulkOperation,
  SessionBuilderConfig,
  SessionBuilderState,
  SessionFilters,
  SessionSortOption,
  SessionRendererConfig,
  SessionRendererState,
  ValidationError,
  SessionValidationRules,
  SessionApiRequest,
  SessionApiResponse,
  PaginatedSessionResponse,
  SessionEvent,
  SessionHookOptions,
  SessionWithComputedProps,
  SessionSummary,
  SessionOption
};

// ✅ PATTERN: Named exports untuk types
export type {
  SessionEventType
};