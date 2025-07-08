// File: src/components/session/components/session-management/session-form.tsx

/**
 * =================================================================
 * 🎯 SESSION FORM COMPONENT
 * =================================================================
 * Comprehensive session creation/editing form
 * React Hook Form dengan Zod validation
 * Following Arctic Siberia Import/Export Standard
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ FIXED: Framework imports
import { 
  useCallback,
  useEffect,
  useMemo,
  useState 
} from 'react';

// ✅ FIXED: UI Components dari barrel exports
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Plus,
  Save,
  Settings,
  Star,
  Tag,
  Target,
  Trash2,
  X
} from 'lucide-react';

// ✅ FIXED: External libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ✅ FIXED: Local utilities - session types
import type {
  ContentAccessLevel,
  CreateSessionFormData,
  Session,
  UpdateSessionFormData
} from '../../types';

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const sessionFormSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    required_error: 'Please select a difficulty level'
  }),
  
  accessLevel: z.nativeEnum(ContentAccessLevel, {
    required_error: 'Please select an access level'
  }),
  
  objectives: z.array(z.string())
    .min(1, 'At least one learning objective is required')
    .max(10, 'Maximum 10 learning objectives allowed'),
  
  tags: z.array(z.string())
    .max(20, 'Maximum 20 tags allowed'),
  
  categoryId: z.string().optional(),
  
  prerequisites: z.array(z.string()).optional(),
  
  estimatedDuration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration must be less than 600 minutes')
    .optional(),
  
  isVisible: z.boolean().default(true),
  
  settings: z.object({
    allowNotes: z.boolean().default(true),
    allowBookmarks: z.boolean().default(true),
    trackProgress: z.boolean().default(true),
    enableComments: z.boolean().default(false),
    showPrerequisites: z.boolean().default(true),
    autoAdvance: z.boolean().default(false)
  }).optional()
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface SessionFormProps {
  mode: 'create' | 'edit';
  session?: Session;
  courseId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit: (data: CreateSessionFormData | UpdateSessionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface ObjectiveInputProps {
  objectives: string[];
  onObjectivesChange: (objectives: string[]) => void;
  maxObjectives?: number;
}

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
}

interface SettingsSectionProps {
  settings: SessionFormData['settings'];
  onSettingsChange: (settings: SessionFormData['settings']) => void;
}

// =================================================================
// 🎯 OBJECTIVES INPUT COMPONENT
// =================================================================

function ObjectiveInput({ 
  objectives, 
  onObjectivesChange, 
  maxObjectives = 10 
}: ObjectiveInputProps) {
  
  const [inputValue, setInputValue] = useState('');
  
  const handleAddObjective = useCallback(() => {
    const trimmed = inputValue.trim();
    
    if (!trimmed) {
      toast.error('Please enter an objective');
      return;
    }
    
    if (objectives.includes(trimmed)) {
      toast.error('This objective already exists');
      return;
    }
    
    if (objectives.length >= maxObjectives) {
      toast.error(`Maximum ${maxObjectives} objectives allowed`);
      return;
    }
    
    onObjectivesChange([...objectives, trimmed]);
    setInputValue('');
  }, [inputValue, objectives, onObjectivesChange, maxObjectives]);
  
  const handleRemoveObjective = useCallback((index: number) => {
    onObjectivesChange(objectives.filter((_, i) => i !== index));
  }, [objectives, onObjectivesChange]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddObjective();
    }
  }, [handleAddObjective]);
  
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a learning objective..."
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={handleAddObjective}
          disabled={objectives.length >= maxObjectives}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {objectives.length > 0 && (
        <div className="space-y-2">
          {objectives.map((objective, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted rounded-lg"
            >
              <Star className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm">{objective}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveObjective(index)}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{objectives.length} / {maxObjectives} objectives</span>
        {objectives.length < 1 && (
          <span className="text-destructive">At least 1 objective required</span>
        )}
      </div>
    </div>
  );
}

// =================================================================
// 🎯 TAG INPUT COMPONENT
// =================================================================

function TagInput({ 
  tags, 
  onTagsChange, 
  suggestions = [], 
  maxTags = 20 
}: TagInputProps) {
  
  const [inputValue, setInputValue] = useState('');
  
  const handleAddTag = useCallback((tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    
    if (!trimmed) return;
    
    if (tags.includes(trimmed)) {
      toast.error('This tag already exists');
      return;
    }
    
    if (tags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`);
      return;
    }
    
    onTagsChange([...tags, trimmed]);
    setInputValue('');
  }, [tags, onTagsChange, maxTags]);
  
  const handleRemoveTag = useCallback((index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  }, [tags, onTagsChange]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  }, [inputValue, handleAddTag]);
  
  const availableSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => 
      !tags.includes(suggestion.toLowerCase()) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 5);
  }, [suggestions, tags, inputValue]);
  
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter tags..."
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={() => handleAddTag(inputValue)}
          disabled={tags.length >= maxTags}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {availableSuggestions.length > 0 && inputValue && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTag(index)}
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground">
        {tags.length} / {maxTags} tags
      </div>
    </div>
  );
}

// =================================================================
// 🎯 SETTINGS SECTION COMPONENT
// =================================================================

function SettingsSection({ settings, onSettingsChange }: SettingsSectionProps) {
  const handleSettingChange = useCallback((key: string, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  }, [settings, onSettingsChange]);
  
  const settingsConfig = [
    {
      key: 'allowNotes',
      label: 'Allow Student Notes',
      description: 'Students can take notes during the session',
      icon: FileText
    },
    {
      key: 'allowBookmarks',
      label: 'Allow Bookmarks',
      description: 'Students can bookmark content for later review',
      icon: BookOpen
    },
    {
      key: 'trackProgress',
      label: 'Track Progress',
      description: 'Track student progress through the session',
      icon: Target
    },
    {
      key: 'enableComments',
      label: 'Enable Comments',
      description: 'Allow students to comment on content',
      icon: AlertCircle
    },
    {
      key: 'showPrerequisites',
      label: 'Show Prerequisites',
      description: 'Display prerequisite information to students',
      icon: Info
    },
    {
      key: 'autoAdvance',
      label: 'Auto Advance',
      description: 'Automatically advance to next content after completion',
      icon: Clock
    }
  ];
  
  return (
    <div className="space-y-4">
      {settingsConfig.map((setting) => (
        <div key={setting.key} className="flex items-start space-x-3">
          <Checkbox
            id={setting.key}
            checked={settings?.[setting.key as keyof typeof settings] || false}
            onCheckedChange={(checked) => 
              handleSettingChange(setting.key, checked as boolean)
            }
            className="mt-1"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <setting.icon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor={setting.key} className="font-medium">
                {setting.label}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {setting.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// =================================================================
// 🎯 MAIN SESSION FORM COMPONENT
// =================================================================

function SessionForm({
  mode,
  session,
  courseId,
  isOpen = true,
  onClose,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: SessionFormProps) {
  
  // =================================================================
  // 🎯 FORM SETUP
  // =================================================================
  
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      title: session?.title || '',
      description: session?.description || '',
      difficulty: session?.difficulty || 'BEGINNER',
      accessLevel: session?.accessLevel || ContentAccessLevel.FREE,
      objectives: session?.objectives || [],
      tags: session?.tags || [],
      categoryId: session?.category?.id || '',
      prerequisites: session?.prerequisites || [],
      estimatedDuration: session?.estimatedDuration || undefined,
      isVisible: session?.isVisible ?? true,
      settings: {
        allowNotes: true,
        allowBookmarks: true,
        trackProgress: true,
        enableComments: false,
        showPrerequisites: true,
        autoAdvance: false
      }
    }
  });
  
  const { watch, setValue, handleSubmit, formState: { errors, isDirty } } = form;
  
  // =================================================================
  // 🎯 FORM STATE
  // =================================================================
  
  const watchedObjectives = watch('objectives');
  const watchedTags = watch('tags');
  const watchedSettings = watch('settings');
  
  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================
  
  const handleFormSubmit = useCallback(async (data: SessionFormData) => {
    try {
      const submitData = {
        ...data,
        ...(courseId && { courseId }),
        ...(mode === 'edit' && session && { id: session.id })
      };
      
      await onSubmit(submitData as CreateSessionFormData | UpdateSessionFormData);
      
      if (mode === 'create') {
        form.reset();
      }
      
      toast.success(`Session ${mode === 'create' ? 'created' : 'updated'} successfully`);
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${mode} session`);
    }
  }, [data, courseId, mode, session, onSubmit, form]);
  
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmDiscard) return;
    }
    
    form.reset();
    onCancel?.();
    onClose?.();
  }, [isDirty, form, onCancel, onClose]);
  
  // =================================================================
  // 🎯 SUGGESTIONS DATA
  // =================================================================
  
  const tagSuggestions = useMemo(() => [
    'programming', 'design', 'marketing', 'business', 'finance',
    'javascript', 'react', 'nodejs', 'python', 'css',
    'beginner-friendly', 'intermediate', 'advanced', 'hands-on',
    'theory', 'practical', 'interactive', 'self-paced'
  ], []);
  
  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  const FormContent = (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your session
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter session title..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what students will learn in this session..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description to help students understand the session content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ContentAccessLevel.FREE}>Free</SelectItem>
                        <SelectItem value={ContentAccessLevel.PREMIUM}>Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Objectives
            </CardTitle>
            <CardDescription>
              What will students achieve after completing this session?
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ObjectiveInput
              objectives={watchedObjectives}
              onObjectivesChange={(objectives) => setValue('objectives', objectives)}
            />
            {errors.objectives && (
              <p className="text-sm text-destructive mt-2">
                {errors.objectives.message}
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
            <CardDescription>
              Add tags to help students discover your session
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TagInput
              tags={watchedTags}
              onTagsChange={(tags) => setValue('tags', tags)}
              suggestions={tagSuggestions}
            />
            {errors.tags && (
              <p className="text-sm text-destructive mt-2">
                {errors.tags.message}
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Session Settings
            </CardTitle>
            <CardDescription>
              Configure how students interact with this session
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <SettingsSection
              settings={watchedSettings}
              onSettingsChange={(settings) => setValue('settings', settings)}
            />
          </CardContent>
        </Card>
        
        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visibility
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Make session visible to students
                    </FormLabel>
                    <FormDescription>
                      Students can see and access this session when published
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-sm text-muted-foreground">
                You have unsaved changes
              </span>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Session' : 'Update Session'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
  
  // Render as dialog or inline
  if (onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create New Session' : 'Edit Session'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Add a new session to your course with detailed configuration'
                : 'Update session information and settings'
              }
            </DialogDescription>
          </DialogHeader>
          
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {FormContent}
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default SessionForm;

// ✅ PATTERN: Named exports untuk types dan sub-components
export type { 
  SessionFormProps,
  ObjectiveInputProps,
  TagInputProps,
  SettingsSectionProps
};

export {
  ObjectiveInput,
  TagInput,
  SettingsSection,
  sessionFormSchema
};