import { EnhancedYouTubePlayer } from '@/components/EnhancedYouTubePlayer';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { YouTubeVideoCard } from '@/components/YouTubeVideoCard';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';

/**
 * Demo screen showing the new YouTube video card UI
 * This demonstrates the enhanced video card interface
 */
export default function VideoCardDemoScreen() {
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set(['demo1']));
  const [videoProgress] = useState<Record<string, number>>({
    'demo1': 85,
    'demo2': 45,
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
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>🎥 Enhanced Video Cards</ThemedText>
        <ThemedText style={styles.subtitle}>Rich UI for YouTube videos in your learning modules</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* Featured Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📚 Featured Learning Video</ThemedText>
          
          <YouTubeVideoCard
            url="https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share"
            title="Understanding Growth Mindset in Learning"
            description="Discover how adopting a growth mindset can transform your approach to learning from mistakes and building resilience."
            duration="3:45"
            category="lesson"
            difficulty="beginner"
            isWatched={watchedVideos.has('demo1')}
            progress={videoProgress.demo1}
            isBookmarked={bookmarkedVideos.has('demo1')}
            onPlay={() => handlePlay('demo1')}
            onBookmark={() => handleBookmark('demo1')}
          />
        </ThemedView>

        {/* Practice Example */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>💡 Real-World Example</ThemedText>
          
          <YouTubeVideoCard
            url="https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ"
            title="Student Success Story: Overcoming Challenges"
            description="Watch how Maria applies self-regulation techniques when facing a difficult math problem."
            duration="2:30"
            category="example"
            difficulty="intermediate"
            isWatched={watchedVideos.has('demo2')}
            progress={videoProgress.demo2}
            isBookmarked={bookmarkedVideos.has('demo2')}
            onPlay={() => handlePlay('demo2')}
            onBookmark={() => handleBookmark('demo2')}
          />
        </ThemedView>

        {/* Exercise Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎯 Interactive Exercise</ThemedText>
          
          <YouTubeVideoCard
            url="https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share"
            title="Practice: Emotional Regulation Techniques"
            description="Follow along with this guided exercise to practice identifying and managing your emotions during challenging tasks."
            duration="5:20"
            category="exercise"
            difficulty="advanced"
            isWatched={watchedVideos.has('demo3')}
            isBookmarked={bookmarkedVideos.has('demo3')}
            onPlay={() => handlePlay('demo3')}
            onBookmark={() => handleBookmark('demo3')}
          />
        </ThemedView>

        {/* Comparison Section */}
        <ThemedView style={styles.comparisonSection}>
          <ThemedText style={styles.comparisonTitle}>🔄 Before vs After</ThemedText>
          
          <ThemedText style={styles.comparisonLabel}>Old Simple Player:</ThemedText>
          <EnhancedYouTubePlayer
            url="https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ"
            height={200}
            showThumbnail={true}
          />
          
          <ThemedText style={styles.comparisonLabel}>New Enhanced Card:</ThemedText>
          <EnhancedYouTubePlayer
            url="https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ"
            title="Same Video with Enhanced UI"
            description="Notice the improved presentation with title, category, and interactive elements."
            duration="2:30"
            category="lesson"
            onPlay={() => handlePlay('comparison')}
          />
        </ThemedView>

        {/* Integration Guide */}
        <ThemedView style={styles.integrationSection}>
          <ThemedText style={styles.integrationTitle}>🚀 Easy Integration</ThemedText>
          
          <ThemedView style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Step 1: Replace existing YouTubePlayer</ThemedText>
            <ThemedView style={styles.codeBlock}>
              <ThemedText style={styles.codeText}>
{`// Old way
<YouTubePlayer url="..." height={200} />

// New way - just add a title!
<EnhancedYouTubePlayer 
  url="..." 
  title="Your Video Title"
  category="lesson"
/>`}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Step 2: Add rich metadata (optional)</ThemedText>
            <ThemedView style={styles.codeBlock}>
              <ThemedText style={styles.codeText}>
{`<EnhancedYouTubePlayer 
  url="..."
  title="Understanding Growth Mindset"
  description="Learn key concepts..."
  duration="3:45"
  category="lesson"
  difficulty="beginner"
  onPlay={() => trackVideoPlay()}
/>`}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.benefitsList}>
            <ThemedText style={styles.benefitsTitle}>✨ Benefits:</ThemedText>
            <ThemedText style={styles.benefitItem}>• Professional, polished appearance</ThemedText>
            <ThemedText style={styles.benefitItem}>• Better user engagement with rich metadata</ThemedText>
            <ThemedText style={styles.benefitItem}>• Progress tracking and bookmarking</ThemedText>
            <ThemedText style={styles.benefitItem}>• Consistent with your app's card design</ThemedText>
            <ThemedText style={styles.benefitItem}>• Backward compatible - existing code still works</ThemedText>
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
    textAlign: 'center',
    lineHeight: 22,
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
  comparisonSection: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#34495E',
  },
  integrationSection: {
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
  integrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495E',
  },
  codeBlock: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  codeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#2C3E50',
    lineHeight: 16,
  },
  benefitsList: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#27AE60',
  },
  benefitItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C3E50',
    marginBottom: 4,
  },
});
