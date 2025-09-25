const GoogleDocsAuth = require('../config/google-auth');
const DocumentParser = require('./document-parser');

/**
 * Google Docs Service
 * Handles document fetching and parsing operations
 */
class GoogleDocsService {
  constructor() {
    this.authClient = new GoogleDocsAuth();
    this.parser = new DocumentParser();
  }

  /**
   * Fetch and parse a Google Docs document
   * @param {string} documentId - Google Docs document ID
   * @param {string} format - Output format ('job', 'mistakes', 'raw')
   * @returns {Object} - Parsed document content
   */
  async getDocument(documentId, format = 'raw') {
    try {
      console.log(`📄 Fetching document: ${documentId}`);
      
      const docs = this.authClient.getDocsClient();
      const response = await docs.documents.get({
        documentId: documentId
      });

      console.log(`✅ Document fetched successfully: "${response.data.title}"`);
      
      // Parse the document
      const parsedContent = this.parser.parseDocument(response.data);
      
      // Return formatted output
      return this.parser.getFormattedOutput(format);
      
    } catch (error) {
      console.error('❌ Error fetching document:', error.message);
      
      if (error.code === 404) {
        throw new Error(`Document not found: ${documentId}. Make sure the document exists and is shared with the service account.`);
      } else if (error.code === 403) {
        throw new Error(`Access denied to document: ${documentId}. Make sure the document is shared with the service account email.`);
      }
      
      throw error;
    }
  }

  /**
   * Get multiple documents at once
   * @param {Array} documentIds - Array of document IDs
   * @param {string} format - Output format
   * @returns {Object} - Object with document IDs as keys and parsed content as values
   */
  async getMultipleDocuments(documentIds, format = 'raw') {
    const results = {};
    
    for (const docId of documentIds) {
      try {
        results[docId] = await this.getDocument(docId, format);
      } catch (error) {
        console.error(`Failed to fetch document ${docId}:`, error.message);
        results[docId] = { error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Test the service with a sample document
   * @param {string} documentId - Document ID to test with
   * @returns {boolean} - Whether the test was successful
   */
  async testService(documentId) {
    try {
      console.log('🧪 Testing Google Docs service...');
      
      // Test authentication first
      const authSuccess = await this.authClient.testConnection();
      if (!authSuccess) {
        return false;
      }
      
      // Test document fetching
      if (documentId) {
        const result = await this.getDocument(documentId);
        console.log('✅ Service test successful!');
        console.log('Sample parsed content:', JSON.stringify(result, null, 2));
        return true;
      }
      
      console.log('✅ Authentication test successful!');
      return true;
      
    } catch (error) {
      console.error('❌ Service test failed:', error.message);
      return false;
    }
  }

  /**
   * Get document metadata without full parsing
   * @param {string} documentId - Document ID
   * @returns {Object} - Document metadata
   */
  async getDocumentMetadata(documentId) {
    try {
      const docs = this.authClient.getDocsClient();
      const response = await docs.documents.get({
        documentId: documentId,
        fields: 'documentId,title,revisionId,documentStyle'
      });

      return {
        documentId: response.data.documentId,
        title: response.data.title,
        revisionId: response.data.revisionId,
        lastModified: new Date().toISOString() // Google Docs API doesn't provide last modified directly
      };
      
    } catch (error) {
      console.error('❌ Error fetching document metadata:', error.message);
      throw error;
    }
  }
}

module.exports = GoogleDocsService;
