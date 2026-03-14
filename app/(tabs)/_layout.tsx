import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, View } from 'react-native';

import { FloatingModeToggle } from '@/components/FloatingModeToggle';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAppMode } from '@/contexts/AppModeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userMode } = useAppMode();
  
  // Debug logging to verify userMode
  console.log('🔍 TabLayout userMode:', userMode, 'showExplore:', userMode === 'student');
  console.log('🔍 TabLayout userMode type:', typeof userMode, 'exact value:', JSON.stringify(userMode));

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('@/assets/images/home-icon.png')}
                style={{ width: 28, height: 28, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Modules',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('@/assets/images/modules-icon.png')}
                style={{ width: 28, height: 28, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Progress Tracking',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('@/assets/images/progress-tracking-icon.png')}
                style={{ width: 28, height: 28, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tabs>
      <FloatingModeToggle />
    </View>
  );
}
