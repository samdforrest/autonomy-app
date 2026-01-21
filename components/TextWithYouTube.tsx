import React from 'react';
import { StyleSheet, View } from 'react-native';
import { parseTextWithYouTube } from '../utils/youtube';
import { ThemedText } from './ThemedText';
import { EnhancedYouTubePlayer } from './EnhancedYouTubePlayer';

interface TextWithYouTubeProps {
  /** The text content that may contain YouTube URLs */
  text: string;
  /** Style for the text portions */
  textStyle?: any;
  /** Style for the container */
  style?: any;
  /** Height for YouTube players (fallback mode) */
  videoHeight?: number;
  /** Whether to show thumbnails for videos (fallback mode) */
  showThumbnails?: boolean;
  /** Custom style for video players */
  videoStyle?: any;
  /** Whether to use enhanced video cards (default: true) */
  useEnhancedCards?: boolean;
  /** Default category for videos when using enhanced cards */
  defaultCategory?: 'lesson' | 'example' | 'exercise' | 'assessment';
  /** Default difficulty for videos when using enhanced cards */
  defaultDifficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Component that renders text and automatically embeds YouTube players
 * when YouTube URLs are detected in the text.
 * Now supports enhanced video cards with rich metadata!
 */
export function TextWithYouTube({
  text,
  textStyle,
  style,
  videoHeight = 200,
  showThumbnails = true,
  videoStyle,
  useEnhancedCards = true,
  defaultCategory = 'lesson',
  defaultDifficulty = 'beginner',
}: TextWithYouTubeProps) {
  // Parse the text to separate regular text from YouTube URLs
  const parsedContent = parseTextWithYouTube(text);

  // Helper function to extract video metadata from surrounding text
  const extractVideoMetadata = (videoIndex: number) => {
    // Look for text before the video that might contain a title
    let title: string | undefined;
    let description: string | undefined;
    
    // Check previous text parts for potential titles
    for (let i = videoIndex - 1; i >= 0; i--) {
      const prevPart = parsedContent[i];
      if (prevPart.type === 'text') {
        const lines = prevPart.content.trim().split('\n');
        const lastLine = lines[lines.length - 1]?.trim();
        
        // If the last line looks like a title (not too long, not a bullet point)
        if (lastLine && lastLine.length < 80 && !lastLine.startsWith('•') && !lastLine.startsWith('-')) {
          // Remove common prefixes
          title = lastLine.replace(/^(Watch:|Video:|Example:|Exercise:|Assessment:)\s*/i, '').trim();
          
          // If there are more lines, use the second-to-last as description
          if (lines.length > 1) {
            const secondLastLine = lines[lines.length - 2]?.trim();
            if (secondLastLine && secondLastLine.length > 20) {
              description = secondLastLine;
            }
          }
          break;
        }
      }
    }
    
    // Determine category from surrounding text context
    let category: 'lesson' | 'example' | 'exercise' | 'assessment' = defaultCategory;
    const contextText = text.toLowerCase();
    
    if (contextText.includes('example') || contextText.includes('demonstration')) {
      category = 'example';
    } else if (contextText.includes('exercise') || contextText.includes('practice') || contextText.includes('try')) {
      category = 'exercise';
    } else if (contextText.includes('assessment') || contextText.includes('quiz') || contextText.includes('test')) {
      category = 'assessment';
    }
    
    return { title, description, category };
  };

  // If no YouTube URLs found, render as regular text
  if (parsedContent.length === 1 && parsedContent[0].type === 'text') {
    return (
      <ThemedText style={[textStyle, style]}>
        {parsedContent[0].content}
      </ThemedText>
    );
  }

  // Render mixed content with text and YouTube players
  return (
    <View style={style}>
      {parsedContent.map((part, index) => {
        if (part.type === 'youtube') {
          if (useEnhancedCards) {
            const metadata = extractVideoMetadata(index);
            
            return (
              <EnhancedYouTubePlayer
                key={`video-${index}`}
                url={part.content}
                title={metadata.title}
                description={metadata.description}
                category={metadata.category}
                difficulty={defaultDifficulty}
                style={[styles.videoPlayer, videoStyle]}
                useCardMode={true} // Force card mode for enhanced experience
              />
            );
          } else {
            // Fallback to original player
            return (
              <EnhancedYouTubePlayer
                key={`video-${index}`}
                url={part.content}
                height={videoHeight}
                showThumbnail={showThumbnails}
                style={[styles.videoPlayer, videoStyle]}
              />
            );
          }
        } else {
          // Only render text if it's not just whitespace
          const trimmedContent = part.content.trim();
          if (trimmedContent) {
            return (
              <ThemedText key={`text-${index}`} style={textStyle}>
                {part.content}
              </ThemedText>
            );
          }
          return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  videoPlayer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
