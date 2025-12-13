import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { assessmentService } from '../services/assessment-service';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AssessmentCardProps {
  userMode: 'parent' | 'child';
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ userMode }) => {
  const hasCompletedAssessment = assessmentService.hasCompletedAssessment();
  const assessmentResults = assessmentService.loadAssessmentResults();

  const handlePress = () => {
    router.push('/assessment');
  };

  const getModuleDisplayName = (moduleId: string): string => {
    const names: { [key: string]: string } = {
      mistakes: 'Learning from Mistakes',
      regulation: 'Regulation & Control',
      job: 'Job Skills', 
      collaboration: 'Collaboration & Teamwork',
      selfcoach: 'Self-Coaching'
    };
    return names[moduleId] || moduleId;
  };

  const getCardContent = () => {
    const topModule = assessmentResults?.recommendedStartModule 
      ? getModuleDisplayName(assessmentResults.recommendedStartModule)
      : 'View results';

    if (userMode === 'parent') {
      return {
        title: '📊 Child Assessment',
        subtitle: hasCompletedAssessment 
          ? 'View your child\'s learning priorities'
          : 'Help determine your child\'s learning path',
        description: hasCompletedAssessment
          ? `Assessment completed. Recommended starting point: ${topModule}`
          : 'Complete a quick assessment to personalize the learning experience for your child.',
        buttonText: hasCompletedAssessment ? 'Start Assessment' : 'View My Results',
        icon: hasCompletedAssessment ? '📈' : '🎯'
      };
    } else {
      return {
        title: '🎯 Learning Assessment',
        subtitle: hasCompletedAssessment 
          ? 'See your personalized learning path'
          : 'Discover your learning priorities',
        description: hasCompletedAssessment
          ? `Your recommended starting point: ${topModule}`
          : 'Take a quick assessment to find out which skills to focus on first.',
        buttonText: hasCompletedAssessment ? 'Take Assessment' : 'Take Assessment',
        icon: hasCompletedAssessment ? '🌟' : '🚀'
      };
    }
  };

  const cardContent = getCardContent();

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <ThemedView style={styles.cardContent}>
        {/* Header */}
        <ThemedView style={styles.cardHeader}>
          <ThemedText style={styles.cardIcon}>{cardContent.icon}</ThemedText>
          <ThemedView style={styles.cardTitleContainer}>
            <ThemedText style={styles.cardTitle}>{cardContent.title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{cardContent.subtitle}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Description */}
        <ThemedText style={styles.cardDescription}>
          {cardContent.description}
        </ThemedText>

        {/* Status Indicator */}
        {hasCompletedAssessment && (
          <ThemedView style={styles.statusContainer}>
            <ThemedView style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>✅ Completed</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Action Button */}
        <ThemedView style={[
          styles.actionButton,
          hasCompletedAssessment ? styles.actionButtonCompleted : styles.actionButtonPending
        ]}>
          <ThemedText style={[
            styles.actionButtonText,
            hasCompletedAssessment ? styles.actionButtonTextCompleted : styles.actionButtonTextPending
          ]}>
            {cardContent.buttonText}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#34495E',
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  statusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPending: {
    backgroundColor: '#3498DB',
  },
  actionButtonCompleted: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextPending: {
    color: 'white',
  },
  actionButtonTextCompleted: {
    color: '#27AE60',
  },
});
