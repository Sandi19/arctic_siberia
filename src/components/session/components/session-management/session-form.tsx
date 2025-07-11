// File: src/components/session/components/session-management/session-form.tsx

/**
 * =================================================================
 * 🎯 SESSION FORM COMPONENT - SESSION MANAGEMENT
 * =================================================================
 * Comprehensive session creation/editing form with validation
 * Perfect for session management in course builder
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Session Management
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useEffect, useState } from 'react';

// ✅ External libraries - form & validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';

// ✅ Icons
import {
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Star,
  Users,
  Target,
  Tag,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { 
  Session, 
  CreateSessionFormData,
  UpdateSessionFormData,
  SessionDifficulty,
  ContentAccessLevel 
} from '../../types';

// =================================================================
// 🎯 FORM VALIDATION SCHEMA
// =================================================================

const sessionFormSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  accessLevel: z.enum(['FREE', 'PREMIUM']),
  objectives: z.array(z.string().min(1, 'Objective cannot be empty'))
    .min(1, 'At least one objective is required')
    .max(10, 'Maximum 10 objectives allowed'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty'))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .default([]),
  estimatedDuration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration must be less than 300 minutes')
    .optional(),
  prerequisites: z.array(z.string())
    .optional()
    .default([])
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

// =================================================================
// 🎯 INTERFACES
// =================================================================

export interface SessionFormProps {
  mode: 'create' | 'edit';
  session?: Session;
  courseId?: string;
  onSubmit: (data: CreateSessionFormData | UpdateSessionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

interface ObjectiveInputProps {
  objectives: string[];
  onChange: (objectives: string[]) => void;
  maxObjectives?: number;
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  suggestions?: string[];
}

// =================================================================
// 🎯 OBJECTIVE INPUT COMPONENT
// =================================================================

function ObjectiveInput({ 
  objectives, 
  onChange, 
  maxObjectives = 10 
}: ObjectiveInputProps) {
  const [currentObjective, setCurrentObjective] = useState('');

  const addObjective = useCallback(() => {
    if (currentObjective.trim() && objectives.length < maxObjectives) {
      onChange([...objectives, currentObjective.trim()]);
      setCurrentObjective('');
    }
  }, [currentObjective, objectives, onChange, maxObjectives]);

  const removeObjective = useCallback((index: number) => {
    onChange(objectives.filter((_, i) => i !== index));
  }, [objectives, onChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addObjective();
    }
  }, [addObjective]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={currentObjective}
          onChange={(e) => setCurrentObjective(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter learning objective..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addObjective}
          disabled={!currentObjective.trim() || objectives.length >= maxObjectives}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {objectives.length > 0 && (
        <div className="space-y-2">
          {objectives.map((objective, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Target className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-sm">{objective}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeObjective(index)}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-600">
        {objectives.length}/{maxObjectives} objectives
      </p>
    </div>
  );
}

// =================================================================
// 🎯 TAG INPUT COMPONENT
// =================================================================

function TagInput({ 
  tags, 
  onChange, 
  maxTags = 20,
  suggestions = ['grammar', 'vocabulary', 'conversation', 'pronunciation', 'reading', 'writing']
}: TagInputProps) {
  const [currentTag, setCurrentTag] = useState('');

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setCurrentTag('');
    }
  }, [tags, onChange, maxTags]);

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  }, [tags, onChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  }, [addTag, currentTag]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter tags separated by commas..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={() => addTag(currentTag)}
          disabled={!currentTag.trim() || tags.length >= maxTags}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-600 mr-2">Suggestions:</span>
          {suggestions
            .filter(suggestion => !tags.includes(suggestion))
            .slice(0, 5)
            .map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(suggestion)}
                className="h-6 text-xs"
                disabled={tags.length >= maxTags}
              >
                {suggestion}
              </Button>
            ))}
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-600">
        {tags.length}/{maxTags} tags
      </p>
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
      accessLevel: session?.accessLevel || 'FREE',
      objectives: session?.objectives || [],
      tags: session?.tags || [],
      estimatedDuration: session?.estimatedDuration || undefined,
      prerequisites: session?.prerequisites || []
    }
  });

  const { control, handleSubmit, formState, watch, setValue } = form;
  const { errors, isValid, isDirty } = formState;

  // =================================================================
  // 🎯 FORM HANDLERS
  // =================================================================

  const handleFormSubmit = useCallback(async (data: SessionFormData) => {
    try {
      if (mode === 'create') {
        const createData: CreateSessionFormData = {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          accessLevel: data.accessLevel,
          objectives: data.objectives,
          tags: data.tags || []
        };
        await onSubmit(createData);
      } else {
        const updateData: UpdateSessionFormData = {
          id: session!.id,
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          accessLevel: data.accessLevel,
          objectives: data.objectives,
          tags: data.tags || []
        };
        await onSubmit(updateData);
      }
      toast.success(`Session ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${mode} session`);
    }
  }, [mode, session, onSubmit]);

  // =================================================================
  // 🎯 WATCH VALUES
  // =================================================================

  const watchedAccessLevel = watch('accessLevel');
  const watchedObjectives = watch('objectives');
  const watchedTags = watch('tags');

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {mode === 'create' ? 'Create New Session' : 'Edit Session'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new session to your course with learning objectives and content'
            : 'Update session details and learning objectives'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Learning Goals</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              
              {/* Title */}
              <div>
                <Label htmlFor="title">Session Title *</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="title"
                      placeholder="e.g., Introduction to Russian Grammar"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Brief description of what students will learn in this session..."
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Difficulty & Access Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Difficulty Level *</Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-green-500" />
                              Beginner
                            </div>
                          </SelectItem>
                          <SelectItem value="INTERMEDIATE">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              Intermediate
                            </div>
                          </SelectItem>
                          <SelectItem value="ADVANCED">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-red-500" />
                              Advanced
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label>Access Level *</Label>
                  <Controller
                    name="accessLevel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Free Access
                            </div>
                          </SelectItem>
                          <SelectItem value="PREMIUM">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              Premium Only
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Estimated Duration */}
              <div>
                <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                <Controller
                  name="estimatedDuration"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      {...field}
                      id="estimatedDuration"
                      type="number"
                      min="1"
                      max="300"
                      placeholder="e.g., 45"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className={errors.estimatedDuration ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.estimatedDuration && (
                  <p className="text-sm text-red-600 mt-1">{errors.estimatedDuration.message}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  This helps students plan their learning time
                </p>
              </div>

              {/* Access Level Warning */}
              {watchedAccessLevel === 'FREE' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Free sessions are accessible to all students. Consider making advanced content premium.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Learning Goals Tab */}
            <TabsContent value="advanced" className="space-y-4">
              
              {/* Learning Objectives */}
              <div>
                <Label>Learning Objectives *</Label>
                <p className="text-sm text-gray-600 mb-3">
                  What will students be able to do after completing this session?
                </p>
                <ObjectiveInput
                  objectives={watchedObjectives || []}
                  onChange={(objectives) => setValue('objectives', objectives, { shouldValidate: true })}
                />
                {errors.objectives && (
                  <p className="text-sm text-red-600 mt-1">{errors.objectives.message}</p>
                )}
              </div>

              <Separator />

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Add tags to help categorize and search for this session
                </p>
                <TagInput
                  tags={watchedTags || []}
                  onChange={(tags) => setValue('tags', tags)}
                  suggestions={['grammar', 'vocabulary', 'conversation', 'pronunciation', 'reading', 'writing', 'listening', 'culture']}
                />
              </div>

              <Separator />

              {/* Prerequisites */}
              <div>
                <Label>Prerequisites (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">
                  What should students know before taking this session?
                </p>
                <Controller
                  name="prerequisites"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(p => p.trim()).filter(p => p))}
                      placeholder="e.g., Basic alphabet knowledge, Numbers 1-10"
                      rows={2}
                    />
                  )}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Separate multiple prerequisites with commas
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {isDirty && (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>You have unsaved changes</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="min-w-24"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {mode === 'create' ? 'Create Session' : 'Update Session'}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 DEFAULT EXPORT (Arctic Siberia Standard)
// =================================================================

export default SessionForm;