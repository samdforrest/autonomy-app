import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

/**
 * Test screen for YouTube Player component
 * This demonstrates how to use the YouTubePlayer with your specific YouTube links
 */
export default function YouTubeTestScreen() {
  // Your YouTube links from the user info
  const testVideos = [
    {
      title: 'Clip 1 - YouTube Shorts',
      url: 'https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share',
    },
    {
      title: 'Clip 2 - YouTube Shorts', 
      url: 'https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>YouTube Player Test</ThemedText>
        <ThemedText style={styles.subtitle}>Testing embedded YouTube videos</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {testVideos.map((video, index) => (
          <ThemedView key={index} style={styles.videoSection}>
            <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
            <ThemedText style={styles.videoUrl}>{video.url}</ThemedText>
            
            {/* Standard YouTube Player */}
            <YouTubePlayer
              url={video.url}
              height={200}
              style={styles.player}
            />
            
            {/* Example with thumbnail (optional) */}
            <ThemedText style={styles.sectionLabel}>With Thumbnail Preview:</ThemedText>
            <YouTubePlayer
              url={video.url}
              height={200}
              showThumbnail={true}
              style={styles.player}
            />
          </ThemedView>
        ))}

        {/* Usage Examples */}
        <ThemedView style={styles.examplesSection}>
          <ThemedText style={styles.examplesTitle}>📖 Usage Examples</ThemedText>
          
          <ThemedView style={styles.codeBlock}>
            <ThemedText style={styles.codeTitle}>Basic Usage:</ThemedText>
            <ThemedText style={styles.codeText}>
              {`<YouTubePlayer 
  url="https://youtube.com/shorts/VIDEO_ID"
  height={200}
/>`}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.codeBlock}>
            <ThemedText style={styles.codeTitle}>With Thumbnail:</ThemedText>
            <ThemedText style={styles.codeText}>
              {`<YouTubePlayer 
  url="https://youtube.com/shorts/VIDEO_ID"
  height={200}
  showThumbnail={true}
/>`}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.codeBlock}>
            <ThemedText style={styles.codeTitle}>Custom Options:</ThemedText>
            <ThemedText style={styles.codeText}>
              {`<YouTubePlayer 
  url="https://youtube.com/shorts/VIDEO_ID"
  height={300}
  width="90%"
  autoplay={false}
  controls={true}
/>`}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.integrationSection}>
          <ThemedText style={styles.integrationTitle}>🔗 Integration Tips</ThemedText>
          <ThemedText style={styles.integrationText}>
            • Replace ExternalLink components with YouTubePlayer for YouTube URLs{'\n'}
            • Works on iOS, Android, and Web browsers{'\n'}
            • Supports YouTube Shorts, regular videos, and youtu.be links{'\n'}
            • No autoplay by default (good UX practice){'\n'}
            • Includes loading states and error handling
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  videoSection: {
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    opacity: 0.8,
  },
  player: {
    marginBottom: 10,
  },
  examplesSection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 100, 200, 0.1)',
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  codeBlock: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  integrationSection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 200, 100, 0.1)',
  },
  integrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  integrationText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
});
