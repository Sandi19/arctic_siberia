// File: src/components/session/components/session-management/session-card.tsx

/**
 * =================================================================
 * 🎯 SESSION CARD COMPONENT - SESSION MANAGEMENT
 * =================================================================
 * Individual session card with drag & drop, actions, and status
 * Perfect for session list management in course builder
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Session Management
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useMemo } from 'react';

// ✅ External libraries - @dnd-kit
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ✅ UI Components menggunakan barrel imports
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ Icons
import {
  GripVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Play,
  Pause,
  MoreVertical,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  Video,
  FileText,
  Link,
  HelpCircle,
  FileCheck
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { Session, ContentType } from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

export interface SessionCardProps {
  session: Session;
  isSelected?: boolean;
  isPreview?: boolean;
  showDragHandle?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onTogglePublish?: () => void;
  onPreview?: () => void;
  className?: string;
}

export interface SessionCardActionsProps {
  session: Session;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onTogglePublish?: () => void;
  onPreview?: () => void;
}

// =================================================================
// 🎯 SESSION CARD ACTIONS COMPONENT
// =================================================================

export function SessionCardActions({
  session,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublish,
  onPreview
}: SessionCardActionsProps) {
  
  const handleAction = useCallback((action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleAction(onEdit || (() => {}))}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Session
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAction(onPreview || (() => {}))}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAction(onDuplicate || (() => {}))}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAction(onTogglePublish || (() => {}))}>
          {session.status === 'PUBLISHED' ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Unpublish
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleAction(onDelete || (() => {}))}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =================================================================
// 🎯 MAIN SESSION CARD COMPONENT
// =================================================================

function SessionCard({
  session,
  isSelected = false,
  isPreview = false,
  showDragHandle = true,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublish,
  onPreview,
  className
}: SessionCardProps) {
  
  // =================================================================
  // 🎯 DND-KIT SORTABLE
  // =================================================================
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: session.id,
    data: {
      type: 'session',
      sessionId: session.id,
      itemId: session.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // =================================================================
  // 🎯 COMPUTED VALUES
  // =================================================================

  const contentTypeIcons = useMemo(() => ({
    VIDEO: Video,
    DOCUMENT: FileText,
    LIVE_SESSION: Link,
    QUIZ: HelpCircle,
    ASSIGNMENT: FileCheck
  }), []);

  const contentTypeCounts = useMemo(() => {
    const counts: Record<ContentType, number> = {
      VIDEO: 0,
      DOCUMENT: 0,
      LIVE_SESSION: 0,
      QUIZ: 0,
      ASSIGNMENT: 0
    };
    
    session.contents?.forEach(content => {
      counts[content.type]++;
    });
    
    return counts;
  }, [session.contents]);

  const sessionProgress = useMemo(() => {
    // Mock progress calculation
    const totalContents = session.contents?.length || 0;
    if (totalContents === 0) return 0;
    
    // Simulate some completed content
    const completedContents = Math.floor(totalContents * 0.6);
    return (completedContents / totalContents) * 100;
  }, [session.contents]);

  const statusConfig = useMemo(() => {
    switch (session.status) {
      case 'PUBLISHED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Published'
        };
      case 'DRAFT':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Draft'
        };
      case 'ARCHIVED':
        return {
          icon: EyeOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Archived'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Unknown'
        };
    }
  }, [session.status]);

  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleCardClick = useCallback(() => {
    if (!isDragging && onSelect) {
      onSelect();
    }
  }, [isDragging, onSelect]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  return (
    <TooltipProvider>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative",
          isDragging && "z-50 rotate-2 scale-105",
          className
        )}
      >
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
            isSelected && "ring-2 ring-blue-500 bg-blue-50 border-l-blue-500",
            !isSelected && session.isFree && "border-l-green-500",
            !isSelected && !session.isFree && "border-l-purple-500",
            isDragging && "opacity-50",
            isPreview && "pointer-events-none"
          )}
          onClick={handleCardClick}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Drag Handle */}
                {showDragHandle && !isPreview && (
                  <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing mt-1 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-medium truncate">
                      {session.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      #{session.order}
                    </Badge>
                  </div>
                  
                  <CardDescription className="text-xs line-clamp-2">
                    {session.description || 'No description provided'}
                  </CardDescription>
                </div>
              </div>
              
              {/* Status & Actions */}
              <div className="flex items-center gap-2 ml-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className={cn("p-1 rounded-full", statusConfig.bgColor)}>
                      <statusConfig.icon className={cn("h-3 w-3", statusConfig.color)} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {statusConfig.label}
                  </TooltipContent>
                </Tooltip>
                
                {!isPreview && (
                  <SessionCardActions
                    session={session}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onTogglePublish={onTogglePublish}
                    onPreview={onPreview}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Session Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{session.estimatedDuration || 0}m</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{session.contents?.length || 0} items</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{session.enrollmentCount || 0}</span>
              </div>
              {session.averageScore && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>{session.averageScore}%</span>
                </div>
              )}
            </div>

            {/* Content Types */}
            {session.contents && session.contents.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {Object.entries(contentTypeCounts).map(([type, count]) => {
                  if (count === 0) return null;
                  const Icon = contentTypeIcons[type as ContentType];
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
                          <Icon className="h-3 w-3" />
                          <span>{count}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {count} {type.toLowerCase().replace('_', ' ')} content(s)
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Progress & Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={session.isFree ? "secondary" : "default"} 
                  className="text-xs"
                >
                  {session.isFree ? 'Free' : 'Premium'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {session.difficulty}
                </Badge>
              </div>
              
              {sessionProgress > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {Math.round(sessionProgress)}%
                  </span>
                  <Progress value={sessionProgress} className="w-16 h-1" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// =================================================================
// 🎯 DEFAULT EXPORT (Arctic Siberia Standard)
// =================================================================

export default SessionCard;