// File: src/components/session/hooks/use-session-reorder.tsx

/**
 * =================================================================
 * 🎯 USE SESSION REORDER HOOK - MOCK IMPLEMENTATION
 * =================================================================
 * Mock implementation for session drag & drop reordering
 * Uses @dnd-kit for drag and drop functionality
 * Following Arctic Siberia Hook Pattern
 * Created: July 2025 - Step 2B
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useCallback, useMemo, useState } from 'react';

// ✅ External libraries - @dnd-kit
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement
} from '@dnd-kit/modifiers';

// ✅ Local types
import type {
  Session,
  UseSessionReorderReturn
} from '../types';

// =================================================================
// 🎯 HOOK INTERFACES
// =================================================================

interface UseSessionReorderProps {
  sessions: Session[];
  onReorder?: (reorderedSessions: Session[]) => void;
  onReorderComplete?: (sessionIds: string[]) => Promise<boolean>;
  disabled?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedSession: Session | null;
  draggedIndex: number | null;
  overId: string | null;
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const simulateApiCall = (ms: number = 500): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% success rate for demo purposes
      const success = Math.random() > 0.1;
      resolve(success);
    }, ms);
  });
};

const reorderArray = <T,>(array: T[], startIndex: number, endIndex: number): T[] => {
  return arrayMove(array, startIndex, endIndex);
};

// =================================================================
// 🎯 DRAG DROP PROVIDER COMPONENT
// =================================================================

interface DragDropProviderProps {
  children: React.ReactNode;
  sensors: any;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  disabled: boolean;
  sessions: Session[];
  draggedSession: Session | null;
}

function DragDropProvider({
  children,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
  disabled,
  sessions,
  draggedSession
}: DragDropProviderProps) {
  
  const sessionIds = useMemo(() => sessions.map(s => s.id), [sessions]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={sessionIds}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        {children}
      </SortableContext>
      
      <DragOverlay>
        {draggedSession ? (
          <div className="bg-background border rounded-lg p-4 shadow-lg opacity-90">
            <h3 className="font-medium">{draggedSession.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {draggedSession.totalContents} contents • {draggedSession.estimatedDuration} min
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// =================================================================
// 🎯 MAIN HOOK IMPLEMENTATION
// =================================================================

function useSessionReorder({
  sessions,
  onReorder,
  onReorderComplete,
  disabled = false
}: UseSessionReorderProps): UseSessionReorderReturn & {
  DragDropProvider: React.ComponentType<{ children: React.ReactNode }>;
} {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedSession: null,
    draggedIndex: null,
    overId: null
  });
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // =================================================================
  // 🎯 DND-KIT SENSORS
  // =================================================================
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement to start drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // =================================================================
  // 🎯 ERROR HANDLING
  // =================================================================
  
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('Session Reorder Error:', errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =================================================================
  // 🎯 DRAG HANDLERS
  // =================================================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const draggedSession = sessions.find(s => s.id === active.id);
    const draggedIndex = sessions.findIndex(s => s.id === active.id);
    
    if (draggedSession) {
      setDragState({
        isDragging: true,
        draggedSession,
        draggedIndex,
        overId: null
      });
      
      console.log('🔄 Drag started:', draggedSession.title);
    }
  }, [sessions]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    setDragState(prev => ({
      ...prev,
      overId: over?.id as string || null
    }));
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedSession: null,
      draggedIndex: null,
      overId: null
    });
    
    if (!over || active.id === over.id) {
      console.log('🔄 Drag cancelled or no change');
      return;
    }
    
    try {
      clearError();
      
      // Find indices
      const oldIndex = sessions.findIndex(s => s.id === active.id);
      const newIndex = sessions.findIndex(s => s.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        throw new Error('Invalid drag operation');
      }
      
      // Create reordered array
      const reorderedSessions = reorderArray(sessions, oldIndex, newIndex);
      
      // Update order property
      const updatedSessions = reorderedSessions.map((session, index) => ({
        ...session,
        order: index,
        updatedAt: new Date()
      }));
      
      // Optimistic update
      onReorder?.(updatedSessions);
      
      console.log('🔄 Sessions reordered:', {
        from: oldIndex,
        to: newIndex,
        draggedTitle: sessions[oldIndex]?.title
      });
      
      // API call simulation
      if (onReorderComplete) {
        setIsProcessing(true);
        
        const sessionIds = updatedSessions.map(s => s.id);
        const success = await onReorderComplete(sessionIds);
        
        if (!success) {
          // Revert on failure
          onReorder?.(sessions);
          throw new Error('Failed to save new order');
        }
        
        console.log('✅ Reorder saved successfully');
      }
      
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to reorder sessions');
      // Revert to original order on error
      onReorder?.(sessions);
    } finally {
      setIsProcessing(false);
    }
  }, [sessions, onReorder, onReorderComplete, handleError, clearError]);

  // =================================================================
  // 🎯 PROGRAMMATIC REORDER
  // =================================================================

  const reorderSessions = useCallback(async (startIndex: number, endIndex: number): Promise<void> => {
    try {
      clearError();
      setIsProcessing(true);
      
      if (startIndex < 0 || endIndex < 0 || startIndex >= sessions.length || endIndex >= sessions.length) {
        throw new Error('Invalid indices for reordering');
      }
      
      // Create reordered array
      const reorderedSessions = reorderArray(sessions, startIndex, endIndex);
      
      // Update order property
      const updatedSessions = reorderedSessions.map((session, index) => ({
        ...session,
        order: index,
        updatedAt: new Date()
      }));
      
      // Optimistic update
      onReorder?.(updatedSessions);
      
      // Simulate API call
      await simulateApiCall(300);
      
      console.log('✅ Programmatic reorder completed:', {
        from: startIndex,
        to: endIndex
      });
      
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to reorder sessions');
      onReorder?.(sessions); // Revert
    } finally {
      setIsProcessing(false);
    }
  }, [sessions, onReorder, handleError, clearError]);

  // =================================================================
  // 🎯 MEMOIZED DRAG DROP PROVIDER
  // =================================================================

  const MemoizedDragDropProvider = useMemo(() => {
    return function SessionDragDropProvider({ children }: { children: React.ReactNode }) {
      return (
        <DragDropProvider
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          disabled={disabled || isProcessing}
          sessions={sessions}
          draggedSession={dragState.draggedSession}
        >
          {children}
        </DragDropProvider>
      );
    };
  }, [
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    disabled,
    isProcessing,
    sessions,
    dragState.draggedSession
  ]);

  // =================================================================
  // 🎯 RETURN HOOK INTERFACE
  // =================================================================

  return {
    // Drag state
    isDragging: dragState.isDragging,
    draggedSession: dragState.draggedSession,
    isProcessing,
    
    // Actions
    reorderSessions,
    clearError,
    
    // Provider component
    DragDropProvider: MemoizedDragDropProvider
  };
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main hook
export default useSessionReorder;

// ✅ PATTERN: Named exports untuk utility functions
export {
  reorderArray,
  simulateApiCall
};