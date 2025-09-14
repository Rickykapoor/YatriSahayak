import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTourist } from '@/context/TouristContext';
import { UserSettings } from '@/types/auth';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

interface SettingToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: boolean;
  onToggle: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  value, 
  onPress, 
  showChevron = true, 
  danger = false 
}) => (
  <Pressable 
    className="flex-row items-center justify-between py-3 border-b border-gray-100"
    onPress={onPress}
  >
    <View className="flex-row items-center gap-3 flex-1">
      <Ionicons 
        name={icon} 
        size={24} 
        color={danger ? "#FF3B30" : "#007AFF"} 
      />
      <Text className={`text-base ${danger ? 'text-danger' : 'text-black'}`}>
        {title}
      </Text>
    </View>
    <View className="flex-row items-center gap-2">
      {value && <Text className="text-base text-gray-500">{value}</Text>}
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
    </View>
  </Pressable>
);

const SettingToggle: React.FC<SettingToggleProps> = ({ icon, title, value, onToggle }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
    <View className="flex-row items-center gap-3 flex-1">
      <Ionicons name={icon} size={24} color="#007AFF" />
      <Text className="text-base text-black">{title}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#E5E5EA', true: '#34C759' }}
      thumbColor="white"
    />
  </View>
);

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { tripHistory, updateUserSettings } = useTourist();
  const [settings, setSettings] = useState<UserSettings>(user?.settings || {
    locationEnabled: true,
    emergencyAlerts: true,
    biometricEnabled: false,
    language: 'English',
    languageName: 'English',
    darkMode: false,
    soundEnabled: true,
    locationTracking: true,
    dataSharing: false,
    analyticsCollection: false,
    emergencySharing: true,
    thirdPartyIntegration: false,
  });

  const toggleSetting = useCallback((key: keyof UserSettings): void => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    updateUserSettings(newSettings);
    
    if (user) {
      updateUser({ settings: newSettings });
    }
  }, [settings, updateUserSettings, updateUser, user]);

  const handleEditProfile = useCallback((): void => {
    router.push('/modal/edit-profile' as any);
  }, []);

  const handleConsentManagement = useCallback((): void => {
    router.push('/modal/consent-management' as any);
  }, []);

  const handleLanguageSelector = useCallback((): void => {
    router.push('/modal/language-selector' as any);
  }, []);

  const handleEmergencyContacts = useCallback((): void => {
    router.push('/modal/emergency-contacts' as any);
  }, []);

  const handleDocumentManager = useCallback((): void => {
    router.push('/modal/document-manager' as any);
  }, []);

  const handleExportData = useCallback((): void => {
    Alert.alert('Export Data', 'Your data export will be ready shortly');
  }, []);

  const handleLogout = useCallback((): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  }, [logout]);

  const handleDeleteAccount = useCallback((): void => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            console.log('Account deletion requested');
          }
        },
      ]
    );
  }, []);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-light">
      {/* Header */}
      <View className="bg-white pt-14 px-5 pb-5 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black">Profile</Text>
        <Pressable onPress={handleEditProfile} className="p-2">
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </Pressable>
      </View>

      {/* User Profile Header */}
      <View className="bg-white px-5 pb-6 items-center">
        <View className="relative mb-4">
          <Image 
            source={{ uri: user.photo || 'https://via.placeholder.com/100' }}
            className="w-25 h-25 rounded-full bg-gray-200"
          />
          <View className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          </View>
        </View>
        
        <Text className="text-2xl font-bold text-black mb-1">{user.name}</Text>
        <Text className="text-base text-gray-500 mb-1">{user.email}</Text>
        <Text className="text-sm text-gray-500">
          Member since {new Date(user.joinDate).getFullYear()}
        </Text>
      </View>

      {/* Quick Stats */}
      <View className="flex-row gap-3 mx-4 mb-4">
        <View className="flex-1 bg-white p-4 rounded-xl items-center">
          <Text className="text-2xl font-bold text-primary mb-1">
            {tripHistory?.length || 0}
          </Text>
          <Text className="text-xs text-gray-500 font-medium">Total Trips</Text>
        </View>
        
        <View className="flex-1 bg-white p-4 rounded-xl items-center">
          <Text className="text-2xl font-bold text-primary mb-1">
            {user.averageSafetyScore || 85}
          </Text>
          <Text className="text-xs text-gray-500 font-medium">Avg Safety Score</Text>
        </View>
        
        <View className="flex-1 bg-white p-4 rounded-xl items-center">
          <Text className="text-2xl font-bold text-primary mb-1">
            {user.checkinsCount || 47}
          </Text>
          <Text className="text-xs text-gray-500 font-medium">Check-ins</Text>
        </View>
      </View>

      {/* Document Status */}
      <View className="bg-white m-4 p-4 rounded-xl">
        <Text className="text-lg font-semibold text-black mb-4">Verification Status</Text>
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text className="text-base text-black">Aadhaar Verified</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text className="text-base text-black">Photo Verified</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text className="text-base text-black">Digital ID Active</Text>
          </View>
        </View>
      </View>

      {/* Privacy & Security Settings */}
      <View className="bg-white m-4 p-4 rounded-xl">
        <Text className="text-lg font-semibold text-black mb-4">Privacy & Security</Text>
        
        <SettingItem
          icon="shield-outline"
          title="Data Sharing Consent"
          onPress={handleConsentManagement}
        />

        <SettingToggle
          icon="location-outline"
          title="Location Tracking"
          value={settings.locationEnabled}
          onToggle={() => toggleSetting('locationEnabled')}
        />

        <SettingToggle
          icon="notifications-outline"
          title="Emergency Alerts"
          value={settings.emergencyAlerts}
          onToggle={() => toggleSetting('emergencyAlerts')}
        />

        <SettingToggle
          icon="finger-print-outline"
          title="Biometric Login"
          value={settings.biometricEnabled}
          onToggle={() => toggleSetting('biometricEnabled')}
        />
      </View>

      {/* App Preferences */}
      <View className="bg-white m-4 p-4 rounded-xl">
        <Text className="text-lg font-semibold text-black mb-4">App Preferences</Text>
        
        <SettingItem
          icon="language-outline"
          title="Language"
          value={settings.languageName || settings.language}
          onPress={handleLanguageSelector}
        />

        <SettingToggle
          icon="moon-outline"
          title="Dark Mode"
          value={settings.darkMode}
          onToggle={() => toggleSetting('darkMode')}
        />

        <SettingToggle
          icon="volume-high-outline"
          title="Sound Effects"
          value={settings.soundEnabled}
          onToggle={() => toggleSetting('soundEnabled')}
        />
      </View>

      {/* Account Management */}
      <View className="bg-white m-4 p-4 rounded-xl">
        <Text className="text-lg font-semibold text-black mb-4">Account</Text>
        
        <SettingItem
          icon="people-outline"
          title="Emergency Contacts"
          onPress={handleEmergencyContacts}
        />

        <SettingItem
          icon="document-outline"
          title="Document Management"
          onPress={handleDocumentManager}
        />

        <SettingItem
          icon="download-outline"
          title="Export Data"
          onPress={handleExportData}
        />

        <SettingItem
          icon="log-out-outline"
          title="Logout"
          onPress={handleLogout}
          showChevron={false}
          danger={true}
        />

        <SettingItem
          icon="trash-outline"
          title="Delete Account"
          onPress={handleDeleteAccount}
          showChevron={false}
          danger={true}
        />
      </View>

      {/* App Info */}
      <View className="items-center p-6 gap-1">
        <Text className="text-xs text-gray-500">Digital Tourist ID v1.0.0</Text>
        <Text className="text-xs text-gray-500">© 2025 YatriSahayak</Text>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
