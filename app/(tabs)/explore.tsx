import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { useCompletion } from '@/contexts/CompletionContext';
import { FamilyService } from '@/services/family-service';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Module {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  day3Color: string;
  day5Color: string;
}

// Map module titles to their IDs used in Firebase
const MODULE_TITLE_TO_ID: Record<string, string> = {
  'Responsibility': 'job',
  'Collaboration': 'collaboration',
  'Self-Monitoring': 'selfmonitoring',
  'Self-Regulation': 'regulation',
  'Curiosity': 'curiosity',
  'Shape of Learning': 'shapeoflearning',
  'Self Coach': 'selfcoach',
  'Mistakes': 'mistakes',
  'Neuroplasticity': 'neuroplasticity',
  'Mastery Moments': 'masterymoments',
};

export default function TabTwoScreen() {
  const { userMode, isInFamilyMode, currentFamilyCode, currentStudentId } = useAppMode();
  const { refreshTrigger } = useCompletion();
  const [moduleCompletions, setModuleCompletions] = useState<Record<string, number>>({});
  const familyService = new FamilyService();

  // Fetch module completion data
  useEffect(() => {
    const loadCompletionData = async () => {
      if (!isInFamilyMode || !currentFamilyCode) {
        setModuleCompletions({});
        return;
      }

      try {
        let studentId = currentStudentId;
        if (!studentId) {
          studentId = await familyService.ensureDefaultStudent(currentFamilyCode);
        }

        const completions = await familyService.getStudentModuleCompletions(
          currentFamilyCode,
          studentId
        );

        if (completions) {
          const completedDaysMap: Record<string, number> = {};
          Object.entries(completions).forEach(([moduleId, data]: [string, any]) => {
            completedDaysMap[moduleId] = data.completedDays || 0;
          });
          setModuleCompletions(completedDaysMap);
        }
      } catch (error) {
        console.error('Failed to load module completions:', error);
      }
    };

    loadCompletionData();
  }, [isInFamilyMode, currentFamilyCode, currentStudentId, refreshTrigger]);

  // Helper to get remaining days for a module
  const getRemainingDays = (moduleTitle: string): number => {
    const moduleId = MODULE_TITLE_TO_ID[moduleTitle];
    if (!moduleId) return 5;
    const completedDays = moduleCompletions[moduleId] || 0;
    return Math.max(0, 5 - completedDays);
  };

  // No redirect needed - parents can access explore page
  
  const studentModules: Module[] = [
    {
      id: '1',
      title: 'Responsibility',
      description: 'What is my job?',
      isActive: true,
      day3Color: '#C7DEF0',
      day5Color: '#A2C8E6'
    },
    {
      id: '2',
      title: 'Collaboration',
      description: 'Teamwork 101',
      isActive: true,
      day3Color: '#DD9D7C',
      day5Color: '#C75B25'
    },
    {
      id: '3',
      title: 'Self-Monitoring',
      description: 'Making sure I understand',
      isActive: true,
      day3Color: '#E8C866',
      day5Color: '#D9A400'
    },
    {
      id: '4',
      title: 'Self-Regulation',
      description: 'Who is in control?',
      isActive: true,
      day3Color: '#E8BCB0',
      day5Color: '#D88F7B'
    },
    {
      id: '5',
      title: 'Curiosity',
      description: 'Questions are expected',
      isActive: true,
      day3Color: '#669D9D',
      day5Color: '#005B5B'
    },
    {
      id: '6',
      title: 'Shape of Learning',
      description: 'It is not a sprint',
      isActive: true,
      day3Color: '#669D9D',
      day5Color: '#005B5B'
    },
    {
      id: '7',
      title: 'Self Coach',
      description: 'Helpful self-talk',
      isActive: true,
      day3Color: '#E8BCB0',
      day5Color: '#D88F7B'
    },
    {
      id: '8',
      title: 'Mistakes',
      description: 'Learning from errors and setbacks',
      isActive: true,
      day3Color: '#C7DEF0',
      day5Color: '#A2C8E6'
    },
    {
      id: '9',
      title: 'Neuroplasticity',
      description: 'How does my brain grow?',
      isActive: true,
      day3Color: '#DD9D7C',
      day5Color: '#C75B25'
    },
    {
      id: '10',
      title: 'Mastery Moments',
      description: 'Celebrating success',
      isActive: true,
      day3Color: '#E8C866',
      day5Color: '#D9A400'
    }
  ];

  const parentModules: Module[] = [
    {
      id: '1',
      title: 'Responsibility',
      description: 'How to guide responsibility development',
      isActive: true,
      day3Color: '#C7DEF0',
      day5Color: '#A2C8E6'
    },
    {
      id: '2',
      title: 'Collaboration',
      description: 'Supporting teamwork skills',
      isActive: true,
      day3Color: '#DD9D7C',
      day5Color: '#C75B25'
    },
    {
      id: '3',
      title: 'Self-Monitoring',
      description: 'Helping your child self-assess',
      isActive: true,
      day3Color: '#E8C866',
      day5Color: '#D9A400'
    },
    {
      id: '4',
      title: 'Self-Regulation',
      description: 'Teaching self-control strategies',
      isActive: true,
      day3Color: '#E8BCB0',
      day5Color: '#D88F7B'
    },
    {
      id: '5',
      title: 'Curiosity',
      description: 'Encouraging questions and exploration',
      isActive: true,
      day3Color: '#669D9D',
      day5Color: '#005B5B'
    },
    {
      id: '6',
      title: 'Shape of Learning',
      description: 'Understanding the learning process',
      isActive: true,
      day3Color: '#669D9D',
      day5Color: '#005B5B'
    },
    {
      id: '7',
      title: 'Self Coach',
      description: 'Modeling positive self-talk',
      isActive: true,
      day3Color: '#E8BCB0',
      day5Color: '#D88F7B'
    },
    {
      id: '8',
      title: 'Mistakes',
      description: 'Helping process errors constructively',
      isActive: true,
      day3Color: '#C7DEF0',
      day5Color: '#A2C8E6'
    },
    {
      id: '9',
      title: 'Neuroplasticity',
      description: 'Explaining brain growth to your child',
      isActive: true,
      day3Color: '#DD9D7C',
      day5Color: '#C75B25'
    },
    {
      id: '10',
      title: 'Mastery Moments',
      description: 'Celebrating achievements effectively',
      isActive: true,
      day3Color: '#E8C866',
      day5Color: '#D9A400'
    }
  ];

  const modules = userMode === 'parent' ? parentModules : studentModules;

  const handleModulePress = (module: Module) => {
    if (!module.isActive) {
      console.log(`${module.title} module is locked`);
      return;
    }
    
    // Navigate to specific module - different routes for parent vs student
    const moduleRoutes = {
      'Responsibility': userMode === 'parent' ? '/responsibility-parent-module' : '/responsibility-module',
      'Collaboration': userMode === 'parent' ? '/collaboration-parent-module' : '/collaboration-module',
      'Self-Monitoring': userMode === 'parent' ? '/self-monitoring-parent-module' : '/self-monitoring-module',
      'Mistakes': userMode === 'parent' ? '/mistakes-parent-module' : '/mistakes-module',
      'Self-Regulation': userMode === 'parent' ? '/regulation-parent-module' : '/regulation-module',
      'Self Coach': userMode === 'parent' ? '/selfcoach-parent-module' : '/selfcoach-module',
      'Curiosity': userMode === 'parent' ? '/curiosity-parent-module' : '/curiosity-module',
      'Shape of Learning': userMode === 'parent' ? '/shapeoflearning-parent-module' : '/shapeoflearning-module',
      'Neuroplasticity': userMode === 'parent' ? '/neuroplasticity-parent-module' : '/neuroplasticity-module',
      'Mastery Moments': userMode === 'parent' ? '/mastery-moments-parent-module' : '/mastery-moments-module'
    };

    const route = moduleRoutes[module.title as keyof typeof moduleRoutes];
    if (route) {
      router.push(route as any); // Type assertion needed for dynamic routes
    } else {
      console.log(`${module.title} module pressed - coming soon`);
    }
  };

  // Parent Dashboard Components
  const renderModule = ({ item }: { item: Module }) => {
    const ringColor = parseInt(item.id) <= 5 ? item.day3Color : item.day5Color;
    const remainingDays = getRemainingDays(item.title);

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
          !item.isActive && styles.progressCircleLocked,
          item.isActive && { backgroundColor: ringColor, borderColor: ringColor }
        ]}>
          <View style={[
            styles.progressInner,
            !item.isActive && styles.progressInnerLocked
          ]}>
            <Image
              source={require('@/assets/images/autonomy-brain.png')}
              style={styles.moduleBrainIcon}
              contentFit="contain"
            />
          </View>
          {remainingDays > 0 && (
            <View style={[styles.daysBadge, { backgroundColor: ringColor }]}>
              <ThemedText style={styles.daysText}>{remainingDays}</ThemedText>
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
          {item.description}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/autonomy-brain.png')}
            style={styles.brainLogo}
            contentFit="contain"
          />
        </ThemedView>
        <ThemedText type="title" style={styles.title}>
          {userMode === 'parent' ? 'How To Modules' : 'Learning Modules'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {userMode === 'parent' ? 'Guide your child\'s learning journey' : 'Start your learning journey'}
        </ThemedText>
      </ThemedView>
    </>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={modules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.moduleGrid}
        columnWrapperStyle={styles.moduleRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 4,
  },
  progressCircleLocked: {
    backgroundColor: '#dee2e6',
    borderColor: '#adb5bd',
    borderWidth: 4,
  },
  progressInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInnerLocked: {
    backgroundColor: '#6c757d',
  },
  moduleBrainIcon: {
    width: 45,
    height: 45,
  },
  daysBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
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
    color: '#FFFFFF',
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
