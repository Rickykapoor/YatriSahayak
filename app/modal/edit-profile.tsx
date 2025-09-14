import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';

const EditProfileModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: user?.photo || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImagePicker = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('photo', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }, [updateField]);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        photo: formData.photo,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateUser]);

  return (
    <View className="flex-1 bg-gray-light">
      <Stack.Screen 
        options={{ 
          title: 'Edit Profile',
          headerBackTitle: 'Back'
        }} 
      />

      <ScrollView className="flex-1 p-4">
        {/* Profile Photo Section */}
        <View className="items-center mb-6">
          <View className="relative">
            <Image
              source={{ uri: formData.photo || 'https://via.placeholder.com/120' }}
              className="w-30 h-30 rounded-full bg-gray-200"
            />
            <Pressable
              className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full justify-center items-center"
              onPress={handleImagePicker}
            >
              <Ionicons name="camera" size={20} color="white" />
            </Pressable>
          </View>
          <Text className="text-sm text-gray-600 mt-2">Tap camera icon to change photo</Text>
        </View>

        {/* Form Fields */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-black mb-2">Personal Information</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Full Name *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email Address *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Pressable
            className={`py-4 rounded-xl ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

          <Pressable
            className="py-4 rounded-xl border border-gray-300"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 text-center text-lg font-medium">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileModal;
