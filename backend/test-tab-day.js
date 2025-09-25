/**
 * Test script for Tab + Day functionality
 * Run with: node test-tab-day.js
 */

const GoogleDocsService = require('./services/google-docs-service');
require('dotenv').config();

async function testTabDayFunctionality() {
  console.log('🧪 Testing Tab + Day Functionality\n');

  const docsService = new GoogleDocsService();

  try {
    const testDocId = process.env.SAMPLE_JOB_DOC_ID;
    
    if (!testDocId) {
      console.log('❌ No test document ID provided in .env file');
      console.log('Add SAMPLE_JOB_DOC_ID to test tab/day parsing');
      return;
    }

    console.log('📄 Testing document:', testDocId);

    // Test 1: Get available tabs
    console.log('\n1️⃣ Testing tab extraction...');
    try {
      const tabs = await docsService.getDocumentTabs(testDocId);
      console.log('✅ Available tabs:', tabs);
    } catch (error) {
      console.log('❌ Tab extraction failed:', error.message);
    }

    // Test 2: Get days from Mistakes tab
    console.log('\n2️⃣ Testing day extraction from Mistakes tab...');
    try {
      const mistakesDays = await docsService.getTabDays(testDocId, 'Mistakes');
      console.log('✅ Days in Mistakes tab:', mistakesDays);
    } catch (error) {
      console.log('❌ Mistakes tab days failed:', error.message);
    }

    // Test 3: Get days from Jobs tab
    console.log('\n3️⃣ Testing day extraction from Jobs tab...');
    try {
      const jobsDays = await docsService.getTabDays(testDocId, 'Jobs');
      console.log('✅ Days in Jobs tab:', jobsDays);
    } catch (error) {
      console.log('❌ Jobs tab days failed:', error.message);
    }

    // Test 4: Get specific day content
    console.log('\n4️⃣ Testing specific day content (Mistakes Day 1)...');
    try {
      const mistakesDay1 = await docsService.getDocument(testDocId, 'mistakes', {
        tab: 'Mistakes',
        day: 1
      });
      console.log('✅ Mistakes Day 1 content:');
      console.log('Title:', mistakesDay1.title);
      console.log('Day Title:', mistakesDay1.dayTitle);
      console.log('Sections:', Object.keys(mistakesDay1.sections));
      console.log('Sample section:', JSON.stringify(Object.values(mistakesDay1.sections)[0], null, 2));
    } catch (error) {
      console.log('❌ Mistakes Day 1 failed:', error.message);
    }

    // Test 5: Get Jobs Day 1 content
    console.log('\n5️⃣ Testing Jobs Day 1 content...');
    try {
      const jobsDay1 = await docsService.getDocument(testDocId, 'job', {
        tab: 'Jobs',
        day: 1
      });
      console.log('✅ Jobs Day 1 content:');
      console.log('Title:', jobsDay1.title);
      console.log('Day Title:', jobsDay1.dayTitle);
      console.log('Sections:', Object.keys(jobsDay1.sections));
    } catch (error) {
      console.log('❌ Jobs Day 1 failed:', error.message);
    }

    console.log('\n🎉 Tab/Day testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('1. Your Google Doc has tabs named "Mistakes" and "Jobs"');
    console.log('2. Each tab has content with "Day 1 - Title" format');
    console.log('3. Document is shared with your service account');
  }
}

// Example of expected document structure
function showExpectedStructure() {
  console.log('\n📖 Expected Google Doc structure:');
  console.log('');
  console.log('Tab: "Mistakes"');
  console.log('├── Day 1 - Understanding Mistakes');
  console.log('│   ├── Rules');
  console.log('│   │   • Everyone makes mistakes');
  console.log('│   │   • Mistakes help us learn');
  console.log('│   └── Instructions');
  console.log('│       • Talk about a mistake you made');
  console.log('└── Day 2 - Learning from Mistakes');
  console.log('    └── ...');
  console.log('');
  console.log('Tab: "Jobs"');
  console.log('├── Day 1 - Getting Started');
  console.log('│   ├── Rules');
  console.log('│   │   • Be on time');
  console.log('│   │   • Ask questions');
  console.log('│   └── Instructions');
  console.log('│       • Practice introductions');
  console.log('└── Day 2 - Working Together');
  console.log('    └── ...');
}

// Run tests
if (require.main === module) {
  showExpectedStructure();
  testTabDayFunctionality();
}

module.exports = { testTabDayFunctionality };
