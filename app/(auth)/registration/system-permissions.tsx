// app/(auth)/system-permissions.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCameraPermissions } from 'expo-camera';
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';

interface PermissionStatus {
  location: 'granted' | 'denied' | 'undetermined';
  camera: 'granted' | 'denied' | 'undetermined';
  notifications: 'granted' | 'denied' | 'undetermined';
  contacts: 'granted' | 'denied' | 'undetermined';
}

const SystemPermissionsScreen: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: 'undetermined',
    camera: 'undetermined',
    notifications: 'undetermined',
    contacts: 'undetermined',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the Camera permission hook
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const checkPermissions = useCallback(async () => {
    try {
      const [locationStatus, notificationStatus, contactsStatus] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Notifications.getPermissionsAsync(),
        Contacts.getPermissionsAsync(),
      ]);

      setPermissions({
        location: locationStatus.status,
        camera: cameraPermission?.status || 'undetermined',
        notifications: notificationStatus.status,
        contacts: contactsStatus.status,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, [cameraPermission]);

  useEffect(() => {
    checkPermissions();
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });

    return () => subscription.remove();
  }, [checkPermissions]);

  // Update camera permission status when it changes
  useEffect(() => {
    if (cameraPermission) {
      setPermissions(prev => ({ ...prev, camera: cameraPermission.status }));
    }
  }, [cameraPermission]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissions(prev => ({ ...prev, location: status }));
      
      if (status === 'granted') {
        Alert.alert('Success', 'Location access granted successfully');
      } else {
        Alert.alert(
          'Location Access Required',
          'YatriSahayak needs location access for safety features. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  }, []);

  const handleCameraPermissionRequest = useCallback(async () => {
    try {
      if (cameraPermission?.status === 'denied' && !cameraPermission.canAskAgain) {
        Alert.alert(
          'Camera Access Required',
          'Camera access is needed for QR code scanning and document verification. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const permission = await requestCameraPermission();
      
      if (permission.granted) {
        Alert.alert('Success', 'Camera access granted successfully');
      } else {
        Alert.alert(
          'Camera Access Required',
          'Camera access is needed for QR code scanning and document verification.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request camera permission');
    }
  }, [cameraPermission, requestCameraPermission]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissions(prev => ({ ...prev, notifications: status }));
      
      if (status === 'granted') {
        Alert.alert('Success', 'Notification access granted successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permission');
    }
  }, []);

  const requestContactsPermission = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissions(prev => ({ ...prev, contacts: status }));
      
      if (status === 'granted') {
        Alert.alert('Success', 'Contacts access granted successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request contacts permission');
    }
  }, []);

  const canContinue = (): boolean => {
    return permissions.location === 'granted' && permissions.camera === 'granted';
  };

  const handleNext = useCallback(async () => {
    if (!canContinue()) {
      Alert.alert(
        'Required Permissions Missing',
        'Location and Camera permissions are required to continue. Please grant these permissions.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Save permission status
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(auth)/registration/security-setup');
    } catch (error) {
      Alert.alert('Error', 'Failed to save permissions');
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  const PermissionItem = ({ 
    title, 
    description, 
    status, 
    onRequest, 
    required = false,
    icon
  }: {
    title: string;
    description: string;
    status: 'granted' | 'denied' | 'undetermined';
    onRequest: () => void;
    required?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-primary-200">
      <View className="flex-row items-center mb-3">
        <View className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${
          status === 'granted' ? 'bg-green-100' : 
          required ? 'bg-red-100' : 'bg-secondary-100'
        }`}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={
              status === 'granted' ? "#10B981" : 
              required ? "#EF4444" : "#B45309"
            } 
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-bold text-primary-800">{title}</Text>
            {required && (
              <View className="ml-2 px-2 py-1 bg-red-100 rounded">
                <Text className="text-xs font-bold text-red-700">REQUIRED</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-primary-600 leading-5">{description}</Text>
        </View>
        
        <View className="items-center">
          {status === 'granted' ? (
            <View className="bg-success px-3 py-2 rounded-lg">
              <Text className="text-white text-xs font-bold">GRANTED</Text>
            </View>
          ) : (
            <Pressable 
              className={`px-4 py-2 rounded-lg ${
                required ? 'bg-danger' : 'bg-secondary-600'
              }`}
              onPress={onRequest}
            >
              <Text className="text-white text-sm font-semibold">
                {status === 'denied' ? 'Settings' : 'Allow'}
              </Text>
            </Pressable>
          )}
        </View>
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
          <Text className="text-xl font-bold text-primary-800">System Permissions</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-1 bg-primary-200 rounded-full h-2 mr-2">
            <View className="w-3/4 bg-secondary-600 h-2 rounded-full" />
          </View>
          <Text className="text-sm text-primary-600 font-medium">Step 11 of 17</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Info Card */}
        <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield" size={24} color="#B45309" />
            <Text className="text-lg font-bold text-secondary-800 ml-2">Permission Setup</Text>
          </View>
          <Text className="text-sm text-primary-700 leading-5">
            YatriSahayak needs certain permissions to keep you safe during your travels. 
            Required permissions are essential for safety features, while others enhance your experience.
          </Text>
        </View>

        {/* Required Permissions */}
        <Text className="text-lg font-bold text-primary-800 mb-4">Required Permissions</Text>
        
        <PermissionItem
          title="Location Services"
          description="Essential for emergency alerts, geofencing, checkpoint verification, and sharing your location with emergency contacts."
          status={permissions.location}
          onRequest={requestLocationPermission}
          required={true}
          icon="location"
        />

        <PermissionItem
          title="Camera Access"
          description="Required for QR code scanning at checkpoints, document verification, and identity confirmation."
          status={permissions.camera}
          onRequest={handleCameraPermissionRequest}
          required={true}
          icon="camera"
        />

        {/* Optional Permissions */}
        <Text className="text-lg font-bold text-primary-800 mt-6 mb-4">Recommended Permissions</Text>
        
        <PermissionItem
          title="Push Notifications"
          description="Receive safety alerts, trip reminders, and emergency notifications. Highly recommended for your safety."
          status={permissions.notifications}
          onRequest={requestNotificationPermission}
          icon="notifications"
        />

        <PermissionItem
          title="Contacts Access"
          description="Easily add emergency contacts from your phone book. Makes setup faster and more convenient."
          status={permissions.contacts}
          onRequest={requestContactsPermission}
          icon="people"
        />

        {/* Status Summary */}
        <View className="bg-white p-4 rounded-xl mt-4 shadow-sm border border-primary-200">
          <Text className="text-base font-semibold text-primary-800 mb-3">Permission Status</Text>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-primary-700">Required permissions:</Text>
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${
                canContinue() ? 'bg-success' : 'bg-danger'
              }`} />
              <Text className={`text-sm font-semibold ${
                canContinue() ? 'text-success' : 'text-danger'
              }`}>
                {canContinue() ? 'Complete' : 'Incomplete'}
              </Text>
            </View>
          </View>
          
          {/* Debug Info - Remove in production */}
          <View className="mt-3 p-3 bg-primary-50 rounded-lg">
            <Text className="text-xs text-primary-600 mb-1">Debug Info:</Text>
            <Text className="text-xs text-primary-500">Location: {permissions.location}</Text>
            <Text className="text-xs text-primary-500">Camera: {permissions.camera}</Text>
            <Text className="text-xs text-primary-500">Notifications: {permissions.notifications}</Text>
            <Text className="text-xs text-primary-500">Contacts: {permissions.contacts}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="p-4 bg-white border-t border-primary-200">
        <Pressable
          className={`py-4 rounded-xl shadow-sm ${
            isLoading ? 'bg-primary-400' : 
            canContinue() ? 'bg-secondary-700' : 'bg-primary-300'
          }`}
          onPress={handleNext}
          disabled={isLoading || !canContinue()}
        >
          <Text className="text-white text-center text-lg font-bold">
            {isLoading ? 'Setting Up...' : 'Continue'}
          </Text>
        </Pressable>
        
        <Text className="text-center text-xs text-primary-500 mt-2">
          {canContinue() 
            ? 'All required permissions granted'
            : 'Please grant required permissions to continue'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SystemPermissionsScreen;
