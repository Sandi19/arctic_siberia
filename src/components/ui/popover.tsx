// File: src/components/ui/popover.tsx

/**
 * =================================================================
 * 🎯 POPOVER COMPONENT - FLOATING CONTENT CONTAINER
 * =================================================================
 * Complete popover component for floating content like calendars
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
// 🎯 POPOVER INTERFACES
// =================================================================

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  className?: string;
  children: React.ReactNode;
}

// =================================================================
// 🎯 POPOVER CONTEXT
// =================================================================

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerId: string;
  contentId: string;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within a Popover component');
  }
  return context;
};

// =================================================================
// 🎯 POPOVER ROOT COMPONENT
// =================================================================

const Popover = ({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    }
  }, [isControlled, onOpenChange]);

  const triggerId = React.useId();
  const contentId = React.useId();

  const contextValue = React.useMemo(() => ({
    open,
    onOpenChange: handleOpenChange,
    triggerId,
    contentId,
  }), [open, handleOpenChange, triggerId, contentId]);

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

// =================================================================
// 🎯 POPOVER TRIGGER COMPONENT
// =================================================================

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { open, onOpenChange, triggerId, contentId } = usePopover();

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onOpenChange(!open);
    }, [onClick, onOpenChange, open]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    }, [onOpenChange, open]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        id: triggerId,
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        'aria-controls': open ? contentId : undefined,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        ...props,
      } as any);
    }

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? contentId : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PopoverTrigger.displayName = 'PopoverTrigger';

// =================================================================
// 🎯 POPOVER CONTENT COMPONENT
// =================================================================

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({
    align = 'center',
    side = 'bottom',
    sideOffset = 4,
    alignOffset = 0,
    avoidCollisions = true,
    className,
    children,
    ...props
  }, ref) => {
    const { open, onOpenChange, triggerId, contentId } = usePopover();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!, []);

    // Handle click outside
    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        const trigger = document.getElementById(triggerId);
        const content = contentRef.current;

        if (
          content &&
          !content.contains(target) &&
          trigger &&
          !trigger.contains(target)
        ) {
          onOpenChange(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onOpenChange(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, onOpenChange, triggerId]);

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

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        id={contentId}
        role="dialog"
        aria-labelledby={triggerId}
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
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
      </div>
    );
  }
);

PopoverContent.displayName = 'PopoverContent';

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Main component sebagai default export
export default Popover;

// ✅ PATTERN: Named exports untuk sub-components
export {
  PopoverTrigger,
  PopoverContent,
  usePopover
};

// ✅ PATTERN: Named exports untuk types
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps
};