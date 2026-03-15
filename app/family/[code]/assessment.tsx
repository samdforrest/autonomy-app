import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGoogleDocsContent } from '../../../hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '../../../services/api';
import { AssessmentQuestion, AssessmentResponse, assessmentService } from '../../../services/assessment-service';
import { useFamilyContext } from './_layout';

export default function FamilyAssessment() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { family, refreshFamily } = useFamilyContext();
  const router = useRouter();

  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);

  // Get assessment questions from Google Docs
  const { content: assessmentContent, loading: questionsLoading } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: 'Assessment Questions' }
  );

  // Extract assessment questions from content blocks
  const assessmentQuestions: AssessmentQuestion[] = useMemo(() => {
    if (!assessmentContent?.contentBlocks) return [];

    const questions: AssessmentQuestion[] = [];
    assessmentContent.contentBlocks.forEach(block => {
      if (block.content) {
        block.content.forEach(item => {
          if (item.type === 'assessment' && item.questions) {
            questions.push(...item.questions);
          }
        });
      }
    });

    console.log('📋 Family assessment: Extracted questions:', questions.length);
    return questions;
  }, [assessmentContent]);

  useEffect(() => {
    if (code) {
      // Set assessment service context - simplified to just family code
      assessmentService.setContext(code as string, 'student');
      
      // Check for existing results
      checkExistingResults();
    }
  }, [code]);

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
      if (Platform.OS === 'web') {
        window.alert('Please answer all questions before submitting.');
      } else {
        Alert.alert('Incomplete Assessment', 'Please answer all questions before submitting.');
      }
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

      if (Platform.OS === 'web') {
        window.alert("Thanks for showing us where you are now! Let's hear from some other kids who already use the tools you're about to learn.");
        router.push('/intro-student');
      } else {
        Alert.alert(
          'Assessment Complete!',
          "Thanks for showing us where you are now! Let's hear from some other kids who already use the tools you're about to learn.",
          [
            {
              text: 'Continue',
              onPress: () => router.push('/intro-student')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to save assessment results. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save assessment results. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeAssessment = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to retake the assessment? This will replace your current results.');
      if (confirmed) {
        setResponses([]);
        setHasExistingResults(false);
      }
    } else {
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
    }
  };

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
            {family.studentName || 'Your student'} has already completed their assessment.
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push(`/family/${code}/results`)}
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
        <Text style={styles.title}>Learning Assessment</Text>
        <Text style={styles.subtitle}>
          Help us personalize {family.studentName || 'your student'}'s learning journey
        </Text>
        <Text style={styles.familyCode}>Family: {code}</Text>
      </View>

      {assessmentQuestions.length === 0 ? (
        <View style={styles.noQuestionsContainer}>
          <Text style={styles.noQuestionsText}>
            No assessment questions found. Please check the assessment configuration.
          </Text>
        </View>
      ) : (
        <>
          {assessmentQuestions.map((question) => (
            <View key={question.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
              {question.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    getResponse(question.id)?.selectedOptionIds.includes(option.id) && styles.selectedOption
                  ]}
                  onPress={() => {
                    const currentResponse = getResponse(question.id);
                    const currentSelections = currentResponse?.selectedOptionIds || [];
                    
                    let newSelections;
                    if (currentSelections.includes(option.id)) {
                      // Remove selection
                      newSelections = currentSelections.filter(id => id !== option.id);
                    } else {
                      // Add selection
                      newSelections = [...currentSelections, option.id];
                    }
                    
                    handleSelectionChange(question.id, newSelections);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    getResponse(question.id)?.selectedOptionIds.includes(option.id) && styles.selectedOptionText
                  ]}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isAssessmentComplete() && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitAssessment}
              disabled={!isAssessmentComplete() || loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Complete Assessment'}
              </Text>
            </TouchableOpacity>
            
            {!isAssessmentComplete() && (
              <Text style={styles.submitHint}>
                Please answer all questions to continue
              </Text>
            )}
          </View>
        </>
      )}
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
  existingResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noQuestionsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  submitContainer: {
    padding: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
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
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
