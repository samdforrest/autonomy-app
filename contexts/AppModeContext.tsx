import { FamilyData } from '@/services/family-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer, useRef } from 'react';

// Types
export type UserMode = 'parent' | 'student';

export interface FamilyContext {
  familyCode: string | null;
  familyData: FamilyData | null;
  currentStudentId: string | null;
  isActive: boolean;
  isAdmin: boolean; // NEW: Admin status
}

export interface ModuleProgress {
  completedDays: number;
  totalDays: number;
  lastAccessed: Date;
  assessmentScores?: number[];
}

export interface ParentInsights {
  recommendedModules: string[];
  strugglingAreas: string[];
  strengths: string[];
}

export interface AppModeState {
  userMode: UserMode;
  studentProgress: {
    [moduleId: string]: ModuleProgress;
  };
  parentInsights: ParentInsights;
  familyContext: FamilyContext;
}

// Actions
type AppModeAction = 
  | { type: 'SWITCH_MODE'; payload: UserMode }
  | { type: 'UPDATE_STUDENT_PROGRESS'; payload: { moduleId: string; progress: Partial<ModuleProgress> } }
  | { type: 'GENERATE_INSIGHTS' }
  | { type: 'RESET_STATE' }
  | { type: 'SET_FAMILY_CONTEXT'; payload: { familyCode: string; familyData: FamilyData; studentId?: string } }
  | { type: 'SET_CURRENT_STUDENT'; payload: string }
  | { type: 'CLEAR_FAMILY_CONTEXT' }
  | { type: 'LOAD_PERSISTED_FAMILY'; payload: FamilyContext };

// Initial state
const initialState: AppModeState = {
  userMode: 'parent', // Default to parent mode as requested
  studentProgress: {
    // Sample data for demo purposes
    'mistakes': {
      completedDays: 2,
      totalDays: 5,
      lastAccessed: new Date(),
      assessmentScores: [85, 92]
    },
    'regulation': {
      completedDays: 1,
      totalDays: 5,
      lastAccessed: new Date(Date.now() - 86400000), // Yesterday
      assessmentScores: [78]
    },
    'job': {
      completedDays: 3,
      totalDays: 5,
      lastAccessed: new Date(Date.now() - 172800000), // 2 days ago
      assessmentScores: [88, 91, 87]
    },
    'collaboration': {
      completedDays: 1,
      totalDays: 5,
      lastAccessed: new Date(Date.now() - 259200000), // 3 days ago
      assessmentScores: [82]
    },
    'selfcoach': {
      completedDays: 0,
      totalDays: 5,
      lastAccessed: new Date(Date.now() - 604800000), // 1 week ago
    }
  },
  parentInsights: {
    recommendedModules: ['selfcoach', 'regulation', 'mistakes'],
    strugglingAreas: ['Self-regulation', 'Emotional control'],
    strengths: ['Job skills', 'Learning from mistakes']
  },
  familyContext: {
    familyCode: null,
    familyData: null,
    currentStudentId: null,
    isActive: false,
    isAdmin: false
  }
};

// Reducer
function appModeReducer(state: AppModeState, action: AppModeAction): AppModeState {
  switch (action.type) {
    case 'SWITCH_MODE':
      return {
        ...state,
        userMode: action.payload
      };
    
    case 'UPDATE_STUDENT_PROGRESS':
      const { moduleId, progress } = action.payload;
      return {
        ...state,
        studentProgress: {
          ...state.studentProgress,
          [moduleId]: {
            ...state.studentProgress[moduleId],
            ...progress,
            lastAccessed: new Date()
          }
        }
      };
    
    case 'GENERATE_INSIGHTS':
      // Simple assessment algorithm for MVP
      const modules = Object.entries(state.studentProgress);
      const completionRates = modules.map(([id, progress]) => ({
        id,
        rate: progress.completedDays / progress.totalDays,
        avgScore: (progress.assessmentScores?.reduce((a, b) => a + b, 0) || 0) / (progress.assessmentScores?.length || 1)
      }));
      
      // Sort by completion rate (ascending) to prioritize incomplete modules
      const recommendedModules = completionRates
        .sort((a, b) => a.rate - b.rate)
        .map(m => m.id);
      
      // Identify struggling areas (low scores or low completion)
      const strugglingAreas = completionRates
        .filter(m => m.rate < 0.6 || m.avgScore < 80)
        .map(m => getModuleName(m.id));
      
      // Identify strengths (high scores and completion)
      const strengths = completionRates
        .filter(m => m.rate > 0.6 && m.avgScore > 85)
        .map(m => getModuleName(m.id));
      
      return {
        ...state,
        parentInsights: {
          recommendedModules,
          strugglingAreas,
          strengths
        }
      };
    
    case 'SET_FAMILY_CONTEXT':
      const { familyCode, familyData, studentId } = action.payload;
      const newFamilyContext = {
        familyCode,
        familyData,
        currentStudentId: studentId || null,
        isActive: true,
        isAdmin: familyData?.settings?.isAdmin === true
      };

      // Storage is handled via useEffect, not in reducer
      return {
        ...state,
        familyContext: newFamilyContext
      };
    
    case 'SET_CURRENT_STUDENT':
      const updatedContext = {
        ...state.familyContext,
        currentStudentId: action.payload
      };

      // Storage is handled via useEffect, not in reducer
      return {
        ...state,
        familyContext: updatedContext
      };
    
    case 'CLEAR_FAMILY_CONTEXT':
      // Storage is handled via useEffect, not in reducer
      return {
        ...state,
        familyContext: {
          familyCode: null,
          familyData: null,
          currentStudentId: null,
          isActive: false,
          isAdmin: false
        }
      };
    
    case 'LOAD_PERSISTED_FAMILY':
      return {
        ...state,
        familyContext: action.payload
      };
    
    case 'RESET_STATE':
      // Storage is handled via useEffect, not in reducer
      return initialState;
    
    default:
      return state;
  }
}

