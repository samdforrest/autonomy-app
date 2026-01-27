import JoinFamily from '@/app/join-family';
import { useAppMode } from '@/contexts/AppModeContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ThemedText } from './ThemedText';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isInFamilyMode, familyContext } = useAppMode();
  const [isLoading, setIsLoading] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Reanimated shared value for zoom effect (1 -> 1.15 = 15% enlargement)
  const scale = useSharedValue(1);

  // Animated style for the splash logo
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Show splash screen for 5 seconds on app launch with zoom animation
  useEffect(() => {
    // Start the zoom animation with near-linear easing for maximum smoothness
    scale.value = withTiming(1.15, {
      duration: 5000,
      easing: Easing.bezier(0.05, 0, 0.05, 1),
    });

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    // Give the AppModeProvider time to load persisted family context
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAuthCheckComplete(true);
    }, 100); // Small delay to ensure context is loaded

    return () => clearTimeout(timer);
  }, []);

  // Add effect to log auth state changes for debugging
  useEffect(() => {
    console.log('AuthGuard - Auth state changed:', {
      isInFamilyMode,
      isActive: familyContext.isActive,
      familyCode: familyContext.familyCode
    });
  }, [isInFamilyMode, familyContext.isActive, familyContext.familyCode]);

  // Show splash screen with logo
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/images/autonomy-brain.png')}
          style={styles.brainLogo}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../assets/images/autonomylogotext.png')}
          style={[styles.splashLogo, animatedStyle]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Show loading spinner while checking authentication
  if (isLoading || !authCheckComplete) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  // If not authenticated, show the join family screen
  if (!isInFamilyMode || !familyContext.isActive) {
    console.log('🔒 User not authenticated, showing login screen');
    return <JoinFamily />;
  }

  // User is authenticated, show the protected content
  console.log('✅ User authenticated, showing app content for family:', familyContext.familyCode);
  return <>{children}</>;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  brainLogo: {
    width: 120,
    height: 120,
    marginBottom: -25,
  },
  splashLogo: {
    width: '80%',
    maxWidth: 400,
    height: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});