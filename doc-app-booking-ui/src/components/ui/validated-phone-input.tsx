import React from 'react';
import { PhoneInput } from './phone-input';
import { FieldError } from './field-error';
import { Label } from './label';
import { cn } from './utils';

interface ValidatedPhoneInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onTouched?: () => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ValidatedPhoneInput: React.FC<ValidatedPhoneInputProps> = ({
  label,
  error,
  touched,
  containerClassName,
  labelClassName,
  inputClassName,
  required,
  value,
  onChange,
  onTouched,
  id,
  placeholder,
  disabled
}) => {
  const hasError = touched && error;

  // Handle change and trigger touched state
  const handleChange = (value: string) => {
    onChange(value);
    onTouched?.();
  };

  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <Label 
          htmlFor={id}
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
      <div className={cn(
        hasError ? '[&_.phone-input]:border-red-500 [&_.phone-input]:focus:border-red-500 [&_.phone-input]:focus:ring-red-500' : '',
        inputClassName
      )}>
        <PhoneInput
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="phone-input"
          label={undefined} // We handle label above
        />
      </div>
      <FieldError 
        message={hasError ? error : undefined}
        className="min-h-[1.25rem]" // Reserve space even when no error
      />
    </div>
  );
};