// Helper function to get module display names
function getModuleName(moduleId: string): string {
  const moduleNames: { [key: string]: string } = {
    'mistakes': 'Learning from Mistakes',
    'regulation': 'Self-Regulation',
    'job': 'Job Skills',
    'collaboration': 'Collaboration & Teamwork',
    'selfcoach': 'Self-Coaching'
  };
  return moduleNames[moduleId] || moduleId;
}

// Context
const AppModeContext = createContext<{
  state: AppModeState;
  dispatch: React.Dispatch<AppModeAction>;
} | undefined>(undefined);

// Provider component
interface AppModeProviderProps {
  children: ReactNode;
}

// Constants
const FAMILY_STORAGE_KEY = 'autonomy_current_family';
const FAMILY_EXPIRY_DAYS = 7; // Family context expires after 7 days

export function AppModeProvider({ children }: AppModeProviderProps) {
  const [state, dispatch] = useReducer(appModeReducer, initialState);
  const isInitialMount = useRef(true);
  const previousFamilyContext = useRef(state.familyContext);

  // Load persisted family context on mount
  useEffect(() => {
    const loadPersistedFamily = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAMILY_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          const { timestamp, ...familyContext } = parsedData;

          // Check if not expired
          const isExpired = Date.now() - timestamp > FAMILY_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

          if (!isExpired && familyContext.familyCode && familyContext.familyData) {
            console.log('✅ Loaded persisted family context:', familyContext.familyCode);
            dispatch({ type: 'LOAD_PERSISTED_FAMILY', payload: familyContext });
          } else {
            // Expired or invalid, clear storage
            console.log('🗑️ Clearing expired family context');
            await AsyncStorage.removeItem(FAMILY_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load persisted family context:', error);
        // Clear corrupted data
        try {
          await AsyncStorage.removeItem(FAMILY_STORAGE_KEY);
        } catch (clearError) {
          console.error('❌ Failed to clear corrupted data:', clearError);
        }
      }
    };
    loadPersistedFamily();
  }, []);

  // Persist family context changes to AsyncStorage
  useEffect(() => {
    // Skip on initial mount (we just loaded from storage)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousFamilyContext.current = state.familyContext;
      return;
    }

    const persistFamilyContext = async () => {
      try {
        if (state.familyContext.isActive && state.familyContext.familyCode) {
          // Save active family context
          await AsyncStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify({
            ...state.familyContext,
            timestamp: Date.now()
          }));
          console.log('💾 Persisted family context:', state.familyContext.familyCode);
        } else if (previousFamilyContext.current.isActive && !state.familyContext.isActive) {
          // Family context was cleared
          await AsyncStorage.removeItem(FAMILY_STORAGE_KEY);
          console.log('🗑️ Cleared family context from storage');
        }
        previousFamilyContext.current = state.familyContext;
      } catch (error) {
        console.error('❌ Failed to persist family context:', error);
      }
    };
    persistFamilyContext();
  }, [state.familyContext]);

  return (
    <AppModeContext.Provider value={{ state, dispatch }}>
      {children}
    </AppModeContext.Provider>
  );
}

// Custom hook
export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }

  const { state, dispatch } = context;

  // Action creators
  const switchMode = (mode: UserMode) => {
    dispatch({ type: 'SWITCH_MODE', payload: mode });
  };

  const updateStudentProgress = (moduleId: string, progress: Partial<ModuleProgress>) => {
    dispatch({ type: 'UPDATE_STUDENT_PROGRESS', payload: { moduleId, progress } });
  };

  const generateInsights = () => {
    dispatch({ type: 'GENERATE_INSIGHTS' });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // Family context actions
  const setFamilyContext = (familyCode: string, familyData: FamilyData, studentId?: string) => {
    console.log('🏠 Setting family context:', familyCode, studentId ? `student: ${studentId}` : 'no student selected');
    dispatch({ type: 'SET_FAMILY_CONTEXT', payload: { familyCode, familyData, studentId } });
  };

  const setCurrentStudent = (studentId: string) => {
    console.log('👶 Setting current student:', studentId);
    dispatch({ type: 'SET_CURRENT_STUDENT', payload: studentId });
  };

  const clearFamilyContext = () => {
    console.log('🚪 Clearing family context');
    dispatch({ type: 'CLEAR_FAMILY_CONTEXT' });
  };

  return {
    // State
    userMode: state.userMode,
    studentProgress: state.studentProgress,
    parentInsights: state.parentInsights,
    
    // Family Context State
    familyContext: state.familyContext,
    isInFamilyMode: state.familyContext.isActive,
    currentFamily: state.familyContext.familyData,
    currentFamilyCode: state.familyContext.familyCode,
    currentStudentId: state.familyContext.currentStudentId,
    isAdminFamily: state.familyContext.isAdmin,
    
    // Actions
    switchMode,
    updateStudentProgress,
    generateInsights,
    resetState,
    
    // Family Context Actions
    setFamilyContext,
    setCurrentStudent,
    clearFamilyContext
  };
}
