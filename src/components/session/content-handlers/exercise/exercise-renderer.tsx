// File: src/components/session/content-handlers/exercise/exercise-renderer.tsx

/**
 * =================================================================
 * 📝 EXERCISE RENDERER COMPONENT
 * =================================================================
 * Text-based exercise content renderer untuk student interface
 * Following Arctic Siberia Import/Export Standard
 * Phase 2 - Priority 2.2 (HIGH)
 * Created: July 2025
 * =================================================================
 */

'use client';

// =================================================================
// 🎯 FRAMEWORK IMPORTS
// =================================================================
import { 
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Progress,
  Separator,
  Textarea
} from '@/components/ui';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Image,
  Link as LinkIcon,
  MessageSquare,
  Send,
  Target
} from 'lucide-react';

// =================================================================
// 🎯 EXTERNAL LIBRARIES
// =================================================================
import { toast } from 'sonner';

// =================================================================
// 🎯 LOCAL UTILITIES - Session types
// =================================================================
import type {
  ExerciseContent,
  ContentType
} from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface ExerciseRendererProps {
  content: ExerciseContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onSubmission?: (submission: string) => Promise<void>;
  onError?: (error: string) => void;
  readOnly?: boolean;
  className?: string;
}

interface ExerciseState {
  isReading: boolean;
  isCompleted: boolean;
  readingProgress: number;
  readingStartTime: Date | null;
  readingDuration: number;
  submissionText: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

interface ReadingTrackerProps {
  content: string;
  estimatedTime?: number;
  onProgressChange: (progress: number) => void;
  onComplete: () => void;
}

interface ResourceItemProps {
  resource: {
    title: string;
    url: string;
    type: 'LINK' | 'PDF' | 'IMAGE';
  };
  index: number;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Calculate estimated reading time based on content
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Format duration in minutes and seconds
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

/**
 * Clean HTML content for display
 */
function sanitizeContent(content: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Extract text content from HTML
 */
function extractTextContent(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

// =================================================================
// 🎯 READING TRACKER SUB-COMPONENT
// =================================================================

function ReadingTracker({ 
  content, 
  estimatedTime, 
  onProgressChange, 
  onComplete 
}: ReadingTrackerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeProgress, setTimeProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);

  const estimatedMs = (estimatedTime || calculateReadingTime(extractTextContent(content))) * 60 * 1000;

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      
      if (scrollHeight > 0) {
        const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
        setScrollProgress(progress);
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Track time progress
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / estimatedMs) * 100, 100);
      setTimeProgress(progress);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, estimatedMs]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    return Math.max(scrollProgress * 0.7 + timeProgress * 0.3, 0);
  }, [scrollProgress, timeProgress]);

  // Report progress changes
  useEffect(() => {
    onProgressChange(overallProgress);
    
    if (overallProgress >= 90 && scrollProgress >= 80) {
      onComplete();
    }
  }, [overallProgress, scrollProgress, onProgressChange, onComplete]);

  return (
    <div 
      ref={contentRef}
      className="max-h-96 overflow-y-auto prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg"
      dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }}
    />
  );
}

// =================================================================
// 🎯 RESOURCE ITEM SUB-COMPONENT
// =================================================================

function ResourceItem({ resource, index }: ResourceItemProps) {
  const getIcon = () => {
    switch (resource.type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'IMAGE':
        return <Image className="w-4 h-4 text-blue-500" />;
      case 'LINK':
      default:
        return <LinkIcon className="w-4 h-4 text-green-500" />;
    }
  };

  const handleClick = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {resource.title}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {resource.type} • {new URL(resource.url).hostname}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400" />
    </div>
  );
}

// =================================================================
// 🎯 SUBMISSION FORM SUB-COMPONENT
// =================================================================

