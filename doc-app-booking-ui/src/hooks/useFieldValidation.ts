import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: string) => string | undefined;
  message?: string;
}

export interface FieldValidation {
  value: string;
  error: string | undefined;
  touched: boolean;
  isValid: boolean;
}

export interface UseFieldValidationReturn {
  field: FieldValidation;
  setValue: (value: string) => void;
  setTouched: () => void;
  validate: () => boolean;
  reset: () => void;
}

export const useFieldValidation = (
  initialValue: string = '',
  rules: ValidationRule = {}
): UseFieldValidationReturn => {
  const [field, setField] = useState<FieldValidation>({
    value: initialValue,
    error: undefined,
    touched: false,
    isValid: true
  });

  const validateValue = useCallback((value: string): string | undefined => {
    // Required validation
    if (rules.required && !value.trim()) {
      return rules.message || 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rules.required) {
      return undefined;
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (rules.phone) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return undefined;
  }, [rules]);

  const setValue = useCallback((value: string) => {
    const error = validateValue(value);
    setField(prev => ({
      ...prev,
      value,
      error,
      isValid: error === undefined
    }));
  }, [validateValue]);

  const setTouched = useCallback(() => {
    setField(prev => ({
      ...prev,
      touched: true
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const error = validateValue(field.value);
    setField(prev => ({
      ...prev,
      error,
      touched: true,
      isValid: error === undefined
    }));
    return error === undefined;
  }, [field.value, validateValue]);

  const reset = useCallback(() => {
    setField({
      value: initialValue,
      error: undefined,
      touched: false,
      isValid: true
    });
  }, [initialValue]);

  return {
    field,
    setValue,
    setTouched,
    validate,
    reset
  };
};