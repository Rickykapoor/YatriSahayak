// app/(auth)/medical-info.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MedicalInfo {
  bloodGroup: string;
  allergies: string;
  medications: string;
  medicalConditions: string;
  emergencyMedicalContact: string;
  emergencyMedicalPhone: string;
  hasInsurance: boolean;
  insuranceProvider: string;
  insuranceNumber: string;
}

const MedicalInfoScreen: React.FC = () => {
  const [medicalData, setMedicalData] = useState<MedicalInfo>({
    bloodGroup: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    emergencyMedicalContact: '',
    emergencyMedicalPhone: '',
    hasInsurance: false,
    insuranceProvider: '',
    insuranceNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [skipMedicalInfo, setSkipMedicalInfo] = useState(false);

  const updateField = useCallback((field: keyof MedicalInfo, value: string | boolean) => {
    setMedicalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(async () => {
    if (skipMedicalInfo) {
      router.push('/(auth)/data-consent');
      return;
    }

    setIsLoading(true);
    try {
      // Save medical data
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(auth)/data-consent');
    } catch (error) {
      Alert.alert('Error', 'Failed to save medical information');
    } finally {
      setIsLoading(false);
    }
  }, [medicalData, skipMedicalInfo]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Medical Information',
      'Medical information can help emergency responders provide better care. Are you sure you want to skip?',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: () => router.push('/(auth)/data-consent') }
      ]
    );
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <Text className="text-xl font-bold text-primary-800">Medical Information</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-1 bg-primary-200 rounded-full h-2 mr-2">
            <View className="w-1/2 bg-secondary-600 h-2 rounded-full" />
          </View>
          <Text className="text-sm text-primary-600 font-medium">Step 9 of 17</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="medical" size={20} color="#3B82F6" />
            <Text className="text-blue-800 font-bold ml-2">Optional but Recommended</Text>
          </View>
          <Text className="text-sm text-blue-700 leading-5">
            This information helps emergency responders provide appropriate medical care. 
            All medical data is encrypted and only shared during genuine emergencies.
          </Text>
        </View>

        {/* Skip Toggle */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-primary-800">Skip Medical Information</Text>
              <Text className="text-sm text-primary-600 mt-1">
                You can add this information later in settings
              </Text>
            </View>
            <Switch
              value={skipMedicalInfo}
              onValueChange={setSkipMedicalInfo}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="white"
            />
          </View>
        </View>

        {!skipMedicalInfo && (
          <>
            {/* Basic Medical Info */}
            <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
              <Text className="text-lg font-bold text-primary-800 mb-4">Basic Information</Text>
              
              <View className="mb-4">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Blood Group</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <Pressable
                      key={group}
                      className={`px-4 py-2 rounded-lg border ${
                        medicalData.bloodGroup === group
                          ? 'bg-red-100 border-red-400'
                          : 'bg-white border-primary-300'
                      }`}
                      onPress={() => updateField('bloodGroup', group)}
                    >
                      <Text className={`font-semibold ${
                        medicalData.bloodGroup === group
                          ? 'text-red-700'
                          : 'text-primary-700'
                      }`}>
                        {group}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Known Allergies</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="e.g., Penicillin, Nuts, Shellfish (separate with commas)"
                  value={medicalData.allergies}
                  onChangeText={(text) => updateField('allergies', text)}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Current Medications</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="List any medications you're currently taking"
                  value={medicalData.medications}
                  onChangeText={(text) => updateField('medications', text)}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Medical Conditions</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="e.g., Diabetes, Asthma, Heart conditions"
                  value={medicalData.medicalConditions}
                  onChangeText={(text) => updateField('medicalConditions', text)}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#A8A29E"
                />
              </View>
            </View>

            {/* Emergency Medical Contact */}
            <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
              <Text className="text-lg font-bold text-primary-800 mb-4">Emergency Medical Contact</Text>
              
              <View className="mb-4">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Doctor/Hospital Name</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="Your family doctor or preferred hospital"
                  value={medicalData.emergencyMedicalContact}
                  onChangeText={(text) => updateField('emergencyMedicalContact', text)}
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Phone Number</Text>
                <View className="flex-row items-center border border-primary-300 rounded-lg bg-white">
                  <Text className="px-4 py-3 text-primary-800 border-r border-primary-300">+91</Text>
                  <TextInput
                    className="flex-1 px-4 py-3 text-base text-primary-800"
                    placeholder="Hospital/clinic phone number"
                    value={medicalData.emergencyMedicalPhone}
                    onChangeText={(text) => updateField('emergencyMedicalPhone', text)}
                    keyboardType="phone-pad"
                    placeholderTextColor="#A8A29E"
                  />
                </View>
              </View>
            </View>

            {/* Insurance Information */}
            <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-primary-800">Health Insurance</Text>
                <Switch
                  value={medicalData.hasInsurance}
                  onValueChange={(value) => updateField('hasInsurance', value)}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor="white"
                />
              </View>

              {medicalData.hasInsurance && (
                <>
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-primary-800 mb-2">Insurance Provider</Text>
                    <TextInput
                      className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                      placeholder="e.g., Star Health, HDFC Ergo, etc."
                      value={medicalData.insuranceProvider}
                      onChangeText={(text) => updateField('insuranceProvider', text)}
                      placeholderTextColor="#A8A29E"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-primary-800 mb-2">Policy/ID Number</Text>
                    <TextInput
                      className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                      placeholder="Insurance policy number"
                      value={medicalData.insuranceNumber}
                      onChangeText={(text) => updateField('insuranceNumber', text)}
                      placeholderTextColor="#A8A29E"
                    />
                  </View>
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="p-4 bg-white border-t border-primary-200">
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 py-4 rounded-xl border border-primary-300"
            onPress={handleSkip}
          >
            <Text className="text-primary-700 text-center text-lg font-semibold">Skip for Now</Text>
          </Pressable>
          
          <Pressable
            className={`flex-1 py-4 rounded-xl shadow-sm ${
              isLoading ? 'bg-primary-400' : 'bg-secondary-700'
            }`}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text className="text-white text-center text-lg font-bold">
              {isLoading ? 'Saving...' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MedicalInfoScreen;
