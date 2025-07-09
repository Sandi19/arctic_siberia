// File: src/components/session/content-handlers/video/video-renderer.tsx

/**
 * =================================================================
 * 🎬 VIDEO RENDERER COMPONENT
 * =================================================================
 * YouTube video content renderer untuk student interface
 * Following Arctic Siberia Import/Export Standard
 * Phase 2 - Priority 2.1 (HIGH)
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
  useRef,
  useState
} from 'react';

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  AlertCircle,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton
} from '@/components/ui';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

// =================================================================
// 🎯 EXTERNAL LIBRARIES
// =================================================================
import { toast } from 'sonner';

// =================================================================
// 🎯 LOCAL UTILITIES - Session types
// =================================================================
import type {
  VideoContent,
  ContentType
} from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface VideoRendererProps {
  content: VideoContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

interface VideoPlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage: string | null;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
}

interface VideoPlayerControls {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  restart: () => void;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate completion percentage
 */
function calculateProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.min((currentTime / duration) * 100, 100);
}

// =================================================================
// 🎯 VIDEO PLAYER SUB-COMPONENT
// =================================================================

function VideoPlayer({ 
  videoId, 
  onStateChange,
  autoPlay = false,
  showControls = true
}: {
  videoId: string;
  onStateChange: (state: Partial<VideoPlayerState>) => void;
  autoPlay?: boolean;
  showControls?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Construct YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?` +
    `autoplay=${autoPlay ? 1 : 0}&` +
    `controls=${showControls ? 1 : 0}&` +
    `rel=0&` +
    `modestbranding=1&` +
    `enablejsapi=1`;

  const handleLoad = useCallback(() => {
    onStateChange({ isLoading: false });
  }, [onStateChange]);

  const handleError = useCallback(() => {
    onStateChange({ 
      hasError: true, 
      errorMessage: 'Failed to load video',
      isLoading: false 
    });
  }, [onStateChange]);

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title="Video Content"
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// =================================================================
// 🎯 VIDEO CONTROLS SUB-COMPONENT
// =================================================================

function VideoControls({
  state,
  controls,
  content
}: {
  state: VideoPlayerState;
  controls: VideoPlayerControls;
  content: VideoContent;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-b-lg">
      {/* Play/Pause Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={state.isPlaying ? controls.pause : controls.play}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          disabled={state.hasError}
        >
          {state.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        
        <button
          onClick={controls.restart}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={state.hasError}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{formatTime(state.currentTime)}</span>
        <span>/</span>
        <span>{formatTime(state.duration)}</span>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={controls.toggleMute}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={state.hasError}
        >
          {state.isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        
        <Settings className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

// =================================================================
// 🎯 ERROR STATE SUB-COMPONENT
// =================================================================

function VideoError({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full aspect-video bg-gray-100 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Video Unavailable
      </h3>
      <p className="text-gray-600 text-center mb-4 max-w-md">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// =================================================================
// 🎯 LOADING STATE SUB-COMPONENT
// =================================================================

function VideoLoading() {
  return (
    <div className="w-full aspect-video">
      <Skeleton className="w-full h-full rounded-lg" />
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-6" />
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN VIDEO RENDERER COMPONENT
// =================================================================

export default function VideoRenderer({
  content,
  onProgress,
  onComplete,
  onError,
  autoPlay = false,
  showControls = true,
  className = ''
}: VideoRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<VideoPlayerState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    hasError: false,
    errorMessage: null,
    progress: 0,
    duration: 0,
    currentTime: 0,
    volume: 1,
    isMuted: false
  });

  // =================================================================
  // 🎯 VIDEO ID EXTRACTION
  // =================================================================
  
  const videoId = extractYouTubeVideoId(content.videoData.youtubeUrl);

  // =================================================================
  // 🎯 PLAYER CONTROLS
  // =================================================================
  
  const controls: VideoPlayerControls = {
    play: useCallback(() => {
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    }, []),

    pause: useCallback(() => {
      setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    }, []),

    seekTo: useCallback((time: number) => {
      setState(prev => ({ ...prev, currentTime: time }));
    }, []),

    setVolume: useCallback((volume: number) => {
      setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
    }, []),

    toggleMute: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        isMuted: !prev.isMuted,
        volume: prev.isMuted ? 1 : 0
      }));
    }, []),

    restart: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        currentTime: 0, 
        progress: 0,
        isCompleted: false 
      }));
    }, [])
  };

  // =================================================================
  // 🎯 STATE CHANGE HANDLER
  // =================================================================
  
  const handleStateChange = useCallback((newState: Partial<VideoPlayerState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      
      // Calculate progress if duration and currentTime are available
      if (updated.duration > 0) {
        updated.progress = calculateProgress(updated.currentTime, updated.duration);
      }

      // Check completion
      if (updated.progress >= 95 && !updated.isCompleted) {
        updated.isCompleted = true;
        onComplete?.();
        toast.success('Video completed!');
      }

      return updated;
    });
  }, [onComplete]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Progress reporting
  useEffect(() => {
    if (state.progress > 0) {
      onProgress?.(state.progress);
    }
  }, [state.progress, onProgress]);

  // Error reporting
  useEffect(() => {
    if (state.hasError && state.errorMessage) {
      onError?.(state.errorMessage);
    }
  }, [state.hasError, state.errorMessage, onError]);

  // =================================================================
  // 🎯 ERROR HANDLING
  // =================================================================
  
  if (!videoId) {
    return (
      <VideoError 
        message="Invalid YouTube URL. Please check the video link."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (state.hasError) {
    return (
      <VideoError 
        message={state.errorMessage || 'An error occurred while loading the video.'}
        onRetry={() => setState(prev => ({ 
          ...prev, 
          hasError: false, 
          errorMessage: null, 
          isLoading: true 
        }))}
      />
    );
  }

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600" />
          {content.title}
        </CardTitle>
        {content.description && (
          <p className="text-sm text-gray-600">
            {content.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {state.isLoading ? (
          <VideoLoading />
        ) : (
          <>
            <VideoPlayer 
              videoId={videoId}
              onStateChange={handleStateChange}
              autoPlay={autoPlay || content.videoData.autoPlay}
              showControls={showControls && content.videoData.showControls}
            />
            
            {/* Progress Bar */}
            <div className="px-4 py-2">
              <Progress 
                value={state.progress} 
                className="w-full h-2"
              />
            </div>
            
            {/* Video Controls */}
            {showControls && (
              <VideoControls 
                state={state}
                controls={controls}
                content={content}
              />
            )}
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
export default VideoRenderer;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  VideoPlayer, 
  VideoControls, 
  VideoError,
  VideoLoading
};

// ✅ PATTERN: Named exports untuk utilities
export {
  extractYouTubeVideoId,
  formatTime,
  calculateProgress
};

// ✅ PATTERN: Named exports untuk types
export type { 
  VideoRendererProps,
  VideoPlayerState,
  VideoPlayerControls
};

// ✅ PATTERN: Display name untuk debugging
VideoRenderer.displayName = 'VideoRenderer';