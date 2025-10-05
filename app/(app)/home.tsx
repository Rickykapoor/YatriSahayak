// File: app/(app)/home.tsx (Added user profile and digital ID card section)
import React, { useState, useCallback, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/context/AuthContext';
import { useTourist } from '@/context/TouristContext';
import { useSafety } from '@/context/SafetyContext';
import TripService from '@/services/tripService';
import DigitalIDCard from '@/components/DigitalIDCard';
import QuickActionGrid from '@/components/QuickActionGrid';
import TripStatusCard from '@/components/TripStatusCard';
import NotificationPreview from '@/components/NotificationPreview';
import { Trip } from '@/types/trip';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { refreshUserData } = useTourist();
  const { safetyScore, triggerEmergency } = useSafety();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [plannedTrip, setPlannedTrip] = useState<Trip | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trips on mount
  useEffect(() => {
    if (user?.id) {
      loadUserTrips();
    }
  }, [user?.id]);

  const loadUserTrips = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const trips = await TripService.getUserTrips(user.id);
      
      // Find active trip (only one allowed)
      const active = trips.find(trip => trip.status === 'active');
      setActiveTrip(active || null);
      
      // Find planned trip (only one allowed)
      const planned = trips.find(trip => trip.status === 'planned');
      setPlannedTrip(planned || null);
      
      // Get recent completed trips
      const completed = trips.filter(trip => trip.status === 'completed').slice(0, 3);
      setRecentTrips(completed);
      
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshUserData();
      await loadUserTrips();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData]);

  const handleStartTrip = async () => {
    if (!user?.id || !plannedTrip) return;

    Alert.alert(
      '🚀 Start Your Trip',
      `Ready to start "${plannedTrip.title}"?\n\nThis will:\n• Generate your Digital Tourist ID\n• Create QR code for verification\n• Enable real-time safety monitoring`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Trip',
          style: 'default',
          onPress: async () => {
            try {
              const { trip: updatedTrip } = await TripService.startTrip(plannedTrip.id, user.id);
              setActiveTrip(updatedTrip);
              setPlannedTrip(null); // Clear planned trip
              
              Alert.alert(
                '✅ Trip Started!',
                'Your Digital Tourist ID is ready!\nQR code is now visible for checkpoint verification.',
                [{ text: 'Great!' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to start trip. Please try again.');
              console.error('Start trip error:', error);
            }
          }
        }
      ]
    );
  };

  const handlePlanNewTrip = async () => {
    if (!user?.id) return;

    // Check if user can create new trip
    try {
      const eligibility = await TripService.canCreateNewTrip(user.id);
      if (!eligibility.canCreate) {
        Alert.alert('Cannot Plan New Trip', eligibility.reason, [{ text: 'OK' }]);
        return;
      }
      
      router.push('/trip-planner/create' as any);
    } catch (error) {
      console.error('Error checking trip eligibility:', error);
      router.push('/trip-planner/create' as any);
    }
  };

  const handleQRDisplay = useCallback((): void => {
    if (activeTrip?.digitalId) {
      router.push('/modal/qr-display' as any);
    }
  }, [activeTrip]);

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
    if (activeTrip) {
      router.push(`/trip-planner/trip/${activeTrip.id}` as any);
    } else if (plannedTrip) {
      router.push(`/trip-planner/trip/${plannedTrip.id}` as any);
    }
  }, [activeTrip, plannedTrip]);

  const handleViewNotifications = useCallback((): void => {
    router.push('/modal/notifications' as any);
  }, []);

  const handleViewPreviousTrips = useCallback((): void => {
    router.push('/trip-planner/all-trips' as any);
  }, []);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center">
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
    <View className="flex-1 bg-primary-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />
      
      {/* Header with App Branding */}
      <SafeAreaView className="bg-primary-50">
        <View className="px-4 ">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-primary-900 text-2xl font-bold">
                Welcome back,
              </Text>
              <Text className="text-secondary-700 text-xl font-bold">
                {user.name.split(' ')[0]}! 👋
              </Text>
              <Text className="text-primary-600 text-sm mt-1 font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View className="items-center">
              <Image 
                source={require('@/assets/images/Logo_text.png')} 
                style={{ width: 180, height: 100 }} 
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Safety Status Indicator */}
          <View className="bg-white border border-primary-200 rounded-xl p-4 flex-row items-center shadow-sm">
            <View className="flex-row items-center flex-1">
              <Ionicons name="shield-checkmark" size={20} color="#B45309" />
              <Text className="text-primary-800 font-semibold ml-2">Safety Score</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-primary-800 font-bold mr-2">{safetyScore}/100</Text>
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
        </View>
      </SafeAreaView>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
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
        {/* 🎯 ACTIVE TRIP WITH QR CODE - Using legacy brown/amber theme */}
        {activeTrip?.digitalId && (
          <View className="mx-4 mb-6">
            <View className="bg-secondary-50 border-2 border-secondary-300 rounded-2xl p-6 shadow-lg">
              {/* Trip Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-secondary-600 rounded-full mr-2" />
                    <Text className="text-secondary-800 font-bold text-lg">Trip Active</Text>
                  </View>
                  <Text className="text-primary-900 text-xl font-bold">{activeTrip.title}</Text>
                  <Text className="text-secondary-700 text-base">{activeTrip.destination}</Text>
                </View>
                <View className="bg-secondary-600 px-4 py-2 rounded-full">
                  <Text className="text-white text-sm font-bold">LIVE</Text>
                </View>
              </View>

              {/* QR Code Section */}
              <View className="bg-white rounded-xl p-6 shadow-sm items-center border border-primary-200">
                <Text className="text-primary-900 font-bold text-lg mb-4">
                  🆔 Digital Tourist ID
                </Text>
                
                {/* QR Code */}
                <View className="bg-primary-50 p-6 rounded-xl border-2 border-primary-200">
                  <QRCode
                    value={activeTrip.digitalId.qrCodeData}
                    size={160}
                    color="#292524"
                    backgroundColor="white"
                  />
                </View>
                
                <Text className="text-primary-700 text-center mt-4 font-medium">
                  Show this QR code at checkpoints
                </Text>
                
                {/* Offline Verification Code */}
                <View className="bg-secondary-100 px-4 py-3 rounded-lg mt-4">
                  <Text className="text-secondary-800 text-center">
                    <Text className="font-semibold">Offline Code: </Text>
                    <Text className="font-mono text-lg font-bold">
                      {activeTrip.digitalId.offlineVerificationCode}
                    </Text>
                  </Text>
                </View>

                {/* Trip Info */}
                <View className="flex-row justify-between items-center w-full mt-4 pt-4 border-t border-primary-200">
                  <Text className="text-primary-600 text-sm">
                    Duration: <Text className="font-semibold">{activeTrip.duration} days</Text>
                  </Text>
                  <Text className="text-primary-600 text-sm">
                    Expires: <Text className="font-semibold">
                      {new Date(activeTrip.digitalId.expiresAt).toLocaleDateString('en-IN')}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Action Buttons - Using brown/amber theme */}
              <View className="flex-row gap-3 mt-6">
                <Pressable
                  className="flex-1 bg-secondary-600 py-3 rounded-xl"
                  onPress={handleViewTripDetails}
                >
                  <Text className="text-white font-bold text-center">Trip Details</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-secondary-700 py-3 rounded-xl"
                  onPress={handleLocationPress}
                >
                  <Text className="text-white font-bold text-center">Live Tracking</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* PLANNED TRIP - Updated to brown/amber theme for consistency */}
        {!activeTrip && plannedTrip && (
          <View className="mx-4 mb-6">
            <View className="bg-secondary-50 border-2 border-secondary-300 rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-secondary-800 font-bold text-lg mb-2">📅 Trip Planned</Text>
                  <Text className="text-primary-900 text-xl font-bold">{plannedTrip.title}</Text>
                  <Text className="text-secondary-700 text-base">{plannedTrip.destination}</Text>
                  <Text className="text-primary-600 text-sm mt-2">
                    {new Date(plannedTrip.startDate).toLocaleDateString('en-IN')} • {plannedTrip.duration} days
                  </Text>
                </View>
                <Pressable
                  className="bg-secondary-600 px-6 py-3 rounded-xl"
                  onPress={handleStartTrip}
                >
                  <Text className="text-white font-bold">Start Trip</Text>
                </Pressable>
              </View>

              <View className="bg-white rounded-xl p-4 border border-primary-200">
                <Text className="text-primary-700 text-center font-medium">
                  Start your trip to generate Digital Tourist ID with QR verification
                </Text>
              </View>
            </View>
          </View>
        )}


        {/* NO TRIP PLANNED */}
        {!activeTrip && !plannedTrip && (
          <View className="mx-4 mb-6">
            <View className="bg-white rounded-2xl p-8 shadow-lg border border-primary-200 items-center">
              <View className="w-20 h-20 bg-secondary-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="airplane" size={40} color="#B45309" />
              </View>
              <Text className="text-primary-900 text-xl font-bold mb-2">Ready for Adventure?</Text>
              <Text className="text-primary-600 text-center text-base mb-6">
                Plan your trip to get Digital Tourist ID with QR verification
              </Text>
              <Pressable
                className="bg-secondary-600 px-8 py-4 rounded-xl shadow-lg"
                onPress={handlePlanNewTrip}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text className="text-white font-bold ml-2 text-base">Plan Your Trip</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* 👤 USER PROFILE & DIGITAL ID CARD SECTION */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-primary-200">
            <Text className="text-primary-900 font-bold text-lg mb-4">Your Digital Identity</Text>
            
            {/* User Profile Section */}
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-secondary-100 rounded-full items-center justify-center mr-4">
                {user.photo ? (
                  <Image 
                    source={{ uri: user.photo }} 
                    style={{ width: 64, height: 64 }} 
                    className="rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={32} color="#B45309" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className="font-bold text-primary-900 text-lg">{user.name}</Text>
                <Text className="text-primary-600 text-sm">{user.phone}</Text>
                <Text className="text-secondary-700 text-sm font-medium">
                  ID: {user.digitalID}
                </Text>
              </View>

              <View className="items-end">
                <View className="bg-secondary-100 px-3 py-1 rounded-full mb-1">
                  <Text className="text-secondary-800 text-xs font-semibold">
                    {user.verified ? '✓ Verified' : 'Pending'}
                  </Text>
                </View>
                <Text className="text-primary-500 text-xs">
                  Member since {new Date(user.joinDate).getFullYear()}
                </Text>
              </View>
            </View>

            {/* Digital ID Statistics */}
            <View className="bg-primary-50 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-secondary-700">{user.averageSafetyScore}</Text>
                  <Text className="text-xs text-primary-600 text-center">Safety Score</Text>
                </View>
                <View className="w-px h-8 bg-primary-200" />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-secondary-700">{user.checkinsCount}</Text>
                  <Text className="text-xs text-primary-600 text-center">Check-ins</Text>
                </View>
                <View className="w-px h-8 bg-primary-200" />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-secondary-700">{user.recentTrips?.length || 0}</Text>
                  <Text className="text-xs text-primary-600 text-center">Total Trips</Text>
                </View>
              </View>
            </View>

            {/* Digital ID Card Access */}
            {(DigitalIDCard && activeTrip) ? (
              <>
                <DigitalIDCard 
                  user={user}
                  trip={activeTrip}
                  onPress={handleQRDisplay}
                />
                <Text className="text-center text-primary-500 text-xs mt-2 font-medium">
                  Tap to show QR for checkpoints
                </Text>
              </>
            ) : (
              <View className="bg-secondary-50 border border-secondary-200 p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="card" size={24} color="#B45309" />
                  <View className="flex-1 ml-3">
                    <Text className="text-secondary-800 font-semibold">Digital Tourist ID</Text>
                    <Text className="text-primary-600 text-sm">
                      {activeTrip ? 'QR code ready for verification' : 'Start a trip to activate QR code'}
                    </Text>
                  </View>
                  {!activeTrip && (
                    <Ionicons name="lock-closed" size={20} color="#A8A29E" />
                  )}
                </View>
              </View>
            )}

            {/* Profile Action Button */}
            <Pressable
              className="bg-primary-600 py-3 rounded-xl mt-4"
              onPress={() => router.push('/profile' as any)}
            >
              <Text className="text-white font-bold text-center">View Full Profile</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mb-6">
          <Text className="text-primary-900 font-bold text-lg mb-4">Quick Actions</Text>
          
          {QuickActionGrid ? (
            <QuickActionGrid 
              onEmergencyPress={triggerEmergency}
              onMapPress={handleMapPress}
              onScanPress={handleScanPress}
              onLocationPress={handleLocationPress}
            />
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-danger/30 items-center"
                onPress={triggerEmergency}
              >
                <Ionicons name="alert-circle" size={28} color="#EF4444" />
                <Text className="text-danger font-semibold mt-2 text-center text-sm">Emergency</Text>
              </Pressable>

              <Pressable
                className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-secondary-300 items-center"
                onPress={() => router.push('/safety' as any)}
              >
                <Ionicons name="shield-checkmark" size={28} color="#B45309" />
                <Text className="text-secondary-700 font-semibold mt-2 text-center text-sm">Safety</Text>
              </Pressable>

              <Pressable
                className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-success/30 items-center"
                onPress={handleLocationPress}
              >
                <Ionicons name="location" size={28} color="#10B981" />
                <Text className="text-success font-semibold mt-2 text-center text-sm">Tracking</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Current Trip Details - Only show when TripStatusCard is available */}
        {(TripStatusCard && activeTrip) && (
          <View className="mx-4 mb-4">
            <TripStatusCard 
              trip={activeTrip}
              safetyScore={safetyScore}
              onViewDetails={handleViewTripDetails}
            />
          </View>
        )}

        {/* Notifications Preview - Only show when component is available */}
        {NotificationPreview && (
          <View className="mx-4 mb-4">
            <NotificationPreview 
              onViewAll={handleViewNotifications}
            />
          </View>
        )}

        {/* Recent Trips */}
        {recentTrips.length > 0 && (
          <View className="mx-4 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-primary-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-primary-900 font-bold text-lg">Recent Trips</Text>
                <Pressable onPress={handleViewPreviousTrips}>
                  <Text className="text-secondary-700 font-semibold">View All</Text>
                </Pressable>
              </View>
              
              {recentTrips.map((trip) => (
                <View key={trip.id} className="bg-primary-50 border border-primary-200 p-4 rounded-xl mb-3 last:mb-0">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-bold text-primary-900">{trip.title}</Text>
                      <Text className="text-primary-600 text-sm mt-1">{trip.destination}</Text>
                      <Text className="text-primary-500 text-xs mt-1">
                        {new Date(trip.startDate).toLocaleDateString('en-IN')} • {trip.duration} days
                      </Text>
                    </View>
                    <View className="bg-secondary-100 border border-secondary-300 px-3 py-1 rounded-full">
                      <Text className="text-secondary-800 text-xs font-semibold">Completed</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* App Footer Branding */}
        <View className="items-center py-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-secondary-600 rounded-full items-center justify-center mr-3">
              <Ionicons name="shield-checkmark" size={16} color="white" />
            </View>
            <Text className="text-secondary-700 font-bold text-lg">YatriSahayak</Text>
          </View>
          <Text className="text-primary-400 text-xs text-center">
            Digital Tourist Identity & Safety Platform
          </Text>
          <Text className="text-primary-300 text-xs text-center mt-1">
            Secure • Verified • Protected
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

