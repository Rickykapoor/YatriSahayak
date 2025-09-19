import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthState } from '@/types/auth';
import { sendOTP, validatePhoneNumber } from '@/services/authService';

export default function PhoneInput() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    phoneNumber: '',
    countryCode: '+91',
    otp: '',
    isLoading: false,
    error: null,
    otpSent: false,
  });

  const SendOTP = async () => {
    router.push({
      pathname: '/(auth)/otp-verification',
      params: {
        phoneNumber: authState.phoneNumber,
      }
    });
  };

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setAuthState(prev => ({ ...prev, phoneNumber: numericText, error: null }));
    }
  };

  const isValid = authState.phoneNumber.length === 10 && validatePhoneNumber(authState.phoneNumber);

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F4" />
      
      {/* Header with App Branding */}
      <View className="bg-primary-100 px-6 pt-5 pb-8">
        <View className="items-center mb-6">
          {/* App Logo */}
          <View className="w-72 h-20 rounded-3xl justify-center items-center mb-3">
            <Image 
              source={require('@/assets/images/Logo_text.png')} 
              style={{ width: 270, height: 180 }} 
              resizeMode="contain"
            />
          </View>
          
          <Text className="text-primary-600 text-sm text-center font-medium">
            Digital Tourist Identity & Security Platform
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-primary-800 text-2xl font-bold mb-2 tracking-tight">
            Enter Phone Number
          </Text>
          <Text className="text-primary-600 text-base text-center leading-6 font-medium">
            We'll send a verification code to your Indian mobile number
          </Text>
        </View>
      </View>

      {/* Main Content Container */}
      <View className="flex-1 bg-primary-50 rounded-t-3xl shadow-sm">
        <View className="pt-3 pb-2 items-center">
          <View className="w-10 h-1 rounded-full bg-primary-300" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Country code display */}
          <View className="flex-row items-center bg-secondary-50 rounded-xl border border-secondary-200 p-4 mb-6 shadow-sm">
            <Text className="text-2xl mr-3">🇮🇳</Text>
            <Text className="text-base font-semibold text-primary-800 mr-2">India</Text>
            <Text className="text-base text-secondary-700 font-bold">+91</Text>
          </View>

          {/* Phone input */}
          <View className="mb-6">
            <Text className="text-primary-700 font-semibold mb-2">Phone Number</Text>
            <View className="flex-row border border-primary-300 rounded-xl overflow-hidden bg-white shadow-sm">
              <View className="bg-secondary-50 px-4 py-4 border-r border-primary-300">
                <Text className="text-secondary-700 font-bold">+91</Text>
              </View>
              <TextInput
                className="flex-1 px-4 py-4 text-base text-primary-800"
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                maxLength={10}
                value={authState.phoneNumber}
                onChangeText={handlePhoneChange}
                autoFocus
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
              {isValid && (
                <View className="justify-center pr-3">
                  <Ionicons name="checkmark-circle" size={20} color="#B45309" />
                </View>
              )}
            </View>
            {authState.error && (
              <Text className="text-danger mt-2 px-1 text-sm">{authState.error}</Text>
            )}
          </View>

          {/* Preview */}
          {authState.phoneNumber.length > 0 && (
            <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-xl mb-6 shadow-sm">
              <Text className="text-secondary-800 font-semibold text-sm mb-1">OTP will be sent to</Text>
              <Text className="text-secondary-700 text-base font-bold">+91 {authState.phoneNumber}</Text>
            </View>
          )}

          {/* Info box */}
          <View className="bg-white border border-primary-200 rounded-xl p-4 mb-6 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={18} color="#B45309" />
              <Text className="ml-2 font-semibold text-primary-700">Secure Verification</Text>
            </View>
            <Text className="text-primary-600 text-sm leading-5">
              Your phone number is used only for secure login and emergency services. We never share your personal information.
            </Text>
          </View>
        </ScrollView>

        {/* Continue button + terms */}
        <View className="p-6 bg-white border-t border-primary-200">
          <TouchableOpacity
            disabled={!isValid || authState.isLoading}
            onPress={SendOTP}
            className={`rounded-xl py-4 items-center shadow-lg ${
              isValid && !authState.isLoading ? 'bg-secondary-700' : 'bg-primary-300'
            }`}
            style={{
              shadowColor: isValid && !authState.isLoading ? '#B45309' : 'transparent',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isValid && !authState.isLoading ? 0.2 : 0,
              shadowRadius: 8,
              elevation: isValid && !authState.isLoading ? 5 : 0,
            }}
          >
            <Text className={`text-lg font-bold ${
              isValid && !authState.isLoading ? 'text-white' : 'text-primary-500'
            }`}>
              {authState.isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
          
          <Text className="mt-4 text-center text-xs text-primary-500 leading-4">
            By continuing, you agree to our{' '}
            <Text className="underline text-secondary-700 font-medium">Terms of Service</Text> and{' '}
            <Text className="underline text-secondary-700 font-medium">Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
