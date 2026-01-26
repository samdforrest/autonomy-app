import { useAppMode } from '@/contexts/AppModeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ModeToggleProps {
  style?: any;
  compact?: boolean; // For smaller version if needed
}

export function ModeToggle({ style, compact = false }: ModeToggleProps) {
  const { userMode, switchMode } = useAppMode();

  const handleModeToggle = () => {
    switchMode(userMode === 'parent' ? 'student' : 'parent');
  };

  return (
    <ThemedView style={[styles.container, compact && styles.containerCompact, style]}>
      <ThemedView style={styles.modeSwitcher}>
        <ThemedText style={[styles.modeLabel, compact && styles.modeLabelCompact]}>
          {userMode === 'parent' ? 'Parent View' : 'Student View'}
        </ThemedText>
        <TouchableOpacity 
          style={[
            styles.modeToggle,
            compact && styles.modeToggleCompact,
            userMode === 'parent' ? styles.modeToggleParent : styles.modeToggleChild
          ]} 
          onPress={handleModeToggle}
        >
          <View style={[
            styles.modeToggleIndicator,
            compact && styles.modeToggleIndicatorCompact,
            userMode === 'parent' ? styles.indicatorParent : styles.indicatorChild
          ]} />
          <ThemedText style={[
            styles.modeToggleText,
            compact && styles.modeToggleTextCompact,
            userMode === 'parent' ? styles.textParent : styles.textChild
          ]}>
            {userMode === 'parent' ? 'Parent' : 'Student'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  containerCompact: {
    marginVertical: 12,
  },
  modeSwitcher: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modeLabelCompact: {
    fontSize: 16,
    marginBottom: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
    width: 140,
    height: 50,
    position: 'relative',
  },
  modeToggleCompact: {
    width: 120,
    height: 40,
  },
  modeToggleParent: {
    backgroundColor: '#E3F2FD', // Light blue for parent
  },
  modeToggleChild: {
    backgroundColor: '#FFF3E0', // Light orange for student
  },
  modeToggleIndicator: {
    position: 'absolute',
    width: 66,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  modeToggleIndicatorCompact: {
    width: 56,
    height: 32,
    borderRadius: 16,
  },
  indicatorParent: {
    left: 4,
    backgroundColor: '#2196F3', // Blue for parent
  },
  indicatorChild: {
    right: 4,
    backgroundColor: '#FF9800', // Orange for student
  },
  modeToggleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 1,
  },
  modeToggleTextCompact: {
    fontSize: 12,
  },
  textParent: {
    color: 'white',
  },
  textChild: {
    color: 'white',
  },
});