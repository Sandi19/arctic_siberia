// File: src/components/session/content-handlers/live-session/live-session-renderer.tsx

/**
 * =================================================================
 * 📹 LIVE SESSION RENDERER COMPONENT
 * =================================================================
 * Live meeting/webinar content renderer untuk student interface
 * Following Arctic Siberia Import/Export Standard
 * Phase 2 - Priority 2.5 (MEDIUM)
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
  useState
} from 'react';

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator
} from '@/components/ui';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Info,
  Loader2,
  Lock,
  Play,
  Users,
  Video,
  VideoOff
} from 'lucide-react';

// =================================================================
// 🎯 EXTERNAL LIBRARIES
// =================================================================
import { toast } from 'sonner';

// =================================================================
// 🎯 LOCAL UTILITIES - Session types
// =================================================================
import type {
  LiveSessionContent,
  ContentType
} from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface LiveSessionRendererProps {
  content: LiveSessionContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onJoin?: (meetingUrl: string) => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
  className?: string;
}

interface LiveSessionState {
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  timeUntilStart: number;
  timeRemaining: number;
  isJoined: boolean;
  joinedAt: Date | null;
  participantCount: number;
  hasRecording: boolean;
  isLoading: boolean;
  error: string | null;
}

interface SessionTimerProps {
  scheduledAt: Date;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  onStatusChange: (status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED') => void;
}

interface JoinButtonProps {
  content: LiveSessionContent;
  state: LiveSessionState;
  onJoin: () => void;
  disabled?: boolean;
}

interface RecordingPlayerProps {
  recordingUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Format date and time for display
 */
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}

/**
 * Format countdown time
 */
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get session status based on time
 */
function getSessionStatus(scheduledAt: Date): 'SCHEDULED' | 'LIVE' | 'ENDED' {
  const now = new Date();
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hours duration
  
  if (now < startTime) {
    return 'SCHEDULED';
  } else if (now >= startTime && now <= endTime) {
    return 'LIVE';
  } else {
    return 'ENDED';
  }
}

/**
 * Calculate time until start
 */
function getTimeUntilStart(scheduledAt: Date): number {
  const now = new Date();
  const startTime = new Date(scheduledAt);
  return Math.max(0, Math.floor((startTime.getTime() - now.getTime()) / 1000));
}

/**
 * Calculate time remaining in session
 */
function getTimeRemaining(scheduledAt: Date): number {
  const now = new Date();
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hours duration
  return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
}

/**
 * Generate Zoom join URL with parameters
 */
function generateZoomJoinUrl(baseUrl: string, password?: string): string {
  if (!password) return baseUrl;
  
  const url = new URL(baseUrl);
  url.searchParams.set('pwd', password);
  return url.toString();
}

// =================================================================
// 🎯 SESSION TIMER SUB-COMPONENT
// =================================================================

function SessionTimer({ 
  scheduledAt, 
  status, 
  onStatusChange 
}: SessionTimerProps) {
  const [timeUntilStart, setTimeUntilStart] = useState(getTimeUntilStart(scheduledAt));
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(scheduledAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = getSessionStatus(scheduledAt);
      const newTimeUntilStart = getTimeUntilStart(scheduledAt);
      const newTimeRemaining = getTimeRemaining(scheduledAt);
      
      if (newStatus !== status) {
        onStatusChange(newStatus);
      }
      
      setTimeUntilStart(newTimeUntilStart);
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledAt, status, onStatusChange]);

  if (status === 'SCHEDULED') {
    return (
      <div className="text-center space-y-2">
        <div className="text-2xl font-mono font-bold text-blue-600">
          {formatCountdown(timeUntilStart)}
        </div>
        <div className="text-sm text-gray-600">
          Until session starts
        </div>
      </div>
    );
  }

  if (status === 'LIVE') {
    return (
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-lg font-semibold text-red-600">LIVE NOW</span>
        </div>
        <div className="text-sm text-gray-600">
          {formatCountdown(timeRemaining)} remaining
        </div>
      </div>
    );
  }

  return null;
}

// =================================================================
// 🎯 JOIN BUTTON SUB-COMPONENT
// =================================================================

