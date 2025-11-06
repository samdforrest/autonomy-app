const { google } = require('googleapis');
const functions = require('firebase-functions');

/**
 * Google Docs API Authentication Configuration
 * Uses service account for server-to-server authentication
 * Adapted for Firebase Functions environment
 */
class GoogleDocsAuth {
  constructor() {
    this.auth = null;
    this.docs = null;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      // Get config from environment variables (Firebase Functions v2)
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      
      // Check if required config exists
      if (!serviceAccountEmail || !privateKey) {
        console.warn('⚠️ Google Docs credentials not configured. Set them with:');
        console.warn('Environment variables: GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY');
        // Don't throw error - let the function start but API calls will fail gracefully
        return;
      }
      
      // Create JWT auth client using service account credentials
      this.auth = new google.auth.JWT(
        serviceAccountEmail,
        null,
        privateKey.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/documents.readonly']
      );

      // Initialize Google Docs API client
      this.docs = google.docs({ version: 'v1', auth: this.auth });
      
      console.log('✅ Google Docs API client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Docs API:', error.message);
      console.warn('⚠️ Function will start but Google Docs API calls will fail');
      // Don't throw error - let the function start
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
