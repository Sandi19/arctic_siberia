// File: src/components/quiz/shared/quiz-timer.tsx

/**
 * =================================================================
 * ⏱️ QUIZ TIMER COMPONENT
 * =================================================================
 * Timer countdown untuk quiz dengan multiple modes
 * Created: July 2025
 * Phase: 2 - Shared Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Card, CardContent,
  Button,
  Badge,
  Progress
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  Timer,
  StopCircle 
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizTimerProps {
  duration: number; // in seconds
  mode?: 'countdown' | 'stopwatch' | 'question';
  autoStart?: boolean;
  showControls?: boolean;
  showProgress?: boolean;
  compact?: boolean;
  warningTime?: number; // seconds when to show warning
  dangerTime?: number; // seconds when to show danger
  onTimeUp?: () => void;
  onTick?: (timeLeft: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  className?: string;
}

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  startTime: number;
  totalTime: number;
}

type TimerAction = 
  | { type: 'START'; payload: { startTime: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET'; payload: { duration: number } }
  | { type: 'TICK'; payload: { timeLeft: number } }
  | { type: 'FINISH' };

// =================================================================
// 🎯 TIMER REDUCER
// =================================================================

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
        isFinished: false,
        startTime: action.payload.startTime,
      };
    
    case 'PAUSE':
      return {
        ...state,
        isRunning: false,
        isPaused: true,
      };
    
    case 'RESUME':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      };
    
    case 'RESET':
      return {
        timeLeft: action.payload.duration,
        isRunning: false,
        isPaused: false,
        isFinished: false,
        startTime: 0,
        totalTime: action.payload.duration,
      };
    
    case 'TICK':
      return {
        ...state,
        timeLeft: action.payload.timeLeft,
      };
    
    case 'FINISH':
      return {
        ...state,
        isRunning: false,
        isPaused: false,
        isFinished: true,
        timeLeft: 0,
      };
    
    default:
      return state;
  }
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizTimer({
  duration,
  mode = 'countdown',
  autoStart = false,
  showControls = true,
  showProgress = true,
  compact = false,
  warningTime = 300, // 5 minutes
  dangerTime = 60, // 1 minute
  onTimeUp,
  onTick,
  onStart,
  onPause,
  onResume,
  onReset,
  className,
}: QuizTimerProps) {
  // =================================================================
  // 🔄 STATE MANAGEMENT
  // =================================================================

  const [state, dispatch] = React.useReducer(timerReducer, {
    timeLeft: duration,
    isRunning: false,
    isPaused: false,
    isFinished: false,
    startTime: 0,
    totalTime: duration,
  });

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // =================================================================
  // 🎯 TIMER LOGIC
  // =================================================================

  // Start timer
  const startTimer = React.useCallback(() => {
    if (state.isFinished) return;
    
    const now = Date.now();
    dispatch({ type: 'START', payload: { startTime: now } });
    onStart?.();
  }, [state.isFinished, onStart]);

  // Pause timer
  const pauseTimer = React.useCallback(() => {
    if (!state.isRunning) return;
    
    dispatch({ type: 'PAUSE' });
    onPause?.();
  }, [state.isRunning, onPause]);

  // Resume timer
  const resumeTimer = React.useCallback(() => {
    if (!state.isPaused) return;
    
    dispatch({ type: 'RESUME' });
    onResume?.();
  }, [state.isPaused, onResume]);

  // Reset timer
  const resetTimer = React.useCallback(() => {
    dispatch({ type: 'RESET', payload: { duration } });
    onReset?.();
  }, [duration, onReset]);

  // =================================================================
  // ⏰ TIMER EFFECT
  // =================================================================

  React.useEffect(() => {
    if (state.isRunning && !state.isFinished) {
      intervalRef.current = setInterval(() => {
        const newTimeLeft = mode === 'countdown' 
          ? Math.max(0, state.timeLeft - 1)
          : state.timeLeft + 1;
        
        dispatch({ type: 'TICK', payload: { timeLeft: newTimeLeft } });
        onTick?.(newTimeLeft);
        
        // Check if time is up (for countdown mode)
        if (mode === 'countdown' && newTimeLeft <= 0) {
          dispatch({ type: 'FINISH' });
          onTimeUp?.();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isFinished, state.timeLeft, mode, onTick, onTimeUp]);

  // Auto start
  React.useEffect(() => {
    if (autoStart && !state.isRunning && !state.isFinished) {
      startTimer();
    }
  }, [autoStart, state.isRunning, state.isFinished, startTimer]);

  // =================================================================
  // 🎨 FORMATTING & CALCULATIONS
  // =================================================================

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (state.isFinished) return 'text-gray-500';
    if (mode === 'countdown' && state.timeLeft <= dangerTime) return 'text-red-600';
    if (mode === 'countdown' && state.timeLeft <= warningTime) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getTimerStatus = (): string => {
    if (state.isFinished) return 'finished';
    if (mode === 'countdown' && state.timeLeft <= dangerTime) return 'danger';
    if (mode === 'countdown' && state.timeLeft <= warningTime) return 'warning';
    return 'normal';
  };

  const progressPercentage = mode === 'countdown' 
    ? Math.round(((duration - state.timeLeft) / duration) * 100)
    : Math.min(100, Math.round((state.timeLeft / duration) * 100));

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderTimerDisplay = () => {
    const timerStatus = getTimerStatus();
    const timerColor = getTimerColor();
    
    return (
      <div className={cn(
        'flex items-center justify-center space-x-2 text-3xl font-mono font-bold transition-colors duration-300',
        timerColor
      )}>
        <Timer className={cn(
          'w-6 h-6',
          state.isRunning && 'animate-pulse'
        )} />
        <span>{formatTime(state.timeLeft)}</span>
        
        {timerStatus === 'danger' && (
          <AlertTriangle className="w-6 h-6 text-red-600 animate-bounce" />
        )}
      </div>
    );
  };

  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        {!state.isRunning && !state.isPaused && (
          <Button 
            onClick={startTimer}
            disabled={state.isFinished}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </Button>
        )}
        
        {state.isRunning && (
          <Button 
            onClick={pauseTimer}
            size="sm"
            variant="outline"
            className="flex items-center space-x-1"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </Button>
        )}
        
        {state.isPaused && (
          <Button 
            onClick={resumeTimer}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Play className="w-4 h-4" />
            <span>Resume</span>
          </Button>
        )}
        
        <Button 
          onClick={resetTimer}
          size="sm"
          variant="outline"
          className="flex items-center space-x-1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </Button>
      </div>
    );
  };

  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
      </div>
    );
  };

  const renderStatusBadge = () => {
    const timerStatus = getTimerStatus();
    
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    let text = 'Running';
    
    if (state.isFinished) {
      variant = 'secondary';
      text = 'Finished';
    } else if (state.isPaused) {
      variant = 'outline';
      text = 'Paused';
    } else if (timerStatus === 'danger') {
      variant = 'destructive';
      text = 'Time Running Out!';
    } else if (timerStatus === 'warning') {
      variant = 'outline';
      text = 'Warning';
    }
    
    return (
      <Badge variant={variant} className="mb-2">
        {text}
      </Badge>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  if (compact) {
    return (
      <div className={cn(
        'flex items-center space-x-2 p-2 rounded-lg border',
        getTimerStatus() === 'danger' && 'border-red-300 bg-red-50',
        getTimerStatus() === 'warning' && 'border-yellow-300 bg-yellow-50',
        className
      )}>
        <Clock className="w-4 h-4 text-gray-600" />
        <span className={cn(
          'text-sm font-mono font-medium',
          getTimerColor()
        )}>
          {formatTime(state.timeLeft)}
        </span>
        
        {state.isRunning && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      'w-full transition-all duration-300',
      getTimerStatus() === 'danger' && 'border-red-300 shadow-red-100',
      getTimerStatus() === 'warning' && 'border-yellow-300 shadow-yellow-100',
      className
    )}>
      <CardContent className="p-6 text-center">
        {/* Status Badge */}
        <div className="flex justify-center mb-4">
          {renderStatusBadge()}
        </div>
        
        {/* Timer Display */}
        {renderTimerDisplay()}
        
        {/* Mode Info */}
        <div className="mt-2 text-sm text-gray-600">
          {mode === 'countdown' ? 'Time Remaining' : 'Time Elapsed'}
        </div>
        
        {/* Progress */}
        {renderProgress()}
        
        {/* Controls */}
        {renderControls()}
        
        {/* Additional Info */}
        <div className="mt-4 text-xs text-gray-500">
          {mode === 'countdown' ? (
            <>Started with {formatTime(duration)}</>
          ) : (
            <>Elapsed: {formatTime(state.timeLeft)}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useQuizTimer(duration: number, autoStart = false) {
  const [timeLeft, setTimeLeft] = React.useState(duration);
  const [isRunning, setIsRunning] = React.useState(autoStart);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isFinished, setIsFinished] = React.useState(false);

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const start = React.useCallback(() => {
    if (isFinished) return;
    setIsRunning(true);
    setIsPaused(false);
  }, [isFinished]);

  const pause = React.useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resume = React.useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const reset = React.useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
  }, [duration]);

  React.useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime <= 0) {
            setIsFinished(true);
            setIsRunning(false);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isFinished]);

  const progress = Math.round(((duration - timeLeft) / duration) * 100);

  return {
    timeLeft,
    isRunning,
    isPaused,
    isFinished,
    progress,
    start,
    pause,
    resume,
    reset,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuizTimer
export { useQuizTimer, type QuizTimerProps, type TimerState }