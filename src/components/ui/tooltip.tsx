'use client'

import React, { useState, useRef, useEffect } from 'react'

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui'

// Icons
import { Info } from 'lucide-react'

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function Tooltip({ children, content, side = 'top', className = '' }: {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-48 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg ${className} ${
            side === 'top' ? 'bottom-full mb-2' :
            side === 'right' ? 'left-full ml-2' :
            side === 'bottom' ? 'top-full mt-2' :
            'right-full mr-2'
          }`}
          style={{ minWidth: 'max-content' }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
Tooltip.displayName = 'Tooltip'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>
}

function TooltipContent({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>
}

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default Tooltip
export { TooltipTrigger, TooltipContent, TooltipProvider }