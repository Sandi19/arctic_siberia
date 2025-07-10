// File: src/components/session/content-handlers/video/video-renderer.tsx

/**
 * =================================================================
 * 🎯 VIDEO CONTENT RENDERER - MOCK IMPLEMENTATION
 * =================================================================
 * Mock video renderer with YouTube placeholder
 * Will be replaced with real YouTube player later
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 3A
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useState } from 'react';

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
  Separator
} from '@/components/ui';

// ✅ Icons
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  Clock,
  Youtube
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { ContentRendererProps } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface VideoRendererProps extends ContentRendererProps {
  // Video-specific props bisa ditambah nanti
}

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  isCompleted: boolean;
}

// =================================================================
// 🎯 MOCK VIDEO RENDERER COMPONENT
// =================================================================

function VideoRenderer({ 
  content, 
  isActive, 
  onComplete, 
  onProgress 
}: VideoRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    currentTime: 0,
    duration: content.duration ? content.duration * 60 : 900, // Convert minutes to seconds, default 15 min
    progress: 0,
    isCompleted: false
  });

  // Extract video data
  const videoData = content.videoData;
  const youtubeUrl = videoData?.youtubeUrl || '';
  const videoId = youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be') 
    ? 'mock-video-id' 
    : null;

  // =================================================================
  // 🎯 MOCK PLAYER CONTROLS
  // =================================================================

  const handlePlayPause = useCallback(() => {
    setPlayerState(prev => {
      const newIsPlaying = !prev.isPlaying;
      
      if (newIsPlaying) {
        // Simulate video progress
        const interval = setInterval(() => {
          setPlayerState(current => {
            const newTime = current.currentTime + 1;
            const newProgress = (newTime / current.duration) * 100;
            
            // Report progress to parent
            onProgress?.(newProgress);
            
            // Auto-complete when reaching end
            if (newTime >= current.duration) {
              clearInterval(interval);
              onComplete?.();
              return {
                ...current,
                currentTime: current.duration,
                progress: 100,
                isPlaying: false,
                isCompleted: true
              };
            }
            
            return {
              ...current,
              currentTime: newTime,
              progress: newProgress
            };
          });
        }, 1000);
        
        // Store interval ID for cleanup
        (window as any).videoInterval = interval;
      } else {
        // Clear interval when paused
        if ((window as any).videoInterval) {
          clearInterval((window as any).videoInterval);
        }
      }
      
      return { ...prev, isPlaying: newIsPlaying };
    });
  }, [onProgress, onComplete]);

  const handleMute = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleRestart = useCallback(() => {
    if ((window as any).videoInterval) {
      clearInterval((window as any).videoInterval);
    }
    
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      progress: 0,
      isCompleted: false
    }));
    
    onProgress?.(0);
  }, [onProgress]);

  const handleManualComplete = useCallback(() => {
    if ((window as any).videoInterval) {
      clearInterval((window as any).videoInterval);
    }
    
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: prev.duration,
      progress: 100,
      isCompleted: true
    }));
    
    onProgress?.(100);
    onComplete?.();
  }, [onProgress, onComplete]);

  // =================================================================
  // 🎯 UTILITY FUNCTIONS
  // =================================================================

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className="space-y-4">
      {/* Video Player Container */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                {content.title}
              </CardTitle>
              <CardDescription>
                {content.description || 'Video content'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {formatTime(playerState.duration)}
              </Badge>
              {content.isFree && (
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Video Player Mockup */}
          <div 
            className={cn(
              "relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer transition-all",
              isActive ? "ring-2 ring-primary" : "",
              playerState.isCompleted && "bg-green-900"
            )}
            onClick={handlePlayPause}
          >
            {/* Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-white">
              {playerState.isCompleted ? (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-2 text-green-400" />
                  <p className="text-lg font-medium">Video Completed!</p>
                  <p className="text-sm opacity-75">Great job watching this content</p>
                </div>
              ) : (
                <div className="text-center">
                  {playerState.isPlaying ? (
                    <Pause className="h-16 w-16 opacity-80 hover:opacity-100 transition-opacity" />
                  ) : (
                    <Play className="h-16 w-16 opacity-80 hover:opacity-100 transition-opacity" />
                  )}
                  <p className="text-sm mt-2 opacity-75">
                    {youtubeUrl ? 'Mock YouTube Player' : 'No video URL provided'}
                  </p>
                  {youtubeUrl && (
                    <p className="text-xs mt-1 opacity-50 truncate max-w-xs">
                      {youtubeUrl}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Progress Bar Overlay */}
            {playerState.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-50">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${playerState.progress}%` }}
                />
              </div>
            )}
            
            {/* Playing Indicator */}
            {playerState.isPlaying && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="text-xs animate-pulse">
                  PLAYING
                </Badge>
              </div>
            )}
          </div>
          
          {/* Video Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePlayPause} 
                size="sm"
                disabled={playerState.isCompleted}
              >
                {playerState.isPlaying ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {playerState.isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button onClick={handleMute} variant="outline" size="sm">
                {playerState.isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button onClick={handleRestart} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </span>
              
              {!playerState.isCompleted && (
                <Button onClick={handleManualComplete} variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(playerState.progress)}%</span>
            </div>
            <Progress value={playerState.progress} />
          </div>
          
          {/* Video Info */}
          {(videoData?.autoPlay !== undefined || videoData?.showControls !== undefined) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {videoData.autoPlay !== undefined && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Auto-play: {videoData.autoPlay ? 'Enabled' : 'Disabled'}</span>
                  </div>
                )}
                {videoData.showControls !== undefined && (
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-muted-foreground" />
                    <span>Controls: {videoData.showControls ? 'Visible' : 'Hidden'}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Completion Status */}
      {playerState.isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Video Completed!</p>
                <p className="text-sm text-green-600">
                  You've successfully watched this video content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default VideoRenderer;

// ✅ PATTERN: Named exports untuk sub-components dan utilities
export {
  formatTime
};

// ✅ PATTERN: Type exports
export type {
  VideoRendererProps,
  VideoPlayerState
};