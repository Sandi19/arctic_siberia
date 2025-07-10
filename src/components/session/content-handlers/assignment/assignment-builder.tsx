// File: src/components/session/content-handlers/assignment/assignment-builder.tsx

/**
 * =================================================================
 * 🎯 ASSIGNMENT CONTENT BUILDER - IMPLEMENTATION
 * =================================================================
 * Assignment content builder for homework and project submissions
 * Supports both instructor task upload and student submission
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Phase 3 (Final)
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useState, useCallback, useRef } from 'react';
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
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress
} from '@/components/ui';

// ✅ Icons
import {
  FileText,
  Upload,
  Download,
  Calendar as CalendarIcon,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  X,
  Trash2,
  Eye,
  EyeOff,
  Target,
  Star,
  RefreshCw,
  File,
  FileCheck
} from 'lucide-react';

// ✅ Date handling
import { format } from 'date-fns';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AssignmentData, ContentAccessLevel } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

export interface AssignmentBuilderProps {
  initialData?: Partial<AssignmentBuilderFormData>;
  onSave?: (data: AssignmentBuilderFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface AssignmentBuilderFormData {
  title: string;
  description?: string;
  accessLevel: ContentAccessLevel;
  duration?: number;
  assignmentData: AssignmentData;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const assignmentBuilderSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(10080, 'Duration must not exceed 1 week (10080 minutes)')
    .optional(),
  assignmentData: z.object({
    instructions: z.string()
      .min(10, 'Instructions must be at least 10 characters')
      .max(2000, 'Instructions must not exceed 2000 characters'),
    taskFileUrl: z.string().url('Invalid file URL').optional(),
    deadline: z.date().optional(),
    allowedFileTypes: z.array(z.string()).min(1, 'At least one file type must be allowed'),
    maxFileSize: z.number().min(1048576, 'Minimum file size is 1MB').max(104857600, 'Maximum file size is 100MB'),
    maxSubmissions: z.number().min(1).max(10).optional(),
    gradingCriteria: z.string().max(1000, 'Grading criteria must not exceed 1000 characters').optional()
  })
});

type AssignmentBuilderFormSchema = z.infer<typeof assignmentBuilderSchema>;

// =================================================================
// 🎯 CONSTANTS
// =================================================================

const SUPPORTED_FILE_TYPES = [
  { value: '.pdf', label: 'PDF' },
  { value: '.doc', label: 'DOC' },
  { value: '.docx', label: 'DOCX' },
  { value: '.txt', label: 'TXT' },
  { value: '.rtf', label: 'RTF' },
  { value: '.odt', label: 'ODT' },
  { value: '.jpg', label: 'JPG' },
  { value: '.jpeg', label: 'JPEG' },
  { value: '.png', label: 'PNG' },
  { value: '.zip', label: 'ZIP' },
  { value: '.rar', label: 'RAR' }
];

const FILE_SIZE_OPTIONS = [
  { value: 1048576, label: '1 MB' },
  { value: 5242880, label: '5 MB' },
  { value: 10485760, label: '10 MB' },
  { value: 20971520, label: '20 MB' },
  { value: 52428800, label: '50 MB' },
  { value: 104857600, label: '100 MB' }
];

const SUBMISSION_ATTEMPTS = [
  { value: 1, label: '1 attempt' },
  { value: 2, label: '2 attempts' },
  { value: 3, label: '3 attempts' },
  { value: 5, label: '5 attempts' },
  { value: 10, label: 'Unlimited (10)' }
];

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileTypeIcon(fileType: string): JSX.Element {
  if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-600" />;
  if (fileType.includes('doc')) return <FileText className="h-4 w-4 text-blue-600" />;
  if (fileType.includes('image')) return <File className="h-4 w-4 text-green-600" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <File className="h-4 w-4 text-purple-600" />;
  return <File className="h-4 w-4 text-gray-600" />;
}

// =================================================================
// 🎯 ASSIGNMENT BUILDER COMPONENT
// =================================================================

function AssignmentBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  className 
}: AssignmentBuilderProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>(['.pdf', '.doc', '.docx']);
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  // =================================================================
  // 🎯 FORM CONFIGURATION
  // =================================================================

  const form = useForm<AssignmentBuilderFormSchema>({
    resolver: zodResolver(assignmentBuilderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || undefined,
      assignmentData: {
        instructions: initialData?.assignmentData?.instructions || '',
        taskFileUrl: initialData?.assignmentData?.taskFileUrl || undefined,
        deadline: initialData?.assignmentData?.deadline || undefined,
        allowedFileTypes: initialData?.assignmentData?.allowedFileTypes || ['.pdf', '.doc', '.docx'],
        maxFileSize: initialData?.assignmentData?.maxFileSize || 10485760, // 10MB
        maxSubmissions: initialData?.assignmentData?.maxSubmissions || 3,
        gradingCriteria: initialData?.assignmentData?.gradingCriteria || ''
      }
    }
  });

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleTaskFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for task files)
    if (file.size > 52428800) {
      toast.error('Task file too large. Maximum size is 50MB.');
      return;
    }

    setTaskFile(file);
    handleTaskFileUpload(file);
  }, []);

  const handleTaskFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock file URL
      const mockFileUrl = `https://example.com/assignments/tasks/${file.name}`;
      
      // Update form with task file data
      form.setValue('assignmentData.taskFileUrl', mockFileUrl);
      
      // Auto-generate title if empty
      if (!form.getValues('title')) {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        form.setValue('title', `Assignment: ${titleWithoutExt}`);
      }

      toast.success('Task file uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [form]);

  const handleRemoveTaskFile = useCallback(() => {
    setTaskFile(null);
    form.setValue('assignmentData.taskFileUrl', undefined);
    
    if (taskFileInputRef.current) {
      taskFileInputRef.current.value = '';
    }
  }, [form]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setDeadlineDate(date);
    form.setValue('assignmentData.deadline', date);
  }, [form]);

  const handleFileTypeToggle = useCallback((fileType: string) => {
    setSelectedFileTypes(prev => {
      const newTypes = prev.includes(fileType)
        ? prev.filter(type => type !== fileType)
        : [...prev, fileType];
      
      form.setValue('assignmentData.allowedFileTypes', newTypes);
      return newTypes;
    });
  }, [form]);

  const handleSubmit = useCallback((data: AssignmentBuilderFormSchema) => {
    const formData: AssignmentBuilderFormData = {
      title: data.title,
      description: data.description,
      accessLevel: data.accessLevel,
      duration: data.duration,
      assignmentData: {
        instructions: data.assignmentData.instructions,
        taskFileUrl: data.assignmentData.taskFileUrl,
        deadline: data.assignmentData.deadline,
        allowedFileTypes: data.assignmentData.allowedFileTypes,
        maxFileSize: data.assignmentData.maxFileSize,
        maxSubmissions: data.assignmentData.maxSubmissions,
        gradingCriteria: data.assignmentData.gradingCriteria
      }
    };

    onSave?.(formData);
  }, [onSave]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Assignment Builder
          </CardTitle>
          <CardDescription>
            Create homework assignments with file submissions and grading
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
                      <FormLabel>Assignment Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Essay Writing - My Daily Routine"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your assignment a clear and descriptive title
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
                          placeholder="Provide a brief overview of the assignment objectives..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description of the assignment (visible to students)
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
                            max="10080"
                            placeholder="e.g., 120"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated time to complete
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Assignment Instructions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <Label className="text-sm font-medium">Assignment Instructions</Label>
                </div>

                <FormField
                  control={form.control}
                  name="assignmentData.instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write detailed instructions for your assignment. Include what students need to do, format requirements, and any specific guidelines..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed instructions that students will see (10-2000 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignmentData.gradingCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grading Criteria (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain how this assignment will be graded. Include rubric, point distribution, or evaluation criteria..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How students will be evaluated (helps students understand expectations)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Task File Upload (Optional) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium">Task File (Optional)</Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 Upload Assignment Materials
                  </h4>
                  <p className="text-sm text-blue-800">
                    Upload a file with assignment details, templates, or materials that students need to complete the task. 
                    This could be a worksheet, template, or reference document.
                  </p>
                </div>

                {/* Upload Area */}
                {!taskFile && !form.getValues('assignmentData.taskFileUrl') && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload task file (worksheet, template, etc.)
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Optional: PDF, DOC, DOCX, TXT (Max: 50MB)
                    </p>
                    <input
                      ref={taskFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleTaskFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => taskFileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Task File
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading task file...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Uploaded Task File Display */}
                {(taskFile || form.getValues('assignmentData.taskFileUrl')) && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FileCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">
                            Task File Uploaded
                          </p>
                          <p className="text-sm text-green-600">
                            {taskFile?.name || 'Task file ready'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveTaskFile}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Deadline & Submission Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <Label className="text-sm font-medium">Deadline & Submission Settings</Label>
                </div>

                <FormField
                  control={form.control}
                  name="assignmentData.deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !deadlineDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {deadlineDate ? (
                                format(deadlineDate, 'PPP p')
                              ) : (
                                'Select deadline (optional)'
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={deadlineDate}
                              onSelect={handleDateSelect}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        When should students submit this assignment?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignmentData.maxSubmissions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Submissions</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select max submissions" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBMISSION_ATTEMPTS.map(option => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          How many times can students submit?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignmentData.maxFileSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max File Size</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select max file size" />
                            </SelectTrigger>
                            <SelectContent>
                              {FILE_SIZE_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Maximum size for student submissions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Allowed File Types */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium">Allowed File Types</Label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SUPPORTED_FILE_TYPES.map(fileType => (
                    <div
                      key={fileType.value}
                      className={cn(
                        'flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                        selectedFileTypes.includes(fileType.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => handleFileTypeToggle(fileType.value)}
                    >
                      {getFileTypeIcon(fileType.value)}
                      <span className="text-sm font-medium">{fileType.label}</span>
                      {selectedFileTypes.includes(fileType.value) && (
                        <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  Select file types that students can submit ({selectedFileTypes.length} selected)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Assignment
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
export default AssignmentBuilder;

// ✅ PATTERN: Named exports untuk utilities
export {
  formatFileSize,
  getFileTypeIcon,
  SUPPORTED_FILE_TYPES,
  FILE_SIZE_OPTIONS,
  SUBMISSION_ATTEMPTS
};

// ✅ PATTERN: Type exports
export type {
  AssignmentBuilderProps,
  AssignmentBuilderFormData
};