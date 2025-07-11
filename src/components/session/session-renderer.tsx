// File: src/components/session/session-renderer.tsx

/**
 * =================================================================
 * 🎯 SESSION RENDERER COMPONENT - MAIN STUDENT INTERFACE
 * =================================================================
 * Dynamic session renderer with content type detection
 * Perfect for language learning course consumption
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 2D
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useState, useCallback, useMemo, useEffect } from 'react';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Separator,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea
} from '@/components/ui';

// ✅ Icons
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  Circle,
  BookOpen,
  Clock,
  Star,
  Eye,
  EyeOff,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Volume2,
  Maximize,
  MessageSquare,
  Bookmark,
  Download,
  Share
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { 
  SessionRendererProps, 
  Session,
  SessionContent,
  ContentType,
  SessionProgress,
  SessionRendererState,
  SessionRendererConfig
} from './types';

// ✅ Content Renderers (relative imports)
import VideoRenderer from './content-handlers/video/video-renderer';
import DocumentRenderer from './content-handlers/document/document-renderer';
import LiveSessionRenderer from './content-handlers/live-session/live-session-renderer';
import QuizRenderer from './content-handlers/quiz/quiz-renderer';
import AssignmentRenderer from './content-handlers/assignment/assignment-renderer';

// =================================================================
// 🎯 MOCK DATA
// =================================================================

const MOCK_SESSION_CONTENTS: SessionContent[] = [
  {
    id: 'content-1',
    sessionId: 'session-1',
    type: 'VIDEO',
    title: 'Russian Grammar Basics',
    description: 'Introduction to Russian grammar fundamentals',
    order: 1,
    accessLevel: 'FREE',
    duration: 15,
    isFree: true,
    videoData: {
      youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      autoPlay: false,
      showControls: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'content-2',
    sessionId: 'session-1',
    type: 'DOCUMENT',
    title: 'Grammar Reference Sheet',
    description: 'Downloadable grammar reference materials',
    order: 2,
    accessLevel: 'FREE',
    duration: 10,
    isFree: true,
    documentData: {
      fileUrl: '/documents/grammar-reference.pdf',
      fileName: 'Russian Grammar Reference.pdf',
      fileType: 'application/pdf',
      fileSize: 2048000,
      isDownloadable: true,
      pages: 12
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'content-3',
    sessionId: 'session-1',
    type: 'QUIZ',
    title: 'Grammar Knowledge Check',
    description: 'Test your understanding of grammar concepts',
    order: 3,
    accessLevel: 'FREE',
    duration: 8,
    isFree: true,
    quizData: {
      quizId: 'quiz-1',
      title: 'Russian Grammar Quiz',
      questionCount: 5,
      timeLimit: 480,
      passingScore: 70,
      attempts: 3
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'content-4',
    sessionId: 'session-1',
    type: 'LIVE_SESSION',
    title: 'Speaking Practice Session',
    description: 'Live conversation practice with instructor',
    order: 4,
    accessLevel: 'PREMIUM',
    duration: 30,
    isFree: false,
    liveSessionData: {
      meetingLink: 'https://zoom.us/j/123456789',
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      duration: 30,
      meetingId: '123-456-789',
      passcode: 'russian123',
      instructions: 'Join for speaking practice and Q&A'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'content-5',
    sessionId: 'session-1',
    type: 'ASSIGNMENT',
    title: 'Grammar Exercise Assignment',
    description: 'Complete grammar exercises and submit your work',
    order: 5,
    accessLevel: 'FREE',
    duration: 20,
    isFree: true,
    assignmentData: {
      instructions: 'Complete the grammar exercises in the attached worksheet and submit your answers.',
      taskFileUrl: '/assignments/grammar-exercises.pdf',
      deadline: new Date(Date.now() + 7 * 86400000), // 1 week from now
      submissionFormats: ['PDF', 'DOC', 'DOCX'],
      maxFileSize: 10485760 // 10MB
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// =================================================================
// 🎯 CONTENT TYPE RENDERER MAP
// =================================================================

const ContentRendererMap = {
  VIDEO: VideoRenderer,
  DOCUMENT: DocumentRenderer,
  LIVE_SESSION: LiveSessionRenderer,
  QUIZ: QuizRenderer,
  ASSIGNMENT: AssignmentRenderer
} as const;

// =================================================================
// 🎯 CONTENT NAVIGATION COMPONENT
// =================================================================

interface ContentNavigationProps {
  contents: SessionContent[];
  currentContentId: string | null;
  onContentSelect: (contentId: string) => void;
  progress: Record<string, boolean>;
}

function ContentNavigation({ 
  contents, 
  currentContentId, 
  onContentSelect, 
  progress 
}: ContentNavigationProps) {
  
  const getContentIcon = (type: ContentType) => {
    const icons = {
      VIDEO: Play,
      DOCUMENT: BookOpen,
      LIVE_SESSION: Volume2,
      QUIZ: MessageSquare,
      ASSIGNMENT: Star
    };
    return icons[type] || Circle;
  };

  return (
    <div className="space-y-2">
      {contents.map((content, index) => {
        const Icon = getContentIcon(content.type);
        const isActive = content.id === currentContentId;
        const isCompleted = progress[content.id] || false;
        
        return (
          <button
            key={content.id}
            onClick={() => onContentSelect(content.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
              isActive 
                ? "bg-blue-100 text-blue-900 border-l-4 border-blue-500" 
                : "hover:bg-gray-50",
              isCompleted && "bg-green-50 text-green-900"
            )}
          >
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-600" : "text-gray-400"
                )} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  {index + 1}.
                </span>
                <span className="text-sm font-medium truncate">
                  {content.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {content.type}
                </Badge>
                {content.duration && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {content.duration}m
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {!content.isFree && (
                <Badge variant="default" className="text-xs">
                  Premium
                </Badge>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =================================================================
// 🎯 MAIN SESSION RENDERER COMPONENT
// =================================================================

function SessionRenderer({
  session,
  studentId,
  config,
  onProgress,
  onComplete,
  onContentChange,
  className
}: SessionRendererProps) {
  
  // =================================================================
  // 🎯 CONFIGURATION
  // =================================================================
  
  const rendererConfig: SessionRendererConfig = {
    allowNotes: true,
    allowBookmarks: true,
    trackProgress: true,
    autoPlay: false,
    showPrerequisites: true,
    enableComments: false,
    ...config
  };

  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================

  const [state, setState] = useState<SessionRendererState>({
    currentContentId: null,
    currentContentIndex: 0,
    progress: null,
    isLoading: false,
    isFullscreen: false,
    sidebarOpen: true,
    contentHistory: [],
    error: null
  });

  // Mock session contents (in real app, this would come from props or API)
  const sessionContents = useMemo(() => {
    return MOCK_SESSION_CONTENTS
      .filter(content => content.sessionId === session.id)
      .sort((a, b) => a.order - b.order);
  }, [session.id]);

  // Mock progress data
  const [contentProgress, setContentProgress] = useState<Record<string, boolean>>({
    'content-1': true,  // Video completed
    'content-2': true,  // Document completed
    'content-3': false, // Quiz not completed
    'content-4': false, // Live session not completed
    'content-5': false  // Assignment not completed
  });

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================

  const currentContent = useMemo(() => {
    if (!state.currentContentId) return sessionContents[0] || null;
    return sessionContents.find(content => content.id === state.currentContentId) || null;
  }, [state.currentContentId, sessionContents]);

  const progressPercentage = useMemo(() => {
    const completedCount = Object.values(contentProgress).filter(Boolean).length;
    return sessionContents.length > 0 ? (completedCount / sessionContents.length) * 100 : 0;
  }, [contentProgress, sessionContents.length]);

  const canNavigate = useMemo(() => ({
    previous: state.currentContentIndex > 0,
    next: state.currentContentIndex < sessionContents.length - 1
  }), [state.currentContentIndex, sessionContents.length]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleContentSelect = useCallback((contentId: string) => {
    const contentIndex = sessionContents.findIndex(content => content.id === contentId);
    if (contentIndex === -1) return;

    setState(prev => ({
      ...prev,
      currentContentId: contentId,
      currentContentIndex: contentIndex,
      contentHistory: [...prev.contentHistory.filter(id => id !== contentId), contentId]
    }));

    onContentChange?.(contentId);
  }, [sessionContents, onContentChange]);

  const handleContentComplete = useCallback((contentId: string) => {
    setContentProgress(prev => ({
      ...prev,
      [contentId]: true
    }));

    onProgress?.(contentId, 100);

    // Auto-advance to next content if available
    const currentIndex = sessionContents.findIndex(content => content.id === contentId);
    const nextContent = sessionContents[currentIndex + 1];
    
    if (nextContent) {
      setTimeout(() => {
        handleContentSelect(nextContent.id);
      }, 1000);
    } else {
      // Session completed
      onComplete?.(session.id);
    }
  }, [sessionContents, onProgress, onComplete, session.id, handleContentSelect]);

  const handleNavigate = useCallback((direction: 'previous' | 'next') => {
    const newIndex = direction === 'next' 
      ? state.currentContentIndex + 1 
      : state.currentContentIndex - 1;
    
    const targetContent = sessionContents[newIndex];
    if (targetContent) {
      handleContentSelect(targetContent.id);
    }
  }, [state.currentContentIndex, sessionContents, handleContentSelect]);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================

  useEffect(() => {
    // Initialize with first content
    if (sessionContents.length > 0 && !state.currentContentId) {
      handleContentSelect(sessionContents[0].id);
    }
  }, [sessionContents, state.currentContentId, handleContentSelect]);

  // =================================================================
  // 🎯 DYNAMIC CONTENT RENDERER
  // =================================================================

  const renderCurrentContent = useCallback(() => {
    if (!currentContent) {
      return (
        <div className="flex items-center justify-center h-96 text-center">
          <div>
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
            <p className="text-gray-600">This session doesn't have any content yet.</p>
          </div>
        </div>
      );
    }

    const RendererComponent = ContentRendererMap[currentContent.type];
    
    if (!RendererComponent) {
      return (
        <Alert>
          <AlertDescription>
            Content type "{currentContent.type}" is not supported yet.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <RendererComponent
        content={currentContent}
        isActive={true}
        onComplete={() => handleContentComplete(currentContent.id)}
        onProgress={(progress) => onProgress?.(currentContent.id, progress)}
      />
    );
  }, [currentContent, handleContentComplete, onProgress]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn(
      "flex flex-col h-screen bg-gray-50",
      state.isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      
      {/* =================================================================
          🎯 HEADER BAR
          ================================================================= */}
      
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div>
              <h1 className="font-semibold text-gray-900">{session.title}</h1>
              <p className="text-sm text-gray-600">
                {currentContent?.title || 'No content selected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(progressPercentage)}%
              </div>
              <Progress value={progressPercentage} className="w-32" />
            </div>
            
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* =================================================================
          🎯 MAIN CONTENT AREA
          ================================================================= */}
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300",
          state.sidebarOpen ? "w-80" : "w-0",
          "lg:w-80 lg:block",
          !state.sidebarOpen && "lg:w-0"
        )}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-gray-900">Session Content</h2>
                <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2">
                <Progress value={progressPercentage} className="w-full" />
                <p className="text-xs text-gray-600 mt-1">
                  {Object.values(contentProgress).filter(Boolean).length} of {sessionContents.length} completed
                </p>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                <ContentNavigation
                  contents={sessionContents}
                  currentContentId={state.currentContentId}
                  onContentSelect={handleContentSelect}
                  progress={contentProgress}
                />
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {renderCurrentContent()}
            </div>
          </div>
          
          {/* Navigation Controls */}
          <footer className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => handleNavigate('previous')}
                disabled={!canNavigate.previous}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {state.currentContentIndex + 1} of {sessionContents.length}
                </span>
              </div>
              
              <Button
                onClick={() => handleNavigate('next')}
                disabled={!canNavigate.next}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </main>
      </div>

      {/* =================================================================
          🎯 ERROR DISPLAY
          ================================================================= */}
      
      {state.error && (
        <Alert className="m-4" variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// =================================================================
// 🎯 DEFAULT EXPORT (Arctic Siberia Standard)
// =================================================================

export default SessionRenderer;