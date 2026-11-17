import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, ApiError } from '../services/api';

// Generic API hook state
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// Generic API hook options
interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiState<T> & {
  execute: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true,
      });
      onSuccess?.(response.data);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError('Unknown error occurred', 0);
      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      });
      onError?.(apiError);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Paginated API hook
interface UsePaginatedApiState<T> extends UseApiState<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UsePaginatedApiOptions extends UseApiOptions {
  page?: number;
  limit?: number;
}

export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<T>>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiState<T> & {
  execute: (page?: number, limit?: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  reset: () => void;
} {
  const { immediate = true, page: initialPage = 1, limit: initialLimit = 20, onSuccess, onError } = options;
  
  const [state, setState] = useState<UsePaginatedApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    pagination: null,
  });

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);

  const execute = useCallback(async (page?: number, limit?: number) => {
    const targetPage = page ?? currentPage;
    const targetLimit = limit ?? currentLimit;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall(targetPage, targetLimit);
      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true,
        pagination: response.pagination || null,
      });
      setCurrentPage(targetPage);
      setCurrentLimit(targetLimit);
      onSuccess?.(response.data);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError('Unknown error occurred', 0);
      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
        pagination: null,
      });
      onError?.(apiError);
    }
  }, [apiCall, currentPage, currentLimit, onSuccess, onError]);

  const nextPage = useCallback(async () => {
    if (state.pagination && currentPage < state.pagination.totalPages) {
      await execute(currentPage + 1);
    }
  }, [execute, currentPage, state.pagination]);

  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await execute(currentPage - 1);
    }
  }, [execute, currentPage]);

  const goToPage = useCallback(async (page: number) => {
    if (state.pagination && page >= 1 && page <= state.pagination.totalPages) {
      await execute(page);
    }
  }, [execute, state.pagination]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      pagination: null,
    });
    setCurrentPage(initialPage);
    setCurrentLimit(initialLimit);
  }, [initialPage, initialLimit]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

// Search API hook
interface UseSearchApiState<T> extends UseApiState<T> {
  searchTerm: string;
  results: T | null;
}

interface UseSearchApiOptions extends UseApiOptions {
  debounceMs?: number;
  minLength?: number;
}

export function useSearchApi<T>(
  apiCall: (searchTerm: string) => Promise<ApiResponse<T>>,
  options: UseSearchApiOptions = {}
): UseSearchApiState<T> & {
  search: (term: string) => void;
  clearSearch: () => void;
  execute: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = false, debounceMs = 300, minLength = 2, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseSearchApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    searchTerm: '',
    results: null,
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const execute = useCallback(async () => {
    if (state.searchTerm.length < minLength) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall(state.searchTerm);
      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        error: null,
        success: true,
        results: response.data,
      }));
      onSuccess?.(response.data);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError('Unknown error occurred', 0);
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        success: false,
        results: null,
      }));
      onError?.(apiError);
    }
  }, [apiCall, state.searchTerm, minLength, onSuccess, onError]);

  const search = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    if (term.length >= minLength) {
      const timer = setTimeout(() => {
        execute();
      }, debounceMs);
      setDebounceTimer(timer);
    } else {
      setState(prev => ({ ...prev, results: null }));
    }
  }, [execute, debounceMs, minLength, debounceTimer]);

  const clearSearch = useCallback(() => {
    setState(prev => ({ ...prev, searchTerm: '', results: null }));
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      searchTerm: '',
      results: null,
    });
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    ...state,
    search,
    clearSearch,
    execute,
    reset,
  };
}

// Real-time data hook (for polling)
interface UseRealtimeApiState<T> extends UseApiState<T> {
  lastUpdated: Date | null;
}

interface UseRealtimeApiOptions extends UseApiOptions {
  interval?: number;
  enabled?: boolean;
}

export function useRealtimeApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseRealtimeApiOptions = {}
): UseRealtimeApiState<T> & {
  execute: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
} {
  const { immediate = true, interval = 30000, enabled = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseRealtimeApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    lastUpdated: null,
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true,
        lastUpdated: new Date(),
      });
      onSuccess?.(response.data);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError('Unknown error occurred', 0);
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        success: false,
      }));
      onError?.(apiError);
    }
  }, [apiCall, onSuccess, onError]);

  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const timer = setInterval(() => {
      if (enabled) {
        execute();
      }
    }, interval);
    
    setPollingInterval(timer);
  }, [execute, interval, enabled, pollingInterval]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      lastUpdated: null,
    });
    stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    if (enabled && interval > 0) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, interval, startPolling, stopPolling]);

  return {
    ...state,
    execute,
    startPolling,
    stopPolling,
    reset,
  };
}
