import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { assessmentService } from '../services/assessment-service';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AssessmentCardProps {
  userMode: 'parent' | 'student';
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ userMode }) => {
  const hasCompletedAssessment = assessmentService.hasCompletedAssessment();
  const [assessmentResults, setAssessmentResults] = React.useState<any>(null);

  React.useEffect(() => {
    const loadResults = async () => {
      const results = await assessmentService.loadAssessmentResults();
      setAssessmentResults(results);
    };
    loadResults();
  }, []);

  const handlePress = () => {
    if (userMode === 'student') {
      router.push('/assessment');
    } else {
      // Parents can only view results if assessment is completed
      if (hasCompletedAssessment) {
        // Navigate to student progress/results if available
        console.log('Viewing student progress');
        // Could implement navigation to progress dashboard later
      } else {
        console.log('Student needs to take assessment first');
        // Could show a reminder modal or do nothing
      }
    }
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
        title: '📊 Student Progress',
        subtitle: hasCompletedAssessment
          ? 'Your student\'s learning priorities'
          : 'Student assessment needed',
        description: hasCompletedAssessment
          ? `Student assessment completed. Recommended starting point: ${topModule}`
          : 'Your student needs to take the assessment to personalize their learning path.',
        buttonText: hasCompletedAssessment ? 'View Student Progress' : 'Remind Student',
        // icon: hasCompletedAssessment ? '📈' : '⏳'
      };
    } else {
      return {
        title: 'Learning Assessment',
        subtitle: hasCompletedAssessment 
          ? 'See your personalized learning path'
          : 'Discover your learning priorities',
        description: hasCompletedAssessment
          ? `Your recommended starting point: ${topModule}`
          : 'Take a quick assessment to find out which skills to focus on first.',
        buttonText: hasCompletedAssessment ? 'Take Assessment' : 'Take Assessment',
        // icon: hasCompletedAssessment ? '🌟' : '🚀'
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
              <ThemedText style={styles.statusText}>Completed</ThemedText>
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
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
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
