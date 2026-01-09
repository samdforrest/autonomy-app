import { useAppMode } from '@/contexts/AppModeContext';
import { useCompletion } from '@/contexts/CompletionContext';
import { FamilyService } from '@/services/family-service';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CompletionStats {
  totalStudents: number;
  moduleStats: { [moduleId: string]: { 
    completed: number; 
    inProgress: number;
    notStarted: number;
    totalDaysCompleted: number;
    totalPossibleDays: number;
    averageProgress: number;
  } };
}

export function FamilyCompletionDashboard() {
  const { isInFamilyMode, currentFamilyCode, currentFamily } = useAppMode();
  const { refreshTrigger } = useCompletion();
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const familyService = new FamilyService();

  const moduleNames: { [key: string]: string } = {
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

  useEffect(() => {
    const loadStats = async () => {
      if (!isInFamilyMode || !currentFamilyCode) {
        setLoading(false);
        return;
      }

      try {
        const completionStats = await familyService.getFamilyCompletionStats(currentFamilyCode);
        setStats(completionStats);
      } catch (error) {
        console.error('❌ Failed to load family completion stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isInFamilyMode, currentFamilyCode, refreshTrigger]); // Add refreshTrigger to dependencies

  const refreshStats = async () => {
    if (!currentFamilyCode) return;
    
    setLoading(true);
    try {
      const completionStats = await familyService.getFamilyCompletionStats(currentFamilyCode);
      setStats(completionStats);
    } catch (error) {
      console.error('❌ Failed to refresh stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isInFamilyMode) {
    return null;
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading completion stats...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!stats) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Unable to load completion statistics</ThemedText>
      </ThemedView>
    );
  }

  const getCompletionPercentage = (moduleStats: { 
    completed: number; 
    inProgress: number; 
    notStarted: number;
    totalDaysCompleted: number;
    totalPossibleDays: number;
    averageProgress: number;
  }) => {
    // Use the day-based average progress instead of just completed modules
    return moduleStats.averageProgress || 0;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>📊 Family Progress Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>
          Family: {currentFamilyCode} • {stats.totalStudents} student{stats.totalStudents !== 1 ? 's' : ''}
        </ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshStats}>
          <ThemedText style={styles.refreshButtonText}>🔄 Refresh</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(stats.moduleStats).map(([moduleId, moduleStats]) => {
          const completionPercentage = getCompletionPercentage(moduleStats);
          const moduleName = moduleNames[moduleId] || moduleId;

          return (
            <ThemedView key={moduleId} style={styles.moduleCard}>
              <ThemedView style={styles.moduleHeader}>
                <ThemedText style={styles.moduleName}>{moduleName}</ThemedText>
                <ThemedView style={styles.progressInfo}>
                  <ThemedText style={styles.completionPercentage}>
                    {completionPercentage}% complete
                  </ThemedText>
                  <ThemedText style={styles.dayProgress}>
                    {moduleStats.totalDaysCompleted}/{moduleStats.totalPossibleDays} days
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.progressBar}>
                <ThemedView 
                  style={[
                    styles.progressFill, 
                    { width: `${completionPercentage}%` },
                    completionPercentage === 100 && styles.progressComplete
                  ]} 
                />
              </ThemedView>

            </ThemedView>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    maxHeight: 400,
  },
  moduleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  progressInfo: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  completionPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  dayProgress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressComplete: {
    backgroundColor: '#28a745',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    padding: 20,
  },
});
