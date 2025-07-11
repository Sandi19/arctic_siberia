// File: src/components/ui/tooltip.tsx

/**
 * =================================================================
 * 🎯 TOOLTIP COMPONENT - HOVER INFORMATION DISPLAY
 * =================================================================
 * Complete tooltip component for hover information display
 * Following Arctic Siberia Component Pattern
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ Framework imports
import React from 'react';

// ✅ Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 TOOLTIP INTERFACES
// =================================================================

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

export interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  delayDuration?: number;
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  arrowPadding?: number;
  avoidCollisions?: boolean;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  className?: string;
  children: React.ReactNode;
}

// =================================================================
// 🎯 TOOLTIP CONTEXT
// =================================================================

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerId: string;
  contentId: string;
  delayDuration: number;
}

interface TooltipProviderContextValue {
  delayDuration: number;
  skipDelayDuration: number;
  disableHoverableContent: boolean;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);
const TooltipProviderContext = React.createContext<TooltipProviderContextValue>({
  delayDuration: 700,
  skipDelayDuration: 300,
  disableHoverableContent: false,
});

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a Tooltip component');
  }
  return context;
};

const useTooltipProvider = () => {
  return React.useContext(TooltipProviderContext);
};

// =================================================================
// 🎯 TOOLTIP PROVIDER COMPONENT
// =================================================================

const TooltipProvider = ({
  children,
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent = false,
}: TooltipProviderProps) => {
  const contextValue = React.useMemo(() => ({
    delayDuration,
    skipDelayDuration,
    disableHoverableContent,
  }), [delayDuration, skipDelayDuration, disableHoverableContent]);

  return (
    <TooltipProviderContext.Provider value={contextValue}>
      {children}
    </TooltipProviderContext.Provider>
  );
};

// =================================================================
// 🎯 TOOLTIP ROOT COMPONENT
// =================================================================

const Tooltip = ({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  delayDuration: customDelayDuration,
}: TooltipProps) => {
  const provider = useTooltipProvider();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [isPointerDown, setIsPointerDown] = React.useState(false);
  const delayTimerRef = React.useRef<NodeJS.Timeout>();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const delayDuration = customDelayDuration ?? provider.delayDuration;

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    }
  }, [isControlled, onOpenChange]);

  const openWithDelay = React.useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    delayTimerRef.current = setTimeout(() => {
      handleOpenChange(true);
    }, delayDuration);
  }, [handleOpenChange, delayDuration]);

  const closeImmediately = React.useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    handleOpenChange(false);
  }, [handleOpenChange]);

  React.useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  const triggerId = React.useId();
  const contentId = React.useId();

  const contextValue = React.useMemo(() => ({
    open,
    onOpenChange: handleOpenChange,
    triggerId,
    contentId,
    delayDuration,
    openWithDelay,
    closeImmediately,
    isPointerDown,
    setIsPointerDown,
  }), [open, handleOpenChange, triggerId, contentId, delayDuration, openWithDelay, closeImmediately, isPointerDown]);

  return (
    <TooltipContext.Provider value={contextValue as any}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

// =================================================================
// 🎯 TOOLTIP TRIGGER COMPONENT
// =================================================================

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild = false, children, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, ...props }, ref) => {
    const { 
      open, 
      triggerId, 
      contentId, 
      openWithDelay, 
      closeImmediately, 
      setIsPointerDown 
    } = useTooltip() as any;

    const handlePointerEnter = React.useCallback((event: React.PointerEvent) => {
      onPointerEnter?.(event);
      if (event.pointerType === 'touch') return;
      openWithDelay();
    }, [onPointerEnter, openWithDelay]);

    const handlePointerLeave = React.useCallback((event: React.PointerEvent) => {
      onPointerLeave?.(event);
      closeImmediately();
    }, [onPointerLeave, closeImmediately]);

    const handlePointerDown = React.useCallback((event: React.PointerEvent) => {
      onPointerDown?.(event);
      setIsPointerDown(true);
      closeImmediately();
    }, [onPointerDown, setIsPointerDown, closeImmediately]);

    const handleFocus = React.useCallback((event: React.FocusEvent) => {
      onFocus?.(event);
      openWithDelay();
    }, [onFocus, openWithDelay]);

    const handleBlur = React.useCallback((event: React.FocusEvent) => {
      onBlur?.(event);
      closeImmediately();
    }, [onBlur, closeImmediately]);

    React.useEffect(() => {
      const handlePointerUp = () => setIsPointerDown(false);
      document.addEventListener('pointerup', handlePointerUp);
      return () => document.removeEventListener('pointerup', handlePointerUp);
    }, [setIsPointerDown]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        id: triggerId,
        'aria-describedby': open ? contentId : undefined,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        onPointerDown: handlePointerDown,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ...props,
      } as any);
    }

    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        id={triggerId}
        aria-describedby={open ? contentId : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';

// =================================================================
// 🎯 TOOLTIP CONTENT COMPONENT
// =================================================================

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({
    side = 'top',
    align = 'center',
    sideOffset = 4,
    alignOffset = 0,
    className,
    children,
    ...props
  }, ref) => {
    const { open, contentId, closeImmediately } = useTooltip() as any;
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeImmediately();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closeImmediately]);

    // Calculate position classes
    const getPositionClasses = () => {
      const sideClasses = {
        top: 'bottom-full mb-1',
        bottom: 'top-full mt-1',
        left: 'right-full mr-1',
        right: 'left-full ml-1',
      };

      const alignClasses = {
        start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
        center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
        end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
      };

      return `${sideClasses[side]} ${alignClasses[align]}`;
    };

    if (!mounted || !open) return null;

    return (
      <div
        ref={ref}
        id={contentId}
        role="tooltip"
        className={cn(
          'absolute z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white',
          'animate-in fade-in-0 zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          getPositionClasses(),
          className
        )}
        style={{
          marginTop: side === 'bottom' ? sideOffset : undefined,
          marginBottom: side === 'top' ? sideOffset : undefined,
          marginLeft: side === 'right' ? sideOffset : undefined,
          marginRight: side === 'left' ? sideOffset : undefined,
        }}
        {...props}
      >
        {children}
        
        {/* Tooltip Arrow */}
        <div
          className={cn(
            'absolute h-2 w-2 rotate-45 bg-gray-900',
            side === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            side === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
            side === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
            side === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
          )}
        />
      </div>
    );
  }
);

TooltipContent.displayName = 'TooltipContent';

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Main component sebagai default export
export default Tooltip;

// ✅ PATTERN: Named exports untuk sub-components
export {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  useTooltip,
  useTooltipProvider
};

// ✅ PATTERN: Named exports untuk types
export type {
  TooltipProviderProps,
  TooltipProps,
  TooltipTriggerProps,
  TooltipContentProps
};