import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetArea?: 'header' | 'mode-switcher' | 'family-dashboard' | 'assessment' | 'modules' | 'home-nav' | 'modules-nav' | 'progress-nav';
  perspective: 'both' | 'parent' | 'student';
  action?: 'switch-to-parent' | 'switch-to-student' | 'switch-to-parent-and-navigate-profile' | 'switch-to-student-and-navigate-profile' | 'navigate-to-assessment' | 'navigate-to-explore' | 'navigate-to-profile' | 'navigate-to-home' | 'none';
  isInteractive?: boolean;
  interactionTarget?: 'mode-switcher';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Family Learning Journey!',
    description: 'Hi! We\'re excited you joined our learning platform. This quick tour will show both parents and students how to use the app together.',
    perspective: 'both',
  },
  {
    id: 'mode-switcher-intro',
    title: 'Switch Between Parent & Student View',
    description: 'This toggle moves between parent and student view. It\'s available no matter where you are in the app so you can move back and forth as you need to.\n\nIf it is blue with the parent icon, it is in parent mode. If it is orange with the student icon, it\'s in student mode.\n\nTry it to move to the next screen.',
    perspective: 'both',
    targetArea: 'mode-switcher',
    isInteractive: true,
    interactionTarget: 'mode-switcher',
  },
  {
    id: 'parent-view',
    title: 'Parent View: Your Mission Control',
    description: 'In Parent View, you can see learning progress, assessment results, and help prioritize what to work on next. It\'s like having a learning dashboard! Let\'s check out your family profile.',
    perspective: 'parent',
    action: 'switch-to-parent-and-navigate-profile',
    targetArea: 'family-dashboard',
  },
  {
    id: 'home-resources',
    title: 'Home',
    description: 'Resources have videos and guides for you. You\'ll start here, and you can refer to them whenever you need throughout your experience.',
    perspective: 'both',
    targetArea: 'home-nav',
    action: 'navigate-to-home',
  },
  {
    id: 'modules-nav',
    title: 'Modules',
    description: 'All the lessons live in Modules.',
    perspective: 'both',
    targetArea: 'modules-nav',
    action: 'navigate-to-explore',
  },
  {
    id: 'progress-tracking-nav',
    title: 'Progress Tracking',
    description: 'This will be where you find results of your child\'s personalized assessment. It will also highlight what modules you have completed.',
    perspective: 'both',
    targetArea: 'progress-nav',
    action: 'navigate-to-profile',
  },
];

const NAV_TAB_IDS = ['home-resources', 'modules-nav', 'progress-tracking-nav'] as const;
type NavTabId = typeof NAV_TAB_IDS[number];

