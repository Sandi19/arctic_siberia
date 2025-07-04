// File: src/components/ui/radio-group.tsx

'use client'

import React, { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
}

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  name?: string
  children: React.ReactNode
  'aria-label'?: string
  'aria-labelledby'?: string
}

interface RadioGroupItemProps {
  value: string
  disabled?: boolean
  className?: string
  id?: string
  children?: React.ReactNode
  checked?: boolean
  onChange?: (checked: boolean) => void
}

// =================================================================
// 🎯 CONTEXT
// =================================================================

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)

const useRadioGroup = () => {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup')
  }
  return context
}

// =================================================================
// 🎯 RADIOGROUP COMPONENT
// =================================================================

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    value, 
    onValueChange, 
    disabled = false, 
    className, 
    name, 
    children,
    ...props 
  }, ref) => {
    
    const contextValue: RadioGroupContextValue = {
      value,
      onValueChange,
      disabled,
      name
    }

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          aria-disabled={disabled}
          className={cn(
            'grid gap-2',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

// =================================================================
// 🎯 RADIOGROUPITEM COMPONENT
// =================================================================

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ 
    value, 
    disabled, 
    className, 
    id, 
    children,
    checked: controlledChecked,
    onChange,
    ...props 
  }, ref) => {
    
    const { 
      value: groupValue, 
      onValueChange, 
      disabled: groupDisabled, 
      name 
    } = useRadioGroup()

    // Determine if this item is checked
    const isChecked = controlledChecked !== undefined 
      ? controlledChecked 
      : groupValue === value
    
    // Determine if this item is disabled
    const isDisabled = disabled || groupDisabled

    // Event Handlers
    const handleClick = () => {
      if (!isDisabled) {
        if (onChange) {
          onChange(true)
        }
        if (onValueChange && !isChecked) {
          onValueChange(value)
        }
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === ' ' || e.key === 'Enter') && !isDisabled) {
        e.preventDefault()
        handleClick()
      }
    }

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isChecked}
        aria-disabled={isDisabled}
        id={id}
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'aspect-square h-4 w-4 rounded-full border border-gray-300 ring-offset-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          'flex items-center justify-center',
          
          // State styles
          isChecked && 'border-blue-600 bg-blue-600',
          
          // Hover styles (when not disabled)
          !isDisabled && !isChecked && 'hover:border-blue-400 hover:bg-blue-50',
          
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Radio dot indicator */}
        {isChecked && (
          <div className="h-2 w-2 rounded-full bg-white" />
        )}
        
        {/* Hidden input for form compatibility */}
        <input
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => {}} // Controlled by button click
          className="sr-only"
          tabIndex={-1}
        />
        
        {children}
      </button>
    )
  }
)

RadioGroupItem.displayName = 'RadioGroupItem'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default RadioGroup
export { 
  RadioGroup, 
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps
}