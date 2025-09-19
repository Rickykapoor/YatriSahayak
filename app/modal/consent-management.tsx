import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { UserSettings } from '@/types/auth';

interface ConsentSettings {
  locationTracking: boolean;
  dataSharing: boolean;
  analyticsCollection: boolean;
  emergencySharing: boolean;
  thirdPartyIntegration: boolean;
}

const ConsentManagementModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [consents, setConsents] = useState<ConsentSettings>({
    locationTracking: user?.settings?.locationTracking ?? true,
    dataSharing: user?.settings?.dataSharing ?? false,
    analyticsCollection: user?.settings?.analyticsCollection ?? false,
    emergencySharing: user?.settings?.emergencySharing ?? true,
    thirdPartyIntegration: user?.settings?.thirdPartyIntegration ?? false,
  });

  const toggleConsent = useCallback((key: keyof ConsentSettings) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const updatedSettings: UserSettings = {
        ...user?.settings,
        ...consents,
      } as UserSettings;
      
      await updateUser({ settings: updatedSettings });
      Alert.alert('Success', 'Consent preferences updated');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update consent preferences');
    }
  }, [consents, updateUser, user?.settings]);

  const ConsentItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    required = false 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    required?: boolean;
  }) => (
    <View className="py-4 border-b border-primary-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-primary-800">{title}</Text>
            {required && (
              <View className="ml-2 px-2 py-1 bg-danger/10 rounded">
                <Text className="text-xs font-bold text-danger">REQUIRED</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-primary-600 mt-1 leading-5">{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={required}
          trackColor={{ false: '#E7E5E4', true: '#10B981' }}
          thumbColor="white"
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-primary-50">
      <Stack.Screen 
        options={{ 
          title: 'Data Consent',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#F5F5F4' },
          headerTitleStyle: { color: '#44403C' }
        }} 
      />

      <ScrollView className="flex-1 p-4">
        {/* Header Info */}
        <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-checkmark" size={24} color="#B45309" />
            <Text className="text-lg font-semibold text-secondary-800 ml-2">Your Privacy Matters</Text>
          </View>
          <Text className="text-sm text-primary-700 leading-5">
            Manage how your data is collected and used. You can change these settings anytime.
          </Text>
        </View>

        {/* Consent Options */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-primary-800 mb-4">Data Collection Preferences</Text>

          <ConsentItem
            title="Location Tracking"
            description="Allow the app to track your location for safety monitoring and emergency response"
            value={consents.locationTracking}
            onToggle={() => toggleConsent('locationTracking')}
            required={true}
          />

          <ConsentItem
            title="Emergency Data Sharing"
            description="Share your location and trip details with authorities during emergencies"
            value={consents.emergencySharing}
            onToggle={() => toggleConsent('emergencySharing')}
            required={true}
          />

          <ConsentItem
            title="General Data Sharing"
            description="Share anonymized travel patterns to improve safety recommendations for all users"
            value={consents.dataSharing}
            onToggle={() => toggleConsent('dataSharing')}
          />

          <ConsentItem
            title="Analytics Collection"
            description="Allow collection of app usage data to improve features and performance"
            value={consents.analyticsCollection}
            onToggle={() => toggleConsent('analyticsCollection')}
          />

          <ConsentItem
            title="Third-party Integration"
            description="Enable integration with hotel booking, transport, and other travel services"
            value={consents.thirdPartyIntegration}
            onToggle={() => toggleConsent('thirdPartyIntegration')}
          />
        </View>

        {/* Legal Links */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-primary-800 mb-4">Legal Information</Text>
          
          <Pressable className="py-3 border-b border-primary-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-primary-800">Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
            </View>
          </Pressable>

          <Pressable className="py-3 border-b border-primary-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-primary-800">Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
            </View>
          </Pressable>

          <Pressable className="py-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-primary-800">Data Protection Rights</Text>
              <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
            </View>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Pressable
            className="bg-secondary-700 py-4 rounded-xl shadow-lg"
            onPress={handleSave}
          >
            <Text className="text-white text-center text-lg font-semibold">Save Preferences</Text>
          </Pressable>

          <Pressable
            className="py-4 rounded-xl border border-primary-300"
            onPress={() => router.back()}
          >
            <Text className="text-primary-700 text-center text-lg font-medium">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default ConsentManagementModal;
