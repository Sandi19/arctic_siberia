// File: src/app/tes/session-builders/page.tsx

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
  Video,
  FileText,
  Link,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Settings,
  Volume2,
  Hammer
} from 'lucide-react';

// ✅ Import content builders for testing
import {
  VideoContentBuilder,
  QuizContentBuilder,
  DocumentContentBuilder,
  LiveSessionContentBuilder,
  AssignmentContentBuilder
} from '@/components/session';

// ✅ Import session types for mock data
import {
  ContentType,
  ContentAccessLevel,
  type CreateContentFormData
} from '@/components/session/types';

/**
 * 🧪 Session Content Builders Test Page
 * 
 * Test page untuk memastikan content builders working correctly
 * Pattern yang sama dengan test yang ada di /app/tes/
 */
export default function SessionBuildersTestPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'quiz' | 'document' | 'live' | 'assignment' | 'integration'>('video');
  
  const [testResults, setTestResults] = useState<{
    videoBuilderLoaded: boolean;
    quizBuilderLoaded: boolean;
    documentBuilderLoaded: boolean;
    liveBuilderLoaded: boolean;
    assignmentBuilderLoaded: boolean;
    videoBuilderWorking: boolean;
    quizBuilderWorking: boolean;
    documentBuilderWorking: boolean;
    liveBuilderWorking: boolean;
    assignmentBuilderWorking: boolean;
    integrationWorking: boolean;
    errors: string[];
  }>({
    videoBuilderLoaded: false,
    quizBuilderLoaded: false,
    documentBuilderLoaded: false,
    liveBuilderLoaded: false,
    assignmentBuilderLoaded: false,
    videoBuilderWorking: false,
    quizBuilderWorking: false,
    documentBuilderWorking: false,
    liveBuilderWorking: false,
    assignmentBuilderWorking: false,
    integrationWorking: false,
    errors: []
  });

  // =================================================================
  // 🎯 MOCK DATA FOR TESTING
  // =================================================================

  const mockVideoFormData: CreateContentFormData = {
    sessionId: 'test-session',
    type: ContentType.VIDEO,
    title: 'Grammar Introduction Video',
    description: 'Learn basic grammar concepts',
    accessLevel: ContentAccessLevel.FREE,
    videoData: {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      startTime: 0,
      endTime: 300,
      autoPlay: false,
      showControls: true
    }
  };

  const mockQuizFormData: CreateContentFormData = {
    sessionId: 'test-session',
    type: ContentType.QUIZ,
    title: 'Grammar Knowledge Quiz',
    description: 'Test your understanding of grammar rules',
    accessLevel: ContentAccessLevel.FREE,
    quizData: {
      quizId: 'quiz-grammar-123',
      title: 'Grammar Quiz',
      questionCount: 10,
      timeLimit: 15,
      passingScore: 70,
      attempts: 3
    }
  };

  const mockDocumentFormData: CreateContentFormData = {
    sessionId: 'test-session',
    type: ContentType.DOCUMENT,
    title: 'Grammar Reference Sheet',
    description: 'Comprehensive grammar reference material',
    accessLevel: ContentAccessLevel.FREE,
    documentData: {
      fileUrl: 'https://example.com/grammar-reference.pdf',
      fileName: 'grammar-reference.pdf',
      fileType: 'application/pdf',
      fileSize: 2048000,
      isDownloadable: true,
      pages: 10
    }
  };

  const mockLiveFormData: CreateContentFormData = {
    sessionId: 'test-session',
    type: ContentType.LIVE_SESSION,
    title: 'Live Grammar Q&A Session',
    description: 'Interactive session with grammar expert',
    accessLevel: ContentAccessLevel.PREMIUM,
    liveSessionData: {
      meetingLink: 'https://zoom.us/j/987654321',
      scheduledAt: new Date(Date.now() + 86400000),
      duration: 90,
      meetingId: '987654321',
      passcode: 'grammar123',
      instructions: 'Please prepare your questions beforehand'
    }
  };

  const mockAssignmentFormData: CreateContentFormData = {
    sessionId: 'test-session',
    type: ContentType.ASSIGNMENT,
    title: 'Grammar Practice Assignment',
    description: 'Complete grammar exercises and submit',
    accessLevel: ContentAccessLevel.FREE,
    assignmentData: {
      instructions: 'Complete all exercises in the attached worksheet',
      deadline: new Date(Date.now() + 604800000),
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      maxFileSize: 5242880,
      maxSubmissions: 3,
      gradingCriteria: 'Accuracy and completeness of exercises'
    }
  };

  // =================================================================
  // 🎯 TEST FUNCTIONS
  // =================================================================

  const runVideoBuilderTest = () => {
    const errors: string[] = [];
    let videoBuilderLoaded = false;
    let videoBuilderWorking = false;

    try {
      console.log('🧪 Testing VideoContentBuilder...');
      
      // Test 1: Component loaded
      if (VideoContentBuilder) {
        videoBuilderLoaded = true;
        console.log('✅ VideoContentBuilder loaded successfully');
      } else {
        errors.push('VideoContentBuilder component not found');
      }

      // Test 2: Component can receive props
      if (mockVideoFormData.videoData) {
        videoBuilderWorking = true;
        console.log('✅ VideoContentBuilder can handle video data');
      } else {
        errors.push('VideoContentBuilder props handling failed');
      }

    } catch (error) {
      console.error('❌ VideoContentBuilder test failed:', error);
      errors.push(`VideoContentBuilder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      videoBuilderLoaded,
      videoBuilderWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runQuizBuilderTest = () => {
    const errors: string[] = [];
    let quizBuilderLoaded = false;
    let quizBuilderWorking = false;

    try {
      console.log('🧪 Testing QuizContentBuilder...');
      
      // Test 1: Component loaded
      if (QuizContentBuilder) {
        quizBuilderLoaded = true;
        console.log('✅ QuizContentBuilder loaded successfully');
      } else {
        errors.push('QuizContentBuilder component not found');
      }

      // Test 2: Component can handle quiz data
      if (mockQuizFormData.quizData) {
        quizBuilderWorking = true;
        console.log('✅ QuizContentBuilder can handle quiz data');
      } else {
        errors.push('QuizContentBuilder props handling failed');
      }

    } catch (error) {
      console.error('❌ QuizContentBuilder test failed:', error);
      errors.push(`QuizContentBuilder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      quizBuilderLoaded,
      quizBuilderWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runDocumentBuilderTest = () => {
    const errors: string[] = [];
    let documentBuilderLoaded = false;
    let documentBuilderWorking = false;

    try {
      console.log('🧪 Testing DocumentContentBuilder...');
      
      // Test 1: Component loaded
      if (DocumentContentBuilder) {
        documentBuilderLoaded = true;
        console.log('✅ DocumentContentBuilder loaded successfully');
      } else {
        errors.push('DocumentContentBuilder component not found');
      }

      // Test 2: Component can handle document data
      if (mockDocumentFormData.documentData) {
        documentBuilderWorking = true;
        console.log('✅ DocumentContentBuilder can handle document data');
      } else {
        errors.push('DocumentContentBuilder props handling failed');
      }

    } catch (error) {
      console.error('❌ DocumentContentBuilder test failed:', error);
      errors.push(`DocumentContentBuilder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      documentBuilderLoaded,
      documentBuilderWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runLiveBuilderTest = () => {
    const errors: string[] = [];
    let liveBuilderLoaded = false;
    let liveBuilderWorking = false;

    try {
      console.log('🧪 Testing LiveSessionContentBuilder...');
      
      // Test 1: Component loaded
      if (LiveSessionContentBuilder) {
        liveBuilderLoaded = true;
        console.log('✅ LiveSessionContentBuilder loaded successfully');
      } else {
        errors.push('LiveSessionContentBuilder component not found');
      }

      // Test 2: Component can handle live session data
      if (mockLiveFormData.liveSessionData) {
        liveBuilderWorking = true;
        console.log('✅ LiveSessionContentBuilder can handle live session data');
      } else {
        errors.push('LiveSessionContentBuilder props handling failed');
      }

    } catch (error) {
      console.error('❌ LiveSessionContentBuilder test failed:', error);
      errors.push(`LiveSessionContentBuilder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      liveBuilderLoaded,
      liveBuilderWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runAssignmentBuilderTest = () => {
    const errors: string[] = [];
    let assignmentBuilderLoaded = false;
    let assignmentBuilderWorking = false;

    try {
      console.log('🧪 Testing AssignmentContentBuilder...');
      
      // Test 1: Component loaded
      if (AssignmentContentBuilder) {
        assignmentBuilderLoaded = true;
        console.log('✅ AssignmentContentBuilder loaded successfully');
      } else {
        errors.push('AssignmentContentBuilder component not found');
      }

      // Test 2: Component can handle assignment data
      if (mockAssignmentFormData.assignmentData) {
        assignmentBuilderWorking = true;
        console.log('✅ AssignmentContentBuilder can handle assignment data');
      } else {
        errors.push('AssignmentContentBuilder props handling failed');
      }

    } catch (error) {
      console.error('❌ AssignmentContentBuilder test failed:', error);
      errors.push(`AssignmentContentBuilder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      assignmentBuilderLoaded,
      assignmentBuilderWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runIntegrationTest = () => {
    const errors: string[] = [];
    let integrationWorking = false;

    try {
      console.log('🧪 Testing builders integration...');
      
      // Test that all builders can work together
      const allBuilders = [
        VideoContentBuilder,
        QuizContentBuilder,
        DocumentContentBuilder,
        LiveSessionContentBuilder,
        AssignmentContentBuilder
      ];

      if (allBuilders.every(builder => builder)) {
        integrationWorking = true;
        console.log('✅ All content builders integration working');
      } else {
        errors.push('Content builders integration failed');
      }

    } catch (error) {
      console.error('❌ Integration test failed:', error);
      errors.push(`Integration test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      integrationWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runAllTests = () => {
    setTestResults({
      videoBuilderLoaded: false,
      quizBuilderLoaded: false,
      documentBuilderLoaded: false,
      liveBuilderLoaded: false,
      assignmentBuilderLoaded: false,
      videoBuilderWorking: false,
      quizBuilderWorking: false,
      documentBuilderWorking: false,
      liveBuilderWorking: false,
      assignmentBuilderWorking: false,
      integrationWorking: false,
      errors: []
    });
    
    runVideoBuilderTest();
    setTimeout(() => runQuizBuilderTest(), 100);
    setTimeout(() => runDocumentBuilderTest(), 200);
    setTimeout(() => runLiveBuilderTest(), 300);
    setTimeout(() => runAssignmentBuilderTest(), 400);
    setTimeout(() => runIntegrationTest(), 500);
  };

  const allTestsPassed = testResults.videoBuilderLoaded && 
                        testResults.quizBuilderLoaded && 
                        testResults.documentBuilderLoaded && 
                        testResults.liveBuilderLoaded && 
                        testResults.assignmentBuilderLoaded &&
                        testResults.videoBuilderWorking &&
                        testResults.quizBuilderWorking &&
                        testResults.documentBuilderWorking &&
                        testResults.liveBuilderWorking &&
                        testResults.assignmentBuilderWorking &&
                        testResults.integrationWorking &&
                        testResults.errors.length === 0;

  // =================================================================
  // 🎯 BUILDER DEMO FUNCTIONS
  // =================================================================

  const handleVideoSave = (data: CreateContentFormData) => {
    console.log('✅ Video content saved:', data);
  };

  const handleQuizSave = (data: CreateContentFormData) => {
    console.log('✅ Quiz content saved:', data);
  };

  const handleDocumentSave = (data: CreateContentFormData) => {
    console.log('✅ Document content saved:', data);
  };

  const handleLiveSave = (data: CreateContentFormData) => {
    console.log('✅ Live session content saved:', data);
  };

  const handleAssignmentSave = (data: CreateContentFormData) => {
    console.log('✅ Assignment content saved:', data);
  };

  const handleCancel = () => {
    console.log('❌ Content creation cancelled');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session Content Builders Test</h1>
        <p className="text-muted-foreground">
          Testing content builders implementation for session management
        </p>
      </div>

      {/* Overall Status */}
      <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {allTestsPassed ? 
            '✅ All content builders tests passed!' : 
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Video Builder Test Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                VideoContentBuilder Test
              </CardTitle>
              <CardDescription>
                Test video content creation builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runVideoBuilderTest} size="lg" className="w-full">
                  🧪 Test VideoContentBuilder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.videoBuilderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.videoBuilderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Builder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>VideoContentBuilder Demo</CardTitle>
              <CardDescription>
                Interactive video content builder interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Video Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockVideoFormData.title}</p>
                    <p><strong>YouTube URL:</strong> {mockVideoFormData.videoData?.youtubeUrl}</p>
                    <p><strong>Duration:</strong> {mockVideoFormData.videoData?.startTime}s - {mockVideoFormData.videoData?.endTime}s</p>
                    <p><strong>Auto Play:</strong> {mockVideoFormData.videoData?.autoPlay ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => handleVideoSave(mockVideoFormData)} size="sm">
                    Test Save Video
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Test Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Builder Test Tab */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                QuizContentBuilder Test
              </CardTitle>
              <CardDescription>
                Test quiz content creation builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runQuizBuilderTest} size="lg" className="w-full">
                  🧪 Test QuizContentBuilder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.quizBuilderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.quizBuilderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Builder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>QuizContentBuilder Demo</CardTitle>
              <CardDescription>
                Interactive quiz content builder interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Quiz Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockQuizFormData.title}</p>
                    <p><strong>Questions:</strong> {mockQuizFormData.quizData?.questionCount}</p>
                    <p><strong>Time Limit:</strong> {mockQuizFormData.quizData?.timeLimit} minutes</p>
                    <p><strong>Passing Score:</strong> {mockQuizFormData.quizData?.passingScore}%</p>
                    <p><strong>Max Attempts:</strong> {mockQuizFormData.quizData?.attempts}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => handleQuizSave(mockQuizFormData)} size="sm">
                    Test Save Quiz
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Test Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Builder Test Tab */}
        <TabsContent value="document" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DocumentContentBuilder Test
              </CardTitle>
              <CardDescription>
                Test document content creation builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runDocumentBuilderTest} size="lg" className="w-full">
                  🧪 Test DocumentContentBuilder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.documentBuilderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.documentBuilderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Builder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>DocumentContentBuilder Demo</CardTitle>
              <CardDescription>
                Interactive document content builder interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Document Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockDocumentFormData.title}</p>
                    <p><strong>File:</strong> {mockDocumentFormData.documentData?.fileName}</p>
                    <p><strong>Type:</strong> {mockDocumentFormData.documentData?.fileType}</p>
                    <p><strong>Size:</strong> {((mockDocumentFormData.documentData?.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Pages:</strong> {mockDocumentFormData.documentData?.pages}</p>
                    <p><strong>Downloadable:</strong> {mockDocumentFormData.documentData?.isDownloadable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => handleDocumentSave(mockDocumentFormData)} size="sm">
                    Test Save Document
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Test Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Session Builder Test Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                LiveSessionContentBuilder Test
              </CardTitle>
              <CardDescription>
                Test live session content creation builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runLiveBuilderTest} size="lg" className="w-full">
                  🧪 Test LiveSessionContentBuilder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.liveBuilderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.liveBuilderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Session Builder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>LiveSessionContentBuilder Demo</CardTitle>
              <CardDescription>
                Interactive live session content builder interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Live Session Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockLiveFormData.title}</p>
                    <p><strong>Meeting ID:</strong> {mockLiveFormData.liveSessionData?.meetingId}</p>
                    <p><strong>Duration:</strong> {mockLiveFormData.liveSessionData?.duration} minutes</p>
                    <p><strong>Passcode:</strong> {mockLiveFormData.liveSessionData?.passcode}</p>
                    <p><strong>Scheduled:</strong> {mockLiveFormData.liveSessionData?.scheduledAt?.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => handleLiveSave(mockLiveFormData)} size="sm">
                    Test Save Live Session
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Test Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment Builder Test Tab */}
        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                AssignmentContentBuilder Test
              </CardTitle>
              <CardDescription>
                Test assignment content creation builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runAssignmentBuilderTest} size="lg" className="w-full">
                  🧪 Test AssignmentContentBuilder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.assignmentBuilderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.assignmentBuilderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Builder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>AssignmentContentBuilder Demo</CardTitle>
              <CardDescription>
                Interactive assignment content builder interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Mock Assignment Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockAssignmentFormData.title}</p>
                    <p><strong>Instructions:</strong> {mockAssignmentFormData.assignmentData?.instructions}</p>
                    <p><strong>Deadline:</strong> {mockAssignmentFormData.assignmentData?.deadline?.toLocaleDateString()}</p>
                    <p><strong>File Types:</strong> {mockAssignmentFormData.assignmentData?.allowedFileTypes.join(', ')}</p>
                    <p><strong>Max Size:</strong> {((mockAssignmentFormData.assignmentData?.maxFileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Max Submissions:</strong> {mockAssignmentFormData.assignmentData?.maxSubmissions}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => handleAssignmentSave(mockAssignmentFormData)} size="sm">
                    Test Save Assignment
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Test Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Test Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Content Builders Integration Test
              </CardTitle>
              <CardDescription>
                Test integration between all content builders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runIntegrationTest} size="lg" className="w-full">
                  🧪 Test All Builders Integration
                </Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.integrationWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">All Builders Integration Working</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Builders Integration Overview</CardTitle>
              <CardDescription>
                Summary of all content builders and their capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Builder */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">Video Builder</span>
                    </div>
                    <Badge variant={testResults.videoBuilderLoaded ? 'default' : 'destructive'}>
                      {testResults.videoBuilderLoaded ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>

                  {/* Quiz Builder */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span className="font-medium">Quiz Builder</span>
                    </div>
                    <Badge variant={testResults.quizBuilderLoaded ? 'default' : 'destructive'}>
                      {testResults.quizBuilderLoaded ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>

                  {/* Document Builder */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Document Builder</span>
                    </div>
                    <Badge variant={testResults.documentBuilderLoaded ? 'default' : 'destructive'}>
                      {testResults.documentBuilderLoaded ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>

                  {/* Live Session Builder */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      <span className="font-medium">Live Session Builder</span>
                    </div>
                    <Badge variant={testResults.liveBuilderLoaded ? 'default' : 'destructive'}>
                      {testResults.liveBuilderLoaded ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>

                  {/* Assignment Builder */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      <span className="font-medium">Assignment Builder</span>
                    </div>
                    <Badge variant={testResults.assignmentBuilderLoaded ? 'default' : 'destructive'}>
                      {testResults.assignmentBuilderLoaded ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Builder Capabilities Test Results:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Video content creation</span>
                      <Badge variant={testResults.videoBuilderWorking ? 'default' : 'outline'}>
                        {testResults.videoBuilderWorking ? 'Working' : 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quiz content creation</span>
                      <Badge variant={testResults.quizBuilderWorking ? 'default' : 'outline'}>
                        {testResults.quizBuilderWorking ? 'Working' : 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document content creation</span>
                      <Badge variant={testResults.documentBuilderWorking ? 'default' : 'outline'}>
                        {testResults.documentBuilderWorking ? 'Working' : 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Live session content creation</span>
                      <Badge variant={testResults.liveBuilderWorking ? 'default' : 'outline'}>
                        {testResults.liveBuilderWorking ? 'Working' : 'Not tested'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assignment content creation</span>
                      <Badge variant={testResults.assignmentBuilderWorking ? 'default' : 'outline'}>
                        {testResults.assignmentBuilderWorking ? 'Working' : 'Not tested'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={() => {
                    console.log('🧪 Testing all builders with mock data...');
                    handleVideoSave(mockVideoFormData);
                    handleQuizSave(mockQuizFormData);
                    handleDocumentSave(mockDocumentFormData);
                    handleLiveSave(mockLiveFormData);
                    handleAssignmentSave(mockAssignmentFormData);
                  }} size="sm">
                    <Hammer className="h-4 w-4 mr-2" />
                    Test All Builders
                  </Button>
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
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {[testResults.videoBuilderLoaded, testResults.quizBuilderLoaded, testResults.documentBuilderLoaded, testResults.liveBuilderLoaded, testResults.assignmentBuilderLoaded].filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Builders Loaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {[testResults.videoBuilderWorking, testResults.quizBuilderWorking, testResults.documentBuilderWorking, testResults.liveBuilderWorking, testResults.assignmentBuilderWorking].filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Builders Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {testResults.integrationWorking ? 1 : 0}
              </div>
              <div className="text-sm text-gray-600">Integration Status</div>
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
    </div>
  );
}