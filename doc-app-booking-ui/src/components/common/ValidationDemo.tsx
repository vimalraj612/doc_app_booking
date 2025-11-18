import React from 'react';
import { useForm } from '../../hooks/useForm';
import { ValidatedInput } from '../ui/validated-input';
import { ValidatedPhoneInput } from '../ui/validated-phone-input';
import { Button } from '../ui/button';

export function ValidationDemo() {
  const form = useForm({
    name: { 
      required: true, 
      minLength: 2,
      message: 'Name is required (min 2 characters)' 
    },
    email: { 
      required: true, 
      email: true,
      message: 'Valid email is required' 
    },
    phone: { 
      required: true, 
      phone: true,
      message: 'Valid phone number is required' 
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.validate()) {
      alert('Form is valid! Data: ' + JSON.stringify(form.fields, null, 2));
    } else {
      alert('Please fix validation errors');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Validation Demo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <ValidatedInput
          label="Full Name"
          placeholder="Enter your full name"
          {...form.getFieldProps('name')}
          required
        />

        <ValidatedInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          {...form.getFieldProps('email')}
          required
        />

        <ValidatedPhoneInput
          label="Phone Number"
          placeholder="Enter your phone number"
          {...form.getFieldProps('phone')}
          required
        />

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!form.isFormValid}
          >
            Submit
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={form.reset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          Form Valid: {form.isFormValid ? '✅' : '❌'} | 
          Has Errors: {form.hasErrors ? '❌' : '✅'}
        </div>
      </form>
    </div>
  );
}