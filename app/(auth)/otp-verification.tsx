import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  Vibration,
  Alert,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { resendOTP } from '@/services/authService';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const { loginWithPhone, isLoading: authLoading } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_LENGTH = 6;
  const inputRef = useRef<TextInput | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  // Timer logic for resend
  useEffect(() => {
    if (timer > 0 && !canResend) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            timerRef.current && clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [timer, canResend]);

  // Handle OTP change
  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, MAX_LENGTH);
    setOtp(digits);

    if (digits.length === MAX_LENGTH) {
      Keyboard.dismiss();
      verifyOTP(digits);
    }
  };

  // Verify OTP
  const verifyOTP = async (code: string) => {
    if (code.length !== MAX_LENGTH) {
      setError('Please enter the complete 6-digit OTP.');
      Platform.OS === 'ios'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : Vibration.vibrate(200);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await loginWithPhone(phoneNumber, code);
      Platform.OS === 'ios'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : null;
      Alert.alert('Success', 'Phone number verified successfully!', [
        { text: 'Continue', onPress: () => router.replace('/(auth)/registration/personal-info') },
      ]);
    } catch (e) {
      Platform.OS === 'ios'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : Vibration.vibrate([100, 50, 100]);
      setError(e instanceof Error ? e.message : 'Invalid OTP. Please try again.');
      setOtp('');
      setTimeout(() => inputRef.current?.focus(), 200);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      const res = await resendOTP(phoneNumber);
      if (!res.success) throw new Error(res.message || 'Failed to resend OTP');
      setTimer(30);
      setCanResend(false);
      setOtp('');
      Platform.OS === 'ios'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : null;
      Alert.alert('Success', 'A new OTP has been sent.');
      setTimeout(() => inputRef.current?.focus(), 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend OTP. Please try again.');
      Platform.OS === 'ios'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : null;
    } finally {
      setIsResending(false);
    }
  };

  const isProcessing = isLoading || authLoading;
  const isComplete = otp.length === MAX_LENGTH && !isProcessing;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className="flex-1 bg-primary-100">
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F4" />
        
        {/* Header with App Branding */}
        <View className="bg-primary-100 px-6 pt-5 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 items-center justify-center rounded-full bg-primary-200 border border-primary-300"
            >
              <Ionicons name="arrow-back" size={20} color="#57534E" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setOtp('')} 
              className="w-10 h-10 items-center justify-center rounded-full bg-primary-200 border border-primary-300"
            >
              <Ionicons name="refresh" size={16} color="#57534E" />
            </TouchableOpacity>
          </View>

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
              Enter Verification Code
            </Text>
            <Text className="text-primary-600 text-base text-center leading-6 font-medium">
              We sent a 6-digit code to <Text className="font-bold text-secondary-700">+91 {phoneNumber}</Text>
            </Text>
          </View>
        </View>

        {/* Main Content Container */}
        <View className="flex-1 bg-primary-50 rounded-t-3xl shadow-sm">
          <View className="pt-3 pb-2 items-center">
            <View className="w-10 h-1 rounded-full bg-primary-300" />
          </View>

          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View className="mb-6 items-center">
              {/* Hidden Input */}
              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleChange}
                keyboardType="number-pad"
                maxLength={MAX_LENGTH}
                className="absolute opacity-0"
                autoFocus
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
              />

              {/* OTP Boxes */}
              <View className="flex-row justify-between w-full mb-4">
                {Array.from({ length: MAX_LENGTH }).map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => inputRef.current?.focus()}
                    className={`w-12 h-14 rounded-xl border-2 items-center justify-center shadow-sm ${
                      error
                        ? 'border-danger bg-red-50'
                        : i < otp.length
                        ? 'border-secondary-400 bg-secondary-50'
                        : 'border-primary-300 bg-white'
                    }`}
                  >
                    <Text className={`text-xl font-bold ${
                      error 
                        ? 'text-danger'
                        : i < otp.length 
                        ? 'text-secondary-700'
                        : 'text-primary-400'
                    }`}>
                      {otp[i] || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error && (
                <Text className="text-danger text-center mb-3 text-sm">{error}</Text>
              )}
            </View>

            <View className="items-center mb-6">
              <Text className="text-primary-600 text-sm mb-4 font-medium">Didn't receive the code?</Text>
              {canResend ? (
                <TouchableOpacity 
                  onPress={handleResend} 
                  disabled={isResending} 
                  className="bg-secondary-50 border border-secondary-200 px-6 py-3 rounded-xl shadow-sm"
                >
                  <Text className="text-secondary-700 font-semibold">
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-primary-100 border border-primary-200 px-6 py-3 rounded-xl">
                  <Text className="text-primary-500 text-sm font-medium">Resend in {timer}s</Text>
                </View>
              )}
            </View>

            {/* Info box */}
            <View className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={18} color="#B45309" />
                <Text className="ml-2 font-semibold text-primary-700">Quick Tip</Text>
              </View>
              <Text className="text-primary-600 text-sm leading-5">
                The verification code expires in 10 minutes. Make sure to enter it before it expires.
              </Text>
            </View>
          </ScrollView>

          {/* Verify Button */}
          <View className="p-6 bg-white border-t border-primary-200">
            <TouchableOpacity
              disabled={!isComplete}
              onPress={() => verifyOTP(otp)}
              className={`rounded-xl py-4 items-center shadow-lg ${
                isComplete ? 'bg-secondary-700' : 'bg-primary-300'
              }`}
              style={{
                shadowColor: isComplete ? '#B45309' : 'transparent',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: isComplete ? 0.2 : 0,
                shadowRadius: 8,
                elevation: isComplete ? 5 : 0,
              }}
            >
              <Text className={`text-lg font-bold ${
                isComplete ? 'text-white' : 'text-primary-500'
              }`}>
                {isProcessing ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
