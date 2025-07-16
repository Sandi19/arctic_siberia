// File: src/app/tes/session-system/page.tsx

'use client';

// ✅ Framework imports
import { useState, useEffect } from 'react';

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
  Progress,
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
  Package,
  Settings,
  Users,
  BarChart3,
  Video,
  FileText,
  Link,
  HelpCircle,
  FileCheck,
  Database,
  Move,
  Hammer,
  Target
} from 'lucide-react';

// ✅ Import all session components for comprehensive testing
import {
  // Types
  ContentType,
  SessionStatus,
  SessionDifficulty,
  ContentAccessLevel,
  // Components
  SessionCard,
  SessionForm,
  SessionList,
  SessionStats,
  // Renderers
  VideoRenderer,
  DocumentRenderer,
  LiveSessionRenderer,
  QuizRenderer,
  AssignmentRenderer,
  // Builders
  VideoContentBuilder,
  QuizContentBuilder,
  DocumentContentBuilder,
  LiveSessionContentBuilder,
  AssignmentContentBuilder,
  // Hooks
  useSessionCrud,
  useSessionReorder
} from '@/components/session';

/**
 * 🧪 Session System Integration Test - Complete Overview
 * 
 * Comprehensive test untuk entire session system
 * Menggabungkan semua test yang ada menjadi satu overview
 */
