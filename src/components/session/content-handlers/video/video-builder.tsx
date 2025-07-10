// File: src/components/session/content-handlers/video/video-builder.tsx

/**
 * =================================================================
 * 🎯 VIDEO CONTENT BUILDER - IMPLEMENTATION
 * =================================================================
 * Video content builder for YouTube URL input and configuration
 * Perfect for language learning video content creation
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
  Label
} from '@/components/ui';

// ✅ Icons
import {
  Youtube,
  Play,
  Clock,
  Eye,
  EyeOff,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  X
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { VideoData, ContentType, ContentAccessLevel } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

export interface VideoBuilderProps {
  initialData?: Partial<VideoBuilderFormData>;
  onSave?: (data: VideoBuilderFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface VideoBuilderFormData {
  title: string;
  description?: string;
  accessLevel: ContentAccessLevel;
  duration?: number;
  videoData: VideoData;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const youtubeUrlSchema = z.string()
  .url('Invalid URL format')
  .refine(
    (url) => {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      return youtubeRegex.test(url);
    },
    'Please enter a valid YouTube URL'
  );

const videoBuilderSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration must not exceed 180 minutes')
    .optional(),
  videoData: z.object({
    youtubeUrl: youtubeUrlSchema,
    startTime: z.number()
      .min(0, 'Start time cannot be negative')
      .optional(),
    endTime: z.number()
      .min(0, 'End time cannot be negative')
      .optional(),
    autoPlay: z.boolean().default(false),
    showControls: z.boolean().default(true)
  })
});

type VideoBuilderFormSchema = z.infer<typeof videoBuilderSchema>;

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function formatTimeInput(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function parseTimeInput(timeString: string): number {
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  return 0;
}

// =================================================================
// 🎯 VIDEO BUILDER COMPONENT
// =================================================================

function VideoBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  className 
}: VideoBuilderProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');

  // =================================================================
  // 🎯 FORM CONFIGURATION
  // =================================================================

  const form = useForm<VideoBuilderFormSchema>({
    resolver: zodResolver(videoBuilderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || undefined,
      videoData: {
        youtubeUrl: initialData?.videoData?.youtubeUrl || '',
        startTime: initialData?.videoData?.startTime || undefined,
        endTime: initialData?.videoData?.endTime || undefined,
        autoPlay: initialData?.videoData?.autoPlay || false,
        showControls: initialData?.videoData?.showControls ?? true
      }
    }
  });

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleUrlChange = useCallback((url: string) => {
    const extractedId = extractYouTubeId(url);
    setVideoId(extractedId);
    setIsValidUrl(!!extractedId);
    
    // Auto-generate title if empty and URL is valid
    if (extractedId && !form.getValues('title')) {
      form.setValue('title', `Video: ${extractedId}`);
    }
  }, [form]);

  const handleStartTimeChange = useCallback((timeString: string) => {
    setStartTimeInput(timeString);
    const seconds = parseTimeInput(timeString);
    form.setValue('videoData.startTime', seconds || undefined);
  }, [form]);

  const handleEndTimeChange = useCallback((timeString: string) => {
    setEndTimeInput(timeString);
    const seconds = parseTimeInput(timeString);
    form.setValue('videoData.endTime', seconds || undefined);
  }, [form]);

  const handleSubmit = useCallback((data: VideoBuilderFormSchema) => {
    // Validate end time is after start time
    if (data.videoData.startTime && data.videoData.endTime) {
      if (data.videoData.endTime <= data.videoData.startTime) {
        form.setError('videoData.endTime', {
          message: 'End time must be after start time'
        });
        return;
      }
    }

    const formData: VideoBuilderFormData = {
      title: data.title,
      description: data.description,
      accessLevel: data.accessLevel,
      duration: data.duration,
      videoData: {
        youtubeUrl: data.videoData.youtubeUrl,
        startTime: data.videoData.startTime,
        endTime: data.videoData.endTime,
        autoPlay: data.videoData.autoPlay,
        showControls: data.videoData.showControls
      }
    };

    onSave?.(formData);
  }, [form, onSave]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================

  useEffect(() => {
    if (initialData?.videoData?.startTime) {
      setStartTimeInput(formatTimeInput(initialData.videoData.startTime));
    }
    if (initialData?.videoData?.endTime) {
      setEndTimeInput(formatTimeInput(initialData.videoData.endTime));
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
            <Youtube className="h-5 w-5 text-red-600" />
            Video Content Builder
          </CardTitle>
          <CardDescription>
            Create video content using YouTube URLs for language learning
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
                      <FormLabel>Content Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Introduction to English Grammar"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your video content a descriptive title
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
                          placeholder="Describe what students will learn from this video..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional context about the video content
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
                            min="1"
                            max="180"
                            placeholder="e.g., 15"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated viewing time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* YouTube URL */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <Label className="text-sm font-medium">YouTube Video</Label>
                </div>

                <FormField
                  control={form.control}
                  name="videoData.youtubeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
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
                              onClick={() => window.open(field.value, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Paste a YouTube video URL (youtube.com or youtu.be)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL Validation Status */}
                {form.watch('videoData.youtubeUrl') && (
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
                            Valid YouTube URL detected
                            {videoId && (
                              <Badge variant="outline" className="ml-2">
                                ID: {videoId}
                              </Badge>
                            )}
                          </>
                        ) : (
                          'Please enter a valid YouTube URL'
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
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
                    {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    {/* Playback Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="videoData.autoPlay"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Auto Play</FormLabel>
                              <FormDescription className="text-xs">
                                Start video automatically when loaded
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="videoData.showControls"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Show Controls</FormLabel>
                              <FormDescription className="text-xs">
                                Display video player controls
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Time Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Time (MM:SS)</Label>
                        <Input
                          placeholder="0:00"
                          value={startTimeInput}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Skip to specific time when video starts
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">End Time (MM:SS)</Label>
                        <Input
                          placeholder="5:30"
                          value={endTimeInput}
                          onChange={(e) => handleEndTimeChange(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Stop video at specific time
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Video Content
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
export default VideoBuilder;

// ✅ PATTERN: Named exports untuk utilities
export {
  extractYouTubeId,
  formatTimeInput,
  parseTimeInput
};

// ✅ PATTERN: Type exports
export type {
  VideoBuilderProps,
  VideoBuilderFormData
};