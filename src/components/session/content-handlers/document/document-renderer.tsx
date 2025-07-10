// File: src/components/session/content-handlers/document/document-renderer.tsx

/**
 * =================================================================
 * 🎯 DOCUMENT CONTENT RENDERER - MOCK IMPLEMENTATION
 * =================================================================
 * Mock document renderer with PDF/Document placeholder
 * Will be replaced with real document viewer later
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 3B
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useState } from 'react';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';

// ✅ Icons
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  FileType,
  ZoomIn,
  ZoomOut,
  RotateCw,
  BookOpen,
  ExternalLink
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { ContentRendererProps } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface DocumentRendererProps extends ContentRendererProps {
  // Document-specific props bisa ditambah nanti
}

interface DocumentViewerState {
  isViewing: boolean;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isCompleted: boolean;
  readingProgress: number;
  timeSpent: number;
}

// =================================================================
// 🎯 MOCK DOCUMENT RENDERER COMPONENT
// =================================================================

function DocumentRenderer({ 
  content, 
  isActive, 
  onComplete, 
  onProgress 
}: DocumentRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [viewerState, setViewerState] = useState<DocumentViewerState>({
    isViewing: false,
    currentPage: 1,
    totalPages: 10, // Mock total pages
    zoom: 100,
    isCompleted: false,
    readingProgress: 0,
    timeSpent: 0
  });

  // Extract document data
  const documentData = content.documentData;
  const fileName = documentData?.fileName || `${content.title}.pdf`;
  const fileSize = documentData?.fileSize || 2048000; // 2MB default
  const isDownloadable = documentData?.isDownloadable ?? true;
  const pages = documentData?.pages || 10;

  // =================================================================
  // 🎯 MOCK VIEWER CONTROLS
  // =================================================================

  const handleOpenViewer = useCallback(() => {
    setViewerState(prev => ({ ...prev, isViewing: true }));
    
    // Start tracking reading time
    const startTime = Date.now();
    const interval = setInterval(() => {
      setViewerState(current => {
        const newTimeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        // Simulate reading progress based on time
        const progressPerMinute = 20; // 20% progress per minute
        const newProgress = Math.min((newTimeSpent / 60) * progressPerMinute, 100);
        
        // Report progress to parent
        onProgress?.(newProgress);
        
        // Auto-complete when reading for 3 minutes or reaching 100%
        if (newTimeSpent >= 180 || newProgress >= 100) {
          clearInterval(interval);
          onComplete?.();
          return {
            ...current,
            readingProgress: 100,
            timeSpent: newTimeSpent,
            isCompleted: true
          };
        }
        
        return {
          ...current,
          readingProgress: newProgress,
          timeSpent: newTimeSpent
        };
      });
    }, 1000);
    
    // Store interval ID for cleanup
    (window as any).documentInterval = interval;
  }, [onProgress, onComplete]);

  const handleCloseViewer = useCallback(() => {
    setViewerState(prev => ({ ...prev, isViewing: false }));
    
    if ((window as any).documentInterval) {
      clearInterval((window as any).documentInterval);
    }
  }, []);

  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    setViewerState(prev => {
      const newPage = direction === 'next' 
        ? Math.min(prev.currentPage + 1, prev.totalPages)
        : Math.max(prev.currentPage - 1, 1);
      
      // Update progress based on page
      const pageProgress = (newPage / prev.totalPages) * 100;
      onProgress?.(pageProgress);
      
      return {
        ...prev,
        currentPage: newPage,
        readingProgress: pageProgress
      };
    });
  }, [onProgress]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setViewerState(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(prev.zoom + 25, 200)
        : Math.max(prev.zoom - 25, 50)
    }));
  }, []);

  const handleDownload = useCallback(() => {
    // Simulate download
    console.log('Downloading document:', fileName);
    
    // Create mock download
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    link.click();
    
    // Show success message
    alert(`Mock download started: ${fileName}`);
  }, [fileName]);

  const handleManualComplete = useCallback(() => {
    if ((window as any).documentInterval) {
      clearInterval((window as any).documentInterval);
    }
    
    setViewerState(prev => ({
      ...prev,
      readingProgress: 100,
      isCompleted: true
    }));
    
    onProgress?.(100);
    onComplete?.();
  }, [onProgress, onComplete]);

  // =================================================================
  // 🎯 UTILITY FUNCTIONS
  // =================================================================

  const formatFileSize = useCallback((bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  if (viewerState.isViewing) {
    // Document Viewer Mode
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {fileName}
              </CardTitle>
              <Button onClick={handleCloseViewer} variant="outline" size="sm">
                Close Viewer
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Document Viewer Mockup */}
            <div className="border rounded-lg bg-gray-50 min-h-[500px] relative">
              {/* Viewer Controls */}
              <div className="flex items-center justify-between p-3 border-b bg-white">
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handlePageChange('prev')} 
                    variant="outline" 
                    size="sm"
                    disabled={viewerState.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {viewerState.currentPage} of {viewerState.totalPages}
                  </span>
                  <Button 
                    onClick={() => handlePageChange('next')} 
                    variant="outline" 
                    size="sm"
                    disabled={viewerState.currentPage === viewerState.totalPages}
                  >
                    Next
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleZoom('out')} variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{viewerState.zoom}%</span>
                  <Button onClick={() => handleZoom('in')} variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Document Content Area */}
              <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div 
                  className="bg-white shadow-lg rounded border max-w-2xl w-full"
                  style={{ 
                    transform: `scale(${viewerState.zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                >
                  <div className="p-8 space-y-4">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">
                        Mock Document Content
                      </h1>
                      <p className="text-lg">Page {viewerState.currentPage}</p>
                    </div>
                    
                    <div className="space-y-3 text-gray-700">
                      <p>
                        This is a mock document viewer showing page {viewerState.currentPage} 
                        of {viewerState.totalPages}. In a real implementation, this would 
                        display the actual PDF or document content.
                      </p>
                      
                      <p>
                        The document viewer supports navigation, zooming, and progress tracking. 
                        Reading progress is automatically calculated based on page views and time spent.
                      </p>
                      
                      <p>
                        Document: <strong>{fileName}</strong><br />
                        Size: <strong>{formatFileSize(fileSize)}</strong><br />
                        Progress: <strong>{Math.round(viewerState.readingProgress)}%</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reading Progress */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Reading Progress</span>
                <span>{Math.round(viewerState.readingProgress)}%</span>
              </div>
              <Progress value={viewerState.readingProgress} />
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Time spent: {formatTime(viewerState.timeSpent)}
              </div>
              
              {!viewerState.isCompleted && (
                <Button onClick={handleManualComplete} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Document Preview Mode
  return (
    <div className="space-y-4">
      {/* Document Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {content.title}
              </CardTitle>
              <CardDescription>
                {content.description || 'Document content'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {formatFileSize(fileSize)}
              </Badge>
              {content.isFree && (
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Document Preview */}
          <div className="border rounded-lg p-6 bg-gray-50 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <FileType className="h-12 w-12 text-blue-600 mx-auto" />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">{fileName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {pages} pages • {formatFileSize(fileSize)}
                </p>
              </div>
              
              <div className="flex justify-center gap-2">
                <Button onClick={handleOpenViewer} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Open Document
                </Button>
                
                {isDownloadable && (
                  <Button onClick={handleDownload} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Document Info */}
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{pages} pages to read</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>~{Math.ceil(pages / 2)} min read time</span>
            </div>
          </div>
          
          {/* Download Status */}
          {isDownloadable ? (
            <Alert className="mt-4">
              <Download className="h-4 w-4" />
              <AlertDescription>
                This document can be downloaded for offline reading.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mt-4">
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                This document is view-only and cannot be downloaded.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Completion Status */}
      {viewerState.isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Document Completed!</p>
                <p className="text-sm text-green-600">
                  You've successfully read this document.
                </p>
              </div>
            </div>
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
export default DocumentRenderer;

// ✅ PATTERN: Named exports untuk utilities
export {
  formatFileSize,
  formatTime
};

// ✅ PATTERN: Type exports
export type {
  DocumentRendererProps,
  DocumentViewerState
};