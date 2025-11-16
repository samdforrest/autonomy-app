import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Module {
  id: string;
  title: string;
  emoji: string;
  description: string;
  isActive: boolean;
}

export default function TabTwoScreen() {
  const { userMode, childProgress, parentInsights } = useAppMode();
  
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
      isActive: true
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
      isActive: true
    },
    {
      id: '8',
      title: 'Mistakes',
      emoji: '❌',
      description: 'Learning from errors and setbacks',
      isActive: true
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
    
    // Navigate to specific module
    if (module.title === 'Job') {
      router.push('/job-module');
    } else if (module.title === 'Mistakes') {
      router.push('/mistakes-module');
    } else if (module.title === 'Regulation') {
      router.push('/regulation-module');
    } else if (module.title === 'Self Coach') {
      router.push('/selfcoach-module');
    } else {
      console.log(`${module.title} module pressed - coming soon`);
    }
  };

  // Parent Dashboard Components
  const renderParentInsights = () => (
    <ThemedView style={styles.parentSection}>
      <ThemedText style={styles.parentSectionTitle}>📊 Learning Insights</ThemedText>
      
      {/* Recommended Modules */}
      <ThemedView style={styles.insightCard}>
        <ThemedText style={styles.insightTitle}>🎯 Priority Modules</ThemedText>
        {parentInsights.recommendedModules.slice(0, 3).map((moduleId, index) => {
          const module = modules.find(m => m.title.toLowerCase() === moduleId);
          return (
            <ThemedText key={moduleId} style={styles.insightItem}>
              {index + 1}. {module?.title || moduleId} {module?.emoji}
            </ThemedText>
          );
        })}
      </ThemedView>

      {/* Strengths */}
      {parentInsights.strengths.length > 0 && (
        <ThemedView style={styles.insightCard}>
          <ThemedText style={styles.insightTitle}>💪 Strengths</ThemedText>
          {parentInsights.strengths.map(strength => (
            <ThemedText key={strength} style={styles.strengthItem}>
              ✅ {strength}
            </ThemedText>
          ))}
        </ThemedView>
      )}

      {/* Areas for Growth */}
      {parentInsights.strugglingAreas.length > 0 && (
        <ThemedView style={styles.insightCard}>
          <ThemedText style={styles.insightTitle}>🎯 Focus Areas</ThemedText>
          {parentInsights.strugglingAreas.map(area => (
            <ThemedText key={area} style={styles.strugglingItem}>
              📈 {area}
            </ThemedText>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );

  const renderChildProgress = () => (
    <ThemedView style={styles.parentSection}>
      <ThemedText style={styles.parentSectionTitle}>📈 Child's Progress</ThemedText>
      {Object.entries(childProgress).map(([moduleId, progress]) => {
        const module = modules.find(m => m.title.toLowerCase() === moduleId);
        const progressPercent = Math.round((progress.completedDays / progress.totalDays) * 100);
        
        return (
          <ThemedView key={moduleId} style={styles.progressCard}>
            <ThemedView style={styles.progressHeader}>
              <ThemedText style={styles.progressModuleName}>
                {module?.emoji} {module?.title || moduleId}
              </ThemedText>
              <ThemedText style={styles.progressPercent}>{progressPercent}%</ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </ThemedView>
            <ThemedText style={styles.progressDetails}>
              {progress.completedDays} of {progress.totalDays} days completed
            </ThemedText>
            {progress.assessmentScores && progress.assessmentScores.length > 0 && (
              <ThemedText style={styles.progressScore}>
                Avg Score: {Math.round(progress.assessmentScores.reduce((a, b) => a + b, 0) / progress.assessmentScores.length)}%
              </ThemedText>
            )}
          </ThemedView>
        );
      })}
    </ThemedView>
  );

  const renderModule = ({ item }: { item: Module }) => {
    // In parent mode, show progress overlay
    const progress = childProgress[item.title.toLowerCase()];
    const progressPercent = progress ? Math.round((progress.completedDays / progress.totalDays) * 100) : 0;
    
    return (
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
          
          {/* Parent Mode: Show progress overlay */}
          {userMode === 'parent' && progress && (
            <View style={styles.progressOverlay}>
              <ThemedText style={styles.progressOverlayText}>{progressPercent}%</ThemedText>
            </View>
          )}
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
          {userMode === 'parent' && progress 
            ? `${progress.completedDays}/${progress.totalDays} days completed`
            : item.description
          }
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/autonomy-brain.png')} 
            style={styles.brainLogo}
            contentFit="contain"
          />
        </ThemedView>
        <ThemedText type="title" style={styles.title}>
          {userMode === 'parent' ? 'Parent Dashboard' : 'Learning Modules'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {userMode === 'parent' 
            ? 'Monitor your child\'s learning progress' 
            : 'Start your learning journey'
          }
        </ThemedText>
      </ThemedView>
      
      {userMode === 'parent' ? (
        <ScrollView 
          style={styles.parentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderParentInsights()}
          {renderChildProgress()}
        </ScrollView>
      ) : (
        <FlatList
          data={modules}
          renderItem={renderModule}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.moduleGrid}
          columnWrapperStyle={styles.moduleRow}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  brainLogo: {
    width: 60,
    height: 60,
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
  // Parent Dashboard Styles
  parentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  parentSection: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  parentSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  insightItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  strengthItem: {
    fontSize: 14,
    color: '#2ECC71',
    marginBottom: 4,
  },
  strugglingItem: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 4,
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressModuleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressScore: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  progressOverlay: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  progressOverlayText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
