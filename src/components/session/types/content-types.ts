// File: src/components/session/types/content-types.ts

/**
 * =================================================================
 * 🎯 CONTENT TYPES DEFINITIONS
 * =================================================================
 * 11 Content Types untuk Arctic Siberia Session System
 * Following Arctic Siberia Export Standard
 * Created: July 2025
 * =================================================================
 */

// ✅ FIXED: Local utilities - session types
import type { 
  ContentAccessLevel, 
  ContentType 
} from './index';

// =================================================================
// 🎯 BASE CONTENT INTERFACE
// =================================================================

export interface BaseSessionContent {
  id: string;
  sessionId: string;
  type: ContentType;
  title: string;
  description?: string;
  order: number;
  accessLevel: ContentAccessLevel;
  duration?: number; // in minutes
  isRequired: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// =================================================================
// 🎯 PHASE 1 CONTENT TYPES (Essential - 6 Types)
// =================================================================

// 📹 VIDEO CONTENT - YouTube Integration
export interface VideoContent extends BaseSessionContent {
  type: ContentType.VIDEO;
  videoData: {
    youtubeUrl: string;
    videoId: string;
    thumbnail?: string;
    startTime?: number; // seconds
    endTime?: number; // seconds
    autoPlay: boolean;
    showControls: boolean;
    allowFullscreen: boolean;
    playbackSpeed: number[];
  };
}

// ❓ QUIZ CONTENT - Integration dengan Quiz System
export interface QuizContent extends BaseSessionContent {
  type: ContentType.QUIZ;
  quizData: {
    quizId: string;
    passingScore: number; // percentage
    timeLimit?: number; // minutes
    attemptsAllowed: number;
    showCorrectAnswers: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    instructions?: string;
    questionCount: number;
  };
}

// 📝 EXERCISE CONTENT - Text-based Learning
export interface ExerciseContent extends BaseSessionContent {
  type: ContentType.EXERCISE;
  exerciseData: {
    content: string; // Rich text/HTML
    exerciseType: 'READING' | 'PRACTICE' | 'REFLECTION';
    estimatedReadingTime?: number; // minutes
    hasSubmission: boolean;
    submissionInstructions?: string;
    resources?: {
      title: string;
      url: string;
      type: 'LINK' | 'PDF' | 'IMAGE';
    }[];
  };
}

// 👥 LIVE SESSION CONTENT - Zoom Integration
export interface LiveSessionContent extends BaseSessionContent {
  type: ContentType.LIVE_SESSION;
  liveSessionData: {
    scheduledAt: Date;
    zoomMeetingId?: string;
    zoomJoinUrl?: string;
    zoomPassword?: string;
    maxParticipants?: number;
    isRecorded: boolean;
    recordingUrl?: string;
    agenda?: string;
    prerequisites?: string[];
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  };
}

// 📄 DOCUMENT CONTENT - PDF/File Materials
export interface DocumentContent extends BaseSessionContent {
  type: ContentType.DOCUMENT;
  documentData: {
    fileUrl: string;
    fileName: string;
    fileSize: number; // bytes
    fileType: 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX' | 'TXT';
    isDownloadable: boolean;
    viewerType: 'EMBED' | 'DOWNLOAD' | 'EXTERNAL';
    pages?: number;
    thumbnail?: string;
  };
}

// 🎵 AUDIO CONTENT - Audio Materials
export interface AudioContent extends BaseSessionContent {
  type: ContentType.AUDIO;
  audioData: {
    audioUrl: string;
    fileName: string;
    fileSize: number; // bytes
    audioFormat: 'MP3' | 'WAV' | 'OGG' | 'M4A';
    isDownloadable: boolean;
    transcript?: string;
    chapters?: {
      title: string;
      startTime: number; // seconds
      endTime: number; // seconds
    }[];
    playbackSpeed: number[];
  };
}

// =================================================================
// 🎯 PHASE 2 CONTENT TYPES (Advanced - 5 Types)
// =================================================================

// 📋 ASSIGNMENT CONTENT - Homework Submission
export interface AssignmentContent extends BaseSessionContent {
  type: ContentType.ASSIGNMENT;
  assignmentData: {
    instructions: string; // Rich text/HTML
    dueDate: Date;
    submissionType: 'TEXT' | 'FILE' | 'LINK' | 'CODE';
    maxFileSize?: number; // MB
    allowedFileTypes?: string[];
    rubric?: {
      criteria: string;
      points: number;
      description: string;
    }[];
    isGroupAssignment: boolean;
    maxGroupSize?: number;
    plagiarismCheck: boolean;
  };
}

// 💬 DISCUSSION CONTENT - Forum-like Discussions
export interface DiscussionContent extends BaseSessionContent {
  type: ContentType.DISCUSSION;
  discussionData: {
    topic: string;
    description: string;
    isAnonymous: boolean;
    allowAttachments: boolean;
    moderationEnabled: boolean;
    categories?: string[];
    minimumPosts: number;
    discussionType: 'OPEN' | 'Q_AND_A' | 'THREADED';
    autoCloseAt?: Date;
  };
}

// 💻 INTERACTIVE CODE CONTENT - Code Playground
export interface InteractiveCodeContent extends BaseSessionContent {
  type: ContentType.INTERACTIVE_CODE;
  codeData: {
    language: 'JAVASCRIPT' | 'PYTHON' | 'JAVA' | 'CPP' | 'HTML_CSS' | 'SQL';
    starterCode?: string;
    solution?: string;
    testCases?: {
      input: string;
      expectedOutput: string;
      description?: string;
    }[];
    hints?: string[];
    allowExecution: boolean;
    timeLimit?: number; // seconds
    memoryLimit?: number; // MB
  };
}

// 📓 NOTEBOOK CONTENT - Jupyter-like Notebooks
export interface NotebookContent extends BaseSessionContent {
  type: ContentType.NOTEBOOK;
  notebookData: {
    cells: {
      id: string;
      type: 'CODE' | 'MARKDOWN' | 'RAW';
      content: string;
      output?: any;
      executionCount?: number;
      metadata?: Record<string, any>;
    }[];
    kernelType: 'PYTHON' | 'R' | 'JAVASCRIPT' | 'JULIA';
    environment?: string;
    requirements?: string[];
    isExecutable: boolean;
  };
}

// 📊 SURVEY CONTENT - Feedback Collection
export interface SurveyContent extends BaseSessionContent {
  type: ContentType.SURVEY;
  surveyData: {
    questions: {
      id: string;
      type: 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'LIKERT' | 'CHECKBOX';
      question: string;
      options?: string[];
      isRequired: boolean;
      validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
      };
    }[];
    isAnonymous: boolean;
    allowMultipleSubmissions: boolean;
    showResults: boolean;
    resultsVisibility: 'IMMEDIATE' | 'AFTER_SUBMISSION' | 'NEVER';
    expiresAt?: Date;
  };
}

