// File: src/components/ui/checkbox.tsx

'use client'

import React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface CheckboxProps {
  checked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  value?: string
  'aria-describedby'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    className, 
    id, 
    name, 
    value,
    ...props 
  }, ref) => {
    
    // Event Handlers
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(checked !== true)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === ' ' || e.key === 'Enter') && !disabled && onCheckedChange) {
        e.preventDefault()
        onCheckedChange(checked !== true)
      }
    }

    // Computed values
    const isChecked = checked === true
    const isIndeterminate = checked === 'indeterminate'

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isIndeterminate ? 'mixed' : isChecked}
        aria-disabled={disabled}
        id={id}
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          
          // State styles
          isChecked && 'bg-blue-600 border-blue-600 text-white',
          isIndeterminate && 'bg-blue-600 border-blue-600 text-white',
          
          // Hover styles (when not disabled)
          !disabled && !isChecked && !isIndeterminate && 'hover:border-blue-400 hover:bg-blue-50',
          
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Check Icon */}
        {isChecked && (
          <Check 
            className="h-3 w-3" 
            strokeWidth={3}
          />
        )}
        
        {/* Indeterminate Icon */}
        {isIndeterminate && (
          <Minus 
            className="h-3 w-3" 
            strokeWidth={3}
          />
        )}
        
        {/* Hidden input for form compatibility */}
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => {}} // Controlled by button click
          className="sr-only"
          tabIndex={-1}
        />
      </button>
    )
  }
)

// Component Display Name
Checkbox.displayName = 'Checkbox'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default Checkbox
export { type CheckboxProps }