function JoinButton({ 
  content, 
  state, 
  onJoin, 
  disabled = false 
}: JoinButtonProps) {
  const canJoin = useMemo(() => {
    return state.status === 'LIVE' && content.liveSessionData.zoomJoinUrl && !disabled;
  }, [state.status, content.liveSessionData.zoomJoinUrl, disabled]);

  const getButtonText = () => {
    if (state.isJoined) return 'Rejoin Session';
    if (state.status === 'SCHEDULED') return 'Session Not Started';
    if (state.status === 'ENDED') return 'Session Ended';
    if (state.status === 'CANCELLED') return 'Session Cancelled';
    return 'Join Live Session';
  };

  const getButtonIcon = () => {
    if (state.status === 'LIVE') return <Video className="w-5 h-5" />;
    if (state.status === 'ENDED') return <VideoOff className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  return (
    <Button
      size="lg"
      onClick={onJoin}
      disabled={!canJoin || state.isLoading}
      className={`w-full h-14 text-lg ${
        state.status === 'LIVE' ? 'bg-green-600 hover:bg-green-700' : ''
      }`}
    >
      {state.isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <>
          {getButtonIcon()}
          <span className="ml-2">{getButtonText()}</span>
        </>
      )}
    </Button>
  );
}

// =================================================================
// 🎯 RECORDING PLAYER SUB-COMPONENT
// =================================================================

