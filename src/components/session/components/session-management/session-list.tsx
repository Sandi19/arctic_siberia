// File: src/components/session/components/session-management/session-list.tsx

/**
 * =================================================================
 * 🎯 SESSION LIST COMPONENT
 * =================================================================
 * Advanced session list dengan filtering, sorting, dan bulk actions
 * Drag & drop reordering dengan virtualization support
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

// ✅ FIXED: UI Components dari barrel exports
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Copy,
  Download,
  Edit,
  Eye,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  X
} from 'lucide-react';

// ✅ FIXED: External libraries
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ✅ FIXED: Local utilities - session components dan types
import SessionCard from './session-card';
import useSessionReorder from '../../hooks/use-session-reorder';
import type {
  ContentAccessLevel,
  Session,
  SessionBulkOperation,
  SessionFilters,
  SessionSortOption,
  SessionStatus
} from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface SessionListProps {
  sessions: Session[];
  isLoading?: boolean;
  selectedSessionIds?: string[];
  viewMode?: 'grid' | 'list' | 'compact';
  showFilters?: boolean;
  showBulkActions?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  enableDragDrop?: boolean;
  enableSelection?: boolean;
  itemsPerPage?: number;
  className?: string;
  onSessionSelect?: (session: Session) => void;
  onSessionEdit?: (session: Session) => void;
  onSessionDelete?: (sessionId: string) => void;
  onSessionDuplicate?: (sessionId: string) => void;
  onSessionPreview?: (session: Session) => void;
  onSessionsReorder?: (sessionIds: string[]) => Promise<boolean>;
  onBulkAction?: (action: SessionBulkOperation) => Promise<boolean>;
  onSelectionChange?: (sessionIds: string[]) => void;
  onFiltersChange?: (filters: SessionFilters) => void;
  onSortChange?: (sort: SessionSortOption) => void;
}

interface SessionListFiltersProps {
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  sessionsCount: number;
}

interface SessionListToolbarProps {
  viewMode: 'grid' | 'list' | 'compact';
  onViewModeChange: (mode: 'grid' | 'list' | 'compact') => void;
  selectedCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SessionSortOption;
  onSortChange: (sort: SessionSortOption) => void;
  onBulkAction?: (action: SessionBulkOperation) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: SessionBulkOperation) => void;
  onClearSelection: () => void;
}

// =================================================================
// 🎯 BULK ACTIONS COMPONENT
// =================================================================

function BulkActions({ selectedCount, onBulkAction, onClearSelection }: BulkActionsProps) {
  const handleBulkAction = useCallback((type: SessionBulkOperation['type']) => {
    // In real implementation, selectedSessionIds would be passed
    onBulkAction({
      type,
      sessionIds: [], // Would be actual selected IDs
    });
  }, [onBulkAction]);

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} session{selectedCount > 1 ? 's' : ''} selected
      </span>
      
      <Separator orientation="vertical" className="h-4" />
      
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-1" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleBulkAction('PUBLISH')}>
              <Upload className="mr-2 h-4 w-4" />
              Publish All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('UNPUBLISH')}>
              <Download className="mr-2 h-4 w-4" />
              Unpublish All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('DUPLICATE')}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate All
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleBulkAction('DELETE')}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 SESSION LIST FILTERS COMPONENT
// =================================================================

function SessionListFilters({ filters, onFiltersChange, sessionsCount }: SessionListFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = useCallback(<K extends keyof SessionFilters>(
    key: K,
    value: SessionFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      status: [],
      accessLevel: [],
      difficulty: [],
      categoryIds: [],
      tags: [],
      hasContents: false,
      isPublished: false
    });
  }, [onFiltersChange]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.accessLevel.length > 0) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.hasContents) count++;
    if (filters.isPublished) count++;
    return count;
  }, [filters]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>Filter Sessions</SheetTitle>
          <SheetDescription>
            Filter {sessionsCount} sessions by various criteria
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="space-y-2">
              {Object.values(SessionStatus).map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={(checked) => {
                      const newStatus = checked
                        ? [...filters.status, status]
                        : filters.status.filter(s => s !== status);
                      updateFilter('status', newStatus);
                    }}
                  />
                  <label htmlFor={`status-${status}`} className="text-sm">
                    {status.replace('_', ' ').toLowerCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Access Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Access Level</label>
            <div className="space-y-2">
              {Object.values(ContentAccessLevel).map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`access-${level}`}
                    checked={filters.accessLevel.includes(level)}
                    onCheckedChange={(checked) => {
                      const newLevels = checked
                        ? [...filters.accessLevel, level]
                        : filters.accessLevel.filter(l => l !== level);
                      updateFilter('accessLevel', newLevels);
                    }}
                  />
                  <label htmlFor={`access-${level}`} className="text-sm">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Difficulty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="space-y-2">
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((difficulty) => (
                <div key={difficulty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${difficulty}`}
                    checked={filters.difficulty.includes(difficulty as any)}
                    onCheckedChange={(checked) => {
                      const newDifficulty = checked
                        ? [...filters.difficulty, difficulty as any]
                        : filters.difficulty.filter(d => d !== difficulty);
                      updateFilter('difficulty', newDifficulty);
                    }}
                  />
                  <label htmlFor={`difficulty-${difficulty}`} className="text-sm">
                    {difficulty}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-contents"
                  checked={filters.hasContents}
                  onCheckedChange={(checked) => updateFilter('hasContents', checked as boolean)}
                />
                <label htmlFor="has-contents" className="text-sm">
                  Has Contents
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-published"
                  checked={filters.isPublished}
                  onCheckedChange={(checked) => updateFilter('isPublished', checked as boolean)}
                />
                <label htmlFor="is-published" className="text-sm">
                  Published
                </label>
              </div>
            </div>
          </div>
          
          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// =================================================================
// 🎯 SESSION LIST TOOLBAR COMPONENT
// =================================================================

function SessionListToolbar({
  viewMode,
  onViewModeChange,
  selectedCount,
  totalCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onBulkAction,
  showFilters,
  onToggleFilters
}: SessionListToolbarProps) {

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      {/* Left Side - Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Right Side - Controls */}
      <div className="flex items-center gap-2">
        {/* Sort */}
        <Select
          value={`${sortBy.field}-${sortBy.direction}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('-') as [any, 'asc' | 'desc'];
            onSortChange({ field, direction });
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order-asc">Order (A-Z)</SelectItem>
            <SelectItem value="order-desc">Order (Z-A)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
        
        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="px-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>
    </div>
  );
}

// =================================================================
// 🎯 LOADING SKELETON COMPONENT
// =================================================================

function SessionListSkeleton({ viewMode, count = 6 }: { viewMode: 'grid' | 'list' | 'compact'; count?: number }) {
  if (viewMode === 'compact') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-4 ml-4" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =================================================================
// 🎯 MAIN SESSION LIST COMPONENT
// =================================================================

function SessionList({
  sessions,
  isLoading = false,
  selectedSessionIds = [],
  viewMode = 'grid',
  showFilters = true,
  showBulkActions = true,
  showSearch = true,
  showSort = true,
  enableDragDrop = true,
  enableSelection = true,
  className,
  onSessionSelect,
  onSessionEdit,
  onSessionDelete,
  onSessionDuplicate,
  onSessionPreview,
  onSessionsReorder,
  onBulkAction,
  onSelectionChange,
  onFiltersChange,
  onSortChange
}: SessionListProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedSessionIds);
  
  // =================================================================
  // 🎯 DRAG & DROP SETUP
  // =================================================================
  
  const {
    DragDropProvider,
    isDragging,
    isProcessing: isReordering
  } = useSessionReorder({
    sessions,
    onReorder: (reorderedSessions) => {
      // Optimistic update handled by the hook
    },
    onReorderComplete: async (sessionIds) => {
      if (onSessionsReorder) {
        return await onSessionsReorder(sessionIds);
      }
      return true;
    },
    disabled: !enableDragDrop || isLoading
  });
  
  // =================================================================
  // 🎯 FILTERED & SORTED SESSIONS
  // =================================================================
  
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(query) ||
        session.description?.toLowerCase().includes(query) ||
        session.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(session => filters.status.includes(session.status));
    }
    
    if (filters.accessLevel.length > 0) {
      filtered = filtered.filter(session => filters.accessLevel.includes(session.accessLevel));
    }
    
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(session => filters.difficulty.includes(session.difficulty));
    }
    
    if (filters.hasContents) {
      filtered = filtered.filter(session => session.totalContents > 0);
    }
    
    if (filters.isPublished) {
      filtered = filtered.filter(session => session.isPublished);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'order':
        default:
          aValue = a.order;
          bValue = b.order;
          break;
      }
      
      if (sortBy.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [sessions, searchQuery, filters, sortBy]);
  
  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================
  
  const handleSelectionChange = useCallback((sessionIds: string[]) => {
    setLocalSelectedIds(sessionIds);
    onSelectionChange?.(sessionIds);
  }, [onSelectionChange]);
  
  const handleSelectAll = useCallback(() => {
    const allIds = filteredAndSortedSessions.map(s => s.id);
    handleSelectionChange(allIds);
  }, [filteredAndSortedSessions, handleSelectionChange]);
  
  const handleClearSelection = useCallback(() => {
    handleSelectionChange([]);
  }, [handleSelectionChange]);
  
  const handleFiltersChange = useCallback((newFilters: SessionFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);
  
  const handleSortChange = useCallback((newSort: SessionSortOption) => {
    setSortBy(newSort);
    onSortChange?.(newSort);
  }, [onSortChange]);
  
  const handleBulkAction = useCallback(async (action: SessionBulkOperation) => {
    if (onBulkAction) {
      const actionWithIds = {
        ...action,
        sessionIds: localSelectedIds
      };
      const success = await onBulkAction(actionWithIds);
      if (success) {
        handleClearSelection();
        toast.success(`Bulk ${action.type.toLowerCase()} completed`);
      }
    }
  }, [localSelectedIds, onBulkAction, handleClearSelection]);
  
  // =================================================================
  // 🎯 RENDER SESSIONS
  // =================================================================
  
  const renderSessions = useCallback(() => {
    if (isLoading) {
      return <SessionListSkeleton viewMode={currentViewMode} />;
    }
    
    if (filteredAndSortedSessions.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f)
                ? 'Try adjusting your search or filters to find more sessions.'
                : 'Get started by creating your first session.'
              }
            </p>
            {!searchQuery && !Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    
    const SessionListWrapper = enableDragDrop ? DragDropProvider : ({ children }: { children: React.ReactNode }) => <>{children}</>;
    
    return (
      <SessionListWrapper>
        <div className={cn(
          currentViewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
          currentViewMode === 'list' && 'space-y-3',
          currentViewMode === 'compact' && 'space-y-2'
        )}>
          {filteredAndSortedSessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              variant={currentViewMode === 'grid' ? 'default' : currentViewMode}
              showDragHandle={enableDragDrop}
              isSelected={localSelectedIds.includes(session.id)}
              onSelect={onSessionSelect}
              onEdit={onSessionEdit}
              onDelete={onSessionDelete}
              onDuplicate={onSessionDuplicate}
              onPreview={onSessionPreview}
            />
          ))}
        </div>
      </SessionListWrapper>
    );
  }, [
    isLoading,
    filteredAndSortedSessions,
    currentViewMode,
    enableDragDrop,
    localSelectedIds,
    searchQuery,
    filters,
    DragDropProvider,
    onSessionSelect,
    onSessionEdit,
    onSessionDelete,
    onSessionDuplicate,
    onSessionPreview
  ]);
  
  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  useEffect(() => {
    setLocalSelectedIds(selectedSessionIds);
  }, [selectedSessionIds]);
  
  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <SessionListToolbar
        viewMode={currentViewMode}
        onViewModeChange={setCurrentViewMode}
        selectedCount={localSelectedIds.length}
        totalCount={filteredAndSortedSessions.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onBulkAction={handleBulkAction}
        showFilters={showFiltersPanel}
        onToggleFilters={() => setShowFiltersPanel(!showFiltersPanel)}
      />
      
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2">
          <SessionListFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            sessionsCount={sessions.length}
          />
          
          {enableSelection && (
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All ({filteredAndSortedSessions.length})
              </Button>
              
              {localSelectedIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Bulk Actions */}
      {showBulkActions && localSelectedIds.length > 0 && (
        <BulkActions
          selectedCount={localSelectedIds.length}
          onBulkAction={handleBulkAction}
          onClearSelection={handleClearSelection}
        />
      )}
      
      {/* Session List */}
      <div className="relative">
        {isReordering && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            <div className="bg-background border rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span className="text-sm">Reordering sessions...</span>
              </div>
            </div>
          </div>
        )}
        
        {renderSessions()}
      </div>
      
      {/* Footer Stats */}
      {!isLoading && filteredAndSortedSessions.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-4">
            <span>
              Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
            </span>
            
            {localSelectedIds.length > 0 && (
              <span>
                {localSelectedIds.length} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span>
              {sessions.filter(s => s.accessLevel === ContentAccessLevel.FREE).length} free
            </span>
            <span>
              {sessions.filter(s => s.accessLevel === ContentAccessLevel.PREMIUM).length} premium
            </span>
            <span>
              {sessions.filter(s => s.isPublished).length} published
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// =================================================================
// 🎯 ADDITIONAL UTILITY HOOKS
// =================================================================

function useSessionListState() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);
  
  const selectAll = useCallback((sessionIds: string[]) => {
    setSelectedIds(sessionIds);
  }, []);
  
  const toggleSelection = useCallback((sessionId: string) => {
    setSelectedIds(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      accessLevel: [],
      difficulty: [],
      categoryIds: [],
      tags: [],
      hasContents: false,
      isPublished: false
    });
  }, []);
  
  return {
    selectedIds,
    setSelectedIds,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    clearSelection,
    selectAll,
    toggleSelection,
    clearFilters
  };
}

function useSessionListActions() {
  const handleEdit = useCallback((session: Session) => {
    console.log('Edit session:', session.id);
    toast.info('Edit functionality coming soon');
  }, []);
  
  const handleDelete = useCallback((sessionId: string) => {
    console.log('Delete session:', sessionId);
    toast.info('Delete functionality coming soon');
  }, []);
  
  const handleDuplicate = useCallback((sessionId: string) => {
    console.log('Duplicate session:', sessionId);
    toast.info('Duplicate functionality coming soon');
  }, []);
  
  const handlePreview = useCallback((session: Session) => {
    console.log('Preview session:', session.id);
    toast.info('Preview functionality coming soon');
  }, []);
  
  const handleBulkAction = useCallback(async (action: SessionBulkOperation) => {
    console.log('Bulk action:', action);
    toast.info(`Bulk ${action.type.toLowerCase()} functionality coming soon`);
    return true;
  }, []);
  
  const handleReorder = useCallback(async (sessionIds: string[]) => {
    console.log('Reorder sessions:', sessionIds);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast.success('Sessions reordered successfully');
    return true;
  }, []);
  
  return {
    handleEdit,
    handleDelete,
    handleDuplicate,
    handlePreview,
    handleBulkAction,
    handleReorder
  };
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default SessionList;

// ✅ PATTERN: Named exports untuk types dan utilities
export type { 
  SessionListProps,
  SessionListFiltersProps,
  SessionListToolbarProps,
  BulkActionsProps
};

export {
  BulkActions,
  SessionListFilters,
  SessionListToolbar,
  SessionListSkeleton,
  useSessionListState,
  useSessionListActions
};