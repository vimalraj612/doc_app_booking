import { useState, useCallback } from 'react';
import { useFieldValidation, ValidationRule, FieldValidation } from './useFieldValidation';

export interface FormField {
  validation: ReturnType<typeof useFieldValidation>;
  rules: ValidationRule;
}

export interface FormConfig {
  [fieldName: string]: ValidationRule;
}

export interface UseFormReturn {
  fields: { [fieldName: string]: FieldValidation };
  setValue: (fieldName: string, value: string) => void;
  setTouched: (fieldName: string) => void;
  validate: (fieldNames?: string[]) => boolean;
  validateField: (fieldName: string) => boolean;
  reset: () => void;
  isFormValid: boolean;
  hasErrors: boolean;
  getFieldProps: (fieldName: string) => {
    value: string;
    error: string | undefined;
    touched: boolean;
    onChange: (value: string) => void;
    onTouched: () => void;
  };
}

export const useForm = (config: FormConfig): UseFormReturn => {
  // Initialize field validations
  const fieldValidations = Object.keys(config).reduce((acc, fieldName) => {
    acc[fieldName] = useFieldValidation('', config[fieldName]);
    return acc;
  }, {} as { [fieldName: string]: ReturnType<typeof useFieldValidation> });

  const [, forceUpdate] = useState(0);

  // Get current field states
  const fields = Object.keys(fieldValidations).reduce((acc, fieldName) => {
    acc[fieldName] = fieldValidations[fieldName].field;
    return acc;
  }, {} as { [fieldName: string]: FieldValidation });

  const setValue = useCallback((fieldName: string, value: string) => {
    if (fieldValidations[fieldName]) {
      fieldValidations[fieldName].setValue(value);
      forceUpdate(prev => prev + 1);
    }
  }, []);

  const setTouched = useCallback((fieldName: string) => {
    if (fieldValidations[fieldName]) {
      fieldValidations[fieldName].setTouched();
      forceUpdate(prev => prev + 1);
    }
  }, []);

  const validateField = useCallback((fieldName: string): boolean => {
    if (fieldValidations[fieldName]) {
      const isValid = fieldValidations[fieldName].validate();
      forceUpdate(prev => prev + 1);
      return isValid;
    }
    return true;
  }, []);

  const validate = useCallback((fieldNames?: string[]): boolean => {
    const fieldsToValidate = fieldNames || Object.keys(fieldValidations);
    let allValid = true;

    fieldsToValidate.forEach(fieldName => {
      if (fieldValidations[fieldName]) {
        const isValid = fieldValidations[fieldName].validate();
        if (!isValid) {
          allValid = false;
        }
      }
    });

    forceUpdate(prev => prev + 1);
    return allValid;
  }, []);

  const reset = useCallback(() => {
    Object.values(fieldValidations).forEach(field => field.reset());
    forceUpdate(prev => prev + 1);
  }, []);

  const getFieldProps = useCallback((fieldName: string) => {
    const field = fieldValidations[fieldName];
    if (!field) {
      throw new Error(`Field "${fieldName}" not found in form configuration`);
    }

    return {
      value: field.field.value,
      error: field.field.error,
      touched: field.field.touched,
      onChange: (value: string) => setValue(fieldName, value),
      onTouched: () => setTouched(fieldName)
    };
  }, [setValue, setTouched]);

  // Computed properties
  const isFormValid = Object.values(fields).every(field => field.isValid);
  const hasErrors = Object.values(fields).some(field => field.error !== undefined);

  return {
    fields,
    setValue,
    setTouched,
    validate,
    validateField,
    reset,
    isFormValid,
    hasErrors,
    getFieldProps
  };
};