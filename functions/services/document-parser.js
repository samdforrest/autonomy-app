/**
 * Google Docs Document Parser
 * Converts structured Google Docs content into JSON format
 * Handles headers and bullet points (dash-based lists)
 */
class DocumentParser {
  constructor() {
    this.currentSection = null;
    this.parsedContent = {};
    this.globalQuestionCounter = 0; // Global counter for unique question IDs
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
    this.globalQuestionCounter = 0; // Reset question counter for each document
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
        } else if (element && element.table) {
          console.log('📊 Found table element at index', index);
          this.parseTable(element.table);
        } else if (element) {
          console.log(`⚠️ Skipping element at index ${index}:`, Object.keys(element));
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
      /^Scenario:/i,
      /^Job:/i
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
    
    // Check if this text is a numbered list option (1., 2., 3., etc.)
    const numberedOptionMatch = text.match(/^(\d+)\.\s*(.+)$/);
    
    // Check if this text indicates an open-ended question
    const isOpenEnded = text.match(/^\(Open-ended\)$/i) || text.match(/^\(open\s*ended\)$/i);
    
    // Add to current content block
    if (this.currentBlock) {
      if (optionMatch) {
        // This is an option like "A: Something", "B: Something else"
        this.currentBlock.content.push({
          type: 'option',
          label: optionMatch[1], // A, B, C, etc.
          text: optionMatch[2].trim() // The text after the colon
        });
      } else if (numberedOptionMatch) {
        // This is a numbered option like "1. Great", "2. Good"
        // Convert number to letter for consistency (1->A, 2->B, etc.)
        const letterLabel = String.fromCharCode(64 + parseInt(numberedOptionMatch[1])); // 1->A, 2->B, etc.
        this.currentBlock.content.push({
          type: 'option',
          label: letterLabel,
          text: numberedOptionMatch[2].trim(),
          originalNumber: parseInt(numberedOptionMatch[1]) // Keep original number for reference
        });
      } else if (isOpenEnded) {
        // This indicates the previous question is open-ended
        this.currentBlock.content.push({
          type: 'open-ended-marker',
          text: text.trim()
        });
      } else {
        this.currentBlock.content.push({
          type: 'text',
          text: text
        });
      }
    } else {
      // If no current block exists, create one for orphan content
      let contentType = 'text';
      let contentData = { text: text };
      
      if (optionMatch) {
        contentType = 'option';
        contentData = {
          label: optionMatch[1],
          text: optionMatch[2].trim()
        };
      } else if (numberedOptionMatch) {
        contentType = 'option';
        const letterLabel = String.fromCharCode(64 + parseInt(numberedOptionMatch[1]));
        contentData = {
          label: letterLabel,
          text: numberedOptionMatch[2].trim(),
          originalNumber: parseInt(numberedOptionMatch[1])
        };
      } else if (isOpenEnded) {
        contentType = 'open-ended-marker';
        contentData = { text: text.trim() };
      }
      
      this.currentBlock = {
        id: this.parsedContent.contentBlocks.length + 1,
        header: null,
        content: [{
          type: contentType,
          ...contentData
        }],
        type: 'text'
      };
      this.parsedContent.contentBlocks.push(this.currentBlock);
    }
  }

  /**
   * Process inline objects (images, tables, charts) - optimized for copied/pasted content
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
    
    if (!embeddedObject) {
      console.warn('⚠️ No embedded object found:', inlineObjectId);
      return;
    }
    
    // Handle different types of embedded objects
    if (embeddedObject.imageProperties) {
      this.processImageObject(embeddedObject, inlineObjectId);
    } else if (embeddedObject.table) {
      console.log('📊 Processing TABLE object:', inlineObjectId);
      this.processTableObject(embeddedObject.table, inlineObjectId);
    } else if (embeddedObject.chart) {
      console.log('📈 Processing CHART object:', inlineObjectId);
      this.processChartObject(embeddedObject.chart, inlineObjectId);
    } else {
      console.warn('⚠️ Unknown inline object type:', inlineObjectId);
      console.warn('   Available properties:', Object.keys(embeddedObject));
      return;
    }
  }

  /**
   * Process image objects
   * @param {Object} embeddedObject - The embedded object containing image properties
   * @param {string} inlineObjectId - The inline object ID
   */
  processImageObject(embeddedObject, inlineObjectId) {
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
    
    // Add to current block
    this.addContentToCurrentBlock(imageData);
  }

