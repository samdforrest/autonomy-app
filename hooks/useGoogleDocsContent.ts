import { useEffect, useState } from 'react';
import { apiService, DocumentResponse } from '../services/api';

interface UseGoogleDocsContentResult {
  content: DocumentResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching Google Docs content
 * Handles loading states, error handling, and caching
 */
export function useGoogleDocsContent(
  documentId: string,
  format: 'raw' | 'job' | 'mistakes' = 'raw',
  options: { tab?: string; day?: number; autoFetch?: boolean } = {}
): UseGoogleDocsContentResult {
  const { tab, day, autoFetch = true } = options;
  const [content, setContent] = useState<DocumentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    if (!documentId) {
      setError('No document ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.fetchDocument(documentId, format, { tab, day });
      setContent(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch Google Docs content:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchContent();
  };

  useEffect(() => {
    if (autoFetch && documentId) {
      fetchContent();
    }
  }, [documentId, format, tab, day, autoFetch]);

  return {
    content,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for fetching multiple documents at once
 */
export function useMultipleGoogleDocsContent(
  documentIds: string[],
  format: 'raw' | 'job' | 'mistakes' = 'raw',
  options: { tab?: string; day?: number } = {}
) {
  const [content, setContent] = useState<Record<string, DocumentResponse | { error: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    if (!documentIds.length) {
      setError('No document IDs provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.fetchMultipleDocuments(documentIds, format, options);
      setContent(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch multiple Google Docs:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchContent();
  };

  useEffect(() => {
    if (documentIds.length > 0) {
      fetchContent();
    }
  }, [documentIds.join(','), format, options.tab, options.day]);

  return {
    content,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for fetching available tabs from a document
 */
export function useDocumentTabs(documentId: string) {
  const [tabs, setTabs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTabs = async () => {
    if (!documentId) {
      setError('No document ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.fetchDocumentTabs(documentId);
      setTabs(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch document tabs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchTabs();
    }
  }, [documentId]);

  return {
    tabs,
    loading,
    error,
    refetch: fetchTabs
  };
}

/**
 * Hook for fetching available days from a specific tab
 */
export function useTabDays(documentId: string, tabName: string) {
  const [days, setDays] = useState<{ day: number; title: string; fullTitle: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDays = async () => {
    if (!documentId || !tabName) {
      setError('Document ID and tab name are required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.fetchTabDays(documentId, tabName);
      setDays(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch tab days:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId && tabName) {
      fetchDays();
    }
  }, [documentId, tabName]);

  return {
    days,
    loading,
    error,
    refetch: fetchDays
  };
}
