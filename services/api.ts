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

export interface ContentBlock {
  id: number;
  header: string | null;
  content: Array<{
    type: 'text' | 'bullet' | 'image';
    text?: string;
    uri?: string; // For copied/pasted images, this will be a data URL (base64)
    alt?: string;
    width?: number | null;
    height?: number | null;
  }>;
  type: string;
}

export interface DocumentResponse {
  title: string;
  sections: Record<string, DocumentSection>;
  contentBlocks?: ContentBlock[]; // Array of content blocks for bubble display
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
    console.log('🔍 Debug - process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    
    const isDev = __DEV__;
    // Proper platform detection: React Native has navigator.product === 'ReactNative'
    const isWeb = typeof window !== 'undefined' && 
                  typeof navigator !== 'undefined' && 
                  navigator.product !== 'ReactNative';
    
    console.log('🔍 Platform detection - isDev:', isDev, 'isWeb:', isWeb);
    console.log('🔍 typeof window:', typeof window);
    console.log('🔍 navigator.product:', typeof navigator !== 'undefined' ? navigator.product : 'undefined');
    
    if (isDev) {
      if (isWeb) {
        // Web can always use localhost
        this.baseUrl = 'http://localhost:3001/api';
        console.log('🔍 Using web config: localhost');
      } else {
        // For mobile devices (iOS/Android), prioritize environment variable
        // If no env var, use localhost as default (works with tunnel mode)
        this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
        console.log('🔍 Using mobile config - will auto-detect if needed');
        console.log('🔍 Initial mobile URL:', this.baseUrl);
        
        // Auto-detect working URL on mobile (runs in background)
        this.autoDetectBackendUrl().catch(err => {
          console.warn('🔍 Auto-detection failed:', err.message);
        });
      }
    } else {
      // For production - use environment variable or default
      this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    }
    
    console.log('🔗 API Service initialized with URL:', this.baseUrl);
    console.log('🔍 Platform - isDev:', isDev, 'isWeb:', isWeb);
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
   * Auto-detect working backend URL for iOS simulator
   * @returns Promise that resolves when a working URL is found
   */
  async autoDetectBackendUrl(): Promise<void> {
    const isDev = __DEV__;
    const isWeb = typeof window !== 'undefined';
    
    // Only auto-detect for iOS simulator in development
    if (!isDev) {
      console.log('🔍 Skipping auto-detection - not in development mode');
      return;
    }
    
    if (isWeb) {
      console.log('🔍 Detected as web, but will still try auto-detection for debugging...');
    }
    
    const urlsToTry = [
      'http://localhost:3001/api',     // Works with tunnel mode and simulators
      'http://127.0.0.1:3001/api',     // iOS simulator fallback
      'http://10.0.2.2:3001/api',      // Android emulator host mapping
      process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api'
    ];
    
    console.log('🔍 Auto-detecting backend URL for iOS...');
    console.log('🔍 Current baseUrl before detection:', this.baseUrl);
    
    for (const url of urlsToTry) {
      try {
        console.log(`🔍 Trying ${url}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${url.replace('/api', '')}/health`, { 
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Found working backend URL: ${url}`);
          this.baseUrl = url;
          return;
        } else {
          console.log(`❌ ${url} responded with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.warn('⚠️ Could not find working backend URL, keeping current:', this.baseUrl);
  }

  /**
   * Update base URL (useful for development/production environments)
   * @param url - New base URL
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Get current base URL (for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
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
