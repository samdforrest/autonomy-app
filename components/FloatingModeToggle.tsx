import { useAppMode } from '@/contexts/AppModeContext';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

export function FloatingModeToggle() {
  const { userMode, switchMode } = useAppMode();

  const handleModeToggle = () => {
    switchMode(userMode === 'parent' ? 'student' : 'parent');
  };

  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        userMode === 'parent' ? styles.parentMode : styles.studentMode,
      ]}
      onPress={handleModeToggle}
      activeOpacity={0.8}
    >
      <Image
        source={
          userMode === 'parent'
            ? require('@/assets/images/parent-icon.png')
            : require('@/assets/images/student-icon.png')
        }
        style={styles.icon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  parentMode: {
    backgroundColor: '#2196F3',
  },
  studentMode: {
    backgroundColor: '#FF9800',
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: '#fff',
  },
});
