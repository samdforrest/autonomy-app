import { TextWithYouTube } from '@/components/TextWithYouTube';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

/**
 * Test screen to verify enhanced YouTube video cards are working
 * This shows how the TextWithYouTube component now automatically
 * creates rich video cards from YouTube URLs in text
 */
export default function EnhancedVideoTestScreen() {
  // Test content with YouTube URLs embedded in text
  const testContent1 = `
Learning from Mistakes: A Growth Mindset Approach

This video demonstrates key concepts about learning from mistakes and developing resilience.

https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share

The video shows practical examples of how students can reframe challenges as learning opportunities.
  `.trim();

  const testContent2 = `
• Watch this example of emotional regulation in action
• https://youtube.com/shorts/ZmpeyPHTdwU?si=7WR3U5DUaJt2x8ZQ
• Notice how the student pauses before responding
• This demonstrates self-awareness and control
  `.trim();

  const testContent3 = `
Exercise: Practice Self-Monitoring Techniques

Follow along with this guided practice session to develop your self-monitoring skills.

https://www.youtube.com/shorts/RO4ZzfoVyWQ?feature=share

This exercise will help you identify emotional triggers and develop coping strategies.
  `.trim();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>🎥 Enhanced Video Cards Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Testing automatic video card enhancement in TextWithYouTube component
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* Test 1: Lesson Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📚 Lesson Video (Auto-detected)</ThemedText>
          <ThemedView style={styles.textContainer}>
            <TextWithYouTube 
              text={testContent1}
              textStyle={styles.bodyText}
              defaultCategory="lesson"
              defaultDifficulty="beginner"
            />
          </ThemedView>
        </ThemedView>

        {/* Test 2: Example Video in Bullet Points */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>💡 Example Video (In Bullet Points)</ThemedText>
          <ThemedView style={styles.textContainer}>
            <TextWithYouTube 
              text={testContent2}
              textStyle={styles.bodyText}
              defaultCategory="example"
              defaultDifficulty="intermediate"
            />
          </ThemedView>
        </ThemedView>

        {/* Test 3: Exercise Video */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎯 Exercise Video (Auto-detected)</ThemedText>
          <ThemedView style={styles.textContainer}>
            <TextWithYouTube 
              text={testContent3}
              textStyle={styles.bodyText}
              defaultCategory="exercise"
              defaultDifficulty="advanced"
            />
          </ThemedView>
        </ThemedView>

        {/* Test 4: Fallback Mode */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔄 Fallback Mode (Original Player)</ThemedText>
          <ThemedView style={styles.textContainer}>
            <TextWithYouTube 
              text={testContent1}
              textStyle={styles.bodyText}
              useEnhancedCards={false}
              videoHeight={200}
              showThumbnails={true}
            />
          </ThemedView>
        </ThemedView>

        {/* Results Summary */}
        <ThemedView style={styles.summarySection}>
          <ThemedText style={styles.summaryTitle}>What You Should See</ThemedText>

          <ThemedView style={styles.checklistContainer}>
            <ThemedText style={styles.checklistItem}>Rich video cards with thumbnails and metadata</ThemedText>
            <ThemedText style={styles.checklistItem}>Automatic title extraction from surrounding text</ThemedText>
            <ThemedText style={styles.checklistItem}>Category-based styling (lesson=blue, example=green, exercise=orange)</ThemedText>
            <ThemedText style={styles.checklistItem}>Professional card design matching your app's style</ThemedText>
            <ThemedText style={styles.checklistItem}>Play buttons and interactive elements</ThemedText>
            <ThemedText style={styles.checklistItem}>Fallback to original player when enhanced cards are disabled</ThemedText>
          </ThemedView>

          <ThemedView style={styles.integrationNote}>
            <ThemedText style={styles.integrationTitle}>Integration Complete!</ThemedText>
            <ThemedText style={styles.integrationText}>
              All your existing module screens now automatically use enhanced video cards. 
              The TextWithYouTube component intelligently extracts titles and context from 
              surrounding text to create rich, professional video presentations.
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
    textAlign: 'center',
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
    color: '#2C3E50',
  },
  textContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495E',
  },
  summarySection: {
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
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  checklistContainer: {
    marginBottom: 20,
  },
  checklistItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#34495E',
    marginBottom: 6,
  },
  integrationNote: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  integrationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#27AE60',
  },
  integrationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C3E50',
  },
});
