// File: src/components/session/content-handlers/document/document-builder.tsx

/**
 * =================================================================
 * 📄 DOCUMENT BUILDER COMPONENT
 * =================================================================
 * Document upload/management builder untuk instructor interface
 * Following Arctic Siberia Import/Export Standard
 * Phase 2 - Priority 2.3 (HIGH)
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
  useRef,
  useState
} from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Progress,
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
  Cloud,
  Eye,
  FileText,
  Loader2,
  Upload,
  X
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
  DocumentContent,
  ContentType,
  ContentAccessLevel
} from '../../types';

// =================================================================
// 🎯 VALIDATION SCHEMA
// =================================================================

const documentFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  accessLevel: z.enum(['FREE', 'PREMIUM'] as const),
  
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration cannot exceed 5 hours')
    .optional(),
  
  isRequired: z.boolean().default(false),
  
  isDownloadable: z.boolean().default(true),
  
  viewerType: z.enum(['EMBED', 'DOWNLOAD_ONLY'] as const).default('EMBED'),
  
  // File information (populated after upload)
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  fileUrl: z.string().url().optional()
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface DocumentBuilderProps {
  initialData?: Partial<DocumentContent>;
  onSave: (data: Partial<DocumentContent>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  className?: string;
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  error?: string;
  accept?: string;
}

interface FilePreviewProps {
  file: File | null;
  fileUrl?: string;
  onRemove: () => void;
}

interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  selectedFile: File | null;
  uploadedFileUrl: string | null;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type from file extension
 */
function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return extension;
}

/**
 * Check if file type is allowed
 */
function isAllowedFileType(fileName: string): boolean {
  const allowedTypes = [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'txt', 'rtf', 'png', 'jpg', 'jpeg', 'gif', 'svg'
  ];
  const fileType = getFileType(fileName);
  return allowedTypes.includes(fileType);
}

/**
 * Get file type icon and color
 */
function getFileTypeConfig(fileType: string): {
  icon: string;
  color: string;
  label: string;
} {
  const type = fileType.toLowerCase();
  
  switch (type) {
    case 'pdf':
      return { icon: '📄', color: 'text-red-600', label: 'PDF Document' };
    case 'doc':
    case 'docx':
      return { icon: '📝', color: 'text-blue-600', label: 'Word Document' };
    case 'ppt':
    case 'pptx':
      return { icon: '📊', color: 'text-orange-600', label: 'PowerPoint' };
    case 'xls':
    case 'xlsx':
      return { icon: '📈', color: 'text-green-600', label: 'Excel Spreadsheet' };
    case 'txt':
    case 'rtf':
      return { icon: '📄', color: 'text-gray-600', label: 'Text Document' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return { icon: '🖼️', color: 'text-purple-600', label: 'Image File' };
    default:
      return { icon: '📎', color: 'text-gray-600', label: 'Document' };
  }
}

/**
 * Simulate file upload (in real app, this would upload to cloud storage)
 */
async function uploadFile(
  file: File, 
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      onProgress(Math.min(progress, 95));
      
      if (progress >= 95) {
        clearInterval(interval);
        // Simulate final upload completion
        setTimeout(() => {
          onProgress(100);
          // In real app, return actual file URL from storage service
          const fakeUrl = `https://storage.example.com/documents/${Date.now()}-${file.name}`;
          resolve(fakeUrl);
        }, 500);
      }
    }, 200);

    // Simulate upload failure occasionally
    setTimeout(() => {
      if (Math.random() < 0.05) { // 5% chance of failure
        clearInterval(interval);
        reject(new Error('Upload failed'));
      }
    }, 1000);
  });
}

// =================================================================
// 🎯 FILE UPLOAD SUB-COMPONENT
// =================================================================

