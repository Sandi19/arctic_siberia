// File: src/components/session/content-handlers/live-session/live-session-builder.tsx

/**
 * =================================================================
 * 🎯 LIVE SESSION CONTENT BUILDER - IMPLEMENTATION
 * =================================================================
 * Live session content builder for meeting links and scheduling
 * Perfect for language learning conversation practice
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Phase 3
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Label,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui';

// ✅ Icons
import {
  Video,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  X,
  Copy,
  Zap,
  Globe,
  Phone
} from 'lucide-react';

// ✅ Date picker
import { format } from 'date-fns';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LiveSessionData, ContentAccessLevel } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

export interface LiveSessionBuilderProps {
  initialData?: Partial<LiveSessionBuilderFormData>;
  onSave?: (data: LiveSessionBuilderFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface LiveSessionBuilderFormData {
  title: string;
  description?: string;
  accessLevel: ContentAccessLevel;
  duration?: number;
  liveSessionData: LiveSessionData;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const meetingLinkSchema = z.string()
  .url('Invalid URL format')
  .refine(
    (url) => {
      // Check for supported platforms
      const supportedPlatforms = [
        'zoom.us',
        'meet.google.com',
        'teams.microsoft.com',
        'webex.com',
        'goto.com'
      ];
      return supportedPlatforms.some(platform => url.includes(platform));
    },
    'Please enter a valid meeting link (Zoom, Google Meet, Teams, etc.)'
  );

const liveSessionBuilderSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration must not exceed 240 minutes')
    .optional(),
  liveSessionData: z.object({
    meetingLink: meetingLinkSchema,
    scheduledAt: z.date().optional(),
    duration: z.number().min(15).max(240).optional(),
    meetingId: z.string().optional(),
    passcode: z.string().optional(),
    instructions: z.string().max(1000).optional()
  })
});

type LiveSessionBuilderFormSchema = z.infer<typeof liveSessionBuilderSchema>;

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

function detectPlatform(url: string): { platform: string; icon: any; color: string } {
  if (url.includes('zoom.us')) {
    return { platform: 'Zoom', icon: Video, color: 'text-blue-600' };
  } else if (url.includes('meet.google.com')) {
    return { platform: 'Google Meet', icon: Video, color: 'text-green-600' };
  } else if (url.includes('teams.microsoft.com')) {
    return { platform: 'Microsoft Teams', icon: Video, color: 'text-purple-600' };
  } else if (url.includes('webex.com')) {
    return { platform: 'Webex', icon: Video, color: 'text-orange-600' };
  } else if (url.includes('goto.com')) {
    return { platform: 'GoTo Meeting', icon: Video, color: 'text-teal-600' };
  }
  return { platform: 'Video Conference', icon: Globe, color: 'text-gray-600' };
}

function extractMeetingId(url: string): string | null {
  // Zoom meeting ID extraction
  const zoomMatch = url.match(/\/j\/(\d+)/);
  if (zoomMatch) return zoomMatch[1];
  
  // Google Meet ID extraction
  const meetMatch = url.match(/\/([a-z0-9-]+)(?:\?|$)/);
  if (meetMatch) return meetMatch[1];
  
  // Teams meeting ID extraction
  const teamsMatch = url.match(/\/([a-f0-9-]+)(?:\?|$)/);
  if (teamsMatch) return teamsMatch[1];
  
  return null;
}

// =================================================================
// 🎯 LIVE SESSION BUILDER COMPONENT
// =================================================================

function LiveSessionBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  className 
}: LiveSessionBuilderProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [platformInfo, setPlatformInfo] = useState<{ platform: string; icon: any; color: string } | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [extractedMeetingId, setExtractedMeetingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  // =================================================================
  // 🎯 FORM CONFIGURATION
  // =================================================================

  const form = useForm<LiveSessionBuilderFormSchema>({
    resolver: zodResolver(liveSessionBuilderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || 60,
      liveSessionData: {
        meetingLink: initialData?.liveSessionData?.meetingLink || '',
        scheduledAt: initialData?.liveSessionData?.scheduledAt || undefined,
        duration: initialData?.liveSessionData?.duration || 60,
        meetingId: initialData?.liveSessionData?.meetingId || '',
        passcode: initialData?.liveSessionData?.passcode || '',
        instructions: initialData?.liveSessionData?.instructions || ''
      }
    }
  });

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleUrlChange = useCallback((url: string) => {
    if (!url) {
      setPlatformInfo(null);
      setIsValidUrl(false);
      setExtractedMeetingId(null);
      return;
    }

    try {
      const platform = detectPlatform(url);
      setPlatformInfo(platform);
      
      const meetingId = extractMeetingId(url);
      setExtractedMeetingId(meetingId);
      
      // Auto-fill meeting ID if extracted
      if (meetingId) {
        form.setValue('liveSessionData.meetingId', meetingId);
      }
      
      // Validate URL
      const isValid = meetingLinkSchema.safeParse(url).success;
      setIsValidUrl(isValid);
      
      // Auto-generate title if empty and URL is valid
      if (isValid && !form.getValues('title')) {
        form.setValue('title', `${platform.platform} Session`);
      }
    } catch (error) {
      setPlatformInfo(null);
      setIsValidUrl(false);
      setExtractedMeetingId(null);
    }
  }, [form]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setScheduledDate(date);
    form.setValue('liveSessionData.scheduledAt', date);
  }, [form]);

  const handleTestLink = useCallback(() => {
    const url = form.getValues('liveSessionData.meetingLink');
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [form]);

  const handleSubmit = useCallback((data: LiveSessionBuilderFormSchema) => {
    const formData: LiveSessionBuilderFormData = {
      title: data.title,
      description: data.description,
      accessLevel: data.accessLevel,
      duration: data.duration,
      liveSessionData: {
        meetingLink: data.liveSessionData.meetingLink,
        scheduledAt: data.liveSessionData.scheduledAt,
        duration: data.liveSessionData.duration,
        meetingId: data.liveSessionData.meetingId,
        passcode: data.liveSessionData.passcode,
        instructions: data.liveSessionData.instructions
      }
    };

    onSave?.(formData);
  }, [onSave]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================

  useEffect(() => {
    if (initialData?.liveSessionData?.scheduledAt) {
      setScheduledDate(initialData.liveSessionData.scheduledAt);
    }
  }, [initialData]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Live Session Builder
          </CardTitle>
          <CardDescription>
            Create live video sessions for real-time conversation practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Basic Information</Label>
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., English Conversation Practice"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your live session a descriptive title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what students will practice in this live session..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional context about the session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Level</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={field.value === 'FREE' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('FREE')}
                            >
                              Free
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'PREMIUM' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('PREMIUM')}
                            >
                              Premium
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            max="240"
                            placeholder="e.g., 60"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Session duration (15-240 minutes)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Meeting Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium">Meeting Configuration</Label>
                </div>

                <FormField
                  control={form.control}
                  name="liveSessionData.meetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Link</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://zoom.us/j/123456789 or https://meet.google.com/..."
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              handleUrlChange(e.target.value);
                            }}
                          />
                          {isValidUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleTestLink}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Paste meeting link from Zoom, Google Meet, Teams, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Platform Detection */}
                {platformInfo && (
                  <Alert className={cn(
                    isValidUrl ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  )}>
                    <div className="flex items-center gap-2">
                      {isValidUrl ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={isValidUrl ? 'text-green-800' : 'text-red-800'}>
                        {isValidUrl ? (
                          <>
                            <platformInfo.icon className={cn('h-4 w-4 inline mr-2', platformInfo.color)} />
                            {platformInfo.platform} meeting detected
                            {extractedMeetingId && (
                              <Badge variant="outline" className="ml-2">
                                ID: {extractedMeetingId}
                              </Badge>
                            )}
                          </>
                        ) : (
                          'Invalid meeting link format'
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Schedule Date */}
                <FormField
                  control={form.control}
                  name="liveSessionData.scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date & Time (Optional)</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !scheduledDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {scheduledDate ? (
                                format(scheduledDate, 'PPP p')
                              ) : (
                                'Select date and time'
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={scheduledDate}
                              onSelect={handleDateSelect}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        When is this session scheduled? (Leave empty for on-demand)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Advanced Settings</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="liveSessionData.meetingId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123456789"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Meeting ID (auto-extracted from link)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="liveSessionData.passcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passcode (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123456"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Meeting passcode if required
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="liveSessionData.instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Special instructions for students (e.g., join 5 minutes early, prepare materials, etc.)"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Additional instructions for students
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Live Session
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default LiveSessionBuilder;

// ✅ PATTERN: Named exports untuk utilities
export {
  detectPlatform,
  extractMeetingId
};

// ✅ PATTERN: Type exports
export type {
  LiveSessionBuilderProps,
  LiveSessionBuilderFormData
};