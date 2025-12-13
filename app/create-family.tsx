import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { familyService } from '../services/family-service';

export default function CreateFamily() {
  const router = useRouter();
  const [parentName, setParentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateFamily = async () => {
    if (!parentName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const familyCode = await familyService.createFamily(parentName.trim());
      
      Alert.alert(
        'Family Created!',
        `Your family code is: ${familyCode}\n\nSave this code - you'll need it to access your family dashboard.`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace(`/family/${familyCode}`)
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating family:', error);
      Alert.alert('Error', 'Failed to create family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Family</Text>
        <Text style={styles.subtitle}>
          Get started with personalized learning assessments for your children
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Parent/Guardian Name</Text>
          <TextInput
            style={styles.input}
            value={parentName}
            onChangeText={setParentName}
            placeholder="Enter your name"
            autoCapitalize="words"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateFamily}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Family'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            • You'll get a unique family code{'\n'}
            • Add your children to the family{'\n'}
            • Start personalized assessments{'\n'}
            • Track learning progress
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/join-family')}
        >
          <Text style={styles.linkText}>
            Already have a family code? Join existing family
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#e8f4fd',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

