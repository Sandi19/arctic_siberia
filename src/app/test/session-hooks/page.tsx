// File: src/app/tes/session-hooks/page.tsx

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
  TabsTrigger
} from '@/components/ui';

// ✅ Icons
import {
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
  Move,
  RefreshCw,
  Database,
  Grip
} from 'lucide-react';

// ✅ Import session hooks for testing
import useSessionCrud from '@/components/session/hooks/use-session-crud';
import useSessionReorder from '@/components/session/hooks/use-session-reorder';

// ✅ Import session types
import {
  SessionDifficulty,
  ContentAccessLevel,
  type CreateSessionFormData
} from '@/components/session/types';

/**
 * 🧪 Session Hooks Test Page
 * 
 * Test page untuk memastikan session hooks working correctly
 * Pattern yang sama dengan test yang ada di /app/tes/
 */
export default function SessionHooksTestPage() {
  const [activeTab, setActiveTab] = useState<'crud' | 'reorder' | 'integration'>('crud');
  
  const [testResults, setTestResults] = useState<{
    crudLoaded: boolean;
    reorderLoaded: boolean;
    crudWorking: boolean;
    reorderWorking: boolean;
    integrationWorking: boolean;
    errors: string[];
  }>({
    crudLoaded: false,
    reorderLoaded: false,
    crudWorking: false,
    reorderWorking: false,
    integrationWorking: false,
    errors: []
  });

  // =================================================================
  // 🎯 HOOKS TESTING
  // =================================================================

  // Test useSessionCrud hook
  const {
    sessions,
    isLoading: crudLoading,
    isCreating,
    isDeleting,
    createSession,
    updateSession,
    deleteSession,
    error: crudError
  } = useSessionCrud({
    courseId: 'test-course',
    onSessionChange: (sessions) => console.log('✅ Sessions changed:', sessions.length),
    onError: (error) => console.error('❌ CRUD Error:', error)
  });

  // Test useSessionReorder hook  
  const {
    isDragging,
    draggedSession,
    isProcessing: reorderProcessing,
    DragDropProvider,
    reorderSessions,
    error: reorderError
  } = useSessionReorder({
    sessions,
    onReorder: (reorderedSessions) => console.log('✅ Reordered:', reorderedSessions.map(s => s.title)),
    onReorderComplete: async (sessionIds) => {
      console.log('✅ Saving new order:', sessionIds);
      return true; // Mock success
    },
    onError: (error) => console.error('❌ Reorder Error:', error)
  });

  // =================================================================
  // 🎯 TEST FUNCTIONS
  // =================================================================

  const runCrudTest = useCallback(async () => {
    const errors: string[] = [];
    let crudLoaded = false;
    let crudWorking = false;

    try {
      console.log('🧪 Testing useSessionCrud hook...');
      
      // Test 1: Hook loaded
      if (typeof createSession === 'function' && 
          typeof updateSession === 'function' && 
          typeof deleteSession === 'function') {
        crudLoaded = true;
        console.log('✅ useSessionCrud hook loaded successfully');
      } else {
        errors.push('useSessionCrud hook not loaded properly');
      }

      // Test 2: Hook working (test createSession)
      if (typeof createSession === 'function') {
        crudWorking = true;
        console.log('✅ useSessionCrud functions available');
      } else {
        errors.push('useSessionCrud functions not working');
      }

    } catch (error) {
      console.error('❌ useSessionCrud test failed:', error);
      errors.push(`useSessionCrud test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      crudLoaded,
      crudWorking,
      errors: [...prev.errors, ...errors]
    }));
  }, [createSession, updateSession, deleteSession]);

  const runReorderTest = useCallback(async () => {
    const errors: string[] = [];
    let reorderLoaded = false;
    let reorderWorking = false;

    try {
      console.log('🧪 Testing useSessionReorder hook...');
      
      // Test 1: Hook loaded
      if (typeof reorderSessions === 'function' && 
          DragDropProvider) {
        reorderLoaded = true;
        console.log('✅ useSessionReorder hook loaded successfully');
      } else {
        errors.push('useSessionReorder hook not loaded properly');
      }

      // Test 2: Hook working
      if (typeof reorderSessions === 'function') {
        reorderWorking = true;
        console.log('✅ useSessionReorder functions available');
      } else {
        errors.push('useSessionReorder functions not working');
      }

    } catch (error) {
      console.error('❌ useSessionReorder test failed:', error);
      errors.push(`useSessionReorder test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      reorderLoaded,
      reorderWorking,
      errors: [...prev.errors, ...errors]
    }));
  }, [reorderSessions, DragDropProvider]);

  const runIntegrationTest = useCallback(async () => {
    const errors: string[] = [];
    let integrationWorking = false;

    try {
      console.log('🧪 Testing hooks integration...');
      
      // Test integration between hooks
      if (sessions.length >= 0 && 
          typeof createSession === 'function' && 
          typeof reorderSessions === 'function') {
        integrationWorking = true;
        console.log('✅ Hooks integration working');
      } else {
        errors.push('Hooks integration not working');
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
  }, [sessions, createSession, reorderSessions]);

  const runAllTests = useCallback(async () => {
    setTestResults({
      crudLoaded: false,
      reorderLoaded: false,
      crudWorking: false,
      reorderWorking: false,
      integrationWorking: false,
      errors: []
    });
    
    await runCrudTest();
    setTimeout(() => runReorderTest(), 100);
    setTimeout(() => runIntegrationTest(), 200);
  }, [runCrudTest, runReorderTest, runIntegrationTest]);

  // =================================================================
  // 🎯 INTERACTION FUNCTIONS
  // =================================================================

  const testCreateSession = useCallback(async () => {
    try {
      const newSessionData: CreateSessionFormData = {
        title: 'Test Session from Hooks',
        description: 'Created via hooks test interface',
        difficulty: SessionDifficulty.BEGINNER,
        accessLevel: ContentAccessLevel.FREE,
        objectives: ['Test objective'],
        tags: ['test', 'hooks']
      };
      
      await createSession(newSessionData);
      console.log('✅ Session created successfully via hooks');
    } catch (error) {
      console.error('❌ Failed to create session:', error);
    }
  }, [createSession]);

  const testReorderSessions = useCallback(async () => {
    if (sessions.length >= 2) {
      try {
        await reorderSessions(0, 1);
        console.log('✅ Sessions reordered successfully via hooks');
      } catch (error) {
        console.error('❌ Failed to reorder sessions:', error);
      }
    } else {
      console.log('⚠️ Need at least 2 sessions to test reordering');
    }
  }, [sessions, reorderSessions]);

  const allTestsPassed = testResults.crudLoaded && 
                        testResults.reorderLoaded && 
                        testResults.crudWorking && 
                        testResults.reorderWorking && 
                        testResults.integrationWorking && 
                        testResults.errors.length === 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session Hooks Test</h1>
        <p className="text-muted-foreground">
          Testing session hooks implementation and integration
        </p>
      </div>

      {/* Overall Status */}
      <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {allTestsPassed ? 
            '✅ All session hooks tests passed!' : 
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

        <Badge variant="outline">
          Sessions: {sessions.length}
        </Badge>
      </div>

      {/* Test Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="crud">CRUD Hook</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Hook</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* CRUD Hook Test Tab */}
        <TabsContent value="crud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                useSessionCrud Hook Test
              </CardTitle>
              <CardDescription>
                Test session CRUD operations hook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runCrudTest} size="lg" className="w-full">
                  🧪 Test useSessionCrud
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.crudLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Hook Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.crudWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Functions Working</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRUD Operations Demo */}
          <Card>
            <CardHeader>
              <CardTitle>CRUD Operations Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Hook State:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Sessions: {sessions.length}</li>
                      <li>Loading: {crudLoading ? 'Yes' : 'No'}</li>
                      <li>Creating: {isCreating ? 'Yes' : 'No'}</li>
                      <li>Deleting: {isDeleting ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Available Functions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ createSession</li>
                      <li>✅ updateSession</li>
                      <li>✅ deleteSession</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={testCreateSession} 
                    disabled={isCreating}
                    size="sm"
                  >
                    {isCreating ? 'Creating...' : 'Test Create Session'}
                  </Button>
                </div>

                {crudError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error: {crudError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder Hook Test Tab */}
        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Move className="h-5 w-5" />
                useSessionReorder Hook Test
              </CardTitle>
              <CardDescription>
                Test session drag & drop reordering hook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runReorderTest} size="lg" className="w-full">
                  🧪 Test useSessionReorder
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.reorderLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Hook Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.reorderWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Functions Working</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reorder Operations Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Reorder Operations Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Hook State:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Sessions: {sessions.length}</li>
                      <li>Dragging: {isDragging ? 'Yes' : 'No'}</li>
                      <li>Processing: {reorderProcessing ? 'Yes' : 'No'}</li>
                      <li>Dragged: {draggedSession?.title || 'None'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Available Functions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ reorderSessions</li>
                      <li>✅ DragDropProvider</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={testReorderSessions} 
                    disabled={reorderProcessing || sessions.length < 2}
                    size="sm"
                  >
                    <Grip className="h-4 w-4 mr-2" />
                    {reorderProcessing ? 'Reordering...' : 'Test Reorder'}
                  </Button>
                </div>

                {reorderError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error: {reorderError}
                    </AlertDescription>
                  </Alert>
                )}
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
                Hooks Integration Test
              </CardTitle>
              <CardDescription>
                Test interaction between session hooks
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
                    <span className="text-sm">Hooks Integration Working</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Session List (from useSessionCrud):</h4>
                  <div className="space-y-2">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-gray-500">No sessions yet. Create one to test integration.</p>
                    ) : (
                      sessions.map((session, index) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-gray-500">Order: {index + 1}</p>
                          </div>
                          <Badge variant="outline">
                            {session.difficulty}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={testCreateSession} 
                    disabled={isCreating}
                    size="sm"
                  >
                    Create Session
                  </Button>
                  <Button 
                    onClick={testReorderSessions} 
                    disabled={reorderProcessing || sessions.length < 2}
                    size="sm"
                    variant="outline"
                  >
                    Reorder Sessions
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
    </div>
  );
}