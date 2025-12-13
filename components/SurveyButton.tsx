import SurveyModal from '@/components/SurveyModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { surveyService } from '@/services/survey-service';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SurveyButtonProps {
  moduleId: string;
  moduleName: string;
  dayNumber: number;
}

export default function SurveyButton({ moduleId, moduleName, dayNumber }: SurveyButtonProps) {
  const { currentFamilyCode } = useAppMode();
  const [surveyModalVisible, setSurveyModalVisible] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);

  // Only show survey button for Day 5
  if (dayNumber !== 5) {
    return null;
  }

  // Check if survey has already been completed
  useEffect(() => {
    const checkSurveyCompletion = async () => {
      try {
        setCheckingCompletion(true);
        const completed = await surveyService.hasSurveyBeenCompleted(moduleId, currentFamilyCode);
        setSurveyCompleted(completed);
      } catch (error) {
        console.error('Error checking survey completion:', error);
        setSurveyCompleted(false);
      } finally {
        setCheckingCompletion(false);
      }
    };

    checkSurveyCompletion();
  }, [moduleId, currentFamilyCode]);

  const handleSurveyComplete = () => {
    setSurveyCompleted(true);
    setSurveyModalVisible(false);
  };

  if (checkingCompletion) {
    return (
      <ThemedView style={styles.surveySection}>
        <ThemedText style={styles.surveySectionTitle}>
          📋 End of Lesson Survey
        </ThemedText>
        <ThemedText style={styles.surveySectionSubtitle}>
          Checking survey status...
        </ThemedText>
      </ThemedView>
    );
  }

  if (surveyCompleted) {
    return (
      <ThemedView style={[styles.surveySection, styles.completedSurveySection]}>
        <ThemedText style={styles.completedSurveyTitle}>
          ✅ Survey Completed
        </ThemedText>
        <ThemedText style={styles.completedSurveySubtitle}>
          Thank you for your feedback on this lesson!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.surveySection}>
        <ThemedText style={styles.surveySectionTitle}>
          📋 End of Lesson Survey
        </ThemedText>
        <ThemedText style={styles.surveySectionSubtitle}>
          Help us improve by sharing your feedback about this lesson
        </ThemedText>
        <TouchableOpacity 
          style={styles.surveyButton}
          onPress={() => setSurveyModalVisible(true)}
        >
          <ThemedText style={styles.surveyButtonText}>
            📝 Take Survey
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Survey Modal */}
      <SurveyModal
        visible={surveyModalVisible}
        onClose={handleSurveyComplete}
        moduleId={moduleId}
        moduleName={moduleName}
      />
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
    backgroundColor: '#4CAF50',
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
  surveyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});