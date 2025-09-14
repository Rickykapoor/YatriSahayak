// app/(auth)/phone-input.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Country, AuthState } from '../../types/auth';
import { sendOTP,validatePhoneNumber  } from '@/services/authService';
const POPULAR_COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
];

export default function PhoneInputScreen() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    phoneNumber: '',
    countryCode: '+91',
    otp: '',
    isLoading: false,
    error: null,
    otpSent: false,
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>(POPULAR_COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);



  const SendOTP = async () => {
    if (!validatePhoneNumber(authState.phoneNumber)) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Please enter a valid phone number' 
      }));
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await sendOTP(authState.phoneNumber);
      if (!response.success) {
        throw new Error(response.message);
      }
      
      setAuthState(prev => ({ ...prev, otpSent: true, isLoading: false }));
      
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { 
          phoneNumber: `${selectedCountry.dialCode}${authState.phoneNumber}`,
          countryCode: selectedCountry.dialCode 
        }
      });
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to send OTP. Please try again.' 
      }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Login</Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-8">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Enter your phone number
          </Text>
          <Text className="text-gray-600 text-base leading-6">
            We'll send you a verification code to confirm your identity
          </Text>
        </View>

        {/* Country Selector */}
        <TouchableOpacity 
          className="flex-row items-center p-4 border border-gray-300 rounded-xl mb-4"
          onPress={() => setShowCountryPicker(true)}
        >
          <Text className="text-2xl mr-3">{selectedCountry.flag}</Text>
          <Text className="text-base font-medium text-gray-900 mr-2">
            {selectedCountry.name}
          </Text>
          <Text className="text-base text-gray-600 mr-auto">
            {selectedCountry.dialCode}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Phone Input */}
        <View className="mb-6">
          <View className="flex-row items-center border border-gray-300 rounded-xl overflow-hidden">
            <View className="bg-gray-50 px-4 py-4 border-r border-gray-300">
              <Text className="text-base font-medium text-gray-700">
                {selectedCountry.dialCode}
              </Text>
            </View>
            <TextInput
              className="flex-1 px-4 py-4 text-base text-gray-900"
              placeholder="Enter phone number"
              value={authState.phoneNumber}
              onChangeText={(text) => {
                setAuthState(prev => ({ 
                  ...prev, 
                  phoneNumber: text.replace(/[^0-9]/g, ''),
                  error: null 
                }));
              }}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>
          {authState.error && (
            <Text className="text-red-500 text-sm mt-2 px-1">
              {authState.error}
            </Text>
          )}
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl ${
            authState.phoneNumber.length === 10 && !authState.isLoading
              ? 'bg-blue-600' 
              : 'bg-gray-300'
          }`}
          onPress={SendOTP}
          disabled={authState.phoneNumber.length !== 10 || authState.isLoading}
        >
          <Text className={`text-center font-semibold text-base ${
            authState.phoneNumber.length === 10 && !authState.isLoading
              ? 'text-white' 
              : 'text-gray-500'
          }`}>
            {authState.isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text className="text-center text-sm text-gray-500 mt-6 leading-5">
          By continuing, you agree to our{' '}
          <Text className="text-blue-600 underline">Terms of Service</Text>
          {' '}and{' '}
          <Text className="text-blue-600 underline">Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
