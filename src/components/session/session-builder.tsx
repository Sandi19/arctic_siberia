// File: src/components/session/session-builder.tsx

/**
 * =================================================================
 * 🎯 SESSION BUILDER COMPONENT - MAIN INSTRUCTOR INTERFACE
 * =================================================================
 * Advanced session builder with drag & drop, content management
 * Perfect for language learning course creation
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Step 2C
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useState, useCallback, useMemo } from 'react';

// ✅ External libraries - @dnd-kit
import {
  DndContext,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

// ✅ External libraries - form & validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Progress,
  Separator,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from '@/components/ui';

// ✅ Icons
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Play,
  Settings,
  BookOpen,
  Users,
  Clock,
  Star,
  Eye,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Video,
  FileText,
  Link,
  HelpCircle,
  Assignment
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { 
  SessionBuilderProps, 
  Session, 
  ContentType, 
  CreateSessionFormData,
  SessionBuilderConfig
} from './types';

// ✅ Local hooks (relative imports)
import { 
 useSessionCrud, 
 useSessionReorder, 
 SessionCard
} from '@/components/session';


// =================================================================
// 🎯 FORM VALIDATION SCHEMA
// =================================================================

const sessionFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  isFree: z.boolean().default(true),
  duration: z.number().min(1).max(300).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  objectives: z.array(z.string()).min(1, 'Add at least one objective'),
  tags: z.array(z.string()).optional().default([])
});

type SessionFormData = z.infer<typeof sessionFormSchema>;


// =================================================================
// 🎯 MAIN SESSION BUILDER COMPONENT
// =================================================================

function SessionBuilder({
  courseId,
  config,
  onSessionChange,
  onSessionSelect,
  className
}: SessionBuilderProps) {
  
  // =================================================================
  // 🎯 CONFIGURATION
  // =================================================================
  
  const builderConfig: SessionBuilderConfig = {
    mode: 'BUILDER',
    maxFreeContents: 3,
    allowedContentTypes: ['VIDEO', 'DOCUMENT', 'LIVE_SESSION', 'QUIZ', 'ASSIGNMENT'],
    features: {
      dragAndDrop: true,
      bulkOperations: true,
      contentPreview: true,
      statistics: true,
      publishing: true
    },
    ...config
  };

  // =================================================================
  // 🎯 HOOKS & STATE
  // =================================================================

  const {
    sessions,
    currentSession,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
    sessionStats,
    canCreateFreeSession,
    isLoading,
    isCreating,
    error
  } = useSessionCrud({
    courseId,
    onSessionChange,
    onError: (error) => toast.error(error)
  });

  const {
    dndContextProps,
    sortedSessions,
    dragOverlayItem,
    canReorder,
    isDragging
  } = useSessionReorder({
    sessions,
    onSessionsReorder: onSessionChange,
    onError: (error) => toast.error(error)
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('sessions');

  // =================================================================
  // 🎯 FORM MANAGEMENT
  // =================================================================

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      isFree: true,
      difficulty: 'BEGINNER',
      objectives: [],
      tags: []
    }
  });

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleCreateSession = useCallback(async (data: SessionFormData) => {
    const sessionData: CreateSessionFormData = {
      courseId: courseId || 'default-course',
      title: data.title,
      description: data.description,
      isFree: data.isFree,
      duration: data.duration,
      difficulty: data.difficulty,
      accessLevel: data.isFree ? 'FREE' : 'PREMIUM',
      objectives: data.objectives,
      tags: data.tags
    };

    const newSession = await createSession(sessionData);
    if (newSession) {
      setShowCreateDialog(false);
      form.reset();
      selectSession(newSession.id);
      onSessionSelect?.(newSession);
    }
  }, [courseId, createSession, form, selectSession, onSessionSelect]);

  const handleSelectSession = useCallback((session: Session) => {
    selectSession(session.id);
    onSessionSelect?.(session);
  }, [selectSession, onSessionSelect]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId);
    }
  }, [deleteSession]);

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================

  const canCreateSession = useMemo(() => {
    return !isCreating && (canCreateFreeSession || true); // Allow premium sessions
  }, [isCreating, canCreateFreeSession]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      
      {/* =================================================================
          🎯 HEADER SECTION
          ================================================================= */}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Builder</h2>
          <p className="text-gray-600 mt-1">
            Create and manage course sessions with rich content
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                disabled={!canCreateSession}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Add a new session to your course
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="e.g., Introduction to Russian Grammar"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Brief description of this session..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFree"
                    {...form.register('isFree')}
                  />
                  <Label htmlFor="isFree">Free Session</Label>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select onValueChange={(value) => form.setValue('difficulty', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Session'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* =================================================================
          🎯 STATS OVERVIEW
          ================================================================= */}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{sessionStats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">{sessionStats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free Sessions</p>
                <p className="text-2xl font-bold">{sessionStats.free}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold">{sessionStats.premium}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =================================================================
          🎯 MAIN CONTENT AREA
          ================================================================= */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Sessions
              </CardTitle>
              <CardDescription>
                Drag to reorder sessions. Click to select and edit content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first session to start building your course
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Session
                  </Button>
                </div>
              ) : (
                <DndContext {...dndContextProps}>
                  <SortableContext 
                    items={sortedSessions.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {sortedSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          isSelected={currentSession?.id === session.id}
                          onSelect={() => handleSelectSession(session)}
                          onEdit={() => {
                            selectSession(session.id);
                            setShowEditDialog(true);
                          }}
                          onDelete={() => handleDeleteSession(session.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  <DragOverlay dropAnimation={dropAnimation}>
                    {dragOverlayItem?.type === 'session' && dragOverlayItem.item ? (
                      <SessionCard
                        session={dragOverlayItem.item}
                        isSelected={false}
                        onSelect={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        isDragging={true}
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Details Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                {currentSession ? `Editing: ${currentSession.title}` : 'Select a session to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSession ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Content Overview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total items:</span>
                        <span>{currentSession.contents?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span>{currentSession.duration || 0} minutes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Access:</span>
                        <Badge variant={currentSession.isFree ? "secondary" : "default"}>
                          {currentSession.isFree ? 'Free' : 'Premium'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Session
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Session Settings
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Settings className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Select a session to view details and manage content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* =================================================================
          🎯 ERROR DISPLAY
          ================================================================= */}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// =================================================================
// 🎯 DEFAULT EXPORT (Arctic Siberia Standard)
// =================================================================

export default SessionBuilder;