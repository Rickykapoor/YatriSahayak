import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  companions: string[];
  accommodations: string[];
}

interface TripPlanningFormProps {
  onSubmit: (data: TripFormData) => Promise<void>;
}

const TripPlanningForm: React.FC<TripPlanningFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    companions: [],
    accommodations: [],
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateField = useCallback((field: keyof TripFormData, value: string | string[]): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!formData.destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Alert.alert('Error', 'Please select travel dates');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  return (
    <View className="bg-white m-4 p-4 rounded-xl">
      <Text className="text-xl font-semibold text-black mb-4">Plan Your Trip</Text>
      
      {/* Destination Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Destination</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
          placeholder="Where would you like to go?"
          value={formData.destination}
          onChangeText={(text) => updateField('destination', text)}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Date Inputs */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">Start Date</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
            placeholder="DD/MM/YYYY"
            value={formData.startDate}
            onChangeText={(text) => updateField('startDate', text)}
            placeholderTextColor="#8E8E93"
          />
        </View>
        
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">End Date</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
            placeholder="DD/MM/YYYY"
            value={formData.endDate}
            onChangeText={(text) => updateField('endDate', text)}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        className={`py-4 rounded-lg ${isSubmitting ? 'bg-gray-400' : 'bg-primary'}`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text className="text-white text-center text-base font-semibold">
          {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
        </Text>
      </Pressable>
    </View>
  );
};

export default TripPlanningForm;
