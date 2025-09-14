import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmergencyButtonProps {
  onPress: () => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'floating' | 'compact';
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ 
  onPress, 
  style, 
  size = 'large',
  variant = 'primary'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-16';
      case 'medium':
        return 'w-24 h-24';
      case 'large':
        return 'w-32 h-32';
      default:
        return 'w-32 h-32';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 28;
      case 'large':
        return 36;
      default:
        return 36;
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handlePressIn = () => {
    setIsPressed(true);
    startPulseAnimation();
    
    // Start 3-second countdown for emergency activation
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          if (prev === 1) {
            // Trigger emergency after countdown
            handleEmergencyTrigger();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownRef.current = countdownInterval;
  };

  const handlePressOut = () => {
    setIsPressed(false);
    setCountdown(null);
    stopPulseAnimation();
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const handleEmergencyTrigger = () => {
    setIsPressed(false);
    setCountdown(null);
    stopPulseAnimation();
    
    Alert.alert(
      'Emergency Alert Activated',
      'Emergency services and your contacts have been notified with your location.',
      [
        {
          text: 'OK',
          onPress: () => onPress(),
        },
      ]
    );
  };

  const handlePress = () => {
    if (variant === 'compact') {
      // Direct press for compact variant
      onPress();
    }
  };

  if (variant === 'floating') {
    return (
      <View className="absolute bottom-6 right-6 z-50">
        <Pressable
          className="w-16 h-16 bg-danger rounded-full justify-center items-center shadow-lg"
          onPress={onPress}
          style={style}
        >
          <Ionicons name="warning" size={24} color="white" />
        </Pressable>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable
        className="bg-danger px-4 py-2 rounded-lg flex-row items-center"
        onPress={handlePress}
        style={style}
      >
        <Ionicons name="warning" size={16} color="white" />
        <Text className="text-white font-semibold ml-2">Emergency</Text>
      </Pressable>
    );
  }

  return (
    <View className="items-center" style={style}>
      <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
        <Pressable
          className={`${getSizeClasses()} rounded-full justify-center items-center shadow-lg ${
            isPressed ? 'bg-red-600' : 'bg-danger'
          }`}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
        >
          {/* Ripple Effect */}
          {isPressed && (
            <View className="absolute inset-0 rounded-full bg-white/20" />
          )}
          
          {/* Main Content */}
          <View className="items-center">
            {countdown !== null ? (
              <>
                <Text className="text-white text-3xl font-bold mb-1">
                  {countdown}
                </Text>
                <Text className="text-white text-xs font-medium">
                  HOLD TO CONFIRM
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="warning" size={getIconSize()} color="white" />
                <Text className="text-white text-xs font-bold mt-1">
                  EMERGENCY
                </Text>
              </>
            )}
          </View>
        </Pressable>
      </Animated.View>

      {/* Instructions */}
      <View className="mt-4 items-center px-4">
        <Text className="text-sm font-semibold text-black mb-1">
          Emergency Button
        </Text>
        <Text className="text-xs text-gray-600 text-center leading-4">
          Hold for 3 seconds to activate emergency alert and notify contacts
        </Text>
      </View>
    </View>
  );
};

export default EmergencyButton;
