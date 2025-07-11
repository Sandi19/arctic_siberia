// File: src/components/ui/calendar.tsx

/**
 * =================================================================
 * 🎯 CALENDAR COMPONENT - DATE PICKER IMPLEMENTATION
 * =================================================================
 * Complete calendar component for date selection
 * Following Arctic Siberia Component Pattern
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ Framework imports
import React from 'react';

// ✅ UI Components menggunakan barrel imports
import { Button } from '@/components/ui';

// ✅ Icons
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ✅ Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 CALENDAR INTERFACES
// =================================================================

export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | { from?: Date; to?: Date };
  onSelect?: (date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  defaultMonth?: Date;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
  classNames?: {
    months?: string;
    month?: string;
    caption?: string;
    caption_label?: string;
    nav?: string;
    nav_button?: string;
    nav_button_previous?: string;
    nav_button_next?: string;
    table?: string;
    head_row?: string;
    head_cell?: string;
    row?: string;
    cell?: string;
    day?: string;
    day_selected?: string;
    day_today?: string;
    day_outside?: string;
    day_disabled?: string;
    day_range_middle?: string;
    day_hidden?: string;
  };
}

// =================================================================
// 🎯 CALENDAR UTILITIES
// =================================================================

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

// =================================================================
// 🎯 CALENDAR COMPONENT
// =================================================================

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({
    mode = 'single',
    selected,
    onSelect,
    disabled,
    initialFocus = false,
    defaultMonth,
    fromDate,
    toDate,
    className,
    classNames,
    ...props
  }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(() => {
      if (defaultMonth) return defaultMonth;
      if (selected && selected instanceof Date) return selected;
      return new Date();
    });

    const [focusedDate, setFocusedDate] = React.useState<Date | null>(null);

    // Generate calendar days
    const generateCalendarDays = React.useMemo(() => {
      const daysInMonth = getDaysInMonth(currentMonth);
      const firstDay = getFirstDayOfMonth(currentMonth);
      const days: (Date | null)[] = [];

      // Add empty cells for days before the first day of month
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }

      // Add days of current month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      }

      return days;
    }, [currentMonth]);

    // Handle date selection
    const handleDateSelect = React.useCallback((date: Date) => {
      if (disabled && disabled(date)) return;

      if (mode === 'single') {
        onSelect?.(date);
      } else if (mode === 'multiple') {
        const currentSelected = (selected as Date[]) || [];
        const dateExists = currentSelected.some(d => isSameDay(d, date));
        
        if (dateExists) {
          onSelect?.(currentSelected.filter(d => !isSameDay(d, date)));
        } else {
          onSelect?.([...currentSelected, date]);
        }
      } else if (mode === 'range') {
        const currentRange = selected as { from?: Date; to?: Date } || {};
        
        if (!currentRange.from || (currentRange.from && currentRange.to)) {
          onSelect?.({ from: date, to: undefined });
        } else if (currentRange.from && !currentRange.to) {
          if (date < currentRange.from) {
            onSelect?.({ from: date, to: currentRange.from });
          } else {
            onSelect?.({ from: currentRange.from, to: date });
          }
        }
      }
    }, [mode, selected, onSelect, disabled]);

    // Check if date is selected
    const isSelected = React.useCallback((date: Date): boolean => {
      if (mode === 'single') {
        return selected instanceof Date && isSameDay(selected, date);
      } else if (mode === 'multiple') {
        return Array.isArray(selected) && selected.some(d => isSameDay(d, date));
      } else if (mode === 'range') {
        const range = selected as { from?: Date; to?: Date };
        if (!range?.from) return false;
        if (!range.to) return isSameDay(range.from, date);
        return date >= range.from && date <= range.to;
      }
      return false;
    }, [mode, selected]);

    // Navigation handlers
    const goToPreviousMonth = () => {
      setCurrentMonth(prev => addMonths(prev, -1));
    };

    const goToNextMonth = () => {
      setCurrentMonth(prev => addMonths(prev, 1));
    };

    // Keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleDateSelect(date);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('p-3 bg-white border border-gray-200 rounded-lg shadow-sm', className)}
        {...props}
      >
        {/* Calendar Header */}
        <div className={cn('flex items-center justify-between mb-4', classNames?.caption)}>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className={cn('h-8 w-8 p-0', classNames?.nav_button, classNames?.nav_button_previous)}
            disabled={fromDate && addMonths(currentMonth, -1) < fromDate}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className={cn('font-semibold text-sm', classNames?.caption_label)}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className={cn('h-8 w-8 p-0', classNames?.nav_button, classNames?.nav_button_next)}
            disabled={toDate && addMonths(currentMonth, 1) > toDate}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className={cn('w-full', classNames?.table)}>
          {/* Days of week header */}
          <div className={cn('grid grid-cols-7 mb-2', classNames?.head_row)}>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className={cn(
                  'text-center text-xs font-medium text-gray-500 py-2',
                  classNames?.head_cell
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={index}
                    className={cn('h-8 w-8', classNames?.cell)}
                  />
                );
              }

              const isDateSelected = isSelected(date);
              const isDateToday = isToday(date);
              const isDateDisabled = disabled ? disabled(date) : false;
              const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  onKeyDown={(e) => handleKeyDown(e, date)}
                  disabled={isDateDisabled}
                  className={cn(
                    'h-8 w-8 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    'hover:bg-gray-100',
                    isDateSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                    isDateToday && !isDateSelected && 'bg-blue-50 text-blue-600',
                    isDateDisabled && 'text-gray-300 cursor-not-allowed hover:bg-transparent',
                    isOutsideMonth && 'text-gray-400',
                    classNames?.cell,
                    classNames?.day,
                    isDateSelected && classNames?.day_selected,
                    isDateToday && classNames?.day_today,
                    isOutsideMonth && classNames?.day_outside,
                    isDateDisabled && classNames?.day_disabled
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Main component sebagai default export
export default Calendar;

// ✅ PATTERN: Named exports untuk types
export type { CalendarProps };