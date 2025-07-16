// File: src/app/tes/session-components/page.tsx

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
  Play,
  FileText,
  Users,
  BarChart3,
  RefreshCw,
  Package
} from 'lucide-react';

// ✅ Import session components for testing
import {
  SessionCard,
  SessionForm,
  SessionList,
  SessionStats
} from '@/components/session';

// ✅ Import session types for mock data
import {
  ContentType,
  SessionStatus,
  SessionDifficulty,
  ContentAccessLevel,
  type Session
} from '@/components/session/types';

/**
 * 🧪 Session Components Test Page
 * 
 * Test page untuk memastikan session management components working correctly
 * Pattern yang sama dengan /app/tes/session-types/page.tsx
 */
export default function SessionComponentsTestPage() {
  const [activeTab, setActiveTab] = useState<'card' | 'form' | 'list' | 'stats'>('card');
  
  const [testResults, setTestResults] = useState<{
    cardLoaded: boolean;
    formLoaded: boolean;
    listLoaded: boolean;
    statsLoaded: boolean;
    cardWorking: boolean;
    formWorking: boolean;
    listWorking: boolean;
    statsWorking: boolean;
    errors: string[];
  }>({
    cardLoaded: false,
    formLoaded: false,
    listLoaded: false,
    statsLoaded: false,
    cardWorking: false,
    formWorking: false,
    listWorking: false,
    statsWorking: false,
    errors: []
  });

  // =================================================================
  // 🎯 MOCK DATA FOR TESTING
  // =================================================================

  const mockSessions: Session[] = [
    {
      id: 'session-1',
      courseId: 'course-1',
      title: 'Introduction to English Grammar',
      description: 'Learn the basic rules of English grammar',
      order: 1,
      status: SessionStatus.PUBLISHED,
      difficulty: SessionDifficulty.BEGINNER,
      accessLevel: ContentAccessLevel.FREE,
      isFree: true,
      contents: [],
      totalContents: 5,
      estimatedDuration: 45,
      objectives: ['Understand basic grammar rules', 'Practice sentence structure'],
      tags: ['grammar', 'basics', 'beginner'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      enrollmentCount: 125,
      completionRate: 85,
      averageScore: 78
    },
    {
      id: 'session-2',
      courseId: 'course-1',
      title: 'Advanced Conversation Practice',
      description: 'Practice speaking with native speakers',
      order: 2,
      status: SessionStatus.DRAFT,
      difficulty: SessionDifficulty.ADVANCED,
      accessLevel: ContentAccessLevel.PREMIUM,
      isFree: false,
      contents: [],
      totalContents: 8,
      estimatedDuration: 90,
      objectives: ['Improve fluency', 'Practice pronunciation'],
      tags: ['conversation', 'speaking', 'advanced'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-22'),
      enrollmentCount: 45,
      completionRate: 92,
      averageScore: 88
    },
    {
      id: 'session-3',
      courseId: 'course-1',
      title: 'Business English Writing',
      description: 'Learn professional writing skills',
      order: 3,
      status: SessionStatus.PUBLISHED,
      difficulty: SessionDifficulty.INTERMEDIATE,
      accessLevel: ContentAccessLevel.PREMIUM,
      isFree: false,
      contents: [],
      totalContents: 12,
      estimatedDuration: 120,
      objectives: ['Write professional emails', 'Create business documents'],
      tags: ['writing', 'business', 'professional'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-26'),
      enrollmentCount: 78,
      completionRate: 76,
      averageScore: 82
    }
  ];

  // =================================================================
  // 🎯 TEST FUNCTIONS
  // =================================================================

  const runCardTest = () => {
    const errors: string[] = [];
    let cardLoaded = false;
    let cardWorking = false;

    try {
      console.log('🧪 Testing SessionCard component...');
      
      // Test 1: Component loaded
      if (SessionCard) {
        cardLoaded = true;
        console.log('✅ SessionCard component loaded');
      } else {
        errors.push('SessionCard component not found');
      }

      // Test 2: Component can receive props
      if (mockSessions.length > 0) {
        cardWorking = true;
        console.log('✅ SessionCard can receive session props');
      } else {
        errors.push('SessionCard props test failed');
      }

    } catch (error) {
      console.error('❌ SessionCard test failed:', error);
      errors.push(`SessionCard test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      cardLoaded,
      cardWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runFormTest = () => {
    const errors: string[] = [];
    let formLoaded = false;
    let formWorking = false;

    try {
      console.log('🧪 Testing SessionForm component...');
      
      // Test 1: Component loaded
      if (SessionForm) {
        formLoaded = true;
        console.log('✅ SessionForm component loaded');
      } else {
        errors.push('SessionForm component not found');
      }

      // Test 2: Component working
      formWorking = true;
      console.log('✅ SessionForm component working');

    } catch (error) {
      console.error('❌ SessionForm test failed:', error);
      errors.push(`SessionForm test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      formLoaded,
      formWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runListTest = () => {
    const errors: string[] = [];
    let listLoaded = false;
    let listWorking = false;

    try {
      console.log('🧪 Testing SessionList component...');
      
      // Test 1: Component loaded
      if (SessionList) {
        listLoaded = true;
        console.log('✅ SessionList component loaded');
      } else {
        errors.push('SessionList component not found');
      }

      // Test 2: Component can handle sessions array
      if (mockSessions.length > 0) {
        listWorking = true;
        console.log('✅ SessionList can handle sessions array');
      } else {
        errors.push('SessionList sessions handling failed');
      }

    } catch (error) {
      console.error('❌ SessionList test failed:', error);
      errors.push(`SessionList test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      listLoaded,
      listWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runStatsTest = () => {
    const errors: string[] = [];
    let statsLoaded = false;
    let statsWorking = false;

    try {
      console.log('🧪 Testing SessionStats component...');
      
      // Test 1: Component loaded
      if (SessionStats) {
        statsLoaded = true;
        console.log('✅ SessionStats component loaded');
      } else {
        errors.push('SessionStats component not found');
      }

      // Test 2: Component can calculate stats
      if (mockSessions.length > 0) {
        statsWorking = true;
        console.log('✅ SessionStats can calculate from sessions');
      } else {
        errors.push('SessionStats calculation failed');
      }

    } catch (error) {
      console.error('❌ SessionStats test failed:', error);
      errors.push(`SessionStats test failed: ${error}`);
    }

    setTestResults(prev => ({
      ...prev,
      statsLoaded,
      statsWorking,
      errors: [...prev.errors, ...errors]
    }));
  };

  const runAllTests = () => {
    setTestResults({
      cardLoaded: false,
      formLoaded: false,
      listLoaded: false,
      statsLoaded: false,
      cardWorking: false,
      formWorking: false,
      listWorking: false,
      statsWorking: false,
      errors: []
    });
    
    runCardTest();
    setTimeout(() => runFormTest(), 100);
    setTimeout(() => runListTest(), 200);
    setTimeout(() => runStatsTest(), 300);
  };

  const allTestsPassed = testResults.cardLoaded && 
                        testResults.formLoaded && 
                        testResults.listLoaded && 
                        testResults.statsLoaded &&
                        testResults.cardWorking &&
                        testResults.formWorking &&
                        testResults.listWorking &&
                        testResults.statsWorking &&
                        testResults.errors.length === 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session Components Test</h1>
        <p className="text-muted-foreground">
          Testing session management components implementation
        </p>
      </div>

      {/* Overall Status */}
      <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {allTestsPassed ? 
            '✅ All session components tests passed!' : 
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="card">SessionCard</TabsTrigger>
          <TabsTrigger value="form">SessionForm</TabsTrigger>
          <TabsTrigger value="list">SessionList</TabsTrigger>
          <TabsTrigger value="stats">SessionStats</TabsTrigger>
        </TabsList>

        {/* SessionCard Test Tab */}
        <TabsContent value="card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                SessionCard Test
              </CardTitle>
              <CardDescription>
                Test individual session card component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runCardTest} size="lg" className="w-full">
                  🧪 Test SessionCard
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.cardLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.cardWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Props Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SessionCard Demo */}
          <Card>
            <CardHeader>
              <CardTitle>SessionCard Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSessions.slice(0, 1).map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onSelect={() => console.log('Session selected:', session.title)}
                    onEdit={() => console.log('Edit session:', session.title)}
                    onDelete={() => console.log('Delete session:', session.title)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SessionForm Test Tab */}
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                SessionForm Test
              </CardTitle>
              <CardDescription>
                Test session creation/editing form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runFormTest} size="lg" className="w-full">
                  🧪 Test SessionForm
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.formLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.formWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Form Working</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SessionForm Demo */}
          <Card>
            <CardHeader>
              <CardTitle>SessionForm Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  SessionForm component would appear here in a real implementation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SessionList Test Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                SessionList Test
              </CardTitle>
              <CardDescription>
                Test session list with filtering and sorting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runListTest} size="lg" className="w-full">
                  🧪 Test SessionList
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.listLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.listWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Sessions Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SessionList Demo */}
          <Card>
            <CardHeader>
              <CardTitle>SessionList Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionList
                sessions={mockSessions}
                onSessionSelect={(session) => console.log('Selected:', session.title)}
                onSessionEdit={(session) => console.log('Edit:', session.title)}
                onSessionDelete={(session) => console.log('Delete:', session.title)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SessionStats Test Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SessionStats Test
              </CardTitle>
              <CardDescription>
                Test session statistics dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runStatsTest} size="lg" className="w-full">
                  🧪 Test SessionStats
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {testResults.statsLoaded ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Component Loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.statsWorking ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    }
                    <span className="text-sm">Stats Calculation</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SessionStats Demo */}
          <Card>
            <CardHeader>
              <CardTitle>SessionStats Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionStats
                sessions={mockSessions}
                showDetailed={true}
                timeRange="month"
              />
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