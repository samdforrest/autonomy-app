# Autonomy App Backend - Google Docs Integration

A Node.js backend service that integrates with Google Docs API to fetch and parse structured content for the Autonomy App.

## Features

- 🔐 Service account authentication with Google Docs API
- 📄 Fetch and parse Google Docs documents
- 🏗️ Convert structured content (headers + bullet points) to JSON
- 📊 Multiple output formats (raw, job modules, mistakes modules)
- 🚀 RESTful API endpoints
- 🧪 Built-in testing utilities

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Google service account credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_PROJECT_ID=your-google-cloud-project-id
PORT=3001
```

### 3. Set Up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Docs API
4. Create a service account
5. Generate and download the JSON key file
6. Copy the credentials to your `.env` file

### 4. Share Documents

Share your Google Docs with the service account email (found in your credentials).

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Get Single Document
```
GET /api/documents/:documentId?format=raw
```

**Parameters:**
- `documentId`: Google Docs document ID
- `format`: Output format (`raw`, `job`, `mistakes`)

**Example:**
```bash
curl http://localhost:3001/api/documents/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms?format=job
```

### Get Document Metadata
```
GET /api/documents/:documentId/metadata
```

### Batch Fetch Documents
```
POST /api/documents/batch
Content-Type: application/json

{
  "documentIds": ["doc1", "doc2"],
  "format": "job"
}
```

### Test Service
```
GET /api/documents/test/:documentId?
```

### Health Check
```
GET /health
```

## Document Structure

The parser expects Google Docs with this structure:

```
Header 1
- Bullet point 1
- Bullet point 2

Header 2
- Another bullet point
- Final bullet point
```

### Example Input:
```
Rules
- Everyone puts $5
- Last person standing wins

Instructions
- Follow the process carefully
- Ask questions if unclear
```

### Example Output:
```json
{
  "title": "Sample Document",
  "sections": {
    "rules": {
      "title": "Rules",
      "type": "section",
      "items": [
        "Everyone puts $5",
        "Last person standing wins"
      ],
      "content": ""
    },
    "instructions": {
      "title": "Instructions", 
      "type": "section",
      "items": [
        "Follow the process carefully",
        "Ask questions if unclear"
      ],
      "content": ""
    }
  },
  "metadata": {
    "documentId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "lastModified": "2024-01-01T00:00:00.000Z",
    "totalSections": 2
  }
}
```

## Output Formats

- **`raw`**: Complete parsed structure with all metadata
- **`job`**: Formatted for job module integration
- **`mistakes`**: Formatted for mistakes module integration

## Testing

```bash
# Run test script
npm run test

# Test specific document
SAMPLE_JOB_DOC_ID=your-doc-id npm run test
```

## Error Handling

The API provides detailed error messages for common issues:

- **404**: Document not found or not accessible
- **403**: Document not shared with service account
- **401**: Invalid authentication credentials
- **500**: Server or parsing errors

## Security Notes

- Service account credentials should be kept secure
- Use environment variables for all sensitive data
- Documents must be explicitly shared with the service account
- The service only requests read-only access to documents

## Integration with Frontend

This backend is designed to work with the Autonomy App React Native frontend. The parsed content can be directly used in job and mistake modules.

Example frontend integration:
```javascript
// Fetch job module content
const response = await fetch('http://localhost:3001/api/documents/your-doc-id?format=job');
const jobData = await response.json();

// Use in your React Native component
const jobSections = jobData.data.sections;
```
