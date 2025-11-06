import React from 'react';
import { StyleSheet, View } from 'react-native';
import { parseTextWithYouTube } from '../utils/youtube';
import { ThemedText } from './ThemedText';
import { YouTubePlayer } from './YouTubePlayer';

interface TextWithYouTubeProps {
  /** The text content that may contain YouTube URLs */
  text: string;
  /** Style for the text portions */
  textStyle?: any;
  /** Style for the container */
  style?: any;
  /** Height for YouTube players */
  videoHeight?: number;
  /** Whether to show thumbnails for videos */
  showThumbnails?: boolean;
  /** Custom style for video players */
  videoStyle?: any;
}

/**
 * Component that renders text and automatically embeds YouTube players
 * when YouTube URLs are detected in the text
 */
export function TextWithYouTube({
  text,
  textStyle,
  style,
  videoHeight = 200,
  showThumbnails = true,
  videoStyle,
}: TextWithYouTubeProps) {
  // Parse the text to separate regular text from YouTube URLs
  const parsedContent = parseTextWithYouTube(text);

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
          return (
            <YouTubePlayer
              key={`video-${index}`}
              url={part.content}
              height={videoHeight}
              showThumbnail={showThumbnails}
              style={[styles.videoPlayer, videoStyle]}
            />
          );
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
