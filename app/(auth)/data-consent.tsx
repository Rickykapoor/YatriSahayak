// app/(auth)/data-consent.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ConsentSettings {
  locationTracking: boolean;
  emergencyDataSharing: boolean;
  analyticsCollection: boolean;
  thirdPartySharing: boolean;
  marketingCommunications: boolean;
  governmentDataSharing: boolean;
  dataRetention: boolean;
}

const DataConsentScreen: React.FC = () => {
  const [consents, setConsents] = useState<ConsentSettings>({
    locationTracking: true, // Required
    emergencyDataSharing: true, // Required
    analyticsCollection: false,
    thirdPartySharing: false,
    marketingCommunications: false,
    governmentDataSharing: true, // Required for tourist verification
    dataRetention: true, // Required
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleConsent = useCallback((key: keyof ConsentSettings) => {
    // Prevent toggling required consents
    const requiredConsents = ['locationTracking', 'emergencyDataSharing', 'governmentDataSharing', 'dataRetention'];
    if (requiredConsents.includes(key)) {
      Alert.alert(
        'Required Consent',
        'This consent is required for the app to function properly and ensure your safety.'
      );
      return;
    }

    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    try {
      // Save consent settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(auth)/system-permissions');
    } catch (error) {
      Alert.alert('Error', 'Failed to save consent preferences');
    } finally {
      setIsLoading(false);
    }
  }, [consents]);

  const ConsentItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    required = false,
    icon
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    required?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row flex-1 mr-4">
          <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
            required ? 'bg-red-100' : 'bg-secondary-100'
          }`}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={required ? "#EF4444" : "#B45309"} 
            />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-primary-800">{title}</Text>
              {required && (
                <View className="ml-2 px-2 py-1 bg-red-100 rounded">
                  <Text className="text-xs font-bold text-red-700">REQUIRED</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-primary-600 leading-5">{description}</Text>
          </View>
        </View>
        
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={required}
          trackColor={{ false: '#E5E5EA', true: required ? '#EF4444' : '#34C759' }}
          thumbColor="white"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <Text className="text-xl font-bold text-primary-800">Data Consent & Privacy</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-1 bg-primary-200 rounded-full h-2 mr-2">
            <View className="w-3/5 bg-secondary-600 h-2 rounded-full" />
          </View>
          <Text className="text-sm text-primary-600 font-medium">Step 10 of 17</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Privacy Header */}
        <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield-checkmark" size={24} color="#B45309" />
            <Text className="text-lg font-bold text-secondary-800 ml-2">Your Privacy Matters</Text>
          </View>
          <Text className="text-sm text-primary-700 leading-5 mb-3">
            YatriSahayak is committed to protecting your privacy. You have control over how your data is used. 
            Some permissions are required for safety features, while others are optional.
          </Text>
          
          <View className="flex-row items-center">
            <Ionicons name="lock-closed" size={16} color="#10B981" />
            <Text className="text-sm font-semibold text-success ml-2">End-to-end encrypted</Text>
          </View>
        </View>

        {/* Required Consents */}
        <Text className="text-lg font-bold text-primary-800 mb-4">Required for Safety</Text>
        
        <ConsentItem
          title="Location Tracking"
          description="Essential for emergency response, geofencing alerts, and checkpoint verification. Your location is only shared during emergencies or when checking in."
          value={consents.locationTracking}
          onToggle={() => toggleConsent('locationTracking')}
          required={true}
          icon="location"
        />

        <ConsentItem
          title="Emergency Data Sharing"
          description="Automatically share your location and profile with emergency services and designated contacts during emergencies. Critical for your safety."
          value={consents.emergencyDataSharing}
          onToggle={() => toggleConsent('emergencyDataSharing')}
          required={true}
          icon="medical"
        />

        <ConsentItem
          title="Government Verification"
          description="Share identity information with government databases for tourist ID verification. Required for digital identity creation and checkpoint access."
          value={consents.governmentDataSharing}
          onToggle={() => toggleConsent('governmentDataSharing')}
          required={true}
          icon="document-text"
        />

        <ConsentItem
          title="Data Retention"
          description="Store your profile and trip history for account functionality. Data is deleted when you close your account."
          value={consents.dataRetention}
          onToggle={() => toggleConsent('dataRetention')}
          required={true}
          icon="server"
        />

        {/* Optional Consents */}
        <Text className="text-lg font-bold text-primary-800 mt-6 mb-4">Optional Features</Text>
        
        <ConsentItem
          title="Anonymous Analytics"
          description="Help improve the app by sharing anonymous usage patterns. No personal information is included in analytics data."
          value={consents.analyticsCollection}
          onToggle={() => toggleConsent('analyticsCollection')}
          icon="analytics"
        />

        <ConsentItem
          title="Third-party Services"
          description="Share anonymized data with tourism partners for better recommendations and services. You can disable this anytime."
          value={consents.thirdPartySharing}
          onToggle={() => toggleConsent('thirdPartySharing')}
          icon="business"
        />

        <ConsentItem
          title="Marketing Communications"
          description="Receive newsletters, travel tips, and promotional offers via email or SMS. You can unsubscribe anytime."
          value={consents.marketingCommunications}
          onToggle={() => toggleConsent('marketingCommunications')}
          icon="mail"
        />

        {/* Legal Links */}
        <View className="bg-white p-4 rounded-xl mt-4 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-primary-800 mb-3">Legal Information</Text>
          
          <Pressable className="flex-row items-center justify-between py-3 border-b border-primary-100">
            <Text className="text-sm text-primary-700">Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#A8A29E" />
          </Pressable>
          
          <Pressable className="flex-row items-center justify-between py-3 border-b border-primary-100">
            <Text className="text-sm text-primary-700">Terms of Service</Text>
            <Ionicons name="open-outline" size={16} color="#A8A29E" />
          </Pressable>
          
          <Pressable className="flex-row items-center justify-between py-3">
            <Text className="text-sm text-primary-700">Data Protection Rights</Text>
            <Ionicons name="open-outline" size={16} color="#A8A29E" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="p-4 bg-white border-t border-primary-200">
        <Pressable
          className={`py-4 rounded-xl shadow-sm ${
            isLoading ? 'bg-primary-400' : 'bg-secondary-700'
          }`}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text className="text-white text-center text-lg font-bold">
            {isLoading ? 'Saving Preferences...' : 'Accept & Continue'}
          </Text>
        </Pressable>
        
        <Text className="text-center text-xs text-primary-500 mt-2">
          You can modify these settings anytime in your profile
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default DataConsentScreen;
