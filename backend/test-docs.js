/**
 * Test script for Google Docs integration
 * Run with: npm run test
 */

const GoogleDocsService = require('./services/google-docs-service');
require('dotenv').config();

async function testGoogleDocsIntegration() {
  console.log('🧪 Testing Google Docs Integration\n');

  const docsService = new GoogleDocsService();

  try {
    // Test 1: Authentication
    console.log('1️⃣ Testing authentication...');
    const authSuccess = await docsService.testService();
    if (!authSuccess) {
      console.log('❌ Authentication failed - check your .env configuration');
      return;
    }
    console.log('✅ Authentication successful\n');

    // Test 2: Document parsing with sample content
    console.log('2️⃣ Testing document parsing...');
    
    // You can replace this with an actual document ID for testing
    const testDocId = process.env.SAMPLE_JOB_DOC_ID;
    
    if (testDocId) {
      console.log(`📄 Fetching document: ${testDocId}`);
      
      // Test different formats
      const formats = ['raw', 'job', 'mistakes'];
      
      for (const format of formats) {
        try {
          console.log(`\n📋 Testing format: ${format}`);
          const result = await docsService.getDocument(testDocId, format);
          console.log('✅ Success!');
          console.log('Sample output:', JSON.stringify(result, null, 2).substring(0, 300) + '...');
        } catch (error) {
          console.log(`❌ Failed for format ${format}:`, error.message);
        }
      }
    } else {
      console.log('⚠️ No test document ID provided in .env file');
      console.log('Add SAMPLE_JOB_DOC_ID to test document parsing');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has the correct Google service account credentials');
    console.log('2. Make sure the document is shared with your service account email');
    console.log('3. Verify the document ID is correct');
  }
}

// Example of how the parsed content should look
function showExampleOutput() {
  console.log('\n📖 Example of expected parsed output:');
  console.log('Input Google Doc content:');
  console.log('Rules');
  console.log('- Everyone puts $5');
  console.log('- Last person standing wins');
  console.log('');
  console.log('Instructions');
  console.log('- Follow the process carefully');
  console.log('- Ask questions if unclear');
  console.log('');
  
  console.log('Expected JSON output:');
  const exampleOutput = {
    title: 'Sample Job Module',
    sections: {
      rules: {
        title: 'Rules',
        type: 'section',
        items: [
          'Everyone puts $5',
          'Last person standing wins'
        ],
        content: ''
      },
      instructions: {
        title: 'Instructions',
        type: 'section',
        items: [
          'Follow the process carefully',
          'Ask questions if unclear'
        ],
        content: ''
      }
    },
    metadata: {
      documentId: 'sample-id',
      lastModified: '2024-01-01T00:00:00.000Z',
      totalSections: 2
    }
  };
  
  console.log(JSON.stringify(exampleOutput, null, 2));
}

// Run tests
if (require.main === module) {
  showExampleOutput();
  testGoogleDocsIntegration();
}

module.exports = { testGoogleDocsIntegration };
