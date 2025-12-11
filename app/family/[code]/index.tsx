import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { familyService } from '../../../services/family-service';
import { useFamilyContext } from './_layout';

export default function FamilyDashboard() {
  console.log('🏠 FamilyDashboard rendering - about to call useFamilyContext');
  const { family, familyCode, refreshFamily } = useFamilyContext();
  console.log('🏠 FamilyDashboard got context:', { familyCode, hasFamily: !!family });
  const router = useRouter();
  const [addingChild, setAddingChild] = useState(false);

  const children = Object.entries(family.children || {});

  const handleAddChild = () => {
    Alert.prompt(
      'Add Child',
      'Enter your child\'s name:',
      async (childName) => {
        if (childName && childName.trim()) {
          try {
            await familyService.addChild(familyCode, childName.trim());
            await refreshFamily();
            console.log('✅ Child added successfully');
          } catch (error) {
            console.error('❌ Error adding child:', error);
            Alert.alert('Error', 'Failed to add child. Please try again.');
          }
        }
      }
    );
  };

  const navigateToAssessment = (childId: string) => {
    router.push(`/family/${familyCode}/child/${childId}/assessment`);
  };

  const navigateToProgress = (childId: string) => {
    router.push(`/family/${familyCode}/child/${childId}/progress`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Family Dashboard</Text>
        <Text style={styles.familyCode}>Family Code: {familyCode}</Text>
        <Text style={styles.parentName}>
          Welcome, {family.settings?.parentName || 'Parent'}!
        </Text>
      </View>

      {/* Children Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Children</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddChild}
          >
            <Text style={styles.addButtonText}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Child" to get started with assessments
            </Text>
          </View>
        ) : (
          children.map(([childId, childData]) => (
            <View key={childId} style={styles.childCard}>
              <Text style={styles.childName}>{childData.name}</Text>
              
              <View style={styles.childActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigateToAssessment(childId)}
                >
                  <Text style={styles.actionButtonText}>Assessment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.progressButton]}
                  onPress={() => navigateToProgress(childId)}
                >
                  <Text style={styles.actionButtonText}>Progress</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <Text style={styles.statText}>
                  Assessments: {Object.keys(childData.assessments || {}).length}
                </Text>
                <Text style={styles.statText}>
                  Modules: {Object.keys(childData.progress || {}).length}
                </Text>
              </View>
            </View>
          ))
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
});

