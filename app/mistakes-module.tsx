import CollapsibleDayCard from '@/components/CollapsibleDayCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useGoogleDocsContent } from '../hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '../services/api';

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

export default function MistakesModuleScreen() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  
  // Google Docs content for the currently active day
  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'mistakes',
    { tab: 'Mistakes', day: currentDay }
  );

  const dayModules: DayModule[] = [
    {
      id: 'day1',
      title: 'Understanding Mistakes',
      description: 'What mistakes are and why they happen',
      dayNumber: 1,
      isCompleted: false,
      isLocked: false,
      color: '#E74C3C',
      icon: '🤔',
      type: 'collaborative'
    },
    {
      id: 'day2',
      title: 'Owning Our Mistakes',
      description: 'Taking responsibility and accountability',
      dayNumber: 2,
      isCompleted: false,
      isLocked: false,
      color: '#F39C12',
      icon: '🙋‍♂️',
      type: 'collaborative'
    },
    {
      id: 'day3',
      title: 'Learning from Errors',
      description: 'Turning mistakes into learning opportunities',
      dayNumber: 3,
      isCompleted: false,
      isLocked: false,
      color: '#3498DB',
      icon: '💡',
      type: 'independent'
    },
    {
      id: 'day4',
      title: 'Making It Right',
      description: 'Fixing mistakes and moving forward',
      dayNumber: 4,
      isCompleted: false,
      isLocked: false,
      color: '#2ECC71',
      icon: '🔧',
      type: 'independent'
    },
    {
      id: 'day5',
      title: 'Growing Stronger',
      description: 'Building resilience and confidence',
      dayNumber: 5,
      isCompleted: false,
      isLocked: false,
      color: '#9B59B6',
      icon: '🌟',
      type: 'evaluation'
    }
  ];

  const handleDayToggle = (dayId: string) => {
    const dayNumber = parseInt(dayId.replace('day', ''));
    
    // If clicking the same day, collapse it
    if (expandedDay === dayId) {
      setExpandedDay(null);
    } else {
      // Expanding a new day - set it as current and load its content
      setCurrentDay(dayNumber);
      setExpandedDay(dayId);
    }
  };

  const renderContentBlock = (block: any, index: number) => (
    <ThemedView key={block.id || index} style={styles.bubble}>
      {/* Header/Label */}
      {block.header && (
        <ThemedText style={styles.bubbleHeader}>{block.header}</ThemedText>
      )}
      
      {/* Content */}
      <ThemedView style={styles.bubbleContent}>
        {block.content && block.content.map((item: any, idx: number) => {
          if (item.type === 'bullet') {
            return (
              <ThemedText key={idx} style={styles.bulletPoint}>
                • {item.text}
              </ThemedText>
            );
          } else if (item.type === 'text') {
            return (
              <ThemedText key={idx} style={styles.bubbleText}>
                {item.text}
              </ThemedText>
            );
          }
          return null;
        })}
      </ThemedView>
    </ThemedView>
  );

  const renderSection = (sectionKey: string, section: any, defaultIcon: string) => (
    <ThemedView key={sectionKey} style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {defaultIcon} {section.title}
      </ThemedText>
      
      {/* Render bullet points */}
      {section.items && section.items.length > 0 && (
        <ThemedView style={styles.bulletContainer}>
          {section.items.map((item: string, index: number) => (
            <ThemedText key={index} style={styles.bulletPoint}>
              • {item}
            </ThemedText>
          ))}
        </ThemedView>
      )}
      
      {/* Render additional content */}
      {section.content && (
        <ThemedText style={styles.contentText}>
          {section.content}
        </ThemedText>
      )}
    </ThemedView>
  );

  const getSectionIcon = (sectionKey: string): string => {
    const iconMap: Record<string, string> = {
      rules: '📋',
      instructions: '💭', 
      activities: '🎯',
      what_are_mistakes: '🤔',
      think_together: '💭',
      todays_activities: '🎯',
    };
    return iconMap[sectionKey] || '📝';
  };

  const renderDayContent = (day: DayModule) => {
    // Only render content for the currently expanded day
    if (expandedDay !== day.id) {
      return null;
    }

    // Check if this is the day we're currently loading content for
    if (day.dayNumber === currentDay) {
      // Loading state
      if (loading) {
        return (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={day.color} />
            <ThemedText style={styles.loadingText}>Loading Day {day.dayNumber} content from Google Docs...</ThemedText>
          </ThemedView>
        );
      }

      // Error state
      if (error) {
        return (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>⚠️ Content Unavailable</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        );
      }

      // Content state - render dynamic content for any day
      return (
        <ThemedView>
          {/* Refresh button */}
          <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
            <ThemedText style={styles.refreshButtonText}>🔄 Refresh Content</ThemedText>
          </TouchableOpacity>

          {content?.sections ? (
            // Render sections from Google Docs
            Object.entries(content.sections).map(([sectionKey, section]) =>
              renderSection(sectionKey, section, getSectionIcon(sectionKey))
            )
          ) : (
            // Fallback content if no Google Docs content is available
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>📝 Day {day.dayNumber} Content</ThemedText>
              <ThemedText style={styles.contentText}>
                Content is loading from Google Docs...
              </ThemedText>
            </ThemedView>
          )}
          
          {/* Content metadata */}
          {content?.metadata && (
            <ThemedView style={styles.metadataContainer}>
              <ThemedText style={styles.metadataText}>
                Last updated: {new Date(content.metadata.lastModified).toLocaleDateString()}
              </ThemedText>
              <ThemedText style={styles.metadataText}>
                Sections: {content.metadata.totalSections}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      );
    }
    
    // This shouldn't happen with our new logic, but keeping as fallback
    return (
      <ThemedView>
        <ThemedText style={styles.contentTitle}>🚀 Loading...</ThemedText>
        <ThemedText style={styles.contentText}>
          Preparing Day {day.dayNumber} content...
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.moduleTitle}>Mistakes & Learning</ThemedText>
        <ThemedText style={styles.moduleSubtitle}>
          Transform mistakes into growth opportunities through 5 focused days
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
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  bulletContainer: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#666',
    fontSize: 14,
  },
  metadataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bubble: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  bubbleContent: {
    backgroundColor: 'transparent',
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
});
