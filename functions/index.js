const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (for Firestore and Storage access)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const bucket = admin.storage().bucket();

// Import Google Docs services (lazy loaded to prevent startup issues)
let GoogleDocsService = null;
let getDocumentId = null;

// Lazy load Google Docs dependencies
function loadGoogleDocsServices() {
  if (!GoogleDocsService) {
    try {
      GoogleDocsService = require('./services/google-docs-service');
      
      // Load document mapping with better error handling
      const documentMappingModule = require('./config/document-mapping');
      console.log('🔍 Document mapping module loaded:', Object.keys(documentMappingModule));
      
      if (typeof documentMappingModule.getDocumentId === 'function') {
        getDocumentId = documentMappingModule.getDocumentId;
        console.log('✅ getDocumentId function loaded successfully');
      } else {
        console.error('❌ getDocumentId is not a function:', typeof documentMappingModule.getDocumentId);
        throw new Error('getDocumentId function not found in document-mapping module');
      }
      
      console.log('✅ Google Docs services loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Google Docs services:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }
}

// Initialize Google Docs service instance (lazy)
let docsServiceInstance = null;
function getDocsService() {
  if (!docsServiceInstance) {
    loadGoogleDocsServices();
    docsServiceInstance = new GoogleDocsService();
  }
  return docsServiceInstance;
}

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'autonomy-app-backend-firebase',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Autonomy App Backend - Google Docs Integration (Firebase)',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      documents: '/documents/:documentId'
    }
  });
});

// Google Docs integration endpoint
app.get('/documents/:documentRef', async (req, res) => {
  try {
    const { documentRef } = req.params;
    const { format = 'raw', tab, day } = req.query;

    console.log(`📄 Fetching document: ${documentRef}, format: ${format}, tab: ${tab}, day: ${day}`);

    // Check if Google Docs services are available
    try {
      loadGoogleDocsServices();
    } catch (loadError) {
      console.warn('⚠️ Google Docs services not available:', loadError.message);
      return res.json({
        success: false,
        error: 'Google Docs integration not configured',
        details: 'Please set up Google service account credentials',
        fallback: {
          documentRef,
          format,
          tab,
          day,
          message: 'This would fetch real Google Docs content when configured'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Convert document reference to actual document ID
    let documentId;
    if (!getDocumentId) {
      console.error('❌ getDocumentId function not available, using fallback');
      // Fallback: get document ID directly from environment variables
      documentId = process.env.MAIN_DOCUMENT_ID;
      if (!documentId || documentId === 'DOCUMENT_ID_NOT_SET') {
        throw new Error('Document ID not configured. Set environment variable MAIN_DOCUMENT_ID');
      }
      console.log(`🔍 Document ID (fallback): ${documentId}`);
    } else {
      documentId = getDocumentId(documentRef);
      console.log(`🔍 Document ID resolved: ${documentId}`);
    }

    // Prepare options for Google Docs service
    const options = {};
    if (tab) options.tab = tab;
    if (day) options.day = parseInt(day);

    // Fetch document from Google Docs
    const docsService = getDocsService();
    const result = await docsService.getDocument(documentId, format, options);
    
    console.log('✅ Document fetched successfully');
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Document fetch error:', error.message);
    
    // Provide helpful error messages
    let errorMessage = error.message;
    let errorDetails = null;
    
    if (error.message.includes('Document not found')) {
      errorDetails = 'Make sure the document exists and is shared with the service account';
    } else if (error.message.includes('Access denied')) {
      errorDetails = 'Make sure the document is shared with the service account email';
    } else if (error.message.includes('Invalid document reference')) {
      errorDetails = 'Available references: main_document';
    } else if (error.message.includes('credentials not configured')) {
      errorDetails = 'Set up Google service account credentials with firebase functions:config:set';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// Thumbnail Management Endpoints (Admin Only)
// ============================================

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Verify admin status for a family
 */
async function verifyAdmin(familyCode) {
  if (!familyCode) return false;

  try {
    const familyDoc = await db.collection('families').doc(familyCode).get();
    return familyDoc.exists && familyDoc.data()?.settings?.isAdmin === true;
  } catch (error) {
    console.error('❌ Error verifying admin status:', error);
    return false;
  }
}

/**
 * POST /thumbnails/upload - Upload custom thumbnail (Admin only)
 */
app.post('/thumbnails/upload', async (req, res) => {
  try {
    const { familyCode, youtubeUrl, imageData } = req.body;

    console.log('📸 Thumbnail upload request from family:', familyCode);

    // Validate required fields
    if (!familyCode || !youtubeUrl || !imageData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: familyCode, youtubeUrl, imageData'
      });
    }

    // Verify admin status
    const isAdmin = await verifyAdmin(familyCode);
    if (!isAdmin) {
      console.log('🚫 Non-admin upload attempt from:', familyCode);
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Extract video ID
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL'
      });
    }

    console.log('📤 Uploading thumbnail for video:', videoId);

    // Decode base64 and upload to Storage
    const buffer = Buffer.from(imageData, 'base64');
    const file = bucket.file(`thumbnails/${videoId}`);

    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          uploadedBy: familyCode,
          youtubeUrl: youtubeUrl
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/thumbnails/${videoId}`;

    // Save metadata to Firestore
    await db.collection('videoThumbnails').doc(videoId).set({
      videoId,
      customUrl: publicUrl,
      originalYouTubeUrl: youtubeUrl,
      uploadedBy: familyCode,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Thumbnail uploaded successfully:', videoId);

    res.json({
      success: true,
      url: publicUrl,
      videoId
    });

  } catch (error) {
    console.error('❌ Thumbnail upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload thumbnail',
      details: error.message
    });
  }
});

/**
 * DELETE /thumbnails/:videoId - Delete custom thumbnail (Admin only)
 */
app.delete('/thumbnails/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { familyCode } = req.body;

    console.log('🗑️ Thumbnail delete request for:', videoId, 'from:', familyCode);

    // Validate required fields
    if (!familyCode || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: familyCode, videoId'
      });
    }

    // Verify admin status
    const isAdmin = await verifyAdmin(familyCode);
    if (!isAdmin) {
      console.log('🚫 Non-admin delete attempt from:', familyCode);
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Delete from Storage
    try {
      const file = bucket.file(`thumbnails/${videoId}`);
      await file.delete();
      console.log('✅ Deleted from Storage:', videoId);
    } catch (storageError) {
      console.log('⚠️ Storage file may not exist:', storageError.message);
    }

    // Delete from Firestore
    await db.collection('videoThumbnails').doc(videoId).delete();
    console.log('✅ Deleted from Firestore:', videoId);

    res.json({
      success: true,
      message: 'Thumbnail deleted successfully'
    });

  } catch (error) {
    console.error('❌ Thumbnail delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete thumbnail',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a Firebase Function with public access and environment variables
exports.api = functions
  .https
  .onRequest({
    cors: true,
    invoker: 'public',
    secrets: ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID', 'MAIN_DOCUMENT_ID']
  }, app);