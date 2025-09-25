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
  autoFetch: boolean = true
): UseGoogleDocsContentResult {
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
      
      const result = await apiService.fetchDocument(documentId, format);
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
  }, [documentId, format, autoFetch]);

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
  format: 'raw' | 'job' | 'mistakes' = 'raw'
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
      
      const result = await apiService.fetchMultipleDocuments(documentIds, format);
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
  }, [documentIds.join(','), format]);

  return {
    content,
    loading,
    error,
    refetch
  };
}
