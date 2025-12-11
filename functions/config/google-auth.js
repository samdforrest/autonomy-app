const { google } = require('googleapis');
require('dotenv').config();

/**
 * Google Docs API Authentication Configuration
 * Uses service account for server-to-server authentication
 */
class GoogleDocsAuth {
  constructor() {
    this.auth = null;
    this.docs = null;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      // Create JWT auth client using service account credentials
      this.auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/documents.readonly']
      );

      // Initialize Google Docs API client
      this.docs = google.docs({ version: 'v1', auth: this.auth });
      
      console.log('✅ Google Docs API client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Docs API:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.auth.authorize();
      console.log('✅ Google API authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Google API authentication failed:', error.message);
      return false;
    }
  }

  getDocsClient() {
    if (!this.docs) {
      throw new Error('Google Docs client not initialized');
    }
    return this.docs;
  }
}

module.exports = GoogleDocsAuth;
