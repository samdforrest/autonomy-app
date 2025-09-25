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
   * @param documentId - Google Docs document ID
   * @param format - Output format ('raw', 'job', 'mistakes')
   * @returns Parsed document content
   */
  async fetchDocument(
    documentId: string, 
    format: 'raw' | 'job' | 'mistakes' = 'raw'
  ): Promise<DocumentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}?format=${format}`,
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
   * Fetch multiple documents at once
   * @param documentIds - Array of document IDs
   * @param format - Output format
   * @returns Object with document IDs as keys
   */
  async fetchMultipleDocuments(
    documentIds: string[],
    format: 'raw' | 'job' | 'mistakes' = 'raw'
  ): Promise<Record<string, DocumentResponse | { error: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds,
          format
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

// Document ID constants for your modules
export const DOCUMENT_IDS = {
  // Replace these with your actual Google Docs document IDs
  MISTAKES_DAY_1: '1h4r4010V40CCNOtRod84AO_k7XNmBxc64M-Gx__NfYI', // Your test doc
  JOB_DAY_1: '1h4r4010V40CCNOtRod84AO_k7XNmBxc64M-Gx__NfYI', // Replace with actual job doc
  // Add more document IDs as needed
  // MISTAKES_DAY_2: 'another-doc-id',
  // JOB_DAY_2: 'another-doc-id',
};
