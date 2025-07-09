// File: src/components/session/session-builder.tsx

/**
 * =================================================================
 * 🎯 SESSION BUILDER COMPONENT
 * =================================================================
 * Main session builder interface untuk instructor
 * Dual rendering pattern dengan drag & drop support
 * Following Arctic Siberia Import/Export Standard
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ FIXED: Framework imports
import { 
  useCallback,
  useEffect,
  useMemo,
  useState 
} from 'react';

// ✅ FIXED: UI Components menggunakan barrel imports dari index.ts
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ FIXED: Icons - grouped together dengan consistent naming
import {
  ChevronDown,
  Eye,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload
} from 'lucide-react';

// ✅ FIXED: External libraries - grouped together
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// ✅ FIXED: Local utilities & types
import { cn } from '@/lib/utils';
import useSessionCrud from './hooks/use-session-crud';
import useSessionReorder from './hooks/use-session-reorder';
import type {
  ContentAccessLevel,
  ContentType,
  CreateSessionFormData,
  Session,
  SessionBuilderConfig,
  SessionFilters,
  SessionMode,
  SessionSortOption
} from './types';

// ✅ FIXED: Constants & configs - separated from types
import {
  CONTENT_TYPE_DESCRIPTIONS,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS
} from './types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface SessionBuilderProps {
  courseId?: string;
  config?: Partial<SessionBuilderConfig>;
  onSessionChange?: (sessions: Session[]) => void;
  onSessionSelect?: (session: Session | null) => void;
  className?: string;
}

interface SessionCardProps {
  session: Session;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (session: Session) => void;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onDuplicate: (sessionId: string) => void;
  onPreview: (session: Session) => void;
}

interface CreateSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSessionFormData) => void;
  isLoading: boolean;
}

interface SessionFiltersProps {
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  sortBy: SessionSortOption;
  onSortChange: (sort: SessionSortOption) => void;
}

// =================================================================
// 🎯 DEFAULT CONFIGURATION
// =================================================================

const DEFAULT_CONFIG: SessionBuilderConfig = {
  mode: SessionMode.BUILDER,
  maxFreeContents: 3,
  allowedContentTypes: [
    ContentType.VIDEO,
    ContentType.QUIZ,
    ContentType.EXERCISE,
    ContentType.LIVE_SESSION,
    ContentType.DOCUMENT,
    ContentType.AUDIO
  ],
  features: {
    dragAndDrop: true,
    bulkOperations: true,
    contentPreview: true,
    statistics: true,
    publishing: true
  }
};

// =================================================================
// 🎯 SORTABLE SESSION CARD COMPONENT
// =================================================================

function SortableSessionCard({ session, index, isSelected, onSelect, onEdit, onDelete, onDuplicate, onPreview }: SessionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleCardClick = useCallback(() => {
    onSelect(session);
  }, [session, onSelect]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(session);
  }, [session, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(session.id);
  }, [session.id, onDelete]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(session.id);
  }, [session.id, onDuplicate]);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(session);
  }, [session, onPreview]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDragging && 'shadow-lg'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base font-medium line-clamp-1">
              {session.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {session.description || 'No description'}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Upload className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{session.totalContents} contents</span>
            <span>{session.estimatedDuration} min</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              session.accessLevel === ContentAccessLevel.FREE 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            )}>
              {session.accessLevel === ContentAccessLevel.FREE ? 'Free' : 'Premium'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs">#{session.order + 1}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 CREATE SESSION DIALOG COMPONENT
// =================================================================

function CreateSessionDialog({ isOpen, onClose, onSubmit, isLoading }: CreateSessionDialogProps) {
  const [formData, setFormData] = useState<CreateSessionFormData>({
    title: '',
    description: '',
    difficulty: 'BEGINNER',
    accessLevel: ContentAccessLevel.FREE,
    objectives: [],
    tags: []
  });

  const [objectiveInput, setObjectiveInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Session title is required');
      return;
    }
    
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleAddObjective = useCallback(() => {
    if (objectiveInput.trim() && !formData.objectives.includes(objectiveInput.trim())) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, objectiveInput.trim()]
      }));
      setObjectiveInput('');
    }
  }, [objectiveInput, formData.objectives]);

  const handleRemoveObjective = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  }, []);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        difficulty: 'BEGINNER',
        accessLevel: ContentAccessLevel.FREE,
        objectives: [],
        tags: []
      });
      setObjectiveInput('');
      setTagInput('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Add a new session to your course. Fill in the basic information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter session title..."
                required
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what students will learn in this session..."
                rows={3}
              />
            </div>
            
            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') =>
                    setFormData(prev => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="access">Access Level</Label>
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value: ContentAccessLevel) =>
                    setFormData(prev => ({ ...prev, accessLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentAccessLevel.FREE}>Free</SelectItem>
                    <SelectItem value={ContentAccessLevel.PREMIUM}>Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label>Learning Objectives</Label>
              <div className="flex gap-2">
                <Input
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  placeholder="Add learning objective..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                />
                <Button type="button" onClick={handleAddObjective} size="sm">
                  Add
                </Button>
              </div>
              {formData.objectives.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.objectives.map((objective, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {objective}
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =================================================================
// 🎯 SESSION FILTERS COMPONENT
// =================================================================

function SessionFilters({ filters, onFiltersChange, sortBy, onSortChange }: SessionFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      // In real implementation, this would trigger a search
      console.log('Search:', value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Select
          value={`${sortBy.field}-${sortBy.direction}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('-') as [any, 'asc' | 'desc'];
            onSortChange({ field, direction });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order-asc">Order (A-Z)</SelectItem>
            <SelectItem value="order-desc">Order (Z-A)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

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
  
  // Merge configuration
  const builderConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
    courseId,
    features: { ...DEFAULT_CONFIG.features, ...config?.features }
  }), [config, courseId]);
  
  // =================================================================
  // 🎯 HOOKS & STATE
  // =================================================================
  
  const {
    sessions,
    currentSession,
    isLoading,
    isCreating,
    isDeleting,
    error,
    createSession,
    updateSession,
    deleteSession,
    duplicateSession,
    fetchSessions,
    clearError
  } = useSessionCrud({
    courseId,
    onSessionChange,
    onError: (err) => toast.error(err)
  });
  
  const {
    isDragging,
    draggedSession,
    isProcessing: isReordering,
    DragDropProvider,
    reorderSessions,
    clearError: clearReorderError
  } = useSessionReorder({
    sessions,
    onReorder: (newSessions) => {
      onSessionChange?.(newSessions);
    },
    onReorderComplete: async (sessionIds) => {
      try {
        // In real implementation, this would call the reorder API
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      } catch {
        return false;
      }
    },
    disabled: isLoading || isReordering
  });
  
  // Local state
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<SessionFilters>({
    status: [],
    accessLevel: [],
    difficulty: [],
    categoryIds: [],
    tags: [],
    hasContents: false,
    isPublished: false
  });
  const [sortBy, setSortBy] = useState<SessionSortOption>({
    field: 'order',
    direction: 'asc'
  });
  
  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================
  
  const handleCreateSession = useCallback(async (data: CreateSessionFormData) => {
    const newSession = await createSession(data);
    if (newSession) {
      setIsCreateDialogOpen(false);
      setSelectedSession(newSession);
      onSessionSelect?.(newSession);
      toast.success('Session created successfully');
    }
  }, [createSession, onSessionSelect]);
  
  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session);
    onSessionSelect?.(session);
  }, [onSessionSelect]);
  
  const handleEditSession = useCallback((session: Session) => {
    setSelectedSession(session);
    onSessionSelect?.(session);
    // In real implementation, this would open an edit dialog or navigate to edit page
    console.log('Edit session:', session);
  }, [onSessionSelect]);
  
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      const success = await deleteSession(sessionId);
      if (success && selectedSession?.id === sessionId) {
        setSelectedSession(null);
        onSessionSelect?.(null);
      }
    }
  }, [deleteSession, selectedSession, onSessionSelect]);
  
  const handleDuplicateSession = useCallback(async (sessionId: string) => {
    const duplicated = await duplicateSession(sessionId);
    if (duplicated) {
      toast.success('Session duplicated successfully');
    }
  }, [duplicateSession]);
  
  const handlePreviewSession = useCallback((session: Session) => {
    // In real implementation, this would open session in preview mode
    console.log('Preview session:', session);
    toast.info('Preview feature coming soon');
  }, []);
  
  // =================================================================
  // 🎯 COMPUTED PROPERTIES
  // =================================================================
  
  const canCreateMore = useMemo(() => {
    if (!builderConfig.maxFreeContents) return true;
    const freeSessionsCount = sessions.filter(s => s.accessLevel === ContentAccessLevel.FREE).length;
    return freeSessionsCount < builderConfig.maxFreeContents;
  }, [sessions, builderConfig.maxFreeContents]);
  
  const hasError = error || false;
  
  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError, clearError]);
  
  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Session Builder</h2>
          <p className="text-muted-foreground">
            Create and organize your course sessions
          </p>
        </div>
        
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={!canCreateMore || isCreating}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Creating...' : 'Add Session'}
        </Button>
      </div>
      
      {/* Error Display */}
      {hasError && (
        <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              ×
            </Button>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <SessionFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Get started by creating your first session. You can add videos, quizzes, exercises and more.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DragDropProvider>
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <SortableSessionCard
                  key={session.id}
                  session={session}
                  index={index}
                  isSelected={selectedSession?.id === session.id}
                  isDragging={draggedSession?.id === session.id}
                  onSelect={handleSelectSession}
                  onEdit={handleEditSession}
                  onDelete={handleDeleteSession}
                  onDuplicate={handleDuplicateSession}
                  onPreview={handlePreviewSession}
                />
              ))}
            </div>
          </DragDropProvider>
        )}
      </div>
      
      {/* Stats Footer */}
      {sessions.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <span>{sessions.length} sessions total</span>
          <span>
            {sessions.filter(s => s.accessLevel === ContentAccessLevel.FREE).length} free, {' '}
            {sessions.filter(s => s.accessLevel === ContentAccessLevel.PREMIUM).length} premium
          </span>
        </div>
      )}
      
      {/* Create Session Dialog */}
      <CreateSessionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSession}
        isLoading={isCreating}
      />
    </div>
  );
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default SessionBuilder;

// ✅ PATTERN: Named exports untuk types dan sub-components
export type { 
  SessionBuilderProps,
  SessionCardProps,
  CreateSessionDialogProps,
  SessionFiltersProps
};

export {
  SortableSessionCard,
  CreateSessionDialog,
  SessionFilters
};