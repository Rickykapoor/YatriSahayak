import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/types/auth';

interface TripStatusCardProps {
  trip: Trip;
  safetyScore: number;
  onViewDetails: () => void;
}

const TripStatusCard: React.FC<TripStatusCardProps> = ({ 
  trip, 
  safetyScore, 
  onViewDetails 
}) => {
  const getCompletionPercentage = (): number => {
    if (!trip.checkpoints || trip.checkpoints.length === 0) return 0;
    const completedCheckpoints = trip.checkpoints.filter(c => c.visited).length;
    return Math.round((completedCheckpoints / trip.checkpoints.length) * 100);
  };

  const getSafetyColor = (score: number): string => {
    if (score >= 80) return '#34C759'; // Success green
    if (score >= 60) return '#FF9500'; // Warning orange
    return '#FF3B30'; // Danger red
  };

  const getSafetyBgColor = (score: number): string => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getRemainingDays = (): number => {
    const endDate = new Date(trip.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const completionPercentage = getCompletionPercentage();
  const remainingDays = getRemainingDays();

  return (
    <Pressable 
      className="bg-white m-4 rounded-xl shadow-sm overflow-hidden"
      onPress={onViewDetails}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 pb-2">
        <Text className="text-lg font-bold text-black">Current Trip</Text>
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getSafetyColor(safetyScore)}20` }}
        >
          <Text 
            className="text-sm font-semibold"
            style={{ color: getSafetyColor(safetyScore) }}
          >
            Safety: {safetyScore}%
          </Text>
        </View>
      </View>

      {/* Trip Details */}
      <View className="px-4 pb-3">
        <Text className="text-2xl font-bold text-black mb-2">{trip.destination}</Text>
        
        <View className="flex-row items-center mb-3">
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text className="text-sm text-gray-600 ml-2">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </Text>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text className="text-sm text-gray-600 ml-2">
            {remainingDays} days remaining
          </Text>
        </View>

        {/* Progress Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Trip Progress</Text>
            <Text className="text-sm text-gray-500">
              {trip.checkpoints?.filter(c => c.visited).length || 0}/{trip.checkpoints?.length || 0} checkpoints
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <View 
              className="h-full bg-primary rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </View>
        </View>

        {/* Trip Stats Row */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text className="text-sm text-gray-600 ml-1">
              {completionPercentage}% Complete
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-primary text-sm font-medium">View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </View>
        </View>

        {/* Status Badge */}
        {trip.status && (
          <View className="mt-3 flex-row justify-center">
            <View 
              className={`px-3 py-1 rounded-full ${
                trip.status === 'active' ? 'bg-success/10' : 
                trip.status === 'planned' ? 'bg-primary/10' : 'bg-gray-100'
              }`}
            >
              <Text 
                className={`text-xs font-bold uppercase tracking-wide ${
                  trip.status === 'active' ? 'text-success' : 
                  trip.status === 'planned' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {trip.status}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default TripStatusCard;
