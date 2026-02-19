import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { useGoogleDocsContent } from '@/hooks/useGoogleDocsContent';
import { DOCUMENT_REFS } from '@/services/api';
import { surveyService } from '@/services/survey-service';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

type SurveyType = 'child' | 'parent';

interface SurveyQuestion {
  id: string;
  text: string;
}

interface SurveyModalProps {
  visible: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  surveyType: SurveyType;
}

// Parse questions from Google Docs content blocks
function parseQuestionsFromContent(contentBlocks: any[]): SurveyQuestion[] {
  const questions: SurveyQuestion[] = [];
  let questionCounter = 1;

  if (!contentBlocks) return questions;

  contentBlocks.forEach((block) => {
    // Check if block header contains a numbered question (e.g., "1. How was...")
    if (block.header) {
      const headerText = block.header.trim();
      // Match patterns like "1. Question text" or just text that looks like a question
      const numberedMatch = headerText.match(/^(\d+)\.\s*(.+)$/);
      if (numberedMatch) {
        questions.push({
          id: `q${questionCounter}`,
          text: headerText // Keep the full numbered format
        });
        questionCounter++;
      } else if (headerText.endsWith('?') || headerText.length > 20) {
        // Non-numbered question or longer text that might be a question
        questions.push({
          id: `q${questionCounter}`,
          text: `${questionCounter}. ${headerText}`
        });
        questionCounter++;
      }
    }

    // Check content items for questions (bullets and text)
    if (block.content) {
      block.content.forEach((item: any) => {
        const text = item.text?.trim();
        if (!text) return;

        // Handle bullets as questions
        if (item.type === 'bullet') {
          questions.push({
            id: `q${questionCounter}`,
            text: `${questionCounter}. ${text}`
          });
          questionCounter++;
        }
        // Handle numbered text
        else if (item.type === 'text') {
          const numberedMatch = text.match(/^(\d+)\.\s*(.+)$/);
          if (numberedMatch) {
            questions.push({
              id: `q${questionCounter}`,
              text: text
            });
            questionCounter++;
          }
        }
      });
    }
  });

  return questions;
}

export default function SurveyModal({ visible, onClose, moduleId, moduleName, surveyType }: SurveyModalProps) {
  const { currentFamilyCode } = useAppMode();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Determine which tab to fetch based on survey type
  const tabName = surveyType === 'child' ? 'Student Survey' : 'Parent Survey';

  // Fetch survey content from Google Docs
  const { content, loading, error } = useGoogleDocsContent(
    DOCUMENT_REFS.MAIN_DOCUMENT,
    'raw',
    { tab: tabName, autoFetch: visible }
  );

  // Parse questions when content loads
  useEffect(() => {
    if (content?.contentBlocks) {
      console.log(`📋 Parsing ${surveyType} survey questions from content blocks...`);
      const parsedQuestions = parseQuestionsFromContent(content.contentBlocks);
      console.log('📋 Parsed questions:', parsedQuestions.length, 'questions found');
      setQuestions(parsedQuestions);

      // Initialize responses object
      const initialResponses: Record<string, string> = {};
      parsedQuestions.forEach(q => {
        initialResponses[q.id] = '';
      });
      setResponses(initialResponses);
    }
  }, [content, surveyType]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentQuestionIndex(0);
      setSurveyCompleted(false);
      setResponses({});
    }
  }, [visible]);

  const handleResponse = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const canProceedToNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;
    return responses[currentQuestion.id]?.trim() !== '';
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Convert responses to SurveyResponse format
      const surveyResponses = questions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: responses[question.id] || '',
        timestamp: new Date()
      }));

      // Submit survey with survey type (child/parent)
      await surveyService.submitSurvey(
        surveyResponses,
        currentFamilyCode,
        moduleId,
        moduleName,
        surveyType
      );

      setSurveyCompleted(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to submit survey:', error);
      Alert.alert(
        'Submission Failed',
        'There was an error submitting your survey. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    return (
      <ThemedView style={styles.questionContainer}>
        <ThemedText style={styles.questionText}>
          {question.text}
        </ThemedText>

        <TextInput
          style={styles.textInput}
          value={responses[question.id] || ''}
          onChangeText={(text) => handleResponse(question.id, text)}
          placeholder="Type your response here..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ThemedView>
    );
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading survey...</ThemedText>
        </ThemedView>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>Survey Unavailable</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.errorCloseButton} onPress={onClose}>
            <ThemedText style={styles.errorCloseButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal>
    );
  }

  if (surveyCompleted) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.completedContainer}>
          <ThemedText style={styles.completedTitle}>Survey Completed!</ThemedText>
          <ThemedText style={styles.completedText}>
            Thank you for your feedback on the {moduleName} module. Your responses help us improve the learning experience.
          </ThemedText>
          <ThemedText style={styles.completedSubtext}>
            This window will close automatically...
          </ThemedText>
        </ThemedView>
      </Modal>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.title}>
            {surveyType === 'child' ? 'Child Feedback Survey' : 'Parent Feedback Survey'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{moduleName} Module</ThemedText>
        </ThemedView>

        <ThemedView style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </ThemedText>
          <ThemedView style={styles.progressBar}>
            <ThemedView 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
              ]} 
            />
          </ThemedView>
        </ThemedView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentQuestion && renderQuestion(currentQuestion)}
        </ScrollView>

        <ThemedView style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ThemedText style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
              Previous
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, !canProceedToNext() && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={[styles.navButtonText, styles.nextButtonText]}>
                {isLastQuestion ? 'Submit' : 'Next'}
              </ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 100,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextButtonText: {
    color: '#fff',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorCloseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 16,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  completedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});