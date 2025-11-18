# Uniform Input Validation System

## Overview

This system provides a consistent way to handle form validation across all components with red error messages displayed below form fields.

## Components

### Core Components
- `FieldError` - Simple error message display component
- `ValidatedInput` - Input field with integrated validation
- `ValidatedPhoneInput` - Phone input with integrated validation

### Hooks
- `useFieldValidation` - Single field validation logic
- `useForm` - Multi-field form management

## Basic Usage

### Single Field Validation

```tsx
import { useFieldValidation } from '@/hooks/useFieldValidation';
import { ValidatedInput } from '@/components/ui/validated-input';

function MyForm() {
  const email = useFieldValidation('', {
    required: true,
    email: true,
    message: 'Valid email is required'
  });

  return (
    <ValidatedInput
      label="Email"
      value={email.field.value}
      error={email.field.error}
      touched={email.field.touched}
      onChange={email.setValue}
      onBlur={email.setTouched}
      required
    />
  );
}
```

### Multi-Field Form

```tsx
import { useForm } from '@/hooks/useForm';
import { ValidatedInput, ValidatedPhoneInput } from '@/components/ui';

function RegistrationForm() {
  const form = useForm({
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    phone: { required: true, phone: true }
  });

  const handleSubmit = () => {
    if (form.validate()) {
      // Submit form
      console.log('Form data:', form.fields);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        label="Name"
        {...form.getFieldProps('name')}
        required
      />
      
      <ValidatedInput
        label="Email"
        type="email"
        {...form.getFieldProps('email')}
        required
      />
      
      <ValidatedPhoneInput
        label="Phone"
        {...form.getFieldProps('phone')}
        required
      />
      
      <button type="submit" disabled={!form.isFormValid}>
        Submit
      </button>
    </form>
  );
}
```

## Validation Rules

### Available Rules
- `required: boolean` - Field is required
- `minLength: number` - Minimum character length
- `maxLength: number` - Maximum character length
- `email: boolean` - Valid email format
- `phone: boolean` - Valid phone number
- `pattern: RegExp` - Custom regex pattern
- `custom: (value: string) => string | null` - Custom validation function
- `message: string` - Custom error message for required fields

### Examples

```tsx
// Email validation
const emailRules = {
  required: true,
  email: true,
  message: 'Please enter a valid email address'
};

// Password validation
const passwordRules = {
  required: true,
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  message: 'Password must contain uppercase, lowercase, and number'
};

// Custom validation
const usernameRules = {
  required: true,
  custom: (value: string) => {
    if (value.includes(' ')) {
      return 'Username cannot contain spaces';
    }
    return null;
  }
};
```

## Features

### Consistent Styling
- Red error text below fields
- Red border for invalid fields
- Red labels for invalid fields
- Required asterisk indicator

### Accessibility
- `aria-invalid` attributes
- `aria-describedby` linking errors to fields
- `role="alert"` for error messages
- Proper label associations

### Responsive Design
- Works on mobile and desktop
- Error text reserves space to prevent layout jumps
- Tailwind CSS classes for consistent spacing

### Developer Experience
- TypeScript support
- Reusable validation rules
- Centralized form state management
- Easy integration with existing components