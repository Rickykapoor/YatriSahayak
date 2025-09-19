import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTourist } from '@/context/TouristContext';
import { Trip } from '@/types/auth';

const PreviousTripsModal: React.FC = () => {
  const { tripHistory } = useTourist();
  const [sortBy, setSortBy] = useState<'recent' | 'destination' | 'duration'>('recent');

  const formatTripDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const getTripStatusColor = (status: Trip['status']): string => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#A8A29E';
    }
  };

  const sortedTrips = React.useMemo(() => {
    const trips = [...(tripHistory || [])];
    
    switch (sortBy) {
      case 'recent':
        return trips.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      case 'destination':
        return trips.sort((a, b) => a.destination.localeCompare(b.destination));
      case 'duration':
        return trips.sort((a, b) => {
          const durationA = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
          const durationB = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
          return durationB - durationA;
        });
      default:
        return trips;
    }
  }, [tripHistory, sortBy]);

  const TripCard = ({ trip }: { trip: Trip }) => (
    <Pressable 
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-primary-100"
      onPress={() => {
        router.push(`/modal/trip-details?tripId=${trip.id}` as any);
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-primary-800">{trip.destination}</Text>
          <Text className="text-sm text-primary-600">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getTripStatusColor(trip.status)}20` }}
        >
          <Text 
            className="text-xs font-semibold uppercase"
            style={{ color: getTripStatusColor(trip.status) }}
          >
            {trip.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#A8A29E" />
          <Text className="text-sm text-primary-600 ml-1">
            {formatTripDuration(trip.startDate, trip.endDate)}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text className="text-sm text-primary-600 ml-1">
            {trip.checkpoints?.filter(c => c.visited).length || 0}/{trip.checkpoints?.length || 0} checkpoints
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={16} color="#A8A29E" />
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-primary-50">
      <Stack.Screen 
        options={{ 
          title: 'Previous Trips',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#F5F5F4' },
          headerTitleStyle: { color: '#44403C' }
        }} 
      />

      {/* Sort Controls */}
      <View className="bg-white p-4 border-b border-primary-200">
        <Text className="text-sm text-primary-600 mb-2">Sort by</Text>
        <View className="flex-row gap-2">
          {['recent', 'destination', 'duration'].map((option) => (
            <Pressable
              key={option}
              className={`px-3 py-2 rounded-lg ${sortBy === option ? 'bg-secondary-600' : 'bg-primary-100'}`}
              onPress={() => setSortBy(option as any)}
            >
              <Text className={`text-sm font-medium capitalize ${sortBy === option ? 'text-white' : 'text-primary-700'}`}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {sortedTrips.length > 0 ? (
          <>
            <Text className="text-lg font-semibold text-primary-800 mb-4">
              {sortedTrips.length} trip{sortedTrips.length > 1 ? 's' : ''} found
            </Text>
            {sortedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="map-outline" size={64} color="#A8A29E" />
            <Text className="text-xl font-semibold text-primary-800 mt-4 mb-2">No Previous Trips</Text>
            <Text className="text-base text-primary-600 text-center">
              Your completed trips will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PreviousTripsModal;
