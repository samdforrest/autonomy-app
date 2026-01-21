import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface TutorialContextType {
  // Tutorial state
  isTutorialVisible: boolean;
  hasCompletedTutorial: boolean;
  
  // Tutorial actions
  showTutorial: () => void;
  hideTutorial: () => void;
  completeTutorial: () => void;
  
  // Family-specific tutorial tracking
  checkFamilyTutorialStatus: (familyCode: string) => Promise<boolean>;
  markFamilyTutorialComplete: (familyCode: string) => Promise<void>;
  
  // Reset for testing/debugging
  resetTutorialStatus: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Storage keys
const TUTORIAL_STORAGE_PREFIX = '@autonomy_tutorial';
const GLOBAL_TUTORIAL_KEY = `${TUTORIAL_STORAGE_PREFIX}_global_completed`;
const FAMILY_TUTORIAL_PREFIX = `${TUTORIAL_STORAGE_PREFIX}_family`;

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  // Load tutorial completion status on app start
  useEffect(() => {
    loadTutorialStatus();
  }, []);

  const loadTutorialStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(GLOBAL_TUTORIAL_KEY);
      setHasCompletedTutorial(completed === 'true');
      console.log('📚 Tutorial status loaded:', { completed: completed === 'true' });
    } catch (error) {
      console.error('❌ Failed to load tutorial status:', error);
    }
  };

  const showTutorial = () => {
    // Prevent multiple tutorial instances
    if (isTutorialVisible) {
      console.log('📚 Tutorial already visible, ignoring show request');
      return;
    }
    console.log('📚 Showing tutorial');
    setIsTutorialVisible(true);
  };

  const hideTutorial = () => {
    console.log('📚 Hiding tutorial');
    setIsTutorialVisible(false);
  };

  const completeTutorial = async () => {
    try {
      console.log('📚 Completing tutorial');
      setIsTutorialVisible(false);
      setHasCompletedTutorial(true);
      
      // Save to local storage
      await AsyncStorage.setItem(GLOBAL_TUTORIAL_KEY, 'true');
      console.log('✅ Tutorial completion saved');
    } catch (error) {
      console.error('❌ Failed to save tutorial completion:', error);
    }
  };

  const checkFamilyTutorialStatus = async (familyCode: string): Promise<boolean> => {
    try {
      const key = `${FAMILY_TUTORIAL_PREFIX}_${familyCode}`;
      const completed = await AsyncStorage.getItem(key);
      const hasCompleted = completed === 'true';
      console.log('📚 Family tutorial status checked:', { familyCode, hasCompleted });
      return hasCompleted;
    } catch (error) {
      console.error('❌ Failed to check family tutorial status:', error);
      return false;
    }
  };

  const markFamilyTutorialComplete = async (familyCode: string): Promise<void> => {
    try {
      const key = `${FAMILY_TUTORIAL_PREFIX}_${familyCode}`;
      await AsyncStorage.setItem(key, 'true');
      console.log('✅ Family tutorial completion saved:', { familyCode });
    } catch (error) {
      console.error('❌ Failed to save family tutorial completion:', error);
    }
  };

  const resetTutorialStatus = async (): Promise<void> => {
    try {
      console.log('🧹 Resetting tutorial status');
      
      // Get all tutorial-related keys
      const allKeys = await AsyncStorage.getAllKeys();
      const tutorialKeys = allKeys.filter(key => key.startsWith(TUTORIAL_STORAGE_PREFIX));
      
      // Remove all tutorial-related storage
      await AsyncStorage.multiRemove(tutorialKeys);
      
      // Reset local state
      setHasCompletedTutorial(false);
      setIsTutorialVisible(false);
      
      console.log('✅ Tutorial status reset complete');
    } catch (error) {
      console.error('❌ Failed to reset tutorial status:', error);
    }
  };

  const contextValue: TutorialContextType = {
    isTutorialVisible,
    hasCompletedTutorial,
    showTutorial,
    hideTutorial,
    completeTutorial,
    checkFamilyTutorialStatus,
    markFamilyTutorialComplete,
    resetTutorialStatus,
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialContextType {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

// Simplified hook for family tutorial management
export function useFamilyTutorial(familyCode: string | null) {
  const tutorial = useTutorial();

  const completeFamilyTutorial = async () => {
    if (familyCode) {
      await tutorial.markFamilyTutorialComplete(familyCode);
    }
    await tutorial.completeTutorial();
  };

  return {
    completeFamilyTutorial,
    ...tutorial,
  };
}
