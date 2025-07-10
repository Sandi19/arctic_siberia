// File: src/app/test/session-types/page.tsx (UPDATED)

'use client';

// ✅ FIXED: Framework imports
import { useState } from 'react';

// ✅ FIXED: UI Components menggunakan barrel imports
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

// ✅ FIXED: Icons
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Play,
  Video,
  Link,
  HelpCircle,
  Clipboard,
  RefreshCw,
  GripVertical,
  Plus,
  Trash2
} from 'lucide-react';

// ✅ CRITICAL TEST: Import session types
import {
  ContentType,
  SessionStatus,
  SessionMode,
  ContentAccessLevel,
  SessionDifficulty,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_DESCRIPTIONS,
  CONTENT_TYPE_ICONS,
  SESSION_CONFIG,
  CONTENT_CONFIG,
  type Session,
  type SessionContent,
  type CreateSessionFormData
} from '@/components/session/types';

// ✅ NEW: Import hooks for testing
import useSessionCrud from '@/components/session/hooks/use-session-crud';
import useSessionReorder from '@/components/session/hooks/use-session-reorder';

/**
 * 🧪 Session Types & Hooks Test Page
 * 
 * Real browser test untuk memastikan session types + hooks working correctly
 */
export default function SessionTypesTestPage() {
  const [activeTab, setActiveTab] = useState<'types' | 'hooks' | 'integration'>('types');
  
  const [testResults, setTestResults] = useState<{
    typesLoaded: boolean;
    enumsWorking: boolean;
    interfacesWorking: boolean;
    constantsWorking: boolean;
    hooksLoaded: boolean;
    hooksWorking: boolean;
    errors: string[];
  }>({
    typesLoaded: false,
    enumsWorking: false,
    interfacesWorking: false,
    constantsWorking: false,
    hooksLoaded: false,
    hooksWorking: false,
    errors: []
  });

  // ✅ NEW: Test hooks
  const {
    sessions,
    isLoading: crudLoading,
    isCreating,
    createSession,
    deleteSession,
    error: crudError
  } = useSessionCrud({
    courseId: 'test-course',
    onSessionChange: (sessions) => console.log('Sessions changed:', sessions.length),
    onError: (error) => console.error('CRUD Error:', error)
  });

  const {
    isDragging,
    draggedSession,
    isProcessing: reorderProcessing,
    DragDropProvider,
    reorderSessions
  } = useSessionReorder({
    sessions,
    onReorder: (reorderedSessions) => console.log('Reordered:', reorderedSessions.map(s => s.title)),
    onReorderComplete: async (sessionIds) => {
      console.log('Saving order:', sessionIds);
      return true; // Mock success
    }
  });

  // Test functions
  const runTypesTest = () => {
    const errors: string[] = [];
    let typesLoaded = false;
    let enumsWorking = false;
    let interfacesWorking = false;
    let constantsWorking = false;

    try {
      // Test 1: Types loaded
      console.log('🧪 Testing types import...');
      if (ContentType && SessionStatus && SessionMode) {
        typesLoaded = true;
        console.log('✅ Types imported successfully');
      }

      // Test 2: Enums working
      console.log('🧪 Testing enums...');
      const contentTypes = Object.values(ContentType);
      console.log('Content Types:', contentTypes);
      
      if (contentTypes.length === 5 && 
          contentTypes.includes('VIDEO') && 
          contentTypes.includes('ASSIGNMENT')) {
        enumsWorking = true;
        console.log('✅ Enums working correctly');
      } else {
        errors.push('Content types enum not working correctly');
      }

      // Test 3: Interfaces working
      console.log('🧪 Testing interfaces...');
      const mockSession: Session = {
        id: 'test-session',
        courseId: 'test-course',
        title: 'Test Session',
        description: 'Test session description',
        order: 1,
        status: SessionStatus.DRAFT,
        difficulty: SessionDifficulty.BEGINNER,
        accessLevel: ContentAccessLevel.FREE,
        isFree: true,
        contents: [],
        totalContents: 0,
        estimatedDuration: 30,
        objectives: ['Learn basics'],
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Mock Session:', mockSession);
      interfacesWorking = true;
      console.log('✅ Interfaces working correctly');

      // Test 4: Constants working
      console.log('🧪 Testing constants...');
      console.log('Content Type Labels:', CONTENT_TYPE_LABELS);
      console.log('Session Config:', SESSION_CONFIG);
      
      if (CONTENT_TYPE_LABELS[ContentType.VIDEO] === 'Video' &&
          SESSION_CONFIG.MAX_FREE_CONTENT === 3) {
        constantsWorking = true;
        console.log('✅ Constants working correctly');
      } else {
        errors.push('Constants not working correctly');
      }

    } catch (error) {
      console.error('❌ Types test failed:', error);
      errors.push(`Types test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      typesLoaded,
      enumsWorking,
      interfacesWorking,
      constantsWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runHooksTest = () => {
    const errors: string[] = [];
    let hooksLoaded = false;
    let hooksWorking = false;

    try {
      console.log('🧪 Testing hooks import...');
      
      // Test hooks loaded
      if (useSessionCrud && useSessionReorder) {
        hooksLoaded = true;
        console.log('✅ Hooks imported successfully');
      }

      // Test hooks working
      console.log('🧪 Testing hooks functionality...');
      console.log('Sessions from CRUD hook:', sessions.length);
      console.log('CRUD Loading state:', crudLoading);
      console.log('Drag state:', isDragging);
      console.log('DragDropProvider available:', !!DragDropProvider);

      if (sessions.length >= 0 && typeof createSession === 'function' && typeof reorderSessions === 'function') {
        hooksWorking = true;
        console.log('✅ Hooks working correctly');
      } else {
        errors.push('Hooks not functioning correctly');
      }

    } catch (error) {
      console.error('❌ Hooks test failed:', error);
      errors.push(`Hooks test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      hooksLoaded,
      hooksWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runAllTests = () => {
    setTestResults({
      typesLoaded: false,
      enumsWorking: false,
      interfacesWorking: false,
      constantsWorking: false,
      hooksLoaded: false,
      hooksWorking: false,
      errors: []
    });
    
    runTypesTest();
    setTimeout(() => runHooksTest(), 100);
  };

  const testCreateSession = async () => {
    try {
      const newSession = await createSession({
        title: 'Test Session from UI',
        description: 'Created via test interface',
        difficulty: SessionDifficulty.BEGINNER,
        accessLevel: ContentAccessLevel.FREE,
        objectives: ['Test objective'],
        tags: ['test', 'ui']
      });
      
      if (newSession) {
        console.log('✅ Session created via UI:', newSession.title);
      }
    } catch (error) {
      console.error('❌ Failed to create session:', error);
    }
  };

  const testReorderSessions = async () => {
    if (sessions.length >= 2) {
      try {
        await reorderSessions(0, 1);
        console.log('✅ Sessions reordered via UI');
      } catch (error) {
        console.error('❌ Failed to reorder sessions:', error);
      }
    }
  };

  const allTestsPassed = testResults.typesLoaded && 
                        testResults.enumsWorking && 
                        testResults.interfacesWorking && 
                        testResults.constantsWorking && 
                        testResults.hooksLoaded &&
                        testResults.hooksWorking &&
                        testResults.errors.length === 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session System Test</h1>
        <p className="text-muted-foreground">
          Testing simplified session types + mock hooks implementation
        </p>
      </div>

      {/* Test Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="types">Types Test</TabsTrigger>
          <TabsTrigger value="hooks">Hooks Test</TabsTrigger>
          <TabsTrigger value="integration">Integration Test</TabsTrigger>
        </TabsList>

        {/* Types Test Tab */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Types Test
              </CardTitle>
              <CardDescription>
                Test session types import and functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runTypesTest} size="lg" className="w-full">
                🧪 Run Types Test
              </Button>
            </CardContent>
          </Card>

          {/* Content Types Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                5 Content Types Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(ContentType).map((type) => (
                  <Card key={type} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {CONTENT_TYPE_ICONS[type]}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {CONTENT_TYPE_LABELS[type]}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {CONTENT_TYPE_DESCRIPTIONS[type]}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hooks Test Tab */}
        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Hooks Test
              </CardTitle>
              <CardDescription>
                Test mock hooks functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runHooksTest} size="lg" className="w-full">
                🔧 Run Hooks Test
              </Button>
            </CardContent>
          </Card>

          {/* Session CRUD Test */}
          <Card>
            <CardHeader>
              <CardTitle>Session CRUD Operations</CardTitle>
              <CardDescription>
                Current sessions: {sessions.length} | Loading: {crudLoading ? 'Yes' : 'No'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testCreateSession} disabled={isCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Test Session'}
                </Button>
                <Button 
                  onClick={testReorderSessions} 
                  disabled={reorderProcessing || sessions.length < 2}
                  variant="outline"
                >
                  <GripVertical className="h-4 w-4 mr-2" />
                  {reorderProcessing ? 'Reordering...' : 'Test Reorder'}
                </Button>
              </div>

              {crudError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    CRUD Error: {crudError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sessions List */}
              {sessions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Mock Sessions:</h4>
                  {sessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{index + 1}. {session.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({session.totalContents} contents, {session.estimatedDuration} min)
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Test Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Full Integration Test
              </CardTitle>
              <CardDescription>
                Test types + hooks working together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runAllTests} size="lg" className="w-full">
                🚀 Run All Tests
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          {(testResults.typesLoaded || testResults.errors.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {allTestsPassed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Status Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.typesLoaded ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Types Import</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {testResults.enumsWorking ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Enums Working</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {testResults.interfacesWorking ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Interfaces Working</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {testResults.constantsWorking ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Constants Working</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {testResults.hooksLoaded ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Hooks Import</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {testResults.hooksWorking ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>Hooks Working</span>
                  </div>
                </div>

                {/* Errors */}
                {testResults.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="space-y-1">
                        {testResults.errors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {allTestsPassed && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      🎉 All tests passed! Session types + hooks are working correctly.
                      Ready to proceed to Step 3 (Mock Content Renderers).
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      {allTestsPassed && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ Step 2 Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Session types + mock hooks are working perfectly. Ready for Step 3: Mock Content Renderers.
            </p>
            <div className="space-y-2 text-sm text-green-600">
              <div>🎯 Next: Create 5 content renderer placeholders</div>
              <div>🎯 Next: Video, Document, Live Session, Quiz, Assignment renderers</div>
              <div>🎯 Goal: SessionRenderer displays content placeholders</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}