function RecordingPlayer({ 
  recordingUrl, 
  title, 
  onProgress, 
  onComplete 
}: RecordingPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    // Simulate progress for demo
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        onProgress?.(newProgress);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          onComplete?.();
          return 100;
        }
        return newProgress;
      });
    }, 1000);
  }, [onProgress, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handlePlay}
          disabled={isPlaying}
          className="flex-shrink-0"
        >
          {isPlaying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="font-medium text-sm">{title}</div>
          <Progress value={progress} className="mt-1" />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(recordingUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 SESSION INFO SUB-COMPONENT
// =================================================================

function SessionInfo({ content }: { content: LiveSessionContent }) {
  const handleCopyMeetingInfo = useCallback(() => {
    const meetingInfo = `
Meeting: ${content.title}
Time: ${formatDateTime(content.liveSessionData.scheduledAt)}
Join URL: ${content.liveSessionData.zoomJoinUrl}
Meeting ID: ${content.liveSessionData.zoomMeetingId}
Password: ${content.liveSessionData.zoomPassword || 'No password required'}
    `.trim();

    navigator.clipboard.writeText(meetingInfo).then(() => {
      toast.success('Meeting information copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy meeting information');
    });
  }, [content]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Scheduled Time</span>
          </div>
          <div className="text-sm text-gray-700 pl-6">
            {formatDateTime(content.liveSessionData.scheduledAt)}
          </div>
        </div>

        {content.liveSessionData.maxParticipants && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Max Participants</span>
            </div>
            <div className="text-sm text-gray-700 pl-6">
              {content.liveSessionData.maxParticipants} people
            </div>
          </div>
        )}

        {content.liveSessionData.zoomMeetingId && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Meeting ID</span>
            </div>
            <div className="text-sm text-gray-700 pl-6 font-mono">
              {content.liveSessionData.zoomMeetingId}
            </div>
          </div>
        )}

        {content.liveSessionData.zoomPassword && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Password</span>
            </div>
            <div className="text-sm text-gray-700 pl-6 font-mono">
              {content.liveSessionData.zoomPassword}
            </div>
          </div>
        )}
      </div>

      {content.liveSessionData.agenda && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Agenda</span>
          </div>
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            {content.liveSessionData.agenda}
          </div>
        </div>
      )}

      {content.liveSessionData.prerequisites && content.liveSessionData.prerequisites.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Prerequisites</span>
          </div>
          <div className="pl-6">
            <ul className="text-sm text-gray-700 space-y-1">
              {content.liveSessionData.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyMeetingInfo}
          className="w-full"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Meeting Information
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN LIVE SESSION RENDERER COMPONENT
// =================================================================

export default function LiveSessionRenderer({
  content,
  onProgress,
  onComplete,
  onJoin,
  onError,
  readOnly = false,
  className = ''
}: LiveSessionRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<LiveSessionState>({
    status: getSessionStatus(content.liveSessionData.scheduledAt),
    timeUntilStart: getTimeUntilStart(content.liveSessionData.scheduledAt),
    timeRemaining: getTimeRemaining(content.liveSessionData.scheduledAt),
    isJoined: false,
    joinedAt: null,
    participantCount: 0,
    hasRecording: !!content.liveSessionData.recordingUrl,
    isLoading: false,
    error: null
  });

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const statusConfig = useMemo(() => {
    switch (state.status) {
      case 'SCHEDULED':
        return {
          badge: <Badge variant="secondary">Scheduled</Badge>,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'LIVE':
        return {
          badge: <Badge className="bg-red-600 hover:bg-red-700">Live Now</Badge>,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'ENDED':
        return {
          badge: <Badge variant="outline">Ended</Badge>,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200'
        };
      case 'CANCELLED':
        return {
          badge: <Badge variant="destructive">Cancelled</Badge>,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
    }
  }, [state.status]);

  const joinUrl = useMemo(() => {
    if (!content.liveSessionData.zoomJoinUrl) return null;
    return generateZoomJoinUrl(
      content.liveSessionData.zoomJoinUrl,
      content.liveSessionData.zoomPassword
    );
  }, [content.liveSessionData.zoomJoinUrl, content.liveSessionData.zoomPassword]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleStatusChange = useCallback((newStatus: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED') => {
    setState(prev => ({ ...prev, status: newStatus }));
    
    if (newStatus === 'LIVE') {
      toast.success('Live session has started!');
    } else if (newStatus === 'ENDED') {
      toast.info('Live session has ended');
      onComplete?.();
    }
  }, [onComplete]);

  const handleJoinSession = useCallback(async () => {
    if (!joinUrl) {
      onError?.('Meeting URL not available');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Open meeting in new window/tab
      window.open(joinUrl, '_blank', 'noopener,noreferrer');
      
      setState(prev => ({
        ...prev,
        isJoined: true,
        joinedAt: new Date(),
        isLoading: false
      }));

      onJoin?.(joinUrl);
      toast.success('Opening meeting in new window...');
    } catch (error) {
      console.error('Join error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      onError?.('Failed to join meeting');
      toast.error('Failed to join meeting');
    }
  }, [joinUrl, onJoin, onError]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Report progress for completed sessions
  useEffect(() => {
    if (state.status === 'ENDED' || state.isJoined) {
      onProgress?.(100);
    } else if (state.status === 'LIVE') {
      onProgress?.(50);
    }
  }, [state.status, state.isJoined, onProgress]);

  // =================================================================
  // 🎯 ERROR HANDLING
  // =================================================================
  
  if (state.error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Session Unavailable
            </h3>
            <p className="text-gray-600 mb-4">
              {state.error}
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
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              {content.title}
            </CardTitle>
            {content.description && (
              <CardDescription>{content.description}</CardDescription>
            )}
          </div>
          {statusConfig.badge}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Session Timer */}
        {(state.status === 'SCHEDULED' || state.status === 'LIVE') && (
          <div className={`p-6 border rounded-lg ${statusConfig.bgColor}`}>
            <SessionTimer
              scheduledAt={content.liveSessionData.scheduledAt}
              status={state.status}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* Join Button */}
        {!readOnly && (
          <JoinButton
            content={content}
            state={state}
            onJoin={handleJoinSession}
          />
        )}

        {/* Joined Status */}
        {state.isJoined && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You joined this session on {state.joinedAt?.toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* No Meeting URL Warning */}
        {!content.liveSessionData.zoomJoinUrl && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Meeting link not available yet. Please check back closer to the session time.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Session Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Session Information</h3>
          <SessionInfo content={content} />
        </div>

        {/* Recording Section */}
        {state.hasRecording && content.liveSessionData.recordingUrl && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Session Recording
              </h3>
              <RecordingPlayer
                recordingUrl={content.liveSessionData.recordingUrl}
                title={`${content.title} - Recording`}
                onProgress={onProgress}
                onComplete={onComplete}
              />
            </div>
          </>
        )}

        {/* Session Stats */}
        {state.status === 'ENDED' && (
          <>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">Completed</div>
              </div>
              <div>
                <div className="text-gray-500">Duration</div>
                <div className="font-medium">2 hours</div>
              </div>
              {content.liveSessionData.isRecorded && (
                <div>
                  <div className="text-gray-500">Recording</div>
                  <div className="font-medium">Available</div>
                </div>
              )}
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
export default LiveSessionRenderer;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  SessionTimer, 
  JoinButton, 
  RecordingPlayer,
  SessionInfo
};

// ✅ PATTERN: Named exports untuk utilities
export {
  formatDateTime,
  formatCountdown,
  getSessionStatus,
  getTimeUntilStart,
  getTimeRemaining,
  generateZoomJoinUrl
};

// ✅ PATTERN: Named exports untuk types
export type { 
  LiveSessionRendererProps,
  LiveSessionState,
  SessionTimerProps,
  JoinButtonProps,
  RecordingPlayerProps
};

// ✅ PATTERN: Display name untuk debugging
LiveSessionRenderer.displayName = 'LiveSessionRenderer';