// Simple in-memory storage for development/testing
// Replace with AsyncStorage or SecureStore for production

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'open-ended';
  options?: Array<{
    label: string;
    text: string;
  }>;
}

export interface SurveyResponse {
  questionId: string;
  questionText: string;
  answer: string;
  answerLabel?: string; // For multiple choice (A, B, C, etc.)
  timestamp: Date;
}

export interface SurveySubmission {
  id: string;
  familyCode: string | null;
  moduleId: string;
  moduleName: string;
  responses: SurveyResponse[];
  submittedAt: Date;
  completedBy: 'parent' | 'student';
}

class SurveyService {
  private readonly STORAGE_KEY = 'survey_responses';
  private inMemoryStorage: Record<string, string> = {}; // Temporary in-memory storage

  /**
   * Parse survey questions from Google Docs content blocks
   * @param contentBlocks - Content blocks from Google Docs
   * @returns Array of parsed survey questions
   */
  parseSurveyQuestions(contentBlocks: any[]): SurveyQuestion[] {
    console.log('🔍 DEBUG: Content blocks received:', JSON.stringify(contentBlocks, null, 2));
    
    const questions: SurveyQuestion[] = [];
    let questionCounter = 1;

    contentBlocks.forEach((block, blockIndex) => {
      console.log(`🔍 DEBUG: Processing block ${blockIndex}:`, block);
      
      // Skip the first block if it's just the title
      if (block.header && block.header.includes('Choose to Grow')) {
        return;
      }
      
      // Parse questions from block headers
      if (block.header && block.header.trim()) {
        const headerText = block.header;
        console.log(`🔍 DEBUG: Processing header: "${headerText}"`);
        
        // Split by vertical tab or newline characters to separate question from options
        const parts = headerText.split(/[\u000b\n]+/).map(part => part.trim()).filter(part => part);
        console.log(`🔍 DEBUG: Header parts:`, parts);
        
        if (parts.length > 0) {
          const questionText = parts[0];
          const remainingParts = parts.slice(1);
          
          // Check if it's open-ended
          const isOpenEnded = remainingParts.some(part => 
            part.toLowerCase().includes('open-ended') || part.includes('(Open-ended)')
          );
          
          // Extract options (lines that start with ☐)
          const options = remainingParts
            .filter(part => part.startsWith('☐'))
            .map((option, index) => ({
              label: String.fromCharCode(65 + index), // A, B, C, etc.
              text: option.replace('☐', '').trim()
            }));
          
          console.log(`🔍 DEBUG: Question "${questionText}", isOpenEnded: ${isOpenEnded}, options:`, options);
          
          const question: SurveyQuestion = {
            id: `q${questionCounter}`,
            text: questionText,
            type: isOpenEnded ? 'open-ended' : 'multiple-choice',
            options: isOpenEnded ? undefined : options
          };
          
          questions.push(question);
          questionCounter++;
        }
      }
      
      // Also check content items (in case some questions are there)
      if (block.content && block.content.length > 0) {
        block.content.forEach((item: any, itemIndex: number) => {
          console.log(`🔍 DEBUG: Processing content item ${itemIndex}:`, item);
          
          if (item.text && item.text.includes('☐')) {
            // This might be a question with options in the content
            const parts = item.text.split(/[\u000b\n]+/).map(part => part.trim()).filter(part => part);
            
            if (parts.length > 0) {
              const questionText = parts[0];
              const options = parts
                .filter(part => part.startsWith('☐'))
                .map((option, index) => ({
                  label: String.fromCharCode(65 + index),
                  text: option.replace('☐', '').trim()
                }));
              
              if (options.length > 0) {
                const question: SurveyQuestion = {
                  id: `q${questionCounter}`,
                  text: questionText,
                  type: 'multiple-choice',
                  options: options
                };
                
                questions.push(question);
                questionCounter++;
              }
            }
          }
        });
      }
    });

    console.log('🔍 DEBUG: Final parsed questions:', questions);
    return questions;
  }

