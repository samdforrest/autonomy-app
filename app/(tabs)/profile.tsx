import { FamilyCompletionDashboard } from '@/components/FamilyCompletionDashboard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppMode } from '@/contexts/AppModeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { userMode, switchMode, isInFamilyMode, currentFamily, currentFamilyCode, isAdminFamily } = useAppMode();
  const router = useRouter();
  // Student-related state removed for now

  const handleModeToggle = () => {
    switchMode(userMode === 'parent' ? 'student' : 'parent');
  };

  // Student profile functions removed for now

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.profileIconContainer}>
          <IconSymbol size={80} name="person.fill" color="#666" />
        </View>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          {isInFamilyMode ? `Family: ${currentFamilyCode}` : 'Manage your learning journey'}
        </ThemedText>
        
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
      
      {/* Family Dashboard Content - Only show when in family mode */}
      {isInFamilyMode && currentFamily ? (
        <View>
          {/* Family Welcome Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Family Dashboard {isAdminFamily && <Text style={styles.adminBadge}>🔧 ADMIN</Text>}
            </Text>
            <Text style={styles.parentName}>
              Welcome, {currentFamily.settings?.parentName || 'Parent'}!
            </Text>
          </View>

          {/* Student Profile Section - Temporarily removed */}

          {/* Module Completion Dashboard */}
          <FamilyCompletionDashboard />

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                // Share family code
                Alert.alert(
                  'Share Family Code',
                  `Share this code with family members:\n\n${currentFamilyCode}\n\nOr share this link:\n${window.location.origin}/family/${currentFamilyCode}`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.quickActionText}>🔗 Share Family Code</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Section - Only visible to admin families */}
          {isAdminFamily && (
            <View style={[styles.section, styles.adminSection]}>
              <Text style={[styles.sectionTitle, styles.adminTitle]}>
                🔧 Admin Controls
              </Text>
              <Text style={styles.sectionSubtitle}>
                Administrative functions for managing the platform
              </Text>
              
              <TouchableOpacity 
                style={[styles.familyButton, styles.adminButton]}
                onPress={() => router.push('/create-family')}
              >
                <Text style={[styles.familyButtonText, styles.adminButtonText]}>
                  🆕 Create New Family (Admin)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Family Access Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Family Access</Text>
            <Text style={styles.sectionSubtitle}>
              Invite others to join your family or switch between families
            </Text>
            
            <View style={styles.familyButtons}>
              <TouchableOpacity 
                style={[styles.familyButton, styles.familyButtonSecondary]}
                onPress={() => router.push('/join-family')}
              >
                <Text style={[styles.familyButtonText, styles.familyButtonTextSecondary]}>
                  🔗 Join Different Family
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Default Profile Content - Show when not in family mode */
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
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  modeToggleChild: {
    backgroundColor: '#FFF3E0', // Light orange for student
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
  indicatorChild: {
    right: 4,
    backgroundColor: '#FF9800', // Orange for student
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
  // Family Dashboard Styles
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  parentName: {
    fontSize: 18,
    color: '#007AFF',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  progressButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  quickAction: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 16,
    color: '#333',
  },
  // Family Access styles
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  familyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  familyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  familyButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  familyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  familyButtonTextSecondary: {
    color: '#007AFF',
  },
  // Admin-specific styles
  adminSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    backgroundColor: '#FFF8F5',
  },
  adminTitle: {
    color: '#FF6B35',
  },
  adminButton: {
    backgroundColor: '#FF6B35',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  adminBadge: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});
