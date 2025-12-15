/**
 * Assessment Service
 * Handles assessment data processing and module priority calculation
 */

export interface AssessmentQuestion {
  id: string;
  question: string;
  module: string;
  type: 'multi-select';
  options: AssessmentOption[];
}

export interface AssessmentOption {
  id: string;
  text: string;
  score: number;
}

export interface AssessmentResponse {
  questionId: string;
  selectedOptionIds: string[];
}

export interface ModulePriority {
  moduleId: string;
  score: number;
  priority: 'high' | 'medium' | 'low' | 'minimal';
  percentage: number;
  displayName: string;
}

export interface AssessmentSummary {
  recommendedStartModule: string;
  recommendedOrder: string[];
  moduleScores: { [key: string]: number };
  summary: string;
  completedAt: string;
}

export class AssessmentService {
  private moduleScores: { [key: string]: number } = {
    mistakes: 0,
    regulation: 0,
    job: 0,
    collaboration: 0,
    selfcoach: 0,
    curiosity: 0,
    shapeoflearning: 0,
    neuroplasticity: 0,
    masterymoments: 0,
    selfmonitoring: 0
  };

  // Family and student context
  private currentFamilyCode: string | null = null;
  private currentStudentId: string | null = null;

  /**
   * Set the current family and student context
   */
  setContext(familyCode: string, studentId: string): void {
    this.currentFamilyCode = familyCode;
    this.currentStudentId = studentId;
    console.log('🎯 Assessment context set:', { familyCode, studentId });
  }

