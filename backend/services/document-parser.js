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
   * @returns {Object} - Structured JSON representation
   */
  parseDocument(document) {
    this.parsedContent = {
      title: document.title || 'Untitled Document',
      sections: {},
      metadata: {
        documentId: document.documentId,
        lastModified: new Date().toISOString(),
        totalSections: 0
      }
    };

    const content = document.body?.content || [];
    
    content.forEach(element => {
      if (element.paragraph) {
        this.parseParagraph(element.paragraph);
      }
    });

    this.parsedContent.metadata.totalSections = Object.keys(this.parsedContent.sections).length;
    return this.parsedContent;
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
      title: this.parsedContent.title,
      sections: this.parsedContent.sections,
      lastUpdated: this.parsedContent.metadata.lastModified
    };
  }

  /**
   * Format content specifically for mistakes modules
   * @returns {Object} - Mistakes module formatted content
   */
  formatForMistakesModule() {
    return {
      moduleType: 'mistakes',
      title: this.parsedContent.title,
      sections: this.parsedContent.sections,
      lastUpdated: this.parsedContent.metadata.lastModified
    };
  }
}

module.exports = DocumentParser;
