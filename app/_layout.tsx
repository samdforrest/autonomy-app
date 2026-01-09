import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, TouchableOpacity } from 'react-native';
import 'react-native-reanimated';

import { AppModeProvider } from '@/contexts/AppModeContext';
import { CompletionProvider } from '@/contexts/CompletionContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
        // If no history (e.g., direct page reload), navigate to explore tab
        router.push('/(tabs)/explore');
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
          fontWeight: '300', // Lighter weight like iOS
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
    <AppModeProvider>
      <CompletionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
        <Stack.Screen name="family/[code]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        </ThemeProvider>
      </CompletionProvider>
    </AppModeProvider>
  );
}
