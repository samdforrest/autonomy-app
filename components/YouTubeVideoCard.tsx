import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { getThumbnailUrl } from '../services/thumbnail-service';
import { convertToYouTubeEmbedUrl, fetchYouTubeTitle, getYouTubeThumbnail, isYouTubeUrl } from '../utils/youtube';
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

interface YouTubeVideoCardProps {
  /** YouTube URL (supports various formats) */
  url: string;
  /** Video title - if not provided, will show "YouTube Video" */
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
  /** Custom style for the card container */
  style?: any;
  /** Callback when video is played */
  onPlay?: () => void;
  /** Callback when video is bookmarked */
  onBookmark?: () => void;
  /** Whether video is bookmarked */
  isBookmarked?: boolean;
}

export function YouTubeVideoCard({
  url,
  title = "YouTube Video",
  description,
  duration,
  category = 'lesson',
  difficulty,
  isWatched = false,
  progress = 0,
  style,
  onPlay,
  onBookmark,
  isBookmarked = false,
}: YouTubeVideoCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string | null>(null);

  // Fetch actual video title if using default
  useEffect(() => {
    if (title === 'YouTube Video') {
      fetchYouTubeTitle(url).then(setFetchedTitle);
    }
  }, [url, title]);

  // Fetch custom thumbnail if available
  useEffect(() => {
    getThumbnailUrl(url).then(setCustomThumbnailUrl);
  }, [url]);

  // Use fetched title if available, otherwise use prop
  const displayTitle = fetchedTitle || title;

  // Validate YouTube URL
  if (!isYouTubeUrl(url)) {
    return (
      <ThemedView style={[styles.card, style]}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Invalid YouTube URL</ThemedText>
          <ThemedText style={styles.errorSubtext}>Please provide a valid YouTube link</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const getCategoryIcon = () => {
    // Icons removed
    return '';
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'lesson': return '#3498DB';
      case 'example': return '#2ECC71';
      case 'exercise': return '#F39C12';
      case 'assessment': return '#9B59B6';
      default: return '#34495E';
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return '#2ECC71';
      case 'intermediate': return '#F39C12';
      case 'advanced': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const handlePlayPress = () => {
    setShowVideo(true);
    onPlay?.();
  };

  const handleCardPress = () => {
    if (!showVideo) {
      handlePlayPress();
    }
  };

  const handleBookmarkPress = () => {
    onBookmark?.();
  };

  // Use custom thumbnail if available, otherwise use YouTube default
  const thumbnailUrl = customThumbnailUrl || getYouTubeThumbnail(url, 'medium') || undefined;

  // If video is playing, show the embedded player
  if (showVideo) {
    const embedUrl = convertToYouTubeEmbedUrl(url, {
      autoplay: true,
      controls: true,
      modestbranding: true,
      rel: false,
    }) || undefined;

    if (Platform.OS === 'web') {
      return (
        <ThemedView style={[styles.card, styles.videoCard, style]}>
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: 200,
              border: 'none',
              borderRadius: 8,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={displayTitle}
          />
        </ThemedView>
      );
    } else if (WebView) {
      return (
        <ThemedView style={[styles.card, styles.videoCard, style]}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </ThemedView>
      );
    }
  }

  // Main card UI
  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail Section */}
      <ThemedView style={styles.thumbnailContainer}>
        {thumbnailUrl && !imageError ? (
          Platform.OS === 'web' ? (
            <img
              src={thumbnailUrl}
              style={styles.thumbnail}
              alt={displayTitle}
              onError={() => setImageError(true)}
            />
          ) : (
            <WebView
              source={{ uri: `data:text/html,<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />` }}
              style={styles.thumbnail}
              scrollEnabled={false}
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <ThemedView style={styles.thumbnailPlaceholder}>
            <ThemedText style={styles.placeholderIcon}>🎥</ThemedText>
          </ThemedView>
        )}
        
        {/* Overlay Elements */}
        <View style={styles.thumbnailOverlay}>
          {/* Play Button */}
          <View style={styles.playButton}>
            <ThemedText style={styles.playButtonText}>▶</ThemedText>
          </View>
          
          {/* Duration Badge */}
          {duration && (
            <View style={styles.durationBadge}>
              <ThemedText style={styles.durationText}>{duration}</ThemedText>
            </View>
          )}
          
          {/* Progress Bar */}
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
      </ThemedView>

      {/* Content Section */}
      <ThemedView style={styles.contentContainer}>
        {/* Header Row */}
        <ThemedView style={styles.headerRow}>
          <ThemedView style={styles.categoryContainer}>
            <ThemedText style={styles.categoryIcon}>{getCategoryIcon()}</ThemedText>
            <ThemedText style={[styles.categoryText, { color: getCategoryColor() }]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ThemedText>
          </ThemedView>
          
          {/* Action Buttons */}
          <ThemedView style={styles.actionButtons}>
            {onBookmark && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleBookmarkPress}
              >
                <ThemedText style={styles.actionButtonText}>
                  {isBookmarked ? '🔖' : '🔗'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>

        {/* Title */}
        <ThemedText style={styles.title} numberOfLines={2}>
          {displayTitle}
        </ThemedText>

        {/* Description */}
        {description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {description}
          </ThemedText>
        )}

        {/* Footer Row */}
        <ThemedView style={styles.footerRow}>
          {/* Status Indicators */}
          <ThemedView style={styles.statusContainer}>
            {isWatched && (
              <View style={styles.statusBadge}>
                <ThemedText style={styles.statusText}>Watched</ThemedText>
              </View>
            )}
            
            {difficulty && (
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
                <ThemedText style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                  {difficulty}
                </ThemedText>
              </View>
            )}
          </ThemedView>

          {/* Play Button */}
          <TouchableOpacity 
            style={[styles.playActionButton, { backgroundColor: getCategoryColor() }]}
            onPress={handlePlayPress}
          >
            <ThemedText style={styles.playActionText}>▶ Play</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  videoCard: {
    padding: 0,
  },
  webview: {
    height: 200,
  },
  thumbnailContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as any,
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  playButtonText: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 3, // Optical alignment for play icon
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498DB',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#27AE60',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  playActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
