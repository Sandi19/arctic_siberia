// File: src/components/session/content-handlers/audio/audio-builder.tsx
'use client'

/**
 * =================================================================
 * 🎵 AUDIO BUILDER - SESSION CONTENT HANDLER
 * =================================================================
 * Session content handler untuk Audio type dalam Arctic Siberia LMS
 * Handles audio upload, configuration, dan chapter management
 * 
 * Features:
 * - Audio file upload dengan drag & drop
 * - Multiple audio format support (MP3, WAV, OGG, AAC, M4A, FLAC)
 * - Chapter management untuk long audio content
 * - Download control dan access level
 * - Arctic Siberia compliant architecture
 * 
 * Created: July 2025
 * =================================================================
 */

// ✅ Framework & Core Imports
import { 
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ UI Components - barrel imports
import {
  Alert,
  AlertDescription,
  Button,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Checkbox,
  Input,
  Label,
  Progress,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Separator,
  Switch,
  Textarea
} from '@/components/ui'

// ✅ Icons
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Headphones,
  Loader2,
  Mic,
  Music,
  Play,
  Plus,
  Trash2,
  Upload,
  Volume2,
  X
} from 'lucide-react'

// ✅ Local Utilities
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// =================================================================
// 🎯 TYPES & VALIDATION SCHEMAS
// =================================================================

// Session content types (would be imported from session types)
interface AudioContent {
  type: 'AUDIO'
  title: string
  description?: string
  accessLevel: 'FREE' | 'PREMIUM'
  duration?: number
  isRequired: boolean
  audioData: {
    audioUrl: string
    fileName: string
    fileSize: number
    audioFormat: string
    isDownloadable: boolean
    chapters: Array<{ title: string; startTime: number }>
    playbackSpeed: number[]
  }
}

const chapterSchema = z.object({
  title: z.string()
    .min(1, 'Chapter title is required')
    .max(100, 'Title must be less than 100 characters'),
  startTime: z.number()
    .min(0, 'Start time must be positive')
})

const audioFormSchema = z.object({
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
    .max(600, 'Duration cannot exceed 10 hours')
    .optional(),
  
  isRequired: z.boolean().default(false),
  
  isDownloadable: z.boolean().default(true),
  
  playbackSpeed: z.array(z.number()).default([0.5, 0.75, 1, 1.25, 1.5, 2]),
  
  chapters: z.array(chapterSchema).default([]),
  
  // File information (populated after upload)
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  audioFormat: z.string().optional(),
  audioUrl: z.string().url().optional()
})

type AudioFormData = z.infer<typeof audioFormSchema>

interface SessionAudioBuilderProps {
  sessionId: string
  initialData?: Partial<AudioContent>
  onSave: (data: Partial<AudioContent>) => void
  onCancel: () => void
  className?: string
}

interface AudioUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile: File | null
  uploading: boolean
  uploadProgress: number
  error?: string
  accept?: string
}

interface AudioPreviewProps {
  file: File | null
  audioUrl?: string
  onRemove: () => void
  onPlay: () => void
  isPlaying: boolean
}

interface ChapterManagerProps {
  chapters: Array<{ title: string; startTime: number }>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: string, value: string | number) => void
  errors?: any[]
  audioDuration?: number
}

interface UploadState {
  isUploading: boolean
  uploadProgress: number
  uploadError: string | null
  selectedFile: File | null
  uploadedFileUrl: string | null
  audioDuration: number | null
  isPlaying: boolean
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get audio format from file extension
 */
function getAudioFormat(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  return extension
}

/**
 * Check if file type is allowed audio format
 */
function isAllowedAudioType(fileName: string): boolean {
  const allowedTypes = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac']
  const audioFormat = getAudioFormat(fileName)
  return allowedTypes.includes(audioFormat)
}

/**
 * Get audio format icon and color
 */
function getAudioFormatConfig(format: string): {
  icon: JSX.Element
  color: string
  label: string
} {
  const type = format.toLowerCase()
  
  switch (type) {
    case 'mp3':
      return { 
        icon: <Music className="w-5 h-5" />, 
        color: 'text-blue-600', 
        label: 'MP3 Audio' 
      }
    case 'wav':
      return { 
        icon: <Volume2 className="w-5 h-5" />, 
        color: 'text-green-600', 
        label: 'WAV Audio' 
      }
    case 'ogg':
      return { 
        icon: <Headphones className="w-5 h-5" />, 
        color: 'text-purple-600', 
        label: 'OGG Audio' 
      }
    case 'aac':
    case 'm4a':
      return { 
        icon: <Music className="w-5 h-5" />, 
        color: 'text-orange-600', 
        label: 'AAC Audio' 
      }
    case 'flac':
      return { 
        icon: <Volume2 className="w-5 h-5" />, 
        color: 'text-red-600', 
        label: 'FLAC Audio' 
      }
    default:
      return { 
        icon: <Headphones className="w-5 h-5" />, 
        color: 'text-gray-600', 
        label: 'Audio File' 
      }
  }
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get audio duration from file
 */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio metadata'))
    })
    audio.src = URL.createObjectURL(file)
  })
}