  /**
   * Process table objects
   * @param {Object} table - The table object from Google Docs
   * @param {string} inlineObjectId - The inline object ID
   */
  processTableObject(table, inlineObjectId) {
    if (!table || !table.tableRows) {
      console.warn('⚠️ Table has no rows:', inlineObjectId);
      return;
    }

    const tableData = {
      type: 'table',
      id: inlineObjectId,
      rows: [],
      columns: 0
    };

    // Process each row
    table.tableRows.forEach((row, rowIndex) => {
      if (!row.tableCells) return;
      
      const rowData = {
        cells: [],
        isHeader: false // Don't automatically treat first row as header
      };

      row.tableCells.forEach((cell, cellIndex) => {
        let cellText = '';
        
        // Extract text from cell content
        if (cell.content) {
          cell.content.forEach(element => {
            if (element.paragraph && element.paragraph.elements) {
              element.paragraph.elements.forEach(textElement => {
                if (textElement.textRun && textElement.textRun.content) {
                  cellText += textElement.textRun.content;
                }
              });
            }
          });
        }

        rowData.cells.push({
          text: cellText.trim(),
          columnIndex: cellIndex
        });
      });

      // Update column count
      tableData.columns = Math.max(tableData.columns, rowData.cells.length);
      tableData.rows.push(rowData);
    });

    console.log('📊 Found table:', {
      rows: tableData.rows.length,
      columns: tableData.columns,
      id: inlineObjectId
    });

    // Add to current block
    this.addContentToCurrentBlock(tableData);
  }

  /**
   * Process chart objects (charts are often rendered as images by Google Docs API)
   * @param {Object} chart - The chart object from Google Docs
   * @param {string} inlineObjectId - The inline object ID
   */
  processChartObject(chart, inlineObjectId) {
    // Charts in Google Docs are often complex and may need special handling
    // For now, we'll extract basic information and potentially treat as image
    const chartData = {
      type: 'chart',
      id: inlineObjectId,
      title: chart.title || 'Chart',
      chartType: chart.chartType || 'unknown'
    };

    console.log('📈 Found chart:', {
      title: chartData.title,
      type: chartData.chartType,
      id: inlineObjectId
    });

    // Add to current block
    this.addContentToCurrentBlock(chartData);
  }

  /**
   * Parse table elements directly from Google Docs content structure
   * @param {Object} table - Table element from Google Docs
   */
  parseTable(table) {
    if (!table || !table.tableRows) {
      console.warn('⚠️ Table has no rows');
      return;
    }

    // Check if this is an assessment table (in Assessment Questions tab)
    console.log('🔍 Table detection check:', {
      currentTab: this.parsedContent.metadata.tab,
      isAssessmentTab: this.parsedContent.metadata.tab === 'Assessment Questions',
      tableRowCount: table.tableRows.length
    });
    
    const isAssessmentByTab = this.parsedContent.metadata.tab === 'Assessment Questions';
    const isAssessmentByContent = this.isAssessmentTable(table);
    
    if (isAssessmentByTab || isAssessmentByContent) {
      console.log('🎯 Detected assessment table - parsing as assessment');
      console.log('   - By tab:', isAssessmentByTab);
      console.log('   - By content:', isAssessmentByContent);
      this.parseAssessmentTable(table);
      return;
    }

    // Regular table parsing
    const tableData = {
      type: 'table',
      id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rows: [],
      columns: 0
    };

    console.log('📊 Processing regular table with', table.tableRows.length, 'rows');

    // Process each row
    table.tableRows.forEach((row, rowIndex) => {
      if (!row.tableCells) {
        console.warn(`⚠️ Row ${rowIndex} has no cells`);
        return;
      }
      
      const rowData = {
        cells: [],
        isHeader: false // Don't automatically treat first row as header
      };

      row.tableCells.forEach((cell, cellIndex) => {
        let cellText = '';
        
        // Extract text from cell content (cells contain content elements like paragraphs)
        if (cell.content) {
          cell.content.forEach(element => {
            if (element.paragraph && element.paragraph.elements) {
              element.paragraph.elements.forEach(textElement => {
                if (textElement.textRun && textElement.textRun.content) {
                  cellText += textElement.textRun.content;
                }
              });
            }
          });
        }

        rowData.cells.push({
          text: cellText.trim(),
          columnIndex: cellIndex
        });
      });

      // Update column count
      tableData.columns = Math.max(tableData.columns, rowData.cells.length);
      tableData.rows.push(rowData);
      
      console.log(`   Row ${rowIndex + 1}: ${rowData.cells.length} cells, header: ${rowData.isHeader}`);
    });

    console.log('📊 Table processed:', {
      rows: tableData.rows.length,
      columns: tableData.columns,
      id: tableData.id
    });

    // Add to current block
    this.addContentToCurrentBlock(tableData);
  }

