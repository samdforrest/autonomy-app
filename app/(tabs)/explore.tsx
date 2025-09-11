import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Module {
  id: string;
  title: string;
  emoji: string;
  description: string;
  isActive: boolean;
}

export default function TabTwoScreen() {
  const modules: Module[] = [
    {
      id: '1',
      title: 'Job',
      emoji: '💼',
      description: 'Work skills and career development',
      isActive: true
    },
    {
      id: '2',
      title: 'Collaboration',
      emoji: '🤝',
      description: 'Working together effectively',
      isActive: false
    },
    {
      id: '3',
      title: 'Growth',
      emoji: '🌱',
      description: 'Personal development and progress',
      isActive: false
    },
    {
      id: '4',
      title: 'Regulation',
      emoji: '📏',
      description: 'Self-control and emotional balance',
      isActive: false
    },
    {
      id: '5',
      title: 'Questions',
      emoji: '❓',
      description: 'Curiosity and inquiry skills',
      isActive: false
    },
    {
      id: '6',
      title: 'Process',
      emoji: '🔄',
      description: 'Systematic thinking and workflows',
      isActive: false
    },
    {
      id: '7',
      title: 'Self Coach',
      emoji: '🧘‍♂️',
      description: 'Self-reflection and guidance',
      isActive: false
    },
    {
      id: '8',
      title: 'Mistakes',
      emoji: '❌',
      description: 'Learning from errors and setbacks',
      isActive: false
    },
    {
      id: '9',
      title: 'Mastery Moments',
      emoji: '🏆',
      description: 'Celebrating achievements and success',
      isActive: false
    }
  ];

  const handleModulePress = (module: Module) => {
    if (!module.isActive) {
      console.log(`${module.title} module is locked`);
      return;
    }
    // TODO: Navigate to module details
    console.log(`${module.title} module pressed`);
  };

  const renderModule = ({ item }: { item: Module }) => (
    <TouchableOpacity 
      style={[
        styles.moduleCard,
        !item.isActive && styles.moduleCardLocked
      ]} 
      onPress={() => handleModulePress(item)}
      disabled={!item.isActive}
    >
      <View style={[
        styles.progressCircle,
        !item.isActive && styles.progressCircleLocked
      ]}>
        <View style={[
          styles.progressInner,
          !item.isActive && styles.progressInnerLocked
        ]}>
          <ThemedText style={styles.moduleIcon}>{item.emoji}</ThemedText>
        </View>
        <View style={styles.daysBadge}>
          <ThemedText style={styles.daysText}>5</ThemedText>
        </View>
      </View>
      <ThemedText style={[
        styles.moduleTitle,
        !item.isActive && styles.moduleTitleLocked
      ]}>
        {item.title}
      </ThemedText>
      <ThemedText style={[
        styles.moduleDescription,
        !item.isActive && styles.moduleDescriptionLocked
      ]}>
        {item.description}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Learning Modules</ThemedText>
        <ThemedText style={styles.subtitle}>Start your learning journey</ThemedText>
      </ThemedView>
      
      <FlatList
        data={modules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.moduleGrid}
        columnWrapperStyle={styles.moduleRow}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 40,
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
  moduleGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  moduleRow: {
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  moduleCard: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '45%',
    minHeight: 200,
  },
  moduleCardLocked: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFD54F',
  },
  progressCircleLocked: {
    backgroundColor: '#dee2e6',
    borderColor: '#adb5bd',
  },
  progressInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInnerLocked: {
    backgroundColor: '#6c757d',
  },
  moduleIcon: {
    fontSize: 32,
  },
  daysBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFC107',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  daysText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
    textAlign: 'center',
  },
  moduleTitleLocked: {
    color: '#6c757d',
  },
  moduleDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    color: '#666',
    lineHeight: 16,
  },
  moduleDescriptionLocked: {
    color: '#adb5bd',
  },
});
