// File: src/components/session/components/session-management/session-list.tsx

/**
 * =================================================================
 * 🎯 SESSION LIST COMPONENT - SESSION MANAGEMENT
 * =================================================================
 * Comprehensive session list with filtering, sorting, and bulk operations
 * Perfect for session management in course builder
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Session Management
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

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Alert,
  AlertDescription,
  Separator
} from '@/components/ui';

// ✅ Icons
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Play,
  Pause,
  Plus,
  BookOpen,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { Session, SessionStatus, SessionDifficulty } from '../../types';

// ✅ Local components (relative imports)
import SessionCard from './session-card';

// =================================================================
// 🎯 INTERFACES
// =================================================================

export interface SessionListProps {
  sessions: Session[];
  selectedSessions?: string[];
  isLoading?: boolean;
  canReorder?: boolean;
  onSessionSelect?: (session: Session) => void;
  onSessionEdit?: (session: Session) => void;
  onSessionDelete?: (session: Session) => void;
  onSessionDuplicate?: (session: Session) => void;
  onSessionTogglePublish?: (session: Session) => void;
  onSessionPreview?: (session: Session) => void;
  onSessionsReorder?: (sessions: Session[]) => void;
  onBulkAction?: (action: BulkAction, sessionIds: string[]) => void;
  onCreateNew?: () => void;
  className?: string;
}

export interface SessionFilters {
  search: string;
  status: SessionStatus | 'ALL';
  difficulty: SessionDifficulty | 'ALL';
  accessLevel: 'ALL' | 'FREE' | 'PREMIUM';
  sortBy: 'order' | 'title' | 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
}

export type BulkAction = 'delete' | 'duplicate' | 'publish' | 'unpublish' | 'archive';

// =================================================================
// 🎯 BULK ACTIONS COMPONENT
// =================================================================

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: BulkAction) => void;
  onClearSelection: () => void;
}

function BulkActions({ selectedCount, onBulkAction, onClearSelection }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedCount} session{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onBulkAction('publish')}>
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('unpublish')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Unpublish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('duplicate')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onBulkAction('archive')}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onBulkAction('delete')}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 FILTERS COMPONENT
// =================================================================

interface FiltersProps {
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  sessionCount: number;
}

function Filters({ filters, onFiltersChange, sessionCount }: FiltersProps) {
  const updateFilter = useCallback(<K extends keyof SessionFilters>(
    key: K,
    value: SessionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sessions</CardTitle>
            <CardDescription>
              {sessionCount} session{sessionCount !== 1 ? 's' : ''} total
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search sessions..."
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Draft
                </div>
              </SelectItem>
              <SelectItem value="PUBLISHED">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Published
                </div>
              </SelectItem>
              <SelectItem value="ARCHIVED">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-gray-500" />
                  Archived
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select value={filters.difficulty} onValueChange={(value) => updateFilter('difficulty', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="BEGINNER">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  Beginner
                </div>
              </SelectItem>
              <SelectItem value="INTERMEDIATE">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Intermediate
                </div>
              </SelectItem>
              <SelectItem value="ADVANCED">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-red-500" />
                  Advanced
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Access Level Filter */}
          <Select value={filters.accessLevel} onValueChange={(value) => updateFilter('accessLevel', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Access</SelectItem>
              <SelectItem value="FREE">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Free
                </div>
              </SelectItem>
              <SelectItem value="PREMIUM">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Premium
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
            onFiltersChange({ ...filters, sortBy, sortOrder });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Order (1-9)
                </div>
              </SelectItem>
              <SelectItem value="order-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-4 w-4" />
                  Order (9-1)
                </div>
              </SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="created-desc">Newest First</SelectItem>
              <SelectItem value="created-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN SESSION LIST COMPONENT
// =================================================================

function SessionList({
  sessions,
  selectedSessions = [],
  isLoading = false,
  canReorder = true,
  onSessionSelect,
  onSessionEdit,
  onSessionDelete,
  onSessionDuplicate,
  onSessionTogglePublish,
  onSessionPreview,
  onSessionsReorder,
  onBulkAction,
  onCreateNew,
  className
}: SessionListProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [filters, setFilters] = useState<SessionFilters>({
    search: '',
    status: 'ALL',
    difficulty: 'ALL',
    accessLevel: 'ALL',
    sortBy: 'order',
    sortOrder: 'asc'
  });

  const [internalSelectedSessions, setInternalSelectedSessions] = useState<string[]>([]);
  const [draggedSession, setDraggedSession] = useState<Session | null>(null);

  const currentSelectedSessions = selectedSessions.length > 0 ? selectedSessions : internalSelectedSessions;

  // =================================================================
  // 🎯 FILTERED & SORTED SESSIONS
  // =================================================================

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = session.title.toLowerCase().includes(searchLower) ||
                             session.description?.toLowerCase().includes(searchLower) ||
                             session.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'ALL' && session.status !== filters.status) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty !== 'ALL' && session.difficulty !== filters.difficulty) {
        return false;
      }

      // Access level filter
      if (filters.accessLevel !== 'ALL') {
        const isSessionFree = session.accessLevel === 'FREE';
        if (filters.accessLevel === 'FREE' && !isSessionFree) return false;
        if (filters.accessLevel === 'PREMIUM' && isSessionFree) return false;
      }

      return true;
    });
  }, [sessions, filters]);

  const sortedSessions = useMemo(() => {
    const sorted = [...filteredSessions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'order':
          aValue = a.order;
          bValue = b.order;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updated':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredSessions, filters.sortBy, filters.sortOrder]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleSessionSelect = useCallback((session: Session) => {
    onSessionSelect?.(session);
  }, [onSessionSelect]);

  const handleCheckboxChange = useCallback((sessionId: string, checked: boolean) => {
    if (selectedSessions.length > 0) return; // External control

    setInternalSelectedSessions(prev => {
      if (checked) {
        return [...prev, sessionId];
      } else {
        return prev.filter(id => id !== sessionId);
      }
    });
  }, [selectedSessions.length]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (selectedSessions.length > 0) return; // External control

    if (checked) {
      setInternalSelectedSessions(sortedSessions.map(s => s.id));
    } else {
      setInternalSelectedSessions([]);
    }
  }, [sortedSessions, selectedSessions.length]);

  const handleBulkAction = useCallback((action: BulkAction) => {
    onBulkAction?.(action, currentSelectedSessions);
    setInternalSelectedSessions([]);
  }, [onBulkAction, currentSelectedSessions]);

  const handleClearSelection = useCallback(() => {
    setInternalSelectedSessions([]);
  }, []);

  // =================================================================
  // 🎯 DND HANDLERS
  // =================================================================

  const handleDragStart = useCallback((event: any) => {
    const session = sortedSessions.find(s => s.id === event.active.id);
    setDraggedSession(session || null);
  }, [sortedSessions]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    setDraggedSession(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortedSessions.findIndex(s => s.id === active.id);
    const newIndex = sortedSessions.findIndex(s => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Simple reorder (in real app, this would be more complex)
    const reorderedSessions = [...sortedSessions];
    const [movedSession] = reorderedSessions.splice(oldIndex, 1);
    reorderedSessions.splice(newIndex, 0, movedSession);

    // Update order values
    const updatedSessions = reorderedSessions.map((session, index) => ({
      ...session,
      order: index + 1
    }));

    onSessionsReorder?.(updatedSessions);
  }, [sortedSessions, onSessionsReorder]);

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
  // 🎯 COMPUTED VALUES
  // =================================================================

  const allSelected = currentSelectedSessions.length === sortedSessions.length && sortedSessions.length > 0;
  const someSelected = currentSelectedSessions.length > 0 && currentSelectedSessions.length < sortedSessions.length;

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Filters */}
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        sessionCount={sessions.length}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={currentSelectedSessions.length}
        onBulkAction={handleBulkAction}
        onClearSelection={handleClearSelection}
      />

      {/* Session List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sortedSessions.length > 0 && (
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                />
              )}
              <div>
                <h3 className="font-medium">
                  {filteredSessions.length} of {sessions.length} sessions
                </h3>
                {filters.search && (
                  <p className="text-sm text-gray-600">
                    Filtered by "{filters.search}"
                  </p>
                )}
              </div>
            </div>
            
            {onCreateNew && (
              <Button onClick={onCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sessions.length === 0 ? 'No sessions yet' : 'No sessions found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {sessions.length === 0 
                  ? 'Create your first session to start building your course'
                  : 'Try adjusting your filters to find the sessions you\'re looking for'
                }
              </p>
              {sessions.length === 0 && onCreateNew && (
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Session
                </Button>
              )}
            </div>
          ) : (
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedSessions.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={currentSelectedSessions.includes(session.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(session.id, !!checked)}
                      />
                      <div className="flex-1">
                        <SessionCard
                          session={session}
                          isSelected={currentSelectedSessions.includes(session.id)}
                          showDragHandle={canReorder}
                          onSelect={() => handleSessionSelect(session)}
                          onEdit={() => onSessionEdit?.(session)}
                          onDelete={() => onSessionDelete?.(session)}
                          onDuplicate={() => onSessionDuplicate?.(session)}
                          onTogglePublish={() => onSessionTogglePublish?.(session)}
                          onPreview={() => onSessionPreview?.(session)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay dropAnimation={dropAnimation}>
                {draggedSession ? (
                  <SessionCard
                    session={draggedSession}
                    isSelected={false}
                    showDragHandle={true}
                    isPreview={true}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================================
// 🎯 DEFAULT EXPORT (Arctic Siberia Standard)
// =================================================================

export default SessionList;