const NAV_TABS = [
  { id: 'home-resources' as NavTabId, label: 'Home', icon: require('../assets/images/home-icon.png') },
  { id: 'modules-nav' as NavTabId, label: 'Modules', icon: require('../assets/images/modules-icon.png') },
  { id: 'progress-tracking-nav' as NavTabId, label: 'Progress Tracking', icon: require('../assets/images/progress-tracking-icon.png') },
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

  const executedActions = useRef<Set<string>>(new Set());
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    console.log('📚 Tutorial instance created with ID:', instanceId.current);
    return () => {
      console.log('📚 Tutorial instance destroyed with ID:', instanceId.current);
    };
  }, []);

  useEffect(() => {
    if (visible && initialUserMode === null) {
      setInitialUserMode(currentUserMode);
      setHasInteractedWithModeSwitch(false);
      console.log('📚 Tutorial started with initial mode:', currentUserMode);
    }
  }, [visible, currentUserMode, initialUserMode]);

  useEffect(() => {
    if (visible && initialUserMode !== null && currentUserMode !== initialUserMode) {
      console.log('🔄 Mode switch detected during tutorial:', initialUserMode, '→', currentUserMode);
      setHasInteractedWithModeSwitch(true);
    }
  }, [currentUserMode, initialUserMode, visible]);

  useEffect(() => {
    if (visible) {
      executedActions.current.clear();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    if (!visible) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (!step || !step.action) return;

    const actionKey = `${currentStep}-${step.action}`;
    if (executedActions.current.has(actionKey)) return;

    console.log('📚 Tutorial executing action for step', currentStep, ':', step.action);

    const timer = setTimeout(() => {
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
        setTimeout(() => {
          if (onNavigateToProfile) onNavigateToProfile();
        }, 500);
      } else if (step.action === 'switch-to-student-and-navigate-profile') {
        onModeSwitch('student');
        setTimeout(() => {
          if (onNavigateToProfile) onNavigateToProfile();
        }, 500);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, visible]);

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (step?.isInteractive && step.interactionTarget === 'mode-switcher' && !hasInteractedWithModeSwitch) {
      return;
    }
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const canProceedToNext = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (step?.isInteractive && step.interactionTarget === 'mode-switcher') {
      return hasInteractedWithModeSwitch;
    }
    return true;
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const currentActionKey = `${currentStep}-${TUTORIAL_STEPS[currentStep]?.action}`;
      const nextActionKey = `${currentStep - 1}-${TUTORIAL_STEPS[currentStep - 1]?.action}`;
      executedActions.current.delete(currentActionKey);
      executedActions.current.delete(nextActionKey);

      const prevStep = TUTORIAL_STEPS[currentStep - 1];
      if (prevStep?.isInteractive && prevStep.interactionTarget === 'mode-switcher') {
        setHasInteractedWithModeSwitch(false);
        setInitialUserMode(currentUserMode);
      }

      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
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

  const getPerspectiveBadge = () => {
    const step = currentTutorialStep;
    if (step.perspective === 'both') return null;
    return (
      <View style={[
        styles.perspectiveBadge,
        step.perspective === 'parent' ? styles.parentBadge : styles.studentBadge
      ]}>
        <Text style={styles.perspectiveBadgeText}>
          {step.perspective === 'parent' ? 'Parent Focus' : 'Student Focus'}
        </Text>
      </View>
    );
  };

  const renderNavBarIllustration = (activeStepId: string) => (
    <View style={styles.navBarIllustration}>
      {NAV_TABS.map((tab) => {
        const isActive = tab.id === activeStepId;
        return (
          <View key={tab.id} style={styles.navTabItem}>
            <View style={[styles.navTabIconWrapper, isActive && styles.navTabIconWrapperActive]}>
              <Image
                source={tab.icon}
                style={[styles.navTabIcon, { tintColor: isActive ? '#007AFF' : '#9E9E9E' }]}
              />
            </View>
            <Text style={[styles.navTabLabel, isActive && styles.navTabLabelActive]}>
              {tab.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  if (!visible) return null;

  const isNavStep = NAV_TAB_IDS.includes(currentTutorialStep.id as NavTabId);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>

        {/* Arrow indicator pointing to the mode toggle button (bottom-right) */}
        {currentTutorialStep.id === 'mode-switcher-intro' && (
          <View pointerEvents="none" style={styles.toggleArrowIndicator}>
            <Text style={styles.toggleArrowEmoji}>↘</Text>
            <Text style={styles.toggleArrowLabel}>Toggle button</Text>
          </View>
        )}

        <View style={[styles.tutorialCard, isNavStep && styles.tutorialCardWithNav]}>
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

            <ThemedText style={styles.stepTitle}>
              {currentTutorialStep.title}
            </ThemedText>

            <ThemedText style={styles.stepDescription}>
              {currentTutorialStep.description}
            </ThemedText>

            {/* Mode switcher: button illustrations + interactive toggle */}
            {currentTutorialStep.id === 'mode-switcher-intro' && (
              <View style={styles.modeSwitcherSection}>
                <View style={styles.modeButtonsRow}>
                  <View style={styles.modeButtonExample}>
                    <View style={[styles.modeButtonCircle, { backgroundColor: '#2196F3' }]}>
                      <Image
                        source={require('../assets/images/parent-icon.png')}
                        style={styles.modeButtonIcon}
                      />
                    </View>
                    <Text style={styles.modeButtonLabel}>Parent Mode</Text>
                  </View>
                  <View style={styles.modeButtonExample}>
                    <View style={[styles.modeButtonCircle, { backgroundColor: '#FF9800' }]}>
                      <Image
                        source={require('../assets/images/student-icon.png')}
                        style={styles.modeButtonIcon}
                      />
                    </View>
                    <Text style={styles.modeButtonLabel}>Student Mode</Text>
                  </View>
                </View>

                <View style={styles.embeddedToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.inlineToggleButton,
                      currentUserMode === 'parent' ? styles.inlineToggleParent : styles.inlineToggleStudent,
                    ]}
                    onPress={() => onModeSwitch(currentUserMode === 'parent' ? 'student' : 'parent')}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={
                        currentUserMode === 'parent'
                          ? require('../assets/images/parent-icon.png')
                          : require('../assets/images/student-icon.png')
                      }
                      style={styles.inlineToggleIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                {!hasInteractedWithModeSwitch ? (
                  <View style={styles.waitingMessage}>
                    <Text style={styles.waitingText}>
                      Switch modes to see how the interface changes!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.completedMessage}>
                    <Text style={styles.completedText}>
                      You can switch anytime. Ready to continue?
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Nav bar illustration for home/modules/progress steps */}
            {isNavStep && renderNavBarIllustration(currentTutorialStep.id)}
          </ScrollView>

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
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
  tutorialCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '55%',
    minHeight: 200,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tutorialCardWithNav: {
    maxHeight: '60%',
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
    marginBottom: 16,
  },
  // Mode switcher step
  modeSwitcherSection: {
    marginTop: 4,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  modeButtonExample: {
    alignItems: 'center',
    gap: 8,
  },
  modeButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modeButtonIcon: {
    width: 26,
    height: 26,
    tintColor: 'white',
    resizeMode: 'contain',
  },
  modeButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  embeddedToggleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  inlineToggleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  inlineToggleParent: {
    backgroundColor: '#2196F3',
  },
  inlineToggleStudent: {
    backgroundColor: '#FF9800',
  },
  inlineToggleIcon: {
    width: 32,
    height: 32,
    tintColor: '#fff',
  },
  waitingMessage: {
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
  // Arrow indicator for mode toggle button location
  toggleArrowIndicator: {
    position: 'absolute',
    bottom: 290,
    right: 24,
    alignItems: 'center',
  },
  toggleArrowEmoji: {
    fontSize: 28,
    color: 'white',
  },
  toggleArrowLabel: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Nav bar illustration
  navBarIllustration: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navTabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  navTabIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabIconWrapperActive: {
    backgroundColor: '#E8F0FE',
  },
  navTabIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  navTabLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
    textAlign: 'center',
  },
  navTabLabelActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  // Buttons
  buttonContainer: {
    marginTop: 16,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
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
});
