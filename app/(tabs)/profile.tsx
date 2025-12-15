import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppMode } from '@/contexts/AppModeContext';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { userMode, switchMode } = useAppMode();

  const handleModeToggle = () => {
    switchMode(userMode === 'parent' ? 'student' : 'parent');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.profileIconContainer}>
          <IconSymbol size={80} name="person.fill" color="#666" />
        </View>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your learning journey</ThemedText>
        
        {/* Mode Switcher */}
        <ThemedView style={styles.modeSwitcher}>
          <ThemedText style={styles.modeLabel}>
            {userMode === 'parent' ? '👨‍👩‍👧‍👦 Parent View' : '🧒 Student View'}
          </ThemedText>
          <TouchableOpacity 
            style={[
              styles.modeToggle,
              userMode === 'parent' ? styles.modeToggleParent : styles.modeToggleChild
            ]} 
            onPress={handleModeToggle}
          >
            <View style={[
              styles.modeToggleIndicator,
              userMode === 'parent' ? styles.indicatorParent : styles.indicatorChild
            ]} />
            <ThemedText style={[
              styles.modeToggleText,
              userMode === 'parent' ? styles.textParent : styles.textChild
            ]}>
              {userMode === 'parent' ? 'Parent' : 'Student'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText style={styles.comingSoon}>
          Profile features coming soon!
        </ThemedText>
        <ThemedText style={styles.description}>
          Here you'll be able to:
          {'\n'}• Switch between parent and student profiles
          {'\n'}• View learning progress
          {'\n'}• Manage account settings
          {'\n'}• Track completed modules
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  profileIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFC107',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    textAlign: 'center',
  },
  modeSwitcher: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
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
  modeToggleParent: {
    backgroundColor: '#E3F2FD', // Light blue for parent
  },
  modeToggleStudent: {
    backgroundColor: '#FFF3E0', // Light orange for student
  },
  modeToggleIndicator: {
    position: 'absolute',
    width: 66,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorParent: {
    left: 4,
    backgroundColor: '#2196F3', // Blue for parent
  },
  indicatorStudent: {
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
  textParent: {
    color: 'white',
  },
  textChild: {
    color: 'white',
  },
});
