import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
  Image,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
      <SafeAreaView className="flex-1 bg-primary-100">
        <View className="flex-1 justify-center items-center bg-primary-50">
          <Image 
            source={require('@/assets/images/Logo_text.png')} 
            style={{ width: 200, height: 120, marginBottom: 20 }} 
            resizeMode="contain"
          />
          <Text className="text-primary-600 text-lg font-medium">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-primary-100">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F4" />
      
      {/* Header with App Branding */}
      <SafeAreaView className="bg-primary-100">
        <View className="px-4 pb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-primary-800 text-2xl font-bold">
                Welcome back, 
              </Text>
              <Text className="text-secondary-700 text-2xl font-bold"> {user.name.split(' ')[0]}!</Text>
              <Text className="text-primary-600 text-sm mt-1 font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <Image 
              source={require('@/assets/images/Logo_text.png')} 
              style={{ width: 170, height: 120 }} 
              resizeMode="contain"
            />
          </View>

          {/* Safety Status Indicator */}
          <View className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 flex-row items-center shadow-sm">
            <Ionicons name="shield-checkmark" size={20} color="#B45309" />
            <Text className="text-secondary-800 font-semibold ml-2 flex-1">Safety Score: {safetyScore}/100</Text>
            <View className={`px-3 py-1 rounded-full ${
              safetyScore >= 80 ? 'bg-success' : 
              safetyScore >= 60 ? 'bg-warning' : 'bg-danger'
            }`}>
              <Text className="text-white text-xs font-bold">
                {safetyScore >= 80 ? 'Safe' : safetyScore >= 60 ? 'Caution' : 'Alert'}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        className="flex-1 bg-primary-50"
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding to prevent content hiding under tab bar
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#B45309"
            colors={['#B45309']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Status */}
        {currentTrip ? (
          <View className="bg-secondary-50 border border-secondary-200 m-4 p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={20} color="#B45309" />
              <Text className="text-secondary-800 font-bold text-base ml-2">
                Current Trip: {currentTrip.destination}
              </Text>
            </View>
            <Text className="text-primary-600 text-sm ml-7">
              Last Checkpoint: {currentTrip.lastCheckpoint || 'Not checked in'}
            </Text>
            <View className="mt-3 flex-row">
              <Pressable 
                className="bg-secondary-700 px-4 py-2 rounded-lg mr-3 shadow-sm"
                onPress={handleViewTripDetails}
              >
                <Text className="text-white font-semibold text-sm">View Details</Text>
              </Pressable>
              <Pressable 
                className="bg-white border border-secondary-200 px-4 py-2 rounded-lg shadow-sm"
                onPress={handleQRDisplay}
              >
                <Text className="text-secondary-700 font-semibold text-sm">Show QR</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="bg-white m-4 p-6 rounded-xl items-center shadow-sm border border-primary-200">
            <Ionicons name="airplane-outline" size={48} color="#A8A29E" />
            <Text className="text-primary-500 text-base mb-4 mt-2 font-medium">No active trip</Text>
            <Pressable 
              className="bg-secondary-700 px-6 py-3 rounded-xl shadow-lg"
              style={{
                shadowColor: '#B45309',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={handlePlanTrip}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Plan a Trip</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Digital ID Card */}
        <View className="mx-4 mb-4">
          <DigitalIDCard 
            user={user}
            trip={currentTrip}
            onPress={handleQRDisplay}
          />
          <Text className="text-center text-primary-500 text-xs mt-2 font-medium">
            Tap to show QR for checkpoints
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mb-4">
          <Text className="text-primary-800 font-bold text-lg mb-3">Quick Actions</Text>
          <QuickActionGrid 
            onEmergencyPress={triggerEmergency}
            onMapPress={handleMapPress}
            onScanPress={handleScanPress}
            onLocationPress={handleLocationPress}
          />
        </View>

        {/* Current Trip Details */}
        {currentTrip && (
          <View className="mx-4 mb-4">
            <TripStatusCard 
              trip={currentTrip}
              safetyScore={safetyScore}
              onViewDetails={handleViewTripDetails}
            />
          </View>
        )}

        {/* Notifications Preview */}
        <View className="mx-4 mb-4">
          <NotificationPreview 
            onViewAll={handleViewNotifications}
          />
        </View>

        {/* Recent Trips */}
        <View className="bg-white mx-4 mb-6 p-4 rounded-xl shadow-sm border border-primary-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary-800 font-bold text-lg">Recent Trips</Text>
            <Pressable onPress={handleViewPreviousTrips}>
              <Text className="text-secondary-700 font-semibold">View All</Text>
            </Pressable>
          </View>
          
          {user.recentTrips?.slice(0, 2).map((trip: Trip, index: number) => (
            <View key={trip.id || index} className="bg-primary-50 border border-primary-200 p-3 rounded-lg mb-2 last:mb-0">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-primary-800">{trip.destination}</Text>
                  <Text className="text-primary-600 text-sm mt-0.5">
                    {new Date(trip.startDate).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#A8A29E" />
              </View>
            </View>
          )) || (
            <View className="items-center py-4">
              <Ionicons name="document-text-outline" size={32} color="#D6D3D1" />
              <Text className="text-primary-400 text-sm mt-2">No recent trips</Text>
            </View>
          )}
        </View>

        {/* App Footer Branding */}
        <View className="items-center py-6">
          <Text className="text-primary-400 text-xs mb-2">Powered by</Text>
          <Text className="text-secondary-700 font-bold">YatriSahayak</Text>
          <Text className="text-primary-400 text-xs mt-1">Digital Tourist Identity & Security Platform</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

