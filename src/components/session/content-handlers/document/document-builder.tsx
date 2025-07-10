// File: src/components/session/content-handlers/document/document-builder.tsx

/**
 * =================================================================
 * 🎯 DOCUMENT CONTENT BUILDER - IMPLEMENTATION
 * =================================================================
 * Document content builder for PDF/DOC file upload and configuration
 * Perfect for language learning worksheets and materials
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Phase 3
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
  Progress
} from '@/components/ui';

// ✅ Icons
import {
  FileText,
  Upload,
  Download,
  Eye,
  EyeOff,
  Settings,
  CheckCircle,
  AlertCircle,
  X,
  File,
  FileCheck,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DocumentData, ContentAccessLevel } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

export interface DocumentBuilderProps {
  initialData?: Partial<DocumentBuilderFormData>;
  onSave?: (data: DocumentBuilderFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface DocumentBuilderFormData {
  title: string;
  description?: string;
  accessLevel: ContentAccessLevel;
  duration?: number;
  documentData: DocumentData;
}

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const documentBuilderSchema = z.object({
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
  documentData: z.object({
    fileUrl: z.string().url('Invalid file URL'),
    fileName: z.string().min(1, 'File name is required'),
    fileType: z.string().min(1, 'File type is required'),
    fileSize: z.number().min(1, 'File size must be greater than 0'),
    isDownloadable: z.boolean().default(true),
    pages: z.number().min(1).optional()
  })
});

type DocumentBuilderFormSchema = z.infer<typeof documentBuilderSchema>;

// =================================================================
// 🎯 CONSTANTS
// =================================================================

const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const FILE_TYPE_LABELS = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  switch (fileType) {
    case 'application/pdf':
      return <FileText className="h-4 w-4 text-red-600" />;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FileText className="h-4 w-4 text-blue-600" />;
    default:
      return <File className="h-4 w-4 text-gray-600" />;
  }
}

// =================================================================
// 🎯 DOCUMENT BUILDER COMPONENT
// =================================================================

function DocumentBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  className 
}: DocumentBuilderProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =================================================================
  // 🎯 FORM CONFIGURATION
  // =================================================================

  const form = useForm<DocumentBuilderFormSchema>({
    resolver: zodResolver(documentBuilderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || undefined,
      documentData: {
        fileUrl: initialData?.documentData?.fileUrl || '',
        fileName: initialData?.documentData?.fileName || '',
        fileType: initialData?.documentData?.fileType || '',
        fileSize: initialData?.documentData?.fileSize || 0,
        isDownloadable: initialData?.documentData?.isDownloadable ?? true,
        pages: initialData?.documentData?.pages || undefined
      }
    }
  });

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit.`);
      return;
    }

    setUploadedFile(file);
    handleFileUpload(file);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
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
      }, 200);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock file URL
      const mockFileUrl = `https://example.com/documents/${file.name}`;
      setPreviewUrl(URL.createObjectURL(file));

      // Update form with file data
      form.setValue('documentData.fileUrl', mockFileUrl);
      form.setValue('documentData.fileName', file.name);
      form.setValue('documentData.fileType', file.type);
      form.setValue('documentData.fileSize', file.size);
      
      // Auto-generate title if empty
      if (!form.getValues('title')) {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        form.setValue('title', `Document: ${titleWithoutExt}`);
      }

      // Estimate pages for PDF
      if (file.type === 'application/pdf') {
        const estimatedPages = Math.ceil(file.size / 100000); // Rough estimate
        form.setValue('documentData.pages', estimatedPages);
      }

      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [form]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    form.setValue('documentData.fileUrl', '');
    form.setValue('documentData.fileName', '');
    form.setValue('documentData.fileType', '');
    form.setValue('documentData.fileSize', 0);
    form.setValue('documentData.pages', undefined);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [form]);

  const handleSubmit = useCallback((data: DocumentBuilderFormSchema) => {
    if (!uploadedFile && !initialData?.documentData?.fileUrl) {
      toast.error('Please upload a document file first');
      return;
    }

    const formData: DocumentBuilderFormData = {
      title: data.title,
      description: data.description,
      accessLevel: data.accessLevel,
      duration: data.duration,
      documentData: {
        fileUrl: data.documentData.fileUrl,
        fileName: data.documentData.fileName,
        fileType: data.documentData.fileType,
        fileSize: data.documentData.fileSize,
        isDownloadable: data.documentData.isDownloadable,
        pages: data.documentData.pages
      }
    };

    onSave?.(formData);
  }, [uploadedFile, initialData, onSave]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Document Content Builder
          </CardTitle>
          <CardDescription>
            Upload PDF, DOC, or text files for language learning materials
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
                          placeholder="e.g., English Grammar Worksheet"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your document content a descriptive title
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
                          placeholder="Describe what students will learn from this document..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional context about the document content
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
                            placeholder="e.g., 20"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated reading time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* File Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium">Document File</Label>
                </div>

                {/* Upload Area */}
                {!uploadedFile && !form.getValues('documentData.fileUrl') && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your document file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: PDF, DOC, DOCX, TXT (Max: {formatFileSize(MAX_FILE_SIZE)})
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
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
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Uploaded File Display */}
                {(uploadedFile || form.getValues('documentData.fileName')) && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0">
                          {getFileTypeIcon(form.getValues('documentData.fileType'))}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-800">
                            {form.getValues('documentData.fileName')}
                          </p>
                          <p className="text-sm text-green-600">
                            {formatFileSize(form.getValues('documentData.fileSize'))} • {FILE_TYPE_LABELS[form.getValues('documentData.fileType') as keyof typeof FILE_TYPE_LABELS]}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveFile}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {form.getValues('documentData.pages') && (
                        <div className="flex items-center gap-2 mb-4">
                          <FileCheck className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            {form.getValues('documentData.pages')} pages detected
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Document Settings</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showAdvanced ? 'Hide' : 'Show'} Settings
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <FormField
                      control={form.control}
                      name="documentData.isDownloadable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Allow Download</FormLabel>
                            <FormDescription className="text-xs">
                              Students can download this document for offline reading
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

                    {form.getValues('documentData.fileType') === 'application/pdf' && (
                      <FormField
                        control={form.control}
                        name="documentData.pages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Pages</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="1000"
                                placeholder="Auto-detected"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of pages in the PDF (used for progress tracking)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Document Content
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
export default DocumentBuilder;

// ✅ PATTERN: Named exports untuk utilities
export {
  formatFileSize,
  getFileTypeIcon,
  SUPPORTED_FILE_TYPES,
  FILE_TYPE_LABELS,
  MAX_FILE_SIZE
};

// ✅ PATTERN: Type exports
export type {
  DocumentBuilderProps,
  DocumentBuilderFormData
};