// =================================================================
// 🎯 UNION TYPE - All Content Types
// =================================================================

export type SessionContent = 
  | VideoContent
  | QuizContent
  | ExerciseContent
  | LiveSessionContent
  | DocumentContent
  | AudioContent
  | AssignmentContent
  | DiscussionContent
  | InteractiveCodeContent
  | NotebookContent
  | SurveyContent;

// =================================================================
// 🎯 CONTENT TYPE MAPPING - untuk Dynamic Rendering
// =================================================================

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'Video',
  [ContentType.QUIZ]: 'Quiz',
  [ContentType.EXERCISE]: 'Exercise',
  [ContentType.LIVE_SESSION]: 'Live Session',
  [ContentType.DOCUMENT]: 'Document',
  [ContentType.AUDIO]: 'Audio',
  [ContentType.ASSIGNMENT]: 'Assignment',
  [ContentType.DISCUSSION]: 'Discussion',
  [ContentType.INTERACTIVE_CODE]: 'Interactive Code',
  [ContentType.NOTEBOOK]: 'Notebook',
  [ContentType.SURVEY]: 'Survey'
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'Play',
  [ContentType.QUIZ]: 'HelpCircle',
  [ContentType.EXERCISE]: 'BookOpen',
  [ContentType.LIVE_SESSION]: 'Video',
  [ContentType.DOCUMENT]: 'FileText',
  [ContentType.AUDIO]: 'Volume2',
  [ContentType.ASSIGNMENT]: 'Clipboard',
  [ContentType.DISCUSSION]: 'MessageSquare',
  [ContentType.INTERACTIVE_CODE]: 'Code2',
  [ContentType.NOTEBOOK]: 'NotebookPen',
  [ContentType.SURVEY]: 'BarChart3'
};

