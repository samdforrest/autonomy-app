import CollapsibleDayCard from '@/components/CollapsibleDayCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface DayModule {
  id: string;
  title: string;
  description: string;
  dayNumber: number;
  isCompleted: boolean;
  isLocked: boolean;
  color: string;
  icon: string;
  type: 'collaborative' | 'independent' | 'evaluation';
}

export default function JobModuleScreen() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const dayModules: DayModule[] = [
    {
      id: 'day1',
      title: 'Getting Started',
      description: 'Introduction to work skills',
      dayNumber: 1,
      isCompleted: false,
      isLocked: false,
      color: '#FF6B6B',
      icon: '🚀',
      type: 'collaborative'
    },
    {
      id: 'day2',
      title: 'Working Together',
      description: 'Collaboration and communication',
      dayNumber: 2,
      isCompleted: false,
      isLocked: true,
      color: '#4ECDC4',
      icon: '🤝',
      type: 'collaborative'
    },
    {
      id: 'day3',
      title: 'On Your Own',
      description: 'Independent work skills',
      dayNumber: 3,
      isCompleted: false,
      isLocked: true,
      color: '#45B7D1',
      icon: '💪',
      type: 'independent'
    },
    {
      id: 'day4',
      title: 'Problem Solving',
      description: 'Handling challenges at work',
      dayNumber: 4,
      isCompleted: false,
      isLocked: true,
      color: '#96CEB4',
      icon: '🧩',
      type: 'independent'
    },
    {
      id: 'day5',
      title: 'Putting It Together',
      description: 'Review and celebrate progress',
      dayNumber: 5,
      isCompleted: false,
      isLocked: true,
      color: '#FFEAA7',
      icon: '🎯',
      type: 'evaluation'
    }
  ];

  const handleDayToggle = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const renderDayContent = (day: DayModule) => {
    if (day.dayNumber === 1) {
      return (
        <ThemedView>
          <ThemedText style={styles.contentTitle}>🚀 Welcome to Job Skills!</ThemedText>
          <ThemedText style={styles.contentText}>
            [Content placeholder for Day 1]
            {'\n\n'}This is where the collaborative content will go.
            {'\n\n'}• Parent instructions
            {'\n'}• Child activities  
            {'\n'}• Discussion prompts
            {'\n'}• Shared exercises
          </ThemedText>
          <ThemedText style={styles.contentTitle}>📋 Today's Activities</ThemedText>
          <ThemedText style={styles.contentText}>
            Activity placeholders will go here...
          </ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <ThemedView>
        <ThemedText style={styles.contentTitle}>🚀 Coming Soon!</ThemedText>
        <ThemedText style={styles.contentText}>
          Day {day.dayNumber} content is being prepared...
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.moduleTitle}>Job Skills</ThemedText>
        <ThemedText style={styles.moduleSubtitle}>
          Learn essential work skills through 5 focused days
        </ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.daysContainer}
        showsVerticalScrollIndicator={false}
      >
        {dayModules.map((day) => (
          <CollapsibleDayCard
            key={day.id}
            day={day}
            isExpanded={expandedDay === day.id}
            onToggle={handleDayToggle}
          >
            {renderDayContent(day)}
          </CollapsibleDayCard>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  moduleSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  daysContainer: {
    padding: 20,
    paddingTop: 10,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
  },
});
