/**
 * Google Docs Document Parser
 * Converts structured Google Docs content into JSON format
 * Handles headers and bullet points (dash-based lists)
 */
class DocumentParser {
  constructor() {
    this.currentSection = null;
    this.parsedContent = {};
  }

  /**
   * Main parsing function - converts Google Docs content to structured JSON
   * @param {Object} document - Google Docs API document response
   * @param {Object} options - Parsing options { tab, day }
   * @returns {Object} - Structured JSON representation
   */
  parseDocument(document, options = {}) {
    this.parsedContent = {
      title: document.title || 'Untitled Document',
      sections: {},
      contentBlocks: [], // New: Array of content blocks for bubble display
      metadata: {
        documentId: document.documentId,
        lastModified: new Date().toISOString(),
        totalSections: 0,
        tab: options.tab || null,
        day: options.day || null
      }
    };
    this.currentBlock = null; // Track current content block
    this.inlineObjects = document.inlineObjects || {}; // Store inline objects (images) for reference
    
    // Debug: Log inline objects found in document
    const inlineObjectCount = Object.keys(this.inlineObjects).length;
    console.log(`🔍 Found ${inlineObjectCount} inline objects in document`);
    if (inlineObjectCount > 0) {
      Object.keys(this.inlineObjects).forEach(id => {
        const obj = this.inlineObjects[id];
        const hasImage = obj.objectProperties?.embeddedObject?.imageProperties;
        console.log(`   - ${id}: ${hasImage ? 'IMAGE' : 'OTHER'}`);
        if (hasImage) {
          const contentUri = obj.objectProperties.embeddedObject.imageProperties.contentUri;
          const isDataUrl = contentUri && contentUri.startsWith('data:');
          console.log(`     URI type: ${isDataUrl ? 'DATA URL (base64)' : 'EXTERNAL URL'}`);
        }
      });
    }

    // If tab is specified, try to find and parse that tab
    if (options.tab) {
      const tabContent = this.extractTabContent(document, options.tab);
      if (tabContent.length === 0) {
        throw new Error(`Tab "${options.tab}" not found in document`);
      }
      
      // If day is also specified, filter content for that specific day
      if (options.day) {
        const dayContent = this.extractDayContent(tabContent, options.day);
        if (dayContent.length === 0) {
          throw new Error(`Day ${options.day} not found in tab "${options.tab}"`);
        }
        this.parseContent(dayContent);
        
        // Extract day title from "Day X - Title" format
        const dayTitle = this.extractDayTitle(dayContent, options.day);
        if (dayTitle) {
          this.parsedContent.dayTitle = dayTitle;
        }
      } else {
        this.parseContent(tabContent);
      }
    } else {
      // Default behavior - parse main document body
      const content = document.body?.content || [];
      this.parseContent(content);
    }

    this.parsedContent.metadata.totalSections = Object.keys(this.parsedContent.sections).length;
    
    // Log content blocks summary
    console.log('📦 Total content blocks created:', this.parsedContent.contentBlocks.length);
    this.parsedContent.contentBlocks.forEach((block, index) => {
      console.log(`   Block ${index + 1}: "${block.header}" (${block.content.length} items)`);
    });
    
    return this.parsedContent;
  }

