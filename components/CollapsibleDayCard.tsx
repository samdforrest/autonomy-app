import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import {
  Animated,
  Image,
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

// Day icon images mapping
const dayImages: Record<number, any> = {
  1: require('../assets/images/day-icons/day1.png'),
  2: require('../assets/images/day-icons/day2.png'),
  3: require('../assets/images/day-icons/day3.png'),
  4: require('../assets/images/day-icons/day4.png'),
  5: require('../assets/images/day-icons/day5.png'),
};

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
            <Image source={dayImages[day.dayNumber]} style={styles.dayIcon} resizeMode="contain" />
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
    fontFamily: 'Poppins_700Bold',
    color: '#000',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#000',
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  completedText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins_700Bold',
  },
  dayBody: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dayIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  dayDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#000',
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
