// src/utils/api-handler.ts
/// <reference types="vite/client" />
import React from 'react';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ApiHandlerOptions = {
  successMessage?: string | ((data: any) => string);
  errorMessage?: string | ((error: any) => string);
  showSuccess?: boolean;
  showError?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  loadingState?: {
    setter: (loading: boolean) => void;
  };
}

export class ApiError extends Error {
  public status: number;
  public response: any;

  constructor(message: string, status: number = 500, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Enhanced HTTP client with better error handling
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.easyslotapp.com';
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      const errorMessage = typeof responseData === 'string' 
        ? responseData 
        : responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
      
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      null
    );
  }
}

// Unified API handler hook
export function useApiHandler() {
  return {
    handleApi: async <T>(
      apiCall: () => Promise<T>,
      options: ApiHandlerOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        successMessage,
        errorMessage,
        showSuccess = true,
        showError = true,
        onSuccess,
        onError,
        loadingState
      } = options;

      // Set loading state
      if (loadingState?.setter) {
        loadingState.setter(true);
      }

      try {
        const result = await apiCall();
        
        // Handle success
        if (onSuccess) {
          onSuccess(result);
        }

        const finalSuccessMessage = typeof successMessage === 'function' 
          ? successMessage(result) 
          : successMessage;

        if (showSuccess && finalSuccessMessage) {
          // Try to use notification context if available
          try {
            const { useNotification } = await import('../contexts/NotificationContext');
            const notification = useNotification();
            notification.success(finalSuccessMessage);
          } catch {
            // Fallback to console
            console.log('Success:', finalSuccessMessage);
          }
        }

        return {
          success: true,
          data: result,
          message: finalSuccessMessage
        };

      } catch (error) {
        console.error('API Error:', error);
        
        // Handle error
        if (onError) {
          onError(error);
        }

        const finalErrorMessage = typeof errorMessage === 'function' 
          ? errorMessage(error) 
          : errorMessage || (error instanceof ApiError ? error.message : 'An unexpected error occurred');

        if (showError) {
          // Try to use notification context if available
          try {
            const { useNotification } = await import('../contexts/NotificationContext');
            const notification = useNotification();
            notification.error(finalErrorMessage);
          } catch {
            // Fallback to console
            console.error('Error:', finalErrorMessage);
          }
        }

        return {
          success: false,
          error: finalErrorMessage
        };

      } finally {
        // Clear loading state
        if (loadingState?.setter) {
          loadingState.setter(false);
        }
      }
    }
  };
}

// Unified state management for API operations
export function useApiState() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleApiOperation = async <T>(
    apiCall: () => Promise<T>,
    options: Omit<ApiHandlerOptions, 'loadingState'> & {
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<ApiResponse<T>> => {
    clearMessages();
    
    const { handleApi } = useApiHandler();
    
    const result = await handleApi(apiCall, {
      ...options,
      loadingState: { setter: setLoading },
      onSuccess: (data) => {
        if (options.successMessage) {
          setSuccess(options.successMessage);
        }
        options.onSuccess?.(data);
      },
      onError: (error) => {
        const errorMsg = options.errorMessage || 
          (error instanceof ApiError ? error.message : 'An unexpected error occurred');
        setError(errorMsg);
        options.onError?.(error);
      }
    });

    return result;
  };

  return {
    loading,
    error,
    success,
    setError,
    setSuccess,
    clearMessages,
    handleApiOperation
  };
}