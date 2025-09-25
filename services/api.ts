/**
 * API Service for Google Docs Integration
 * Handles communication between React Native frontend and Node.js backend
 */

export interface DocumentSection {
  title: string;
  type: string;
  items: string[];
  content: string;
}

export interface DocumentResponse {
  title: string;
  sections: Record<string, DocumentSection>;
  metadata: {
    documentId: string;
    lastModified: string;
    totalSections: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Update this URL to match your backend server
    this.baseUrl = 'http://localhost:3001/api';
  }

  /**
   * Fetch document content from Google Docs via backend
   * @param documentRef - Document reference key (not actual ID)
   * @param format - Output format ('raw', 'job', 'mistakes')
   * @param options - Additional options { tab, day }
   * @returns Parsed document content
   */
  async fetchDocument(
    documentRef: string, 
    format: 'raw' | 'job' | 'mistakes' = 'raw',
    options: { tab?: string; day?: number } = {}
  ): Promise<DocumentResponse> {
    try {
      // Build URL with query parameters
      const params = new URLSearchParams({ format });
      if (options.tab) params.append('tab', options.tab);
      if (options.day) params.append('day', options.day.toString());

      const response = await fetch(
        `${this.baseUrl}/documents/${documentRef}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DocumentResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch document:', error);
      throw error;
    }
  }

  /**
   * Fetch specific day content from specific tab (alternative endpoint)
   * @param documentRef - Document reference key (not actual ID)
   * @param tabName - Tab name
   * @param dayNumber - Day number
   * @param format - Output format
   * @returns Parsed document content
   */
  async fetchTabDay(
    documentRef: string,
    tabName: string,
    dayNumber: number,
    format: 'raw' | 'job' | 'mistakes' = 'raw'
  ): Promise<DocumentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentRef}/tab/${encodeURIComponent(tabName)}/day/${dayNumber}?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DocumentResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch tab/day content:', error);
      throw error;
    }
  }

  /**
   * Fetch multiple documents at once
   * @param documentIds - Array of document IDs
   * @param format - Output format
   * @param options - Additional options { tab, day }
   * @returns Object with document IDs as keys
   */
  async fetchMultipleDocuments(
    documentIds: string[],
    format: 'raw' | 'job' | 'mistakes' = 'raw',
    options: { tab?: string; day?: number } = {}
  ): Promise<Record<string, DocumentResponse | { error: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds,
          format,
          options
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Record<string, DocumentResponse | { error: string }>> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch multiple documents:', error);
      throw error;
    }
  }

  /**
   * Get available tabs from a document
   * @param documentId - Google Docs document ID
   * @returns Array of tab names
   */
  async fetchDocumentTabs(documentId: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/tabs`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<string[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch document tabs:', error);
      throw error;
    }
  }

  /**
   * Get available days from a specific tab
   * @param documentId - Google Docs document ID
   * @param tabName - Tab name
   * @returns Array of day objects
   */
  async fetchTabDays(
    documentId: string, 
    tabName: string
  ): Promise<{ day: number; title: string; fullTitle: string }[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/tab/${encodeURIComponent(tabName)}/days`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<{ day: number; title: string; fullTitle: string }[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch tab days:', error);
      throw error;
    }
  }

  /**
   * Get document metadata only (faster than full content)
   * @param documentId - Google Docs document ID
   * @returns Document metadata
   */
  async fetchDocumentMetadata(documentId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/metadata`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch document metadata:', error);
      throw error;
    }
  }

  /**
   * Test backend connection
   * @returns Whether backend is accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  /**
   * Update base URL (useful for development/production environments)
   * @param url - New base URL
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Document reference constants - no actual IDs exposed
export const DOCUMENT_REFS = {
  MAIN_DOCUMENT: 'main_document', // References the main document with tabs
  // Add more document references as needed
  // SECONDARY_DOCUMENT: 'secondary_document',
};
