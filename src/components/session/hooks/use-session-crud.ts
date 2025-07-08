// File: src/components/session/hooks/use-session-crud.ts

/**
 * =================================================================
 * 🎯 USE SESSION CRUD HOOK
 * =================================================================
 * Custom hook untuk Session CRUD operations
 * Following Arctic Siberia Import/Export Standard
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ FIXED: Framework imports
import { 
  useCallback, 
  useEffect, 
  useRef, 
  useState 
} from 'react';

// ✅ FIXED: External libraries
import { toast } from 'sonner';

// ✅ FIXED: Local utilities - session types
import type {
  CreateSessionFormData,
  PaginatedSessionResponse,
  Session,
  SessionApiResponse,
  SessionBulkOperation,
  SessionFilters,
  SessionHookOptions,
  SessionSortOption,
  UpdateSessionFormData,
  ValidationError
} from '../types';

// =================================================================
// 🎯 HOOK CONFIGURATION
// =================================================================

interface UseSessionCrudProps {
  courseId?: string;
  options?: Partial<SessionHookOptions>;
  onSessionChange?: (sessions: Session[]) => void;
  onError?: (error: string) => void;
}

interface UseSessionCrudReturn {
  // Data
  sessions: Session[];
  currentSession: Session | null;
  totalSessions: number;
  
  // Loading States
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  
  // Error Handling
  error: string | null;
  validationErrors: ValidationError[];
  
  // CRUD Operations
  createSession: (data: CreateSessionFormData) => Promise<Session | null>;
  updateSession: (id: string, data: UpdateSessionFormData) => Promise<Session | null>;
  deleteSession: (id: string) => Promise<boolean>;
  duplicateSession: (id: string) => Promise<Session | null>;
  
  // Batch Operations
  bulkOperation: (operation: SessionBulkOperation) => Promise<boolean>;
  reorderSessions: (sessionIds: string[]) => Promise<boolean>;
  
  // Data Fetching
  fetchSessions: (filters?: SessionFilters, sort?: SessionSortOption) => Promise<void>;
  fetchSession: (id: string) => Promise<Session | null>;
  refreshSessions: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  clearCache: () => void;
  setCurrentSession: (session: Session | null) => void;
  
  // Computed Properties
  hasUnsavedChanges: boolean;
  canCreateMore: boolean;
}

// =================================================================
// 🎯 DEFAULT CONFIGURATION
// =================================================================

const DEFAULT_OPTIONS: SessionHookOptions = {
  autoFetch: true,
  refetchOnMount: true,
  refetchOnFocus: false,
  cacheTime: 10, // 10 minutes
  staleTime: 5, // 5 minutes
  retryCount: 3,
  retryDelay: 1000,
  optimisticUpdates: true,
  enableRealtime: false
};

// =================================================================
// 🎯 MAIN HOOK IMPLEMENTATION
// =================================================================

export default function useSessionCrud({
  courseId,
  options = {},
  onSessionChange,
  onError
}: UseSessionCrudProps = {}): UseSessionCrudReturn {
  
  // Merge options with defaults
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Cache and optimization
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasUnsavedChanges = useRef(false);
  
  // =================================================================
  // 🎯 API CLIENT FUNCTIONS
  // =================================================================
  
  const sessionApiClient = {
    async get(endpoint: string, params?: Record<string, any>) {
      const url = new URL(`/api/sessions${endpoint}`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(url.toString(), {
        signal: abortControllerRef.current?.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    
    async post(endpoint: string, data: any) {
      const response = await fetch(`/api/sessions${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: abortControllerRef.current?.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    
    async put(endpoint: string, data: any) {
      const response = await fetch(`/api/sessions${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: abortControllerRef.current?.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    
    async delete(endpoint: string) {
      const response = await fetch(`/api/sessions${endpoint}`, {
        method: 'DELETE',
        signal: abortControllerRef.current?.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    }
  };
  
  // =================================================================
  // 🎯 ERROR HANDLING
  // =================================================================
  
  const handleError = useCallback((err: any, context: string) => {
    console.error(`Session CRUD Error [${context}]:`, err);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (err.message?.includes('validation')) {
      errorMessage = 'Validation error occurred';
    } else if (err.message?.includes('network')) {
      errorMessage = 'Network error - please check your connection';
    } else if (err.message?.includes('401')) {
      errorMessage = 'Authentication required';
    } else if (err.message?.includes('403')) {
      errorMessage = 'Permission denied';
    } else if (err.message?.includes('404')) {
      errorMessage = 'Session not found';
    } else if (err.message?.includes('500')) {
      errorMessage = 'Server error - please try again later';
    }
    
    setError(errorMessage);
    onError?.(errorMessage);
    toast.error(errorMessage);
  }, [onError]);
  
  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors([]);
  }, []);
  
  // =================================================================
  // 🎯 CACHE MANAGEMENT
  // =================================================================
  
  const getCachedData = useCallback((key: string) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const isStale = cacheAge > (config.staleTime * 60 * 1000);
    const isExpired = cacheAge > (config.cacheTime * 60 * 1000);
    
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return { data: cached.data, isStale };
  }, [config.cacheTime, config.staleTime]);
  
  const setCachedData = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);
  
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);
  
  // =================================================================
  // 🎯 DATA FETCHING
  // =================================================================
  
  const fetchSessions = useCallback(async (
    filters?: SessionFilters,
    sort?: SessionSortOption
  ) => {
    try {
      setIsLoading(true);
      clearError();
      
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      // Check cache first
      const cacheKey = `sessions-${courseId || 'all'}-${JSON.stringify(filters)}-${JSON.stringify(sort)}`;
      const cached = getCachedData(cacheKey);
      
      if (cached && !cached.isStale) {
        setSessions(cached.data.sessions);
        setTotalSessions(cached.data.totalSessions);
        setIsLoading(false);
        return;
      }
      
      // Prepare API params
      const params: Record<string, any> = {};
      if (courseId) params.courseId = courseId;
      if (filters) params.filters = JSON.stringify(filters);
      if (sort) params.sort = JSON.stringify(sort);
      
      // Fetch from API
      const response: PaginatedSessionResponse = await sessionApiClient.get('', params);
      
      setSessions(response.sessions);
      setTotalSessions(response.pagination.totalItems);
      
      // Cache the result
      setCachedData(cacheKey, {
        sessions: response.sessions,
        totalSessions: response.pagination.totalItems
      });
      
      onSessionChange?.(response.sessions);
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleError(err, 'fetchSessions');
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, getCachedData, setCachedData, clearError, handleError, onSessionChange]);
  
  const fetchSession = useCallback(async (id: string): Promise<Session | null> => {
    try {
      // Check cache first
      const cacheKey = `session-${id}`;
      const cached = getCachedData(cacheKey);
      
      if (cached && !cached.isStale) {
        return cached.data;
      }
      
      const response: SessionApiResponse<Session> = await sessionApiClient.get(`/${id}`);
      
      if (response.success) {
        setCachedData(cacheKey, response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      handleError(err, 'fetchSession');
      return null;
    }
  }, [getCachedData, setCachedData, handleError]);
  
  const refreshSessions = useCallback(async () => {
    clearCache();
    await fetchSessions();
  }, [clearCache, fetchSessions]);
  
  // =================================================================
  // 🎯 CRUD OPERATIONS
  // =================================================================
  
  const createSession = useCallback(async (data: CreateSessionFormData): Promise<Session | null> => {
    try {
      setIsCreating(true);
      clearError();
      
      // Add courseId if provided
      const sessionData = {
        ...data,
        ...(courseId && { courseId })
      };
      
      const response: SessionApiResponse<Session> = await sessionApiClient.post('', sessionData);
      
      if (response.success) {
        const newSession = response.data;
        
        // Optimistic update
        if (config.optimisticUpdates) {
          setSessions(prev => [...prev, newSession]);
          setTotalSessions(prev => prev + 1);
        }
        
        // Clear cache and refetch
        clearCache();
        if (!config.optimisticUpdates) {
          await fetchSessions();
        }
        
        onSessionChange?.(sessions);
        toast.success('Session created successfully');
        
        return newSession;
      } else {
        if (response.errors) {
          setValidationErrors(response.errors);
        }
        throw new Error(response.message);
      }
    } catch (err: any) {
      handleError(err, 'createSession');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [courseId, config.optimisticUpdates, clearCache, fetchSessions, sessions, onSessionChange, clearError, handleError]);
  
  const updateSession = useCallback(async (
    id: string, 
    data: UpdateSessionFormData
  ): Promise<Session | null> => {
    try {
      setIsSaving(true);
      clearError();
      
      // Optimistic update
      let previousSessions: Session[] = [];
      if (config.optimisticUpdates) {
        previousSessions = [...sessions];
        setSessions(prev => prev.map(session => 
          session.id === id ? { ...session, ...data } : session
        ));
      }
      
      const response: SessionApiResponse<Session> = await sessionApiClient.put(`/${id}`, data);
      
      if (response.success) {
        const updatedSession = response.data;
        
        // Update sessions list
        setSessions(prev => prev.map(session =>
          session.id === id ? updatedSession : session
        ));
        
        // Update current session if it's the one being edited
        if (currentSession?.id === id) {
          setCurrentSession(updatedSession);
        }
        
        // Clear cache for this session
        cacheRef.current.delete(`session-${id}`);
        
        onSessionChange?.(sessions);
        toast.success('Session updated successfully');
        hasUnsavedChanges.current = false;
        
        return updatedSession;
      } else {
        // Revert optimistic update on failure
        if (config.optimisticUpdates) {
          setSessions(previousSessions);
        }
        
        if (response.errors) {
          setValidationErrors(response.errors);
        }
        throw new Error(response.message);
      }
    } catch (err: any) {
      handleError(err, 'updateSession');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [config.optimisticUpdates, sessions, currentSession, onSessionChange, clearError, handleError]);
  
  const deleteSession = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      clearError();
      
      // Find session for optimistic update
      const sessionToDelete = sessions.find(s => s.id === id);
      let previousSessions: Session[] = [];
      
      // Optimistic update
      if (config.optimisticUpdates && sessionToDelete) {
        previousSessions = [...sessions];
        setSessions(prev => prev.filter(session => session.id !== id));
        setTotalSessions(prev => prev - 1);
        
        if (currentSession?.id === id) {
          setCurrentSession(null);
        }
      }
      
      const response: SessionApiResponse<void> = await sessionApiClient.delete(`/${id}`);
      
      if (response.success) {
        // Confirm deletion if not using optimistic updates
        if (!config.optimisticUpdates) {
          setSessions(prev => prev.filter(session => session.id !== id));
          setTotalSessions(prev => prev - 1);
          
          if (currentSession?.id === id) {
            setCurrentSession(null);
          }
        }
        
        // Clear cache
        cacheRef.current.delete(`session-${id}`);
        
        onSessionChange?.(sessions.filter(s => s.id !== id));
        toast.success('Session deleted successfully');
        
        return true;
      } else {
        // Revert optimistic update on failure
        if (config.optimisticUpdates) {
          setSessions(previousSessions);
          setTotalSessions(prev => prev + 1);
        }
        
        throw new Error(response.message);
      }
    } catch (err: any) {
      handleError(err, 'deleteSession');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [config.optimisticUpdates, sessions, currentSession, onSessionChange, clearError, handleError]);
  
  const duplicateSession = useCallback(async (id: string): Promise<Session | null> => {
    try {
      setIsCreating(true);
      clearError();
      
      const response: SessionApiResponse<Session> = await sessionApiClient.post(`/${id}/duplicate`, {});
      
      if (response.success) {
        const duplicatedSession = response.data;
        
        // Add to sessions list
        setSessions(prev => [...prev, duplicatedSession]);
        setTotalSessions(prev => prev + 1);
        
        onSessionChange?.(sessions);
        toast.success('Session duplicated successfully');
        
        return duplicatedSession;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      handleError(err, 'duplicateSession');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [sessions, onSessionChange, clearError, handleError]);
  
  // =================================================================
  // 🎯 BULK OPERATIONS
  // =================================================================
  
  const bulkOperation = useCallback(async (operation: SessionBulkOperation): Promise<boolean> => {
    try {
      setIsSaving(true);
      clearError();
      
      const response: SessionApiResponse<Session[]> = await sessionApiClient.post('/bulk', operation);
      
      if (response.success) {
        // Refresh sessions after bulk operation
        await fetchSessions();
        
        toast.success(`Bulk ${operation.type.toLowerCase()} completed successfully`);
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      handleError(err, 'bulkOperation');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchSessions, clearError, handleError]);
  
  const reorderSessions = useCallback(async (sessionIds: string[]): Promise<boolean> => {
    try {
      const operation: SessionBulkOperation = {
        type: 'MOVE',
        sessionIds,
        newOrder: sessionIds.map((_, index) => index)
      };
      
      return await bulkOperation(operation);
    } catch (err: any) {
      handleError(err, 'reorderSessions');
      return false;
    }
  }, [bulkOperation, handleError]);
  
  // =================================================================
  // 🎯 EFFECTS
  // =================================================================
  
  // Auto-fetch on mount
  useEffect(() => {
    if (config.autoFetch && config.refetchOnMount) {
      fetchSessions();
    }
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [config.autoFetch, config.refetchOnMount, fetchSessions]);
  
  // Handle window focus refetch
  useEffect(() => {
    if (!config.refetchOnFocus) return;
    
    const handleFocus = () => {
      fetchSessions();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [config.refetchOnFocus, fetchSessions]);
  
  // =================================================================
  // 🎯 COMPUTED PROPERTIES
  // =================================================================
  
  const canCreateMore = sessions.length < 100; // Arbitrary limit
  
  // =================================================================
  // 🎯 RETURN HOOK INTERFACE
  // =================================================================
  
  return {
    // Data
    sessions,
    currentSession,
    totalSessions,
    
    // Loading States
    isLoading,
    isSaving,
    isDeleting,
    isCreating,
    
    // Error Handling
    error,
    validationErrors,
    
    // CRUD Operations
    createSession,
    updateSession,
    deleteSession,
    duplicateSession,
    
    // Batch Operations
    bulkOperation,
    reorderSessions,
    
    // Data Fetching
    fetchSessions,
    fetchSession,
    refreshSessions,
    
    // Utilities
    clearError,
    clearCache,
    setCurrentSession,
    
    // Computed Properties
    hasUnsavedChanges: hasUnsavedChanges.current,
    canCreateMore
  };
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main hook
export default useSessionCrud;

// ✅ PATTERN: Named exports untuk types dan utilities
export type { 
  UseSessionCrudProps,
  UseSessionCrudReturn
};