  /**
   * Extract content from a specific tab
   * @param {Object} document - Google Docs document
   * @param {string} tabName - Name of the tab to extract
   * @returns {Array} - Content elements from the specified tab
   */
  extractTabContent(document, tabName) {
    // Debug: Log the entire document structure to understand tabs
    console.log('🔍 Document structure keys:', Object.keys(document));
    console.log('🔍 Document tabs:', document.tabs ? 'exists' : 'missing');
    
    if (document.tabs) {
      console.log('🔍 Number of tabs found:', document.tabs.length);
      document.tabs.forEach((tab, index) => {
        console.log(`🔍 Tab ${index}:`, {
          tabProperties: tab.tabProperties,
          hasDocumentTab: !!tab.documentTab,
          keys: Object.keys(tab)
        });
      });
      
      const tab = document.tabs.find(t => 
        t.tabProperties?.title?.toLowerCase() === tabName.toLowerCase()
      );
      
      if (tab) {
        console.log('✅ Found matching tab:', tab.tabProperties?.title);
        if (tab.documentTab) {
          console.log('🔍 Tab documentTab exists');
          console.log('🔍 Tab documentTab.body exists:', !!tab.documentTab.body);
          console.log('🔍 Tab documentTab.body.content exists:', !!tab.documentTab.body?.content);
          
          // Store inline objects from the tab for image processing
          if (tab.documentTab.inlineObjects) {
            console.log('🔍 Found inline objects in tab:', Object.keys(tab.documentTab.inlineObjects).length);
            this.inlineObjects = { ...this.inlineObjects, ...tab.documentTab.inlineObjects };
          }
          
          if (tab.documentTab.body && tab.documentTab.body.content) {
            return tab.documentTab.body.content;
          } else if (tab.documentTab.body) {
            console.warn('❌ Tab body exists but no content property');
            return [];
          } else {
            console.warn('❌ Tab documentTab exists but no body property');
            return [];
          }
        } else {
          console.warn('❌ Tab found but no documentTab property');
          return [];
        }
      } else {
        console.warn(`❌ Tab "${tabName}" not found. Available tabs:`, 
          document.tabs.map(t => t.tabProperties?.title).filter(Boolean)
        );
      }
    } else {
      console.warn('❌ No tabs structure found in document');
    }
    
    // Fallback: if no tabs structure, assume single document
    console.warn(`Tab "${tabName}" not found, using main document body`);
    return document.body?.content || [];
  }

  /**
   * Extract content for a specific day from tab content
   * @param {Array} content - Content elements from a tab
   * @param {number} dayNumber - Day number to extract (1, 2, 3, etc.)
   * @returns {Array} - Content elements for the specified day
   */
  extractDayContent(content, dayNumber) {
    const dayContent = [];
    let currentDay = null;
    let capturing = false;

    for (const element of content) {
      if (element.paragraph) {
        const text = this.extractTextFromParagraph(element.paragraph);
        
        // Check if this is a day header: "Day X - Title", "Day X:", or "Day X"
        const dayMatch = text.match(/^Day\s+(\d+)(?:\s*[-:]\s*(.+)?)?$/i);
        
        if (dayMatch) {
          const foundDayNum = parseInt(dayMatch[1]);
          
          if (foundDayNum === dayNumber) {
            // Start capturing content for this day
            capturing = true;
            currentDay = foundDayNum;
            dayContent.push(element);
            console.log(`🔖 Found Day ${dayNumber} delimiter, starting capture`);
          } else if (capturing) {
            // We've hit a different day marker, stop capturing
            console.log(`🔖 Found Day ${foundDayNum} delimiter, stopping capture for Day ${dayNumber}`);
            break;
          }
        } else if (capturing) {
          // We're in the right day, capture this content
          dayContent.push(element);
        }
      } else if (capturing) {
        // Capture non-paragraph elements too (tables, etc.)
        dayContent.push(element);
      }
    }

    console.log(`📋 Captured ${dayContent.length} elements for Day ${dayNumber}`);
    return dayContent;
  }

  /**
   * Extract day title from "Day X - Title" format
   * @param {Array} content - Day content elements
   * @param {number} dayNumber - Day number
   * @returns {string|null} - Extracted title or null
   */
  extractDayTitle(content, dayNumber) {
    for (const element of content) {
      if (element.paragraph) {
        const text = this.extractTextFromParagraph(element.paragraph);
        const dayMatch = text.match(/^Day\s+(\d+)\s*-\s*(.+)$/i);
        
        if (dayMatch && parseInt(dayMatch[1]) === dayNumber) {
          return dayMatch[2].trim();
        }
      }
    }
    return null;
  }

  /**
   * Extract text content from a paragraph element
   * @param {Object} paragraph - Paragraph element
   * @returns {string} - Extracted text
   */
  extractTextFromParagraph(paragraph) {
    if (!paragraph) {
      return '';
    }
    
    let text = '';
    const elements = paragraph.elements || [];
    
    elements.forEach(element => {
      if (element && element.textRun && element.textRun.content) {
        text += element.textRun.content;
      }
    });
    
    return text.trim();
  }

