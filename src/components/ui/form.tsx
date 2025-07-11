// File: src/components/ui/form.tsx

/**
 * =================================================================
 * 🎯 FORM COMPONENT - REACT HOOK FORM INTEGRATION
 * =================================================================
 * Complete form component integration with React Hook Form
 * Following Arctic Siberia Component Pattern
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ Framework imports
import React from 'react';
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form';

// ✅ UI Components menggunakan barrel imports
import { Label } from '@/components/ui';

// ✅ Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 FORM INTERFACES
// =================================================================

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

export interface FormItemContextValue {
  id: string;
}

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends ControllerProps<TFieldValues, TName> {}

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  className?: string;
}

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

// =================================================================
// 🎯 CONTEXT PROVIDERS
// =================================================================

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

// =================================================================
// 🎯 FORM COMPONENT (MAIN)
// =================================================================

const Form = FormProvider;

// =================================================================
// 🎯 FORM FIELD COMPONENT
// =================================================================

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// =================================================================
// 🎯 FORM ITEM COMPONENT
// =================================================================

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

// =================================================================
// 🎯 FORM LABEL COMPONENT
// =================================================================

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        error && 'text-red-500',
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

// =================================================================
// 🎯 FORM CONTROL COMPONENT
// =================================================================

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          error && 'border-red-500',
          className
        )}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);
FormControl.displayName = 'FormControl';

// =================================================================
// 🎯 FORM DESCRIPTION COMPONENT
// =================================================================

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    );
  }
);
FormDescription.displayName = 'FormDescription';

// =================================================================
// 🎯 FORM MESSAGE COMPONENT
// =================================================================

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-sm font-medium text-red-500', className)}
        {...props}
      >
        {body}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

// =================================================================
// 🎯 FORM HOOK
// =================================================================

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Main component sebagai default export
export default Form;

// ✅ PATTERN: Named exports untuk sub-components dan utilities
export {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField
};

// ✅ PATTERN: Named exports untuk types
export type {
  FormProps,
  FormFieldProps,
  FormItemProps,
  FormLabelProps,
  FormControlProps,
  FormDescriptionProps,
  FormMessageProps,
  FormFieldContextValue,
  FormItemContextValue
};