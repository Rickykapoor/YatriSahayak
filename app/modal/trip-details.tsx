import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTourist } from '@/context/TouristContext';

const TripDetailsModal: React.FC = () => {
  const { currentTrip } = useTourist();

  if (!currentTrip) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <Stack.Screen 
          options={{ 
            title: 'Trip Details',
            headerStyle: { backgroundColor: '#F5F5F4' },
            headerTitleStyle: { color: '#44403C' }
          }} 
        />
        <Text className="text-primary-500">No active trip found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-primary-50">
      <Stack.Screen 
        options={{ 
          title: 'Trip Details',
          headerStyle: { backgroundColor: '#F5F5F4' },
          headerTitleStyle: { color: '#44403C' }
        }} 
      />
      
      {/* Hero Section */}
      <View className="bg-secondary-700 p-6">
        <Text className="text-white text-2xl font-bold mb-2">{currentTrip.destination}</Text>
        <View className="flex-row items-center">
          <Ionicons name="calendar" size={16} color="white" />
          <Text className="text-white ml-2">
            {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View className="p-4">
        {/* Status Card */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-primary-800 mb-3">Trip Status</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-primary-700">Status</Text>
            <View className="bg-success/10 px-3 py-1 rounded-full">
              <Text className="text-success font-semibold capitalize">{currentTrip.status}</Text>
            </View>
          </View>
        </View>

        {/* Checkpoints */}
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-primary-800 mb-3">Checkpoints</Text>
          {currentTrip.checkpoints.map((checkpoint, index) => (
            <View key={checkpoint.id} className="flex-row items-center py-2">
              <View className={`w-6 h-6 rounded-full justify-center items-center mr-3 ${checkpoint.visited ? 'bg-success' : 'bg-primary-300'}`}>
                {checkpoint.visited ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : (
                  <Text className="text-white text-xs">{index + 1}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base text-primary-800">{checkpoint.name}</Text>
                <Text className="text-sm text-primary-600">{checkpoint.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Companions */}
        {currentTrip.companions.length > 0 && (
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-semibold text-primary-800 mb-3">Travel Companions</Text>
            {currentTrip.companions.map((companion, index) => (
              <View key={index} className="flex-row items-center py-2">
                <Ionicons name="person" size={20} color="#A8A29E" />
                <Text className="text-base text-primary-800 ml-3">{companion}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TripDetailsModal;
