import React from 'react';
import { cn } from './utils';

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ 
  message, 
  className 
}) => {
  if (!message) {
    return null;
  }

  return (
    <p 
      className={cn(
        'text-sm text-red-600 mt-1 leading-tight',
        className
      )}
      role="alert"
    >
      {message}
    </p>
  );
};