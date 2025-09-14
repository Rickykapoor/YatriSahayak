// app/(auth)/otp-verification.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Keyboard,
  TouchableWithoutFeedback,
  Vibration,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { verifyOTP, resendOTP } from '../../services/authService';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timer, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    setError(null);

    // Haptic feedback on input
    if (numericValue && Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }

    // Auto-focus next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      // Small delay to ensure UI updates before verification
      setTimeout(() => {
        verifyOTPCode(newOtp.join(''));
      }, 100);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      setError(null);
    }
  };

  const verifyOTPCode = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      setError('Please enter complete OTP');
      // Haptic feedback for error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Vibration.vibrate(200);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      const res = await verifyOTP(phoneNumber, otpToVerify);
      if (!res.success) {
        throw new Error(res.message || 'Verification failed');
      }
      
      // Success haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate(100);
      }
      
      Alert.alert('Success', 'Phone number verified successfully!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/(app)/home')
        }
      ]);
    } catch (error) {
      // Error haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Vibration.vibrate([100, 50, 100]);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Clear OTP and focus first input
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      const res = await resendOTP(phoneNumber);
      if (!res.success) {
        throw new Error(res.message || 'Failed to resend OTP');
      }
      
      // Reset timer and state
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Success haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Success', 'OTP sent successfully!');
      
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      
      // Error haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsResending(false);
    }
  };

  const clearOTP = () => {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Verify OTP</Text>
          <TouchableOpacity 
            onPress={clearOTP}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            accessibilityLabel="Clear OTP"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 py-8">
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Enter verification code
            </Text>
            <Text className="text-gray-600 text-base leading-6">
              We sent a 6-digit code to{' '}
              <Text className="font-medium text-gray-900">{phoneNumber}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                className={`w-12 h-14 text-center text-xl font-bold border rounded-xl ${
                  error ? 'border-red-500' : digit ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                } ${isLoading ? 'opacity-50' : ''}`}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
                accessibilityLabel={`OTP digit ${index + 1}`}
                accessibilityHint="Enter one digit of the verification code"
                // Prevent paste on individual inputs
                contextMenuHidden
                // Auto-correct and suggestions off
                autoCorrect={false}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
              />
            ))}
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-600 text-sm text-center font-medium">
                {error}
              </Text>
            </View>
          )}

          {/* Progress Indicator */}
          <View className="mb-6">
            <View className="flex-row justify-center mb-2">
              {[...Array(6)].map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    otp[index] ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </View>
            <Text className="text-center text-xs text-gray-500">
              {otp.filter(digit => digit !== '').length}/6 digits entered
            </Text>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl mb-6 ${
              otp.every(digit => digit !== '') && !isLoading
                ? 'bg-blue-600' 
                : 'bg-gray-300'
            }`}
            onPress={() => verifyOTPCode()}
            disabled={!otp.every(digit => digit !== '') || isLoading}
            accessibilityLabel="Verify OTP"
            accessibilityRole="button"
            accessibilityState={{ disabled: !otp.every(digit => digit !== '') || isLoading }}
          >
            <Text className={`text-center font-semibold text-base ${
              otp.every(digit => digit !== '') && !isLoading
                ? 'text-white' 
                : 'text-gray-500'
            }`}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <View className="items-center">
            <Text className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </Text>
            
            {canResend ? (
              <TouchableOpacity 
                onPress={handleResendOTP}
                disabled={isResending}
                accessibilityLabel="Resend OTP"
                accessibilityRole="button"
                className="py-2 px-4"
              >
                <Text className="text-blue-600 font-medium text-base">
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-400 text-sm">
                Resend in {timer}s
              </Text>
            )}
            
            {/* Edit Phone Number */}
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mt-4 py-2 px-4"
              accessibilityLabel="Change phone number"
              accessibilityRole="button"
            >
              <Text className="text-gray-600 text-sm underline">
                Change phone number
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