function SubmissionForm({
  instructions,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  hasSubmitted,
  readOnly
}: {
  instructions?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-4">
      {instructions && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Submission Instructions</h4>
              <p className="text-sm text-blue-800">{instructions}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Your Response
        </label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your response here..."
          rows={6}
          disabled={readOnly || hasSubmitted}
          className="resize-none"
        />
        <div className="text-xs text-gray-500 text-right">
          {value.length} characters
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={!value.trim() || isSubmitting || hasSubmitted}
            className="min-w-24"
          >
            {isSubmitting ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Submitting...
              </>
            ) : hasSubmitted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submitted
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// =================================================================
// 🎯 EXERCISE TYPE BADGE SUB-COMPONENT
// =================================================================

function ExerciseTypeBadge({ type }: { type: 'READING' | 'PRACTICE' | 'REFLECTION' }) {
  const getConfig = () => {
    switch (type) {
      case 'READING':
        return {
          icon: <BookOpen className="w-3 h-3" />,
          label: 'Reading',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'PRACTICE':
        return {
          icon: <Target className="w-3 h-3" />,
          label: 'Practice',
          className: 'bg-green-100 text-green-800'
        };
      case 'REFLECTION':
        return {
          icon: <MessageSquare className="w-3 h-3" />,
          label: 'Reflection',
          className: 'bg-purple-100 text-purple-800'
        };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="secondary" className={config.className}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
}

// =================================================================
// 🎯 MAIN EXERCISE RENDERER COMPONENT
// =================================================================

export default function ExerciseRenderer({
  content,
  onProgress,
  onComplete,
  onSubmission,
  onError,
  readOnly = false,
  className = ''
}: ExerciseRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<ExerciseState>({
    isReading: false,
    isCompleted: false,
    readingProgress: 0,
    readingStartTime: null,
    readingDuration: 0,
    submissionText: '',
    isSubmitting: false,
    hasSubmitted: false
  });

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const estimatedReadingTime = useMemo(() => {
    return content.exerciseData.estimatedReadingTime || 
           calculateReadingTime(extractTextContent(content.exerciseData.content));
  }, [content.exerciseData.content, content.exerciseData.estimatedReadingTime]);

  const hasResources = useMemo(() => {
    return content.exerciseData.resources && content.exerciseData.resources.length > 0;
  }, [content.exerciseData.resources]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleStartReading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isReading: true,
      readingStartTime: new Date()
    }));
  }, []);

  const handleProgressChange = useCallback((progress: number) => {
    setState(prev => ({ ...prev, readingProgress: progress }));
    onProgress?.(progress);
  }, [onProgress]);

  const handleReadingComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCompleted: true,
      readingDuration: prev.readingStartTime 
        ? Math.floor((Date.now() - prev.readingStartTime.getTime()) / 1000)
        : 0
    }));
    onComplete?.();
    toast.success('Exercise completed!');
  }, [onComplete]);

  const handleSubmissionChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, submissionText: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.submissionText.trim()) {
      toast.error('Please write a response before submitting');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmission?.(state.submissionText);
      setState(prev => ({ ...prev, hasSubmitted: true, isSubmitting: false }));
      toast.success('Response submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      setState(prev => ({ ...prev, isSubmitting: false }));
      onError?.('Failed to submit response');
      toast.error('Failed to submit response');
    }
  }, [state.submissionText, onSubmission, onError]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  useEffect(() => {
    // Auto-start reading for reading exercises
    if (content.exerciseData.exerciseType === 'READING') {
      handleStartReading();
    }
  }, [content.exerciseData.exerciseType, handleStartReading]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {content.title}
            </CardTitle>
            {content.description && (
              <CardDescription>{content.description}</CardDescription>
            )}
          </div>
          <ExerciseTypeBadge type={content.exerciseData.exerciseType} />
        </div>

        {/* Exercise Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{estimatedReadingTime} min read</span>
          </div>
          {content.exerciseData.hasSubmission && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Submission required</span>
            </div>
          )}
          {hasResources && (
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{content.exerciseData.resources?.length} resources</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Reading Progress */}
        {state.isReading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reading Progress</span>
              <span className="font-medium">{Math.round(state.readingProgress)}%</span>
            </div>
            <Progress value={state.readingProgress} className="h-2" />
          </div>
        )}

        {/* Exercise Content */}
        <div className="space-y-4">
          {state.isReading ? (
            <ReadingTracker
              content={content.exerciseData.content}
              estimatedTime={estimatedReadingTime}
              onProgressChange={handleProgressChange}
              onComplete={handleReadingComplete}
            />
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Start?
              </h3>
              <p className="text-gray-600 mb-4">
                Click below to begin this {content.exerciseData.exerciseType.toLowerCase()} exercise
              </p>
              <Button onClick={handleStartReading}>
                Start Reading
              </Button>
            </div>
          )}
        </div>

        {/* Completion Status */}
        {state.isCompleted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Exercise Completed!</div>
                <div className="text-sm text-green-700">
                  Completed in {formatDuration(state.readingDuration)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Section */}
        {hasResources && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Resources</h3>
              <div className="grid gap-2">
                {content.exerciseData.resources?.map((resource, index) => (
                  <ResourceItem 
                    key={index}
                    resource={resource}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Submission Form */}
        {content.exerciseData.hasSubmission && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Response</h3>
              <SubmissionForm
                instructions={content.exerciseData.submissionInstructions}
                value={state.submissionText}
                onChange={handleSubmissionChange}
                onSubmit={handleSubmit}
                isSubmitting={state.isSubmitting}
                hasSubmitted={state.hasSubmitted}
                readOnly={readOnly}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default ExerciseRenderer;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  ReadingTracker, 
  ResourceItem, 
  SubmissionForm,
  ExerciseTypeBadge
};

// ✅ PATTERN: Named exports untuk utilities
export {
  calculateReadingTime,
  formatDuration,
  sanitizeContent,
  extractTextContent
};

// ✅ PATTERN: Named exports untuk types
export type { 
  ExerciseRendererProps,
  ExerciseState,
  ReadingTrackerProps,
  ResourceItemProps
};

// ✅ PATTERN: Display name untuk debugging
ExerciseRenderer.displayName = 'ExerciseRenderer';