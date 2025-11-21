import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import type { AssessmentQuestion, AssessmentResponse } from '../services/assessment-service';

interface AssessmentQuestionProps {
  question: AssessmentQuestion;
  response: AssessmentResponse | undefined;
  onSelectionChange: (questionId: string, selectedOptions: string[]) => void;
}

export const AssessmentQuestionComponent: React.FC<AssessmentQuestionProps> = ({
  question,
  response,
  onSelectionChange
}) => {
  const selectedOptions = response?.selectedOptionIds || [];

  const toggleOption = (optionId: string) => {
    const newSelection = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)  // Remove if already selected
      : [...selectedOptions, optionId];                // Add if not selected
    
    onSelectionChange(question.id, newSelection);
  };

  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      mistakes: '#E74C3C',
      regulation: '#3498DB', 
      job: '#F39C12',
      collaboration: '#27AE60',
      selfcoach: '#9B59B6'
    };
    return colors[module] || '#95A5A6';
  };

  return (
    <ThemedView style={styles.questionContainer}>
      {/* Module Tag */}
      <ThemedView style={[styles.moduleTag, { backgroundColor: getModuleColor(question.module) }]}>
        <ThemedText style={styles.moduleTagText}>
          {question.module.toUpperCase()}
        </ThemedText>
      </ThemedView>

      {/* Question Text */}
      <ThemedText style={styles.questionText}>{question.question}</ThemedText>
      
      {/* Instructions */}
      <ThemedText style={styles.instructionText}>Select all that apply:</ThemedText>
      
      {/* Options */}
      {question.options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              isSelected && styles.selectedOption
            ]}
            onPress={() => toggleOption(option.id)}
            activeOpacity={0.7}
          >
            <ThemedView style={styles.optionContent}>
              {/* Checkbox */}
              <ThemedView style={[
                styles.checkbox,
                isSelected && styles.checkedBox
              ]}>
                {isSelected && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </ThemedView>
              
              {/* Option Text */}
              <ThemedView style={styles.optionTextContainer}>
                <ThemedText style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText
                ]}>
                  {option.text}
                </ThemedText>
                
                {/* Score Badge */}
                <ThemedView style={[
                  styles.scoreBadge,
                  isSelected && styles.selectedScoreBadge
                ]}>
                  <ThemedText style={[
                    styles.scoreText,
                    isSelected && styles.selectedScoreText
                  ]}>
                    {option.score}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        );
      })}
      
      {/* Selection Count */}
      {selectedOptions.length > 0 && (
        <ThemedView style={styles.selectionInfo}>
          <ThemedText style={styles.selectionText}>
            {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  moduleTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    lineHeight: 26,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#ECF0F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FAFBFC',
  },
  selectedOption: {
    borderColor: '#3498DB',
    backgroundColor: '#EBF3FD',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkedBox: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#34495E',
    flex: 1,
    marginRight: 12,
  },
  selectedOptionText: {
    color: '#2980B9',
    fontWeight: '500',
  },
  scoreBadge: {
    backgroundColor: '#ECF0F1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  selectedScoreBadge: {
    backgroundColor: '#3498DB',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  selectedScoreText: {
    color: 'white',
  },
  selectionInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E8F6F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
  },
});