export const CONTENT_TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'YouTube video dengan kontrol penuh',
  [ContentType.QUIZ]: 'Kuis interaktif dengan berbagai tipe soal',
  [ContentType.EXERCISE]: 'Materi bacaan dan latihan praktek',
  [ContentType.LIVE_SESSION]: 'Sesi langsung via Zoom',
  [ContentType.DOCUMENT]: 'Dokumen PDF dan file materi',
  [ContentType.AUDIO]: 'Konten audio dengan transcript',
  [ContentType.ASSIGNMENT]: 'Tugas dengan sistem submission',
  [ContentType.DISCUSSION]: 'Forum diskusi untuk kolaborasi',
  [ContentType.INTERACTIVE_CODE]: 'Editor kode dengan testing',
  [ContentType.NOTEBOOK]: 'Notebook interaktif seperti Jupyter',
  [ContentType.SURVEY]: 'Survey untuk feedback dan evaluasi'
};

// =================================================================
// 🎯 CONTENT CREATION HELPERS
// =================================================================

// Factory function untuk create default content
function createDefaultContent(type: ContentType, sessionId: string): Partial<SessionContent> {
  // Basic validation logic
  if (!content.title || !content.sessionId || !content.type) {
    return false;
  }

  // Type-specific validation
  switch (content.type) {
    case ContentType.VIDEO:
      return !!(content as VideoContent).videoData.youtubeUrl;
    case ContentType.QUIZ:
      return !!(content as QuizContent).quizData.quizId;
    default:
      return true;
  }
}
  const base = {
    sessionId,
    type,
    title: `New ${CONTENT_TYPE_LABELS[type]}`,
    description: '',
    order: 0,
    accessLevel: ContentAccessLevel.FREE,
    isRequired: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  switch (type) {
    case ContentType.VIDEO:
      return {
        ...base,
        videoData: {
          youtubeUrl: '',
          videoId: '',
          autoPlay: false,
          showControls: true,
          allowFullscreen: true,
          playbackSpeed: [0.5, 1, 1.25, 1.5, 2]
        }
      } as Partial<VideoContent>;

    case ContentType.QUIZ:
      return {
        ...base,
        quizData: {
          quizId: '',
          passingScore: 70,
          attemptsAllowed: 3,
          showCorrectAnswers: true,
          shuffleQuestions: false,
          shuffleOptions: false,
          questionCount: 0
        }
      } as Partial<QuizContent>;

    case ContentType.EXERCISE:
      return {
        ...base,
        exerciseData: {
          content: '',
          exerciseType: 'READING',
          hasSubmission: false,
          resources: []
        }
      } as Partial<ExerciseContent>;

    case ContentType.LIVE_SESSION:
      return {
        ...base,
        liveSessionData: {
          scheduledAt: new Date(),
          isRecorded: false,
          status: 'SCHEDULED',
          prerequisites: []
        }
      } as Partial<LiveSessionContent>;

    case ContentType.DOCUMENT:
      return {
        ...base,
        documentData: {
          fileUrl: '',
          fileName: '',
          fileSize: 0,
          fileType: 'PDF',
          isDownloadable: true,
          viewerType: 'EMBED'
        }
      } as Partial<DocumentContent>;

    case ContentType.AUDIO:
      return {
        ...base,
        audioData: {
          audioUrl: '',
          fileName: '',
          fileSize: 0,
          audioFormat: 'MP3',
          isDownloadable: true,
          chapters: [],
          playbackSpeed: [0.5, 1, 1.25, 1.5, 2]
        }
      } as Partial<AudioContent>;

    default:
      return base;
  }
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Named exports untuk types
export type {
  BaseSessionContent,
  VideoContent,
  QuizContent,
  ExerciseContent,
  LiveSessionContent,
  DocumentContent,
  AudioContent,
  AssignmentContent,
  DiscussionContent,
  InteractiveCodeContent,
  NotebookContent,
  SurveyContent,
  SessionContent
};

// ✅ PATTERN: Named exports untuk constants
export {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_DESCRIPTIONS
};

// ✅ PATTERN: Named exports untuk utilities
export {
  createDefaultContent,
  validateContentData
};