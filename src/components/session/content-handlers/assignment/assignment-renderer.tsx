// File: src/components/session/content-handlers/assignment/assignment-renderer.tsx

/**
 * =================================================================
 * 🎯 ASSIGNMENT CONTENT RENDERER - MOCK IMPLEMENTATION
 * =================================================================
 * Assignment renderer with task display and submission interface
 * Perfect for language learning homework and projects
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 3E (Final)
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useState, useRef } from 'react';

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
  AlertDescription,
  Label,
  Textarea,
  Input
} from '@/components/ui';

// ✅ Icons
import {
  FileText,
  Upload,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Star,
  Send,
  Trash2,
  Eye,
  FileCheck
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { ContentRendererProps } from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface AssignmentRendererProps extends ContentRendererProps {
  // Assignment-specific props bisa ditambah nanti
}

interface SubmissionState {
  hasSubmitted: boolean;
  submissionFile: File | null;
  submissionDescription: string;
  submittedAt: Date | null;
  isGraded: boolean;
  grade: number | null;
  feedback: string | null;
  attempts: number;
}

interface AssignmentStatus {
  isOverdue: boolean;
  timeUntilDeadline: number; // seconds
  canSubmit: boolean;
  daysUntilDeadline: number;
}

// =================================================================
// 🎯 MOCK ASSIGNMENT RENDERER COMPONENT
// =================================================================

function AssignmentRenderer({ 
  content, 
  isActive, 
  onComplete, 
  onProgress 
}: AssignmentRendererProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    hasSubmitted: false,
    submissionFile: null,
    submissionDescription: '',
    submittedAt: null,
    isGraded: false,
    grade: null,
    feedback: null,
    attempts: 0
  });

  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>({
    isOverdue: false,
    timeUntilDeadline: 7 * 24 * 60 * 60, // 7 days in seconds
    canSubmit: true,
    daysUntilDeadline: 7
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract assignment data
  const assignmentData = content.assignmentData;
  const instructions = assignmentData?.instructions || '';
  const deadline = assignmentData?.deadline;
  const allowedFileTypes = assignmentData?.allowedFileTypes || ['.pdf', '.doc', '.docx'];
  const maxFileSize = assignmentData?.maxFileSize || 5242880; // 5MB
  const maxSubmissions = assignmentData?.maxSubmissions || 3;
  const gradingCriteria = assignmentData?.gradingCriteria || '';
  const taskFileUrl = assignmentData?.taskFileUrl;

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      alert(`File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      alert(`File too large. Maximum size: ${formatFileSize(maxFileSize)}`);
      return;
    }

    setSubmissionState(prev => ({ ...prev, submissionFile: file }));
  }, [allowedFileTypes, maxFileSize]);

  const handleSubmitAssignment = useCallback(() => {
    if (!submissionState.submissionFile) {
      alert('Please select a file to submit');
      return;
    }

    if (submissionState.attempts >= maxSubmissions) {
      alert('Maximum submissions reached');
      return;
    }

    // Simulate submission
    setSubmissionState(prev => ({
      ...prev,
      hasSubmitted: true,
      submittedAt: new Date(),
      attempts: prev.attempts + 1
    }));

    // Report progress
    onProgress?.(75); // 75% for submission

    console.log('Assignment submitted:', {
      file: submissionState.submissionFile.name,
      description: submissionState.submissionDescription
    });

    // Simulate automatic grading after delay
    setTimeout(() => {
      const mockGrade = Math.floor(Math.random() * 30) + 70; // 70-100
      const mockFeedback = mockGrade >= 85 
        ? "Excellent work! Your writing shows great improvement in grammar and vocabulary usage."
        : mockGrade >= 75
        ? "Good effort! Pay attention to sentence structure and try to use more varied vocabulary."
        : "Keep practicing! Focus on basic grammar rules and expand your vocabulary.";

      setSubmissionState(prev => ({
        ...prev,
        isGraded: true,
        grade: mockGrade,
        feedback: mockFeedback
      }));

      onProgress?.(100);
      onComplete?.();
    }, 2000);
  }, [submissionState.submissionFile, submissionState.submissionDescription, submissionState.attempts, maxSubmissions, onProgress, onComplete]);

  const handleDownloadTask = useCallback(() => {
    // Simulate task file download
    console.log('Downloading task file:', taskFileUrl);
    alert('Mock download: Task file downloaded');
  }, [taskFileUrl]);

  const handleRemoveFile = useCallback(() => {
    setSubmissionState(prev => ({ ...prev, submissionFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleResubmit = useCallback(() => {
    if (submissionState.attempts >= maxSubmissions) {
      alert('Maximum submissions reached');
      return;
    }

    setSubmissionState(prev => ({
      ...prev,
      hasSubmitted: false,
      submissionFile: null,
      submissionDescription: '',
      submittedAt: null,
      isGraded: false,
      grade: null,
      feedback: null
    }));
  }, [submissionState.attempts, maxSubmissions]);

  // =================================================================
  // 🎯 UTILITY FUNCTIONS
  // =================================================================

  const formatFileSize = useCallback((bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const formatDeadline = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const getGradeColor = useCallback((grade: number): string => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getGradeLabel = useCallback((grade: number): string => {
    if (grade >= 90) return 'Excellent';
    if (grade >= 80) return 'Good';
    if (grade >= 70) return 'Satisfactory';
    return 'Needs Improvement';
  }, []);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className="space-y-4">
      {/* Assignment Card */}
      <Card className={cn(
        "transition-all duration-200",
        isActive && "ring-2 ring-primary ring-offset-2"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-orange-600" />
                {content.title}
              </CardTitle>
              <CardDescription>
                {content.description || 'Assignment submission'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Assignment
              </Badge>
              {content.isFree && (
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              )}
              {submissionState.isGraded && (
                <Badge variant="outline" className={cn("text-xs", getGradeColor(submissionState.grade!))}>
                  {submissionState.grade}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Assignment Instructions */}
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Instructions
              </h4>
              <p className="text-orange-800 text-sm leading-relaxed">
                {instructions || 'Complete the assignment according to the provided guidelines.'}
              </p>
            </div>
            
            {/* Assignment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deadline && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDeadline(deadline)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignmentStatus.daysUntilDeadline} days remaining
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">File Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    Max {formatFileSize(maxFileSize)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {allowedFileTypes.join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Submissions</p>
                  <p className="text-sm text-muted-foreground">
                    {submissionState.attempts} of {maxSubmissions} used
                  </p>
                </div>
              </div>
              
              {gradingCriteria && (
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Grading Criteria</p>
                    <p className="text-sm text-muted-foreground">
                      {gradingCriteria}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Task File Download */}
            {taskFileUrl && (
              <>
                <Separator />
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Assignment Template</p>
                      <p className="text-xs text-muted-foreground">
                        Download the task file to get started
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleDownloadTask} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Submission Interface */}
      {!submissionState.hasSubmitted && assignmentStatus.canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Assignment
            </CardTitle>
            <CardDescription>
              Upload your completed assignment file
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="assignment-file">Assignment File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="assignment-file"
                  type="file"
                  accept={allowedFileTypes.join(',')}
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {submissionState.submissionFile && (
                  <Button onClick={handleRemoveFile} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {submissionState.submissionFile && (
                <p className="text-sm text-green-600">
                  Selected: {submissionState.submissionFile.name} 
                  ({formatFileSize(submissionState.submissionFile.size)})
                </p>
              )}
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="submission-description">
                Description (Optional)
              </Label>
              <Textarea
                id="submission-description"
                placeholder="Add any notes or comments about your submission..."
                value={submissionState.submissionDescription}
                onChange={(e) => setSubmissionState(prev => ({ 
                  ...prev, 
                  submissionDescription: e.target.value 
                }))}
                rows={3}
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-muted-foreground">
                {maxSubmissions - submissionState.attempts} attempts remaining
              </div>
              
              <Button 
                onClick={handleSubmitAssignment}
                disabled={!submissionState.submissionFile}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Submission Status */}
      {submissionState.hasSubmitted && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Assignment Submitted
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-green-700">
                Your assignment has been submitted successfully!
              </p>
              {submissionState.submittedAt && (
                <p className="text-sm text-green-600">
                  Submitted on: {submissionState.submittedAt.toLocaleString()}
                </p>
              )}
            </div>
            
            {/* Grading Status */}
            {submissionState.isGraded ? (
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Grading Results</h4>
                  <div className="text-right">
                    <div className={cn("text-2xl font-bold", getGradeColor(submissionState.grade!))}>
                      {submissionState.grade}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getGradeLabel(submissionState.grade!)}
                    </div>
                  </div>
                </div>
                
                {submissionState.feedback && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Instructor Feedback:</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {submissionState.feedback}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your assignment is being reviewed. You will receive feedback soon.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Resubmit Option */}
            {submissionState.attempts < maxSubmissions && (
              <div className="flex justify-end">
                <Button onClick={handleResubmit} variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit New Version
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Deadline Warning */}
      {assignmentStatus.isOverdue && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This assignment is overdue. Late submissions may not be accepted.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default AssignmentRenderer;

// ✅ PATTERN: Named exports untuk utilities
export {
  formatFileSize,
  formatDeadline,
  getGradeColor,
  getGradeLabel
};

// ✅ PATTERN: Type exports
export type {
  AssignmentRendererProps,
  SubmissionState,
  AssignmentStatus
};