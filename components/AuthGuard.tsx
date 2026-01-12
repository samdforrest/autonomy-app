import JoinFamily from '@/app/join-family';
import { useAppMode } from '@/contexts/AppModeContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isInFamilyMode, familyContext } = useAppMode();
  const [isLoading, setIsLoading] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

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
    console.log('🔍 AuthGuard - Auth state changed:', {
      isInFamilyMode,
      isActive: familyContext.isActive,
      familyCode: familyContext.familyCode
    });
  }, [isInFamilyMode, familyContext.isActive, familyContext.familyCode]);

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