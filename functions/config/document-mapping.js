/**
 * Document ID Mapping
 * Maps frontend document references to actual Google Docs IDs
 * Keeps sensitive document IDs secure on backend only
 */

require('dotenv').config();

const DOCUMENT_MAPPING = {
  'main_document': process.env.MAIN_DOCUMENT_ID,
  // Add more mappings as needed
  // 'secondary_document': process.env.SECONDARY_DOCUMENT_ID,
};

/**
 * Get actual document ID from reference
 * @param {string} documentRef - Document reference key
 * @returns {string} - Actual Google Docs document ID
 */
function getDocumentId(documentRef) {
  const documentId = DOCUMENT_MAPPING[documentRef];
  
  if (!documentId) {
    throw new Error(`Invalid document reference: ${documentRef}. Available references: ${Object.keys(DOCUMENT_MAPPING).join(', ')}`);
  }
  
  return documentId;
}

/**
 * Get all available document references
 * @returns {Array} - Array of available document reference keys
 */
function getAvailableDocumentRefs() {
  return Object.keys(DOCUMENT_MAPPING);
}

module.exports = {
  getDocumentId,
  getAvailableDocumentRefs,
  DOCUMENT_MAPPING
};