  /**
   * Auto-sync context from global app state
   */
  syncFromGlobalContext(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('autonomy_current_family');
        if (stored) {
          const parsedData = JSON.parse(stored);
          console.log('🔍 Raw stored family data:', parsedData);
          
          if (parsedData.familyCode && parsedData.isActive) {
            this.currentFamilyCode = parsedData.familyCode;
            if (parsedData.currentStudentId) {
              this.currentStudentId = parsedData.currentStudentId;
            }
            console.log('🔄 Assessment context synced from global state:', {
              familyCode: this.currentFamilyCode,
              studentId: this.currentStudentId
            });
          } else {
            console.log('🔍 Family context not active or missing familyCode:', {
              familyCode: parsedData.familyCode,
              isActive: parsedData.isActive
            });
          }
        } else {
          console.log('🔍 No stored family context found');
        }
      } catch (error) {
        console.warn('⚠️ Could not sync assessment context from global state:', error);
      }
    }
  }

  /**
   * Get current student ID (with fallback to global context and localStorage)
   */
  private getCurrentStudentId(): string {
    if (this.currentStudentId) {
      return this.currentStudentId;
    }
    
    // Try to get from global app context if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('autonomy_current_family');
        if (stored) {
          const parsedData = JSON.parse(stored);
          if (parsedData.currentStudentId) {
            return parsedData.currentStudentId;
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not load student ID from storage:', error);
      }
    }
    
    // Fallback to localStorage for backwards compatibility
    return 'default_student';
  }

  /**
   * Get current family code (with fallback to global context)
   */
  getCurrentFamilyCode(): string | null {
    if (this.currentFamilyCode) {
      return this.currentFamilyCode;
    }
    
    // Try to get from global app context if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('autonomy_current_family');
        if (stored) {
          const parsedData = JSON.parse(stored);
          return parsedData.familyCode || null;
        }
      } catch (error) {
        console.warn('⚠️ Could not load family code from storage:', error);
      }
    }
    
    return null;
  }

  /**
   * Get storage key for localStorage (backwards compatibility)
   */
  private getStorageKey(): string {
    return `autonomy_assessment_results_${this.getCurrentStudentId()}`;
  }

  /**
   * Calculate module priorities from assessment responses
   */
  calculateModulePriorities(
    responses: AssessmentResponse[], 
    questions: AssessmentQuestion[]
  ): ModulePriority[] {
    console.log('🧮 Calculating module priorities from', responses.length, 'responses');
    
    // Reset scores
    Object.keys(this.moduleScores).forEach(module => {
      this.moduleScores[module] = 0;
    });
    
    // Process each response
    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) {
        console.warn(`⚠️ Question not found: ${response.questionId}`);
        return;
      }
      
      // Add scores for each selected option to the question's module
      response.selectedOptionIds.forEach(optionId => {
        const option = question.options.find(opt => opt.id === optionId);
        if (option) {
          this.moduleScores[question.module] += option.score;
          console.log(`   📊 Added ${option.score} to ${question.module} (${option.text.substring(0, 30)}...)`);
        }
      });
    });
    
    // Sort modules by total score (highest = highest priority)
    const sortedModules = Object.entries(this.moduleScores)
      .sort(([,a], [,b]) => b - a)  // Descending order
      .map(([moduleId, score]) => ({
        moduleId,
        score,
        priority: this.getModulePriority(score),
        percentage: this.calculatePercentage(score),
        displayName: this.getModuleDisplayName(moduleId)
      }));

    console.log('📊 Final module priorities:', sortedModules);
    return sortedModules;
  }

  /**
   * Get priority level based on score
   */
  getModulePriority(score: number): 'high' | 'medium' | 'low' | 'minimal' {
    if (score >= 15) return 'high';
    if (score >= 10) return 'medium'; 
    if (score >= 5) return 'low';
    return 'minimal';
  }

  /**
   * Calculate percentage for visualization
   */
  calculatePercentage(score: number, moduleScores?: { [key: string]: number }): number {
    const scores = moduleScores || this.moduleScores;
    const maxScore = Math.max(...Object.values(scores));
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * Get module display names
   */
  getModuleDisplayName(moduleId: string): string {
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
  }

  /**
   * Generate assessment summary
   */
  generateAssessmentSummary(sortedModules: ModulePriority[]): AssessmentSummary {
    const topModule = sortedModules[0];
    const recommendedOrder = sortedModules.slice(0, 3).map(m => m.moduleId);
    
    return {
      recommendedStartModule: topModule.moduleId,
      recommendedOrder,
      moduleScores: { ...this.moduleScores },
      summary: `Based on your responses, we recommend starting with ${topModule.displayName} (Score: ${topModule.score}).`,
      completedAt: new Date().toISOString()
    };
  }

  /**
   * Save assessment results (Firebase + localStorage for backwards compatibility)
   */
  async saveAssessmentResults(summary: AssessmentSummary): Promise<void> {
    try {
      // Auto-sync context from global state if not set
      if (!this.currentFamilyCode || !this.currentStudentId) {
        console.log('🔄 Syncing context before saving...');
        this.syncFromGlobalContext();
      }
      
      const currentStudentId = this.getCurrentStudentId();
      const assessmentData = {
        ...summary,
        version: '1.0',
        studentId: currentStudentId,
        familyCode: this.currentFamilyCode
      };

      console.log('💾 Saving assessment results with context:', {
        familyCode: this.currentFamilyCode,
        studentId: currentStudentId,
        storageKey: this.getStorageKey()
      });

      // Save to Firebase if we have family context
      if (this.currentFamilyCode && this.currentStudentId) {
        try {
          console.log('☁️ Attempting to save to Firebase...');
          const { familyService } = await import('./family-service');
          await familyService.saveAssessmentResults(
            this.currentFamilyCode,
            this.currentStudentId,
            assessmentData
          );
          console.log('✅ Assessment results saved to Firebase for:', this.currentStudentId);
        } catch (firebaseError) {
          console.error('❌ Failed to save to Firebase:', firebaseError);
          // Fall back to localStorage
        }
      } else {
        console.log('📝 No family context, saving only to localStorage');
      }

      // Always save to localStorage for backwards compatibility
      localStorage.setItem(this.getStorageKey(), JSON.stringify(assessmentData));
      console.log('✅ Assessment results saved to localStorage for student:', currentStudentId);
    } catch (error) {
      console.error('❌ Failed to save assessment results:', error);
      throw error; // Re-throw to let the caller handle it
    }
  }

  /**
   * Load assessment results (Firebase first, then localStorage fallback)
   */
  async loadAssessmentResults(): Promise<AssessmentSummary | null> {
    try {
      // Auto-sync context from global state if not set
      if (!this.currentFamilyCode || !this.currentStudentId) {
        console.log('🔄 Syncing context before loading...');
        this.syncFromGlobalContext();
      }
      
      const currentStudentId = this.getCurrentStudentId();
      const storageKey = this.getStorageKey();
      
      console.log('📖 Loading assessment results with context:', {
        familyCode: this.currentFamilyCode,
        studentId: currentStudentId,
        storageKey: storageKey
      });
      
      // Try Firebase first if we have family context
      if (this.currentFamilyCode && this.currentStudentId) {
        try {
          console.log('☁️ Attempting to load from Firebase...');
          const { familyService } = await import('./family-service');
          const familyData = await familyService.getFamilyData(this.currentFamilyCode);
          
          if (familyData?.students?.[this.currentStudentId]?.assessments) {
            const assessments = familyData.students[this.currentStudentId].assessments;
            // Get the most recent assessment
            const assessmentKeys = Object.keys(assessments);
            if (assessmentKeys.length > 0) {
              const latestKey = assessmentKeys.sort().pop();
              const latestAssessment = assessments[latestKey!];
              console.log('✅ Assessment results loaded from Firebase for:', this.currentStudentId);
              return latestAssessment;
            }
          } else {
            console.log('📝 No assessments found in Firebase for student:', this.currentStudentId);
          }
        } catch (firebaseError) {
          console.warn('⚠️ Failed to load from Firebase, trying localStorage:', firebaseError);
        }
      } else {
        console.log('📝 No family context, loading only from localStorage');
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const results = JSON.parse(stored);
        console.log('✅ Assessment results loaded from localStorage for student:', currentStudentId);
        return results;
      } else {
        console.log('📝 No assessment results found in localStorage for key:', storageKey);
      }
    } catch (error) {
      console.error('❌ Failed to load assessment results:', error);
    }
    return null;
  }

  /**
   * Check if user has completed assessment (student-specific)
   */
  hasCompletedAssessment(): boolean {
    return this.loadAssessmentResults() !== null;
  }

  /**
   * Clear assessment results (student-specific)
   */
  clearAssessmentResults(): void {
    try {
      localStorage.removeItem(this.getStorageKey());
      console.log('✅ Assessment results cleared for student:', this.getCurrentStudentId());
    } catch (error) {
      console.error('❌ Failed to clear assessment results:', error);
    }
  }

  /**
   * Get assessment results for all students (for parent view)
   */
  getAllStudentsAssessments(): { [studentId: string]: AssessmentSummary } {
    const results: { [childId: string]: AssessmentSummary } = {};
    
    try {
      // Get all localStorage keys that match our pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('autonomy_assessment_results_')) {
          const childId = key.replace('autonomy_assessment_results_', '');
          const stored = localStorage.getItem(key);
          if (stored) {
            results[childId] = JSON.parse(stored);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to load all students assessments:', error);
    }
    
    return results;
  }
}

export const assessmentService = new AssessmentService();