/**
 * Simulate audio file upload
 */
async function uploadAudioFile(
  file: File, 
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      onProgress(Math.min(progress, 95))
      
      if (progress >= 95) {
        clearInterval(interval)
        setTimeout(() => {
          onProgress(100)
          const fakeUrl = `https://storage.example.com/audio/${Date.now()}-${file.name}`
          resolve(fakeUrl)
        }, 500)
      }
    }, 300)

    // Simulate upload failure occasionally
    setTimeout(() => {
      if (Math.random() < 0.03) { // 3% chance of failure
        clearInterval(interval)
        reject(new Error('Upload failed'))
      }
    }, 1000)
  })
}

// =================================================================
// 🎯 AUDIO UPLOAD SUB-COMPONENT
// =================================================================

function AudioUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  uploading, 
  uploadProgress,
  error,
  accept = ".mp3,.wav,.ogg,.aac,.m4a,.flac"
}: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isAllowedAudioType(file.name)) {
        onFileSelect(file)
      } else {
        toast.error('Audio format not supported')
      }
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isAllowedAudioType(file.name)) {
        onFileSelect(file)
      } else {
        toast.error('Audio format not supported')
      }
    }
  }, [onFileSelect])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  if (selectedFile) {
    return (
      <AudioPreview 
        file={selectedFile}
        onRemove={onFileRemove}
        onPlay={() => {}}
        isPlaying={false}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          dragActive 
            ? "border-purple-500 bg-purple-50" 
            : "border-gray-300 hover:border-gray-400",
          uploading && "pointer-events-none opacity-50"
        )}
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
            <Loader2 className="w-12 h-12 text-purple-600 mx-auto animate-spin" />
            <div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                Uploading Audio...
              </div>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <div className="text-sm text-gray-600 mt-2">
                {Math.round(uploadProgress)}% complete
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                Upload Audio File
              </div>
              <div className="text-gray-600 mb-4">
                Drag and drop your audio file here, or click to browse
              </div>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose Audio File
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
        <div><strong>Supported formats:</strong> MP3, WAV, OGG, AAC, M4A, FLAC</div>
        <div><strong>Maximum size:</strong> 100MB per file</div>
        <div><strong>Recommended:</strong> MP3 format for best compatibility</div>
      </div>
    </div>
  )
}

// =================================================================
// 🎯 AUDIO PREVIEW SUB-COMPONENT
// =================================================================

