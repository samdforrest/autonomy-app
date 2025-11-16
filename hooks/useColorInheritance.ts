/**
 * Color Inheritance Hook
 * React hook that provides color inheritance functionality for content blocks
 */

import { useMemo } from 'react';
import {
  ColorType,
  computeBlockColors,
  getContextualBubbleStyle
} from '../utils/colorInheritance';

interface ContentBlock {
  id?: number | string;
  header: string | null;
  content?: any[];
}

interface StyleMap {
  orange?: any;
  blue?: any;
  green?: any;
  purple?: any;
  yellow?: any;
  teal?: any;
}

interface UseColorInheritanceReturn {
  getBubbleStyle: (header: string | null, blockIndex: number, blockId?: number | string) => any;
  blockColors: Map<number | string, ColorType>;
}

/**
 * Hook for color inheritance in content blocks
 * @param contentBlocks - Array of content blocks to process
 * @param styles - Style object containing bubble color styles (bubbleOrange, bubbleBlue, etc.)
 * @returns Object with getBubbleStyle function and blockColors map
 */
export function useColorInheritance(
  contentBlocks: ContentBlock[] | undefined,
  styles: StyleMap
): UseColorInheritanceReturn {
  // Pre-compute colors for all blocks
  const blockColors = useMemo(() => {
    if (!contentBlocks) {
      return new Map<number | string, ColorType>();
    }
    return computeBlockColors(contentBlocks);
  }, [contentBlocks]);

  // Helper to convert color name to style object
  const getStyleForColor = (color: ColorType | null): any => {
    if (!color) return {};
    
    const styleMap: Record<string, any> = {
      // Day-specific styles
      day1: styles.day1 || {},
      day2: styles.day2 || {},
      day3: styles.day3 || {},
      day4: styles.day4 || {},
      day5: styles.day5 || {},
      // Legacy color names (fallback)
      orange: styles.orange || {},
      blue: styles.blue || {},
      green: styles.green || {},
      purple: styles.purple || {},
      yellow: styles.yellow || {},
      teal: styles.teal || {},
    };
    
    return styleMap[color] || {};
  };

  // Get bubble style function that modules can use
  const getBubbleStyle = (
    header: string | null,
    blockIndex: number,
    blockId?: number | string
  ): any => {
    const color = getContextualBubbleStyle(header, blockIndex, blockColors, blockId);
    return getStyleForColor(color);
  };

  return {
    getBubbleStyle,
    blockColors,
  };
}

