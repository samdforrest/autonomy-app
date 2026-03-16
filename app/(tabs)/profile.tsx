import { FamilyCompletionDashboard } from '@/components/FamilyCompletionDashboard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppMode } from '@/contexts/AppModeContext';
import { useFamilyTutorial } from '@/contexts/TutorialContext';
import { assessmentService, type AssessmentSummary } from '@/services/assessment-service';
import { familyService } from '@/services/family-service';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { userMode, isInFamilyMode, currentFamily, currentFamilyCode, isAdminFamily, setFamilyContext, clearFamilyContext } = useAppMode();
  const tutorial = useFamilyTutorial(currentFamilyCode);
  const router = useRouter();
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentSummary | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top whenever this screen is focused (e.g. tutorial navigation)
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Load assessment results
  useEffect(() => {
    const loadAssessmentResults = async () => {
      setLoadingResults(true);
      try {
        if (isInFamilyMode && currentFamilyCode) {
          assessmentService.setContext(currentFamilyCode, 'student');
        } else {
          await assessmentService.syncFromGlobalContext();
        }

        const results = await assessmentService.loadAssessmentResults();
        setAssessmentResults(results);
      } catch (error) {
        console.error('❌ Error loading assessment results:', error);
      } finally {
        setLoadingResults(false);
      }
    };

    loadAssessmentResults();
  }, [isInFamilyMode, currentFamilyCode]);

  const getModuleDisplayName = (moduleId: string): string => {
    const names: { [key: string]: string } = {
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
    return names[moduleId] || moduleId;
  };

  // Auto-trigger removed - users can start tutorial manually from buttons below

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You\'ll need to enter your family code again to access the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            console.log('🚪 User logging out');
            clearFamilyContext();
            // No need to navigate - AuthGuard will automatically show login screen
          }
        }
      ]
    );
  };

  // Student profile functions removed for now

  const handleJoinFamily = async () => {
    if (!familyCode.trim()) {
      Alert.alert('Error', 'Please enter a family code');
      return;
    }

    const code = familyCode.trim().toUpperCase();
    setLoading(true);

    try {
      const familyData = await familyService.getFamilyData(code);

      if (familyData) {
        // Set family context globally
        setFamilyContext(code, familyData);
        
        // Simple welcome message - users can start tutorial manually if they want
        // Login count will be incremented on home screen load
        Alert.alert('Welcome to Your Family!', `Successfully joined family ${code}! Use the "Take App Tour" button below if you'd like a guided introduction to the app.`, [
          { text: 'OK', onPress: () => router.replace('/(tabs)/profile') }
        ]);
      } else {
        Alert.alert(
          'Family Not Found',
          `The family code "${code}" was not found. Please check the code and try again, or create a new family instead.`,
          [
            { text: 'Try Again', style: 'cancel' },
            {
              text: 'Create New Family',
              onPress: () => router.push('/create-family')
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error joining family:', error);
      Alert.alert('Error', 'Failed to join family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFamilyCode = (text: string) => {
    // Auto-format as XXXX-XXXX
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  };


  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.profileIconContainer}>
          <Image
            source={require('@/assets/images/autonomy-brain.png')}
            style={styles.brainLogo}
            contentFit="contain"
          />
        </View>
        <ThemedText type="title" style={styles.title}>Progress Tracking</ThemedText>
        <ThemedText style={styles.subtitle}>
          {isInFamilyMode ? `Family: ${currentFamilyCode}` : 'Manage your learning journey'}
        </ThemedText>
      </ThemedView>
      
      {/* Family Dashboard Content - Only show when in family mode */}
      {isInFamilyMode && currentFamily ? (
        <View>
          {/* Family Welcome Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Family Dashboard {isAdminFamily && <Text style={styles.adminBadge}>ADMIN</Text>}
            </Text>
            <Text style={styles.parentName}>
              Welcome, {currentFamily.settings?.parentName || 'Parent'}!
            </Text>
          </View>

          {/* Student Profile Section - Temporarily removed */}

          {/* Module Completion Dashboard */}
          <FamilyCompletionDashboard />

          {/* Learning Priorities Section */}
          <View style={styles.section}>
            {loadingResults ? (
              <>
                <Text style={styles.sectionTitle}>
                  {userMode === 'parent' ? 'Student Learning Priorities' : 'Your Learning Priorities'}
                </Text>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2196F3" />
                  <Text style={styles.loadingText}>Loading results...</Text>
                </View>
              </>
            ) : !assessmentResults ? (
              <>
                <Text style={styles.sectionTitle}>
                  {userMode === 'parent' ? 'Student Learning Priorities' : 'Your Learning Priorities'}
                </Text>
                <Text style={styles.noResultsText}>
                  {userMode === 'parent'
                    ? 'Student needs to take the assessment to see personalized learning priorities!'
                    : 'Take the assessment to see your personalized learning priorities!'
                  }
                </Text>
              </>
            ) : (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.sectionTitle}>
                    {userMode === 'parent' ? 'Student Learning Priorities' : 'Your Learning Priorities'}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewFullResultsButton}
                    onPress={() => {
                      if (isInFamilyMode && currentFamilyCode) {
                        router.push(`/family/${currentFamilyCode}/results`);
                      } else {
                        router.push('/assessment');
                      }
                    }}
                  >
                    <Text style={styles.viewFullResultsButtonText}>View Results</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.resultsSubtitle}>
                  {userMode === 'parent'
                    ? 'Based on your student\'s assessment, here are their top learning priorities:'
                    : 'Based on your assessment, here are your top learning priorities:'
                  }
                </Text>

                {Object.entries(assessmentResults.moduleScores || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([moduleId, score], index) => {
                    const maxScore = Math.max(...Object.values(assessmentResults.moduleScores || {}));
                    const percentage = Math.round((score / maxScore) * 100);
                    return (
                      <View key={moduleId} style={styles.priorityItem}>
                        <View style={styles.priorityHeader}>
                          <Text style={styles.priorityRank}>#{index + 1}</Text>
                          <Text style={styles.priorityName}>{getModuleDisplayName(moduleId)}</Text>
                          <Text style={styles.priorityScore}>{score} pts</Text>
                        </View>
                        <View style={styles.priorityProgressBar}>
                          <View style={[styles.priorityProgressFill, { width: `${percentage}%` }]} />
                        </View>
                      </View>
                    );
                  })}

                {userMode === 'student' && (
                  <TouchableOpacity
                    style={styles.retakeAssessmentButton}
                    onPress={() => router.push('/assessment')}
                  >
                    <Text style={styles.retakeAssessmentButtonText}>Retake Assessment</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                // Share family code
                Alert.alert(
                  'Share Family Code',
                  `Share this code with family members:\n\n${currentFamilyCode}\n\nOr share this link:\n${window.location.origin}/family/${currentFamilyCode}`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.quickActionText}>Share Family Code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickAction, styles.logoutAction]}
              onPress={handleLogout}
            >
              <Text style={[styles.quickActionText, styles.logoutActionText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Section - Only visible to admin families */}
          {isAdminFamily && (
            <View style={[styles.section, styles.adminSection]}>
              <Text style={[styles.sectionTitle, styles.adminTitle]}>
                Admin Controls
              </Text>
              <Text style={styles.sectionSubtitle}>
                Administrative functions for managing the platform
              </Text>
              
              <TouchableOpacity
                style={[styles.familyButton, styles.adminButton]}
                onPress={() => router.push('/create-family')}
              >
                <Text style={[styles.familyButtonText, styles.adminButtonText]}>
                  Create New Family (Admin)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.familyButton, styles.adminButton]}
                onPress={() => router.push('/admin/thumbnails')}
              >
                <Text style={[styles.familyButtonText, styles.adminButtonText]}>
                  Manage Video Thumbnails
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Family Access Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Access</Text>
            <Text style={styles.sectionSubtitle}>
              Invite others to join your family or switch between families
            </Text>
            
            <View style={styles.familyButtons}>
              <TouchableOpacity 
                style={[styles.familyButton, styles.familyButtonSecondary]}
                onPress={() => router.push('/join-family')}
              >
                <Text style={[styles.familyButtonText, styles.familyButtonTextSecondary]}>
                  Join Different Family
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Family Sign-In Section - Show when not in family mode */
        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>Join Your Family</Text>
          <Text style={styles.signInSubtitle}>
            Enter your family code to access your dashboard and track progress
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Family Code</Text>
            <TextInput
              style={styles.input}
              value={familyCode}
              onChangeText={(text) => setFamilyCode(formatFamilyCode(text))}
              placeholder="BEAR-2024"
              autoCapitalize="characters"
              maxLength={9} // XXXX-XXXX format
            />

            <Text style={styles.hint}>
              Format: ANIMAL-NUMBERS (e.g., BEAR-2024)
            </Text>

            <TouchableOpacity
              style={[styles.joinButton, loading && styles.buttonDisabled]}
              onPress={handleJoinFamily}
              disabled={loading}
            >
              <Text style={styles.joinButtonText}>
                {loading ? 'Joining...' : 'Join Family'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Example Family Codes:</Text>
            <Text style={styles.exampleCode}>LION-3847</Text>
            <Text style={styles.exampleCode}>WOLF-1592</Text>
            <Text style={styles.exampleCode}>BEAR-7429</Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-family')}
          >
            <Text style={styles.createButtonText}>
              Don't have a family code? Create new family
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tutorial launcher for families */}
      {isInFamilyMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Tutorial</Text>
          <Text style={styles.sectionSubtitle}>
            New to the app? Take a guided tour to learn how parents and students can use the platform together effectively.
          </Text>
          
          <TouchableOpacity 
            style={[styles.familyButton, styles.tutorialButton]}
            onPress={() => tutorial.showTutorial()}
          >
            <Text style={[styles.familyButtonText, styles.tutorialButtonText]}>
              Start Guided Tour
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brainLogo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFC107',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    textAlign: 'center',
  },
  // Family Dashboard Styles
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  parentName: {
    fontSize: 18,
    color: '#007AFF',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  progressButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  quickAction: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 16,
    color: '#333',
  },
  logoutAction: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ffcccc',
    borderWidth: 1,
  },
  logoutActionText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  // Family Access styles
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  familyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  familyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  familyButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  familyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  familyButtonTextSecondary: {
    color: '#007AFF',
  },
  // Admin-specific styles
  adminSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    backgroundColor: '#FFF8F5',
  },
  adminTitle: {
    color: '#FF6B35',
  },
  adminButton: {
    backgroundColor: '#FF6B35',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  adminBadge: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  // Family Sign-In Styles
  signInContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  signInSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 8,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  examples: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  exampleCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 5,
  },
  createButton: {
    alignItems: 'center',
    padding: 10,
  },
  createButtonText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  // Tutorial button styles
  tutorialButton: {
    backgroundColor: '#17A2B8',
    marginTop: 0,
  },
  tutorialButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Learning Priorities styles
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  viewFullResultsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewFullResultsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
    marginRight: 8,
    minWidth: 24,
  },
  priorityName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  priorityScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  priorityProgressBar: {
    height: 4,
    backgroundColor: '#ECF0F1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  priorityProgressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 2,
  },
  retakeAssessmentButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    alignItems: 'center',
    marginTop: 8,
  },
  retakeAssessmentButtonText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontWeight: '500',
  },
});
