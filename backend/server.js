const express = require('express');
const cors = require('cors');
require('dotenv').config();

const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://localhost:19006',
      'http://127.0.0.1:19006',
      'http://localhost:3000',
    ];

    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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
app.listen(PORT, '0.0.0.0', () => {
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
