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
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
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
      className="bg-white m-4 rounded-xl shadow-sm overflow-hidden border border-primary-200"
      onPress={onViewDetails}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 pb-2">
        <Text className="text-lg font-bold text-primary-800">Current Trip</Text>
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
        <Text className="text-2xl font-bold text-primary-800 mb-2">{trip.destination}</Text>
        
        <View className="flex-row items-center mb-3">
          <Ionicons name="calendar-outline" size={16} color="#A8A29E" />
          <Text className="text-sm text-primary-600 ml-2">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </Text>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="time-outline" size={16} color="#A8A29E" />
          <Text className="text-sm text-primary-600 ml-2">
            {remainingDays} days remaining
          </Text>
        </View>

        {/* Progress Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-primary-700">Trip Progress</Text>
            <Text className="text-sm text-primary-500">
              {trip.checkpoints?.filter(c => c.visited).length || 0}/{trip.checkpoints?.length || 0} checkpoints
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="w-full h-2 bg-primary-200 rounded-full overflow-hidden">
            <View 
              className="h-full bg-secondary-600 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </View>
        </View>

        {/* Trip Stats Row */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-sm text-primary-600 ml-1">
              {completionPercentage}% Complete
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-secondary-700 text-sm font-medium">View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#B45309" />
          </View>
        </View>

        {/* Status Badge */}
        {trip.status && (
          <View className="mt-3 flex-row justify-center">
            <View 
              className={`px-3 py-1 rounded-full ${
                trip.status === 'active' ? 'bg-green-100' : 
                trip.status === 'planned' ? 'bg-secondary-100' : 'bg-primary-100'
              }`}
            >
              <Text 
                className={`text-xs font-bold uppercase tracking-wide ${
                  trip.status === 'active' ? 'text-success' : 
                  trip.status === 'planned' ? 'text-secondary-700' : 'text-primary-600'
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
