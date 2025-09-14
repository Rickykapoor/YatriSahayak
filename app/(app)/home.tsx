import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTourist } from '@/context/TouristContext';
import { useSafety } from '@/context/SafetyContext';
import DigitalIDCard from '@/components/DigitalIDCard';
import QuickActionGrid from '@/components/QuickActionGrid';
import TripStatusCard from '@/components/TripStatusCard';
import NotificationPreview from '@/components/NotificationPreview';
import { Trip } from '@/types/auth';

const HomeScreen: React.FC = () => {
  const { user, currentTrip, refreshUserData } = useTourist();
  const { safetyScore, triggerEmergency } = useSafety();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData]);

  const handlePlanTrip = useCallback((): void => {
    router.push('/trip-planner' as any);
  }, []);

  const handleQRDisplay = useCallback((): void => {
    router.push('/modal/qr-display' as any);
  }, []);

  const handleMapPress = useCallback((): void => {
    router.push('/modal/checkpoint-map' as any);
  }, []);

  const handleScanPress = useCallback((): void => {
    router.push('/modal/qr-scanner' as any);
  }, []);

  const handleLocationPress = useCallback((): void => {
    router.push('/tracking' as any);
  }, []);

  const handleViewTripDetails = useCallback((): void => {
    router.push('/modal/trip-details' as any);
  }, []);

  const handleViewNotifications = useCallback((): void => {
    router.push('/modal/notifications' as any);
  }, []);

  const handleViewPreviousTrips = useCallback((): void => {
    router.push('/modal/previous-trips' as any);
  }, []);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-light"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status Header */}
      <View className="bg-white p-5 pt-14">
        <Text className="text-2xl font-bold text-black mb-1">
          Welcome back, {user.firstName}
        </Text>
        <Text className="text-base text-gray-500">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      {/* Trip Status */}
      {currentTrip ? (
        <View className="bg-blue-100 m-4 p-4 rounded-xl border-l-4 border-blue-600">
          <Text className="text-base font-semibold text-blue-700 mb-1">
            📍 Current Trip: {currentTrip.destination}
          </Text>
          <Text className="text-sm text-gray-700">
            Last Checkpoint: {currentTrip.lastCheckpoint || 'Not checked in'}
          </Text>
        </View>
      ) : (
        <View className="bg-white m-4 p-6 rounded-xl items-center">
          <Text className="text-base text-gray-500 mb-3">No active trip</Text>
          <Pressable 
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={handlePlanTrip}
          >
            <Text className="text-white text-base font-semibold">Plan a Trip</Text>
          </Pressable>
        </View>
      )}

      {/* Digital ID Card */}
      <DigitalIDCard 
        user={user}
        trip={currentTrip}
        onPress={handleQRDisplay}
      />
      <Text className="text-center text-gray-500 text-sm mt-2 mb-4">
        Tap to show QR for checkpoints
      </Text>

      {/* Quick Actions */}
      <QuickActionGrid 
        onEmergencyPress={triggerEmergency}
        onMapPress={handleMapPress}
        onScanPress={handleScanPress}
        onLocationPress={handleLocationPress}
      />

      {/* Current Trip Details */}
      {currentTrip && (
        <TripStatusCard 
          trip={currentTrip}
          safetyScore={safetyScore}
          onViewDetails={handleViewTripDetails}
        />
      )}

      {/* Notifications Preview */}
      <NotificationPreview 
        onViewAll={handleViewNotifications}
      />

      {/* Previous Trips */}
      <View className="bg-white m-4 p-4 rounded-xl">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-black">Recent Trips</Text>
          <Pressable onPress={handleViewPreviousTrips}>
            <Text className="text-primary text-base font-medium">View All</Text>
          </Pressable>
        </View>
        
        {user.recentTrips?.slice(0, 2).map((trip: Trip, index: number) => (
          <View key={trip.id || index} className="bg-gray-100 p-3 rounded-lg mb-2">
            <Text className="text-base font-medium text-black">{trip.destination}</Text>
            <Text className="text-sm text-gray-600 mt-0.5">
              {new Date(trip.startDate).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
