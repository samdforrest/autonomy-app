import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ModeToggle } from './ModeToggle';
import { ThemedText } from './ThemedText';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetArea?: 'header' | 'mode-switcher' | 'family-dashboard' | 'assessment' | 'modules';
  perspective: 'both' | 'parent' | 'student';
  highlightPosition?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width?: number;
    height?: number;
  };
   action?: 'switch-to-parent' | 'switch-to-student' | 'switch-to-parent-and-navigate-profile' | 'switch-to-student-and-navigate-profile' | 'navigate-to-assessment' | 'navigate-to-explore' | 'navigate-to-profile' | 'navigate-to-home' | 'none';
   isInteractive?: boolean; // Requires user interaction before proceeding
   interactionTarget?: 'mode-switcher'; // What the user needs to interact with
   emoji?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Family Learning Journey! 🏠',
    description: 'Hi! We\'re excited you joined our learning platform. This quick tour will show both parents and students how to use the app together.',
    perspective: 'both',
    emoji: '👋'
  },
  {
    id: 'family-concept',
    title: 'How Families Work In the App 👨‍👩‍👧‍👦',
    description: 'Your family code connects everyone! Parents can track progress while students do fun learning activities. Everyone stays connected but has their own experience.',
    perspective: 'both',
    emoji: '🔗'
  },
   {
     id: 'mode-switcher-intro',
     title: 'Try the Mode Switcher! 🔄',
     description: 'See this toggle? It switches between Parent View (for tracking and insights) and Student View (for learning and activities). Go ahead - try switching it! We\'ll wait for you to explore both modes.',
     perspective: 'both',
     targetArea: 'mode-switcher',
     isInteractive: true,
     interactionTarget: 'mode-switcher',
     emoji: '👆'
   },
  {
    id: 'parent-view',
    title: 'Parent View: Your Mission Control 📊',
    description: 'In Parent View, you can see learning progress, assessment results, and help prioritize what to work on next. It\'s like having a learning dashboard! Let\'s check out your family profile.',
    perspective: 'parent',
    action: 'switch-to-parent-and-navigate-profile',
    targetArea: 'family-dashboard',
    emoji: '🎛️'
  },
  // {
  //   id: 'parent-dashboard',
  //   title: 'Family Dashboard & Progress Tracking 📈',
  //   description: 'Here in the Profile section, parents can see detailed family progress, manage settings, and track each module\'s completion. This is your family\'s home base!',
  //   perspective: 'parent',
  //   emoji: '🏠'
  // },
  {
    id: 'assessment-purpose',
    title: 'The Learning Assessment 🎯',
    description: 'Students take a quick assessment that creates a personalized learning path. It figures out which skills to focus on first - pretty cool, right? Here\'s what it looks like!',
    perspective: 'both',
    action: 'navigate-to-assessment',
    emoji: '🧠'
  },
  // {
  //   id: 'student-view',
  //   title: 'Student View: Where Learning Happens ✨',
  //   description: 'In Student View, kids find their personalized modules, watch videos, and track their own progress. It\'s designed to be engaging and age-appropriate! Let\'s see the student profile.',
  //   perspective: 'student',
  //   action: 'switch-to-student-and-navigate-profile',
  //   emoji: '📚'
  // },
  {
    id: 'modules-explained',
    title: 'Learning Modules: Your Growth Areas 🌟',
    description: 'Each module focuses on important skills like handling mistakes, self-regulation, and curiosity. Parent view has a guide to each lesson. Student view walks you both through the five activities you complete together!',
    perspective: 'student',
    action: 'navigate-to-explore',
    targetArea: 'modules',
    emoji: '🎓'
  },
  // {
  //   id: 'navigation',
  //   title: 'Getting Around the App 🧭',
  //   description: 'Use the tabs at the bottom to navigate. Home has your dashboard, Explore shows learning modules, and Profile manages your family settings. Back to home we go!',
  //   perspective: 'both',
  //   action: 'navigate-to-home',
  //   targetArea: 'bottom-tabs',
  //   emoji: '🗺️'
  // },
  {
    id: 'working-together',
    title: 'Learning Together Works Best 🤝',
    description: 'The magic happens when families use this together! Parents can support learning while kids stay engaged with age-appropriate content.',
    perspective: 'both',
    emoji: '💪'
  },
  {
    id: 'ready-to-start',
    title: 'You\'re Ready to Begin! 🚀',
    description: 'While your child starts with the learning assessment, you can start by watching the intro videos in the parent and student guide! Parents can always switch views to check progress. Happy learning!',
    perspective: 'both',
    emoji: '🎉'
  }
];

