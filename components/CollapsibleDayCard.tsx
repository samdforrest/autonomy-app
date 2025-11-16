import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

interface CollapsibleDayCardProps {
  day: DayModule;
  isExpanded: boolean;
  onToggle: (dayId: string) => void;
  children?: React.ReactNode;
}

export default function CollapsibleDayCard({ 
  day, 
  isExpanded, 
  onToggle, 
  children 
}: CollapsibleDayCardProps) {
  const [animation] = useState(new Animated.Value(0));

  const handleToggle = () => {
    if (day.isLocked) {
      console.log(`Day ${day.dayNumber} is locked`);
      return;
    }

    // Animate the expansion/collapse
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' }
    });

    onToggle(day.id);
  };

  const getArrowIcon = () => {
    if (day.isLocked) return '🔒';
    return isExpanded ? '▲' : '▼';
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[
          styles.dayCard,
          { backgroundColor: day.color },
          day.isLocked && styles.dayCardLocked,
          isExpanded && styles.dayCardExpanded
        ]}
        onPress={handleToggle}
        disabled={day.isLocked}
        activeOpacity={0.8}
      >
        <ThemedView style={styles.dayCardContent}>
          <ThemedView style={styles.dayHeader}>
            <ThemedView style={styles.dayInfo}>
              <ThemedText style={styles.dayNumber}>Day {day.dayNumber}</ThemedText>
              
            </ThemedView>
            <ThemedView style={styles.dayControls}>
              {day.isCompleted && (
                <ThemedView style={styles.completedBadge}>
                  <ThemedText style={styles.completedText}>✓</ThemedText>
                </ThemedView>
              )}
              <ThemedText style={styles.arrowIcon}>{getArrowIcon()}</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.dayBody}>
            <ThemedText style={styles.dayIcon}>{day.icon}</ThemedText>
            <ThemedText style={styles.dayTitle}>{day.title}</ThemedText>
            <ThemedText style={styles.dayDescription}>{day.description}</ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>

      {/* Expandable Content */}
      {isExpanded && !day.isLocked && (
        <ThemedView style={styles.expandedContent}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dayCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  dayCardLocked: {
    opacity: 0.6,
  },
  dayCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dayCardContent: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 12,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  completedBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  completedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrowIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  dayBody: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dayIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  dayDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  expandedContent: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
