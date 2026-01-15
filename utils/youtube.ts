/**
 * YouTube URL utilities for converting various YouTube URL formats to embed URLs
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Remove any query parameters and fragments for cleaner parsing
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Regular expressions for different YouTube URL formats
  const patterns = [
    // Standard watch URLs: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Shorts URLs: youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // Short URLs: youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Mobile URLs: m.youtube.com/watch?v=VIDEO_ID
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts a YouTube URL to an embed URL
 * @param url - Original YouTube URL
 * @param options - Embed options
 * @returns Embed URL or null if invalid
 */
export function convertToYouTubeEmbedUrl(
  url: string, 
  options: {
    autoplay?: boolean;
    controls?: boolean;
    modestbranding?: boolean;
    rel?: boolean;
  } = {}
): string | null {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return null;
  }

  // Default options
  const {
    autoplay = false,
    controls = true,
    modestbranding = true,
    rel = false
  } = options;

  // Build query parameters
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    modestbranding: modestbranding ? '1' : '0',
    rel: rel ? '1' : '0',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com/,
    /^https?:\/\/youtu\.be/,
    /^https?:\/\/m\.youtube\.com/,
  ];

  return youtubePatterns.some(pattern => pattern.test(url));
}

/**
 * Gets YouTube video thumbnail URL
 */
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string | null {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return null;
  }

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault', 
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Extracts all YouTube URLs from a text string
 */
export function extractYouTubeUrls(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Comprehensive regex to match various YouTube URL formats
  const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)[a-zA-Z0-9_-]{11}(?:[^\s]*)?/g;
  
  const matches = text.match(youtubeRegex);
  return matches ? matches.filter(url => isYouTubeUrl(url)) : [];
}

/**
 * Splits text into parts, separating YouTube URLs from regular text
 * Returns array of objects with type 'text' or 'youtube' and content
 */
export function parseTextWithYouTube(text: string): Array<{type: 'text' | 'youtube', content: string}> {
  if (!text || typeof text !== 'string') {
    return [{type: 'text', content: text || ''}];
  }

  // Split text by YouTube URLs while keeping the URLs
  const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)[a-zA-Z0-9_-]{11}(?:[^\s]*)?)/g;

  const parts = text.split(youtubeRegex);
  const result: Array<{type: 'text' | 'youtube', content: string}> = [];

  parts.forEach(part => {
    if (part && part.trim()) {
      if (isYouTubeUrl(part)) {
        result.push({type: 'youtube', content: part.trim()});
      } else {
        result.push({type: 'text', content: part});
      }
    }
  });

  return result.length > 0 ? result : [{type: 'text', content: text}];
}

// Simple in-memory cache for video titles
const titleCache: Map<string, string> = new Map();

/**
 * Fetches the actual YouTube video title using oEmbed API
 * @param url - YouTube video URL
 * @returns Promise<string> - Video title or fallback
 */
export async function fetchYouTubeTitle(url: string): Promise<string> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return 'YouTube Video';

  // Check cache first
  if (titleCache.has(videoId)) {
    return titleCache.get(videoId)!;
  }

  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl);

    if (!response.ok) {
      return 'YouTube Video';
    }

    const data = await response.json();
    const title = data.title || 'YouTube Video';

    // Cache the result
    titleCache.set(videoId, title);

    return title;
  } catch (error) {
    console.log('Failed to fetch YouTube title:', error);
    return 'YouTube Video';
  }
}