  /**
   * Parse content elements (abstracted from main parsing logic)
   * @param {Array} content - Content elements to parse
   */
  parseContent(content) {
    if (!content || !Array.isArray(content)) {
      console.warn('⚠️ parseContent called with invalid content:', typeof content);
      return;
    }
    
    content.forEach((element, index) => {
      try {
        if (element && element.paragraph) {
          this.parseParagraph(element.paragraph);
        }
      } catch (error) {
        console.error(`❌ Error parsing element at index ${index}:`, error.message);
        console.error('Element keys:', element ? Object.keys(element) : 'element is null/undefined');
      }
    });
  }

  /**
   * Parse individual paragraph elements
   * @param {Object} paragraph - Paragraph element from Google Docs
   */
  parseParagraph(paragraph) {
    if (!paragraph) {
      console.warn('⚠️ parseParagraph called with undefined paragraph');
      return;
    }
    
    const elements = paragraph.elements || [];
    let text = '';
    let isHeader = false;

    // Extract text and check formatting, also handle inline objects (images)
    elements.forEach(element => {
      if (element && element.textRun) {
        text += element.textRun.content || '';
        
        // Check if this is a header (bold, larger font, etc.)
        const textStyle = element.textRun.textStyle || {};
        if (textStyle.bold || textStyle.fontSize?.magnitude > 12) {
          isHeader = true;
        }
      } else if (element && element.inlineObjectElement) {
        // Handle inline objects (images)
        console.log('🔍 Found inlineObjectElement:', element.inlineObjectElement.inlineObjectId);
        this.processInlineObject(element.inlineObjectElement);
      }
    });

    // Clean up text
    text = text.trim();
    if (!text) return;

    // Check if this is a day delimiter (e.g., "Day 1 - Lesson and Goal Set", "Day 2:", "Day 3")
    const dayDelimiterMatch = text.match(/^Day\s+(\d+)(?:\s*[-:]\s*.*)?$/i);
    if (dayDelimiterMatch) {
      console.log('🔖 Day delimiter detected (skipping from content):', text);
      return; // Skip day delimiters - they're not part of the content
    }

    // Determine content type and process accordingly
    const isHeaderDetected = this.isHeader(text, paragraph, isHeader);
    
    if (isHeaderDetected) {
      console.log('✅ Header detected:', text.substring(0, 60) + (text.length > 60 ? '...' : ''));
      this.processHeader(text);
    } else if (this.isBulletPoint(text)) {
      this.processBulletPoint(text);
    } else if (text.length > 0) {
      this.processRegularText(text);
    }
  }

