// File: src/components/session/hooks/use-session-reorder.ts

/**
 * =================================================================
 * 🎯 USE SESSION REORDER HOOK
 * =================================================================
 * Custom hook untuk drag & drop session reordering
 * Menggunakan dnd-kit untuk smooth DnD experience
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

// ✅ FIXED: External libraries - dnd-kit
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges
} from '@dnd-kit/modifiers';

// ✅ FIXED: External libraries - toast
import { toast } from 'sonner';

// ✅ FIXED: Local utilities - session types
import type {
  Session,
  SessionEvent,
  DragDropItem,
  UseSessionReorderReturn
} from '../types';

// =================================================================
// 🎯 HOOK CONFIGURATION TYPES
// =================================================================

interface UseSessionReorderProps {
  sessions: Session[];
  onReorder: (sessions: Session[]) => void;
  onReorderComplete?: (sessionIds: string[]) => Promise<boolean>;
  disabled?: boolean;
  enableKeyboard?: boolean;
  restrictToContainer?: boolean;
  onDragStart?: (session: Session) => void;
  onDragEnd?: (result: ReorderResult) => void;
}

interface ReorderResult {
  success: boolean;
  originalOrder: Session[];
  newOrder: Session[];
  movedSession: Session;
  oldIndex: number;
  newIndex: number;
}

interface DragState {
  isDragging: boolean;
  draggedSession: Session | null;
  draggedIndex: number | null;
  overId: string | null;
}

// =================================================================
// 🎯 MAIN HOOK IMPLEMENTATION
// =================================================================

function useSessionReorder({
  sessions,
  onReorder,
  onReorderComplete,
  disabled = false,
  enableKeyboard = true,
  restrictToContainer = true,
  onDragStart,
  onDragEnd
}: UseSessionReorderProps): UseSessionReorderReturn {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedSession: null,
    draggedIndex: null,
    overId: null
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // =================================================================
  // 🎯 DND-KIT SENSORS CONFIGURATION
  // =================================================================
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    ...(enableKeyboard ? [
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    ] : [])
  );
  
  // =================================================================
  // 🎯 COMPUTED PROPERTIES
  // =================================================================
  
  const sessionIds = useMemo(() => 
    sessions.map(session => session.id), 
    [sessions]
  );
  
  const sortingStrategy = useMemo(() => 
    verticalListSortingStrategy, 
    []
  );
  
  const modifiers = useMemo(() => {
    const mods = [restrictToVerticalAxis];
    if (restrictToContainer) {
      mods.push(restrictToWindowEdges);
    }
    return mods;
  }, [restrictToContainer]);
  
  // =================================================================
  // 🎯 UTILITY FUNCTIONS
  // =================================================================
  
  const findSessionById = useCallback((id: string): Session | null => {
    return sessions.find(session => session.id === id) || null;
  }, [sessions]);
  
  const findSessionIndex = useCallback((id: string): number => {
    return sessions.findIndex(session => session.id === id);
  }, [sessions]);
  
  const createReorderResult = useCallback((
    oldIndex: number,
    newIndex: number,
    newOrder: Session[]
  ): ReorderResult => {
    return {
      success: true,
      originalOrder: [...sessions],
      newOrder,
      movedSession: sessions[oldIndex],
      oldIndex,
      newIndex
    };
  }, [sessions]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // =================================================================
  // 🎯 DRAG EVENT HANDLERS
  // =================================================================
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (disabled) return;
    
    const { active } = event;
    const sessionId = active.id as string;
    const session = findSessionById(sessionId);
    const sessionIndex = findSessionIndex(sessionId);
    
    if (!session) {
      console.warn(`Session not found for id: ${sessionId}`);
      return;
    }
    
    setDragState({
      isDragging: true,
      draggedSession: session,
      draggedIndex: sessionIndex,
      overId: null
    });
    
    // Clear any previous errors
    clearError();
    
    // Callback for external handling
    onDragStart?.(session);
    
    // Optional: Add visual feedback
    document.body.style.cursor = 'grabbing';
    
  }, [disabled, findSessionById, findSessionIndex, onDragStart, clearError]);
  
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (disabled) return;
    
    const { over } = event;
    
    setDragState(prev => ({
      ...prev,
      overId: over?.id as string || null
    }));
  }, [disabled]);
  
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset cursor
    document.body.style.cursor = '';
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedSession: null,
      draggedIndex: null,
      overId: null
    });
    
    if (disabled || !over || active.id === over.id) {
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const oldIndex = findSessionIndex(activeId);
    const newIndex = findSessionIndex(overId);
    
    if (oldIndex === -1 || newIndex === -1) {
      console.warn('Invalid session indices for reorder');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create new order using dnd-kit's arrayMove
      const newSessions = arrayMove(sessions, oldIndex, newIndex).map((session, index) => ({
        ...session,
        order: index
      }));
      
      // Optimistically update the order
      onReorder(newSessions);
      
      // Create result object
      const result = createReorderResult(oldIndex, newIndex, newSessions);
      
      // Persist to backend if handler provided
      if (onReorderComplete) {
        const sessionIds = newSessions.map(s => s.id);
        const success = await onReorderComplete(sessionIds);
        
        if (!success) {
          // Revert optimistic update on failure
          onReorder(sessions);
          setError('Failed to save new session order');
          toast.error('Failed to reorder sessions');
          
          // Update result with failure
          result.success = false;
        } else {
          toast.success('Sessions reordered successfully');
        }
        
        // Callback with result
        onDragEnd?.(result);
      } else {
        // No persistence, just callback
        onDragEnd?.(result);
        toast.success('Sessions reordered');
      }
      
    } catch (err: any) {
      console.error('Error during session reorder:', err);
      
      // Revert optimistic update
      onReorder(sessions);
      
      const errorMessage = err.message || 'Failed to reorder sessions';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Callback with error result
      onDragEnd?.({
        success: false,
        originalOrder: sessions,
        newOrder: sessions,
        movedSession: sessions[oldIndex],
        oldIndex,
        newIndex
      });
      
    } finally {
      setIsProcessing(false);
    }
  }, [
    disabled, 
    sessions, 
    findSessionIndex, 
    onReorder, 
    onReorderComplete, 
    createReorderResult, 
    onDragEnd
  ]);
  
  // =================================================================
  // 🎯 MANUAL REORDER FUNCTIONS
  // =================================================================
  
  const moveSession = useCallback(async (
    sessionId: string, 
    newIndex: number
  ): Promise<boolean> => {
    if (disabled || isProcessing) return false;
    
    const oldIndex = findSessionIndex(sessionId);
    if (oldIndex === -1 || oldIndex === newIndex) return false;
    
    try {
      setIsProcessing(true);
      clearError();
      
      const newSessions = arrayMove(sessions, oldIndex, newIndex).map((session, index) => ({
        ...session,
        order: index
      }));
      
      onReorder(newSessions);
      
      if (onReorderComplete) {
        const sessionIds = newSessions.map(s => s.id);
        const success = await onReorderComplete(sessionIds);
        
        if (!success) {
          onReorder(sessions);
          setError('Failed to save session position');
          return false;
        }
      }
      
      toast.success('Session moved successfully');
      return true;
      
    } catch (err: any) {
      console.error('Error moving session:', err);
      onReorder(sessions);
      setError(err.message || 'Failed to move session');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [
    disabled, 
    isProcessing, 
    sessions, 
    findSessionIndex, 
    onReorder, 
    onReorderComplete, 
    clearError
  ]);
  
  const moveSessionToTop = useCallback(async (sessionId: string): Promise<boolean> => {
    return moveSession(sessionId, 0);
  }, [moveSession]);
  
  const moveSessionToBottom = useCallback(async (sessionId: string): Promise<boolean> => {
    return moveSession(sessionId, sessions.length - 1);
  }, [moveSession, sessions.length]);
  
  const moveSessionUp = useCallback(async (sessionId: string): Promise<boolean> => {
    const currentIndex = findSessionIndex(sessionId);
    if (currentIndex <= 0) return false;
    return moveSession(sessionId, currentIndex - 1);
  }, [findSessionIndex, moveSession]);
  
  const moveSessionDown = useCallback(async (sessionId: string): Promise<boolean> => {
    const currentIndex = findSessionIndex(sessionId);
    if (currentIndex >= sessions.length - 1) return false;
    return moveSession(sessionId, currentIndex + 1);
  }, [findSessionIndex, moveSession, sessions.length]);
  
  // =================================================================
  // 🎯 BULK REORDER FUNCTIONS
  // =================================================================
  
  const reorderSessions = useCallback(async (newOrder: string[]): Promise<boolean> => {
    if (disabled || isProcessing) return false;
    
    try {
      setIsProcessing(true);
      clearError();
      
      // Validate new order
      if (newOrder.length !== sessions.length) {
        throw new Error('Invalid session order: length mismatch');
      }
      
      // Create new sessions array with updated order
      const newSessions = newOrder.map((sessionId, index) => {
        const session = findSessionById(sessionId);
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }
        return { ...session, order: index };
      });
      
      onReorder(newSessions);
      
      if (onReorderComplete) {
        const success = await onReorderComplete(newOrder);
        
        if (!success) {
          onReorder(sessions);
          setError('Failed to save session order');
          return false;
        }
      }
      
      toast.success('Sessions reordered successfully');
      return true;
      
    } catch (err: any) {
      console.error('Error reordering sessions:', err);
      onReorder(sessions);
      setError(err.message || 'Failed to reorder sessions');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [
    disabled, 
    isProcessing, 
    sessions, 
    findSessionById, 
    onReorder, 
    onReorderComplete, 
    clearError
  ]);
  
  // =================================================================
  // 🎯 DND CONTEXT WRAPPER
  // =================================================================
  
  const DragDropProvider = useCallback(({ children }: { children: React.ReactNode }) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sessionIds} strategy={sortingStrategy}>
        {children}
      </SortableContext>
      
      <DragOverlay>
        {dragState.draggedSession && (
          <div className="opacity-50">
            {/* Drag overlay content - will be provided by consumer */}
            {dragState.draggedSession.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  ), [
    sensors, 
    modifiers, 
    sessionIds, 
    sortingStrategy, 
    handleDragStart, 
    handleDragOver, 
    handleDragEnd, 
    dragState.draggedSession
  ]);
  
  // =================================================================
  // 🎯 RETURN HOOK INTERFACE
  // =================================================================
  
  return {
    // Drag state
    isDragging: dragState.isDragging,
    draggedSession: dragState.draggedSession,
    draggedIndex: dragState.draggedIndex,
    isProcessing,
    
    // Error handling
    error,
    clearError,
    
    // Manual reorder functions
    moveSession,
    moveSessionToTop,
    moveSessionToBottom,
    moveSessionUp,
    moveSessionDown,
    reorderSessions,
    
    // DnD provider
    DragDropProvider,
    
    // Utilities
    canMoveUp: (sessionId: string) => {
      const index = findSessionIndex(sessionId);
      return index > 0 && !disabled && !isProcessing;
    },
    canMoveDown: (sessionId: string) => {
      const index = findSessionIndex(sessionId);
      return index < sessions.length - 1 && !disabled && !isProcessing;
    },
    
    // Computed properties
    sessionIds,
    totalSessions: sessions.length,
    hasChanges: false // Could be implemented to track unsaved changes
  };
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export + Named exports
export default useSessionReorder;

// ✅ PATTERN: Named exports untuk types dan utilities
export { 
  type UseSessionReorderProps,
  type UseSessionReorderReturn,
  type ReorderResult,
  type DragState
};