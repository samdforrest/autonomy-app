/**
 * Test script to verify image detection in Google Docs
 * This will help us understand what's happening with image parsing
 */

const GoogleDocsService = require('./services/google-docs-service');

async function testImageDetection() {
  console.log('🧪 Testing Image Detection in Google Docs');
  console.log('==========================================\n');

  const docsService = new GoogleDocsService();
  
  try {
    console.log('1️⃣ Testing raw document (no tab/day filter)...');
    const rawResult = await docsService.getDocument('1_skllRRK6_JMgSrUiAQgZmmVMcN8QTE1fUe44DC7c20', 'raw');
    console.log('Raw document inline objects:', Object.keys(rawResult.inlineObjects || {}).length);
    
    console.log('\n2️⃣ Testing Mistakes tab, Day 1...');
    const day1Result = await docsService.getDocument('1_skllRRK6_JMgSrUiAQgZmmVMcN8QTE1fUe44DC7c20', 'mistakes', { tab: 'Mistakes', day: 1 });
    
    console.log('\n3️⃣ Testing Mistakes tab, Day 2...');
    const day2Result = await docsService.getDocument('1_skllRRK6_JMgSrUiAQgZmmVMcN8QTE1fUe44DC7c20', 'mistakes', { tab: 'Mistakes', day: 2 });
    
    console.log('\n4️⃣ Testing Mistakes tab, Day 3...');
    const day3Result = await docsService.getDocument('1_skllRRK6_JMgSrUiAQgZmmVMcN8QTE1fUe44DC7c20', 'mistakes', { tab: 'Mistakes', day: 3 });
    
    // Analyze results
    const results = [
      { name: 'Day 1', data: day1Result },
      { name: 'Day 2', data: day2Result },
      { name: 'Day 3', data: day3Result }
    ];
    
    console.log('\n📊 Image Detection Summary:');
    console.log('============================');
    
    results.forEach(result => {
      const imageCount = result.data.contentBlocks?.reduce((count, block) => {
        return count + (block.content?.filter(item => item.type === 'image').length || 0);
      }, 0) || 0;
      
      console.log(`${result.name}: ${imageCount} images found`);
      
      if (imageCount > 0) {
        result.data.contentBlocks?.forEach((block, blockIndex) => {
          const blockImages = block.content?.filter(item => item.type === 'image') || [];
          if (blockImages.length > 0) {
            console.log(`  Block ${blockIndex + 1} (${block.header || 'No header'}):`);
            blockImages.forEach((img, imgIndex) => {
              const uriType = img.uri?.startsWith('data:') ? 'DATA URL' : 
                             img.uri?.includes('googleusercontent.com') ? 'GOOGLE URL' : 'OTHER';
              console.log(`    Image ${imgIndex + 1}: ${uriType} - "${img.alt}"`);
            });
          }
        });
      }
    });
    
    console.log('\n✅ Image detection test completed!');
    
    const totalImages = results.reduce((total, result) => {
      return total + (result.data.contentBlocks?.reduce((count, block) => {
        return count + (block.content?.filter(item => item.type === 'image').length || 0);
      }, 0) || 0);
    }, 0);
    
    if (totalImages > 0) {
      console.log(`🎉 Found ${totalImages} total images across all days!`);
    } else {
      console.log('⚠️  No images detected. This could mean:');
      console.log('   - Images are in a different tab or day');
      console.log('   - Images are not being parsed correctly');
      console.log('   - The document doesn\'t contain inline objects');
    }
    
    return totalImages > 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testImageDetection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testImageDetection };
