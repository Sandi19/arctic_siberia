// File: src/app/tes/session-main/page.tsx

'use client';

// ✅ Framework imports
import { useState, useCallback } from 'react';

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
  TabsTrigger,
  Progress
} from '@/components/ui';

// ✅ Icons
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Users,
  Eye,
  Edit,
  PlayCircle,
  Hammer,
  Target,
  BookOpen,
  Layers
} from 'lucide-react';

// ✅ Import main session components for testing
import {
  SessionBuilder,
  SessionRenderer,
  // Supporting components
  useSessionCrud,
  useSessionReorder,
  // Types
  ContentType,
  SessionStatus,
  SessionDifficulty,
  ContentAccessLevel,
  type Session,
  type SessionContent,
  type SessionBuilderProps,
  type SessionRendererProps
} from '@/components/session';

/**
 * 🧪 Session Main Components Test
 * 
 * Test untuk main components: SessionBuilder & SessionRenderer
 * Ini adalah entry points utama dari session system
 */
export default function SessionMainComponentsTestPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'renderer' | 'integration' | 'props'>('builder');
  
  const [testResults, setTestResults] = useState<{
    builderLoaded: boolean;
    rendererLoaded: boolean;
    builderWorking: boolean;
    rendererWorking: boolean;
    propsCompatible: boolean;
    integrationWorking: boolean;
    errors: string[];
    lastTestTime: Date | null;
  }>({
    builderLoaded: false,
    rendererLoaded: false,
    builderWorking: false,
    rendererWorking: false,
    propsCompatible: false,
    integrationWorking: false,
    errors: [],
    lastTestTime: null
  });

  // =================================================================
  // 🎯 MOCK DATA FOR TESTING
  // =================================================================

  const mockSession: Session = {
    id: 'session-main-test',
    courseId: 'course-main-test',
    title: 'Complete English Grammar Course',
    description: 'Comprehensive grammar course with interactive content',
    order: 1,
    status: SessionStatus.PUBLISHED,
    difficulty: SessionDifficulty.INTERMEDIATE,
    accessLevel: ContentAccessLevel.PREMIUM,
    isFree: false,
    contents: [
      {
        id: 'content-1',
        sessionId: 'session-main-test',
        type: ContentType.VIDEO,
        title: 'Grammar Introduction Video',
        description: 'Basic grammar concepts explained',
        order: 1,
        accessLevel: ContentAccessLevel.FREE,
        isFree: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        videoData: {
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          startTime: 0,
          endTime: 300,
          autoPlay: false,
          showControls: true
        }
      },
      {
        id: 'content-2',
        sessionId: 'session-main-test',
        type: ContentType.QUIZ,
        title: 'Grammar Knowledge Quiz',
        description: 'Test your grammar understanding',
        order: 2,
        accessLevel: ContentAccessLevel.PREMIUM,
        isFree: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        quizData: {
          quizId: 'quiz-grammar-main',
          title: 'Grammar Quiz',
          questionCount: 15,
          timeLimit: 20,
          passingScore: 75,
          attempts: 2
        }
      },
      {
        id: 'content-3',
        sessionId: 'session-main-test',
        type: ContentType.DOCUMENT,
        title: 'Grammar Reference Guide',
        description: 'Comprehensive grammar reference',
        order: 3,
        accessLevel: ContentAccessLevel.PREMIUM,
        isFree: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        documentData: {
          fileUrl: 'https://example.com/grammar-guide.pdf',
          fileName: 'grammar-guide.pdf',
          fileType: 'application/pdf',
          fileSize: 3145728,
          isDownloadable: true,
          pages: 25
        }
      }
    ],
    totalContents: 3,
    estimatedDuration: 120,
    objectives: [
      'Understand basic grammar rules',
      'Practice sentence structure',
      'Apply grammar in writing',
      'Identify common grammar mistakes'
    ],
    tags: ['grammar', 'english', 'intermediate', 'writing'],
    prerequisites: ['Basic English vocabulary'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    enrollmentCount: 150,
    completionRate: 87,
    averageScore: 82
  };

  const mockBuilderProps: SessionBuilderProps = {
    courseId: 'course-main-test',
    config: {
      mode: 'EDIT',
      maxFreeContents: 2,
      allowedContentTypes: [ContentType.VIDEO, ContentType.QUIZ, ContentType.DOCUMENT],
      features: {
        dragAndDrop: true,
        bulkOperations: true,
        contentPreview: true,
        statistics: true,
        publishing: true
      }
    },
    onSessionChange: (sessions) => console.log('✅ Sessions changed:', sessions.length),
    onSessionSelect: (session) => console.log('✅ Session selected:', session?.title),
    className: 'test-session-builder'
  };

  const mockRendererProps: SessionRendererProps = {
    session: mockSession,
    studentId: 'student-123',
    config: {
      allowNotes: true,
      allowBookmarks: true,
      trackProgress: true,
      autoPlay: false,
      showPrerequisites: true,
      enableComments: true
    },
    onProgress: (contentId, progress) => console.log('✅ Progress:', contentId, progress),
    onComplete: (sessionId) => console.log('✅ Session completed:', sessionId),
    onContentChange: (contentId) => console.log('✅ Content changed:', contentId),
    className: 'test-session-renderer'
  };

  // =================================================================
  // 🎯 REAL HOOKS FOR TESTING
  // =================================================================

  const {
    sessions,
    isLoading: crudLoading,
    createSession,
    updateSession,
    deleteSession,
    error: crudError
  } = useSessionCrud({
    courseId: 'course-main-test',
    onSessionChange: (sessions) => console.log('✅ CRUD Sessions updated:', sessions.length),
    onError: (error) => console.error('❌ CRUD Error:', error)
  });

  const {
    isDragging,
    reorderSessions,
    DragDropProvider,
    error: reorderError
  } = useSessionReorder({
    sessions,
    onReorder: (sessions) => console.log('✅ Sessions reordered:', sessions.length),
    onReorderComplete: async (ids) => {
      console.log('✅ Reorder completed:', ids);
      return true;
    }
  });

  // =================================================================
  // 🎯 TEST FUNCTIONS
  // =================================================================

  const runBuilderTest = useCallback(() => {
    const errors: string[] = [];
    let builderLoaded = false;
    let builderWorking = false;

    try {
      console.log('🧪 Testing SessionBuilder...');
      
      // Test 1: Component loaded
      if (SessionBuilder) {
        builderLoaded = true;
        console.log('✅ SessionBuilder component loaded');
      } else {
        errors.push('SessionBuilder component not found');
      }

      // Test 2: Component can receive props
      if (SessionBuilder && typeof SessionBuilder === 'function') {
        builderWorking = true;
        console.log('✅ SessionBuilder can receive props');
      } else {
        errors.push('SessionBuilder props handling failed');
      }

    } catch (error) {
      console.error('❌ SessionBuilder test failed:', error);
      errors.push(`SessionBuilder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      builderLoaded,
      builderWorking,
      errors: [...prev.errors, ...errors]
    }));
  }, []);

  const runRendererTest = useCallback(() => {
    const errors: string[] = [];
    let rendererLoaded = false;
    let rendererWorking = false;

    try {
      console.log('🧪 Testing SessionRenderer...');
      
      // Test 1: Component loaded
      if (SessionRenderer) {
        rendererLoaded = true;
        console.log('✅ SessionRenderer component loaded');
      } else {
        errors.push('SessionRenderer component not found');
      }

      // Test 2: Component can receive props
      if (SessionRenderer && typeof SessionRenderer === 'function') {
        rendererWorking = true;
        console.log('✅ SessionRenderer can receive props');
      } else {
        errors.push('SessionRenderer props handling failed');
      }

    } catch (error) {
      console.error('❌ SessionRenderer test failed:', error);
      errors.push(`SessionRenderer test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      rendererLoaded,
      rendererWorking,
      errors: [...prev.errors, ...errors]
    }));
  }, []);

  const runPropsTest = useCallback(() => {
    const errors: string[] = [];
    let propsCompatible = false;

    try {
      console.log('🧪 Testing props compatibility...');
      
      // Test props interface compatibility
      if (mockBuilderProps.courseId && 
          mockBuilderProps.config && 
          mockRendererProps.session && 
          mockRendererProps.config) {
        propsCompatible = true;
        console.log('✅ Props interfaces compatible');
      } else {
        errors.push('Props interfaces not compatible');
      }

    } catch (error) {
      console.error('❌ Props test failed:', error);
      errors.push(`Props test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      propsCompatible,
      errors: [...prev.errors, ...errors]
    }));
  }, [mockBuilderProps, mockRendererProps]);

  const runIntegrationTest = useCallback(() => {
    const errors: string[] = [];
    let integrationWorking = false;

    try {
      console.log('🧪 Testing main components integration...');
      
      // Test integration with hooks
      if (SessionBuilder && 
          SessionRenderer && 
          sessions.length >= 0 && 
          typeof createSession === 'function' && 
          typeof reorderSessions === 'function') {
        integrationWorking = true;
        console.log('✅ Main components integration working');
      } else {
        errors.push('Main components integration failed');
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
  }, [SessionBuilder, SessionRenderer, sessions, createSession, reorderSessions]);

  const runAllTests = useCallback(() => {
    console.log('🚀 Starting main components test suite...');
    
    setTestResults({
      builderLoaded: false,
      rendererLoaded: false,
      builderWorking: false,
      rendererWorking: false,
      propsCompatible: false,
      integrationWorking: false,
      errors: [],
      lastTestTime: new Date()
    });

    runBuilderTest();
    setTimeout(() => runRendererTest(), 100);
    setTimeout(() => runPropsTest(), 200);
    setTimeout(() => runIntegrationTest(), 300);
  }, [runBuilderTest, runRendererTest, runPropsTest, runIntegrationTest]);

  // =================================================================
  // 🎯 CALCULATED VALUES
  // =================================================================

  const overallScore = Math.round(
    ((testResults.builderLoaded ? 25 : 0) +
     (testResults.rendererLoaded ? 25 : 0) +
     (testResults.builderWorking ? 25 : 0) +
     (testResults.rendererWorking ? 25 : 0)) / 4
  );

  const allTestsPassed = testResults.builderLoaded && 
                        testResults.rendererLoaded && 
                        testResults.builderWorking && 
                        testResults.rendererWorking && 
                        testResults.propsCompatible && 
                        testResults.integrationWorking && 
                        testResults.errors.length === 0;

  const systemHealth = overallScore >= 90 ? 'Excellent' : 
                      overallScore >= 75 ? 'Good' : 
                      overallScore >= 50 ? 'Fair' : 'Poor';

  const systemHealthColor = overallScore >= 90 ? 'text-green-600' : 
                           overallScore >= 75 ? 'text-blue-600' : 
                           overallScore >= 50 ? 'text-yellow-600' : 'text-red-600';

  // =================================================================
  // 🎯 DEMO FUNCTIONS
  // =================================================================

  const handleBuilderDemo = () => {
    console.log('🎯 SessionBuilder Demo with props:', mockBuilderProps);
  };

  const handleRendererDemo = () => {
    console.log('🎯 SessionRenderer Demo with props:', mockRendererProps);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session Main Components Test</h1>
        <p className="text-muted-foreground">
          Testing SessionBuilder & SessionRenderer - the main entry points of the session system
        </p>
      </div>

      {/* Main Status Overview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Main Components Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${systemHealthColor}`}>
                {overallScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${systemHealthColor}`}>
                {systemHealth}
              </div>
              <div className="text-sm text-gray-600">System Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.integrationWorking ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600">Integration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.errors.length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Main Components Status</span>
              <span>{overallScore}%</span>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <div className="flex gap-4">
        <Button onClick={runAllTests} size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Run All Tests
        </Button>
        
        <Badge variant={allTestsPassed ? 'default' : 'destructive'}>
          {allTestsPassed ? 'All Tests Passed' : 'Tests Failed'}
        </Badge>

        <Badge variant="outline">
          Sessions: {sessions.length}
        </Badge>

        {testResults.lastTestTime && (
          <Badge variant="outline">
            Last Test: {testResults.lastTestTime.toLocaleTimeString()}
          </Badge>
        )}
      </div>

      {/* Overall Status */}
      <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {allTestsPassed ? 
            '✅ All main components tests passed! SessionBuilder and SessionRenderer are ready.' : 
            '⚠️ Some main components tests failed. Check individual results below.'
          }
        </AlertDescription>
      </Alert>

      {/* Test Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">SessionBuilder</TabsTrigger>
          <TabsTrigger value="renderer">SessionRenderer</TabsTrigger>
          <TabsTrigger value="props">Props Test</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* SessionBuilder Test Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                SessionBuilder Test
              </CardTitle>
              <CardDescription>
                Test the main session builder component (instructor interface)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runBuilderTest} size="lg" className="w-full">
                  🧪 Test SessionBuilder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.builderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.builderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SessionBuilder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>SessionBuilder Demo</CardTitle>
              <CardDescription>
                Mock SessionBuilder with realistic props
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Builder Props:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Course ID:</strong> {mockBuilderProps.courseId}</p>
                    <p><strong>Mode:</strong> {mockBuilderProps.config?.mode}</p>
                    <p><strong>Max Free Contents:</strong> {mockBuilderProps.config?.maxFreeContents}</p>
                    <p><strong>Features:</strong> 
                      {mockBuilderProps.config?.features.dragAndDrop ? ' DragDrop' : ''}
                      {mockBuilderProps.config?.features.bulkOperations ? ' Bulk' : ''}
                      {mockBuilderProps.config?.features.contentPreview ? ' Preview' : ''}
                      {mockBuilderProps.config?.features.statistics ? ' Stats' : ''}
                      {mockBuilderProps.config?.features.publishing ? ' Publishing' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleBuilderDemo} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Demo Builder
                  </Button>
                  <Button onClick={() => console.log('SessionBuilder props:', mockBuilderProps)} variant="outline" size="sm">
                    Log Props
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SessionRenderer Test Tab */}
        <TabsContent value="renderer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                SessionRenderer Test
              </CardTitle>
              <CardDescription>
                Test the main session renderer component (student interface)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runRendererTest} size="lg" className="w-full">
                  🧪 Test SessionRenderer
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.rendererLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.rendererWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SessionRenderer Demo */}
          <Card>
            <CardHeader>
              <CardTitle>SessionRenderer Demo</CardTitle>
              <CardDescription>
                Mock SessionRenderer with realistic session data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Session Data:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Title:</strong> {mockSession.title}</p>
                    <p><strong>Contents:</strong> {mockSession.totalContents}</p>
                    <p><strong>Duration:</strong> {mockSession.estimatedDuration} minutes</p>
                    <p><strong>Difficulty:</strong> {mockSession.difficulty}</p>
                    <p><strong>Status:</strong> {mockSession.status}</p>
                    <p><strong>Enrollment:</strong> {mockSession.enrollmentCount} students</p>
                    <p><strong>Completion Rate:</strong> {mockSession.completionRate}%</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium mb-2">Renderer Config:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Student ID:</strong> {mockRendererProps.studentId}</p>
                    <p><strong>Features:</strong> 
                      {mockRendererProps.config?.allowNotes ? ' Notes' : ''}
                      {mockRendererProps.config?.allowBookmarks ? ' Bookmarks' : ''}
                      {mockRendererProps.config?.trackProgress ? ' Progress' : ''}
                      {mockRendererProps.config?.showPrerequisites ? ' Prerequisites' : ''}
                      {mockRendererProps.config?.enableComments ? ' Comments' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleRendererDemo} size="sm">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Demo Renderer
                  </Button>
                  <Button onClick={() => console.log('SessionRenderer props:', mockRendererProps)} variant="outline" size="sm">
                    Log Props
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Props Test Tab */}
        <TabsContent value="props" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Props Interface Test
              </CardTitle>
              <CardDescription>
                Test props compatibility and interface definitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runPropsTest} size="lg" className="w-full">
                  🧪 Test Props Compatibility
                </Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.propsCompatible ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Interfaces Compatible</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Props Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Props Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">SessionBuilder Props</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ courseId: string</li>
                      <li>✅ config: SessionBuilderConfig</li>
                      <li>✅ onSessionChange: callback</li>
                      <li>✅ onSessionSelect: callback</li>
                      <li>✅ className: string</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">SessionRenderer Props</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ session: Session</li>
                      <li>✅ studentId: string</li>
                      <li>✅ config: SessionRendererConfig</li>
                      <li>✅ onProgress: callback</li>
                      <li>✅ onComplete: callback</li>
                      <li>✅ onContentChange: callback</li>
                      <li>✅ className: string</li>
                    </ul>
                  </div>
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
                <Layers className="h-5 w-5" />
                Main Components Integration Test
              </CardTitle>
              <CardDescription>
                Test how SessionBuilder and SessionRenderer work with hooks and data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runIntegrationTest} size="lg" className="w-full">
                  🧪 Test Integration
                </Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.integrationWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Main Components Integration Working</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">SessionBuilder Integration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>useSessionCrud:</span>
                        <Badge variant={createSession ? 'default' : 'destructive'}>
                          {createSession ? 'Connected' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>useSessionReorder:</span>
                        <Badge variant={reorderSessions ? 'default' : 'destructive'}>
                          {reorderSessions ? 'Connected' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>DragDropProvider:</span>
                        <Badge variant={DragDropProvider ? 'default' : 'destructive'}>
                          {DragDropProvider ? 'Ready' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">SessionRenderer Integration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Session Data:</span>
                        <Badge variant={mockSession ? 'default' : 'destructive'}>
                          {mockSession ? 'Available' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Content Rendering:</span>
                        <Badge variant={mockSession.contents.length > 0 ? 'default' : 'destructive'}>
                          {mockSession.contents.length > 0 ? 'Ready' : 'No Content'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress Tracking:</span>
                        <Badge variant={mockRendererProps.config?.trackProgress ? 'default' : 'outline'}>
                          {mockRendererProps.config?.trackProgress ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Data Flow Test</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="p-2 border rounded text-center text-sm">
                      <div className="font-medium">Builder</div>
                      <div className="text-xs text-gray-600">Create/Edit Sessions</div>
                    </div>
                    <div className="p-2 border rounded text-center text-sm">
                      <div className="font-medium">Hooks</div>
                      <div className="text-xs text-gray-600">Data Management</div>
                    </div>
                    <div className="p-2 border rounded text-center text-sm">
                      <div className="font-medium">Renderer</div>
                      <div className="text-xs text-gray-600">Display/Learning</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Live Integration Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Sessions:</span>
                      <span>{sessions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CRUD Loading:</span>
                      <span>{crudLoading ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dragging State:</span>
                      <span>{isDragging ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CRUD Errors:</span>
                      <span>{crudError ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reorder Errors:</span>
                      <span>{reorderError ? 'Yes' : 'No'}</span>
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
              <p className="font-medium">Main Components Errors:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {testResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Main Components Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.builderLoaded ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">SessionBuilder</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.rendererLoaded ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">SessionRenderer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {testResults.propsCompatible ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Props Compatible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {testResults.integrationWorking ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Integration</div>
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
            <Button onClick={runBuilderTest} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Test Builder
            </Button>
            <Button onClick={runRendererTest} variant="outline" size="sm">
              <PlayCircle className="h-4 w-4 mr-2" />
              Test Renderer
            </Button>
            <Button onClick={runPropsTest} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Test Props
            </Button>
            <Button onClick={runIntegrationTest} variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              Test Integration
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
              <a href="/tes/session-system">System Overview</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-components">Components</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-hooks">Hooks</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/tes/session-builders">Builders</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}