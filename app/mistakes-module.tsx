import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
      isLocked: true,
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
      isLocked: true,
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
      isLocked: true,
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
      isLocked: true,
      color: '#9B59B6',
      icon: '🌟',
      type: 'evaluation'
    }
  ];

  const handleDayPress = (day: DayModule) => {
    if (day.isLocked) {
      console.log(`Day ${day.dayNumber} is locked`);
      return;
    }
    
    // Navigate to specific day
    if (day.dayNumber === 1) {
      router.push('/mistakes-day-1');
    } else {
      console.log(`Day ${day.dayNumber} component coming soon`);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'collaborative':
        return 'Parent + Child';
      case 'independent':
        return 'Child Only';
      case 'evaluation':
        return 'Review Together';
      default:
        return '';
    }
  };

  const renderDayCard = (day: DayModule) => (
    <TouchableOpacity
      key={day.id}
      style={[
        styles.dayCard,
        { backgroundColor: day.color },
        day.isLocked && styles.dayCardLocked
      ]}
      onPress={() => handleDayPress(day)}
      disabled={day.isLocked}
    >
      <ThemedView style={styles.dayCardContent}>
        <ThemedView style={styles.dayHeader}>
          <ThemedText style={styles.dayNumber}>Day {day.dayNumber}</ThemedText>
          <ThemedText style={styles.typeLabel}>{getTypeLabel(day.type)}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.dayBody}>
          <ThemedText style={styles.dayIcon}>{day.icon}</ThemedText>
          <ThemedText style={styles.dayTitle}>{day.title}</ThemedText>
          <ThemedText style={styles.dayDescription}>{day.description}</ThemedText>
        </ThemedView>

        {day.isCompleted && (
          <ThemedView style={styles.completedBadge}>
            <ThemedText style={styles.completedText}>✓</ThemedText>
          </ThemedView>
        )}

        {day.isLocked && (
          <ThemedView style={styles.lockedOverlay}>
            <ThemedText style={styles.lockedIcon}>🔒</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );

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
        {dayModules.map(renderDayCard)}
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
  dayCard: {
    borderRadius: 16,
    marginBottom: 16,
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
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeLabel: {
    fontSize: 12,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
  },
  lockedIcon: {
    fontSize: 24,
    opacity: 0.8,
  },
});