  /**
   * Submit survey responses
   * @param responses - Array of survey responses
   * @param familyCode - Current family code (null if not in family mode)
   * @param moduleId - Module identifier (e.g., 'mistakes', 'regulation')
   * @param moduleName - Human readable module name
   * @param userMode - Whether submitted by parent or student
   */
  async submitSurvey(
    responses: SurveyResponse[],
    familyCode: string | null,
    moduleId: string,
    moduleName: string,
    userMode: 'parent' | 'student'
  ): Promise<void> {
    try {
      const submission: SurveySubmission = {
        id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        familyCode,
        moduleId,
        moduleName,
        responses,
        submittedAt: new Date(),
        completedBy: userMode
      };

      // Get existing submissions
      const existingSubmissions = await this.getAllSubmissions();
      
      // Add new submission
      existingSubmissions.push(submission);
      
      // Save back to storage (in-memory for now)
      this.inMemoryStorage[this.STORAGE_KEY] = JSON.stringify(existingSubmissions);
      
      console.log('✅ Survey submitted successfully:', {
        submissionId: submission.id,
        familyCode,
        moduleId,
        responsesCount: responses.length
      });
    } catch (error) {
      console.error('❌ Failed to submit survey:', error);
      throw error;
    }
  }

  /**
   * Get all survey submissions
   * @returns Array of all survey submissions
   */
  async getAllSubmissions(): Promise<SurveySubmission[]> {
    try {
      const stored = this.inMemoryStorage[this.STORAGE_KEY];
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to load survey submissions:', error);
      return [];
    }
  }

  /**
   * Get survey submissions for a specific family
   * @param familyCode - Family code to filter by
   * @returns Array of survey submissions for the family
   */
  async getSubmissionsForFamily(familyCode: string): Promise<SurveySubmission[]> {
    const allSubmissions = await this.getAllSubmissions();
    return allSubmissions.filter(submission => submission.familyCode === familyCode);
  }

  /**
   * Get survey submissions for a specific module
   * @param moduleId - Module ID to filter by
   * @param familyCode - Optional family code to filter by
   * @returns Array of survey submissions for the module
   */
  async getSubmissionsForModule(
    moduleId: string, 
    familyCode?: string
  ): Promise<SurveySubmission[]> {
    const allSubmissions = await this.getAllSubmissions();
    return allSubmissions.filter(submission => {
      const moduleMatch = submission.moduleId === moduleId;
      const familyMatch = familyCode ? submission.familyCode === familyCode : true;
      return moduleMatch && familyMatch;
    });
  }

  /**
   * Check if survey has been completed for a specific module and family
   * @param moduleId - Module ID to check
   * @param familyCode - Family code to check (null for individual mode)
   * @returns Whether survey has been completed
   */
  async hasSurveyBeenCompleted(moduleId: string, familyCode: string | null): Promise<boolean> {
    const allSubmissions = await this.getAllSubmissions();
    return allSubmissions.some(submission => 
      submission.moduleId === moduleId && submission.familyCode === familyCode
    );
  }

  /**
   * Get survey statistics for analytics
   * @param familyCode - Optional family code to filter by
   * @returns Survey statistics
   */
  async getSurveyStatistics(familyCode?: string): Promise<{
    totalSubmissions: number;
    moduleBreakdown: Record<string, number>;
    averageResponsesPerSurvey: number;
    lastSubmissionDate: Date | null;
  }> {
    const submissions = familyCode 
      ? await this.getSubmissionsForFamily(familyCode)
      : await this.getAllSubmissions();

    const moduleBreakdown: Record<string, number> = {};
    let totalResponses = 0;

    submissions.forEach(submission => {
      moduleBreakdown[submission.moduleId] = (moduleBreakdown[submission.moduleId] || 0) + 1;
      totalResponses += submission.responses.length;
    });

    const lastSubmissionDate = submissions.length > 0 
      ? new Date(Math.max(...submissions.map(s => new Date(s.submittedAt).getTime())))
      : null;

    return {
      totalSubmissions: submissions.length,
      moduleBreakdown,
      averageResponsesPerSurvey: submissions.length > 0 ? totalResponses / submissions.length : 0,
      lastSubmissionDate
    };
  }

  /**
   * Clear all survey data (for testing or reset purposes)
   */
  async clearAllSurveyData(): Promise<void> {
    try {
      delete this.inMemoryStorage[this.STORAGE_KEY];
      console.log('✅ All survey data cleared');
    } catch (error) {
      console.error('❌ Failed to clear survey data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const surveyService = new SurveyService();