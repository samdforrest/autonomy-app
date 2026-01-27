import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { router, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, TouchableOpacity, TextStyle } from 'react-native';
import 'react-native-reanimated';

// Set default font for all Text components
const oldTextRender = (Text as any).render;
(Text as any).render = function (...args: any[]) {
  const origin = oldTextRender.call(this, ...args);
  const defaultStyle: TextStyle = { fontFamily: 'Poppins_400Regular' };
  return {
    ...origin,
    props: {
      ...origin.props,
      style: [defaultStyle, origin.props.style],
    },
  };
};

// Component to handle tutorial inside providers
function TutorialManager() {
  const { userMode, switchMode, currentFamilyCode, currentFamily, setFamilyContext } = useAppMode();
  const tutorial = useFamilyTutorial(currentFamilyCode);
  const router = useRouter();

  // Tutorial navigation handlers
  const handleTutorialComplete = async () => {
    if (currentFamilyCode && currentFamily) {
      try {
        console.log('📚 Tutorial completed, marking as complete and navigating to parent intro');
        
        // Mark tutorial as complete in Firebase
        await familyService.markTutorialComplete(currentFamilyCode);
        
        // Update local family context to reflect the completion
        const updatedFamilyData = {
          ...currentFamily,
          settings: {
            ...currentFamily.settings,
            hasCompletedTutorial: true
          }
        };
        setFamilyContext(currentFamilyCode, updatedFamilyData);
        
        // Complete tutorial in context (for local state)
        await tutorial.completeFamilyTutorial();
        
        // Navigate to parent intro
        router.replace('/intro-parent');
      } catch (error) {
        console.error('❌ Error completing tutorial:', error);
      }
    }
  };

  const handleTutorialClose = () => {
    tutorial.hideTutorial();
  };

  const handleTutorialModeSwitch = (mode: 'parent' | 'student') => {
    switchMode(mode);
  };

  const handleTutorialNavigateToAssessment = () => {
    router.push('/assessment');
  };

  const handleTutorialNavigateToExplore = () => {
    router.push('/(tabs)/explore');
  };

  const handleTutorialNavigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const handleTutorialNavigateToHome = () => {
    router.push('/(tabs)');
  };

  return (
    <FamilyOnboardingTutorial
      visible={tutorial.isTutorialVisible}
      onComplete={handleTutorialComplete}
      onClose={handleTutorialClose}
      currentUserMode={userMode}
      onModeSwitch={handleTutorialModeSwitch}
      onNavigateToAssessment={handleTutorialNavigateToAssessment}
      onNavigateToExplore={handleTutorialNavigateToExplore}
      onNavigateToProfile={handleTutorialNavigateToProfile}
      onNavigateToHome={handleTutorialNavigateToHome}
    />
  );
}

import { AuthGuard } from '@/components/AuthGuard';
import { IntroGuard } from '@/components/IntroGuard';
import { FamilyOnboardingTutorial } from '@/components/FamilyOnboardingTutorial';
import { AppModeProvider, useAppMode } from '@/contexts/AppModeContext';
import { CompletionProvider } from '@/contexts/CompletionContext';
import { TutorialProvider, useFamilyTutorial } from '@/contexts/TutorialContext';
import { familyService } from '@/services/family-service';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    material: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Custom back button for web deployment - styled like native iOS back button
  const CustomBackButton = () => {
    const handleBackPress = () => {
      // Check if we can go back in navigation history
      if (router.canGoBack()) {
        router.back();
      } else {
        // If no history (e.g., direct page reload), navigate to home tab
        // This is safer than trying to access userMode here
        router.push('/(tabs)');
      }
    };

    return (
      <TouchableOpacity
        onPress={handleBackPress}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 50, // Larger touch target
          minHeight: 50,
        }}
      >
        <Text style={{
          fontSize: 40, // Bigger size
          fontFamily: 'Poppins_400Regular',
          color: colorScheme === 'dark' ? '#0A84FF' : '#007AFF', // iOS blue
          lineHeight: 28,
          textAlign: 'center',
          marginTop: -11, // Slight vertical adjustment to align with title baseline
        }}>
          ‹
        </Text>
      </TouchableOpacity>
    );
  };

  // Common screen options for module screens
  const getModuleOptions = (title: string) => ({
    title,
    headerBackTitle: "Modules",
    ...(Platform.OS === 'web' && {
      headerLeft: () => <CustomBackButton />,
      headerStyle: {
        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
      },
    }),
  });

  return (
    <TutorialProvider>
      <AppModeProvider>
        <CompletionProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthGuard>
              <IntroGuard>
                <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="assessment"
                  options={{
                    title: "Assessment",
                    headerBackTitle: "Home",
                    ...(Platform.OS === 'web' && {
                      headerLeft: () => <CustomBackButton />,
                      headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                      },
                    }),
                  }}
                />
                <Stack.Screen 
                  name="mistakes-module" 
                  options={getModuleOptions("Mistakes & Learning")}
                />
                <Stack.Screen 
                  name="regulation-module" 
                  options={getModuleOptions("Regulation & Control")}
                />
                <Stack.Screen 
                  name="responsibility-module" 
                  options={getModuleOptions("Responsibility Module")}
                />
                <Stack.Screen 
                  name="collaboration-module" 
                  options={getModuleOptions("Collaboration & Teamwork")}
                />
                <Stack.Screen 
                  name="self-monitoring-module" 
                  options={getModuleOptions("Self-Monitoring Module")}
                />
                <Stack.Screen 
                  name="selfcoach-module" 
                  options={getModuleOptions("Self-Coaching Module")}
                />
                <Stack.Screen 
                  name="curiosity-module" 
                  options={getModuleOptions("Curiosity Module")}
                />
                <Stack.Screen 
                  name="shapeoflearning-module" 
                  options={getModuleOptions("Shape of Learning Module")}
                />
                <Stack.Screen 
                  name="neuroplasticity-module" 
                  options={getModuleOptions("Neuroplasticity Module")}
                />
                <Stack.Screen 
                  name="mastery-moments-module" 
                  options={getModuleOptions("Mastery Moments Module")}
                />
                <Stack.Screen 
                  name="create-family" 
                  options={{
                    title: "Create Family",
                    headerBackTitle: "Home",
                    ...(Platform.OS === 'web' && {
                      headerLeft: () => <CustomBackButton />,
                      headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                      },
                    }),
                  }}
                />
                <Stack.Screen 
                  name="join-family" 
                  options={{
                    title: "Join Family",
                    headerBackTitle: "Home",
                    ...(Platform.OS === 'web' && {
                      headerLeft: () => <CustomBackButton />,
                      headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                      },
                    }),
                  }}
                />
                <Stack.Screen 
                  name="intro-parent" 
                  options={{
                    title: "Parent Introduction",
                    headerShown: false, // Full screen
                    gestureEnabled: false, // Prevent back navigation
                  }}
                />
                <Stack.Screen 
                  name="intro-student" 
                  options={{
                    title: "Student Introduction", 
                    headerShown: false, // Full screen
                    gestureEnabled: false, // Prevent back navigation
                  }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
              <TutorialManager />
              </IntroGuard>
            </AuthGuard>
            <StatusBar style="auto" />
          </ThemeProvider>
        </CompletionProvider>
      </AppModeProvider>
    </TutorialProvider>
  );
}
