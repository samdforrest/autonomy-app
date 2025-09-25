const express = require('express');
const GoogleDocsService = require('../services/google-docs-service');

const router = express.Router();
const docsService = new GoogleDocsService();

/**
 * GET /api/documents/:documentId
 * Fetch and parse a single Google Docs document
 */
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { format = 'raw' } = req.query;

    if (!documentId) {
      return res.status(400).json({
        error: 'Document ID is required',
        example: '/api/documents/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      });
    }

    const result = await docsService.getDocument(documentId, format);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/documents/:documentId/metadata
 * Get document metadata only (faster, less data)
 */
router.get('/:documentId/metadata', async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        error: 'Document ID is required'
      });
    }

    const metadata = await docsService.getDocumentMetadata(documentId);
    
    res.json({
      success: true,
      data: metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document metadata error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/documents/batch
 * Fetch multiple documents at once
 * Body: { "documentIds": ["id1", "id2"], "format": "job" }
 */
router.post('/batch', async (req, res) => {
  try {
    const { documentIds, format = 'raw' } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      return res.status(400).json({
        error: 'documentIds array is required',
        example: { documentIds: ['doc1', 'doc2'], format: 'job' }
      });
    }

    if (documentIds.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 documents per batch request'
      });
    }

    const results = await docsService.getMultipleDocuments(documentIds, format);
    
    res.json({
      success: true,
      data: results,
      count: Object.keys(results).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch document fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/documents/test/:documentId?
 * Test the Google Docs service
 */
router.get('/test/:documentId?', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const testResult = await docsService.testService(documentId);
    
    res.json({
      success: testResult,
      message: testResult ? 'Service test passed' : 'Service test failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Service test error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
