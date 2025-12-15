import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { assessmentService, AssessmentSummary } from '../../../../../services/assessment-service';
import { useFamilyContext } from '../../_layout';

export default function StudentResults() {
  const { code, studentId } = useLocalSearchParams<{ code: string; studentId: string }>();
  const { family } = useFamilyContext();
  const router = useRouter();
  
  const [results, setResults] = useState<AssessmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const student = family.students[studentId as string];

  useEffect(() => {
    if (code && studentId) {
      loadResults();
    }
  }, [code, studentId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Set assessment service context
      assessmentService.setContext(code as string, studentId as string);
      
      // Load results
      const assessmentResults = await assessmentService.loadAssessmentResults();
      setResults(assessmentResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Student not found</Text>
      </View>
    );
  }

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
            {student.name} hasn't completed an assessment yet.
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push(`/family/${code}/student/${studentId}/assessment`)}
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
        <Text style={styles.title}>{student.name}'s Results</Text>
        <Text style={styles.subtitle}>
          Personalized learning recommendations based on assessment
        </Text>
        {results.completedAt && (
          <Text style={styles.completedDate}>
            Completed: {new Date(results.completedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Recommended Start Module */}
      <View style={styles.recommendationCard}>
        <Text style={styles.cardTitle}>🎯 Recommended Starting Point</Text>
        <Text style={styles.recommendedModule}>
          {getModuleDisplayName(results.recommendedStartModule)}
        </Text>
        <Text style={styles.recommendationText}>
          Based on the assessment, this is the best module to start with for {student.name}.
        </Text>
      </View>

      {/* Module Priorities */}
      <View style={styles.prioritiesCard}>
        <Text style={styles.cardTitle}>📊 Learning Priorities</Text>
        <Text style={styles.cardSubtitle}>
          Modules ordered by priority (highest need first)
        </Text>
        
        {moduleScores.map((module, index) => (
          <View key={module.moduleId} style={styles.moduleRow}>
            <View style={styles.moduleRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleName}>{module.displayName}</Text>
              <View style={styles.priorityContainer}>
                <View style={[styles.priorityBadge, getPriorityStyle(module.priority)]}>
                  <Text style={[styles.priorityText, getPriorityTextStyle(module.priority)]}>
                    {module.priority.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.scoreText}>Score: {module.score}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Summary */}
      {results.summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📝 Summary</Text>
          <Text style={styles.summaryText}>{results.summary}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push(`/family/${code}/student/${studentId}/modules`)}
        >
          <Text style={styles.buttonText}>Start Learning Modules</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push(`/family/${code}/student/${studentId}/assessment`)}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Retake Assessment
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Helper functions
function getModuleDisplayName(moduleId: string): string {
  const displayNames: { [key: string]: string } = {
    mistakes: 'Learning from Mistakes',
    regulation: 'Regulation & Control',
    job: 'Job Skills & Responsibility',
    collaboration: 'Collaboration & Teamwork',
    selfcoach: 'Self-Coaching'
  };
  return displayNames[moduleId] || moduleId;
}

function getModulePriority(score: number): 'high' | 'medium' | 'low' | 'minimal' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  if (score >= 2) return 'low';
  return 'minimal';
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'high': return { backgroundColor: '#ffebee' };
    case 'medium': return { backgroundColor: '#fff3e0' };
    case 'low': return { backgroundColor: '#e8f5e8' };
    default: return { backgroundColor: '#f5f5f5' };
  }
}

function getPriorityTextStyle(priority: string) {
  switch (priority) {
    case 'high': return { color: '#d32f2f' };
    case 'medium': return { color: '#f57c00' };
    case 'low': return { color: '#388e3c' };
    default: return { color: '#666' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginBottom: 8,
  },
  completedDate: {
    fontSize: 14,
    color: '#999',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#E74C3C',
    marginTop: 50,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  prioritiesCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  recommendedModule: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moduleRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});