// File: src/components/session/content-handlers/document/document-renderer.tsx

/**
 * =================================================================
 * 📄 DOCUMENT RENDERER COMPONENT
 * =================================================================
 * PDF/Document viewer content renderer untuk student interface
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

// =================================================================
// 🎯 UI COMPONENTS - ✅ FIXED: Barrel imports dari index.ts
// =================================================================
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton
} from '@/components/ui';

// =================================================================
// 🎯 ICONS - Grouped import
// =================================================================
import {
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Maximize,
  Minimize,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// =================================================================
// 🎯 EXTERNAL LIBRARIES
// =================================================================
import { toast } from 'sonner';

// =================================================================
// 🎯 LOCAL UTILITIES - Session types
// =================================================================
import type {
  DocumentContent,
  ContentType
} from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface DocumentRendererProps {
  content: DocumentContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
  className?: string;
}

interface DocumentViewerState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isFullscreen: boolean;
  zoomLevel: number;
  currentPage: number;
  totalPages: number;
  viewProgress: number;
  downloadProgress: number;
  isDownloading: boolean;
  hasStartedViewing: boolean;
  viewStartTime: Date | null;
  totalViewTime: number;
}

interface DocumentControlsProps {
  state: DocumentViewerState;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  onDownload: () => void;
  onRefresh: () => void;
  isDownloadAllowed: boolean;
}

interface DocumentStatsProps {
  content: DocumentContent;
  state: DocumentViewerState;
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
 * Format viewing time
 */
function formatViewTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

/**
 * Get file extension from URL or filename
 */
function getFileExtension(url: string): string {
  return url.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file type is supported for inline viewing
 */
function isSupportedForViewing(fileType: string): boolean {
  const supportedTypes = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'];
  return supportedTypes.includes(fileType.toLowerCase());
}

/**
 * Generate document embed URL based on file type
 */
function generateEmbedUrl(fileUrl: string, fileType: string): string | null {
  const lowerType = fileType.toLowerCase();
  
  if (lowerType === 'pdf') {
    // Use browser's built-in PDF viewer
    return fileUrl;
  }
  
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(lowerType)) {
    // Use Google Docs Viewer for Office documents
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }
  
  return null;
}

// =================================================================
// 🎯 DOCUMENT VIEWER SUB-COMPONENT
// =================================================================

