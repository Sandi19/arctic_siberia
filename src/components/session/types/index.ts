// File: src/components/session/types/index.ts

/**
 * =================================================================
 * 🎯 SESSION TYPES - SIMPLIFIED VERSION
 * =================================================================
 * All types inline - fokus ke 5 content types essential
 * Following Arctic Siberia Export Standard
 * Created: July 2025 - Simplified Strategy
 * =================================================================
 */

// =================================================================
// 🎯 CORE ENUMS - 5 Content Types Only
// =================================================================

export enum ContentType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT', 
  LIVE_SESSION = 'LIVE_SESSION',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT'
}

export enum SessionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum SessionMode {
  BUILDER = 'BUILDER',    // Instructor mode
  RENDERER = 'RENDERER'   // Student mode
}

export enum ContentAccessLevel {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export enum SessionDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE', 
  ADVANCED = 'ADVANCED'
}

// =================================================================
// 🎯 BASE INTERFACES
// =================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// =================================================================
// 🎯 SESSION CONTENT INTERFACES - 5 Content Types
// =================================================================

// Base content interface
export interface SessionContent extends BaseEntity {
  sessionId: string;
  type: ContentType;
  title: string;
  description?: string;
  order: number;
  accessLevel: ContentAccessLevel;
  duration?: number; // in minutes
  isFree: boolean;
  
  // Type-specific data
  videoData?: VideoData;
  documentData?: DocumentData;
  liveSessionData?: LiveSessionData;
  quizData?: QuizData;
  assignmentData?: AssignmentData;
}

// Video content data
export interface VideoData {
  youtubeUrl: string;
  startTime?: number;
  endTime?: number;
  autoPlay?: boolean;
  showControls?: boolean;
}

// Document content data
export interface DocumentData {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isDownloadable: boolean;
  pages?: number;
}

// Live session content data
export interface LiveSessionData {
  meetingLink: string;
  scheduledAt?: Date;
  duration?: number;
  meetingId?: string;
  passcode?: string;
  instructions?: string;
}

// Quiz content data (simplified - real quiz data comes from quiz system)
export interface QuizData {
  quizId: string;
  title: string;
  questionCount: number;
  timeLimit?: number;
  passingScore?: number;
  attempts?: number;
}

// Assignment content data
export interface AssignmentData {
  instructions: string;
  taskFileUrl?: string;
  deadline?: Date;
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
  maxSubmissions?: number;
  gradingCriteria?: string;
}

// =================================================================
// 🎯 SESSION INTERFACES
// =================================================================

export interface Session extends BaseEntity {
  courseId: string;
  title: string;
  description?: string;
  order: number;
  status: SessionStatus;
  difficulty: SessionDifficulty;
  accessLevel: ContentAccessLevel;
  isFree: boolean;
  
  // Content
  contents: SessionContent[];
  totalContents: number;
  estimatedDuration: number; // total minutes
  
  // Learning objectives
  objectives: string[];
  tags: string[];
  
  // Prerequisites
  prerequisites?: string[];
  
  // Stats (computed)
  enrollmentCount?: number;
  completionRate?: number;
  averageScore?: number;
}

// =================================================================
// 🎯 FORM DATA INTERFACES
// =================================================================

export interface CreateSessionFormData {
  title: string;
  description?: string;
  difficulty: SessionDifficulty;
  accessLevel: ContentAccessLevel;
  objectives: string[];
  tags: string[];
}

export interface UpdateSessionFormData extends Partial<CreateSessionFormData> {
  id: string;
}

export interface CreateContentFormData {
  sessionId: string;
  type: ContentType;
  title: string;
  description?: string;
  accessLevel: ContentAccessLevel;
  
  // Type-specific data
  videoData?: Partial<VideoData>;
  documentData?: Partial<DocumentData>;
  liveSessionData?: Partial<LiveSessionData>;
  quizData?: Partial<QuizData>;
  assignmentData?: Partial<AssignmentData>;
}

// =================================================================
// 🎯 PROGRESS & ANALYTICS INTERFACES
// =================================================================

export interface SessionProgress extends BaseEntity {
  sessionId: string;
  studentId: string;
  completedContents: string[];
  progressPercentage: number;
  timeSpent: number; // in minutes
  isCompleted: boolean;
  lastAccessedAt: Date;
  accessCount: number;
  
  // Content-specific progress
  quizScores: QuizScore[];
  assignmentSubmissions: AssignmentSubmission[];
  notes: StudentNote[];
  bookmarks: string[];
}

export interface QuizScore {
  contentId: string;
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  attempts: number;
  completedAt: Date;
}

export interface AssignmentSubmission {
  contentId: string;
  fileUrl: string;
  fileName: string;
  description?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: 'PENDING' | 'GRADED' | 'RETURNED';
}

export interface StudentNote {
  contentId: string;
  note: string;
  timestamp: number; // for video content
  createdAt: Date;
}

// =================================================================
// 🎯 COMPONENT PROPS INTERFACES
// =================================================================

export interface SessionBuilderProps {
  courseId?: string;
  config?: Partial<SessionBuilderConfig>;
  onSessionChange?: (sessions: Session[]) => void;
  onSessionSelect?: (session: Session | null) => void;
  className?: string;
}

