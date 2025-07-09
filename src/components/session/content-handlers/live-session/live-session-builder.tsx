// File: src/components/session/content-handlers/live-session/live-session-builder.tsx

/**
 * =================================================================
 * 📹 LIVE SESSION BUILDER COMPONENT
 * =================================================================
 * Live meeting/webinar builder untuk instructor interface
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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  Alert,
  AlertDescription,
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
  Calendar,
  Clock,
  Copy,
  Eye,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  Plus,
  Settings,
  Trash2,
  Users,
  Video
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
  LiveSessionContent,
  ContentType,
  ContentAccessLevel
} from '../../types';

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const liveSessionFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),
  
  isRequired: z.boolean().default(false),
  
  // Schedule settings
  scheduledAt: z.string()
    .min(1, 'Schedule date and time is required'),
  
  timezone: z.string().default('Asia/Jakarta'),
  
  // Zoom settings
  zoomMeetingId: z.string().optional(),
  zoomJoinUrl: z.string().url().optional(),
  zoomPassword: z.string().optional(),
  
  // Session settings
  maxParticipants: z.number()
    .min(1, 'Must allow at least 1 participant')
    .max(1000, 'Maximum 1000 participants allowed')
    .optional(),
  
  isRecorded: z.boolean().default(false),
  recordingUrl: z.string().url().optional(),
  
  agenda: z.string()
    .max(1000, 'Agenda must be less than 1000 characters')
    .optional(),
  
  prerequisites: z.array(z.string()).default([])
});

type LiveSessionFormData = z.infer<typeof liveSessionFormSchema>;

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface LiveSessionBuilderProps {
  initialData?: Partial<LiveSessionContent>;
  onSave: (data: Partial<LiveSessionContent>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  className?: string;
}

interface ZoomIntegrationProps {
  onMeetingGenerate: (settings: ZoomMeetingSettings) => Promise<ZoomMeetingInfo>;
  isGenerating: boolean;
}

interface ZoomMeetingSettings {
  title: string;
  startTime: Date;
  duration: number;
  password?: string;
  maxParticipants?: number;
}

interface ZoomMeetingInfo {
  meetingId: string;
  joinUrl: string;
  password?: string;
}

interface PrerequisiteManagerProps {
  prerequisites: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}

interface SessionPreviewProps {
  data: LiveSessionFormData;
  zoomInfo?: ZoomMeetingInfo;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Format date for datetime-local input
 */
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse datetime-local input to Date
 */
function parseDateTimeLocal(dateTimeString: string): Date {
  return new Date(dateTimeString);
}

/**
 * Validate if scheduled time is in the future
 */
function isValidScheduleTime(dateTime: string): boolean {
  const scheduledDate = new Date(dateTime);
  const now = new Date();
  return scheduledDate > now;
}

/**
 * Generate meeting ID (simulation)
 */
function generateMeetingId(): string {
  return Math.random().toString().substr(2, 11);
}

/**
 * Generate meeting password
 */
function generateMeetingPassword(): string {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * Simulate Zoom meeting creation
 */
async function createZoomMeeting(settings: ZoomMeetingSettings): Promise<ZoomMeetingInfo> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const meetingId = generateMeetingId();
  const password = settings.password || generateMeetingPassword();
  
  return {
    meetingId,
    joinUrl: `https://zoom.us/j/${meetingId}?pwd=${password}`,
    password
  };
}

/**
 * Get timezone list
 */
function getTimezoneOptions(): Array<{ value: string; label: string; }> {
  return [
    { value: 'Asia/Jakarta', label: 'WIB (Jakarta)' },
    { value: 'Asia/Makassar', label: 'WITA (Makassar)' },
    { value: 'Asia/Jayapura', label: 'WIT (Jayapura)' },
    { value: 'Asia/Singapore', label: 'SGT (Singapore)' },
    { value: 'UTC', label: 'UTC' }
  ];
}

// =================================================================
// 🎯 ZOOM INTEGRATION SUB-COMPONENT
// =================================================================