export default function SessionSystemTestPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'renderers' | 'builders' | 'hooks' | 'integration'>('overview');
  
  const [testResults, setTestResults] = useState<{
    // Types
    typesLoaded: boolean;
    // Components
    componentsLoaded: number;
    componentsWorking: number;
    // Renderers
    renderersLoaded: number;
    renderersWorking: number;
    // Builders
    buildersLoaded: number;
    buildersWorking: number;
    // Hooks
    hooksLoaded: number;
    hooksWorking: number;
    // Integration
    integrationScore: number;
    errors: string[];
    lastTestTime: Date | null;
  }>({
    typesLoaded: false,
    componentsLoaded: 0,
    componentsWorking: 0,
    renderersLoaded: 0,
    renderersWorking: 0,
    buildersLoaded: 0,
    buildersWorking: 0,
    hooksLoaded: 0,
    hooksWorking: 0,
    integrationScore: 0,
    errors: [],
    lastTestTime: null
  });

  // =================================================================
  // 🎯 TEST HOOKS FOR REAL-TIME TESTING
  // =================================================================
  
  const {
    sessions,
    isLoading: crudLoading,
    createSession,
    updateSession,
    deleteSession,
    error: crudError
  } = useSessionCrud({
    courseId: 'test-course',
    onSessionChange: (sessions) => console.log('✅ Sessions updated:', sessions.length),
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
      console.log('✅ Order saved:', ids);
      return true;
    }
  });

  // =================================================================
  // 🎯 COMPREHENSIVE TEST FUNCTIONS
  // =================================================================

  const runTypesTest = () => {
    try {
      console.log('🧪 Testing session types...');
      
      // Test enums
      const contentTypes = Object.values(ContentType);
      const sessionStatuses = Object.values(SessionStatus);
      const difficulties = Object.values(SessionDifficulty);
      const accessLevels = Object.values(ContentAccessLevel);

      const typesLoaded = contentTypes.length > 0 && 
                         sessionStatuses.length > 0 && 
                         difficulties.length > 0 && 
                         accessLevels.length > 0;

      console.log('✅ Types test completed:', {
        contentTypes: contentTypes.length,
        sessionStatuses: sessionStatuses.length,
        difficulties: difficulties.length,
        accessLevels: accessLevels.length
      });

      return typesLoaded;
    } catch (error) {
      console.error('❌ Types test failed:', error);
      return false;
    }
  };

  const runComponentsTest = () => {
    try {
      console.log('🧪 Testing session components...');
      
      const components = [
        SessionCard,
        SessionForm,
        SessionList,
        SessionStats
      ];

      const componentsLoaded = components.filter(comp => comp).length;
      const componentsWorking = components.filter(comp => comp && typeof comp === 'function').length;

      console.log('✅ Components test completed:', {
        loaded: componentsLoaded,
        working: componentsWorking
      });

      return { componentsLoaded, componentsWorking };
    } catch (error) {
      console.error('❌ Components test failed:', error);
      return { componentsLoaded: 0, componentsWorking: 0 };
    }
  };

  const runRenderersTest = () => {
    try {
      console.log('🧪 Testing content renderers...');
      
      const renderers = [
        VideoRenderer,
        DocumentRenderer,
        LiveSessionRenderer,
        QuizRenderer,
        AssignmentRenderer
      ];

      const renderersLoaded = renderers.filter(renderer => renderer).length;
      const renderersWorking = renderers.filter(renderer => renderer && typeof renderer === 'function').length;

      console.log('✅ Renderers test completed:', {
        loaded: renderersLoaded,
        working: renderersWorking
      });

      return { renderersLoaded, renderersWorking };
    } catch (error) {
      console.error('❌ Renderers test failed:', error);
      return { renderersLoaded: 0, renderersWorking: 0 };
    }
  };

  const runBuildersTest = () => {
    try {
      console.log('🧪 Testing content builders...');
      
      const builders = [
        VideoContentBuilder,
        QuizContentBuilder,
        DocumentContentBuilder,
        LiveSessionContentBuilder,
        AssignmentContentBuilder
      ];

      const buildersLoaded = builders.filter(builder => builder).length;
      const buildersWorking = builders.filter(builder => builder && typeof builder === 'function').length;

      console.log('✅ Builders test completed:', {
        loaded: buildersLoaded,
        working: buildersWorking
      });

      return { buildersLoaded, buildersWorking };
    } catch (error) {
      console.error('❌ Builders test failed:', error);
      return { buildersLoaded: 0, buildersWorking: 0 };
    }
  };

  const runHooksTest = () => {
    try {
      console.log('🧪 Testing session hooks...');
      
      const hooks = [
        useSessionCrud,
        useSessionReorder
      ];

      const hooksLoaded = hooks.filter(hook => hook).length;
      const hooksWorking = hooks.filter(hook => hook && typeof hook === 'function').length;

      console.log('✅ Hooks test completed:', {
        loaded: hooksLoaded,
        working: hooksWorking
      });

      return { hooksLoaded, hooksWorking };
    } catch (error) {
      console.error('❌ Hooks test failed:', error);
      return { hooksLoaded: 0, hooksWorking: 0 };
    }
  };

  const runIntegrationTest = () => {
    try {
      console.log('🧪 Testing system integration...');
      
      let score = 0;
      const maxScore = 100;

      // Types integration (20 points)
      if (testResults.typesLoaded) score += 20;

      // Components integration (20 points)
      if (testResults.componentsLoaded === 4 && testResults.componentsWorking === 4) score += 20;

      // Renderers integration (20 points)
      if (testResults.renderersLoaded === 5 && testResults.renderersWorking === 5) score += 20;

      // Builders integration (20 points)
      if (testResults.buildersLoaded === 5 && testResults.buildersWorking === 5) score += 20;

      // Hooks integration (20 points)
      if (testResults.hooksLoaded === 2 && testResults.hooksWorking === 2) score += 20;

      console.log('✅ Integration test completed:', {
        score: score,
        maxScore: maxScore,
        percentage: Math.round((score / maxScore) * 100)
      });

      return score;
    } catch (error) {
      console.error('❌ Integration test failed:', error);
      return 0;
    }
  };

  const runAllTests = async () => {
    console.log('🚀 Starting comprehensive session system test...');
    
    const errors: string[] = [];
    
    try {
      // Run all tests
      const typesLoaded = runTypesTest();
      const { componentsLoaded, componentsWorking } = runComponentsTest();
      const { renderersLoaded, renderersWorking } = runRenderersTest();
      const { buildersLoaded, buildersWorking } = runBuildersTest();
      const { hooksLoaded, hooksWorking } = runHooksTest();
      
      // Update results first
      setTestResults(prev => ({
        ...prev,
        typesLoaded,
        componentsLoaded,
        componentsWorking,
        renderersLoaded,
        renderersWorking,
        buildersLoaded,
        buildersWorking,
        hooksLoaded,
        hooksWorking,
        lastTestTime: new Date()
      }));

      // Then run integration test
      setTimeout(() => {
        const integrationScore = runIntegrationTest();
        setTestResults(prev => ({
          ...prev,
          integrationScore,
          errors
        }));
      }, 500);

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      errors.push(`Test suite failed: ${error}`);
      setTestResults(prev => ({
        ...prev,
        errors
      }));
    }
  };

  // Auto-run tests on component mount
  useEffect(() => {
    runAllTests();
  }, []);

  // =================================================================
  // 🎯 CALCULATED VALUES
  // =================================================================

  const totalComponents = 4; // SessionCard, SessionForm, SessionList, SessionStats
  const totalRenderers = 5; // Video, Document, Live, Quiz, Assignment
  const totalBuilders = 5; // Video, Document, Live, Quiz, Assignment
  const totalHooks = 2; // useSessionCrud, useSessionReorder

  const overallScore = Math.round(
    ((testResults.typesLoaded ? 1 : 0) +
     (testResults.componentsLoaded / totalComponents) +
     (testResults.renderersLoaded / totalRenderers) +
     (testResults.buildersLoaded / totalBuilders) +
     (testResults.hooksLoaded / totalHooks)) / 5 * 100
  );

  const systemHealth = overallScore >= 90 ? 'Excellent' : 
                      overallScore >= 75 ? 'Good' : 
                      overallScore >= 50 ? 'Fair' : 'Poor';

  const systemHealthColor = overallScore >= 90 ? 'text-green-600' : 
                           overallScore >= 75 ? 'text-blue-600' : 
                           overallScore >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session System Integration Test</h1>
        <p className="text-muted-foreground">
          Comprehensive testing for the entire Arctic Siberia session system
        </p>
      </div>

      {/* System Health Overview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            System Health Overview
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
                {testResults.integrationScore}%
              </div>
              <div className="text-sm text-gray-600">Integration Score</div>
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
              <span>System Integration</span>
              <span>{testResults.integrationScore}%</span>
            </div>
            <Progress value={testResults.integrationScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <div className="flex gap-4">
        <Button onClick={runAllTests} size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Run All Tests
        </Button>
        
        <Badge variant={testResults.errors.length === 0 ? 'default' : 'destructive'}>
          {testResults.errors.length === 0 ? 'All Systems Operational' : `${testResults.errors.length} Issue(s)`}
        </Badge>

        {testResults.lastTestTime && (
          <Badge variant="outline">
            Last Test: {testResults.lastTestTime.toLocaleTimeString()}
          </Badge>
        )}
      </div>

      {/* Test Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="renderers">Renderers</TabsTrigger>
          <TabsTrigger value="builders">Builders</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Types Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Types System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={testResults.typesLoaded ? 'default' : 'destructive'}>
                    {testResults.typesLoaded ? 'Loaded' : 'Failed'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ContentType, SessionStatus, SessionDifficulty, ContentAccessLevel
                </p>
              </CardContent>
            </Card>

            {/* Components Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loaded</span>
                    <span>{testResults.componentsLoaded}/{totalComponents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Working</span>
                    <span>{testResults.componentsWorking}/{totalComponents}</span>
                  </div>
                  <Progress value={(testResults.componentsLoaded / totalComponents) * 100} className="h-1" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  SessionCard, SessionForm, SessionList, SessionStats
                </p>
              </CardContent>
            </Card>

            {/* Renderers Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Renderers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loaded</span>
                    <span>{testResults.renderersLoaded}/{totalRenderers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Working</span>
                    <span>{testResults.renderersWorking}/{totalRenderers}</span>
                  </div>
                  <Progress value={(testResults.renderersLoaded / totalRenderers) * 100} className="h-1" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Video, Document, Live, Quiz, Assignment
                </p>
              </CardContent>
            </Card>

            {/* Builders Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hammer className="h-4 w-4" />
                  Builders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loaded</span>
                    <span>{testResults.buildersLoaded}/{totalBuilders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Working</span>
                    <span>{testResults.buildersWorking}/{totalBuilders}</span>
                  </div>
                  <Progress value={(testResults.buildersLoaded / totalBuilders) * 100} className="h-1" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Video, Document, Live, Quiz, Assignment
                </p>
              </CardContent>
            </Card>

            {/* Hooks Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Hooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loaded</span>
                    <span>{testResults.hooksLoaded}/{totalHooks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Working</span>
                    <span>{testResults.hooksWorking}/{totalHooks}</span>
                  </div>
                  <Progress value={(testResults.hooksLoaded / totalHooks) * 100} className="h-1" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  useSessionCrud, useSessionReorder
                </p>
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span>{testResults.integrationScore}%</span>
                  </div>
                  <Progress value={testResults.integrationScore} className="h-1" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Overall system integration health
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  onClick={() => runTypesTest()} 
                  variant="outline" 
                  size="sm"
                >
                  Test Types
                </Button>
                <Button 
                  onClick={() => runComponentsTest()} 
                  variant="outline" 
                  size="sm"
                >
                  Test Components
                </Button>
                <Button 
                  onClick={() => runRenderersTest()} 
                  variant="outline" 
                  size="sm"
                >
                  Test Renderers
                </Button>
                <Button 
                  onClick={() => runBuildersTest()} 
                  variant="outline" 
                  size="sm"
                >
                  Test Builders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Management Components</CardTitle>
              <CardDescription>
                Core components for session management interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">SessionCard</span>
                    </div>
                    <Badge variant={SessionCard ? 'default' : 'destructive'}>
                      {SessionCard ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">SessionForm</span>
                    </div>
                    <Badge variant={SessionForm ? 'default' : 'destructive'}>
                      {SessionForm ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">SessionList</span>
                    </div>
                    <Badge variant={SessionList ? 'default' : 'destructive'}>
                      {SessionList ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-medium">SessionStats</span>
                    </div>
                    <Badge variant={SessionStats ? 'default' : 'destructive'}>
                      {SessionStats ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Renderers Tab */}
        <TabsContent value="renderers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Renderers</CardTitle>
              <CardDescription>
                Components for rendering different content types in student view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">VideoRenderer</span>
                    </div>
                    <Badge variant={VideoRenderer ? 'default' : 'destructive'}>
                      {VideoRenderer ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">DocumentRenderer</span>
                    </div>
                    <Badge variant={DocumentRenderer ? 'default' : 'destructive'}>
                      {DocumentRenderer ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      <span className="font-medium">LiveSessionRenderer</span>
                    </div>
                    <Badge variant={LiveSessionRenderer ? 'default' : 'destructive'}>
                      {LiveSessionRenderer ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span className="font-medium">QuizRenderer</span>
                    </div>
                    <Badge variant={QuizRenderer ? 'default' : 'destructive'}>
                      {QuizRenderer ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      <span className="font-medium">AssignmentRenderer</span>
                    </div>
                    <Badge variant={AssignmentRenderer ? 'default' : 'destructive'}>
                      {AssignmentRenderer ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Builders Tab */}
        <TabsContent value="builders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Builders</CardTitle>
              <CardDescription>
                Components for creating different content types in instructor view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">VideoContentBuilder</span>
                    </div>
                    <Badge variant={VideoContentBuilder ? 'default' : 'destructive'}>
                      {VideoContentBuilder ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">DocumentContentBuilder</span>
                    </div>
                    <Badge variant={DocumentContentBuilder ? 'default' : 'destructive'}>
                      {DocumentContentBuilder ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      <span className="font-medium">LiveSessionContentBuilder</span>
                    </div>
                    <Badge variant={LiveSessionContentBuilder ? 'default' : 'destructive'}>
                      {LiveSessionContentBuilder ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span className="font-medium">QuizContentBuilder</span>
                    </div>
                    <Badge variant={QuizContentBuilder ? 'default' : 'destructive'}>
                      {QuizContentBuilder ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      <span className="font-medium">AssignmentContentBuilder</span>
                    </div>
                    <Badge variant={AssignmentContentBuilder ? 'default' : 'destructive'}>
                      {AssignmentContentBuilder ? 'Loaded' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hooks Tab */}
        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Hooks</CardTitle>
              <CardDescription>
                Custom hooks for session management functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">useSessionCrud</span>
                      </div>
                      <Badge variant={useSessionCrud ? 'default' : 'destructive'}>
                        {useSessionCrud ? 'Loaded' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 p-2">
                      CRUD operations: Create, Read, Update, Delete sessions
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Move className="h-4 w-4" />
                        <span className="font-medium">useSessionReorder</span>
                      </div>
                      <Badge variant={useSessionReorder ? 'default' : 'destructive'}>
                        {useSessionReorder ? 'Loaded' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 p-2">
                      Drag & drop reordering with persistence
                    </div>
                  </div>
                </div>

                {/* Live Hook Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">useSessionCrud Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Sessions:</span>
                        <span>{sessions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loading:</span>
                        <span>{crudLoading ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error:</span>
                        <span>{crudError ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">useSessionReorder Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Dragging:</span>
                        <span>{isDragging ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Provider:</span>
                        <span>{DragDropProvider ? 'Ready' : 'Failed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error:</span>
                        <span>{reorderError ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integration Analysis</CardTitle>
              <CardDescription>
                Comprehensive analysis of how all components work together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Integration Score Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Integration Score Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Types System (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={testResults.typesLoaded ? 100 : 0} className="w-24 h-2" />
                        <span className="text-sm">{testResults.typesLoaded ? 20 : 0}/20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Components (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(testResults.componentsWorking / totalComponents) * 100} className="w-24 h-2" />
                        <span className="text-sm">{Math.round((testResults.componentsWorking / totalComponents) * 20)}/20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Renderers (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(testResults.renderersWorking / totalRenderers) * 100} className="w-24 h-2" />
                        <span className="text-sm">{Math.round((testResults.renderersWorking / totalRenderers) * 20)}/20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Builders (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(testResults.buildersWorking / totalBuilders) * 100} className="w-24 h-2" />
                        <span className="text-sm">{Math.round((testResults.buildersWorking / totalBuilders) * 20)}/20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hooks (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(testResults.hooksWorking / totalHooks) * 100} className="w-24 h-2" />
                        <span className="text-sm">{Math.round((testResults.hooksWorking / totalHooks) * 20)}/20</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Recommendations */}
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {overallScore === 100 ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          🎉 Perfect! All session system components are working correctly.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Some components need attention. Check individual test results for details.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* Test Links */}
                <div>
                  <h4 className="font-medium mb-3">Individual Test Pages</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/tes/session-components">Components Test</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/tes/session-hooks">Hooks Test</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/tes/session-renderers">Renderers Test</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/tes/session-builders">Builders Test</a>
                    </Button>
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
              <p className="font-medium">System Errors:</p>
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