import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="mistakes-module" 
          options={{ 
            title: "Mistakes & Learning",
            headerBackTitle: "Modules"
          }} 
        />
        <Stack.Screen 
          name="regulation-module" 
          options={{ 
            title: "Regulation & Control",
            headerBackTitle: "Modules"
          }} 
        />
        <Stack.Screen 
          name="job-module" 
          options={{ 
            title: "My Job, Your Job",
            headerBackTitle: "Modules"
          }} 
        />
        <Stack.Screen 
          name="selfcoach-module" 
          options={{ 
            title: "Self-Coaching Module",
            headerBackTitle: "Modules"
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