function AudioPreview({ 
  file, 
  audioUrl, 
  onRemove, 
  onPlay, 
  isPlaying 
}: AudioPreviewProps) {
  const audioFormat = file ? getAudioFormat(file.name) : ''
  const config = getAudioFormatConfig(audioFormat)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-4">
        <div className={config.color}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {file?.name}
          </div>
          <div className="text-sm text-gray-600">
            {config.label} • {file ? formatFileSize(file.size) : 'Unknown size'}
          </div>
          {audioUrl && (
            <div className="text-xs text-green-600 mt-1">
              ✓ Uploaded successfully
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {audioUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPlay}
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          
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
    </div>
  )
}

// =================================================================
// 🎯 CHAPTER MANAGER SUB-COMPONENT
// =================================================================

function ChapterManager({ 
  chapters, 
  onAdd, 
  onRemove, 
  onUpdate, 
  errors = [],
  audioDuration = 0
}: ChapterManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Audio Chapters (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Music className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No chapters added yet</p>
          <p className="text-xs">Add chapters to help students navigate long audio content</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Chapter {index + 1}</span>
                <div className="flex-1" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Chapter Title</Label>
                  <Input
                    value={chapter.title}
                    onChange={(e) => onUpdate(index, 'title', e.target.value)}
                    placeholder="e.g., Introduction"
                    className={errors[index]?.title ? 'border-red-500' : ''}
                  />
                  {errors[index]?.title && (
                    <p className="text-xs text-red-600">{errors[index].title.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Start Time (seconds)</Label>
                  <Input
                    type="number"
                    value={chapter.startTime}
                    onChange={(e) => onUpdate(index, 'startTime', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    max={audioDuration || undefined}
                    className={errors[index]?.startTime ? 'border-red-500' : ''}
                  />
                  {errors[index]?.startTime && (
                    <p className="text-xs text-red-600">{errors[index].startTime.message}</p>
                  )}
                  {audioDuration > 0 && (
                    <p className="text-xs text-gray-500">
                      Audio duration: {formatTime(audioDuration)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =================================================================
// 🎯 AUDIO BUILDER PREVIEW SUB-COMPONENT
// =================================================================

function AudioBuilderPreview({ 
  data, 
  audioUrl 
}: { 
  data: AudioFormData
  audioUrl?: string
}) {
  const formatConfig = data.audioFormat ? getAudioFormatConfig(data.audioFormat) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-600" />
          {data.title}
        </CardTitle>
        {data.description && (
          <CardDescription>{data.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {formatConfig && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={formatConfig.color}>
              {formatConfig.icon}
            </div>
            <div>
              <div className="font-medium">{data.fileName}</div>
              <div className="text-sm text-gray-600">
                {formatConfig.label} • {data.fileSize ? formatFileSize(data.fileSize) : 'Unknown size'}
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
            <span className="text-gray-600">Chapters:</span>
            <span className="ml-2 font-medium">{data.chapters.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Required:</span>
            <span className="ml-2 font-medium">{data.isRequired ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {data.chapters.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Chapters:</h4>
            <div className="space-y-1">
              {data.chapters.map((chapter, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {index + 1}. {chapter.title} - {formatTime(chapter.startTime)}
                </div>
              ))}
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">Audio ready for students</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =================================================================
// 🎯 MAIN AUDIO BUILDER COMPONENT
// =================================================================

export default function SessionAudioBuilder({
  sessionId,
  initialData,
  onSave,
  onCancel,
  className
}: SessionAudioBuilderProps) {
  
  // =================================================================
  // 🎯 FORM SETUP
  // =================================================================
  
  const form = useForm<AudioFormData>({
    resolver: zodResolver(audioFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      accessLevel: initialData?.accessLevel || 'FREE',
      duration: initialData?.duration || undefined,
      isRequired: initialData?.isRequired || false,
      isDownloadable: initialData?.audioData?.isDownloadable ?? true,
      playbackSpeed: initialData?.audioData?.playbackSpeed || [0.5, 0.75, 1, 1.25, 1.5, 2],
      chapters: initialData?.audioData?.chapters || [],
      fileName: initialData?.audioData?.fileName || '',
      fileSize: initialData?.audioData?.fileSize || 0,
      audioFormat: initialData?.audioData?.audioFormat || '',
      audioUrl: initialData?.audioData?.audioUrl || ''
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "chapters"
  })

  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadError: null,
    selectedFile: null,
    uploadedFileUrl: initialData?.audioData?.audioUrl || null,
    audioDuration: null,
    isPlaying: false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // =================================================================
  // 🎯 WATCH FORM VALUES
  // =================================================================
  
  const watchedTitle = form.watch('title')
  const watchedAudioUrl = form.watch('audioUrl')

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB')
      return
    }

    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      isUploading: true,
      uploadProgress: 0,
      uploadError: null
    }))

    try {
      // Get audio duration
      const duration = await getAudioDuration(file)
      
      // Upload file
      const audioUrl = await uploadAudioFile(file, (progress) => {
        setUploadState(prev => ({ ...prev, uploadProgress: progress }))
      })

      // Update form with file information
      form.setValue('fileName', file.name)
      form.setValue('fileSize', file.size)
      form.setValue('audioFormat', getAudioFormat(file.name))
      form.setValue('audioUrl', audioUrl)
      form.setValue('duration', Math.ceil(duration / 60)) // Convert to minutes

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFileUrl: audioUrl,
        audioDuration: duration,
        uploadError: null
      }))

      toast.success('Audio uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadError: 'Upload failed. Please try again.'
      }))
      toast.error('Upload failed. Please try again.')
    }
  }, [form])

  const handleFileRemove = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      selectedFile: null,
      uploadedFileUrl: null,
      audioDuration: null,
      uploadError: null
    }))

    // Clear form file data
    form.setValue('fileName', '')
    form.setValue('fileSize', 0)
    form.setValue('audioFormat', '')
    form.setValue('audioUrl', '')
    form.setValue('chapters', [])
  }, [form])

  const handleAddChapter = useCallback(() => {
    append({
      title: '',
      startTime: 0
    })
  }, [append])

  const handleRemoveChapter = useCallback((index: number) => {
    remove(index)
  }, [remove])

  const handleUpdateChapter = useCallback((index: number, field: string, value: string | number) => {
    update(index, { ...fields[index], [field]: value })
  }, [update, fields])

  const handleSave = useCallback(() => {
    const data = form.getValues()
    
    if (!data.audioUrl) {
      toast.error('Please upload an audio file first')
      return
    }

    setIsSaving(true)
    
    try {
      const audioContent: Partial<AudioContent> = {
        type: 'AUDIO',
        title: data.title,
        description: data.description,
        accessLevel: data.accessLevel,
        duration: data.duration,
        isRequired: data.isRequired,
        audioData: {
          audioUrl: data.audioUrl,
          fileName: data.fileName!,
          fileSize: data.fileSize!,
          audioFormat: data.audioFormat!,
          isDownloadable: data.isDownloadable,
          chapters: data.chapters,
          playbackSpeed: data.playbackSpeed
        }
      }

      onSave(audioContent)
      toast.success('Audio session content saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save audio content')
    } finally {
      setIsSaving(false)
    }
  }, [form, onSave])

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const isFormValid = useMemo(() => {
    return form.formState.isValid && !!watchedAudioUrl
  }, [form.formState.isValid, watchedAudioUrl])

  const canShowPreview = useMemo(() => {
    return watchedTitle && watchedAudioUrl
  }, [watchedTitle, watchedAudioUrl])

  // =================================================================
  // 🎯 MAIN RENDER
  // =================================================================
  
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-600" />
            Add Audio Content
          </CardTitle>
          <CardDescription>
            Upload audio files like podcasts, lectures, or music for students to listen and learn.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter audio title"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Listen Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Auto-detected"
                  {...form.register('duration', { valueAsNumber: true })}
                />
                {form.formState.errors.duration && (
                  <p className="text-xs text-red-600">{form.formState.errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn from this audio"
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Audio Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Audio Upload</h3>
            
            <AudioUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={uploadState.selectedFile}
              uploading={uploadState.isUploading}
              uploadProgress={uploadState.uploadProgress}
              error={uploadState.uploadError || undefined}
            />
          </div>

          <Separator />

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Audio Settings</h3>
            
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

          {/* Chapters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Chapters</h3>
            
            <ChapterManager
              chapters={fields}
              onAdd={handleAddChapter}
              onRemove={handleRemoveChapter}
              onUpdate={handleUpdateChapter}
              errors={form.formState.errors.chapters}
              audioDuration={uploadState.audioDuration || undefined}
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving || uploadState.isUploading}
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
                onClick={handleSave}
                disabled={!isFormValid || isSaving || uploadState.isUploading}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Audio Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && canShowPreview && (
        <AudioBuilderPreview 
          data={form.getValues()} 
          audioUrl={uploadState.uploadedFileUrl || undefined}
        />
      )}
    </div>
  )
}

// =================================================================
// 🎯 EXPORT - ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default + Named Exports + Types
export default SessionAudioBuilder
export { 
  AudioUpload, 
  AudioPreview, 
  ChapterManager,
  AudioBuilderPreview,
  formatFileSize,
  getAudioFormat,
  isAllowedAudioType,
  getAudioFormatConfig,
  formatTime,
  getAudioDuration,
  uploadAudioFile,
  audioFormSchema
}
export type { 
  SessionAudioBuilderProps,
  AudioUploadProps,
  AudioPreviewProps,
  ChapterManagerProps,
  UploadState,
  AudioFormData
}