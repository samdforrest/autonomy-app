import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    where
} from 'firebase/firestore';
import { db } from './firebase-config';

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
  answerLabel?: string | null; // For multiple choice (A, B, C, etc.)
  timestamp: Date;
}

export interface SurveySubmission {
  id?: string; // Optional for Firestore auto-generated IDs
  familyCode: string | null;
  moduleId: string;
  moduleName: string;
  responses: SurveyResponse[];
  submittedAt: Date | Timestamp;
  completedBy: 'parent' | 'student';
}

class SurveyService {
  private readonly COLLECTION_NAME = 'survey_responses';

  /**
   * Generate a meaningful submission ID in format: FAMILY-CODE-LESSON-NAME
   * Examples: BEAR-1234-mistakes, LION-5678-collaboration, individual-regulation
   */
  private generateSubmissionId(familyCode: string | null, moduleId: string): string {
    const family = familyCode || 'individual';
    const lesson = moduleId.toLowerCase();
    return `${family}-${lesson}`;
  }

  /**
   * Remove undefined values from an object recursively
   * Firebase doesn't accept undefined values
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      });
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Parse survey questions from Google Docs content blocks
   * @param contentBlocks - Content blocks from Google Docs
   * @returns Array of parsed survey questions
   */
  parseSurveyQuestions(contentBlocks: any[]): SurveyQuestion[] {
    const questions: SurveyQuestion[] = [];
    let questionCounter = 1;

    contentBlocks.forEach((block) => {
      // Skip the first block if it's just the title
      if (block.header && block.header.includes('Choose to Grow')) {
        return;
      }
      
      // Parse questions from block headers
      if (block.header && block.header.trim()) {
        const headerText = block.header;
        
        // Split by vertical tab or newline characters to separate question from options
        const parts = headerText.split(/[\u000b\n]+/).map(part => part.trim()).filter(part => part);
        
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
        block.content.forEach((item: any) => {
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
      // Clean responses to remove undefined values
      const cleanedResponses = responses.map(response => {
        const cleaned = {
          questionId: response.questionId || '',
          questionText: response.questionText || '',
          answer: response.answer || '',
          timestamp: response.timestamp || new Date()
        };
        
        // Only add answerLabel if it exists and is not undefined
        if (response.answerLabel !== undefined && response.answerLabel !== null) {
          (cleaned as any).answerLabel = response.answerLabel;
        }
        
        return cleaned;
      });

      // Create a meaningful document ID: FAMILY-CODE-LESSON-NAME
      const customDocId = this.generateSubmissionId(familyCode, moduleId);

      const submission: SurveySubmission = {
        familyCode: familyCode || null, // Use null instead of undefined
        moduleId: moduleId || '',
        moduleName: moduleName || '',
        responses: cleanedResponses,
        submittedAt: serverTimestamp(),
        completedBy: userMode
      };

      // Remove any undefined values that might still exist
      const cleanedSubmission = this.removeUndefinedValues(submission);

      // Log the submission data for debugging
      console.log('📋 Submitting survey data:', {
        customDocId,
        familyCode: cleanedSubmission.familyCode,
        moduleId: cleanedSubmission.moduleId,
        responsesCount: cleanedSubmission.responses.length,
        sampleResponse: cleanedSubmission.responses[0]
      });

      // Save to Firebase Firestore with custom document ID
      await setDoc(doc(db, this.COLLECTION_NAME, customDocId), cleanedSubmission);
      
      console.log('✅ Survey submitted successfully to Firebase:', {
        submissionId: customDocId,
        familyCode,
        moduleId,
        responsesCount: responses.length
      });
    } catch (error) {
      console.error('❌ Failed to submit survey to Firebase:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  /**
   * Get all survey submissions
   * @returns Array of all survey submissions
   */
  async getAllSubmissions(): Promise<SurveySubmission[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.COLLECTION_NAME), orderBy('submittedAt', 'desc'))
      );
      
      const submissions: SurveySubmission[] = [];
      querySnapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        } as SurveySubmission);
      });
      
      return submissions;
    } catch (error) {
      console.error('❌ Failed to load survey submissions from Firebase:', error);
      return [];
    }
  }

  /**
   * Get survey submissions for a specific family
   * @param familyCode - Family code to filter by
   * @returns Array of survey submissions for the family
   */
  async getSubmissionsForFamily(familyCode: string): Promise<SurveySubmission[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, this.COLLECTION_NAME),
          where('familyCode', '==', familyCode),
          orderBy('submittedAt', 'desc')
        )
      );
      
      const submissions: SurveySubmission[] = [];
      querySnapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        } as SurveySubmission);
      });
      
      return submissions;
    } catch (error) {
      console.error('❌ Failed to load family survey submissions from Firebase:', error);
      return [];
    }
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
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('moduleId', '==', moduleId),
        orderBy('submittedAt', 'desc')
      );
      
      if (familyCode) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('moduleId', '==', moduleId),
          where('familyCode', '==', familyCode),
          orderBy('submittedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const submissions: SurveySubmission[] = [];
      querySnapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        } as SurveySubmission);
      });
      
      return submissions;
    } catch (error) {
      console.error('❌ Failed to load module survey submissions from Firebase:', error);
      return [];
    }
  }

  /**
   * Check if survey has been completed for a specific module and family
   * @param moduleId - Module ID to check
   * @param familyCode - Family code to check (null for individual mode)
   * @returns Whether survey has been completed
   */
  async hasSurveyBeenCompleted(moduleId: string, familyCode: string | null): Promise<boolean> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('moduleId', '==', moduleId),
        where('familyCode', '==', familyCode)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Failed to check survey completion in Firebase:', error);
      return false;
    }
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
      ? new Date(Math.max(...submissions.map(s => {
          const date = submission.submittedAt;
          return date instanceof Timestamp ? date.toDate().getTime() : new Date(date).getTime();
        })))
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
      // Note: This is a dangerous operation for production!
      // In production, you might want to add additional safeguards
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      
      const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      console.log('✅ All survey data cleared from Firebase');
    } catch (error) {
      console.error('❌ Failed to clear survey data from Firebase:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const surveyService = new SurveyService();