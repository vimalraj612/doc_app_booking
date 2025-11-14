import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from './utils';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface InlineMessageProps {
  type: MessageType;
  message: string;
  title?: string;
  className?: string;
}

export const InlineMessage: React.FC<InlineMessageProps> = ({ 
  type, 
  message, 
  title,
  className 
}) => {
  const getIcon = () => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0";
    switch (type) {
      case 'success':
        return <CheckCircle2 className={iconClass} />;
      case 'error':
        return <XCircle className={iconClass} />;
      case 'warning':
        return <AlertCircle className={iconClass} />;
      case 'info':
        return <Info className={iconClass} />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center p-3 sm:p-4 rounded-lg border',
        'transition-all duration-200',
        getColorClasses(),
        className
      )}
      role="alert"
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={cn(
            'font-semibold text-sm sm:text-base mb-0.5 text-center',
            type === 'error' ? 'text-red-600' : ''
          )}>
            {title}
          </h3>
        )}
        <p className={cn(
          'text-xs sm:text-sm text-center',
          type === 'error' ? 'text-red-600' : ''
        )}>{message}</p>
      </div>
    </div>
  );
};
