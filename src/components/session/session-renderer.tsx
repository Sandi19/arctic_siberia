// File: src/components/session/session-renderer.tsx

/**
 * =================================================================
 * 🎯 SESSION RENDERER COMPONENT
 * =================================================================
 * Main session renderer interface untuk student learning experience
 * Dynamic content rendering dengan progress tracking
 * Following Arctic Siberia Import/Export Standard
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ FIXED: Framework imports
import { 
  useCallback,
  useEffect,
  useMemo,
  useState 
} from 'react';

// ✅ FIXED: UI Components menggunakan barrel imports dari index.ts
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ FIXED: Icons - grouped together
import {
  BookOpen,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Lock,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Star,
  Target,
  User,
  Volume2
} from 'lucide-react';

// ✅ FIXED: External libraries - grouped together
import { toast } from 'sonner';

// ✅ FIXED: Local utilities & types
import { cn } from '@/lib/utils';
import type {
  ContentAccessLevel,
  ContentType,
  Session,
  SessionContent,
  SessionProgress,
  SessionRendererConfig,
  SessionRendererState
} from './types';

// ✅ FIXED: Constants & configs - separated from types
import {
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS
} from './types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface SessionRendererProps {
  session: Session;
  config?: Partial<SessionRendererConfig>;
  onProgress?: (contentId: string, progress: number) => void;
  onComplete?: (sessionId: string) => void;
  onContentChange?: (contentId: string) => void;
  className?: string;
}

interface ContentRendererProps {
  content: SessionContent;
  isActive: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

interface SessionSidebarProps {
  session: Session;
  currentContentId: string | null;
  progress: SessionProgress | null;
  onContentSelect: (contentId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface SessionNavigationProps {
  currentIndex: number;
  totalContents: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

interface SessionHeaderProps {
  session: Session;
  progress: SessionProgress | null;
  onToggleSidebar: () => void;
}

// =================================================================
// 🎯 DEFAULT CONFIGURATION
// =================================================================

const DEFAULT_CONFIG: SessionRendererConfig = {
  allowNotes: true,
  allowBookmarks: true,
  trackProgress: true,
  autoPlay: false,
  showPrerequisites: true,
  enableComments: false
};

// =================================================================
// 🎯 CONTENT RENDERER COMPONENTS
// =================================================================

function VideoContentRenderer({ content, isActive, onComplete, onProgress }: ContentRendererProps) {
  const videoContent = content as any; // VideoContent type
  
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <Play className="h-12 w-12 mx-auto mb-2" />
          <p>Video Player</p>
          <p className="text-sm opacity-75">
            {videoContent.videoData?.youtubeUrl || 'No video URL'}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Replay
        </Button>
        
        <Button onClick={onComplete} size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </Button>
      </div>
    </div>
  );
}

function QuizContentRenderer({ content, isActive, onComplete, onProgress }: ContentRendererProps) {
  const quizContent = content as any; // QuizContent type
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quiz: {content.title}
          </CardTitle>
          <CardDescription>
            {quizContent.quizData?.questionCount || 0} questions • {' '}
            {quizContent.quizData?.timeLimit ? `${quizContent.quizData.timeLimit} minutes` : 'No time limit'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-lg font-medium mb-2">Ready to test your knowledge?</h3>
            <p className="text-muted-foreground mb-4">
              This quiz will help reinforce what you've learned.
            </p>
            <Button onClick={onComplete}>
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExerciseContentRenderer({ content, isActive, onComplete, onProgress }: ContentRendererProps) {
  const exerciseContent = content as any; // ExerciseContent type
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Exercise: {content.title}
          </CardTitle>
          {exerciseContent.exerciseData?.estimatedReadingTime && (
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {exerciseContent.exerciseData.estimatedReadingTime} min read
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: exerciseContent.exerciseData?.content || '<p>No content available</p>' 
          }} />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={onComplete}>
          <Check className="h-4 w-4 mr-2" />
          Complete Reading
        </Button>
      </div>
    </div>
  );
}

function DocumentContentRenderer({ content, isActive, onComplete, onProgress }: ContentRendererProps) {
  const documentContent = content as any; // DocumentContent type
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document: {content.title}
          </CardTitle>
          <CardDescription>
            {documentContent.documentData?.fileType} • {' '}
            {documentContent.documentData?.pages ? `${documentContent.documentData.pages} pages` : 'Document file'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="border rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">{documentContent.documentData?.fileName}</h3>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Document
              </Button>
              {documentContent.documentData?.isDownloadable && (
                <Button variant="outline" size="sm">
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={onComplete}>
          <Check className="h-4 w-4 mr-2" />
          Mark as Read
        </Button>
      </div>
    </div>
  );
}

function DefaultContentRenderer({ content, isActive, onComplete, onProgress }: ContentRendererProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>
            {CONTENT_TYPE_LABELS[content.type]} Content
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="font-medium mb-2">Content Not Available</h3>
            <p className="text-muted-foreground mb-4">
              This content type is coming soon.
            </p>
            <Button onClick={onComplete} variant="outline">
              Mark Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================================
// 🎯 DYNAMIC CONTENT RENDERER
// =================================================================

function DynamicContentRenderer({ content, isActive, onComplete, onProgress }: ContentRendererProps) {
  const renderers = {
    [ContentType.VIDEO]: VideoContentRenderer,
    [ContentType.QUIZ]: QuizContentRenderer,
    [ContentType.EXERCISE]: ExerciseContentRenderer,
    [ContentType.DOCUMENT]: DocumentContentRenderer,
    [ContentType.AUDIO]: DefaultContentRenderer,
    [ContentType.LIVE_SESSION]: DefaultContentRenderer,
    [ContentType.ASSIGNMENT]: DefaultContentRenderer,
    [ContentType.DISCUSSION]: DefaultContentRenderer,
    [ContentType.INTERACTIVE_CODE]: DefaultContentRenderer,
    [ContentType.NOTEBOOK]: DefaultContentRenderer,
    [ContentType.SURVEY]: DefaultContentRenderer
  };
  
  const RendererComponent = renderers[content.type] || DefaultContentRenderer;
  
  return (
    <RendererComponent
      content={content}
      isActive={isActive}
      onComplete={onComplete}
      onProgress={onProgress}
    />
  );
}

// =================================================================
// 🎯 SESSION SIDEBAR COMPONENT
// =================================================================

function SessionSidebar({ 
  session, 
  currentContentId, 
  progress, 
  onContentSelect, 
  isOpen, 
  onClose 
}: SessionSidebarProps) {
  
  const isContentCompleted = useCallback((contentId: string) => {
    return progress?.completedContents.includes(contentId) || false;
  }, [progress?.completedContents]);
  
  const isContentAccessible = useCallback((content: SessionContent) => {
    // Free content is always accessible
    if (content.accessLevel === ContentAccessLevel.FREE) return true;
    
    // Premium content requires subscription (mock logic)
    return true; // In real app, check user subscription
  }, []);
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="line-clamp-2">{session.title}</SheetTitle>
          <SheetDescription>
            {session.totalContents} contents • {session.estimatedDuration} minutes
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress?.progressPercentage || 0}%</span>
            </div>
            <Progress value={progress?.progressPercentage || 0} />
          </div>
          
          <Separator />
          
          {/* Content List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2">
              {session.contents.map((content, index) => {
                const isCompleted = isContentCompleted(content.id);
                const isAccessible = isContentAccessible(content);
                const isCurrent = currentContentId === content.id;
                
                return (
                  <button
                    key={content.id}
                    onClick={() => isAccessible && onContentSelect(content.id)}
                    disabled={!isAccessible}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-colors',
                      isCurrent && 'bg-primary/5 border-primary',
                      !isCurrent && isAccessible && 'hover:bg-muted',
                      !isAccessible && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : !isAccessible ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {index + 1}.
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {CONTENT_TYPE_LABELS[content.type]}
                          </Badge>
                          {content.accessLevel === ContentAccessLevel.PREMIUM && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {content.title}
                        </h4>
                        
                        {content.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {content.duration} min
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// =================================================================
// 🎯 SESSION NAVIGATION COMPONENT
// =================================================================

function SessionNavigation({ 
  currentIndex, 
  totalContents, 
  canGoNext, 
  canGoPrevious, 
  onNext, 
  onPrevious, 
  onReset 
}: SessionNavigationProps) {
  
  return (
    <div className="flex items-center justify-between p-4 border-t bg-background">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {currentIndex + 1} of {totalContents}
      </div>
      
      <Button
        onClick={onNext}
        disabled={!canGoNext}
        size="sm"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// =================================================================
// 🎯 SESSION HEADER COMPONENT
// =================================================================

function SessionHeader({ session, progress, onToggleSidebar }: SessionHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div>
          <h1 className="font-semibold line-clamp-1">{session.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{session.totalContents} contents</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{session.estimatedDuration} minutes</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{progress?.progressPercentage || 0}% complete</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bookmark session</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN SESSION RENDERER COMPONENT
// =================================================================

function SessionRenderer({ 
  session, 
  config, 
  onProgress, 
  onComplete, 
  onContentChange,
  className 
}: SessionRendererProps) {
  
  // Merge configuration
  const rendererConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }), [config]);
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<SessionRendererState>({
    currentContentId: null,
    currentContentIndex: 0,
    progress: null,
    isLoading: false,
    isFullscreen: false,
    sidebarOpen: false,
    contentHistory: [],
    error: null
  });
  
  // =================================================================
  // 🎯 COMPUTED PROPERTIES
  // =================================================================
  
  const currentContent = useMemo(() => {
    if (!state.currentContentId) return null;
    return session.contents.find(c => c.id === state.currentContentId) || null;
  }, [session.contents, state.currentContentId]);
  
  const canGoNext = useMemo(() => {
    return state.currentContentIndex < session.contents.length - 1;
  }, [state.currentContentIndex, session.contents.length]);
  
  const canGoPrevious = useMemo(() => {
    return state.currentContentIndex > 0;
  }, [state.currentContentIndex]);
  
  const mockProgress: SessionProgress = useMemo(() => ({
    id: 'mock-progress',
    sessionId: session.id,
    studentId: 'current-student',
    completedContents: [],
    progressPercentage: 0,
    timeSpent: 0,
    isCompleted: false,
    quizScores: [],
    lastAccessedAt: new Date(),
    accessCount: 1,
    notes: [],
    bookmarks: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }), [session.id]);
  
  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================
  
  const handleContentSelect = useCallback((contentId: string) => {
    const contentIndex = session.contents.findIndex(c => c.id === contentId);
    if (contentIndex === -1) return;
    
    setState(prev => ({
      ...prev,
      currentContentId: contentId,
      currentContentIndex: contentIndex,
      contentHistory: [...prev.contentHistory, contentId]
    }));
    
    onContentChange?.(contentId);
  }, [session.contents, onContentChange]);
  
  const handleNext = useCallback(() => {
    if (canGoNext) {
      const nextIndex = state.currentContentIndex + 1;
      const nextContent = session.contents[nextIndex];
      handleContentSelect(nextContent.id);
    }
  }, [canGoNext, state.currentContentIndex, session.contents, handleContentSelect]);
  
  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      const prevIndex = state.currentContentIndex - 1;
      const prevContent = session.contents[prevIndex];
      handleContentSelect(prevContent.id);
    }
  }, [canGoPrevious, state.currentContentIndex, session.contents, handleContentSelect]);
  
  const handleReset = useCallback(() => {
    if (session.contents.length > 0) {
      handleContentSelect(session.contents[0].id);
    }
  }, [session.contents, handleContentSelect]);
  
  const handleContentComplete = useCallback(() => {
    if (!currentContent) return;
    
    // Mark content as complete
    onProgress?.(currentContent.id, 100);
    
    // Auto-advance to next content
    if (canGoNext && rendererConfig.autoPlay) {
      setTimeout(() => handleNext(), 1000);
    }
    
    toast.success('Content completed!');
  }, [currentContent, onProgress, canGoNext, rendererConfig.autoPlay, handleNext]);
  
  const handleContentProgress = useCallback((progress: number) => {
    if (!currentContent) return;
    onProgress?.(currentContent.id, progress);
  }, [currentContent, onProgress]);
  
  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Initialize with first content
  useEffect(() => {
    if (session.contents.length > 0 && !state.currentContentId) {
      handleContentSelect(session.contents[0].id);
    }
  }, [session.contents, state.currentContentId, handleContentSelect]);
  
  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  if (session.contents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">No Content Available</h3>
          <p className="text-muted-foreground">
            This session doesn't have any content yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-screen bg-background', className)}>
      {/* Header */}
      <SessionHeader
        session={session}
        progress={mockProgress}
        onToggleSidebar={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 max-w-4xl mx-auto">
            {currentContent && (
              <DynamicContentRenderer
                content={currentContent}
                isActive={true}
                onComplete={handleContentComplete}
                onProgress={handleContentProgress}
              />
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Navigation */}
      <SessionNavigation
        currentIndex={state.currentContentIndex}
        totalContents={session.contents.length}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onReset={handleReset}
      />
      
      {/* Sidebar */}
      <SessionSidebar
        session={session}
        currentContentId={state.currentContentId}
        progress={mockProgress}
        onContentSelect={handleContentSelect}
        isOpen={state.sidebarOpen}
        onClose={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
      />
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default SessionRenderer;

// ✅ PATTERN: Named exports untuk types dan sub-components
export type { 
  SessionRendererProps,
  ContentRendererProps,
  SessionSidebarProps,
  SessionNavigationProps,
  SessionHeaderProps
};

export {
  DynamicContentRenderer,
  SessionSidebar,
  SessionNavigation,
  SessionHeader
};