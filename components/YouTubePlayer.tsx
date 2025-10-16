import React, { useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { convertToYouTubeEmbedUrl, getYouTubeThumbnail, isYouTubeUrl } from '../utils/youtube';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Conditionally import WebView for native platforms only
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (error) {
    console.log('WebView not available on this platform');
  }
}

interface YouTubePlayerProps {
  /** YouTube URL (supports various formats) */
  url: string;
  /** Height of the player in pixels */
  height?: number;
  /** Width of the player (defaults to full width) */
  width?: number | string;
  /** Whether to show controls */
  controls?: boolean;
  /** Whether to autoplay (default: false) */
  autoplay?: boolean;
  /** Custom style for the container */
  style?: any;
  /** Whether to show a thumbnail before loading the video */
  showThumbnail?: boolean;
}

export function YouTubePlayer({
  url,
  height = 200,
  width = '100%',
  controls = true,
  autoplay = false,
  style,
  showThumbnail = false,
}: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showVideo, setShowVideo] = useState(!showThumbnail);

  // Handle web platform with iframe
  if (Platform.OS === 'web') {
    const embedUrl = convertToYouTubeEmbedUrl(url, {
      autoplay,
      controls,
      modestbranding: true,
      rel: false,
    });

    if (!embedUrl) {
      return (
        <ThemedView style={[styles.container, { height }, style]}>
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>❌ Could not load video</ThemedText>
            <ThemedText style={styles.errorSubtext}>Unable to parse YouTube URL</ThemedText>
          </ThemedView>
        </ThemedView>
      );
    }

    // Handle thumbnail view for web
    if (showThumbnail && !showVideo) {
      const thumbnailUrl = getYouTubeThumbnail(url, 'medium');
      
      return (
        <TouchableOpacity 
          style={[styles.container, { height, width }, style]}
          onPress={() => setShowVideo(true)}
        >
          <ThemedView style={styles.thumbnailContainer}>
            {thumbnailUrl && (
              <img 
                src={thumbnailUrl} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: 8
                }} 
                alt="YouTube video thumbnail"
              />
            )}
            <View style={styles.playButton}>
              <ThemedText style={styles.playButtonText}>▶️</ThemedText>
            </View>
          </ThemedView>
        </TouchableOpacity>
      );
    }

    // Web iframe implementation
    return (
      <ThemedView style={[styles.container, { height, width }, style]}>
        <iframe
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 8,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      </ThemedView>
    );
  }

  // Check if WebView is available for native platforms
  if (!WebView) {
    return (
      <TouchableOpacity 
        style={[styles.container, { height }, style]}
        onPress={() => Linking.openURL(url)}
      >
        <ThemedView style={styles.fallbackContainer}>
          <ThemedText style={styles.fallbackTitle}>🎥 YouTube Video</ThemedText>
          <ThemedText style={styles.fallbackText}>Tap to open in YouTube app</ThemedText>
          <View style={styles.playButton}>
            <ThemedText style={styles.playButtonText}>▶️</ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  }

  // Validate YouTube URL
  if (!isYouTubeUrl(url)) {
    return (
      <ThemedView style={[styles.container, { height }, style]}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>❌ Invalid YouTube URL</ThemedText>
          <ThemedText style={styles.errorSubtext}>Please provide a valid YouTube link</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Convert to embed URL
  const embedUrl = convertToYouTubeEmbedUrl(url, {
    autoplay,
    controls,
    modestbranding: true,
    rel: false,
  });

  if (!embedUrl) {
    return (
      <ThemedView style={[styles.container, { height }, style]}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>❌ Could not load video</ThemedText>
          <ThemedText style={styles.errorSubtext}>Unable to parse YouTube URL</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Handle thumbnail view
  if (showThumbnail && !showVideo) {
    const thumbnailUrl = getYouTubeThumbnail(url, 'medium');
    
    return (
      <TouchableOpacity 
        style={[styles.container, { height, width }, style]}
        onPress={() => setShowVideo(true)}
      >
        <ThemedView style={styles.thumbnailContainer}>
          {thumbnailUrl && (
            <WebView
              source={{ uri: `data:text/html,<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;" />` }}
              style={styles.thumbnail}
              scrollEnabled={false}
            />
          )}
          <View style={styles.playButton}>
            <ThemedText style={styles.playButtonText}>▶️</ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={[styles.container, { height, width }, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
        </View>
      )}
      
      {hasError ? (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>❌ Failed to load video</ThemedText>
          <ThemedText style={styles.errorSubtext}>Check your internet connection</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
          >
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={!autoplay}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  thumbnailContainer: {
    flex: 1,
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
});
