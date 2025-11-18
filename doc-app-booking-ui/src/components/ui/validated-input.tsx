import React from 'react';
import { Input } from './input';
import { FieldError } from './field-error';
import { Label } from './label';
import { cn } from './utils';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  touched?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  onTouched?: () => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  touched,
  containerClassName,
  labelClassName,
  inputClassName,
  required,
  className,
  onChange,
  onTouched,
  onBlur,
  ...props
}) => {
  const hasError = touched && error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onTouched?.();
    onBlur?.(e);
  };

  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <Label 
          htmlFor={props.id}
          className={cn(
            'text-sm font-medium',
            hasError ? 'text-red-600' : '',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        className={cn(
          hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
          inputClassName,
          className
        )}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={hasError ? `${props.id}-error` : undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
      <FieldError 
        message={hasError ? error : undefined}
        className="min-h-[1.25rem]" // Reserve space even when no error
      />
    </div>
  );
};