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
    selfcoach: 0
  };

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
  private getModulePriority(score: number): 'high' | 'medium' | 'low' | 'minimal' {
    if (score >= 15) return 'high';
    if (score >= 10) return 'medium'; 
    if (score >= 5) return 'low';
    return 'minimal';
  }

  /**
   * Calculate percentage for visualization
   */
  private calculatePercentage(score: number): number {
    const maxScore = Math.max(...Object.values(this.moduleScores));
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * Get module display names
   */
  private getModuleDisplayName(moduleId: string): string {
    const names: { [key: string]: string } = {
      mistakes: 'Learning from Mistakes',
      regulation: 'Regulation & Control', 
      job: 'Job Skills',
      collaboration: 'Collaboration & Teamwork',
      selfcoach: 'Self-Coaching'
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
   * Save assessment results to local storage
   */
  saveAssessmentResults(summary: AssessmentSummary): void {
    try {
      const assessmentData = {
        ...summary,
        version: '1.0'
      };
      localStorage.setItem('autonomy_assessment_results', JSON.stringify(assessmentData));
      console.log('✅ Assessment results saved to local storage');
    } catch (error) {
      console.error('❌ Failed to save assessment results:', error);
    }
  }

  /**
   * Load assessment results from local storage
   */
  loadAssessmentResults(): AssessmentSummary | null {
    try {
      const stored = localStorage.getItem('autonomy_assessment_results');
      if (stored) {
        const results = JSON.parse(stored);
        console.log('✅ Assessment results loaded from local storage');
        return results;
      }
    } catch (error) {
      console.error('❌ Failed to load assessment results:', error);
    }
    return null;
  }

  /**
   * Check if user has completed assessment
   */
  hasCompletedAssessment(): boolean {
    return this.loadAssessmentResults() !== null;
  }

  /**
   * Clear assessment results
   */
  clearAssessmentResults(): void {
    try {
      localStorage.removeItem('autonomy_assessment_results');
      console.log('✅ Assessment results cleared');
    } catch (error) {
      console.error('❌ Failed to clear assessment results:', error);
    }
  }
}

export const assessmentService = new AssessmentService();
