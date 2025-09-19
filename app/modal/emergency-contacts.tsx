import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmergencyContact } from '@/types/auth';

const EmergencyContactsModal: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Family Contact',
      phone: '+91-9876543210',
      relationship: 'Father',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Emergency Services',
      phone: '112',
      relationship: 'Police/Medical',
      isPrimary: false,
    },
  ]);
  
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false,
  });

  const handleCall = useCallback(async (phone: string): Promise<void> => {
    try {
      const phoneUrl = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Cannot make phone call');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make call');
    }
  }, []);

  const handleAddContact = useCallback((): void => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const contactToAdd: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || 'Other',
      isPrimary: newContact.isPrimary || false,
    };

    setContacts(prev => [...prev, contactToAdd]);
    setNewContact({ name: '', phone: '', relationship: '', isPrimary: false });
    setShowAddForm(false);
    Alert.alert('Success', 'Emergency contact added');
  }, [newContact]);

  const handleDeleteContact = useCallback((contactId: string): void => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(contact => contact.id !== contactId));
          },
        },
      ]
    );
  }, []);

  const renderContact = useCallback((contact: EmergencyContact) => (
    <View key={contact.id} className="bg-white p-4 rounded-xl mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-primary-800">{contact.name}</Text>
            {contact.isPrimary && (
              <View className="bg-secondary-600 px-2 py-1 rounded-full ml-2">
                <Text className="text-white text-xs font-bold">PRIMARY</Text>
              </View>
            )}
          </View>
          <Text className="text-base text-primary-700 mb-1">{contact.phone}</Text>
          <Text className="text-sm text-primary-500">{contact.relationship}</Text>
        </View>
        
        <View className="flex-row gap-2">
          <Pressable 
            className="bg-success p-3 rounded-full shadow-sm"
            onPress={() => handleCall(contact.phone)}
          >
            <Ionicons name="call" size={20} color="white" />
          </Pressable>
          
          {!contact.isPrimary && (
            <Pressable 
              className="bg-danger p-3 rounded-full shadow-sm"
              onPress={() => handleDeleteContact(contact.id)}
            >
              <Ionicons name="trash" size={20} color="white" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  ), [handleCall, handleDeleteContact]);

  return (
    <View className="flex-1 bg-primary-50">
      <Stack.Screen 
        options={{ 
          title: 'Emergency Contacts',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#F5F5F4' },
          headerTitleStyle: { color: '#44403C' },
          headerRight: () => (
            <Pressable onPress={() => setShowAddForm(true)}>
              <Ionicons name="add" size={24} color="#B45309" />
            </Pressable>
          ),
        }} 
      />

      <ScrollView className="flex-1 p-4">
        {/* Emergency Instructions */}
        <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text className="text-danger font-semibold ml-2">Emergency Instructions</Text>
          </View>
          <Text className="text-sm text-primary-700 leading-5">
            In case of emergency, these contacts will be automatically notified with your location.
            Keep this list updated with current phone numbers.
          </Text>
        </View>

        {/* Contacts List */}
        {contacts.map(renderContact)}

        {/* Add Contact Form */}
        {showAddForm && (
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-semibold text-primary-800 mb-4">Add Emergency Contact</Text>
            
            <View className="mb-3">
              <Text className="text-sm font-medium text-primary-700 mb-2">Name *</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800"
                placeholder="Contact name"
                value={newContact.name}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
                placeholderTextColor="#A8A29E"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm font-medium text-primary-700 mb-2">Phone Number *</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800"
                placeholder="+91-XXXXXXXXXX"
                value={newContact.phone}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                placeholderTextColor="#A8A29E"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-primary-700 mb-2">Relationship</Text>
              <TextInput
                className="border border-primary-300 rounded-lg px-4 py-3 text-base text-primary-800"
                placeholder="e.g., Mother, Friend, Colleague"
                value={newContact.relationship}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, relationship: text }))}
                placeholderTextColor="#A8A29E"
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable 
                className="flex-1 bg-primary-400 py-3 rounded-lg"
                onPress={() => {
                  setShowAddForm(false);
                  setNewContact({ name: '', phone: '', relationship: '', isPrimary: false });
                }}
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </Pressable>
              
              <Pressable 
                className="flex-1 bg-secondary-700 py-3 rounded-lg"
                onPress={handleAddContact}
              >
                <Text className="text-white text-center font-semibold">Add Contact</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EmergencyContactsModal;
