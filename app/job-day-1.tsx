import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView, StyleSheet } from 'react-native';

export default function JobDay1Screen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.dayLabel}>Day 1 of 5</ThemedText>
        <ThemedText type="title" style={styles.title}>Getting Started</ThemedText>
        <ThemedText style={styles.subtitle}>Parent + Child • Collaborative Learning</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🚀 Welcome to Job Skills!</ThemedText>
          <ThemedText style={styles.placeholder}>
            [Content placeholder for Day 1]
            {'\n\n'}This is where the collaborative content will go.
            {'\n\n'}• Parent instructions
            {'\n'}• Child activities  
            {'\n'}• Discussion prompts
            {'\n'}• Shared exercises
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📋 Today's Activities</ThemedText>
          <ThemedText style={styles.placeholder}>
            Activity placeholders will go here...
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dayLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});
