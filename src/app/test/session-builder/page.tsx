// File: src/app/test/session-builder/page.tsx

/**
 * =================================================================
 * 🎯 SESSION BUILDER TEST PAGE
 * =================================================================
 * Test page untuk semua 5 content builders
 * Using barrel exports dan Arctic Siberia standards
 * Created: July 2025 - Testing Phase
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useState } from 'react';

// ✅ UI Components menggunakan barrel imports
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Alert,
  AlertDescription,
  Separator
} from '@/components/ui';

// ✅ Icons
import {
  Video,
  FileText,
  Users,
  HelpCircle,
  Upload,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

// ✅ Session components menggunakan barrel imports
import { 
  VideoContentBuilder,
  QuizContentBuilder,
  DocumentContentBuilder,
  LiveSessionContentBuilder,
  AssignmentContentBuilder,
  type ContentAccessLevel,
  type ContentType
} from '@/components/session';

// ✅ Local utilities
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface TestResult {
  builder: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

interface BuilderTestProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  builder: React.ComponentType<any>;
}

// =================================================================
// 🎯 TEST PAGE COMPONENT
// =================================================================

export default function SessionBuilderTestPage() {
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [activeTab, setActiveTab] = useState<string>('video');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);

  // =================================================================
  // 🎯 BUILDER CONFIGURATIONS
  // =================================================================

  const builderConfigs: Record<string, BuilderTestProps> = {
    video: {
      title: 'Video Builder',
      description: 'YouTube URL integration with playback controls',
      icon: Video,
      color: 'text-red-600',
      builder: VideoContentBuilder
    },
    quiz: {
      title: 'Quiz Builder',
      description: 'Quiz system wrapper with question management',
      icon: HelpCircle,
      color: 'text-blue-600',
      builder: QuizContentBuilder
    },
    document: {
      title: 'Document Builder',
      description: 'File upload system for PDF, DOC, and text files',
      icon: FileText,
      color: 'text-green-600',
      builder: DocumentContentBuilder
    },
    'live-session': {
      title: 'Live Session Builder',
      description: 'Meeting link management with scheduling',
      icon: Users,
      color: 'text-purple-600',
      builder: LiveSessionContentBuilder
    },
    assignment: {
      title: 'Assignment Builder',
      description: 'Task creation with submission management',
      icon: Upload,
      color: 'text-orange-600',
      builder: AssignmentContentBuilder
    }
  };

  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================

  const handleBuilderSave = (builderType: string) => (data: any) => {
    console.log(`${builderType} Builder Data:`, data);
    
    const result: TestResult = {
      builder: builderType,
      status: 'success',
      message: `${builderType} content saved successfully!`,
      data: data
    };
    
    setTestResults(prev => [...prev, result]);
    toast.success(`${builderType} Builder: Content saved successfully!`);
  };

  const handleBuilderCancel = (builderType: string) => () => {
    console.log(`${builderType} Builder: Cancelled`);
    
    const result: TestResult = {
      builder: builderType,
      status: 'pending',
      message: `${builderType} content creation cancelled.`,
    };
    
    setTestResults(prev => [...prev, result]);
    toast.info(`${builderType} Builder: Cancelled`);
  };

  const handleClearResults = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };

  const handleToggleTestMode = () => {
    setIsTestMode(!isTestMode);
  };

  // =================================================================
  // 🎯 RENDER HELPERS
  // =================================================================

  const renderBuilderTab = (key: string, config: BuilderTestProps) => {
    const IconComponent = config.icon;
    const BuilderComponent = config.builder;
    
    return (
      <TabsContent key={key} value={key} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className={cn('h-5 w-5', config.color)} />
              {config.title} Test
            </CardTitle>
            <CardDescription>
              {config.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Builder Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Builder Status</p>
                    <p className="text-sm text-muted-foreground">
                      Ready for testing
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  Active
                </Badge>
              </div>

              {/* Test Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Instructions:</strong> Fill out the form below and click "Save" to test the builder. 
                  Check the console and Test Results section for output data.
                </AlertDescription>
              </Alert>

              {/* Builder Component */}
              <div className="border rounded-lg p-6">
                <BuilderComponent
                  onSave={handleBuilderSave(config.title)}
                  onCancel={handleBuilderCancel(config.title)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Session Builder Test Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing interface for all 5 content builders in the Arctic Siberia Session System
        </p>
        
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleToggleTestMode}
            variant={isTestMode ? 'default' : 'outline'}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isTestMode ? 'Test Mode: ON' : 'Test Mode: OFF'}
          </Button>
          
          {testResults.length > 0 && (
            <Button
              onClick={handleClearResults}
              variant="outline"
              size="sm"
            >
              Clear Results ({testResults.length})
            </Button>
          )}
        </div>
      </div>

      {/* Builder Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Builder Status Overview</CardTitle>
          <CardDescription>
            Status of all 5 content builders in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(builderConfigs).map(([key, config]) => {
              const IconComponent = config.icon;
              const testCount = testResults.filter(r => r.builder === config.title).length;
              
              return (
                <div 
                  key={key}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-colors',
                    activeTab === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => setActiveTab(key)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={cn('h-4 w-4', config.color)} />
                    <h3 className="font-medium text-sm">{config.title}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={activeTab === key ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      Ready
                    </Badge>
                    {testCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {testCount} tests
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Builder Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          {Object.entries(builderConfigs).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{config.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(builderConfigs).map(([key, config]) => 
          renderBuilderTab(key, config)
        )}
      </Tabs>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              Results from builder testing - check console for detailed data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : result.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{result.builder}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'outline'}
                      className={cn(
                        result.status === 'success' && 'bg-green-100 text-green-800',
                        result.status === 'error' && 'bg-red-100 text-red-800',
                        result.status === 'pending' && 'bg-yellow-100 text-yellow-800'
                      )}
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      {isTestMode && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Technical details for development and debugging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Import Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Badge variant="outline" className="text-green-600">
                    ✅ VideoContentBuilder
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    ✅ QuizContentBuilder
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    ✅ DocumentContentBuilder
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    ✅ LiveSessionContentBuilder
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    ✅ AssignmentContentBuilder
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Builder Configuration</h4>
                <div className="text-sm font-mono bg-muted p-4 rounded">
                  <pre>{JSON.stringify(
                    Object.keys(builderConfigs).reduce((acc, key) => {
                      acc[key] = {
                        title: builderConfigs[key].title,
                        description: builderConfigs[key].description,
                        status: 'loaded'
                      };
                      return acc;
                    }, {} as Record<string, any>),
                    null,
                    2
                  )}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}