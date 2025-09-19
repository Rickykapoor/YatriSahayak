// app/(auth)/security-setup.tsx
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
import * as LocalAuthentication from 'expo-local-authentication';

interface SecuritySettings {
  useAppLock: boolean;
  appLockType: 'pin' | 'biometric' | 'both';
  pin: string;
  confirmPin: string;
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;
  enable2FA: boolean;
  emergencyBypass: boolean;
}

const SecuritySetupScreen: React.FC = () => {
  const [securityData, setSecurityData] = useState<SecuritySettings>({
    useAppLock: true,
    appLockType: 'pin',
    pin: '',
    confirmPin: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    enable2FA: false,
    emergencyBypass: true,
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const updateField = useCallback((field: keyof SecuritySettings, value: string | boolean) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateSecurity = (): boolean => {
    if (securityData.useAppLock) {
      if (securityData.appLockType === 'pin' || securityData.appLockType === 'both') {
        if (!securityData.pin || securityData.pin.length < 4) {
          Alert.alert('Error', 'Please enter a PIN with at least 4 digits');
          return false;
        }
        if (securityData.pin !== securityData.confirmPin) {
          Alert.alert('Error', 'PINs do not match');
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = useCallback(async () => {
    if (!validateSecurity()) return;

    setIsLoading(true);
    try {
      // Save security settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(app)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save security settings');
    } finally {
      setIsLoading(false);
    }
  }, [securityData]);

  const testBiometric = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Test biometric authentication',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });
      
      if (result.success) {
        Alert.alert('Success', 'Biometric authentication works perfectly!');
      } else {
        Alert.alert('Authentication Failed', 'Please try again or use PIN instead');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric test failed');
    }
  }, []);

  const securityQuestions = [
    'What was the name of your first pet?',
    'What city were you born in?',
    'What was your mother\'s maiden name?',
    'What was the name of your first school?',
    'What was your childhood nickname?',
    'In what city did you meet your spouse?',
    'What was your favorite food as a child?',
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <Text className="text-xl font-bold text-primary-800">Security Setup</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-1 bg-primary-200 rounded-full h-2 mr-2">
            <View className="w-4/5 bg-secondary-600 h-2 rounded-full" />
          </View>
          <Text className="text-sm text-primary-600 font-medium">Step 12 of 17</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Security Info */}
        <View className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            <Text className="text-lg font-bold text-blue-800 ml-2">Secure Your Account</Text>
          </View>
          <Text className="text-sm text-blue-700 leading-5">
            Set up additional security layers to protect your digital tourist identity and personal information.
          </Text>
        </View>

        {/* App Lock Settings */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-bold text-primary-800">App Lock</Text>
              <Text className="text-sm text-primary-600 mt-1">
                Secure the app with PIN or biometric authentication
              </Text>
            </View>
            <Switch
              value={securityData.useAppLock}
              onValueChange={(value) => updateField('useAppLock', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="white"
            />
          </View>

          {securityData.useAppLock && (
            <>
              {/* Lock Type Selection */}
              <Text className="text-base font-semibold text-primary-800 mb-3">Authentication Method</Text>
              <View className="flex-row gap-2 mb-4">
                <Pressable
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    securityData.appLockType === 'pin' 
                      ? 'bg-secondary-100 border-secondary-400' 
                      : 'bg-white border-primary-300'
                  }`}
                  onPress={() => updateField('appLockType', 'pin')}
                >
                  <View className="items-center">
                    <Ionicons name="keypad" size={20} color="#B45309" />
                    <Text className={`text-sm font-medium mt-1 ${
                      securityData.appLockType === 'pin' 
                        ? 'text-secondary-800' 
                        : 'text-primary-700'
                    }`}>
                      PIN Only
                    </Text>
                  </View>
                </Pressable>

                {biometricAvailable && (
                  <>
                    <Pressable
                      className={`flex-1 py-3 px-4 rounded-lg border ${
                        securityData.appLockType === 'biometric' 
                          ? 'bg-secondary-100 border-secondary-400' 
                          : 'bg-white border-primary-300'
                      }`}
                      onPress={() => updateField('appLockType', 'biometric')}
                    >
                      <View className="items-center">
                        <Ionicons name="finger-print" size={20} color="#B45309" />
                        <Text className={`text-sm font-medium mt-1 ${
                          securityData.appLockType === 'biometric' 
                            ? 'text-secondary-800' 
                            : 'text-primary-700'
                        }`}>
                          Biometric
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      className={`flex-1 py-3 px-4 rounded-lg border ${
                        securityData.appLockType === 'both' 
                          ? 'bg-secondary-100 border-secondary-400' 
                          : 'bg-white border-primary-300'
                      }`}
                      onPress={() => updateField('appLockType', 'both')}
                    >
                      <View className="items-center">
                        <Ionicons name="shield" size={20} color="#B45309" />
                        <Text className={`text-sm font-medium mt-1 ${
                          securityData.appLockType === 'both' 
                            ? 'text-secondary-800' 
                            : 'text-primary-700'
                        }`}>
                          Both
                        </Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>

              {/* PIN Setup */}
              {(securityData.appLockType === 'pin' || securityData.appLockType === 'both') && (
                <>
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-primary-800 mb-2">Create PIN</Text>
                    <TextInput
                      className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white text-center text-lg font-mono"
                      placeholder="Enter 4-6 digit PIN"
                      value={securityData.pin}
                      onChangeText={(text) => updateField('pin', text)}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={6}
                      placeholderTextColor="#A8A29E"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-primary-800 mb-2">Confirm PIN</Text>
                    <TextInput
                      className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white text-center text-lg font-mono"
                      placeholder="Re-enter PIN"
                      value={securityData.confirmPin}
                      onChangeText={(text) => updateField('confirmPin', text)}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={6}
                      placeholderTextColor="#A8A29E"
                    />
                  </View>
                </>
              )}

              {/* Biometric Test */}
              {biometricAvailable && (securityData.appLockType === 'biometric' || securityData.appLockType === 'both') && (
                <Pressable 
                  className="bg-secondary-100 border border-secondary-300 p-3 rounded-lg mb-4 flex-row items-center justify-center"
                  onPress={testBiometric}
                >
                  <Ionicons name="finger-print" size={20} color="#B45309" />
                  <Text className="text-secondary-700 font-semibold ml-2">Test Biometric Authentication</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Security Questions */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-bold text-primary-800 mb-4">Security Questions</Text>
          <Text className="text-sm text-primary-600 mb-4">
            Used for account recovery if you forget your PIN or lose biometric access
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-primary-800 mb-2">Question 1</Text>
            <View className="mb-2">
              <Pressable className="border border-primary-300 rounded-lg px-4 py-3 bg-white">
                <Text className="text-base text-primary-800">
                  {securityData.securityQuestion1 || 'Select a security question'}
                </Text>
              </Pressable>
            </View>
            <TextInput
              className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
              placeholder="Your answer"
              value={securityData.securityAnswer1}
              onChangeText={(text) => updateField('securityAnswer1', text)}
              placeholderTextColor="#A8A29E"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-primary-800 mb-2">Question 2</Text>
            <View className="mb-2">
              <Pressable className="border border-primary-300 rounded-lg px-4 py-3 bg-white">
                <Text className="text-base text-primary-800">
                  {securityData.securityQuestion2 || 'Select a security question'}
                </Text>
              </Pressable>
            </View>
            <TextInput
              className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
              placeholder="Your answer"
              value={securityData.securityAnswer2}
              onChangeText={(text) => updateField('securityAnswer2', text)}
              placeholderTextColor="#A8A29E"
            />
          </View>
        </View>

        {/* Additional Security Options */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-bold text-primary-800 mb-4">Additional Security</Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-primary-800">Two-Factor Authentication</Text>
              <Text className="text-sm text-primary-600 mt-1">
                Receive SMS codes for additional account security
              </Text>
            </View>
            <Switch
              value={securityData.enable2FA}
              onValueChange={(value) => updateField('enable2FA', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="white"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-primary-800">Emergency Bypass</Text>
              <Text className="text-sm text-primary-600 mt-1">
                Allow emergency contacts to bypass app lock during emergencies
              </Text>
            </View>
            <Switch
              value={securityData.emergencyBypass}
              onValueChange={(value) => updateField('emergencyBypass', value)}
              trackColor={{ false: '#E5E5EA', true: '#EF4444' }}
              thumbColor="white"
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
            {isLoading ? 'Setting Up Security...' : 'Complete Setup'}
          </Text>
        </Pressable>
        
        <Text className="text-center text-xs text-primary-500 mt-2">
          Your security settings can be changed later in the app settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SecuritySetupScreen;
