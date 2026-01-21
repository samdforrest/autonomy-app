import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { assessmentService, AssessmentSummary } from '../../../services/assessment-service';
import { useFamilyContext } from './_layout';

function getModuleDisplayName(moduleId: string): string {
  const names: { [key: string]: string } = {
    mistakes: 'Mistakes',
    regulation: 'Regulation', 
    job: 'Responsibility',
    collaboration: 'Collaboration',
    selfcoach: 'Self-Coaching',
    curiosity: 'Curiosity',
    shapeoflearning: 'Shape of Learning',
    neuroplasticity: 'Neuroplasticity',
    masterymoments: 'Mastery Moments',
    selfmonitoring: 'Self-Monitoring'
  };
  return names[moduleId] || moduleId;
}

function getModulePriority(score: number): string {
  if (score >= 15) return 'high';
  if (score >= 10) return 'medium'; 
  if (score >= 5) return 'low';
  return 'minimal';
}

export default function FamilyResults() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { family } = useFamilyContext();
  const router = useRouter();

  const [results, setResults] = useState<AssessmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetaking, setIsRetaking] = useState(false);

  useEffect(() => {
    if (code) {
      loadResults();
    }
  }, [code]);

  const loadResults = async () => {
    try {
      setLoading(true);

      // Set assessment service context
      assessmentService.setContext(code as string, 'student');

      // Load results
      const assessmentResults = await assessmentService.loadAssessmentResults();
      setResults(assessmentResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeAssessment = async () => {
    // Use window.confirm on web, Alert.alert on native
    const confirmed = Platform.OS === 'web'
      ? window.confirm('This will clear your current results. Are you sure you want to retake the assessment?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Retake Assessment',
            'This will clear your current results. Are you sure you want to retake the assessment?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Retake', style: 'destructive', onPress: () => resolve(true) }
            ]
          );
        });

    if (!confirmed) return;

    try {
      setIsRetaking(true);

      // Set context and clear assessment data from Firebase and localStorage
      assessmentService.setContext(code as string, 'student');
      await assessmentService.clearAssessmentResults();

      console.log('✅ Assessment cleared, navigating to assessment page');

      // Navigate to assessment page
      router.push(`/family/${code}/assessment`);
    } catch (error) {
      console.error('Error clearing assessment:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to clear assessment. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to clear assessment. Please try again.');
      }
    } finally {
      setIsRetaking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.container}>
        <View style={styles.noResultsContainer}>
          <Text style={styles.title}>No Assessment Results</Text>
          <Text style={styles.subtitle}>
            {(family as any).studentName || 'Your student'} hasn't completed an assessment yet.
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push(`/family/${code}/assessment`)}
          >
            <Text style={styles.buttonText}>Take Assessment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const moduleScores = Object.entries(results.moduleScores || {})
    .sort(([,a], [,b]) => b - a)
    .map(([moduleId, score]) => ({
      moduleId,
      score,
      displayName: getModuleDisplayName(moduleId),
      priority: getModulePriority(score)
    }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessment Results</Text>
        <Text style={styles.subtitle}>
          Learning priorities for {(family as any).studentName || 'your student'}
        </Text>
        <Text style={styles.familyCode}>Family: {code}</Text>
      </View>

      <View style={styles.resultsContainer}>
        {moduleScores.map((module, index) => (
          <View key={module.moduleId} style={styles.moduleResult}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleRank}>#{index + 1}</Text>
              <Text style={styles.moduleName}>{module.displayName}</Text>
              <Text style={styles.moduleScore}>{module.score} pts</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.round((module.score / Math.max(...moduleScores.map(m => m.score))) * 100)}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.modulePriority}>
              Priority: {module.priority.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)' as any)}
        >
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, isRetaking && styles.buttonDisabled]}
          onPress={handleRetakeAssessment}
          disabled={isRetaking}
        >
          {isRetaking ? (
            <View style={styles.retakingContainer}>
              <ActivityIndicator size="small" color="#7F8C8D" />
              <Text style={[styles.secondaryButtonText, { marginLeft: 8 }]}>Clearing...</Text>
            </View>
          ) : (
            <Text style={styles.secondaryButtonText}>Retake Assessment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  familyCode: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  resultsContainer: {
    padding: 20,
  },
  moduleResult: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498DB',
    marginRight: 12,
    minWidth: 40,
  },
  moduleName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  moduleScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  modulePriority: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  actionButtons: {
    padding: 20,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BDC3C7',
  },
  secondaryButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  retakingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