interface FamilyOnboardingTutorialProps {
  visible: boolean;
  onComplete: () => void;
  onClose: () => void;
  currentUserMode: 'parent' | 'student';
  onModeSwitch: (mode: 'parent' | 'student') => void;
  onNavigateToAssessment?: () => void;
  onNavigateToExplore?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToHome?: () => void;
}

export function FamilyOnboardingTutorial({
  visible,
  onComplete,
  onClose,
  currentUserMode,
  onModeSwitch,
  onNavigateToAssessment,
  onNavigateToExplore,
  onNavigateToProfile,
  onNavigateToHome
}: FamilyOnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [hasInteractedWithModeSwitch, setHasInteractedWithModeSwitch] = useState(false);
  const [initialUserMode, setInitialUserMode] = useState<'parent' | 'student' | null>(null);
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  
  // Track which actions have been executed to prevent infinite loops
  const executedActions = useRef<Set<string>>(new Set());
  
  // Add unique instance ID to prevent duplicate tutorials
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  // Log when this component is created
  useEffect(() => {
    console.log('📚 Tutorial instance created with ID:', instanceId.current);
    return () => {
      console.log('📚 Tutorial instance destroyed with ID:', instanceId.current);
    };
  }, []);

  // Track initial user mode when tutorial starts
  useEffect(() => {
    if (visible && initialUserMode === null) {
      setInitialUserMode(currentUserMode);
      setHasInteractedWithModeSwitch(false);
      console.log('📚 Tutorial started with initial mode:', currentUserMode);
    }
  }, [visible, currentUserMode, initialUserMode]);

  // Track mode switches during tutorial
  useEffect(() => {
    if (visible && initialUserMode !== null && currentUserMode !== initialUserMode) {
      console.log('🔄 Mode switch detected during tutorial:', initialUserMode, '→', currentUserMode);
      console.log('✅ Interactive step completed! User can now proceed.');
      setHasInteractedWithModeSwitch(true);
    }
  }, [currentUserMode, initialUserMode, visible]);

  useEffect(() => {
    if (visible) {
      // Clear executed actions for fresh tutorial start
      executedActions.current.clear();
      // Reset animation to 0 first, then fade in
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // When hiding, fade out quickly
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  // Handle navigation when step changes
  useEffect(() => {
    if (!visible) return;
    
    const step = TUTORIAL_STEPS[currentStep];
    if (!step || !step.action) return;

    // Create unique key for this step's action to prevent duplicate executions
    const actionKey = `${currentStep}-${step.action}`;
    
    // If we've already executed this action, don't do it again
    if (executedActions.current.has(actionKey)) {
      return;
    }

    console.log('📚 Tutorial executing action for step', currentStep, ':', step.action);

    // Small delay to let the step content render first
    const timer = setTimeout(() => {
      // Mark this action as executed
      executedActions.current.add(actionKey);

      if (step.action === 'navigate-to-assessment' && onNavigateToAssessment) {
        onNavigateToAssessment();
      } else if (step.action === 'navigate-to-explore' && onNavigateToExplore) {
        onNavigateToExplore();
      } else if (step.action === 'navigate-to-profile' && onNavigateToProfile) {
        onNavigateToProfile();
      } else if (step.action === 'navigate-to-home' && onNavigateToHome) {
        onNavigateToHome();
      } else if (step.action === 'switch-to-parent-and-navigate-profile') {
        onModeSwitch('parent');
        // Navigate to profile after mode switch
        setTimeout(() => {
          if (onNavigateToProfile) onNavigateToProfile();
        }, 500);
      } else if (step.action === 'switch-to-student-and-navigate-profile') {
        onModeSwitch('student');
        // Navigate to profile after mode switch
        setTimeout(() => {
          if (onNavigateToProfile) onNavigateToProfile();
        }, 500);
      }
    }, 300); // Small delay to let content appear first

    return () => clearTimeout(timer);
  }, [currentStep, visible]);

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    // Check if this is an interactive step that requires completion
    const step = TUTORIAL_STEPS[currentStep];
    if (step?.isInteractive && step.interactionTarget === 'mode-switcher' && !hasInteractedWithModeSwitch) {
      // Don't proceed if interaction is required but not completed
      console.log('📚 Interactive step not completed yet, cannot proceed');
      return;
    }

    // Navigation and mode switching now happen automatically when step shows
    // This just advances to the next step
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // Check if the next button should be enabled
  const canProceedToNext = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (step?.isInteractive && step.interactionTarget === 'mode-switcher') {
      return hasInteractedWithModeSwitch;
    }
    return true; // Non-interactive steps can always proceed
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Clear executed actions for the current step to allow re-execution when going forward again
      const currentActionKey = `${currentStep}-${TUTORIAL_STEPS[currentStep]?.action}`;
      const nextActionKey = `${currentStep - 1}-${TUTORIAL_STEPS[currentStep - 1]?.action}`;
      executedActions.current.delete(currentActionKey);
      executedActions.current.delete(nextActionKey);
      
      // Reset interaction state when going back to interactive step
      const prevStep = TUTORIAL_STEPS[currentStep - 1];
      if (prevStep?.isInteractive && prevStep.interactionTarget === 'mode-switcher') {
        setHasInteractedWithModeSwitch(false);
        setInitialUserMode(currentUserMode);
      }
      
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Clear executed actions and interaction state for fresh restart
    executedActions.current.clear();
    setHasInteractedWithModeSwitch(false);
    setInitialUserMode(null);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  const handleSkip = () => {
    // Clear executed actions and interaction state for fresh restart
    executedActions.current.clear();
    setHasInteractedWithModeSwitch(false);
    setInitialUserMode(null);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getHighlightOverlay = () => {
    if (!currentTutorialStep.targetArea || !currentTutorialStep.highlightPosition) {
      return null;
    }

    return (
      <View style={[styles.highlight, currentTutorialStep.highlightPosition]} />
    );
  };

  const getPerspectiveBadge = () => {
    const step = currentTutorialStep;
    if (step.perspective === 'both') return null;

    return (
      <View style={[
        styles.perspectiveBadge,
        step.perspective === 'parent' ? styles.parentBadge : styles.studentBadge
      ]}>
        <Text style={styles.perspectiveBadgeText}>
          {step.perspective === 'parent' ? '👨‍👩‍👧‍👦 Parent Focus' : '🧒 Student Focus'}
        </Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {getHighlightOverlay()}
        
        <View style={styles.tutorialCard}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {TUTORIAL_STEPS.length}
            </Text>
          </View>

          {/* Step content */}
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {getPerspectiveBadge()}
            
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{currentTutorialStep.emoji}</Text>
            </View>
            
            <ThemedText style={styles.stepTitle}>
              {currentTutorialStep.title}
            </ThemedText>
            
             <ThemedText style={styles.stepDescription}>
               {currentTutorialStep.description}
             </ThemedText>

             {/* Interactive mode switcher for step 3 */}
             {currentTutorialStep.isInteractive && currentTutorialStep.interactionTarget === 'mode-switcher' && (
               <View style={styles.interactiveSection}>
                 <ThemedText style={styles.interactionPrompt}>
                   👇 Try the toggle below - switch between Parent and Student views:
                 </ThemedText>
                 
                 <View style={styles.embeddedToggleContainer}>
                   <ModeToggle compact={true} />
                 </View>

                 {!hasInteractedWithModeSwitch ? (
                   <View style={styles.waitingMessage}>
                     <Text style={styles.waitingText}>
                       💡 Switch modes to see how the interface changes for parents vs students!
                     </Text>
                   </View>
                 ) : (
                   <View style={styles.completedMessage}>
                     <Text style={styles.completedText}>
                       ✅ Perfect! You've tried both modes. Notice how each view is designed for different users. Ready to continue?
                     </Text>
                   </View>
                 )}
               </View>
             )}

             {/* Show current mode indicator when relevant */}
            {(currentTutorialStep.perspective !== 'both' || currentTutorialStep.action) && (
              <View style={styles.modeIndicator}>
                <Text style={styles.currentModeText}>
                  Currently in: {currentUserMode === 'parent' ? '👨‍👩‍👧‍👦 Parent' : '🧒 Student'} View
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.skipButton]} 
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip Tour</Text>
            </TouchableOpacity>

            <View style={styles.navButtons}>
              {currentStep > 0 && (
                <TouchableOpacity 
                  style={[styles.button, styles.previousButton]} 
                  onPress={handlePrevious}
                >
                  <Text style={styles.previousButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

               <TouchableOpacity 
                 style={[
                   styles.button, 
                   styles.nextButton,
                   !canProceedToNext() && styles.nextButtonDisabled
                 ]} 
                 onPress={handleNext}
                 disabled={!canProceedToNext()}
               >
                 <Text style={[
                   styles.nextButtonText,
                   !canProceedToNext() && styles.nextButtonTextDisabled
                 ]}>
                   {!canProceedToNext() 
                     ? 'Try the toggle first!' 
                     : currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started!' : 'Next'
                   }
                 </Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  highlight: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFD700',
    backgroundColor: 'transparent',
  },
  tutorialCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    minHeight: 200,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  perspectiveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  parentBadge: {
    backgroundColor: '#E3F2FD',
  },
  studentBadge: {
    backgroundColor: '#FFF3E0',
  },
  perspectiveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  modeIndicator: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  currentModeText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  skipButton: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'underline',
  },
  previousButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  previousButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 12,
  },
   nextButtonText: {
     fontSize: 16,
     color: 'white',
     fontWeight: 'bold',
   },
   nextButtonDisabled: {
     backgroundColor: '#BDC3C7',
     opacity: 0.6,
   },
   nextButtonTextDisabled: {
     color: '#7F8C8D',
   },
   interactiveSection: {
     backgroundColor: '#F8F9FA',
     borderRadius: 12,
     padding: 16,
     marginVertical: 16,
     borderLeftWidth: 4,
     borderLeftColor: '#007AFF',
   },
   interactionPrompt: {
     fontSize: 16,
     fontWeight: '600',
     color: '#007AFF',
     textAlign: 'center',
     marginBottom: 16,
   },
   embeddedToggleContainer: {
     alignItems: 'center',
     marginVertical: 8,
   },
   waitingMessage: {
     marginTop: 12,
     padding: 12,
     backgroundColor: '#FFF3CD',
     borderRadius: 8,
     borderLeftWidth: 4,
     borderLeftColor: '#FFC107',
   },
   waitingText: {
     fontSize: 14,
     color: '#856404',
     textAlign: 'center',
     fontWeight: '500',
   },
   completedMessage: {
     marginTop: 12,
     padding: 12,
     backgroundColor: '#D1ECF1',
     borderRadius: 8,
     borderLeftWidth: 4,
     borderLeftColor: '#17A2B8',
   },
   completedText: {
     fontSize: 14,
     color: '#0C5460',
     textAlign: 'center',
     fontWeight: '600',
   },
 });
