// File: src/components/session/content-handlers/video/video-builder.tsx

/**
 * =================================================================
 * 🎬 VIDEO BUILDER COMPONENT
 * =================================================================
 * YouTube video content builder untuk instructor interface
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
  useMemo,
  useState
} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea
} from '@/components/ui';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Play,
  Settings,
  Youtube
} from 'lucide-react';

// =================================================================
// 🎯 EXTERNAL LIBRARIES
// =================================================================
import { z } from 'zod';
import { toast } from 'sonner';

// =================================================================
// 🎯 LOCAL UTILITIES - Session types
// =================================================================
import type {
  VideoContent,
  ContentType,
  ContentAccessLevel
} from '../../types';

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const videoFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  youtubeUrl: z.string()
    .min(1, 'YouTube URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.test(url),
      'Please enter a valid YouTube URL'
    ),
  
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration cannot exceed 10 hours')
    .optional(),
  
  isRequired: z.boolean().default(false),
  
  // Video specific settings
  autoPlay: z.boolean().default(false),
  showControls: z.boolean().default(true),
  allowFullscreen: z.boolean().default(true),
  startTime: z.number().min(0).optional(),
  endTime: z.number().min(0).optional(),
  playbackSpeed: z.array(z.number()).default([0.5, 1, 1.25, 1.5, 2])
});

type VideoFormData = z.infer<typeof videoFormSchema>;

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface VideoBuilderProps {
  initialData?: Partial<VideoContent>;
  onSave: (data: Partial<VideoContent>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  className?: string;
}

interface VideoPreviewProps {
  videoId: string;
  title: string;
  autoPlay: boolean;
  showControls: boolean;
}

interface URLValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  videoId: string | null;
  thumbnail: string | null;
  error: string | null;
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
 * Get YouTube thumbnail URL
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Validate YouTube URL and fetch metadata
 */
async function validateYouTubeUrl(url: string): Promise<{
  isValid: boolean;
  videoId: string | null;
  error: string | null;
}> {
  try {
    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
      return {
        isValid: false,
        videoId: null,
        error: 'Invalid YouTube URL format'
      };
    }

    // Check if video exists by trying to load thumbnail
    const thumbnailUrl = getYouTubeThumbnail(videoId);
    const response = await fetch(thumbnailUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      return {
        isValid: false,
        videoId: null,
        error: 'Video not found or private'
      };
    }

    return {
      isValid: true,
      videoId,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      videoId: null,
      error: 'Failed to validate video URL'
    };
  }
}

// =================================================================
// 🎯 VIDEO PREVIEW SUB-COMPONENT
// =================================================================

