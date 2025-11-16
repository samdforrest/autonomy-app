import React, { createContext, ReactNode, useContext, useReducer } from 'react';

// Types
export type UserMode = 'parent' | 'child';

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
  childProgress: {
    [moduleId: string]: ModuleProgress;
  };
  parentInsights: ParentInsights;
}

// Actions
type AppModeAction = 
  | { type: 'SWITCH_MODE'; payload: UserMode }
  | { type: 'UPDATE_CHILD_PROGRESS'; payload: { moduleId: string; progress: Partial<ModuleProgress> } }
  | { type: 'GENERATE_INSIGHTS' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppModeState = {
  userMode: 'parent', // Default to parent mode as requested
  childProgress: {
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
    
    case 'UPDATE_CHILD_PROGRESS':
      const { moduleId, progress } = action.payload;
      return {
        ...state,
        childProgress: {
          ...state.childProgress,
          [moduleId]: {
            ...state.childProgress[moduleId],
            ...progress,
            lastAccessed: new Date()
          }
        }
      };
    
    case 'GENERATE_INSIGHTS':
      // Simple assessment algorithm for MVP
      const modules = Object.entries(state.childProgress);
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
    
    case 'RESET_STATE':
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

export function AppModeProvider({ children }: AppModeProviderProps) {
  const [state, dispatch] = useReducer(appModeReducer, initialState);

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

  const updateChildProgress = (moduleId: string, progress: Partial<ModuleProgress>) => {
    dispatch({ type: 'UPDATE_CHILD_PROGRESS', payload: { moduleId, progress } });
  };

  const generateInsights = () => {
    dispatch({ type: 'GENERATE_INSIGHTS' });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return {
    // State
    userMode: state.userMode,
    childProgress: state.childProgress,
    parentInsights: state.parentInsights,
    
    // Actions
    switchMode,
    updateChildProgress,
    generateInsights,
    resetState
  };
}
