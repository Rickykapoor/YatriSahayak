// app/(auth)/personal-info.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PersonalDetailsForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const PersonalInfoScreen: React.FC = () => {
  const [formData, setFormData] = useState<PersonalDetailsForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = useCallback((field: keyof PersonalDetailsForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!formData.dateOfBirth) {
      Alert.alert('Error', 'Please enter your date of birth');
      return false;
    }
    if (!formData.gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    return true;
  };

  const handleNext = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Save form data to context/storage
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/(auth)/emergency-contacts');
    } catch (error) {
      Alert.alert('Error', 'Failed to save information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <Text className="text-xl font-bold text-primary-800">Personal Details</Text>
        </View>
        
        {/* Progress Bar */}
        <View className="flex-row items-center">
          <View className="flex-1 bg-primary-200 rounded-full h-2 mr-2">
            <View className="w-1/4 bg-secondary-600 h-2 rounded-full" />
          </View>
          <Text className="text-sm text-primary-600 font-medium">Step 4 of 17</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 p-4">
          {/* Info Card */}
          <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-xl mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#B45309" />
              <Text className="text-secondary-800 font-semibold ml-2">Important</Text>
            </View>
            <Text className="text-sm text-primary-700 leading-5">
              Please enter your details exactly as they appear on your government-issued ID document. 
              This information will be used for verification purposes.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
            {/* Name Fields */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary-800 mb-2">First Name *</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  placeholderTextColor="#A8A29E"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary-800 mb-2">Last Name *</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  placeholderTextColor="#A8A29E"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-primary-800 mb-2">Email Address *</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                placeholder="your.email@example.com"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#A8A29E"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-primary-800 mb-2">Phone Number *</Text>
              <View className="flex-row items-center border border-primary-300 rounded-lg bg-white">
                <Text className="px-4 py-3 text-primary-800 border-r border-primary-300">+91</Text>
                <TextInput
                  className="flex-1 px-4 py-3 text-base text-primary-800"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#A8A29E"
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-primary-800 mb-2">Date of Birth *</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                placeholder="DD/MM/YYYY"
                value={formData.dateOfBirth}
                onChangeText={(text) => updateField('dateOfBirth', text)}
                keyboardType="numeric"
                placeholderTextColor="#A8A29E"
              />
            </View>

            {/* Gender Selection */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-primary-800 mb-2">Gender *</Text>
              <View className="flex-row gap-2">
                {['male', 'female', 'other'].map((gender) => (
                  <Pressable
                    key={gender}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      formData.gender === gender 
                        ? 'bg-secondary-100 border-secondary-400' 
                        : 'bg-white border-primary-300'
                    }`}
                    onPress={() => updateField('gender', gender)}
                  >
                    <Text className={`text-center font-medium capitalize ${
                      formData.gender === gender 
                        ? 'text-secondary-800' 
                        : 'text-primary-700'
                    }`}>
                      {gender}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Address Section */}
          <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
            <Text className="text-lg font-bold text-primary-800 mb-4">Address Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-semibold text-primary-800 mb-2">Street Address</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                placeholder="House no., Street, Area"
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                multiline
                numberOfLines={2}
                placeholderTextColor="#A8A29E"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary-800 mb-2">City</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(text) => updateField('city', text)}
                  placeholderTextColor="#A8A29E"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary-800 mb-2">State</Text>
                <TextInput
                  className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(text) => updateField('state', text)}
                  placeholderTextColor="#A8A29E"
                />
              </View>
            </View>

            <View className="w-1/2">
              <Text className="text-sm font-semibold text-primary-800 mb-2">PIN Code</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                placeholder="400001"
                value={formData.pincode}
                onChangeText={(text) => updateField('pincode', text)}
                keyboardType="numeric"
                maxLength={6}
                placeholderTextColor="#A8A29E"
              />
            </View>
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
              {isLoading ? 'Saving...' : 'Continue'}
            </Text>
          </Pressable>
          
          <Text className="text-center text-xs text-primary-500 mt-2">
            Fields marked with * are required
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PersonalInfoScreen;
