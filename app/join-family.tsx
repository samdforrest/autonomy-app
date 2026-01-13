import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppMode } from '../contexts/AppModeContext';
import { familyService } from '../services/family-service';

export default function JoinFamily() {
  const router = useRouter();
  const { setFamilyContext } = useAppMode();
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinFamily = async () => {
    if (!familyCode.trim()) {
      Alert.alert('Error', 'Please enter a family code');
      return;
    }

    const code = familyCode.trim().toUpperCase();
    setLoading(true);

    try {
      // Fetch full family data instead of just validating
      const familyData = await familyService.getFamilyData(code);
      
      if (familyData) {
        // Increment login count for this sign-in event
        console.log('🔐 Successful sign-in detected, incrementing login count');
        const newCount = await familyService.incrementLoginCount(code);
        
        // Update local family data to match Firebase
        familyData.settings.loginCount = newCount;
        console.log('📊 Updated local family data with new login count:', newCount);
        
        // Set family context globally - this is what AuthGuard checks
        console.log('🏠 Setting family context after successful join:', code);
        setFamilyContext(code, familyData);
        
        // Navigate to home page after successful authentication
        console.log('✅ Family joined successfully, redirecting to home');
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Family Not Found',
          `The family code "${code}" was not found. Please check the code and try again, or create a new family instead.`,
          [
            { text: 'Try Again', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error joining family:', error);
      Alert.alert('Error', 'Failed to join family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFamilyCode = (text: string) => {
    // Auto-format as XXXX-XXXX
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join Your Family</Text>
        <Text style={styles.subtitle}>
          Enter your family code to access the app
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Family Code</Text>
          <TextInput
            style={styles.input}
            value={familyCode}
            onChangeText={(text) => setFamilyCode(formatFamilyCode(text))}
            placeholder="BEAR-2024"
            autoCapitalize="characters"
            maxLength={9} // XXXX-XXXX format
          />
          
          <Text style={styles.hint}>
            Format: ANIMAL-NUMBERS (e.g., BEAR-2024)
          </Text>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoinFamily}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Checking...' : 'Join Family'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Example Family Codes:</Text>
          <Text style={styles.exampleCode}>LION-3847</Text>
          <Text style={styles.exampleCode}>WOLF-1592</Text>
          <Text style={styles.exampleCode}>BEAR-7429</Text>
        </View>
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
    fontSize: 18,
    marginBottom: 8,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
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
  examples: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  exampleCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 5,
  },
});

