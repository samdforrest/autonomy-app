import { useAppMode } from '@/contexts/AppModeContext';
import { useCompletion } from '@/contexts/CompletionContext';
import { FamilyService } from '@/services/family-service';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ModuleCompletionTrackerProps {
  moduleId: string;
  moduleName: string;
  currentDay: number;
  totalDays: number;
  onProgressUpdate?: (completedDays: number, isCompleted: boolean) => void;
  onCompletionChange?: () => void; // New callback for when completion data changes
}

export function ModuleCompletionTracker({
  moduleId,
  moduleName,
  currentDay,
  totalDays,
  onProgressUpdate,
  onCompletionChange
}: ModuleCompletionTrackerProps) {
  const { isInFamilyMode, currentFamilyCode, currentFamily, currentStudentId } = useAppMode();
  const { triggerRefresh } = useCompletion();
  const [completionData, setCompletionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const familyService = new FamilyService();

  // Load completion data
  useEffect(() => {
    const loadCompletionData = async () => {
      console.log('🔄 Loading completion data:', { 
        isInFamilyMode, 
        currentFamilyCode, 
        currentStudentId,
        hasFamily: !!currentFamily 
      });
      
      if (!isInFamilyMode || !currentFamilyCode) {
        console.log('❌ Not in family mode or no family code');
        return;
      }

      try {
        let studentId = currentStudentId;
        
        // If no student is selected, try to ensure there's a default student
        if (!studentId) {
          console.log('🔄 No student selected, ensuring default student exists...');
          studentId = await familyService.ensureDefaultStudent(currentFamilyCode);
          console.log('✅ Default student ensured:', studentId);
          
          // Note: In a full implementation, we'd want to update the app context here
          // For now, we'll just use the studentId locally
        }

        const completions = await familyService.getStudentModuleCompletions(
          currentFamilyCode,
          studentId
        );
        
        if (completions && completions[moduleId]) {
          setCompletionData(completions[moduleId]);
        }
      } catch (error) {
        console.error('❌ Failed to load completion data:', error);
      }
    };

    loadCompletionData();
  }, [isInFamilyMode, currentFamilyCode, currentStudentId, moduleId]);

  // Mark day as completed
  const markDayCompleted = async (dayNumber: number) => {
    console.log('🔄 Mark day completed called:', { 
      dayNumber, 
      isInFamilyMode, 
      currentFamilyCode, 
      currentStudentId,
      moduleId 
    });
    
    if (!isInFamilyMode || !currentFamilyCode) {
      console.log('📝 Not in family mode, skipping completion tracking');
      return;
    }

    setLoading(true);
    try {
      // Ensure we have a student ID
      let studentId = currentStudentId;
      if (!studentId) {
        studentId = await familyService.ensureDefaultStudent(currentFamilyCode);
        console.log('✅ Using default student for completion:', studentId);
      }

      const completedDays = Math.max(dayNumber, completionData?.completedDays || 0);
      
      await familyService.updateModuleProgress(
        currentFamilyCode,
        studentId,
        moduleId,
        completedDays,
        totalDays
      );

      const isCompleted = completedDays >= totalDays;
      
      // Reload completion data from Firebase to get the latest state
      const updatedCompletions = await familyService.getStudentModuleCompletions(
        currentFamilyCode,
        studentId
      );
      
      if (updatedCompletions && updatedCompletions[moduleId]) {
        setCompletionData(updatedCompletions[moduleId]);
      } else {
        // Fallback to local state if Firebase data isn't available yet
        setCompletionData({
          ...completionData,
          completedDays,
          isCompleted,
          totalDays,
          lastAccessed: new Date()
        });
      }

      onProgressUpdate?.(completedDays, isCompleted);
      onCompletionChange?.(); // Notify parent components that completion data changed
      triggerRefresh(); // Trigger global dashboard refresh
      
      console.log('✅ Day marked as completed:', dayNumber, 'for module:', moduleId);
    } catch (error) {
      console.error('❌ Failed to mark day as completed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark entire module as completed
  const markModuleCompleted = async () => {
    if (!isInFamilyMode || !currentFamilyCode) {
      return;
    }

    setLoading(true);
    try {
      // Ensure we have a student ID
      let studentId = currentStudentId;
      if (!studentId) {
        studentId = await familyService.ensureDefaultStudent(currentFamilyCode);
        console.log('✅ Using default student for module completion:', studentId);
      }

      await familyService.markModuleCompleted(
        currentFamilyCode,
        studentId,
        moduleId,
        totalDays,
        totalDays
      );

      // Reload completion data from Firebase to get the latest state
      const updatedCompletions = await familyService.getStudentModuleCompletions(
        currentFamilyCode,
        studentId
      );
      
      if (updatedCompletions && updatedCompletions[moduleId]) {
        setCompletionData(updatedCompletions[moduleId]);
      } else {
        // Fallback to local state if Firebase data isn't available yet
        setCompletionData({
          isCompleted: true,
          completedDays: totalDays,
          totalDays,
          completedAt: new Date(),
          lastAccessed: new Date()
        });
      }

      onProgressUpdate?.(totalDays, true);
      onCompletionChange?.(); // Notify parent components that completion data changed
      triggerRefresh(); // Trigger global dashboard refresh
      
      console.log('🎉 Module marked as completed:', moduleId);
    } catch (error) {
      console.error('❌ Failed to mark module as completed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not in family mode
  if (!isInFamilyMode) {
    return null;
  }

  const completedDays = completionData?.completedDays || 0;
  const isCompleted = completionData?.isCompleted || false;
  const progressPercentage = Math.round((completedDays / totalDays) * 100);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>📊 Progress Tracking</ThemedText>
         <ThemedText style={styles.subtitle}>
           {currentStudentId && currentFamily?.students?.[currentStudentId]?.name || 'Student'}
         </ThemedText>
      </ThemedView>

      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` },
              isCompleted && styles.progressCompleted
            ]} 
          />
        </ThemedView>
        
        <ThemedText style={styles.progressText}>
          {completedDays}/{totalDays} days completed ({progressPercentage}%)
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.dayButton,
            currentDay <= completedDays && styles.dayButtonCompleted
          ]}
          onPress={() => markDayCompleted(currentDay)}
          disabled={loading || currentDay <= completedDays}
        >
          <ThemedText style={[
            styles.dayButtonText,
            currentDay <= completedDays && styles.dayButtonTextCompleted
          ]}>
            {currentDay <= completedDays ? '✅ Day Completed' : `Mark Day ${currentDay} Complete`}
          </ThemedText>
        </TouchableOpacity>

        {completedDays >= totalDays && !isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={markModuleCompleted}
            disabled={loading}
          >
            <ThemedText style={styles.completeButtonText}>
              🎉 Mark Module Complete
            </ThemedText>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <ThemedView style={styles.completedBadge}>
            <ThemedText style={styles.completedText}>
              ✅ Module Completed!
            </ThemedText>
            {completionData?.completedAt && (
              <ThemedText style={styles.completedDate}>
                Completed: {new Date(completionData.completedAt.toDate()).toLocaleDateString()}
              </ThemedText>
            )}
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressCompleted: {
    backgroundColor: '#28a745',
  },
  progressText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
  },
  actions: {
    backgroundColor: 'transparent',
  },
  dayButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayButtonCompleted: {
    backgroundColor: '#28a745',
  },
  dayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayButtonTextCompleted: {
    color: '#fff',
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completedBadge: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completedText: {
    color: '#155724',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedDate: {
    color: '#155724',
    fontSize: 12,
    marginTop: 4,
  },
});
