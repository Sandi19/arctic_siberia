// File: src/components/session/content-handlers/live-session/live-session-renderer.tsx

/**
 * =================================================================
 * 🎯 LIVE SESSION CONTENT RENDERER - MOCK IMPLEMENTATION
 * =================================================================
 * Simple live session renderer with link + description display
 * Perfect for language learning conversation practice
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 3C
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useState, useEffect } from 'react';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';

// ✅ Icons
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Phone,
  Globe,
  User
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { ContentRendererProps } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface LiveSessionRendererProps extends ContentRendererProps {
  // Live session specific props bisa ditambah nanti
}

interface SessionStatus {
  isLive: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  timeUntilStart: number; // seconds
  hasJoined: boolean;
}

// =================================================================
// 🎯 MOCK LIVE SESSION RENDERER COMPONENT
// =================================================================

function LiveSessionRenderer({ 
  content, 
  isActive, 
  onComplete, 
  onProgress 
}: LiveSessionRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isLive: false,
    isUpcoming: true,
    isPast: false,
    timeUntilStart: 3600, // 1 hour from now (mock)
    hasJoined: false
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Extract live session data
  const liveSessionData = content.liveSessionData;
  const meetingLink = liveSessionData?.meetingLink || '';
  const scheduledAt = liveSessionData?.scheduledAt;
  const duration = liveSessionData?.duration || 60; // minutes
  const meetingId = liveSessionData?.meetingId || '';
  const passcode = liveSessionData?.passcode || '';
  const instructions = liveSessionData?.instructions || '';

  // =================================================================
  // 🎯 UTILITY FUNCTIONS
  // =================================================================

  const formatDateTime = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const formatTimeUntil = useCallback((seconds: number): string => {
    if (seconds <= 0) return 'Now';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getPlatformInfo = useCallback((link: string) => {
    if (link.includes('zoom.us')) {
      return { platform: 'Zoom', icon: Video, color: 'text-blue-600' };
    } else if (link.includes('meet.google.com')) {
      return { platform: 'Google Meet', icon: Video, color: 'text-green-600' };
    } else if (link.includes('teams.microsoft.com')) {
      return { platform: 'Microsoft Teams', icon: Video, color: 'text-purple-600' };
    }
    return { platform: 'Video Call', icon: Globe, color: 'text-gray-600' };
  }, []);

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleJoinSession = useCallback(() => {
    if (!meetingLink) {
      alert('No meeting link provided');
      return;
    }

    // Open meeting link in new tab
    window.open(meetingLink, '_blank', 'noopener,noreferrer');
    
    // Mark as joined
    setSessionStatus(prev => ({ ...prev, hasJoined: true }));
    
    // Report progress
    onProgress?.(50); // 50% for joining
    
    // In real app, might track actual attendance
    console.log('Joined live session:', meetingLink);
  }, [meetingLink, onProgress]);

  const handleCopyLink = useCallback(async () => {
    if (!meetingLink) return;
    
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      console.log('Copy to clipboard failed, showing link');
      alert(`Meeting link: ${meetingLink}`);
    }
  }, [meetingLink]);

  const handleMarkAttended = useCallback(() => {
    setSessionStatus(prev => ({ 
      ...prev, 
      hasJoined: true,
      isPast: true,
      isUpcoming: false 
    }));
    
    onProgress?.(100);
    onComplete?.();
  }, [onProgress, onComplete]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================

  // Mock countdown timer
  useEffect(() => {
    if (sessionStatus.isUpcoming && sessionStatus.timeUntilStart > 0) {
      const interval = setInterval(() => {
        setSessionStatus(prev => {
          const newTime = prev.timeUntilStart - 1;
          
          if (newTime <= 0) {
            return {
              ...prev,
              timeUntilStart: 0,
              isLive: true,
              isUpcoming: false
            };
          }
          
          return { ...prev, timeUntilStart: newTime };
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [sessionStatus.isUpcoming, sessionStatus.timeUntilStart]);

  // =================================================================
  // 🎯 RENDER COMPONENTS
  // =================================================================

  const platformInfo = getPlatformInfo(meetingLink);
  const PlatformIcon = platformInfo.icon;

  const renderSessionStatus = () => {
    if (sessionStatus.isLive) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          🔴 LIVE NOW
        </Badge>
      );
    } else if (sessionStatus.isUpcoming) {
      return (
        <Badge variant="secondary">
          ⏰ Starts in {formatTimeUntil(sessionStatus.timeUntilStart)}
        </Badge>
      );
    } else if (sessionStatus.isPast) {
      return (
        <Badge variant="outline">
          ✅ Completed
        </Badge>
      );
    }
    return null;
  };

  // =================================================================
  // 🎯 MAIN RENDER
  // =================================================================

  return (
    <div className="space-y-4">
      {/* Live Session Card */}
      <Card className={cn(
        "transition-all duration-200",
        sessionStatus.isLive && "ring-2 ring-red-500 ring-offset-2",
        isActive && "ring-2 ring-primary ring-offset-2"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <PlatformIcon className={cn("h-5 w-5", platformInfo.color)} />
                {content.title}
              </CardTitle>
              <CardDescription>
                {content.description || 'Live interactive session'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {renderSessionStatus()}
              {content.isFree && (
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Session Details */}
          <div className="space-y-4">
            {/* Meeting Platform */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <PlatformIcon className={cn("h-6 w-6", platformInfo.color)} />
                <div>
                  <p className="font-medium">{platformInfo.platform} Meeting</p>
                  <p className="text-sm text-muted-foreground">
                    Click to join the live session
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {meetingLink && (
                  <>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    
                    <Button
                      onClick={handleJoinSession}
                      disabled={!meetingLink}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {sessionStatus.isLive ? 'Join Live' : 'Join Session'}
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Session Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Scheduled Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(scheduledAt)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {duration} minutes
                  </p>
                </div>
              </div>
              
              {meetingId && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Meeting ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {meetingId}
                    </p>
                  </div>
                </div>
              )}
              
              {passcode && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Passcode</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {passcode}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            {instructions && (
              <>
                <Separator />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instructions:</strong> {instructions}
                  </AlertDescription>
                </Alert>
              </>
            )}
            
            {/* Session Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Live Session Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Join 2-3 minutes before the scheduled time</li>
                <li>• Ensure you have a stable internet connection</li>
                <li>• Test your microphone and camera beforehand</li>
                <li>• Have a quiet environment for better interaction</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-muted-foreground">
                {sessionStatus.hasJoined ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    You joined this session
                  </span>
                ) : (
                  <span>Click the button above to join when ready</span>
                )}
              </div>
              
              {sessionStatus.hasJoined && !sessionStatus.isPast && (
                <Button onClick={handleMarkAttended} variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Attended
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* No Meeting Link Alert */}
      {!meetingLink && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            No meeting link has been provided yet. Please check back later or contact your instructor.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Completion Status */}
      {sessionStatus.hasJoined && sessionStatus.isPast && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Session Attended!</p>
                <p className="text-sm text-green-600">
                  Great job participating in this live session.
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
export default LiveSessionRenderer;

// ✅ PATTERN: Named exports untuk utilities
export {
  formatDateTime,
  formatTimeUntil,
  getPlatformInfo
};

// ✅ PATTERN: Type exports
export type {
  LiveSessionRendererProps,
  SessionStatus
};