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
  };
  students: { [studentId: string]: StudentData };
}

export interface StudentData {
  name: string;
  assessments: { [assessmentId: string]: any };
  progress: { [moduleId: string]: any };
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
        hasPassword: false
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
      progress: {}
    };

    await updateDoc(doc(db, 'families', familyCode), {
      [`students.${studentId}`]: studentData
    });

    console.log('✅ Added student to family:', studentName, 'in', familyCode);
    return studentId;
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
}

export const familyService = new FamilyService();