function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  uploading, 
  uploadProgress,
  error,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isAllowedFileType(file.name)) {
        onFileSelect(file);
      } else {
        toast.error('File type not supported');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isAllowedFileType(file.name)) {
        onFileSelect(file);
      } else {
        toast.error('File type not supported');
      }
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (selectedFile) {
    return (
      <FilePreview 
        file={selectedFile}
        onRemove={onFileRemove}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            <div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                Uploading Document...
              </div>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <div className="text-sm text-gray-600 mt-2">
                {Math.round(uploadProgress)}% complete
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                Upload Document
              </div>
              <div className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </div>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <div><strong>Supported formats:</strong> PDF, Word, PowerPoint, Excel, Text, Images</div>
        <div><strong>Maximum size:</strong> 50MB per file</div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 FILE PREVIEW SUB-COMPONENT
// =================================================================

function FilePreview({ file, fileUrl, onRemove }: FilePreviewProps) {
  const fileType = file ? getFileType(file.name) : '';
  const config = getFileTypeConfig(fileType);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-4">
        <div className={`text-3xl ${config.color}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {file?.name}
          </div>
          <div className="text-sm text-gray-600">
            {config.label} • {file ? formatFileSize(file.size) : 'Unknown size'}
          </div>
          {fileUrl && (
            <div className="text-xs text-green-600 mt-1">
              ✓ Uploaded successfully
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 DOCUMENT PREVIEW SUB-COMPONENT
// =================================================================

function DocumentPreview({ data, fileUrl }: { data: DocumentFormData; fileUrl?: string }) {
  const fileConfig = data.fileType ? getFileTypeConfig(data.fileType) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {data.title}
        </CardTitle>
        {data.description && (
          <CardDescription>{data.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {fileConfig && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{fileConfig.icon}</span>
            <div>
              <div className="font-medium">{data.fileName}</div>
              <div className="text-sm text-gray-600">
                {fileConfig.label} • {data.fileSize ? formatFileSize(data.fileSize) : 'Unknown size'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Access Level:</span>
            <span className="ml-2 font-medium">{data.accessLevel}</span>
          </div>
          <div>
            <span className="text-gray-600">Downloadable:</span>
            <span className="ml-2 font-medium">{data.isDownloadable ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-gray-600">Viewer Type:</span>
            <span className="ml-2 font-medium">
              {data.viewerType === 'EMBED' ? 'Inline Preview' : 'Download Only'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Required:</span>
            <span className="ml-2 font-medium">{data.isRequired ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {fileUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">Document ready for students</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN DOCUMENT BUILDER COMPONENT
// =================================================================

export default function DocumentBuilder({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  isEditing = false,
  className = ''
}: DocumentBuilderProps) {
  
  // =================================================================
  // 🎯 FORM SETUP
  // =================================================================
  
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: (initialData?.accessLevel as ContentAccessLevel) || 'FREE',
      duration: initialData?.duration || undefined,
      isRequired: initialData?.isRequired || false,
      isDownloadable: initialData?.documentData?.isDownloadable ?? true,
      viewerType: initialData?.documentData?.viewerType || 'EMBED',
      fileName: initialData?.documentData?.fileName || '',
      fileSize: initialData?.documentData?.fileSize || 0,
      fileType: initialData?.documentData?.fileType || '',
      fileUrl: initialData?.documentData?.fileUrl || ''
    }
  });

  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadError: null,
    selectedFile: null,
    uploadedFileUrl: initialData?.documentData?.fileUrl || null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // =================================================================
  // 🎯 WATCH FORM VALUES
  // =================================================================
  
  const watchedTitle = form.watch('title');
  const watchedFileUrl = form.watch('fileUrl');

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      isUploading: true,
      uploadProgress: 0,
      uploadError: null
    }));

    try {
      const fileUrl = await uploadFile(file, (progress) => {
        setUploadState(prev => ({ ...prev, uploadProgress: progress }));
      });

      // Update form with file information
      form.setValue('fileName', file.name);
      form.setValue('fileSize', file.size);
      form.setValue('fileType', getFileType(file.name));
      form.setValue('fileUrl', fileUrl);

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFileUrl: fileUrl,
        uploadError: null
      }));

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadError: 'Upload failed. Please try again.'
      }));
      toast.error('Upload failed. Please try again.');
    }
  }, [form]);

  const handleFileRemove = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      selectedFile: null,
      uploadedFileUrl: null,
      uploadError: null
    }));

    // Clear form file data
    form.setValue('fileName', '');
    form.setValue('fileSize', 0);
    form.setValue('fileType', '');
    form.setValue('fileUrl', '');
  }, [form]);

  const handleSave = useCallback(async (data: DocumentFormData) => {
    if (!data.fileUrl) {
      toast.error('Please upload a document first');
      return;
    }

    setIsSaving(true);
    
    try {
      const documentContent: Partial<DocumentContent> = {
        type: 'DOCUMENT' as ContentType,
        title: data.title,
        description: data.description,
        accessLevel: data.accessLevel as ContentAccessLevel,
        duration: data.duration,
        isRequired: data.isRequired,
        documentData: {
          fileUrl: data.fileUrl!,
          fileName: data.fileName!,
          fileSize: data.fileSize!,
          fileType: data.fileType!,
          isDownloadable: data.isDownloadable,
          viewerType: data.viewerType
        }
      };

      await onSave(documentContent);
      toast.success(isEditing ? 'Document updated successfully' : 'Document added successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isEditing]);

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const isFormValid = useMemo(() => {
    return form.formState.isValid && !!watchedFileUrl;
  }, [form.formState.isValid, watchedFileUrl]);

  const canShowPreview = useMemo(() => {
    return watchedTitle && watchedFileUrl;
  }, [watchedTitle, watchedFileUrl]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {isEditing ? 'Edit Document Content' : 'Add Document Content'}
          </CardTitle>
          <CardDescription>
            Upload documents like PDFs, Word files, or presentations for students to view and download.
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
                    placeholder="Enter document title"
                    {...form.register('title')}
                    error={form.formState.errors.title?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Study Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 30"
                    {...form.register('duration', { valueAsNumber: true })}
                    error={form.formState.errors.duration?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn from this document"
                  rows={3}
                  {...form.register('description')}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>

            <Separator />

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Document Upload</h3>
              
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={uploadState.selectedFile}
                uploading={uploadState.isUploading}
                uploadProgress={uploadState.uploadProgress}
                error={uploadState.uploadError || undefined}
              />
            </div>

            <Separator />

            {/* Document Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Document Settings</h3>
              
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
                  <Label htmlFor="viewerType">Viewer Type</Label>
                  <Controller
                    name="viewerType"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMBED">Inline Preview</SelectItem>
                          <SelectItem value="DOWNLOAD_ONLY">Download Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
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
                    name="isDownloadable"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        id="isDownloadable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="isDownloadable">Allow downloads</Label>
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
                disabled={isLoading || isSaving || uploadState.isUploading}
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
                  disabled={!isFormValid || isLoading || isSaving || uploadState.isUploading}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? 'Update Document' : 'Add Document'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && canShowPreview && (
        <DocumentPreview 
          data={form.getValues()} 
          fileUrl={uploadState.uploadedFileUrl || undefined}
        />
      )}
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default DocumentBuilder;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  FileUpload, 
  FilePreview, 
  DocumentPreview
};

// ✅ PATTERN: Named exports untuk utilities
export {
  formatFileSize,
  getFileType,
  isAllowedFileType,
  getFileTypeConfig,
  uploadFile,
  documentFormSchema
};

// ✅ PATTERN: Named exports untuk types
export type { 
  DocumentBuilderProps,
  FileUploadProps,
  FilePreviewProps,
  UploadState,
  DocumentFormData
};

// ✅ PATTERN: Display name untuk debugging
DocumentBuilder.displayName = 'DocumentBuilder';