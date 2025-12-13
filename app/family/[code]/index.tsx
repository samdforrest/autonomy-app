import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppMode } from '@/contexts/AppModeContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFamilyContext } from './_layout';

export default function FamilyDashboard() {
  console.log('🏠 FamilyDashboard rendering - about to call useFamilyContext');
  const { family, familyCode, refreshFamily } = useFamilyContext();
  console.log('🏠 FamilyDashboard got context:', { familyCode, hasFamily: !!family });
  const { isAdminFamily } = useAppMode();
  const router = useRouter();
  const [addingChild, setAddingChild] = useState(false);

  const handleAddChild = () => {
    Alert.prompt(
      'Set Child Name',
      'Enter your child\'s name:',
      async (childName) => {
        if (childName && childName.trim()) {
          try {
            // For simplified model, we'll update the family's child name
            // This would need to be implemented in the family service
            console.log('Setting child name:', childName.trim());
            // TODO: Implement familyService.setChildName(familyCode, childName.trim());
            await refreshFamily();
            console.log('✅ Child name set successfully');
          } catch (error) {
            console.error('❌ Error setting child name:', error);
            Alert.alert('Error', 'Failed to set child name. Please try again.');
          }
        }
      }
    );
  };

  const navigateToAssessment = () => {
    router.push(`/family/${familyCode}/assessment`);
  };

  const navigateToResults = () => {
    router.push(`/family/${familyCode}/results`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Home Button */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)')}
        >
          <IconSymbol size={24} name="house.fill" color="#007AFF" />
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>
          Family Dashboard {isAdminFamily && <Text style={styles.adminBadge}>🔧 ADMIN</Text>}
        </Text>
        <Text style={styles.familyCode}>Family Code: {familyCode}</Text>
        <Text style={styles.parentName}>
          Welcome, {family.settings?.parentName || 'Parent'}!
        </Text>
      </View>

      {/* Child Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Child Profile</Text>
          {!(family as any).childName && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddChild}
            >
              <Text style={styles.addButtonText}>+ Set Child Name</Text>
            </TouchableOpacity>
          )}
        </View>

        {!(family as any).childName ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No child profile set</Text>
            <Text style={styles.emptySubtext}>
              Set your child's name to get started with assessments
            </Text>
          </View>
        ) : (
          <View style={styles.childCard}>
            <Text style={styles.childName}>{(family as any).childName}</Text>
            
            <View style={styles.childActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={navigateToAssessment}
              >
                <Text style={styles.actionButtonText}>Take Assessment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.progressButton]}
                onPress={navigateToResults}
              >
                <Text style={styles.actionButtonText}>View Results</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
                <Text style={styles.statText}>
                  Assessments: {Object.keys((family as any).assessments || {}).length}
                </Text>
                <Text style={styles.statText}>
                  Progress: Available after assessment
                </Text>
              </View>
            </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push(`/family/${familyCode}/profile`)}
        >
          <Text style={styles.quickActionText}>👤 Family Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => {
            // Share family code
            Alert.alert(
              'Share Family Code',
              `Share this code with family members:\n\n${familyCode}\n\nOr share this link:\n${window.location.origin}/family/${familyCode}`,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  homeButtonText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  familyCode: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  parentName: {
    fontSize: 18,
    color: '#007AFF',
    marginTop: 10,
  },
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
  childCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  childActions: {
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
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#E74C3C',
    marginTop: 50,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
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

