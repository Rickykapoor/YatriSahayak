// File: components/DevMenu.tsx
import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DevMenuProps {
  visible: boolean;
  onClose: () => void;
}

const DevMenu: React.FC<DevMenuProps> = ({ visible, onClose }) => {
  if (!__DEV__) return null;

  const registrationPages = [
    { title: '🌐 Language Selection', route: '/(auth)/language', step: 1 },
    { title: '📱 Phone Input', route: '/(auth)/phone-input', step: 2 },
    { title: '🔐 OTP Verification', route: '/(auth)/otp-verification', step: 3 },
    { title: '👤 Personal Info', route: '/(auth)/registration/personal-info', step: 4 },
    { title: '🆘 Emergency Contacts', route: '/(auth)/registration/emergency-contacts', step: 8 },
    { title: '🏥 Medical Information', route: '/(auth)/registration/medical-info', step: 9 },
    { title: '🔒 Data Consent', route: '/(auth)/registration/data-consent', step: 10 },
    { title: '⚙️ System Permissions', route: '/(auth)/registration/system-permissions', step: 11 },
    { title: '🔐 Security Setup', route: '/(auth)/registration/security-setup', step: 12 },
  ];

  const appPages = [
    { title: '🏠 Home', route: '/(app)' },
    { title: '🗺️ Tracking', route: '/(app)/tracking' },
    { title: '👤 Profile', route: '/(app)/profile' },
    { title: '🆘 Emergency', route: '/(app)/emergency' },
  ];

  const resetRegistrationStatus = async () => {
    try {
      await AsyncStorage.multiRemove([
        'registrationProgress',
        'personalInfo',
        'emergencyContacts',
        'medicalInfo',
        'consentSettings',
        'systemPermissions',
        'securitySettings'
      ]);
      
      Alert.alert(
        'Reset Complete',
        'Registration status has been reset. Restart the app to see the registration flow.',
        [
          { text: 'OK', onPress: onClose }
        ]
      );
    } catch (error) {
      console.error('Error resetting registration:', error);
      Alert.alert('Error', 'Failed to reset registration status');
    }
  };

  const navigateToPage = (route: string) => {
    console.log('DevMenu: Navigating to', route);
    try {
      router.push(route as any);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', `Could not navigate to ${route}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="bg-white m-4 rounded-xl p-6 max-h-5/6 w-11/12">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-primary-800">🔧 Dev Menu</Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Registration Pages */}
            <View className="mb-6">
              <Text className="font-bold text-lg mb-3 text-primary-800">📋 Registration Pages</Text>
              {registrationPages.map((page, index) => (
                <Pressable
                  key={index}
                  className="bg-secondary-100 p-3 rounded-lg mb-2 flex-row items-center justify-between"
                  onPress={() => navigateToPage(page.route)}
                >
                  <Text className="text-secondary-800 font-medium flex-1">{page.title}</Text>
                  <View className="bg-secondary-200 px-2 py-1 rounded">
                    <Text className="text-secondary-800 text-xs font-bold">Step {page.step}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* App Pages */}
            <View className="mb-6">
              <Text className="font-bold text-lg mb-3 text-primary-800">📱 App Pages</Text>
              {appPages.map((page, index) => (
                <Pressable
                  key={index}
                  className="bg-blue-100 p-3 rounded-lg mb-2"
                  onPress={() => navigateToPage(page.route)}
                >
                  <Text className="text-blue-800 font-medium">{page.title}</Text>
                </Pressable>
              ))}
            </View>

            {/* Dev Actions */}
            <View className="mb-4">
              <Text className="font-bold text-lg mb-3 text-primary-800">🛠️ Dev Actions</Text>
              
              <Pressable
                className="bg-yellow-100 p-3 rounded-lg mb-2 border border-yellow-300"
                onPress={resetRegistrationStatus}
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={20} color="#F59E0B" />
                  <Text className="text-yellow-800 font-medium ml-2">Reset Registration Status</Text>
                </View>
                <Text className="text-yellow-600 text-xs mt-1">Clear all registration progress</Text>
              </Pressable>

              <Pressable
                className="bg-red-100 p-3 rounded-lg border border-red-300"
                onPress={() => {
                  AsyncStorage.clear();
                  Alert.alert('Cleared', 'All local storage cleared');
                  onClose();
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash" size={20} color="#EF4444" />
                  <Text className="text-red-800 font-medium ml-2">Clear All Storage</Text>
                </View>
                <Text className="text-red-600 text-xs mt-1">⚠️ This will log you out</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View className="border-t border-gray-200 pt-4 mt-4">
            <Text className="text-center text-gray-500 text-sm">
              Development Mode Only • File Structure Based Routes
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DevMenu;
