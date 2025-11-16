import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, TouchableOpacity } from 'react-native';
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

  // Custom back button for web deployment
  const CustomBackButton = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{ 
        fontSize: 18, 
        color: colorScheme === 'dark' ? '#fff' : '#007AFF',
        marginRight: 4 
      }}>
        ←
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: colorScheme === 'dark' ? '#fff' : '#007AFF' 
      }}>
        Modules
      </Text>
    </TouchableOpacity>
  );

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
          name="job-module" 
          options={getModuleOptions("My Job, Your Job")}
        />
        <Stack.Screen 
          name="selfcoach-module" 
          options={getModuleOptions("Self-Coaching Module")}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
