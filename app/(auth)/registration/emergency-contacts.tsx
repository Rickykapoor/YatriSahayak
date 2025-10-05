// File: app/(auth)/registration/emergency-contacts.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { 
  saveEmergencyContacts, 
  loadEmergencyContacts, 
  EmergencyContactData 
} from '@/services/emergencyService';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
}

const EmergencyContactsScreen: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: 'temp-1',
      name: '',
      phone: '',
      relationship: '',
      isPrimary: true,
      isActive: true,
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Load existing emergency contacts on mount
  useEffect(() => {
    if (user?.id) {
      loadUserEmergencyContacts();
    } else {
      setIsLoadingContacts(false);
    }
  }, [user?.id]);

  const loadUserEmergencyContacts = async () => {
    try {
      if (!user?.id) return;

      const loadedContacts = await loadEmergencyContacts(user.id);

      if (loadedContacts.length > 0) {
        const formattedContacts = loadedContacts.map(contact => ({
          id: contact.id || `temp-${Date.now()}`,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          isPrimary: contact.isPrimary,
          isActive: true,
        }));
        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const addContact = useCallback(() => {
    if (contacts.length >= 3) {
      Alert.alert('Limit Reached', 'You can add maximum 3 emergency contacts');
      return;
    }

    const newContact: EmergencyContact = {
      id: `temp-${Date.now()}`,
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
      isActive: true,
    };
    setContacts(prev => [...prev, newContact]);
  }, [contacts.length]);

  const updateContact = useCallback((id: string, field: keyof EmergencyContact, value: string | boolean) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  }, []);

  const removeContact = useCallback((id: string) => {
    if (contacts.length <= 1) {
      Alert.alert('Error', 'At least one emergency contact is required');
      return;
    }
    setContacts(prev => prev.filter(contact => contact.id !== id));
  }, [contacts.length]);

  const validateContacts = (): boolean => {
    const primaryContact = contacts.find(c => c.isPrimary);
    if (!primaryContact?.name.trim() || !primaryContact?.phone.trim()) {
      Alert.alert('Error', 'Please fill in primary emergency contact details');
      return false;
    }
    if (primaryContact.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number for primary contact');
      return false;
    }

    // Validate all filled contacts
    for (const contact of contacts) {
      if (contact.name.trim() && contact.phone.trim()) {
        if (contact.phone.replace(/\D/g, '').length < 10) {
          Alert.alert('Error', `Please enter a valid phone number for ${contact.name}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = useCallback(async () => {
    if (!validateContacts()) return;
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty contacts and prepare data
      const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());
      
      const contactsData: EmergencyContactData[] = validContacts.map((contact, index) => ({
        id: contact.id.startsWith('temp-') ? undefined : contact.id,
        name: contact.name.trim(),
        phone: contact.phone.replace(/\D/g, ''),
        relationship: contact.relationship || 'Other',
        isPrimary: contact.isPrimary,
        priorityOrder: contact.isPrimary ? 1 : index + 1,
      }));

      await saveEmergencyContacts(user.id, contactsData);
      
      Alert.alert(
        'Success',
        'Emergency contacts saved successfully!',
        [{ text: 'Continue', onPress: () => router.push('/registration/medical-info') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save emergency contacts');
    } finally {
      setIsLoading(false);
    }
  }, [contacts, user?.id]);

  const testCall = useCallback((phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      Linking.openURL(`tel:+91${cleanPhone}`);
    } else {
      Alert.alert('Invalid Number', 'Please enter a valid phone number first');
    }
  }, []);

  if (isLoadingContacts || authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-primary-600 text-lg">Loading emergency contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <Text className="text-xl font-bold text-primary-800">Emergency Contacts</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-1 bg-primary-200 rounded-full h-2 mr-2">
            <View className="w-2/5 bg-secondary-600 h-2 rounded-full" />
          </View>
          <Text className="text-sm text-primary-600 font-medium">Step 8 of 17</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text className="text-red-800 font-bold ml-2">Critical Information</Text>
          </View>
          <Text className="text-sm text-red-700 leading-5">
            These contacts will be automatically notified during emergencies with your location. 
            Ensure phone numbers are current and accessible 24/7.
          </Text>
        </View>

        {/* Emergency Contacts List */}
        {contacts.map((contact, index) => (
          <View key={contact.id} className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-primary-200">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full justify-center items-center mr-3 ${
                  contact.isPrimary ? 'bg-red-100' : 'bg-secondary-100'
                }`}>
                  <Ionicons 
                    name={contact.isPrimary ? "alert-circle" : "person"} 
                    size={16} 
                    color={contact.isPrimary ? "#EF4444" : "#B45309"} 
                  />
                </View>
                <Text className="text-lg font-bold text-primary-800">
                  {contact.isPrimary ? 'Primary Contact' : `Contact ${index + 1}`}
                </Text>
              </View>
              
              {!contact.isPrimary && contacts.length > 1 && (
                <Pressable onPress={() => removeContact(contact.id)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </Pressable>
              )}
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-primary-800 mb-2">
                Full Name {contact.isPrimary ? '*' : ''}
              </Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800 bg-white"
                placeholder="Enter full name"
                value={contact.name}
                onChangeText={(text) => updateContact(contact.id, 'name', text)}
                placeholderTextColor="#A8A29E"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-primary-800 mb-2">
                Phone Number {contact.isPrimary ? '*' : ''}
              </Text>
              <View className="flex-row">
                <View className="flex-1 flex-row items-center border border-primary-300 rounded-lg bg-white">
                  <Text className="px-4 py-3 text-primary-800 border-r border-primary-300">+91</Text>
                  <TextInput
                    className="flex-1 px-4 py-3 text-base text-primary-800"
                    placeholder="9876543210"
                    value={contact.phone}
                    onChangeText={(text) => updateContact(contact.id, 'phone', text.replace(/\D/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#A8A29E"
                  />
                </View>
                <Pressable 
                  className="ml-3 w-12 h-12 bg-success rounded-lg justify-center items-center"
                  onPress={() => testCall(contact.phone)}
                >
                  <Ionicons name="call" size={20} color="white" />
                </Pressable>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-semibold text-primary-800 mb-2">Relationship</Text>
              <View className="flex-row flex-wrap gap-2">
                {['Father', 'Mother', 'Spouse', 'Sibling', 'Friend', 'Other'].map((rel) => (
                  <Pressable
                    key={rel}
                    className={`px-3 py-2 rounded-lg border ${
                      contact.relationship === rel
                        ? 'bg-secondary-100 border-secondary-400'
                        : 'bg-white border-primary-300'
                    }`}
                    onPress={() => updateContact(contact.id, 'relationship', rel)}
                  >
                    <Text className={`text-sm font-medium ${
                      contact.relationship === rel
                        ? 'text-secondary-800'
                        : 'text-primary-700'
                    }`}>
                      {rel}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Add Contact Button */}
        {contacts.length < 3 && (
          <Pressable 
            className="bg-white border-2 border-dashed border-secondary-400 p-4 rounded-xl mb-4 items-center"
            onPress={addContact}
          >
            <Ionicons name="add-circle" size={32} color="#B45309" />
            <Text className="text-secondary-700 font-semibold mt-2">Add Another Contact</Text>
            <Text className="text-primary-600 text-sm mt-1">Up to 3 contacts allowed</Text>
          </Pressable>
        )}
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
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </Pressable>
        
        <Text className="text-center text-xs text-primary-500 mt-2">
          At least one primary emergency contact is required
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default EmergencyContactsScreen;
