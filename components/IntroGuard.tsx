import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppMode } from '@/contexts/AppModeContext';
import { familyService } from '@/services/family-service';

interface IntroGuardProps {
  children: React.ReactNode;
}

export function IntroGuard({ children }: IntroGuardProps) {
  const { isInFamilyMode, currentFamily, currentFamilyCode } = useAppMode();
  const router = useRouter();

  useEffect(() => {
    const checkIntroFlow = () => {
      // Only check intro flow if user is authenticated and we have family data
      if (!isInFamilyMode || !currentFamily || !currentFamilyCode) {
        console.log('🔒 IntroGuard: Not authenticated or no family data');
        return;
      }

      const requiredScreen = familyService.getRequiredScreen(currentFamily);
      
      console.log('🎯 IntroGuard: Checking required screen:', {
        familyCode: currentFamilyCode,
        loginCount: currentFamily.settings.loginCount,
        hasCompletedTutorial: currentFamily.settings.hasCompletedTutorial,
        hasCompletedParentIntro: currentFamily.settings.hasCompletedParentIntro,
        hasCompletedStudentIntro: currentFamily.settings.hasCompletedStudentIntro,
        requiredScreen
      });

      // Navigate to required screen if not already there
      switch (requiredScreen) {
        case 'tutorial':
          console.log('📚 IntroGuard: Tutorial required, but handled by existing tutorial system');
          // Tutorial is handled by existing TutorialContext system
          break;
        case 'intro-parent':
          console.log('👨‍👩‍👧‍👦 IntroGuard: Navigating to parent intro');
          router.replace('/intro-parent');
          break;
        case 'intro-student':
          console.log('🎓 IntroGuard: Navigating to student intro');
          router.replace('/intro-student');
          break;
        case 'home':
          console.log('🏠 IntroGuard: All intros complete, showing normal app');
          // Let normal app flow continue
          break;
      }
    };

    checkIntroFlow();
  }, [isInFamilyMode, currentFamily, currentFamilyCode, router]);

  // Always render children - navigation happens via router
  return <>{children}</>;
}