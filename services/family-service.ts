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
  children: { [childId: string]: ChildData };
}

export interface ChildData {
  name: string;
  assessments: { [assessmentId: string]: any };
  progress: { [moduleId: string]: any };
}

export class FamilyService {
  /**
   * Generate a unique family code
   */
  generateFamilyCode(): string {
    const animals = ['BEAR', 'LION', 'WOLF', 'EAGLE', 'TIGER', 'HAWK', 'DEER', 'FOX'];
    const numbers = Math.floor(1000 + Math.random() * 9000);
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${animal}-${numbers}`;
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
      children: {}
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
   * Add a child to a family
   */
  async addChild(familyCode: string, childName: string): Promise<string> {
    const childId = childName.toLowerCase().replace(/\s+/g, '-');
    
    const childData: ChildData = {
      name: childName,
      assessments: {},
      progress: {}
    };

    await updateDoc(doc(db, 'families', familyCode), {
      [`children.${childId}`]: childData
    });

    console.log('✅ Added child to family:', childName, 'in', familyCode);
    return childId;
  }

  /**
   * Save assessment results for a child
   */
  async saveAssessmentResults(
    familyCode: string, 
    childId: string, 
    assessmentData: any
  ): Promise<void> {
    const assessmentId = `assessment_${Date.now()}`;
    
    await updateDoc(doc(db, 'families', familyCode), {
      [`children.${childId}.assessments.${assessmentId}`]: {
        ...assessmentData,
        completedAt: serverTimestamp()
      }
    });

    console.log('✅ Saved assessment results for:', childId, 'in family:', familyCode);
  }

  /**
   * Update child progress for a module
   */
  async updateChildProgress(
    familyCode: string,
    childId: string,
    moduleId: string,
    progressData: any
  ): Promise<void> {
    await updateDoc(doc(db, 'families', familyCode), {
      [`children.${childId}.progress.${moduleId}`]: {
        ...progressData,
        lastUpdated: serverTimestamp()
      }
    });

    console.log('✅ Updated progress for:', childId, moduleId, 'in family:', familyCode);
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
