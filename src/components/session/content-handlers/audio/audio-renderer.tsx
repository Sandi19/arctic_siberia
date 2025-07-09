// File: src/components/session/content-handlers/audio/audio-renderer.tsx

/**
 * =================================================================
 * 🎵 AUDIO RENDERER COMPONENT
 * =================================================================
 * Audio content renderer untuk student interface
 * Following Arctic Siberia Import/Export Standard
 * Phase 2 - Priority 2.4 (MEDIUM)
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
  Progress,
  Separator,
  Slider
} from '@/components/ui';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  CheckCircle,
  Download,
  Headphones,
  Loader2,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Volume1,
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
  AudioContent,
  ContentType
} from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface AudioRendererProps {
  content: AudioContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
  readOnly?: boolean;
  className?: string;
}

interface AudioPlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage: string | null;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  currentChapter: number;
  hasStartedPlaying: boolean;
  playStartTime: Date | null;
  totalListenTime: number;
}

interface AudioControlsProps {
  state: AudioPlayerState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onRestart: () => void;
  onLoopToggle: () => void;
  onSkipChapter: (direction: 'prev' | 'next') => void;
  chapters?: Array<{ title: string; startTime: number; }>;
}

interface ChapterListProps {
  chapters: Array<{ title: string; startTime: number; }>;
  currentTime: number;
  onSeek: (time: number) => void;
}

interface AudioVisualizerProps {
  isPlaying: boolean;
  volume: number;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get current chapter based on time
 */
function getCurrentChapter(
  currentTime: number, 
  chapters: Array<{ title: string; startTime: number; }>
): number {
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTime >= chapters[i].startTime) {
      return i;
    }
  }
  return 0;
}

/**
 * Calculate completion percentage
 */
function calculateProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.min((currentTime / duration) * 100, 100);
}

// =================================================================
// 🎯 AUDIO VISUALIZER SUB-COMPONENT
// =================================================================

function AudioVisualizer({ isPlaying, volume }: AudioVisualizerProps) {
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 h-12 bg-gray-900 rounded-lg px-4">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`w-1 bg-blue-500 rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: isPlaying 
              ? `${Math.random() * 30 + 10}px`
              : '4px',
            opacity: volume
          }}
        />
      ))}
    </div>
  );
}

// =================================================================
// 🎯 CHAPTER LIST SUB-COMPONENT
// =================================================================

