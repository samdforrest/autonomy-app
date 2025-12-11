import { Slot, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { FamilyData, familyService } from '../../../services/family-service';

export default function FamilyLayout() {
  return <FamilyLayoutContent />;
}

function FamilyLayoutContent() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 FamilyLayoutContent rendering with code:', code);

  useEffect(() => {
    if (!code) {
      setError('No family code provided');
      setLoading(false);
      return;
    }

    loadFamily();
  }, [code]);

  const loadFamily = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const familyData = await familyService.getFamilyData(code as string);
      
      if (familyData) {
        setFamily(familyData);
        console.log('✅ Loaded family:', code);
      } else {
        setError(`Family "${code}" not found. Please check your family code.`);
      }
    } catch (err) {
      console.error('❌ Error loading family:', err);
      setError('Failed to load family data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading family data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
          {error}
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          Make sure you have the correct family code and try again.
        </Text>
      </View>
    );
  }

  if (!family) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No family data available</Text>
      </View>
    );
  }

  // Provide family context to children
  console.log('🎯 Rendering FamilyProvider with family:', family?.familyCode);
  return (
    <FamilyProvider family={family} familyCode={code as string}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </FamilyProvider>
  );
}

// Family Context Provider
import React, { createContext, useContext } from 'react';

interface FamilyContextType {
  family: FamilyData;
  familyCode: string;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

function FamilyProvider({ 
  children, 
  family: initialFamily, 
  familyCode 
}: { 
  children: React.ReactNode;
  family: FamilyData;
  familyCode: string;
}) {
  const [family, setFamily] = useState<FamilyData>(initialFamily);

  const refreshFamily = async () => {
    try {
      // Reload family data
      const updatedFamily = await familyService.getFamilyData(familyCode);
      if (updatedFamily) {
        setFamily(updatedFamily);
        console.log('🔄 Family data refreshed');
      }
    } catch (error) {
      console.error('❌ Error refreshing family data:', error);
    }
  };

  const contextValue: FamilyContextType = {
    family,
    familyCode,
    refreshFamily
  };

  return (
    <FamilyContext.Provider value={contextValue}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext(): FamilyContextType {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
}
