const express = require('express');
const cors = require('cors');
require('dotenv').config();

const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    service: 'autonomy-app-backend',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/documents', documentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Autonomy App Backend - Google Docs Integration',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      documents: '/api/documents/:documentId',
      metadata: '/api/documents/:documentId/metadata',
      batch: '/api/documents/batch',
      test: '/api/documents/test/:documentId?'
    },
    documentation: {
      example_document_fetch: '/api/documents/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms?format=job',
      example_batch_request: {
        url: '/api/documents/batch',
        method: 'POST',
        body: {
          documentIds: ['doc1', 'doc2'],
          format: 'job'
        }
      }
    }
  });
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/api/documents'],
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Autonomy App Backend Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
  console.log('');
  console.log('📋 Setup checklist:');
  console.log('  ✅ Server started');
  console.log('  ⏳ Configure .env file with Google service account credentials');
  console.log('  ⏳ Test with: GET /api/documents/test');
  console.log('');
});

module.exports = app;