function VideoPreview({ 
  videoId, 
  title, 
  autoPlay, 
  showControls 
}: VideoPreviewProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?` +
    `autoplay=${autoPlay ? 1 : 0}&` +
    `controls=${showControls ? 1 : 0}&` +
    `rel=0&` +
    `modestbranding=1`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Video Preview</span>
      </div>
      
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>Video ID: {videoId}</div>
        <div>Auto-play: {autoPlay ? 'Enabled' : 'Disabled'}</div>
        <div>Controls: {showControls ? 'Shown' : 'Hidden'}</div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 URL VALIDATION SUB-COMPONENT
// =================================================================

function URLValidationIndicator({ 
  state, 
  onRetry 
}: { 
  state: URLValidationState; 
  onRetry: () => void; 
}) {
  if (state.isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Validating video...
      </div>
    );
  }

  if (state.isValid === true) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        Valid YouTube video
      </div>
    );
  }

  if (state.isValid === false) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {state.error || 'Invalid video URL'}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs"
        >
          Retry Validation
        </Button>
      </div>
    );
  }

  return null;
}

// =================================================================
// 🎯 MAIN VIDEO BUILDER COMPONENT
// =================================================================

export default function VideoBuilder({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  isEditing = false,
  className = ''
}: VideoBuilderProps) {
  
  // =================================================================
  // 🎯 FORM SETUP
  // =================================================================
  
  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      youtubeUrl: initialData?.videoData?.youtubeUrl || '',
      accessLevel: (initialData?.accessLevel as ContentAccessLevel) || 'FREE',
      duration: initialData?.duration || undefined,
      isRequired: initialData?.isRequired || false,
      autoPlay: initialData?.videoData?.autoPlay || false,
      showControls: initialData?.videoData?.showControls ?? true,
      allowFullscreen: initialData?.videoData?.allowFullscreen ?? true,
      startTime: initialData?.videoData?.startTime || undefined,
      endTime: initialData?.videoData?.endTime || undefined,
      playbackSpeed: initialData?.videoData?.playbackSpeed || [0.5, 1, 1.25, 1.5, 2]
    }
  });

  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [urlValidation, setUrlValidation] = useState<URLValidationState>({
    isValidating: false,
    isValid: null,
    videoId: null,
    thumbnail: null,
    error: null
  });

  const [isSaving, setIsSaving] = useState(false);

  // =================================================================
  // 🎯 WATCH FORM VALUES
  // =================================================================
  
  const watchedUrl = form.watch('youtubeUrl');
  const watchedTitle = form.watch('title');
  const watchedAutoPlay = form.watch('autoPlay');
  const watchedShowControls = form.watch('showControls');

  // =================================================================
  // 🎯 URL VALIDATION EFFECT
  // =================================================================
  
  useEffect(() => {
    if (!watchedUrl || watchedUrl.length < 10) {
      setUrlValidation(prev => ({ 
        ...prev, 
        isValid: null, 
        videoId: null, 
        error: null 
      }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUrlValidation(prev => ({ ...prev, isValidating: true }));
      
      const result = await validateYouTubeUrl(watchedUrl);
      
      setUrlValidation({
        isValidating: false,
        isValid: result.isValid,
        videoId: result.videoId,
        thumbnail: result.videoId ? getYouTubeThumbnail(result.videoId) : null,
        error: result.error
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [watchedUrl]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleSave = useCallback(async (data: VideoFormData) => {
    if (!urlValidation.isValid || !urlValidation.videoId) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsSaving(true);
    
    try {
      const videoContent: Partial<VideoContent> = {
        type: 'VIDEO' as ContentType,
        title: data.title,
        description: data.description,
        accessLevel: data.accessLevel as ContentAccessLevel,
        duration: data.duration,
        isRequired: data.isRequired,
        videoData: {
          youtubeUrl: data.youtubeUrl,
          videoId: urlValidation.videoId,
          thumbnail: urlValidation.thumbnail || undefined,
          startTime: data.startTime,
          endTime: data.endTime,
          autoPlay: data.autoPlay,
          showControls: data.showControls,
          allowFullscreen: data.allowFullscreen,
          playbackSpeed: data.playbackSpeed
        }
      };

      await onSave(videoContent);
      toast.success(isEditing ? 'Video updated successfully' : 'Video created successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save video content');
    } finally {
      setIsSaving(false);
    }
  }, [urlValidation, onSave, isEditing]);

  const handleRetryValidation = useCallback(() => {
    const currentUrl = form.getValues('youtubeUrl');
    if (currentUrl) {
      validateYouTubeUrl(currentUrl).then(result => {
        setUrlValidation({
          isValidating: false,
          isValid: result.isValid,
          videoId: result.videoId,
          thumbnail: result.videoId ? getYouTubeThumbnail(result.videoId) : null,
          error: result.error
        });
      });
    }
  }, [form]);

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const canShowPreview = useMemo(() => {
    return urlValidation.isValid && urlValidation.videoId && watchedTitle;
  }, [urlValidation.isValid, urlValidation.videoId, watchedTitle]);

  const isFormValid = useMemo(() => {
    return form.formState.isValid && urlValidation.isValid;
  }, [form.formState.isValid, urlValidation.isValid]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            {isEditing ? 'Edit Video Content' : 'Add Video Content'}
          </CardTitle>
          <CardDescription>
            Add YouTube videos to your session. Students will be able to watch and track their progress.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter video title"
                    {...form.register('title')}
                    error={form.formState.errors.title?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 10"
                    {...form.register('duration', { valueAsNumber: true })}
                    error={form.formState.errors.duration?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn from this video"
                  rows={3}
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>

            <Separator />

            {/* YouTube URL */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Video Source</h3>
              
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...form.register('youtubeUrl')}
                  error={form.formState.errors.youtubeUrl?.message}
                />
                
                <URLValidationIndicator 
                  state={urlValidation}
                  onRetry={handleRetryValidation}
                />
              </div>
            </div>

            <Separator />

            {/* Access & Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Access & Requirements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Controller
                    name="accessLevel"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">Free Content</SelectItem>
                          <SelectItem value="PREMIUM">Premium Content</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Controller
                    name="isRequired"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="isRequired"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="isRequired">Required content</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Player Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Player Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoPlay">Auto-play</Label>
                    <div className="text-xs text-gray-500">
                      Start video automatically
                    </div>
                  </div>
                  <Controller
                    name="autoPlay"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        id="autoPlay"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showControls">Show Controls</Label>
                    <div className="text-xs text-gray-500">
                      Display player controls
                    </div>
                  </div>
                  <Controller
                    name="showControls"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        id="showControls"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowFullscreen">Fullscreen</Label>
                    <div className="text-xs text-gray-500">
                      Allow fullscreen mode
                    </div>
                  </div>
                  <Controller
                    name="allowFullscreen"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        id="allowFullscreen"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSaving}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canShowPreview}
                  onClick={() => {
                    if (urlValidation.videoId) {
                      window.open(`https://www.youtube.com/watch?v=${urlValidation.videoId}`, '_blank');
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview on YouTube
                </Button>
                
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading || isSaving}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? 'Update Video' : 'Add Video'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {canShowPreview && urlValidation.videoId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>
              This is how the video will appear to students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoPreview
              videoId={urlValidation.videoId}
              title={watchedTitle}
              autoPlay={watchedAutoPlay}
              showControls={watchedShowControls}
            />
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
export default VideoBuilder;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  VideoPreview, 
  URLValidationIndicator
};

// ✅ PATTERN: Named exports untuk utilities
export {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  validateYouTubeUrl,
  videoFormSchema
};

// ✅ PATTERN: Named exports untuk types
export type { 
  VideoBuilderProps,
  VideoPreviewProps,
  URLValidationState,
  VideoFormData
};

// ✅ PATTERN: Display name untuk debugging
VideoBuilder.displayName = 'VideoBuilder';