function ChapterList({ chapters, currentTime, onSeek }: ChapterListProps) {
  const currentChapter = getCurrentChapter(currentTime, chapters);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Chapters</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {chapters.map((chapter, index) => (
          <button
            key={index}
            onClick={() => onSeek(chapter.startTime)}
            className={`w-full text-left p-2 rounded text-sm transition-colors ${
              index === currentChapter
                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{chapter.title}</span>
              <span className="text-xs text-gray-500 ml-2">
                {formatTime(chapter.startTime)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =================================================================
// 🎯 AUDIO CONTROLS SUB-COMPONENT
// =================================================================

function AudioControls({
  state,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onSpeedChange,
  onRestart,
  onLoopToggle,
  onSkipChapter,
  chapters = []
}: AudioControlsProps) {
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
        <Slider
          value={[state.currentTime]}
          max={state.duration || 100}
          step={1}
          onValueChange={([value]) => onSeek(value)}
          className="w-full"
          disabled={!state.duration || state.hasError}
        />
        <div className="text-center">
          <Progress value={state.progress} className="h-1" />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRestart}
          disabled={state.hasError}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        {chapters.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSkipChapter('prev')}
            disabled={state.hasError || state.currentChapter === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
        )}

        <Button
          size="lg"
          onClick={state.isPlaying ? onPause : onPlay}
          disabled={state.hasError}
          className="w-14 h-14 rounded-full"
        >
          {state.isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : state.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        {chapters.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSkipChapter('next')}
            disabled={state.hasError || state.currentChapter === chapters.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onLoopToggle}
          className={state.isLooping ? 'bg-blue-100' : ''}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Controls */}
        <div className="flex items-center gap-2 flex-1 max-w-32">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMuteToggle}
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : state.volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[state.isMuted ? 0 : state.volume]}
            max={1}
            step={0.1}
            onValueChange={([value]) => onVolumeChange(value)}
            className="flex-1"
          />
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <select
            value={state.playbackRate}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            {speedOptions.map(speed => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN AUDIO RENDERER COMPONENT
// =================================================================

export default function AudioRenderer({
  content,
  onProgress,
  onComplete,
  onError,
  autoPlay = false,
  readOnly = false,
  className = ''
}: AudioRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<AudioPlayerState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    hasError: false,
    errorMessage: null,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isLooping: false,
    currentChapter: 0,
    hasStartedPlaying: false,
    playStartTime: null,
    totalListenTime: 0
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const chapters = useMemo(() => {
    return content.audioData.chapters || [];
  }, [content.audioData.chapters]);

  const currentChapter = useMemo(() => {
    return getCurrentChapter(state.currentTime, chapters);
  }, [state.currentTime, chapters]);

  const isDownloadAllowed = useMemo(() => {
    return content.audioData.isDownloadable && !readOnly;
  }, [content.audioData.isDownloadable, readOnly]);

  // =================================================================
  // 🎯 AUDIO EVENT HANDLERS
  // =================================================================
  
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        duration: audioRef.current!.duration,
        isLoading: false
      }));
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const progress = calculateProgress(currentTime, audioRef.current.duration);
      
      setState(prev => ({
        ...prev,
        currentTime,
        progress,
        currentChapter: getCurrentChapter(currentTime, chapters)
      }));
    }
  }, [chapters]);

  const handleEnded = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isCompleted: true,
      currentTime: prev.isLooping ? 0 : prev.duration
    }));

    if (!state.isLooping) {
      onComplete?.();
      toast.success('Audio completed!');
    }
  }, [state.isLooping, onComplete]);

  const handleError = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: true,
      errorMessage: 'Failed to load audio file',
      isLoading: false,
      isPlaying: false
    }));
    onError?.('Failed to load audio file');
  }, [onError]);

  // =================================================================
  // 🎯 CONTROL HANDLERS
  // =================================================================
  
  const handlePlay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setState(prev => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          hasStartedPlaying: true,
          playStartTime: prev.playStartTime || new Date()
        }));
      }).catch(() => {
        toast.error('Failed to play audio');
      });
    }
  }, []);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: true
      }));
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({
        ...prev,
        currentTime: time,
        progress: calculateProgress(time, prev.duration)
      }));
    }
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setState(prev => ({
        ...prev,
        volume,
        isMuted: volume === 0
      }));
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !state.isMuted;
      audioRef.current.muted = newMuted;
      setState(prev => ({
        ...prev,
        isMuted: newMuted
      }));
    }
  }, [state.isMuted]);

  const handleSpeedChange = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setState(prev => ({
        ...prev,
        playbackRate: speed
      }));
    }
  }, []);

  const handleRestart = useCallback(() => {
    handleSeek(0);
    if (state.isPlaying) {
      handlePlay();
    }
  }, [handleSeek, handlePlay, state.isPlaying]);

  const handleLoopToggle = useCallback(() => {
    if (audioRef.current) {
      const newLoop = !state.isLooping;
      audioRef.current.loop = newLoop;
      setState(prev => ({
        ...prev,
        isLooping: newLoop
      }));
    }
  }, [state.isLooping]);

  const handleSkipChapter = useCallback((direction: 'prev' | 'next') => {
    if (chapters.length === 0) return;

    let targetChapter: number;
    if (direction === 'prev') {
      targetChapter = Math.max(0, currentChapter - 1);
    } else {
      targetChapter = Math.min(chapters.length - 1, currentChapter + 1);
    }

    handleSeek(chapters[targetChapter].startTime);
  }, [chapters, currentChapter, handleSeek]);

  const handleDownload = useCallback(async () => {
    if (!isDownloadAllowed) return;

    try {
      const link = document.createElement('a');
      link.href = content.audioData.audioUrl;
      link.download = content.audioData.fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download audio');
    }
  }, [content.audioData.audioUrl, content.audioData.fileName, isDownloadAllowed]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Setup audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set initial properties
    audio.volume = state.volume;
    audio.playbackRate = state.playbackRate;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError, state.volume, state.playbackRate]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && !state.isLoading && !state.hasError) {
      handlePlay();
    }
  }, [autoPlay, state.isLoading, state.hasError, handlePlay]);

  // Progress reporting
  useEffect(() => {
    onProgress?.(state.progress);
  }, [state.progress, onProgress]);

  // Track listen time
  useEffect(() => {
    if (!state.hasStartedPlaying || !state.playStartTime) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        totalListenTime: Math.floor((Date.now() - (prev.playStartTime?.getTime() || 0)) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.hasStartedPlaying, state.playStartTime]);

  // =================================================================
  // 🎯 ERROR HANDLING
  // =================================================================
  
  if (state.hasError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Audio Unavailable
            </h3>
            <p className="text-gray-600 mb-4">
              {state.errorMessage || 'Failed to load audio file'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-600" />
          {content.title}
        </CardTitle>
        {content.description && (
          <CardDescription>{content.description}</CardDescription>
        )}
        
        {/* Audio metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{content.audioData.fileName}</span>
          <span>•</span>
          <span>{formatFileSize(content.audioData.fileSize)}</span>
          <span>•</span>
          <Badge variant="secondary">
            {content.audioData.audioFormat.toUpperCase()}
          </Badge>
          {isDownloadAllowed && (
            <>
              <span>•</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-auto p-0 text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={content.audioData.audioUrl}
          preload="metadata"
        />

        {/* Audio Visualizer */}
        <AudioVisualizer 
          isPlaying={state.isPlaying}
          volume={state.volume}
        />

        {/* Audio Controls */}
        <AudioControls
          state={state}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onSpeedChange={handleSpeedChange}
          onRestart={handleRestart}
          onLoopToggle={handleLoopToggle}
          onSkipChapter={handleSkipChapter}
          chapters={chapters}
        />

        {/* Chapters */}
        {chapters.length > 0 && (
          <>
            <Separator />
            <ChapterList
              chapters={chapters}
              currentTime={state.currentTime}
              onSeek={handleSeek}
            />
          </>
        )}

        {/* Completion Status */}
        {state.isCompleted && (
          <>
            <Separator />
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Audio Completed!</div>
                  <div className="text-sm text-green-700">
                    Listened for {Math.floor(state.totalListenTime / 60)}m {state.totalListenTime % 60}s
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Statistics */}
        {state.hasStartedPlaying && (
          <>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-gray-500">Progress</div>
                <div className="font-medium">{Math.round(state.progress)}%</div>
              </div>
              <div>
                <div className="text-gray-500">Listen Time</div>
                <div className="font-medium">
                  {Math.floor(state.totalListenTime / 60)}:{(state.totalListenTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Speed</div>
                <div className="font-medium">{state.playbackRate}x</div>
              </div>
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
export default AudioRenderer;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  AudioVisualizer, 
  AudioControls, 
  ChapterList
};

// ✅ PATTERN: Named exports untuk utilities
export {
  formatTime,
  formatFileSize,
  getCurrentChapter,
  calculateProgress
};

// ✅ PATTERN: Named exports untuk types
export type { 
  AudioRendererProps,
  AudioPlayerState,
  AudioControlsProps,
  ChapterListProps,
  AudioVisualizerProps
};

// ✅ PATTERN: Display name untuk debugging
AudioRenderer.displayName = 'AudioRenderer';