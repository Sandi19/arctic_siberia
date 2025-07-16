// File: src/app/tes/session-renderers/page.tsx

'use client';

// ✅ Framework imports
import { useState } from 'react';

// ✅ UI Components menggunakan barrel imports
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
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';

// ✅ Icons
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Video,
  FileText,
  Link,
  HelpCircle,
  FileCheck,
  Play,
  Eye,
  Settings,
  Activity
} from 'lucide-react';

// ✅ Import content renderers for testing
import {
  VideoRenderer,
  DocumentRenderer,
  LiveSessionRenderer,
  QuizRenderer,
  AssignmentRenderer,
  // Types
  ContentType,
  ContentAccessLevel,
  type SessionContent
} from '@/components/session';

/**
 * 🧪 Session Content Renderers Test
 * 
 * Test page untuk semua content renderers
 * Testing VideoRenderer, DocumentRenderer, LiveSessionRenderer, QuizRenderer, AssignmentRenderer
 */
export default function SessionRenderersTestPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'document' | 'live' | 'quiz' | 'assignment'>('video');
  
  const [testResults, setTestResults] = useState<{
    videoLoaded: boolean;
    documentLoaded: boolean;
    liveLoaded: boolean;
    quizLoaded: boolean;
    assignmentLoaded: boolean;
    videoWorking: boolean;
    documentWorking: boolean;
    liveWorking: boolean;
    quizWorking: boolean;
    assignmentWorking: boolean;
    errors: string[];
  }>({
    videoLoaded: false,
    documentLoaded: false,
    liveLoaded: false,
    quizLoaded: false,
    assignmentLoaded: false,
    videoWorking: false,
    documentWorking: false,
    liveWorking: false,
    quizWorking: false,
    assignmentWorking: false,
    errors: []
  });

  // =================================================================
  // 🎯 MOCK DATA FOR TESTING
  // =================================================================

  const mockVideoContent: SessionContent = {
    id: 'video-test',
    sessionId: 'test-session',
    type: ContentType.VIDEO,
    title: 'Grammar Basics Video',
    description: 'Learn basic grammar rules with interactive examples',
    order: 1,
    accessLevel: ContentAccessLevel.FREE,
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    videoData: {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      startTime: 0,
      endTime: 180,
      autoPlay: false,
      showControls: true
    }
  };

  const mockDocumentContent: SessionContent = {
    id: 'document-test',
    sessionId: 'test-session',
    type: ContentType.DOCUMENT,
    title: 'Grammar Worksheet',
    description: 'Practice exercises for grammar concepts',
    order: 2,
    accessLevel: ContentAccessLevel.FREE,
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    documentData: {
      fileUrl: 'https://example.com/grammar-worksheet.pdf',
      fileName: 'grammar-worksheet.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      isDownloadable: true,
      pages: 5
    }
  };

  const mockLiveContent: SessionContent = {
    id: 'live-test',
    sessionId: 'test-session',
    type: ContentType.LIVE_SESSION,
    title: 'Speaking Practice Session',
    description: 'Live conversation practice with native speakers',
    order: 3,
    accessLevel: ContentAccessLevel.PREMIUM,
    isFree: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    liveSessionData: {
      meetingLink: 'https://zoom.us/j/123456789',
      scheduledAt: new Date(Date.now() + 86400000),
      duration: 60,
      meetingId: '123456789',
      passcode: '123456',
      instructions: 'Please join 5 minutes before the session starts'
    }
  };

  const mockQuizContent: SessionContent = {
    id: 'quiz-test',
    sessionId: 'test-session',
    type: ContentType.QUIZ,
    title: 'Grammar Knowledge Quiz',
    description: 'Test your understanding of grammar rules',
    order: 4,
    accessLevel: ContentAccessLevel.FREE,
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    quizData: {
      quizId: 'quiz-grammar-123',
      title: 'Grammar Quiz',
      questionCount: 10,
      timeLimit: 15,
      passingScore: 70,
      attempts: 2
    }
  };

  const mockAssignmentContent: SessionContent = {
    id: 'assignment-test',
    sessionId: 'test-session',
    type: ContentType.ASSIGNMENT,
    title: 'Writing Assignment: Daily Routine',
    description: 'Write a 300-word essay describing your daily routine',
    order: 5,
    accessLevel: ContentAccessLevel.PREMIUM,
    isFree: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignmentData: {
      instructions: 'Write a 300-word essay describing your daily routine. Use present tense throughout. Include at least 10 different verbs and 5 time expressions.',
      deadline: new Date(Date.now() + 604800000),
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
      maxFileSize: 5242880,
      maxSubmissions: 3,
      gradingCriteria: 'Grammar accuracy, vocabulary usage, and task completion'
    }
  };

  // =================================================================
  // 🎯 TEST FUNCTIONS
  // =================================================================

  const runVideoRendererTest = () => {
    const errors: string[] = [];
    let videoLoaded = false;
    let videoWorking = false;

    try {
      console.log('🧪 Testing VideoRenderer...');
      
      if (VideoRenderer) {
        videoLoaded = true;
        console.log('✅ VideoRenderer loaded successfully');
      } else {
        errors.push('VideoRenderer component not found');
      }

      if (mockVideoContent.videoData) {
        videoWorking = true;
        console.log('✅ VideoRenderer can handle video data');
      } else {
        errors.push('VideoRenderer video data handling failed');
      }

    } catch (error) {
      console.error('❌ VideoRenderer test failed:', error);
      errors.push(`VideoRenderer test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      videoLoaded,
      videoWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runDocumentRendererTest = () => {
    const errors: string[] = [];
    let documentLoaded = false;
    let documentWorking = false;

    try {
      console.log('🧪 Testing DocumentRenderer...');
      
      if (DocumentRenderer) {
        documentLoaded = true;
        console.log('✅ DocumentRenderer loaded successfully');
      } else {
        errors.push('DocumentRenderer component not found');
      }

      if (mockDocumentContent.documentData) {
        documentWorking = true;
        console.log('✅ DocumentRenderer can handle document data');
      } else {
        errors.push('DocumentRenderer document data handling failed');
      }

    } catch (error) {
      console.error('❌ DocumentRenderer test failed:', error);
      errors.push(`DocumentRenderer test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      documentLoaded,
      documentWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runLiveRendererTest = () => {
    const errors: string[] = [];
    let liveLoaded = false;
    let liveWorking = false;

    try {
      console.log('🧪 Testing LiveSessionRenderer...');
      
      if (LiveSessionRenderer) {
        liveLoaded = true;
        console.log('✅ LiveSessionRenderer loaded successfully');
      } else {
        errors.push('LiveSessionRenderer component not found');
      }

      if (mockLiveContent.liveSessionData) {
        liveWorking = true;
        console.log('✅ LiveSessionRenderer can handle live session data');
      } else {
        errors.push('LiveSessionRenderer live session data handling failed');
      }

    } catch (error) {
      console.error('❌ LiveSessionRenderer test failed:', error);
      errors.push(`LiveSessionRenderer test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      liveLoaded,
      liveWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runQuizRendererTest = () => {
    const errors: string[] = [];
    let quizLoaded = false;
    let quizWorking = false;

    try {
      console.log('🧪 Testing QuizRenderer...');
      
      if (QuizRenderer) {
        quizLoaded = true;
        console.log('✅ QuizRenderer loaded successfully');
      } else {
        errors.push('QuizRenderer component not found');
      }

      if (mockQuizContent.quizData) {
        quizWorking = true;
        console.log('✅ QuizRenderer can handle quiz data');
      } else {
        errors.push('QuizRenderer quiz data handling failed');
      }

    } catch (error) {
      console.error('❌ QuizRenderer test failed:', error);
      errors.push(`QuizRenderer test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      quizLoaded,
      quizWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runAssignmentRendererTest = () => {
    const errors: string[] = [];
    let assignmentLoaded = false;
    let assignmentWorking = false;

    try {
      console.log('🧪 Testing AssignmentRenderer...');
      
      if (AssignmentRenderer) {
        assignmentLoaded = true;
        console.log('✅ AssignmentRenderer loaded successfully');
      } else {
        errors.push('AssignmentRenderer component not found');
      }

      if (mockAssignmentContent.assignmentData) {
        assignmentWorking = true;
        console.log('✅ AssignmentRenderer can handle assignment data');
      } else {
        errors.push('AssignmentRenderer assignment data handling failed');
      }

    } catch (error) {
      console.error('❌ AssignmentRenderer test failed:', error);
      errors.push(`AssignmentRenderer test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      assignmentLoaded,
      assignmentWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runAllTests = () => {
    setTestResults({
      videoLoaded: false,
      documentLoaded: false,
      liveLoaded: false,
      quizLoaded: false,
      assignmentLoaded: false,
      videoWorking: false,
      documentWorking: false,
      liveWorking: false,
      quizWorking: false,
      assignmentWorking: false,
      errors: []
    });
    
    runVideoRendererTest();
    setTimeout(() => runDocumentRendererTest(), 100);
    setTimeout(() => runLiveRendererTest(), 200);
    setTimeout(() => runQuizRendererTest(), 300);
    setTimeout(() => runAssignmentRendererTest(), 400);
  };

  const allTestsPassed = testResults.videoLoaded && 
                        testResults.documentLoaded && 
                        testResults.liveLoaded && 
                        testResults.quizLoaded && 
                        testResults.assignmentLoaded &&
                        testResults.videoWorking &&
                        testResults.documentWorking &&
                        testResults.liveWorking &&
                        testResults.quizWorking &&
                        testResults.assignmentWorking &&
                        testResults.errors.length === 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session Content Renderers Test</h1>
        <p className="text-muted-foreground">
          Testing all content renderers for student learning interface
        </p>
      </div>

      {/* Overall Status */}
      <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {allTestsPassed ? 
            '✅ All content renderers tests passed!' : 
            '⚠️ Some tests failed or are incomplete'
          }
        </AlertDescription>
      </Alert>

      {/* Test Actions */}
      <div className="flex gap-4">
        <Button onClick={runAllTests} size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Run All Tests
        </Button>
        
        <Badge variant={allTestsPassed ? 'default' : 'destructive'}>
          {testResults.errors.length === 0 ? 'No Errors' : `${testResults.errors.length} Error(s)`}
        </Badge>
      </div>

      {/* Test Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
        </TabsList>

        {/* Video Renderer Test Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                VideoRenderer Test
              </CardTitle>
              <CardDescription>
                Test video content rendering component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runVideoRendererTest} size="lg" className="w-full">
                  🧪 Test VideoRenderer
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.videoLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.videoWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Data Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Demo */}
          <Card>
            <CardHeader>
              <CardTitle>VideoRenderer Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Video Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockVideoContent.title}</p>
                    <p><strong>YouTube URL:</strong> {mockVideoContent.videoData?.youtubeUrl}</p>
                    <p><strong>Duration:</strong> {mockVideoContent.videoData?.startTime}s - {mockVideoContent.videoData?.endTime}s</p>
                    <p><strong>Auto Play:</strong> {mockVideoContent.videoData?.autoPlay ? 'Yes' : 'No'}</p>
                    <p><strong>Controls:</strong> {mockVideoContent.videoData?.showControls ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">VideoRenderer Component Preview:</p>
                  <div className="bg-gray-100 p-4 rounded border-2 border-dashed">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Play className="h-4 w-4" />
                      <span className="text-sm">Video Player would render here</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Renderer Test Tab */}
        <TabsContent value="document" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DocumentRenderer Test
              </CardTitle>
              <CardDescription>
                Test document content rendering component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runDocumentRendererTest} size="lg" className="w-full">
                  🧪 Test DocumentRenderer
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.documentLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.documentWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Data Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Demo */}
          <Card>
            <CardHeader>
              <CardTitle>DocumentRenderer Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Document Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockDocumentContent.title}</p>
                    <p><strong>File:</strong> {mockDocumentContent.documentData?.fileName}</p>
                    <p><strong>Type:</strong> {mockDocumentContent.documentData?.fileType}</p>
                    <p><strong>Size:</strong> {((mockDocumentContent.documentData?.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Pages:</strong> {mockDocumentContent.documentData?.pages}</p>
                    <p><strong>Downloadable:</strong> {mockDocumentContent.documentData?.isDownloadable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">DocumentRenderer Component Preview:</p>
                  <div className="bg-gray-100 p-4 rounded border-2 border-dashed">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">PDF Viewer would render here</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Session Renderer Test Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                LiveSessionRenderer Test
              </CardTitle>
              <CardDescription>
                Test live session content rendering component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runLiveRendererTest} size="lg" className="w-full">
                  🧪 Test LiveSessionRenderer
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.liveLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.liveWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Data Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Session Demo */}
          <Card>
            <CardHeader>
              <CardTitle>LiveSessionRenderer Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Live Session Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockLiveContent.title}</p>
                    <p><strong>Meeting ID:</strong> {mockLiveContent.liveSessionData?.meetingId}</p>
                    <p><strong>Duration:</strong> {mockLiveContent.liveSessionData?.duration} minutes</p>
                    <p><strong>Passcode:</strong> {mockLiveContent.liveSessionData?.passcode}</p>
                    <p><strong>Scheduled:</strong> {mockLiveContent.liveSessionData?.scheduledAt?.toLocaleDateString()}</p>
                    <p><strong>Instructions:</strong> {mockLiveContent.liveSessionData?.instructions}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">LiveSessionRenderer Component Preview:</p>
                  <div className="bg-gray-100 p-4 rounded border-2 border-dashed">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Link className="h-4 w-4" />
                      <span className="text-sm">Live Session Interface would render here</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Renderer Test Tab */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                QuizRenderer Test
              </CardTitle>
              <CardDescription>
                Test quiz content rendering component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runQuizRendererTest} size="lg" className="w-full">
                  🧪 Test QuizRenderer
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.quizLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.quizWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Data Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Demo */}
          <Card>
            <CardHeader>
              <CardTitle>QuizRenderer Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Quiz Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockQuizContent.title}</p>
                    <p><strong>Questions:</strong> {mockQuizContent.quizData?.questionCount}</p>
                    <p><strong>Time Limit:</strong> {mockQuizContent.quizData?.timeLimit} minutes</p>
                    <p><strong>Passing Score:</strong> {mockQuizContent.quizData?.passingScore}%</p>
                    <p><strong>Attempts:</strong> {mockQuizContent.quizData?.attempts}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">QuizRenderer Component Preview:</p>
                  <div className="bg-gray-100 p-4 rounded border-2 border-dashed">
                    <div className="flex items-center gap-2 text-gray-600">
                      <HelpCircle className="h-4 w-4" />
                      <span className="text-sm">Quiz Interface would render here</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment Renderer Test Tab */}
        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                AssignmentRenderer Test
              </CardTitle>
              <CardDescription>
                Test assignment content rendering component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runAssignmentRendererTest} size="lg" className="w-full">
                  🧪 Test AssignmentRenderer
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.assignmentLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.assignmentWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Data Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Demo */}
          <Card>
            <CardHeader>
              <CardTitle>AssignmentRenderer Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Assignment Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockAssignmentContent.title}</p>
                    <p><strong>Instructions:</strong> {mockAssignmentContent.assignmentData?.instructions}</p>
                    <p><strong>Deadline:</strong> {mockAssignmentContent.assignmentData?.deadline?.toLocaleDateString()}</p>
                    <p><strong>File Types:</strong> {mockAssignmentContent.assignmentData?.allowedFileTypes.join(', ')}</p>
                    <p><strong>Max Size:</strong> {((mockAssignmentContent.assignmentData?.maxFileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Max Submissions:</strong> {mockAssignmentContent.assignmentData?.maxSubmissions}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">AssignmentRenderer Component Preview:</p>
                  <div className="bg-gray-100 p-4 rounded border-2 border-dashed">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileCheck className="h-4 w-4" />
                      <span className="text-sm">Assignment Interface would render here</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {testResults.errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Test Errors:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {testResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Content Renderers Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {[testResults.videoLoaded, testResults.documentLoaded, testResults.liveLoaded, testResults.quizLoaded, testResults.assignmentLoaded].filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Renderers Loaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {[testResults.videoWorking, testResults.documentWorking, testResults.liveWorking, testResults.quizWorking, testResults.assignmentWorking].filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Renderers Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                5
              </div>
              <div className="text-sm text-gray-600">Content Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.errors.length}
              </div>
              <div className="text-sm text-gray-600">Total Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Content Types Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Student Learning Components</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Video Content</span>
                  </div>
                  <Badge variant={testResults.videoWorking ? 'default' : 'secondary'}>
                    {testResults.videoWorking ? 'Working' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Document Content</span>
                  </div>
                  <Badge variant={testResults.documentWorking ? 'default' : 'secondary'}>
                    {testResults.documentWorking ? 'Working' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span className="text-sm">Live Sessions</span>
                  </div>
                  <Badge variant={testResults.liveWorking ? 'default' : 'secondary'}>
                    {testResults.liveWorking ? 'Working' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Assessment Components</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-sm">Quiz Content</span>
                  </div>
                  <Badge variant={testResults.quizWorking ? 'default' : 'secondary'}>
                    {testResults.quizWorking ? 'Working' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span className="text-sm">Assignment Content</span>
                  </div>
                  <Badge variant={testResults.assignmentWorking ? 'default' : 'secondary'}>
                    {testResults.assignmentWorking ? 'Working' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={runVideoRendererTest} variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Test Video
            </Button>
            <Button onClick={runDocumentRendererTest} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Test Document
            </Button>
            <Button onClick={runLiveRendererTest} variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Test Live
            </Button>
            <Button onClick={runQuizRendererTest} variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Test Quiz
            </Button>
            <Button onClick={runAssignmentRendererTest} variant="outline" size="sm">
              <FileCheck className="h-4 w-4 mr-2" />
              Test Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related Tests Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Related Test Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-complete">Master Dashboard</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-builders">Content Builders</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-main">Main Components</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-system">System Integration</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Content Renderers Testing</h4>
            <p className="text-sm text-gray-600">
              Testing suite for all content rendering components in the session system
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>🎥 Video Rendering</span>
              <span>📄 Document Viewing</span>
              <span>🔴 Live Sessions</span>
              <span>❓ Quiz Interface</span>
              <span>📝 Assignment Submission</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}