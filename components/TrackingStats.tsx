import React from 'react';
import { View, Text } from 'react-native';
import { LocationData, Trip } from '@/types/auth';

interface TrackingStatsProps {
  location: LocationData;
  currentTrip: Trip | null;
}

const TrackingStats: React.FC<TrackingStatsProps> = ({ location, currentTrip }) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const calculateTripDistance = (): number => {
    return 12500; // 12.5km
  };

  const getTodayDistance = (): number => {
    return 8300; // 8.3km
  };

  return (
    <View className="flex-row justify-around py-4 bg-primary-50 mx-4 rounded-lg mb-2 border border-primary-200">
      <View className="items-center">
        <Text className="text-lg font-bold text-secondary-700">
          {formatDistance(getTodayDistance())}
        </Text>
        <Text className="text-xs text-primary-600">Today</Text>
      </View>
      
      {currentTrip && (
        <View className="items-center">
          <Text className="text-lg font-bold text-secondary-700">
            {formatDistance(calculateTripDistance())}
          </Text>
          <Text className="text-xs text-primary-600">This Trip</Text>
        </View>
      )}
      
      <View className="items-center">
        <Text className="text-lg font-bold text-secondary-700">
          {location.accuracy ? `±${location.accuracy.toFixed(0)}m` : 'N/A'}
        </Text>
        <Text className="text-xs text-primary-600">Accuracy</Text>
      </View>
    </View>
  );
};

export default TrackingStats;
