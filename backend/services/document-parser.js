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
      metadata: {
        documentId: document.documentId,
        lastModified: new Date().toISOString(),
        totalSections: 0,
        tab: options.tab || null,
        day: options.day || null
      }
    };

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
          return tab.documentTab.body?.content || [];
        } else {
          console.warn('❌ Tab found but no documentTab property');
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
        
        // Check if this is a day header: "Day X - Title"
        const dayMatch = text.match(/^Day\s+(\d+)\s*-\s*(.+)$/i);
        
        if (dayMatch) {
          const foundDayNum = parseInt(dayMatch[1]);
          
          if (foundDayNum === dayNumber) {
            // Start capturing content for this day
            capturing = true;
            currentDay = foundDayNum;
            dayContent.push(element);
          } else if (capturing && foundDayNum > dayNumber) {
            // We've hit the next day, stop capturing
            break;
          } else if (capturing) {
            // We've hit a different day, stop capturing
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
    let text = '';
    const elements = paragraph.elements || [];
    
    elements.forEach(element => {
      if (element.textRun) {
        text += element.textRun.content || '';
      }
    });
    
    return text.trim();
  }

  /**
   * Parse content elements (abstracted from main parsing logic)
   * @param {Array} content - Content elements to parse
   */
  parseContent(content) {
    content.forEach(element => {
      if (element.paragraph) {
        this.parseParagraph(element.paragraph);
      }
    });
  }

  /**
   * Parse individual paragraph elements
   * @param {Object} paragraph - Paragraph element from Google Docs
   */
  parseParagraph(paragraph) {
    const elements = paragraph.elements || [];
    let text = '';
    let isHeader = false;

    // Extract text and check formatting
    elements.forEach(element => {
      if (element.textRun) {
        text += element.textRun.content || '';
        
        // Check if this is a header (bold, larger font, etc.)
        const textStyle = element.textRun.textStyle || {};
        if (textStyle.bold || textStyle.fontSize?.magnitude > 12) {
          isHeader = true;
        }
      }
    });

    // Clean up text
    text = text.trim();
    if (!text) return;

    // Determine content type and process accordingly
    if (this.isHeader(text, paragraph, isHeader)) {
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
    // Check paragraph style for heading
    const paragraphStyle = paragraph.paragraphStyle || {};
    const namedStyleType = paragraphStyle.namedStyleType;
    
    // Google Docs heading styles
    const headingStyles = [
      'HEADING_1', 'HEADING_2', 'HEADING_3', 
      'HEADING_4', 'HEADING_5', 'HEADING_6'
    ];
    
    return headingStyles.includes(namedStyleType) || 
           (isStyleHeader && !this.isBulletPoint(text)) ||
           (text.length < 50 && !text.includes('-') && text.endsWith(':') === false);
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
    // Clean header text
    const headerText = text.replace(/[:\s]*$/, '').trim();
    
    this.currentSection = this.sanitizeKey(headerText);
    this.parsedContent.sections[this.currentSection] = {
      title: headerText,
      type: 'section',
      items: [],
      content: ''
    };
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
   * @param {string} format - Output format ('job', 'mistakes', 'raw')
   * @returns {Object} - Formatted output
   */
  getFormattedOutput(format = 'raw') {
    switch (format) {
      case 'job':
        return this.formatForJobModule();
      case 'mistakes':
        return this.formatForMistakesModule();
      default:
        return this.parsedContent;
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
      lastUpdated: this.parsedContent.metadata.lastModified,
      tab: this.parsedContent.metadata.tab,
      day: this.parsedContent.metadata.day,
      dayTitle: this.parsedContent.dayTitle
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