  /**
   * Helper method to add content to current block or create new block
   * @param {Object} contentData - The content data to add
   */
  addContentToCurrentBlock(contentData) {
    if (this.currentBlock) {
      this.currentBlock.content = this.currentBlock.content || [];
      this.currentBlock.content.push(contentData);
    } else {
      // Create new block for standalone content
      this.currentBlock = {
        id: this.parsedContent.contentBlocks.length + 1,
        header: null,
        content: [contentData]
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

  /**
   * Check if a table is an assessment table by looking for score patterns
   * @param {Object} table - Table element from Google Docs
   * @returns {boolean}
   */
  isAssessmentTable(table) {
    if (!table.tableRows || table.tableRows.length < 2) return false;
    
    // Check if last column contains numeric scores (1-3 pattern)
    let hasScoreColumn = false;
    let scoreCount = 0;
    
    console.log('🔍 Checking table for assessment patterns...');
    table.tableRows.forEach((row, index) => {
      if (!row.tableCells) return;
      const lastCell = row.tableCells[row.tableCells.length - 1];
      const cellText = this.extractCellText(lastCell);
      console.log(`   Row ${index + 1}: Last cell = "${cellText}"`);
      if (cellText.match(/^[1-3]$/)) {
        scoreCount++;
        hasScoreColumn = true;
        console.log(`   ✓ Found score: ${cellText}`);
      }
    });
    
    // Consider it an assessment table if at least 2 rows have scores
    const isAssessment = hasScoreColumn && scoreCount >= 2;
    console.log(`🔍 Assessment table check: ${isAssessment} (${scoreCount} score rows found)`);
    return isAssessment;
  }

  /**
   * Extract text content from a table cell
   * @param {Object} cell - Table cell element
   * @returns {string}
   */
  extractCellText(cell) {
    let cellText = '';
    if (cell.content) {
      cell.content.forEach(element => {
        if (element.paragraph && element.paragraph.elements) {
          element.paragraph.elements.forEach(textElement => {
            if (textElement.textRun && textElement.textRun.content) {
              cellText += textElement.textRun.content;
            }
          });
        }
      });
    }
    return cellText.trim();
  }

  /**
   * Parse assessment table with module tagging and multi-select support
   * @param {Object} table - Table element from Google Docs
   */
  parseAssessmentTable(table) {
    console.log('🎯 Parsing assessment table with module tagging support');
    
    if (!table || !table.tableRows) {
      console.warn('⚠️ Assessment table has no rows');
      return;
    }

    const assessmentData = {
      type: 'assessment',
      id: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      questions: []
    };

    let currentQuestion = null;
    let currentModule = null;
    // Use global counter to ensure uniqueness across all tables
    
    table.tableRows.forEach((row, rowIndex) => {
      if (!row.tableCells) return;
      
      const cells = row.tableCells.map(cell => this.extractCellText(cell));
      
      // Skip empty rows
      if (cells.every(cell => !cell)) return;
      
      // Detect module header (e.g., "Mistakes:", "My Job, Your Job:")
      const moduleMatch = cells[0].match(/^(.*?):\s*(.*)$/);
      if (moduleMatch && !cells[cells.length - 1].match(/^[1-3]$/)) {
        const modulePrefix = moduleMatch[1].trim();
        const questionText = moduleMatch[2].trim();
        
        // Map module prefixes to module IDs
        currentModule = this.mapModulePrefix(modulePrefix);
        console.log(`📋 Found module header: "${modulePrefix}" → ${currentModule}`);
        
        if (questionText) {
          // This row contains both module tag and question
          const questionId = `assessment_q_${this.globalQuestionCounter++}`;
          currentQuestion = {
            id: questionId,
            question: questionText,
            module: currentModule,
            type: 'multi-select',
            options: []
          };
          assessmentData.questions.push(currentQuestion);
          console.log(`📝 Found question: "${questionText}" (Module: ${currentModule}) - ID: ${questionId}`);
        }
        return;
      }
      
      // Detect question row (longer text, no score in last cell)
      const isQuestionRow = cells[0] && cells[0].length > 30 && !cells[cells.length - 1].match(/^[1-3]$/);
      
      if (isQuestionRow) {
        const questionId = `assessment_q_${this.globalQuestionCounter++}`;
        currentQuestion = {
          id: questionId,
          question: cells[0],
          module: currentModule || 'general',
          type: 'multi-select',
          options: []
        };
        assessmentData.questions.push(currentQuestion);
        console.log(`📝 Found question: "${cells[0].substring(0, 60)}..." (Module: ${currentModule || 'general'}) - ID: ${questionId}`);
      } else if (currentQuestion && cells[0] && cells[cells.length - 1].match(/^[1-3]$/)) {
        // This is an option row (has text and ends with a score)
        const optionText = cells[0];
        const score = parseInt(cells[cells.length - 1]);
        
        const option = {
          id: `${currentQuestion.id}_option_${currentQuestion.options.length}`,
          text: optionText,
          score: score
        };
        
        currentQuestion.options.push(option);
        console.log(`   ✓ Added option: "${optionText}" (Score: ${score})`);
      }
    });

    console.log('🎯 Assessment parsing complete:', {
      questionsFound: assessmentData.questions.length,
      totalOptions: assessmentData.questions.reduce((sum, q) => sum + q.options.length, 0),
      moduleBreakdown: this.getModuleBreakdown(assessmentData.questions),
      questionIds: assessmentData.questions.map(q => q.id)
    });

    // Add to current block
    this.addContentToCurrentBlock(assessmentData);
  }

  /**
   * Map module prefixes to standardized module IDs
   * @param {string} prefix - Module prefix from Google Docs
   * @returns {string} - Standardized module ID
   */
  mapModulePrefix(prefix) {
    const lowerPrefix = prefix.toLowerCase();
    
    // Map various prefixes to module IDs
    // NOTE: Order matters! More specific matches must come before general ones
    if (lowerPrefix.includes('mistake')) return 'mistakes';
    if (lowerPrefix.includes('job') || lowerPrefix.includes('work')) return 'job';
    if (lowerPrefix.includes('regulation') || lowerPrefix.includes('control') || lowerPrefix.includes('emotion')) return 'regulation';
    if (lowerPrefix.includes('collaboration') || lowerPrefix.includes('team')) return 'collaboration';
    if (lowerPrefix.includes('monitor') || lowerPrefix.includes('monitoring')) return 'selfmonitoring';
    if (lowerPrefix.includes('coach') || (lowerPrefix.includes('self') && lowerPrefix.includes('coach'))) return 'selfcoach';
    if (lowerPrefix.includes('curiosity') || lowerPrefix.includes('wonder')) return 'curiosity';
    if (lowerPrefix.includes('shape') || lowerPrefix.includes('learning')) return 'shapeoflearning';
    if (lowerPrefix.includes('neuroplasticity') || lowerPrefix.includes('growth') || lowerPrefix.includes('brain')) return 'neuroplasticity';
    if (lowerPrefix.includes('mastery') || lowerPrefix.includes('moment')) return 'masterymoments';
    
    // Return original if no match found (cleaned up)
    return prefix.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Get breakdown of questions by module
   * @param {Array} questions - Array of assessment questions
   * @returns {Object} - Module breakdown
   */
  getModuleBreakdown(questions) {
    const breakdown = {};
    questions.forEach(q => {
      if (!breakdown[q.module]) breakdown[q.module] = 0;
      breakdown[q.module]++;
    });
    return breakdown;
  }
}

module.exports = DocumentParser;
