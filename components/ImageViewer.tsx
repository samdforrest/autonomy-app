import React, { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ImageViewerProps {
  /** Image URI - can be data URL (base64) or regular URL */
  uri: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Custom style for the image container */
  style?: any;
  /** Maximum height for the image */
  maxHeight?: number;
  /** Whether the image can be tapped to view full screen */
  allowFullScreen?: boolean;
}

/**
 * Simple component for displaying images from Google Docs within content bubbles
 * Handles both data URLs (base64) and regular URLs
 */
export function ImageViewer({
  uri,
  alt = 'Image',
  style,
  maxHeight = 300,
  allowFullScreen = true,
}: ImageViewerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging (uncomment if needed)
  // console.log('🖼️ ImageViewer props:', { uri, alt, hasError, isLoading });

  const screenDimensions = Dimensions.get('window');
  const maxWidth = screenDimensions.width - 40; // Account for padding

  if (!uri) {
    return (
      <ThemedView style={[styles.container, styles.errorContainer, style]}>
        <ThemedText style={styles.errorText}>📷 Image not available</ThemedText>
        {alt && <ThemedText style={styles.altText}>{alt}</ThemedText>}
      </ThemedView>
    );
  }

  if (hasError) {
    return (
      <ThemedView style={[styles.container, styles.errorContainer, style]}>
        <ThemedText style={styles.errorText}>Failed to load image</ThemedText>
        {alt && <ThemedText style={styles.altText}>{alt}</ThemedText>}
      </ThemedView>
    );
  }

  const imageComponent = (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          maxWidth: maxWidth,
          maxHeight: maxHeight,
        }
      ]}
      resizeMode="contain"
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
      accessible={true}
      accessibilityLabel={alt}
    />
  );

  const content = (
    <View style={[styles.container, style]}>
      {allowFullScreen ? (
        <TouchableOpacity
          onPress={() => setIsFullScreen(true)}
          style={styles.touchableImage}
          accessible={true}
          accessibilityLabel={`Tap to view ${alt} in full screen`}
          accessibilityRole="button"
        >
          {imageComponent}
          {isLoading && (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading...</ThemedText>
            </ThemedView>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.touchableImage}>
          {imageComponent}
          {isLoading && (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading...</ThemedText>
            </ThemedView>
          )}
        </View>
      )}
      
      {/* Alt text removed - images speak for themselves */}
    </View>
  );

  return (
    <>
      {content}
      
      {/* Full screen modal */}
      {allowFullScreen && (
        <Modal
          visible={isFullScreen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFullScreen(false)}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.fullScreenOverlay}
              onPress={() => setIsFullScreen(false)}
              accessible={true}
              accessibilityLabel="Close full screen image"
              accessibilityRole="button"
            >
              <Image
                source={{ uri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel={alt}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: 'center',
  },
  touchableImage: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    borderRadius: 8,
    minHeight: 100,
    minWidth: 100,
    flex: 1,
  },
  altText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    backgroundColor: '#ffe0e0',
  },
  errorText: {
    color: '#d63031',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 12,
    opacity: 0.7,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
