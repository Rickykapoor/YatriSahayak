import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { User, Trip } from '@/types/auth';

interface DigitalIDCardProps {
  user: User;
  trip?: Trip | null;
  onPress?: () => void;
}

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ user, trip, onPress }) => {
  return (
    <Pressable 
      className="bg-white mx-4 p-6 rounded-2xl shadow-sm border border-gray-200"
      onPress={onPress}
    >
      <View className="flex-row items-center mb-4">
        <Image 
          source={{ uri: user.photo || 'https://via.placeholder.com/60' }}
          className="w-15 h-15 rounded-full bg-gray-200"
        />
        <View className="flex-1 ml-4">
          <Text className="text-xl font-bold text-black">{user.name}</Text>
          <Text className="text-sm text-gray-600">ID: {user.digitalID}</Text>
          {user.verified && (
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 rounded-full bg-success mr-2" />
              <Text className="text-xs text-success font-medium">Verified</Text>
            </View>
          )}
        </View>
      </View>

      {trip && (
        <View className="bg-blue-50 p-3 rounded-lg">
          <Text className="text-sm font-medium text-blue-800">Current Trip</Text>
          <Text className="text-base font-semibold text-blue-900">{trip.destination}</Text>
          <Text className="text-xs text-blue-600">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default DigitalIDCard;