export interface SessionRendererProps {
  session: Session;
  studentId?: string;
  config?: Partial<SessionRendererConfig>;
  onProgress?: (contentId: string, progress: number) => void;
  onComplete?: (sessionId: string) => void;
  onContentChange?: (contentId: string) => void;
  className?: string;
}

export interface ContentRendererProps {
  content: SessionContent;
  isActive: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

// =================================================================
// 🎯 CONFIGURATION INTERFACES
// =================================================================

export interface SessionBuilderConfig {
  mode: SessionMode;
  maxFreeContents: number;
  allowedContentTypes: ContentType[];
  features: {
    dragAndDrop: boolean;
    bulkOperations: boolean;
    contentPreview: boolean;
    statistics: boolean;
    publishing: boolean;
  };
}

export interface SessionRendererConfig {
  allowNotes: boolean;
  allowBookmarks: boolean;
  trackProgress: boolean;
  autoPlay: boolean;
  showPrerequisites: boolean;
  enableComments: boolean;
}

// =================================================================
// 🎯 STATE MANAGEMENT INTERFACES
// =================================================================

export interface SessionBuilderState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  isDirty: boolean;
}

export interface SessionRendererState {
  currentContentId: string | null;
  currentContentIndex: number;
  progress: SessionProgress | null;
  isLoading: boolean;
  isFullscreen: boolean;
  sidebarOpen: boolean;
  contentHistory: string[];
  error: string | null;
}

// =================================================================
// 🎯 HOOK INTERFACES
// =================================================================

export interface UseSessionCrudProps {
  courseId?: string;
  onSessionChange?: (sessions: Session[]) => void;
  onError?: (error: string) => void;
}

export interface UseSessionCrudReturn {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  createSession: (data: CreateSessionFormData) => Promise<Session | null>;
  updateSession: (id: string, data: UpdateSessionFormData) => Promise<Session | null>;
  deleteSession: (id: string) => Promise<boolean>;
  duplicateSession: (id: string) => Promise<Session | null>;
  fetchSessions: () => Promise<void>;
  clearError: () => void;
}

export interface UseSessionReorderReturn {
  isDragging: boolean;
  draggedSession: Session | null;
  isProcessing: boolean;
  DragDropProvider: React.ComponentType<{ children: React.ReactNode }>;
  reorderSessions: (startIndex: number, endIndex: number) => void;
  clearError: () => void;
}

// =================================================================
// 🎯 UTILITY & FILTER INTERFACES
// =================================================================

export interface SessionFilters {
  status: SessionStatus[];
  accessLevel: ContentAccessLevel[];
  difficulty: SessionDifficulty[];
  categoryIds: string[];
  tags: string[];
  hasContents: boolean;
  isPublished: boolean;
}

export interface SessionSortOption {
  field: 'order' | 'title' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// =================================================================
// 🎯 API INTERFACES
// =================================================================

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  error?: string;
}

export interface SessionApiResponse extends ApiResponse<Session> {}
export interface SessionListApiResponse extends ApiResponse<Session[]> {}
export interface ContentApiResponse extends ApiResponse<SessionContent> {}

// =================================================================
// 🎯 CONSTANTS & CONFIGURATIONS
// =================================================================

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'Video',
  [ContentType.DOCUMENT]: 'Document',
  [ContentType.LIVE_SESSION]: 'Live Session',
  [ContentType.QUIZ]: 'Quiz',
  [ContentType.ASSIGNMENT]: 'Assignment'
};

export const CONTENT_TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'YouTube videos, tutorials, and demonstrations',
  [ContentType.DOCUMENT]: 'PDFs, worksheets, and reading materials',
  [ContentType.LIVE_SESSION]: 'Real-time meetings and interactive sessions',
  [ContentType.QUIZ]: 'Assessments and knowledge checks',
  [ContentType.ASSIGNMENT]: 'Homework and project submissions'
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  [ContentType.VIDEO]: '📹',
  [ContentType.DOCUMENT]: '📄',
  [ContentType.LIVE_SESSION]: '🔗',
  [ContentType.QUIZ]: '❓',
  [ContentType.ASSIGNMENT]: '📋'
};

export const SESSION_CONFIG = {
  MAX_FREE_CONTENT: 3,
  MAX_SESSIONS_PER_COURSE: 50,
  MAX_CONTENTS_PER_SESSION: 20,
  DEFAULT_SESSION_DURATION: 30,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  DRAG_DELAY: 150
} as const;

export const CONTENT_CONFIG = {
  VIDEO: {
    MAX_DURATION: 7200, // 2 hours in seconds
    SUPPORTED_PLATFORMS: ['youtube'],
    AUTO_PLAY: false
  },
  DOCUMENT: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['.pdf', '.doc', '.docx'],
    ENABLE_DOWNLOAD: true
  },
  LIVE_SESSION: {
    SUPPORTED_PLATFORMS: ['zoom', 'meet', 'teams'],
    DEFAULT_DURATION: 60, // minutes
    ADVANCE_NOTICE: 24 // hours
  },
  QUIZ: {
    MAX_QUESTIONS: 50,
    MIN_QUESTIONS: 1,
    DEFAULT_TIME_LIMIT: 30, // minutes
    AUTO_SUBMIT: true
  },
  ASSIGNMENT: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_FORMATS: ['.pdf', '.doc', '.docx', '.txt'],
    DEFAULT_DEADLINE_DAYS: 7
  }
} as const;