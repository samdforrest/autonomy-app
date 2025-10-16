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