  /**
   * Check if text represents a header
   * @param {string} text - Text content
   * @param {Object} paragraph - Paragraph object
   * @param {boolean} isStyleHeader - Whether styling suggests header
   * @returns {boolean}
   */
  isHeader(text, paragraph, isStyleHeader) {
    // Special case: If we're inside a scenario block, A:, B:, C:, Answer: are NOT headers
    const isInScenario = this.currentBlock && this.currentBlock.header && 
                         this.currentBlock.header.toLowerCase().includes('scenario:');
    
    if (isInScenario) {
      // Check if this is an option (A:, B:, C:, etc.) or Answer:
      if (text.match(/^([A-Z]):\s*.+$/) || text.toLowerCase().startsWith('answer:')) {
        return false; // Not a header, keep it in the scenario block
      }
    }
    
    // Check paragraph style for heading
    const paragraphStyle = paragraph.paragraphStyle || {};
    const namedStyleType = paragraphStyle.namedStyleType;
    
    // Google Docs heading styles
    const headingStyles = [
      'HEADING_1', 'HEADING_2', 'HEADING_3', 
      'HEADING_4', 'HEADING_5', 'HEADING_6'
    ];
    
    // Check if it's a Google Docs heading style
    if (headingStyles.includes(namedStyleType)) {
      return true;
    }
    
    // Check if text ends with colon (common header pattern like "Discuss:", "Read the Purpose Together:")
    if (text.endsWith(':')) {
      return true;
    }
    
    // Check if it's bold/styled text that's reasonably short and not a bullet point
    if (isStyleHeader && !this.isBulletPoint(text) && text.length < 100) {
      return true;
    }
    
    // Check for common header patterns
    const headerPatterns = [
      /^Read the Purpose Together/i,
      /^Discuss/i,
      /^Activity/i,
      /^Instructions/i,
      /^Think Together/i,
      /^Remember/i,
      /^Closing Conversation/i,
      /^Scenario:/i
    ];
    
    return headerPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check if text represents a bullet point (dash-based)
   * @param {string} text - Text content
   * @returns {boolean}
   */
  isBulletPoint(text) {
    return text.startsWith('- ') || text.startsWith('• ') || text.match(/^\s*[-•]\s+/);
  }

  /**
   * Process header text and create new section
   * @param {string} text - Header text
   */
  processHeader(text) {
    // Clean header text (but preserve the colon for display)
    const headerText = text.trim();
    
    console.log('📌 Creating new content block with header:', headerText);
    
    // Special case: If this is "Instructions:" and the previous block is "Activity:", 
    // merge it into the Activity block instead of creating a new one
    const lowerHeader = headerText.toLowerCase();
    if (lowerHeader.includes('instructions:') && this.currentBlock && 
        this.currentBlock.header && this.currentBlock.header.toLowerCase().includes('activity:')) {
      console.log('🔗 Merging Instructions into Activity block');
      // Add instructions as a sub-header within the current Activity block
      this.currentBlock.content.push({
        type: 'subheader',
        text: headerText
      });
      // Update the current section but don't create a new block
      this.currentSection = this.sanitizeKey(headerText);
      this.parsedContent.sections[this.currentSection] = {
        title: headerText,
        type: 'section',
        items: [],
        content: ''
      };
      return; // Don't create a new block
    }
    
    // Special case: If this is content after "Closing Conversation:", group it together
    if (this.currentBlock && this.currentBlock.header && 
        this.currentBlock.header.toLowerCase().includes('closing conversation:')) {
      // Continue adding to the Closing Conversation block until we hit a day delimiter
      console.log('🔗 Adding to Closing Conversation block');
      this.currentBlock.content.push({
        type: 'subheader',
        text: headerText
      });
      this.currentSection = this.sanitizeKey(headerText);
      this.parsedContent.sections[this.currentSection] = {
        title: headerText,
        type: 'section',
        items: [],
        content: ''
      };
      return; // Don't create a new block
    }
    
    this.currentSection = this.sanitizeKey(headerText);
    this.parsedContent.sections[this.currentSection] = {
      title: headerText,
      type: 'section',
      items: [],
      content: ''
    };
    
    // Create a new content block for bubble display
    this.currentBlock = {
      id: this.parsedContent.contentBlocks.length + 1,
      header: headerText,
      content: [],
      type: 'text'
    };
    this.parsedContent.contentBlocks.push(this.currentBlock);
  }

  /**
   * Process bullet point and add to current section
   * @param {string} text - Bullet point text
   */
  processBulletPoint(text) {
    // Clean bullet point text
    const bulletText = text.replace(/^[\s-•]+/, '').trim();
    
    if (this.currentSection && bulletText) {
      this.parsedContent.sections[this.currentSection].items.push(bulletText);
    } else if (!this.currentSection) {
      // Create default section if no header exists
      this.currentSection = 'general';
      this.parsedContent.sections[this.currentSection] = {
        title: 'General',
        type: 'section',
        items: [bulletText],
        content: ''
      };
    }
    
    // Add to current content block
    if (this.currentBlock) {
      this.currentBlock.content.push({
        type: 'bullet',
        text: bulletText
      });
    }
  }

  /**
   * Process regular text content
   * @param {string} text - Regular text content
   */
  processRegularText(text) {
    if (this.currentSection) {
      const existingContent = this.parsedContent.sections[this.currentSection].content;
      this.parsedContent.sections[this.currentSection].content = 
        existingContent ? `${existingContent}\n${text}` : text;
    }
    
    // Check if this text is an option (A:, B:, C:, D:, etc.)
    const optionMatch = text.match(/^([A-Z]):\s*(.+)$/);
    
    // Add to current content block
    if (this.currentBlock) {
      if (optionMatch) {
        // This is an option like "A: Something", "B: Something else"
        this.currentBlock.content.push({
          type: 'option',
          label: optionMatch[1], // A, B, C, etc.
          text: optionMatch[2].trim() // The text after the colon
        });
      } else {
        this.currentBlock.content.push({
          type: 'text',
          text: text
        });
      }
    } else {
      // If no current block exists, create one for orphan content
      this.currentBlock = {
        id: this.parsedContent.contentBlocks.length + 1,
        header: null,
        content: [{
          type: optionMatch ? 'option' : 'text',
          text: optionMatch ? optionMatch[2].trim() : text,
          ...(optionMatch && { label: optionMatch[1] })
        }],
        type: 'text'
      };
      this.parsedContent.contentBlocks.push(this.currentBlock);
    }
  }

  /**
   * Process inline objects (images) - optimized for copied/pasted images
   * @param {Object} inlineObjectElement - Inline object element from Google Docs
   */
  processInlineObject(inlineObjectElement) {
    const inlineObjectId = inlineObjectElement.inlineObjectId;
    
    if (!inlineObjectId || !this.inlineObjects[inlineObjectId]) {
      console.warn('⚠️ Inline object not found:', inlineObjectId);
      return;
    }
    
    // Debug: Uncomment to see full object structure
    // console.log('🔍 Full inline object structure for', inlineObjectId, ':', JSON.stringify(this.inlineObjects[inlineObjectId], null, 2));
    
    const inlineObject = this.inlineObjects[inlineObjectId];
    const embeddedObject = inlineObject.inlineObjectProperties?.embeddedObject;
    
    if (!embeddedObject || !embeddedObject.imageProperties) {
      console.warn('⚠️ Inline object is not an image:', inlineObjectId);
      console.warn('   Object type:', embeddedObject ? Object.keys(embeddedObject) : 'No embeddedObject');
      if (embeddedObject) {
        console.warn('   Available properties:', Object.keys(embeddedObject));
        if (embeddedObject.table) console.warn('   -> This is a TABLE');
        if (embeddedObject.drawing) console.warn('   -> This is a DRAWING');
        if (embeddedObject.chart) console.warn('   -> This is a CHART');
      }
      return;
    }
    
    const imageProperties = embeddedObject.imageProperties;
    const contentUri = imageProperties.contentUri || imageProperties.sourceUri;
    
    if (!contentUri) {
      console.warn('⚠️ Image has no contentUri or sourceUri:', inlineObjectId);
      return;
    }
    
    // Check if this is a data URL (copied/pasted image) or external URL
    const isDataUrl = contentUri.startsWith('data:');
    const isGoogleUrl = contentUri.includes('googleusercontent.com') || contentUri.includes('drive.google.com');
    
    const imageData = {
      type: 'image',
      uri: contentUri,
      alt: embeddedObject.title || embeddedObject.description || 'Image from Google Doc',
      width: imageProperties.cropProperties?.width?.magnitude || null,
      height: imageProperties.cropProperties?.height?.magnitude || null,
    };
    
    console.log('🖼️ Found image:', {
      alt: imageData.alt,
      uriType: isDataUrl ? 'DATA URL (base64)' : isGoogleUrl ? 'GOOGLE URL' : 'OTHER URL',
      hasUri: !!imageData.uri,
      dimensions: imageData.width && imageData.height ? `${imageData.width}x${imageData.height}` : 'unknown'
    });
    
    // Add to current content block
    if (this.currentBlock) {
      this.currentBlock.content.push(imageData);
    } else {
      // Create a new block for orphan images
      this.currentBlock = {
        id: this.parsedContent.contentBlocks.length + 1,
        header: null,
        content: [imageData],
        type: 'image'
      };
      this.parsedContent.contentBlocks.push(this.currentBlock);
    }
  }

  /**
   * Convert text to valid JSON key
   * @param {string} text - Text to sanitize
   * @returns {string} - Sanitized key
   */
  sanitizeKey(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Get formatted output for specific use cases
   * @param {string} format - Output format ('job', 'mistakes', 'regulation', 'raw')
   * @returns {Object} - Formatted output
   */
  getFormattedOutput(format = 'raw') {
    switch (format) {
      case 'job':
        return this.formatForJobModule();
      case 'mistakes':
        return this.formatForMistakesModule();
      case 'regulation':
        return this.formatForRegulationModule();
      default:
        // Raw format also includes contentBlocks
        return {
          ...this.parsedContent,
          contentBlocks: this.parsedContent.contentBlocks
        };
    }
  }

  /**
   * Format content specifically for job modules
   * @returns {Object} - Job module formatted content
   */
  formatForJobModule() {
    return {
      moduleType: 'job',
      title: this.parsedContent.dayTitle || this.parsedContent.title,
      sections: this.parsedContent.sections,
      lastUpdated: this.parsedContent.metadata.lastModified,
      tab: this.parsedContent.metadata.tab,
      day: this.parsedContent.metadata.day,
      dayTitle: this.parsedContent.dayTitle
    };
  }

  /**
   * Format content specifically for mistakes modules
   * @returns {Object} - Mistakes module formatted content
   */
  formatForMistakesModule() {
    return {
      moduleType: 'mistakes',
      title: this.parsedContent.dayTitle || this.parsedContent.title,
      sections: this.parsedContent.sections,
      contentBlocks: this.parsedContent.contentBlocks, // New: Include content blocks
      lastUpdated: this.parsedContent.metadata.lastModified,
      tab: this.parsedContent.metadata.tab,
      day: this.parsedContent.metadata.day,
      dayTitle: this.parsedContent.dayTitle,
      metadata: this.parsedContent.metadata
    };
  }

  /**
   * Format content specifically for regulation modules
   * @returns {Object} - Regulation module formatted content
   */
  formatForRegulationModule() {
    return {
      moduleType: 'regulation',
      title: this.parsedContent.dayTitle || this.parsedContent.title,
      sections: this.parsedContent.sections,
      contentBlocks: this.parsedContent.contentBlocks,
      lastUpdated: this.parsedContent.metadata.lastModified,
      tab: this.parsedContent.metadata.tab,
      day: this.parsedContent.metadata.day,
      dayTitle: this.parsedContent.dayTitle,
      metadata: this.parsedContent.metadata
    };
  }

  /**
   * Extract available tabs from document
   * @param {Object} document - Google Docs document
   * @returns {Array} - Array of tab names
   */
  extractTabs(document) {
    console.log('🔍 Extracting tabs from document');
    console.log('🔍 Document has tabs property:', !!document.tabs);
    
    if (document.tabs) {
      console.log('🔍 Found', document.tabs.length, 'tabs');
      const tabNames = document.tabs.map(tab => {
        const title = tab.tabProperties?.title;
        console.log('🔍 Tab title:', title);
        return title;
      }).filter(Boolean);
      
      console.log('🔍 Extracted tab names:', tabNames);
      return tabNames;
    }
    
    console.log('🔍 No tabs found, returning fallback');
    return ['Main Document']; // Fallback for documents without tabs
  }

  /**
   * Extract available days from a specific tab
   * @param {Object} document - Google Docs document
   * @param {string} tabName - Tab name to search in
   * @returns {Array} - Array of day objects { day: number, title: string }
   */
  extractDaysFromTab(document, tabName) {
    const tabContent = this.extractTabContent(document, tabName);
    const days = [];

    for (const element of tabContent) {
      if (element.paragraph) {
        const text = this.extractTextFromParagraph(element.paragraph);
        const dayMatch = text.match(/^Day\s+(\d+)\s*-\s*(.+)$/i);
        
        if (dayMatch) {
          days.push({
            day: parseInt(dayMatch[1]),
            title: dayMatch[2].trim(),
            fullTitle: text.trim()
          });
        }
      }
    }

    return days.sort((a, b) => a.day - b.day);
  }
}

module.exports = DocumentParser;
