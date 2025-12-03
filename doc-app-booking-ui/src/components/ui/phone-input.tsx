import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { getCountryCode, getPhoneNumberLength, sanitizePhoneInput } from '../../utils/phoneUtils';

interface PhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  required?: boolean;
}

/**
 * Reusable Phone Input Component
 * Automatically handles country code internally (no visible prefix)
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  id = 'phone',
  label = 'Mobile Number',
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  autoFocus = false,
  className = '',
  required = false,
}) => {
  const phoneLength = getPhoneNumberLength();
  const defaultPlaceholder = `Enter ${phoneLength} digit mobile number`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhoneInput(e.target.value);
    onChange(sanitized);
  };

  return (
    <div className={`field ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={id}
        type="tel"
        placeholder={placeholder || defaultPlaceholder}
        value={value}
        onChange={handleChange}
        className="h-10"
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={phoneLength}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};
