/**
 * Color Inheritance Utility
 * Provides core functions for color-coding content blocks based on keywords
 * and implementing color inheritance across modules
 */

// Unified color keyword mapping - used across all modules
export const COLOR_KEYWORDS = {
  'read the purpose together:': 'yellow',
  'opener:': 'green',
  'scenario:': 'orange',
  'activity:': 'orange',
  'learning:': 'blue',
  'connect and share:': 'green',
  'closing conversation:': 'purple',
  'instructions:': 'blue',
  'question:': 'purple',
  'answer:': 'green',
  'tip:': 'teal',
} as const;

export type ColorType = typeof COLOR_KEYWORDS[keyof typeof COLOR_KEYWORDS];

interface ContentBlock {
  id?: number | string;
  header: string | null;
  content?: any[];
}

/**
 * Get color from a header if it contains a keyword
 * @param header - The header text to check
 * @returns Color name if keyword found, null otherwise
 */
export function getColorFromHeader(header: string | null): ColorType | null {
  if (!header) return null;
  
  const lowerHeader = header.toLowerCase();
  
  for (const [keyword, color] of Object.entries(COLOR_KEYWORDS)) {
    if (lowerHeader.includes(keyword)) {
      return color;
    }
  }
  
  return null;
}

/**
 * Pre-compute color for each block based on inheritance
 * Blocks inherit the color from the most recent keyword-setting block
 * @param blocks - Array of content blocks
 * @returns Map of block ID/index to color name
 */
export function computeBlockColors(blocks: ContentBlock[]): Map<number | string, ColorType> {
  const colorMap = new Map<number | string, ColorType>();
  
  if (!blocks || blocks.length === 0) {
    return colorMap;
  }
  
  let currentColor: ColorType | null = null;
  
  blocks.forEach((block, index) => {
    // Check if this block has a color keyword
    const blockColor = getColorFromHeader(block.header);
    
    if (blockColor) {
      currentColor = blockColor;
    }
    
    // Store the color for this block (inherited or new)
    if (currentColor) {
      const blockKey = block.id !== undefined ? block.id : index;
      colorMap.set(blockKey, currentColor);
    }
  });
  
  return colorMap;
}

/**
 * Get contextual bubble style based on header and inheritance
 * @param header - The header text of the current block
 * @param blockIndex - Index of the block in the array
 * @param blockId - Optional block ID
 * @param blockColorsMap - Pre-computed color map from computeBlockColors
 * @returns Style object for the bubble
 */
export function getContextualBubbleStyle(
  header: string | null,
  blockIndex: number,
  blockColorsMap: Map<number | string, ColorType>,
  blockId?: number | string
): ColorType | null {
  // Check if this block has its own color keyword
  const blockColor = getColorFromHeader(header);
  
  if (blockColor) {
    return blockColor;
  }
  
  // Otherwise, inherit from pre-computed map
  const inheritedColor = blockId !== undefined 
    ? blockColorsMap.get(blockId) 
    : blockColorsMap.get(blockIndex);
  
  return inheritedColor || null;
}