function ZoomIntegration({ 
  onMeetingGenerate, 
  isGenerating 
}: ZoomIntegrationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Zoom Integration</h4>
          <p className="text-sm text-gray-600">
            Generate meeting link automatically or enter manually
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {/* Will be handled by parent */}}
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Video className="w-4 h-4 mr-2" />
          )}
          Generate Meeting
        </Button>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You can either generate a new Zoom meeting or manually enter existing meeting details.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// =================================================================
// 🎯 PREREQUISITE MANAGER SUB-COMPONENT
// =================================================================

function PrerequisiteManager({ 
  prerequisites, 
  onAdd, 
  onRemove, 
  onUpdate 
}: PrerequisiteManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Prerequisites (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prerequisite
        </Button>
      </div>

      {prerequisites.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No prerequisites added</p>
          <p className="text-xs">Add requirements students should complete before joining</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prerequisites.map((prereq, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={prereq}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder="e.g., Complete previous lesson"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================================================================
// 🎯 SESSION PREVIEW SUB-COMPONENT
// =================================================================

function SessionPreview({ data, zoomInfo }: SessionPreviewProps) {
  const scheduledDate = new Date(data.scheduledAt);
  
  const handleCopyMeetingInfo = useCallback(() => {
    const meetingInfo = `
Meeting: ${data.title}
Time: ${scheduledDate.toLocaleString()}
Join URL: ${data.zoomJoinUrl || zoomInfo?.joinUrl || 'Not available'}
Meeting ID: ${data.zoomMeetingId || zoomInfo?.meetingId || 'Not available'}
Password: ${data.zoomPassword || zoomInfo?.password || 'No password'}
    `.trim();

    navigator.clipboard.writeText(meetingInfo).then(() => {
      toast.success('Meeting information copied');
    });
  }, [data, zoomInfo, scheduledDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          {data.title}
        </CardTitle>
        {data.description && (
          <CardDescription>{data.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Scheduled:</span>
            <span className="ml-2 font-medium">
              {scheduledDate.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 font-medium">
              {data.duration ? `${data.duration} minutes` : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Max Participants:</span>
            <span className="ml-2 font-medium">
              {data.maxParticipants || 'Unlimited'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Recording:</span>
            <span className="ml-2 font-medium">
              {data.isRecorded ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {(data.zoomJoinUrl || zoomInfo) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="font-medium text-blue-900">Meeting Details</div>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-blue-700">Meeting ID:</span>
                <span className="ml-2 font-mono">
                  {data.zoomMeetingId || zoomInfo?.meetingId}
                </span>
              </div>
              {(data.zoomPassword || zoomInfo?.password) && (
                <div>
                  <span className="text-blue-700">Password:</span>
                  <span className="ml-2 font-mono">
                    {data.zoomPassword || zoomInfo?.password}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMeetingInfo}
              className="w-full mt-2"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Meeting Info
            </Button>
          </div>
        )}

        {data.agenda && (
          <div className="space-y-2">
            <div className="font-medium">Agenda:</div>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {data.agenda}
            </div>
          </div>
        )}

        {data.prerequisites.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium">Prerequisites:</div>
            <ul className="text-sm text-gray-700 space-y-1">
              {data.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN LIVE SESSION BUILDER COMPONENT
// =================================================================

export default function LiveSessionBuilder({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  isEditing = false,
  className = ''
}: LiveSessionBuilderProps) {
  
  // =================================================================
  // 🎯 FORM SETUP
  // =================================================================
  
  const form = useForm<LiveSessionFormData>({
    resolver: zodResolver(liveSessionFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: (initialData?.accessLevel as ContentAccessLevel) || 'FREE',
      duration: initialData?.duration || 60,
      isRequired: initialData?.isRequired || false,
      scheduledAt: initialData?.liveSessionData?.scheduledAt 
        ? formatDateTimeLocal(new Date(initialData.liveSessionData.scheduledAt))
        : formatDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
      timezone: 'Asia/Jakarta',
      zoomMeetingId: initialData?.liveSessionData?.zoomMeetingId || '',
      zoomJoinUrl: initialData?.liveSessionData?.zoomJoinUrl || '',
      zoomPassword: initialData?.liveSessionData?.zoomPassword || '',
      maxParticipants: initialData?.liveSessionData?.maxParticipants || undefined,
      isRecorded: initialData?.liveSessionData?.isRecorded || false,
      recordingUrl: initialData?.liveSessionData?.recordingUrl || '',
      agenda: initialData?.liveSessionData?.agenda || '',
      prerequisites: initialData?.liveSessionData?.prerequisites || []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "prerequisites"
  });

  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingMeeting, setIsGeneratingMeeting] = useState(false);
  const [generatedZoomInfo, setGeneratedZoomInfo] = useState<ZoomMeetingInfo | null>(null);

  // =================================================================
  // 🎯 WATCH FORM VALUES
  // =================================================================
  
  const watchedTitle = form.watch('title');
  const watchedScheduledAt = form.watch('scheduledAt');
  const watchedDuration = form.watch('duration');
  const watchedIsRecorded = form.watch('isRecorded');

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleGenerateMeeting = useCallback(async () => {
    const title = form.getValues('title');
    const scheduledAt = form.getValues('scheduledAt');
    const duration = form.getValues('duration');
    
    if (!title || !scheduledAt) {
      toast.error('Please fill in title and schedule first');
      return;
    }

    setIsGeneratingMeeting(true);

    try {
      const meetingSettings: ZoomMeetingSettings = {
        title,
        startTime: parseDateTimeLocal(scheduledAt),
        duration: duration || 60,
        maxParticipants: form.getValues('maxParticipants')
      };

      const zoomInfo = await createZoomMeeting(meetingSettings);
      
      // Update form with generated meeting info
      form.setValue('zoomMeetingId', zoomInfo.meetingId);
      form.setValue('zoomJoinUrl', zoomInfo.joinUrl);
      form.setValue('zoomPassword', zoomInfo.password || '');
      
      setGeneratedZoomInfo(zoomInfo);
      toast.success('Zoom meeting created successfully');
    } catch (error) {
      console.error('Meeting generation error:', error);
      toast.error('Failed to generate meeting');
    } finally {
      setIsGeneratingMeeting(false);
    }
  }, [form]);

  const handleAddPrerequisite = useCallback(() => {
    append('');
  }, [append]);

  const handleRemovePrerequisite = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  const handleUpdatePrerequisite = useCallback((index: number, value: string) => {
    update(index, value);
  }, [update]);

  const handleSave = useCallback(async (data: LiveSessionFormData) => {
    // Validate schedule time
    if (!isValidScheduleTime(data.scheduledAt)) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setIsSaving(true);
    
    try {
      const liveSessionContent: Partial<LiveSessionContent> = {
        type: 'LIVE_SESSION' as ContentType,
        title: data.title,
        description: data.description,
        accessLevel: data.accessLevel as ContentAccessLevel,
        duration: data.duration,
        isRequired: data.isRequired,
        liveSessionData: {
          scheduledAt: parseDateTimeLocal(data.scheduledAt),
          zoomMeetingId: data.zoomMeetingId,
          zoomJoinUrl: data.zoomJoinUrl,
          zoomPassword: data.zoomPassword,
          maxParticipants: data.maxParticipants,
          isRecorded: data.isRecorded,
          recordingUrl: data.recordingUrl,
          agenda: data.agenda,
          prerequisites: data.prerequisites.filter(p => p.trim() !== ''),
          status: 'SCHEDULED'
        }
      };

      await onSave(liveSessionContent);
      toast.success(isEditing ? 'Live session updated successfully' : 'Live session scheduled successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save live session');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isEditing]);

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const isFormValid = useMemo(() => {
    return form.formState.isValid && isValidScheduleTime(watchedScheduledAt);
  }, [form.formState.isValid, watchedScheduledAt]);

  const canShowPreview = useMemo(() => {
    return watchedTitle && watchedScheduledAt;
  }, [watchedTitle, watchedScheduledAt]);

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            {isEditing ? 'Edit Live Session' : 'Schedule Live Session'}
          </CardTitle>
          <CardDescription>
            Create live meetings, webinars, or interactive sessions for real-time learning.
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
                    placeholder="Enter session title"
                    {...form.register('title')}
                    error={form.formState.errors.title?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    {...form.register('duration', { valueAsNumber: true })}
                    error={form.formState.errors.duration?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what will be covered in this live session"
                  rows={3}
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>

            <Separator />

            {/* Schedule Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    {...form.register('scheduledAt')}
                    error={form.formState.errors.scheduledAt?.message}
                  />
                  {!isValidScheduleTime(watchedScheduledAt) && (
                    <p className="text-xs text-red-600">
                      Schedule time must be in the future
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Controller
                    name="timezone"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Zoom Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Meeting Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Zoom Integration</h4>
                    <p className="text-sm text-gray-600">
                      Generate meeting link automatically or enter manually
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerateMeeting}
                    disabled={isGeneratingMeeting || !watchedTitle || !watchedScheduledAt}
                    size="sm"
                  >
                    {isGeneratingMeeting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Generate Meeting
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoomMeetingId">Meeting ID</Label>
                    <Input
                      id="zoomMeetingId"
                      placeholder="123 456 7890"
                      {...form.register('zoomMeetingId')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zoomPassword">Meeting Password</Label>
                    <Input
                      id="zoomPassword"
                      placeholder="Optional"
                      {...form.register('zoomPassword')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zoomJoinUrl">Join URL</Label>
                  <Input
                    id="zoomJoinUrl"
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    {...form.register('zoomJoinUrl')}
                    error={form.formState.errors.zoomJoinUrl?.message}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Session Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Session Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Controller
                    name="accessLevel"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">Free Content</SelectItem>
                          <SelectItem value="PREMIUM">Premium Content</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    {...form.register('maxParticipants', { valueAsNumber: true })}
                    error={form.formState.errors.maxParticipants?.message}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
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

                <div className="flex items-center space-x-2">
                  <Controller
                    name="isRecorded"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        id="isRecorded"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="isRecorded">Record session</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Agenda */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Agenda (Optional)</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="Outline what will be covered in this session..."
                  rows={4}
                  {...form.register('agenda')}
                  error={form.formState.errors.agenda?.message}
                />
              </div>
            </div>

            <Separator />

            {/* Prerequisites */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Prerequisites</h3>
              
              <PrerequisiteManager
                prerequisites={fields}
                onAdd={handleAddPrerequisite}
                onRemove={handleRemovePrerequisite}
                onUpdate={handleUpdatePrerequisite}
              />
            </div>

            {/* Recording URL (if session is recorded) */}
            {watchedIsRecorded && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recording</h3>
                  <div className="space-y-2">
                    <Label htmlFor="recordingUrl">Recording URL (after session)</Label>
                    <Input
                      id="recordingUrl"
                      type="url"
                      placeholder="https://zoom.us/rec/..."
                      {...form.register('recordingUrl')}
                      error={form.formState.errors.recordingUrl?.message}
                    />
                    <p className="text-xs text-gray-500">
                      Add the recording URL after the session is completed
                    </p>
                  </div>
                </div>
              </>
            )}

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
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!canShowPreview}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading || isSaving}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? 'Update Session' : 'Schedule Session'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && canShowPreview && (
        <SessionPreview 
          data={form.getValues()} 
          zoomInfo={generatedZoomInfo || undefined}
        />
      )}
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default LiveSessionBuilder;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  ZoomIntegration, 
  PrerequisiteManager, 
  SessionPreview
};

// ✅ PATTERN: Named exports untuk utilities
export {
  formatDateTimeLocal,
  parseDateTimeLocal,
  isValidScheduleTime,
  generateMeetingId,
  generateMeetingPassword,
  createZoomMeeting,
  getTimezoneOptions,
  liveSessionFormSchema
};

// ✅ PATTERN: Named exports untuk types
export type { 
  LiveSessionBuilderProps,
  ZoomIntegrationProps,
  ZoomMeetingSettings,
  ZoomMeetingInfo,
  PrerequisiteManagerProps,
  SessionPreviewProps,
  LiveSessionFormData
};

// ✅ PATTERN: Display name untuk debugging
LiveSessionBuilder.displayName = 'LiveSessionBuilder';