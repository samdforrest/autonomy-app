import React from 'react';
import { YouTubeVideoCard } from './YouTubeVideoCard';
import { YouTubePlayer } from './YouTubePlayer';

interface EnhancedYouTubePlayerProps {
  /** YouTube URL (supports various formats) */
  url: string;
  /** Height of the player in pixels (for fallback mode) */
  height?: number;
  /** Width of the player (for fallback mode) */
  width?: number | string;
  /** Whether to show controls (for fallback mode) */
  controls?: boolean;
  /** Whether to autoplay (for fallback mode) */
  autoplay?: boolean;
  /** Custom style for the container */
  style?: any;
  /** Whether to show a thumbnail before loading the video (for fallback mode) */
  showThumbnail?: boolean;
  
  // Enhanced card props
  /** Video title - if provided, will use card mode */
  title?: string;
  /** Video description or subtitle */
  description?: string;
  /** Duration string (e.g., "3:45", "12:30") */
  duration?: string;
  /** Category for styling and icons */
  category?: 'lesson' | 'example' | 'exercise' | 'assessment';
  /** Difficulty level for badge display */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Whether video has been watched */
  isWatched?: boolean;
  /** Watch progress (0-100) */
  progress?: number;
  /** Callback when video is played */
  onPlay?: () => void;
  /** Callback when video is bookmarked */
  onBookmark?: () => void;
  /** Whether video is bookmarked */
  isBookmarked?: boolean;
  /** Force card mode even without title */
  useCardMode?: boolean;
}

/**
 * Enhanced YouTube Player that automatically chooses between:
 * - Rich card UI when title is provided or useCardMode is true
 * - Original simple player when no title is provided
 * 
 * This allows for gradual migration - existing code works unchanged,
 * but you can opt into the enhanced UI by providing a title.
 */
export function EnhancedYouTubePlayer({
  url,
  height = 200,
  width = '100%',
  controls = true,
  autoplay = false,
  style,
  showThumbnail = false,
  title,
  description,
  duration,
  category = 'lesson',
  difficulty,
  isWatched = false,
  progress = 0,
  onPlay,
  onBookmark,
  isBookmarked = false,
  useCardMode = false,
}: EnhancedYouTubePlayerProps) {
  
  // Use card mode if title is provided or explicitly requested
  const shouldUseCardMode = title || useCardMode;
  
  if (shouldUseCardMode) {
    return (
      <YouTubeVideoCard
        url={url}
        title={title || "YouTube Video"}
        description={description}
        duration={duration}
        category={category}
        difficulty={difficulty}
        isWatched={isWatched}
        progress={progress}
        style={style}
        onPlay={onPlay}
        onBookmark={onBookmark}
        isBookmarked={isBookmarked}
      />
    );
  }
  
  // Fallback to original player
  return (
    <YouTubePlayer
      url={url}
      height={height}
      width={width}
      controls={controls}
      autoplay={autoplay}
      style={style}
      showThumbnail={showThumbnail}
    />
  );
}
