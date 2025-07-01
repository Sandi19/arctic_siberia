// File: src/components/ui/scroll-area.tsx

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          className
        )}
        {...props}
      >
        <div className="h-full w-full rounded-[inherit] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {children}
        </div>
      </div>
    )
  }
)
ScrollArea.displayName = 'ScrollArea'

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal'
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex touch-none select-none transition-colors',
          orientation === 'vertical' &&
            'h-full w-2.5 border-l border-l-transparent p-[1px]',
          orientation === 'horizontal' &&
            'h-2.5 w-full border-t border-t-transparent p-[1px]',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'relative rounded-full bg-gray-300',
            orientation === 'vertical' && 'flex-1',
            orientation === 'horizontal' && 'h-full'
          )}
        />
      </div>
    )
  }
)
ScrollBar.displayName = 'ScrollBar'

export default ScrollArea
export { ScrollBar }