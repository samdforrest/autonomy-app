import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.profileIconContainer}>
          <IconSymbol size={80} name="person.fill" color="#666" />
        </View>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your learning journey</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText style={styles.comingSoon}>
          Profile features coming soon!
        </ThemedText>
        <ThemedText style={styles.description}>
          Here you'll be able to:
          {'\n'}• Switch between parent and child profiles
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
});
