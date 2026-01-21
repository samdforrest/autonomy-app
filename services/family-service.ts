import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface FamilyData {
  familyCode: string;
  settings: {
    parentName?: string;
    createdAt: any;
    hasPassword: boolean;
    isAdmin?: boolean; // NEW: Admin role flag
    loginCount?: number; // Track number of logins for auto-tutorial trigger
    hasCompletedTutorial?: boolean; // Track tutorial completion
    hasCompletedParentIntro?: boolean; // Track parent intro completion
    hasCompletedStudentIntro?: boolean; // Track student intro completion
  };
  students: { [studentId: string]: StudentData };
}

export interface StudentData {
  name: string;
  assessments: { [assessmentId: string]: any };
  progress: { [moduleId: string]: any };
  moduleCompletions?: {
    [moduleId: string]: {
      isCompleted: boolean;
      completedAt?: any;
      completedDays?: number;
      totalDays?: number;
      lastAccessed?: any;
    };
  };
}

export class FamilyService {
  /**
   * Generate a unique family code in format: XXXX-#### (4-letter animal + 4 digits)
   * Examples: BEAR-1234, LION-5678, WOLF-9012
   */
  generateFamilyCode(): string {
    // Only 4-letter animal names for consistent formatting
    const animals = [
      'BEAR', 'LION', 'WOLF', 'DEER', 'DUCK', 'FROG', 
      'GOAT', 'HAWK', 'LAMB', 'LYNX', 'PUMA', 'SEAL', 
      'SWAN', 'TOAD', 'CRAB', 'FISH', 'BIRD', 'BULL'
    ];
    const numbers = Math.floor(1000 + Math.random() * 9000); // Ensures exactly 4 digits (1000-9999)
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${animal}-${numbers}`;
  }

  /**
   * Validate family code format (4-letter animal + hyphen + 4 digits)
   */
  isValidFamilyCodeFormat(code: string): boolean {
    const pattern = /^[A-Z]{4}-\d{4}$/;
    return pattern.test(code);
  }

  /**
   * Create a new family with a generated code
   */
  async createFamily(parentName?: string): Promise<string> {
    const familyCode = this.generateFamilyCode();
    
    // Check if code already exists (very unlikely but good practice)
    const existing = await this.getFamilyData(familyCode);
    if (existing) {
      // Generate a new code if collision
      return this.createFamily(parentName);
    }

    const familyData: FamilyData = {
      familyCode,
      settings: {
        parentName: parentName || 'Parent',
        createdAt: serverTimestamp(),
        hasPassword: false,
        loginCount: 0, // Start with 0 logins for new families
        hasCompletedTutorial: false,
        hasCompletedParentIntro: false,
        hasCompletedStudentIntro: false
      },
      students: {}
    };

    await setDoc(doc(db, 'families', familyCode), familyData);
    console.log('✅ Created new family:', familyCode);
    
    return familyCode;
  }

  /**
   * Get family data by code
   */
  async getFamilyData(familyCode: string): Promise<FamilyData | null> {
    try {
      console.log('🔍 Fetching family data for:', familyCode);
      
      const familyDoc = await getDoc(doc(db, 'families', familyCode));
      
      if (familyDoc.exists()) {
        console.log('✅ Family data loaded successfully');
        return familyDoc.data() as FamilyData;
      } else {
        console.log('❌ Family not found:', familyCode);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error fetching family data:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'unavailable') {
        console.error('🌐 Firebase is offline or unreachable');
        throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
      } else if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check Firestore rules');
        throw new Error('Permission denied. Please check your access rights.');
      } else {
        throw new Error('Failed to load family data. Please try again.');
      }
    }
  }

  /**
   * Add a student to a family
   */
  async addStudent(familyCode: string, studentName: string): Promise<string> {
    const studentId = studentName.toLowerCase().replace(/\s+/g, '-');
    
    const studentData: StudentData = {
      name: studentName,
      assessments: {},
      progress: {},
      moduleCompletions: {}
    };

    await updateDoc(doc(db, 'families', familyCode), {
      [`students.${studentId}`]: studentData
    });

    console.log('✅ Added student to family:', studentName, 'in', familyCode);
    return studentId;
  }

  /**
   * Get the first available student ID from a family (for auto-selection)
   */
  async getFirstStudentId(familyCode: string): Promise<string | null> {
    const family = await this.getFamilyData(familyCode);
    if (!family || !family.students) {
      return null;
    }

    const studentIds = Object.keys(family.students);
    return studentIds.length > 0 ? studentIds[0] : null;
  }

  /**
   * Ensure a family has at least one student (create default if needed)
   */
  async ensureDefaultStudent(familyCode: string): Promise<string> {
    const family = await this.getFamilyData(familyCode);
    if (!family) {
      throw new Error('Family not found');
    }

    // Check if family already has students
    if (family.students && Object.keys(family.students).length > 0) {
      return Object.keys(family.students)[0];
    }

    // Create a default student
    const defaultStudentId = await this.addStudent(familyCode, 'Student');
    console.log('✅ Created default student for family:', familyCode);
    return defaultStudentId;
  }

  /**
   * Save assessment results for a student
   */
  async saveAssessmentResults(
    familyCode: string, 
    studentId: string, 
    assessmentData: any
  ): Promise<void> {
    const assessmentId = `assessment_${Date.now()}`;
    
    await updateDoc(doc(db, 'families', familyCode), {
      [`students.${studentId}.assessments.${assessmentId}`]: {
        ...assessmentData,
        completedAt: serverTimestamp()
      }
    });

    console.log('✅ Saved assessment results for:', studentId, 'in family:', familyCode);
  }

  /**
   * Update student progress for a module
   */
  async updateStudentProgress(
    familyCode: string,
    studentId: string,
    moduleId: string,
    progressData: any
  ): Promise<void> {
    await updateDoc(doc(db, 'families', familyCode), {
      [`students.${studentId}.progress.${moduleId}`]: {
        ...progressData,
        lastUpdated: serverTimestamp()
      }
    });

    console.log('✅ Updated progress for:', studentId, moduleId, 'in family:', familyCode);
  }

  /**
   * Check if family code exists and is valid
   */
  async validateFamilyCode(familyCode: string): Promise<boolean> {
    const family = await this.getFamilyData(familyCode);
    return family !== null;
  }

  /**
   * Mark a module as completed for a student
   */
  async markModuleCompleted(
    familyCode: string,
    studentId: string,
    moduleId: string,
    completedDays: number = 5,
    totalDays: number = 5
  ): Promise<void> {
    await updateDoc(doc(db, 'families', familyCode), {
      [`students.${studentId}.moduleCompletions.${moduleId}`]: {
        isCompleted: true,
        completedAt: serverTimestamp(),
        completedDays,
        totalDays,
        lastAccessed: serverTimestamp()
      }
    });

    console.log('✅ Module marked as completed:', moduleId, 'for student:', studentId, 'in family:', familyCode);
  }

  /**
   * Update module progress (days completed, last accessed)
   */
  async updateModuleProgress(
    familyCode: string,
    studentId: string,
    moduleId: string,
    completedDays: number,
    totalDays: number = 5
  ): Promise<void> {
    const isCompleted = completedDays >= totalDays;
    
    await updateDoc(doc(db, 'families', familyCode), {
      [`students.${studentId}.moduleCompletions.${moduleId}`]: {
        isCompleted,
        completedAt: isCompleted ? serverTimestamp() : null,
        completedDays,
        totalDays,
        lastAccessed: serverTimestamp()
      }
    });

    console.log('📊 Module progress updated:', moduleId, `${completedDays}/${totalDays}`, 'for student:', studentId);
  }

  /**
   * Get completion status for all modules for a student
   */
  async getStudentModuleCompletions(
    familyCode: string,
    studentId: string
  ): Promise<{ [moduleId: string]: any } | null> {
    const family = await this.getFamilyData(familyCode);
    if (!family || !family.students[studentId]) {
      return null;
    }

    return family.students[studentId].moduleCompletions || {};
  }

  /**
   * Get completion statistics for a family
   */
  async getFamilyCompletionStats(familyCode: string): Promise<{
    totalStudents: number;
    moduleStats: { [moduleId: string]: { 
      completed: number; 
      inProgress: number; 
      notStarted: number;
      totalDaysCompleted: number;
      totalPossibleDays: number;
      averageProgress: number;
    } };
  } | null> {
    const family = await this.getFamilyData(familyCode);
    if (!family) return null;

    // Check if students object exists, if not create empty array
    const students = family.students ? Object.values(family.students) : [];
    console.log('📊 Family completion stats - students found:', students.length);
    
    const moduleIds = ['mistakes', 'regulation', 'job', 'collaboration', 'selfcoach', 'curiosity', 'shapeoflearning', 'neuroplasticity', 'masterymoments', 'selfmonitoring'];
    
    const moduleStats: { [moduleId: string]: { 
      completed: number; 
      inProgress: number; 
      notStarted: number;
      totalDaysCompleted: number;
      totalPossibleDays: number;
      averageProgress: number;
    } } = {};
    
    moduleIds.forEach(moduleId => {
      moduleStats[moduleId] = { 
        completed: 0, 
        inProgress: 0, 
        notStarted: 0,
        totalDaysCompleted: 0,
        totalPossibleDays: 0,
        averageProgress: 0
      };
      
      students.forEach(student => {
        const completion = student.moduleCompletions?.[moduleId];
        const totalDays = completion?.totalDays || 5; // Default to 5 days per module
        const completedDays = completion?.completedDays || 0;
        
        // Add to totals for average calculation
        moduleStats[moduleId].totalDaysCompleted += completedDays;
        moduleStats[moduleId].totalPossibleDays += totalDays;
        
        if (!completion || completedDays === 0) {
          // No progress recorded
          moduleStats[moduleId].notStarted++;
        } else if (completedDays >= totalDays) {
          // All days completed
          moduleStats[moduleId].completed++;
        } else if (completedDays > 0) {
          // Some days completed but not all
          moduleStats[moduleId].inProgress++;
        }
      });
      
      // Calculate average progress percentage for this module
      if (moduleStats[moduleId].totalPossibleDays > 0) {
        moduleStats[moduleId].averageProgress = Math.round(
          (moduleStats[moduleId].totalDaysCompleted / moduleStats[moduleId].totalPossibleDays) * 100
        );
      }
    });

    return {
      totalStudents: students.length,
      moduleStats
    };
  }

  /**
   * Assign admin role to a family
   */
  async setFamilyAdminStatus(familyCode: string, isAdmin: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'families', familyCode), {
        'settings.isAdmin': isAdmin
      });
      console.log(`✅ ${isAdmin ? 'Granted' : 'Revoked'} admin role for family:`, familyCode);
    } catch (error) {
      console.error('❌ Error updating admin status:', error);
      throw new Error('Failed to update admin status');
    }
  }

  /**
   * Check if a family has admin privileges
   */
  async isAdminFamily(familyCode: string): Promise<boolean> {
    try {
      const familyData = await this.getFamilyData(familyCode);
      return familyData?.settings?.isAdmin === true;
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Increment login count for family (tracks all individual login sessions)
   */
  async incrementLoginCount(familyCode: string): Promise<number> {
    try {
      const stack = new Error().stack;
      console.log('🔢🔢🔢 INCREMENT LOGIN COUNT CALLED');
      console.log('📍 Family Code:', familyCode);
      console.log('📍 Call Stack:', stack?.split('\n').slice(1, 5).join('\n'));
      
      const familyRef = doc(db, 'families', familyCode);
      const familyData = await this.getFamilyData(familyCode);
      
      if (!familyData) {
        console.error('❌ Family not found for login count increment:', familyCode);
        return 0;
      }

      const currentCount = familyData.settings.loginCount || 0;
      const newCount = currentCount + 1;
      
      console.log('📈 Incrementing login count from', currentCount, 'to', newCount);

      await updateDoc(familyRef, {
        'settings.loginCount': newCount
      });

      console.log('✅ Login count incremented successfully in Firebase:', { familyCode, from: currentCount, to: newCount });
      return newCount;
    } catch (error) {
      console.error('❌ Error incrementing login count:', error);
      return 0;
    }
  }

  /**
   * Mark tutorial as completed for family
   */
  async markTutorialComplete(familyCode: string): Promise<void> {
    try {
      console.log('✅ Marking tutorial complete for family:', familyCode);
      await updateDoc(doc(db, 'families', familyCode), {
        'settings.hasCompletedTutorial': true
      });
      console.log('✅ Tutorial completion marked in Firebase');
    } catch (error) {
      console.error('❌ Error marking tutorial complete:', error);
      throw error;
    }
  }

  /**
   * Mark parent intro as completed for family
   */
  async markParentIntroComplete(familyCode: string): Promise<void> {
    try {
      console.log('✅ Marking parent intro complete for family:', familyCode);
      await updateDoc(doc(db, 'families', familyCode), {
        'settings.hasCompletedParentIntro': true
      });
      console.log('✅ Parent intro completion marked in Firebase');
    } catch (error) {
      console.error('❌ Error marking parent intro complete:', error);
      throw error;
    }
  }

  /**
   * Mark student intro as completed for family
   */
  async markStudentIntroComplete(familyCode: string): Promise<void> {
    try {
      console.log('✅ Marking student intro complete for family:', familyCode);
      await updateDoc(doc(db, 'families', familyCode), {
        'settings.hasCompletedStudentIntro': true
      });
      console.log('✅ Student intro completion marked in Firebase');
    } catch (error) {
      console.error('❌ Error marking student intro complete:', error);
      throw error;
    }
  }

  /**
   * Determine what screen should be shown based on completion state
   */
  getRequiredScreen(familyData: FamilyData): 'tutorial' | 'intro-parent' | 'intro-student' | 'home' {
    // Only show intro flow for first-time users (loginCount = 1)
    if (familyData.settings.loginCount === 1) {
      if (!familyData.settings.hasCompletedTutorial) return 'tutorial';
      if (!familyData.settings.hasCompletedParentIntro) return 'intro-parent';
      if (!familyData.settings.hasCompletedStudentIntro) return 'intro-student';
    }
    return 'home';
  }

}

export const familyService = new FamilyService();
