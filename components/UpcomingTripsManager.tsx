import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/types/auth';

interface UpcomingTripsManagerProps {
  trips: Trip[];
}

const UpcomingTripsManager: React.FC<UpcomingTripsManagerProps> = ({ trips }) => {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    })} - ${end.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })}`;
  };

  const getDaysUntilTrip = (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleStartTrip = (trip: Trip): void => {
    Alert.alert(
      'Start Trip',
      `Are you ready to start your trip to ${trip.destination}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Trip', 
          onPress: () => {
            // Handle trip activation
            Alert.alert('Trip Started', `Your trip to ${trip.destination} is now active!`);
          }
        }
      ]
    );
  };

  const handleEditTrip = (trip: Trip): void => {
    Alert.alert('Edit Trip', 'Trip editing functionality will be implemented');
  };

  const handleDeleteTrip = (trip: Trip): void => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete your trip to ${trip.destination}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Handle trip deletion
            Alert.alert('Trip Deleted', 'Trip has been removed from your upcoming trips');
          }
        }
      ]
    );
  };

  if (trips.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Ionicons name="calendar-outline" size={64} color="#8E8E93" />
        <Text className="text-xl font-semibold text-black mt-4 mb-2">No Upcoming Trips</Text>
        <Text className="text-base text-gray-500 text-center mb-6">
          Plan your next adventure and it will appear here
        </Text>
        <Pressable className="bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white text-base font-semibold">Plan New Trip</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-semibold text-black mb-4">
        Upcoming Trips ({trips.length})
      </Text>

      {trips.map((trip) => {
        const daysUntil = getDaysUntilTrip(trip.startDate);
        const isExpanded = selectedTrip === trip.id;
        const canStart = daysUntil <= 0;

        return (
          <View key={trip.id} className="bg-white rounded-xl mb-4 overflow-hidden">
            {/* Trip Header */}
            <Pressable 
              className="p-4"
              onPress={() => setSelectedTrip(isExpanded ? null : trip.id)}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black mb-1">{trip.destination}</Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </Text>
                  
                  {/* Status Badge */}
                  <View className="flex-row items-center">
                    {canStart ? (
                      <View className="bg-success/10 px-3 py-1 rounded-full mr-2">
                        <Text className="text-success text-xs font-semibold">READY TO START</Text>
                      </View>
                    ) : (
                      <View className="bg-blue-100 px-3 py-1 rounded-full mr-2">
                        <Text className="text-blue-700 text-xs font-semibold">
                          {daysUntil} DAYS TO GO
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#8E8E93" 
                />
              </View>
            </Pressable>

            {/* Expanded Content */}
            {isExpanded && (
              <View className="px-4 pb-4 border-t border-gray-100">
                {/* Trip Details */}
                <View className="py-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Trip Details</Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time-outline" size={16} color="#8E8E93" />
                    <Text className="text-sm text-gray-600 ml-2">
                      Duration: {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </Text>
                  </View>
                  
                  {trip.companions.length > 0 && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="people-outline" size={16} color="#8E8E93" />
                      <Text className="text-sm text-gray-600 ml-2">
                        {trip.companions.length} companion(s)
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#8E8E93" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {trip.checkpoints.length} planned checkpoints
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 pt-3 border-t border-gray-100">
                  {canStart ? (
                    <Pressable 
                      className="flex-1 bg-success py-3 rounded-lg"
                      onPress={() => handleStartTrip(trip)}
                    >
                      <Text className="text-white text-center font-semibold">Start Trip</Text>
                    </Pressable>
                  ) : (
                    <Pressable 
                      className="flex-1 bg-primary py-3 rounded-lg"
                      onPress={() => handleEditTrip(trip)}
                    >
                      <Text className="text-white text-center font-semibold">Edit Trip</Text>
                    </Pressable>
                  )}
                  
                  <Pressable 
                    className="px-4 py-3 border border-gray-300 rounded-lg"
                    onPress={() => handleDeleteTrip(trip)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default UpcomingTripsManager;
