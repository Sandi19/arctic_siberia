// File: src/components/session/components/session-management/session-card.tsx

/**
 * =================================================================
 * 🎯 SESSION CARD COMPONENT
 * =================================================================
 * Reusable session card dengan drag & drop support
 * Actions menu dan status indicators
 * Following Arctic Siberia Import/Export Standard
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ FIXED: Framework imports
import { 
  useCallback,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import {
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Edit,
  Eye,
  GripVertical,
  Lock,
  MoreHorizontal,
  Play,
  Settings,
  Star,
  Trash2,
  Users
} from 'lucide-react';

// ✅ FIXED: External libraries
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ✅ FIXED: Local utilities - session types
import type {
  ContentAccessLevel,
  ContentType,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS,
  Session,
  SessionStatus
} from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface SessionCardProps {
  session: Session;
  variant?: 'default' | 'compact' | 'detailed';
  showDragHandle?: boolean;
  showActions?: boolean;
  showStats?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  className?: string;
  onSelect?: (session: Session) => void;
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
  onDuplicate?: (sessionId: string) => void;
  onPreview?: (session: Session) => void;
  onTogglePublish?: (sessionId: string) => void;
}

interface SessionCardActionsProps {
  session: Session;
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
  onDuplicate?: (sessionId: string) => void;
  onPreview?: (session: Session) => void;
  onTogglePublish?: (sessionId: string) => void;
}

interface SessionStatsProps {
  session: Session;
  variant?: 'default' | 'compact';
}

interface SessionStatusBadgeProps {
  status: SessionStatus;
  isPublished: boolean;
}

// =================================================================
// 🎯 SESSION ACTIONS COMPONENT
// =================================================================

function SessionCardActions({ 
  session, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onPreview, 
  onTogglePublish 
}: SessionCardActionsProps) {
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(session);
  }, [session, onEdit]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(session.id);
  }, [session.id, onDelete]);
  
  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(session.id);
  }, [session.id, onDuplicate]);
  
  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(session);
  }, [session, onPreview]);
  
  const handleTogglePublish = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePublish?.(session.id);
  }, [session.id, onTogglePublish]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open session actions</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Session Actions</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Session
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Session
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Session
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleTogglePublish}>
          {session.isPublished ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =================================================================
// 🎯 SESSION STATS COMPONENT
// =================================================================

function SessionStats({ session, variant = 'default' }: SessionStatsProps) {
  const stats = useMemo(() => [
    {
      icon: BookOpen,
      label: 'Contents',
      value: session.totalContents.toString(),
      tooltip: `${session.freeContentsCount} free, ${session.premiumContentsCount} premium`
    },
    {
      icon: Clock,
      label: 'Duration',
      value: `${session.estimatedDuration}m`,
      tooltip: `Estimated ${session.estimatedDuration} minutes`
    },
    {
      icon: Users,
      label: 'Completion',
      value: `${session.statistics?.completedStudents || 0}`,
      tooltip: `${session.statistics?.completedStudents || 0} students completed`
    }
  ], [session]);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {session.totalContents}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {session.estimatedDuration}m
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{stat.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

// =================================================================
// 🎯 SESSION STATUS BADGE COMPONENT
// =================================================================

function SessionStatusBadge({ status, isPublished }: SessionStatusBadgeProps) {
  const statusConfig = useMemo(() => {
    const configs = {
      [SessionStatus.DRAFT]: {
        label: 'Draft',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700'
      },
      [SessionStatus.IN_PROGRESS]: {
        label: 'In Progress',
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-700'
      },
      [SessionStatus.COMPLETED]: {
        label: 'Completed',
        variant: 'secondary' as const,
        className: 'bg-green-100 text-green-700'
      },
      [SessionStatus.ARCHIVED]: {
        label: 'Archived',
        variant: 'secondary' as const,
        className: 'bg-red-100 text-red-700'
      }
    };
    
    return configs[status] || configs[SessionStatus.DRAFT];
  }, [status]);
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
      
      {isPublished && (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Published
        </Badge>
      )}
    </div>
  );
}

// =================================================================
// 🎯 SORTABLE SESSION CARD COMPONENT
// =================================================================

function SortableSessionCard(props: SessionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging
  } = useSortable({ 
    id: props.session.id,
    disabled: !props.showDragHandle
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SessionCardContent
        {...props}
        isDragging={dndIsDragging || props.isDragging}
        dragHandleProps={props.showDragHandle ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

// =================================================================
// 🎯 SESSION CARD CONTENT COMPONENT
// =================================================================

interface SessionCardContentProps extends SessionCardProps {
  dragHandleProps?: any;
}

function SessionCardContent({
  session,
  variant = 'default',
  showDragHandle = true,
  showActions = true,
  showStats = true,
  isSelected = false,
  isDragging = false,
  className,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onTogglePublish,
  dragHandleProps
}: SessionCardContentProps) {
  
  const [isHovered, setIsHovered] = useState(false);
  
  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================
  
  const handleCardClick = useCallback(() => {
    onSelect?.(session);
  }, [session, onSelect]);
  
  // =================================================================
  // 🎯 COMPUTED PROPERTIES
  // =================================================================
  
  const contentTypeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    session.contents.forEach(content => {
      const type = CONTENT_TYPE_LABELS[content.type] || content.type;
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return breakdown;
  }, [session.contents]);
  
  const accessLevelColor = useMemo(() => {
    return session.accessLevel === ContentAccessLevel.FREE 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200';
  }, [session.accessLevel]);
  
  // =================================================================
  // 🎯 RENDER VARIANTS
  // =================================================================
  
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary ring-offset-2',
          isDragging && 'opacity-50 shadow-lg rotate-2',
          className
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {showDragHandle && (
                <button
                  {...dragHandleProps}
                  className={cn(
                    'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing',
                    isHovered && 'opacity-100'
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm line-clamp-1">{session.title}</h3>
                  <Badge className={cn('text-xs', accessLevelColor)}>
                    {session.accessLevel === ContentAccessLevel.FREE ? 'Free' : 'Premium'}
                  </Badge>
                </div>
                
                <SessionStats session={session} variant="compact" />
              </div>
            </div>
            
            {showActions && (
              <div className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity',
                isHovered && 'opacity-100'
              )}>
                <SessionCardActions
                  session={session}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onPreview={onPreview}
                  onTogglePublish={onTogglePublish}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary ring-offset-2',
          isDragging && 'opacity-50 shadow-lg rotate-1',
          className
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {showDragHandle && (
                <button
                  {...dragHandleProps}
                  className={cn(
                    'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1',
                    isHovered && 'opacity-100'
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{session.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {session.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  
                  {showActions && (
                    <div className={cn(
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      isHovered && 'opacity-100'
                    )}>
                      <SessionCardActions
                        session={session}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onPreview={onPreview}
                        onTogglePublish={onTogglePublish}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <SessionStatusBadge 
                    status={session.status} 
                    isPublished={session.isPublished} 
                  />
                  
                  <Badge className={cn('text-xs', accessLevelColor)}>
                    {session.accessLevel === ContentAccessLevel.FREE ? 'Free' : 'Premium'}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    Level: {session.difficulty}
                  </Badge>
                </div>
                
                {session.objectives.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Learning Objectives:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {session.objectives.slice(0, 3).map((objective, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{objective}</span>
                        </li>
                      ))}
                      {session.objectives.length > 3 && (
                        <li className="text-xs italic">
                          +{session.objectives.length - 3} more objectives
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {Object.keys(contentTypeBreakdown).length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Content Types:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(contentTypeBreakdown).map(([type, count]) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        {showStats && (
          <CardContent className="pt-0">
            <SessionStats session={session} />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
              <span>Created {format(session.createdAt, 'MMM dd, yyyy')}</span>
              <span>Updated {format(session.updatedAt, 'MMM dd, yyyy')}</span>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }
  
  // Default variant
  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDragging && 'opacity-50 shadow-lg',
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {showDragHandle && (
              <button
                {...dragHandleProps}
                className={cn(
                  'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1',
                  isHovered && 'opacity-100'
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base font-medium line-clamp-1">
                {session.title}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {session.description || 'No description'}
              </CardDescription>
              
              <div className="flex items-center gap-2 pt-1">
                <SessionStatusBadge 
                  status={session.status} 
                  isPublished={session.isPublished} 
                />
                
                <Badge className={cn('text-xs', accessLevelColor)}>
                  {session.accessLevel === ContentAccessLevel.FREE ? 'Free' : 'Premium'}
                </Badge>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isHovered && 'opacity-100'
            )}>
              <SessionCardActions
                session={session}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onPreview={onPreview}
                onTogglePublish={onTogglePublish}
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {session.totalContents} contents
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {session.estimatedDuration} min
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
// 🎯 MAIN SESSION CARD COMPONENT
// =================================================================

function SessionCard(props: SessionCardProps) {
  if (props.showDragHandle) {
    return <SortableSessionCard {...props} />;
  }
  
  return <SessionCardContent {...props} />;
}

// =================================================================
// 🎯 ADDITIONAL UTILITY HOOK
// =================================================================

function useSessionActions() {
  const handleEdit = useCallback((session: Session) => {
    console.log('Edit session:', session.id);
  }, []);
  
  const handleDelete = useCallback((sessionId: string) => {
    console.log('Delete session:', sessionId);
  }, []);
  
  const handleDuplicate = useCallback((sessionId: string) => {
    console.log('Duplicate session:', sessionId);
  }, []);
  
  const handlePreview = useCallback((session: Session) => {
    console.log('Preview session:', session.id);
  }, []);
  
  const handleTogglePublish = useCallback((sessionId: string) => {
    console.log('Toggle publish session:', sessionId);
  }, []);
  
  return {
    handleEdit,
    handleDelete,
    handleDuplicate,
    handlePreview,
    handleTogglePublish
  };
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default SessionCard;

// ✅ PATTERN: Named exports untuk types dan utilities
export type { 
  SessionCardProps,
  SessionCardActionsProps,
  SessionStatsProps,
  SessionStatusBadgeProps
};

export {
  SessionCardActions,
  SessionStats,
  SessionStatusBadge,
  useSessionActions
};