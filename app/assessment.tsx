import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { AssessmentQuestionComponent } from '../components/AssessmentQuestion';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppMode } from '../contexts/AppModeContext';
import { useGoogleDocsContent } from '../hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '../services/api';
import {
  assessmentService,
  type AssessmentQuestion,
  type AssessmentResponse,
  type ModulePriority
} from '../services/assessment-service';

export default function AssessmentScreen() {
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ModulePriority[] | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  
  // Get family context for saving assessment to correct family
  const { isInFamilyMode, currentFamilyCode, userMode } = useAppMode();

  // Debug current state
  console.log('🎯 AssessmentScreen render:', { 
    hasResults: !!results, 
    showQuestions, 
    responsesCount: responses.length,
    isSubmitting
  });

  // Load assessment questions from Google Docs "Assessment Questions" tab
  const { content, loading, error, refetch } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: 'Assessment Questions' }
  );

  // Extract assessment questions from content
  const assessmentQuestions: AssessmentQuestion[] = React.useMemo(() => {
    if (!content?.contentBlocks) return [];
    
    const questions: AssessmentQuestion[] = [];
    content.contentBlocks.forEach(block => {
      if (block.content) {
        block.content.forEach(item => {
          if (item.type === 'assessment' && item.questions) {
            questions.push(...item.questions);
          }
        });
      }
    });
    
    console.log('📋 Extracted assessment questions:', questions.length);
    return questions;
  }, [content]);

  // Check if user has already completed assessment
  useEffect(() => {
    const loadExistingResults = async () => {
      console.log('🔍 Assessment useEffect:', { 
        showQuestions, 
        questionsLength: assessmentQuestions.length
      });
      
      // If we're explicitly showing questions, don't load existing results
      if (showQuestions) {
        console.log('📝 Showing questions (showQuestions=true)');
        return;
      }
      
      try {
        // Set family context if user is in family mode
        if (isInFamilyMode && currentFamilyCode) {
          console.log('🏠 Assessment: Setting family context for loading:', currentFamilyCode);
          assessmentService.setContext(currentFamilyCode, 'student'); // Simplified: one student per family
        } else {
          // Make sure to sync context from global state for non-family users
          console.log('👤 Assessment: Syncing context for individual user');
          assessmentService.syncFromGlobalContext();
        }
        
        const existingResults = await assessmentService.loadAssessmentResults();
        console.log('🔍 Loaded existing results:', !!existingResults);
        
        if (existingResults && assessmentQuestions.length > 0) {
          // User has already completed assessment, show results
          console.log('📊 Loading existing results from localStorage');
          // Use the stored results instead of recalculating with empty responses
          const storedModuleScores = existingResults.moduleScores || {};
          const priorities = Object.entries(storedModuleScores)
            .sort(([,a], [,b]) => b - a)  // Descending order
            .map(([moduleId, score]) => ({
              moduleId,
              score,
              priority: assessmentService.getModulePriority(score),
              percentage: assessmentService.calculatePercentage(score, storedModuleScores),
              displayName: assessmentService.getModuleDisplayName(moduleId)
            }));
          setResults(priorities);
        } else {
          // No existing results, show questions
          console.log('📝 No existing results, showing questions');
          setShowQuestions(true);
        }
      } catch (error) {
        console.error('❌ Error loading existing results:', error);
        setShowQuestions(true);
      }
    };

    loadExistingResults();
  }, [assessmentQuestions, showQuestions]);

  const handleSelectionChange = (questionId: string, selectedOptions: string[]) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        // Update existing response
        return prev.map(r => 
          r.questionId === questionId 
            ? { ...r, selectedOptionIds: selectedOptions }
            : r
        );
      } else {
        // Add new response
        return [...prev, { questionId, selectedOptionIds: selectedOptions }];
      }
    });
  };

  const getResponse = (questionId: string): AssessmentResponse | undefined => {
    return responses.find(r => r.questionId === questionId);
  };

  const isAssessmentComplete = (): boolean => {
    return assessmentQuestions.every(q => {
      const response = getResponse(q.id);
      return response && response.selectedOptionIds.length > 0;
    });
  };

  const handleSubmitAssessment = async () => {
    if (!isAssessmentComplete()) {
      Alert.alert(
        'Assessment Incomplete',
        'Please answer all questions before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Set family context if user is in family mode
      if (isInFamilyMode && currentFamilyCode) {
        console.log('🏠 Assessment: Setting family context for submission:', currentFamilyCode);
        assessmentService.setContext(currentFamilyCode, 'student'); // Simplified: one student per family
      } else {
        // Make sure to sync context from global state for non-family users
        console.log('👤 Assessment: Syncing context for individual user');
        assessmentService.syncFromGlobalContext();
      }
      
      // Calculate module priorities
      const priorities = assessmentService.calculateModulePriorities(responses, assessmentQuestions);
      
      // Generate and save summary
      const summary = assessmentService.generateAssessmentSummary(priorities);
      await assessmentService.saveAssessmentResults(summary);
      
      setResults(priorities);
      setShowQuestions(false); // Switch to results view

      if (userMode === 'student') {
        // Student-specific completion message
        Alert.alert(
          'Assessment Complete!',
          "Thanks for showing us where you are now! Let's hear from some other kids who already use the tools you're about to learn.",
          [
            { text: 'Continue', onPress: () => {
              router.push('/intro-student');
            } }
          ]
        );
      } else {
        // Parent completion message
        Alert.alert(
          'Assessment Complete!',
          summary.summary,
          [
            { text: 'View Results', onPress: () => {} },
            { text: 'Start Learning', onPress: () => {
              router.push('/(tabs)');
            } }
          ]
        );
      }
      
    } catch (error) {
      console.error('❌ Assessment submission error:', error);
      Alert.alert(
        'Error',
        'There was a problem processing your assessment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeAssessment = () => {
    console.log('🔄 Retake button pressed');

    Alert.alert(
      'Retake Assessment',
      'This will clear your current results. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('❌ Retake cancelled') },
        {
          text: 'Retake',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ Retake confirmed, clearing data...');
            // Clear all assessment data (now async with Firebase)
            await assessmentService.clearAssessmentResults();
            setResults(null);
            setResponses([]);
            setIsSubmitting(false);
            setShowQuestions(true); // Force show questions

            console.log('🔄 Assessment retake: All data cleared, showing questions');
          }
        }
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <ThemedText style={styles.loadingText}>
            Loading assessment questions from Google Docs...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Error state
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>Assessment Unavailable</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  // Results view
  if (results && !showQuestions) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.resultsContainer}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>📊 Your Assessment Results</ThemedText>
            <ThemedText style={styles.subtitle}>
              Recommended module order based on your responses
            </ThemedText>
          </ThemedView>

          {results.map((module, index) => (
            <ThemedView key={module.moduleId} style={styles.moduleResult}>
              <ThemedView style={styles.moduleHeader}>
                <ThemedText style={styles.moduleRank}>#{index + 1}</ThemedText>
                <ThemedText style={styles.moduleName}>{module.displayName}</ThemedText>
                <ThemedText style={styles.moduleScore}>{module.score} pts</ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.progressBar}>
                <ThemedView 
                  style={[
                    styles.progressFill, 
                    { width: `${module.percentage}%` }
                  ]} 
                />
              </ThemedView>
              
              <ThemedText style={styles.modulePriority}>
                Priority: {module.priority.toUpperCase()}
              </ThemedText>
            </ThemedView>
          ))}

          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => router.push('/(tabs)' as any)}
            >
              <ThemedText style={styles.primaryButtonText}>Back to Home</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#27AE60', marginTop: 8 }]} 
              onPress={() => {
                // Only navigate to explore for students, parents go to home
                if (userMode === 'student') {
                  router.push('/(tabs)/explore');
                } else {
                  router.push('/(tabs)');
                }
              }}
            >
              <ThemedText style={styles.primaryButtonText}>Start Learning</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleRetakeAssessment}
            >
              <ThemedText style={styles.secondaryButtonText}>Retake Assessment</ThemedText>
            </TouchableOpacity>
            
            {/* Alternative retake button without Alert */}
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: '#F39C12', marginTop: 8 }]}
              onPress={async () => {
                console.log('🔄 Direct retake (no alert)');
                await assessmentService.clearAssessmentResults();
                setResults(null);
                setResponses([]);
                setIsSubmitting(false);
                setShowQuestions(true);
                console.log('🔄 Assessment retake: All data cleared, showing questions');
              }}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: 'white' }]}>
                🔄 Retake (Direct)
              </ThemedText>
            </TouchableOpacity>

            {/* Debug button - remove in production */}
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: '#E74C3C', marginTop: 8 }]}
              onPress={async () => {
                console.log('🧹 Force clearing all assessment data');
                await assessmentService.clearAssessmentResults();
                setResults(null);
                setResponses([]);
                setShowQuestions(true);
              }}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: 'white' }]}>
                🧹 Force Clear (Debug)
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  // Assessment form
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>🎯 Learning Assessment</ThemedText>
        <ThemedText style={styles.subtitle}>
          Help us personalize your learning journey by answering these questions
        </ThemedText>
        
        {assessmentQuestions.length > 0 && (
          <ThemedView style={styles.progressInfo}>
            <ThemedText style={styles.progressText}>
              {responses.filter(r => r.selectedOptionIds.length > 0).length} of {assessmentQuestions.length} questions answered
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.questionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {assessmentQuestions.length === 0 ? (
          <ThemedView style={styles.noQuestionsContainer}>
            <ThemedText style={styles.noQuestionsText}>
              No assessment questions found. Please check the "Assessment Questions" tab in your Google Doc.
            </ThemedText>
          </ThemedView>
        ) : (
          assessmentQuestions.map((question) => (
            <AssessmentQuestionComponent
              key={question.id}
              question={question}
              response={getResponse(question.id)}
              onSelectionChange={handleSelectionChange}
            />
          ))
        )}

        {assessmentQuestions.length > 0 && (
          <ThemedView style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isAssessmentComplete() && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitAssessment}
              disabled={!isAssessmentComplete() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.submitButtonText}>
                  Complete Assessment
                </ThemedText>
              )}
            </TouchableOpacity>
            
            {!isAssessmentComplete() && (
              <ThemedText style={styles.submitHint}>
                Please answer all questions to continue
              </ThemedText>
            )}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressInfo: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EBF3FD',
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#2980B9',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  questionsContainer: {
    padding: 20,
  },
  noQuestionsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  submitContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    padding: 20,
  },
  moduleResult: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
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
    marginTop: 20,
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
});
