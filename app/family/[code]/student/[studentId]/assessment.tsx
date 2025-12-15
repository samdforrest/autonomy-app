import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGoogleDocsContent } from '../../../../../hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '../../../../../services/api';
import { AssessmentQuestion, AssessmentResponse, assessmentService } from '../../../../../services/assessment-service';
import { useFamilyContext } from '../../_layout';

export default function StudentAssessment() {
  const { code, studentId } = useLocalSearchParams<{ code: string; studentId: string }>();
  const { family, refreshFamily } = useFamilyContext();
  const router = useRouter();
  
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);

  // Get assessment questions from Google Docs
  const { content: assessmentContent, loading: questionsLoading } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'assessment'
  );

  const student = family.students[studentId as string];
  const assessmentQuestions: AssessmentQuestion[] = assessmentContent?.questions || [];

  useEffect(() => {
    if (code && studentId) {
      // Set assessment service context
      assessmentService.setContext(code as string, studentId as string);
      
      // Check for existing results
      checkExistingResults();
    }
  }, [code, studentId]);

  const checkExistingResults = async () => {
    try {
      const existingResults = await assessmentService.loadAssessmentResults();
      setHasExistingResults(!!existingResults);
    } catch (error) {
      console.error('Error checking existing results:', error);
    }
  };

  const handleSelectionChange = (questionId: string, selectedOptions: string[]) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => 
          r.questionId === questionId 
            ? { ...r, selectedOptionIds: selectedOptions }
            : r
        );
      } else {
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
      Alert.alert('Incomplete Assessment', 'Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Calculate priorities
      const priorities = assessmentService.calculateModulePriorities(responses, assessmentQuestions);
      const summary = assessmentService.generateAssessmentSummary(priorities);
      
      // Save results (will save to both Firebase and localStorage)
      await assessmentService.saveAssessmentResults(summary);
      
      // Refresh family data
      await refreshFamily();
      
      Alert.alert(
        'Assessment Complete!',
        `Assessment completed for ${student.name}. You can now view their personalized learning modules.`,
        [
          {
            text: 'View Results',
            onPress: () => router.push(`/family/${code}/student/${studentId}/results`)
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting assessment:', error);
      Alert.alert('Error', 'Failed to save assessment results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeAssessment = () => {
    Alert.alert(
      'Retake Assessment',
      'Are you sure you want to retake the assessment? This will replace your current results.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retake', 
          onPress: () => {
            setResponses([]);
            setHasExistingResults(false);
          }
        }
      ]
    );
  };

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Student not found</Text>
      </View>
    );
  }

  if (questionsLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading assessment questions...</Text>
      </View>
    );
  }

  if (hasExistingResults && responses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.existingResultsContainer}>
          <Text style={styles.title}>Assessment Complete</Text>
          <Text style={styles.subtitle}>
            {student.name} has already completed their assessment.
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push(`/family/${code}/student/${studentId}/results`)}
          >
            <Text style={styles.buttonText}>View Results</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRetakeAssessment}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Retake Assessment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessment for {student.name}</Text>
        <Text style={styles.subtitle}>
          Answer these questions to get personalized learning recommendations
        </Text>
        <Text style={styles.progress}>
          Progress: {responses.length} / {assessmentQuestions.length} questions
        </Text>
      </View>

      {assessmentQuestions.map((question, index) => (
        <View key={question.id} style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {index + 1}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const response = getResponse(question.id);
              const isSelected = response?.selectedOptionIds.includes(option.id) || false;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    const currentResponse = getResponse(question.id);
                    const currentSelections = currentResponse?.selectedOptionIds || [];
                    
                    let newSelections;
                    if (isSelected) {
                      // Remove selection
                      newSelections = currentSelections.filter(id => id !== option.id);
                    } else {
                      // Add selection
                      newSelections = [...currentSelections, option.id];
                    }
                    
                    handleSelectionChange(question.id, newSelections);
                  }}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.submitContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, !isAssessmentComplete() && styles.submitButtonDisabled]}
          onPress={handleSubmitAssessment}
          disabled={!isAssessmentComplete() || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Complete Assessment'}
          </Text>
        </TouchableOpacity>
        
        {!isAssessmentComplete() && (
          <Text style={styles.incompleteText}>
            Please answer all questions to complete the assessment
          </Text>
        )}
      </View>
    </ScrollView>
  );
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
    marginBottom: 12,
  },
  progress: {
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
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#E74C3C',
    marginTop: 50,
  },
  existingResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionCard: {
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
  questionNumber: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  submitContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  incompleteText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 200,
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