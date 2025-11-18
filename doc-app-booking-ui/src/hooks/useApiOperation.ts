// src/hooks/useApiOperation.ts
import { useApiState } from '../utils/api-handler';
import { useNotification } from '../contexts/NotificationContext';

export interface ApiOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApiOperation() {
  const { handleApiOperation } = useApiState();
  const notification = useNotification();

  const executeOperation = async <T>(
    apiCall: () => Promise<T>,
    options: ApiOperationOptions = {}
  ) => {
    const {
      successMessage,
      errorMessage,
      showToast = true,
      onSuccess,
      onError
    } = options;

    const result = await handleApiOperation(apiCall, {
      successMessage,
      errorMessage,
      onSuccess: (data) => {
        if (showToast && successMessage) {
          notification.success(successMessage);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        if (showToast) {
          const finalErrorMessage = errorMessage || 
            (error?.message || 'An unexpected error occurred');
          notification.error(finalErrorMessage);
        }
        onError?.(error);
      }
    });

    return result;
  };

  return { executeOperation };
}