import SurveyModal from '@/components/SurveyModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { surveyService } from '@/services/survey-service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type SurveyType = 'child' | 'parent';

interface SurveyButtonProps {
  moduleId: string;
  moduleName: string;
  dayNumber: number;
}

export default function SurveyButton({ moduleId, moduleName, dayNumber }: SurveyButtonProps) {
  const router = useRouter();
  const { currentFamilyCode } = useAppMode();
  const [activeSurveyType, setActiveSurveyType] = useState<SurveyType | null>(null);
  const [childSurveyCompleted, setChildSurveyCompleted] = useState(false);
  const [parentSurveyCompleted, setParentSurveyCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);

  // Only show survey button for Day 5
  if (dayNumber !== 5) {
    return null;
  }

  // Check if surveys have already been completed
  useEffect(() => {
    const checkSurveyCompletion = async () => {
      try {
        setCheckingCompletion(true);
        const [childCompleted, parentCompleted] = await Promise.all([
          surveyService.hasSurveyBeenCompleted(moduleId, currentFamilyCode, 'child'),
          surveyService.hasSurveyBeenCompleted(moduleId, currentFamilyCode, 'parent')
        ]);
        setChildSurveyCompleted(childCompleted);
        setParentSurveyCompleted(parentCompleted);
      } catch (error) {
        console.error('Error checking survey completion:', error);
        setChildSurveyCompleted(false);
        setParentSurveyCompleted(false);
      } finally {
        setCheckingCompletion(false);
      }
    };

    checkSurveyCompletion();
  }, [moduleId, currentFamilyCode]);

  const handleSurveyComplete = (surveyType: SurveyType) => {
    if (surveyType === 'child') {
      setChildSurveyCompleted(true);
    } else {
      setParentSurveyCompleted(true);
    }
    setActiveSurveyType(null);
  };

  const openSurvey = (surveyType: SurveyType) => {
    setActiveSurveyType(surveyType);
  };

  if (checkingCompletion) {
    return (
      <ThemedView style={styles.surveySection}>
        <ThemedText style={styles.surveySectionTitle}>
          End of Lesson Survey
        </ThemedText>
        <ThemedText style={styles.surveySectionSubtitle}>
          Checking survey status...
        </ThemedText>
      </ThemedView>
    );
  }

  const bothCompleted = childSurveyCompleted && parentSurveyCompleted;

  if (bothCompleted) {
    return (
      <ThemedView style={[styles.surveySection, styles.completedSurveySection]}>
        <View style={styles.completedSurveyContent}>
          <View style={styles.completedSurveyTextContainer}>
            <ThemedText style={styles.completedSurveyTitle}>
              Surveys Completed
            </ThemedText>
            <ThemedText style={styles.completedSurveySubtitle}>
              Thank you for your feedback on this lesson!
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.backToModulesButton}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <ThemedText style={styles.backToModulesButtonText}>
              Back to Modules
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.surveySection}>
        <ThemedText style={styles.surveySectionTitle}>
          End of Lesson Survey
        </ThemedText>
        <ThemedText style={styles.surveySectionSubtitle}>
          Help us improve by sharing your feedback about this lesson
        </ThemedText>

        {/* Child Survey Button - placed above */}
        <TouchableOpacity
          style={[
            styles.surveyButton,
            styles.childSurveyButton,
            childSurveyCompleted && styles.surveyButtonCompleted
          ]}
          onPress={() => openSurvey('child')}
          disabled={childSurveyCompleted}
        >
          <ThemedText style={[
            styles.surveyButtonText,
            childSurveyCompleted && styles.surveyButtonTextCompleted
          ]}>
            {childSurveyCompleted ? 'Child Survey Completed' : 'Child Survey'}
          </ThemedText>
        </TouchableOpacity>

        {/* Parent Survey Button - placed below */}
        <TouchableOpacity
          style={[
            styles.surveyButton,
            styles.parentSurveyButton,
            parentSurveyCompleted && styles.surveyButtonCompleted
          ]}
          onPress={() => openSurvey('parent')}
          disabled={parentSurveyCompleted}
        >
          <ThemedText style={[
            styles.surveyButtonText,
            parentSurveyCompleted && styles.surveyButtonTextCompleted
          ]}>
            {parentSurveyCompleted ? 'Parent Survey Completed' : 'Parent Survey'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Survey Modal */}
      {activeSurveyType && (
        <SurveyModal
          visible={true}
          onClose={() => handleSurveyComplete(activeSurveyType)}
          moduleId={moduleId}
          moduleName={moduleName}
          surveyType={activeSurveyType}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  surveySection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  surveySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  surveySectionSubtitle: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 16,
    lineHeight: 20,
  },
  surveyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childSurveyButton: {
    backgroundColor: '#2196F3',
    marginBottom: 12,
  },
  parentSurveyButton: {
    backgroundColor: '#9C27B0',
  },
  surveyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  surveyButtonCompleted: {
    backgroundColor: '#27AE60',
    opacity: 0.8,
  },
  surveyButtonTextCompleted: {
    color: '#fff',
  },
  completedSurveySection: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#27AE60',
  },
  completedSurveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 8,
  },
  completedSurveySubtitle: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  completedSurveyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedSurveyTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  backToModulesButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backToModulesButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});