function DocumentViewer({ 
  content, 
  state, 
  onStateChange 
}: { 
  content: DocumentContent;
  state: DocumentViewerState;
  onStateChange: (newState: Partial<DocumentViewerState>) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const embedUrl = useMemo(() => {
    return generateEmbedUrl(content.documentData.fileUrl, content.documentData.fileType);
  }, [content.documentData.fileUrl, content.documentData.fileType]);

  const handleLoad = useCallback(() => {
    onStateChange({ 
      isLoading: false,
      hasStartedViewing: true,
      viewStartTime: new Date()
    });
  }, [onStateChange]);

  const handleError = useCallback(() => {
    onStateChange({ 
      isLoading: false,
      isError: true,
      errorMessage: 'Failed to load document'
    });
  }, [onStateChange]);

  // Track scroll progress for embedded documents
  useEffect(() => {
    if (!viewerRef.current || state.isError) return;

    const handleScroll = () => {
      const element = viewerRef.current;
      if (!element) return;

      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      
      if (scrollHeight > 0) {
        const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
        onStateChange({ viewProgress: progress });
      }
    };

    const element = viewerRef.current;
    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [onStateChange, state.isError]);

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
        <p className="text-gray-600 text-center mb-4">
          This file type cannot be previewed inline.<br />
          Please download to view the document.
        </p>
        <Badge variant="secondary" className="mb-4">
          {content.documentData.fileType.toUpperCase()} File
        </Badge>
      </div>
    );
  }

  return (
    <div 
      ref={viewerRef}
      className={`relative w-full bg-gray-900 rounded-lg overflow-hidden ${
        state.isFullscreen ? 'fixed inset-0 z-50' : 'h-96'
      }`}
      style={{
        transform: `scale(${state.zoomLevel})`,
        transformOrigin: 'top left'
      }}
    >
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading document...</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={content.title}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
}

// =================================================================
// 🎯 DOCUMENT CONTROLS SUB-COMPONENT
// =================================================================

function DocumentControls({
  state,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onDownload,
  onRefresh,
  isDownloadAllowed
}: DocumentControlsProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={state.zoomLevel <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <span className="text-sm text-gray-600 min-w-16 text-center">
          {Math.round(state.zoomLevel * 100)}%
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={state.zoomLevel >= 2.0}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onResetZoom}
          disabled={state.zoomLevel === 1.0}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>

      {/* View Progress */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Eye className="w-4 h-4" />
        <span>{Math.round(state.viewProgress)}% viewed</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={state.isLoading}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
        >
          {state.isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>
        
        {isDownloadAllowed && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={state.isDownloading}
          >
            {state.isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(content.documentData.fileUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 DOCUMENT STATS SUB-COMPONENT
// =================================================================

function DocumentStats({ content, state }: DocumentStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-sm text-gray-500">File Size</div>
        <div className="font-medium">
          {formatFileSize(content.documentData.fileSize)}
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500">File Type</div>
        <div className="font-medium">
          {content.documentData.fileType.toUpperCase()}
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500">Progress</div>
        <div className="font-medium">
          {Math.round(state.viewProgress)}%
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500">View Time</div>
        <div className="font-medium">
          {formatViewTime(state.totalViewTime)}
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 ERROR STATE SUB-COMPONENT
// =================================================================

function DocumentError({ 
  message, 
  onRetry, 
  onDownload,
  isDownloadAllowed 
}: { 
  message: string; 
  onRetry: () => void;
  onDownload: () => void;
  isDownloadAllowed: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Document Unavailable
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}
      </p>
      <div className="flex gap-2">
        <Button onClick={onRetry} variant="outline">
          <RotateCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        {isDownloadAllowed && (
          <Button onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        )}
      </div>
    </div>
  );
}

// =================================================================
// 🎯 LOADING STATE SUB-COMPONENT
// =================================================================

function DocumentLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-96 rounded-lg" />
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-8 h-8" />
        </div>
        <Skeleton className="w-20 h-4" />
        <div className="flex gap-1">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 MAIN DOCUMENT RENDERER COMPONENT
// =================================================================

export default function DocumentRenderer({
  content,
  onProgress,
  onComplete,
  onError,
  readOnly = false,
  className = ''
}: DocumentRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [state, setState] = useState<DocumentViewerState>({
    isLoading: true,
    isError: false,
    errorMessage: null,
    isFullscreen: false,
    zoomLevel: 1.0,
    currentPage: 1,
    totalPages: 1,
    viewProgress: 0,
    downloadProgress: 0,
    isDownloading: false,
    hasStartedViewing: false,
    viewStartTime: null,
    totalViewTime: 0
  });

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================
  
  const isDownloadAllowed = useMemo(() => {
    return content.documentData.isDownloadable && !readOnly;
  }, [content.documentData.isDownloadable, readOnly]);

  const isSupported = useMemo(() => {
    return isSupportedForViewing(content.documentData.fileType);
  }, [content.documentData.fileType]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================
  
  const handleStateChange = useCallback((newState: Partial<DocumentViewerState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const handleZoomIn = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      zoomLevel: Math.min(prev.zoomLevel + 0.25, 2.0) 
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      zoomLevel: Math.max(prev.zoomLevel - 0.25, 0.5) 
    }));
  }, []);

  const handleResetZoom = useCallback(() => {
    setState(prev => ({ ...prev, zoomLevel: 1.0 }));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const handleDownload = useCallback(async () => {
    if (!isDownloadAllowed) return;

    setState(prev => ({ ...prev, isDownloading: true, downloadProgress: 0 }));

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = content.documentData.fileUrl;
      link.download = content.documentData.fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
      onError?.('Failed to download document');
    } finally {
      setState(prev => ({ ...prev, isDownloading: false }));
    }
  }, [content.documentData.fileUrl, content.documentData.fileName, isDownloadAllowed, onError]);

  const handleRefresh = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      isError: false, 
      errorMessage: null 
    }));
  }, []);

  const handleRetry = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Track view time
  useEffect(() => {
    if (!state.hasStartedViewing || !state.viewStartTime) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        totalViewTime: Math.floor((Date.now() - (prev.viewStartTime?.getTime() || 0)) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.hasStartedViewing, state.viewStartTime]);

  // Report progress
  useEffect(() => {
    onProgress?.(state.viewProgress);
    
    if (state.viewProgress >= 90 && state.hasStartedViewing) {
      onComplete?.();
    }
  }, [state.viewProgress, state.hasStartedViewing, onProgress, onComplete]);

  // Handle fullscreen ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isFullscreen) {
        setState(prev => ({ ...prev, isFullscreen: false }));
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [state.isFullscreen]);

  // =================================================================
  // 🎯 ERROR HANDLING
  // =================================================================
  
  if (state.isError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <DocumentError
            message={state.errorMessage || 'Failed to load document'}
            onRetry={handleRetry}
            onDownload={handleDownload}
            isDownloadAllowed={isDownloadAllowed}
          />
        </CardContent>
      </Card>
    );
  }

  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {content.title}
        </CardTitle>
        {content.description && (
          <CardDescription>{content.description}</CardDescription>
        )}
        
        {/* Document metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{content.documentData.fileName}</span>
          <span>•</span>
          <span>{formatFileSize(content.documentData.fileSize)}</span>
          <span>•</span>
          <Badge variant="secondary">
            {content.documentData.fileType.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Unsupported file type warning */}
        {!isSupported && (
          <div className="p-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This file type may not display correctly in the browser. 
                For best experience, download the file to view it.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Progress indicator */}
        {state.hasStartedViewing && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Reading Progress</span>
              <span className="font-medium">{Math.round(state.viewProgress)}%</span>
            </div>
            <Progress value={state.viewProgress} className="h-2" />
          </div>
        )}

        {/* Document viewer */}
        <div className="relative">
          {state.isLoading ? (
            <div className="p-4">
              <DocumentLoading />
            </div>
          ) : (
            <>
              <DocumentViewer
                content={content}
                state={state}
                onStateChange={handleStateChange}
              />
              
              <DocumentControls
                state={state}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onToggleFullscreen={handleToggleFullscreen}
                onDownload={handleDownload}
                onRefresh={handleRefresh}
                isDownloadAllowed={isDownloadAllowed}
              />
            </>
          )}
        </div>

        {/* Document statistics */}
        {state.hasStartedViewing && (
          <div className="p-4 border-t">
            <DocumentStats content={content} state={state} />
          </div>
        )}

        {/* Completion status */}
        {state.viewProgress >= 90 && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Document Completed!</div>
                <div className="text-sm text-green-700">
                  Viewed in {formatViewTime(state.totalViewTime)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default DocumentRenderer;

// ✅ PATTERN: Named exports untuk sub-components
export { 
  DocumentViewer, 
  DocumentControls, 
  DocumentStats,
  DocumentError,
  DocumentLoading
};

// ✅ PATTERN: Named exports untuk utilities
export {
  formatFileSize,
  formatViewTime,
  getFileExtension,
  isSupportedForViewing,
  generateEmbedUrl
};

// ✅ PATTERN: Named exports untuk types
export type { 
  DocumentRendererProps,
  DocumentViewerState,
  DocumentControlsProps,
  DocumentStatsProps
};

// ✅ PATTERN: Display name untuk debugging
DocumentRenderer.displayName = 'DocumentRenderer';