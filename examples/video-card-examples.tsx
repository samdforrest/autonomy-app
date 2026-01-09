import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { YouTubeVideoCard } from '@/components/YouTubeVideoCard';

/**
 * Examples of how to use the enhanced YouTubeVideoCard component
 * This shows various configurations and use cases
 */
export function VideoCardExamples() {
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({
    'video1': 75,
    'video2': 30,
  });

  const handleBookmark = (videoId: string) => {
    const newBookmarked = new Set(bookmarkedVideos);
    if (newBookmarked.has(videoId)) {
      newBookmarked.delete(videoId);
    } else {
      newBookmarked.add(videoId);
    }
    setBookmarkedVideos(newBookmarked);
  };

  const handlePlay = (videoId: string) => {
    console.log(`Playing video: ${videoId}`);
    // Mark as watched when played
    setWatchedVideos(prev => new Set([...prev, videoId]));
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Enhanced Video Cards</ThemedText>
        <ThemedText style={styles.subtitle}>Rich UI cards for YouTube videos</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* Lesson Video Example */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📚 Lesson Videos</ThemedText>
          
          <YouTubeVideoCard
            url="https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share"
            title="Understanding Growth Mindset"
            description="Learn the fundamental concepts of growth mindset and how it applies to learning from mistakes."
            duration="3:45"
            category="lesson"
            difficulty="beginner"
            isWatched={watchedVideos.has('video1')}
            progress={videoProgress.video1}
            isBookmarked={bookmarkedVideos.has('video1')}
            onPlay={() => handlePlay('video1')}
            onBookmark={() => handleBookmark('video1')}
          />
        </ThemedView>

        {/* Example Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>💡 Example Videos</ThemedText>
          
          <YouTubeVideoCard
            url="https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ"
            title="Real-World Application"
            description="Watch how students apply emotional regulation techniques in challenging situations."
            duration="2:30"
            category="example"
            difficulty="intermediate"
            isWatched={watchedVideos.has('video2')}
            progress={videoProgress.video2}
            isBookmarked={bookmarkedVideos.has('video2')}
            onPlay={() => handlePlay('video2')}
            onBookmark={() => handleBookmark('video2')}
          />
        </ThemedView>

        {/* Exercise Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎯 Exercise Videos</ThemedText>
          
          <YouTubeVideoCard
            url="https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share"
            title="Practice Session: Self-Monitoring"
            description="Follow along with this guided practice session to develop your self-monitoring skills."
            duration="5:20"
            category="exercise"
            difficulty="advanced"
            isWatched={watchedVideos.has('video3')}
            isBookmarked={bookmarkedVideos.has('video3')}
            onPlay={() => handlePlay('video3')}
            onBookmark={() => handleBookmark('video3')}
          />
        </ThemedView>

        {/* Assessment Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>✅ Assessment Videos</ThemedText>
          
          <YouTubeVideoCard
            url="https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ"
            title="Module Assessment Overview"
            description="Review key concepts and prepare for your module assessment."
            duration="4:15"
            category="assessment"
            isWatched={watchedVideos.has('video4')}
            isBookmarked={bookmarkedVideos.has('video4')}
            onPlay={() => handlePlay('video4')}
            onBookmark={() => handleBookmark('video4')}
          />
        </ThemedView>

        {/* Minimal Example */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎥 Minimal Configuration</ThemedText>
          
          <YouTubeVideoCard
            url="https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share"
            title="Quick Tip"
          />
        </ThemedView>

        {/* Usage Guide */}
        <ThemedView style={styles.usageSection}>
          <ThemedText style={styles.usageTitle}>📖 Usage Guide</ThemedText>
          
          <ThemedView style={styles.featureList}>
            <ThemedText style={styles.featureItem}>• Rich thumbnail previews with play overlay</ThemedText>
            <ThemedText style={styles.featureItem}>• Category-based styling and icons</ThemedText>
            <ThemedText style={styles.featureItem}>• Progress tracking and watch status</ThemedText>
            <ThemedText style={styles.featureItem}>• Bookmark functionality</ThemedText>
            <ThemedText style={styles.featureItem}>• Difficulty level badges</ThemedText>
            <ThemedText style={styles.featureItem}>• Duration display</ThemedText>
            <ThemedText style={styles.featureItem}>• Responsive design for all platforms</ThemedText>
          </ThemedView>

          <ThemedView style={styles.codeExample}>
            <ThemedText style={styles.codeTitle}>Basic Usage:</ThemedText>
            <ThemedText style={styles.codeText}>
{`<YouTubeVideoCard
  url="https://youtube.com/shorts/VIDEO_ID"
  title="Your Video Title"
  description="Brief description of the video content"
  duration="3:45"
  category="lesson"
  difficulty="beginner"
  onPlay={() => handlePlay()}
  onBookmark={() => handleBookmark()}
/>`}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 16,
    color: '#2C3E50',
  },
  usageSection: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#34495E',
    marginBottom: 4,
  },
  codeExample: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  codeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#34495E',
    lineHeight: 18,
  },
});
