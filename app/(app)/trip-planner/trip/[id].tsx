// File: app/(app)/trip-planner/trip/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import TripService from '@/services/tripService';
import { Trip } from '@/types/trip';

const TripDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      loadTrip();
    }
  }, [id, user?.id]);

  const loadTrip = async () => {
    if (!id || !user?.id) return;

    try {
      setIsLoading(true);
      const tripData = await TripService.getTripById(id, user.id);
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrip();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (newStatus: Trip['status']) => {
    if (!trip || !user?.id) return;

    try {
      const updatedTrip = await TripService.updateTrip(trip.id, user.id, { status: newStatus });
      setTrip(updatedTrip);
      
      if (newStatus === 'active') {
        Alert.alert('Trip Started!', 'Your digital tourist ID is now active. Safe travels!');
      }
    } catch (error) {
      console.error('Error updating trip status:', error);
      Alert.alert('Error', 'Failed to update trip status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planned': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-primary-600 text-lg">Loading trip details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle" size={64} color="#F59E0B" />
          <Text className="text-xl font-bold text-primary-800 mt-4 mb-2">Trip Not Found</Text>
          <Text className="text-primary-600 text-center mb-6">The trip you're looking for doesn't exist or has been removed.</Text>
          <Pressable
            className="bg-secondary-600 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#44403C" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-lg font-bold text-primary-800" numberOfLines={1}>{trip.title}</Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(trip.status)}`} />
                <Text className="text-sm text-primary-600 capitalize">{trip.status}</Text>
              </View>
            </View>
          </View>
          <Pressable
            className="bg-secondary-600 px-4 py-2 rounded-lg"
            onPress={() => router.push(`/trip-planner/trip/${trip.id}/edit`)}
          >
            <Text className="text-white font-semibold text-sm">Edit</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Overview Card */}
        <View className="bg-white m-4 p-4 rounded-xl shadow-sm border border-primary-200">
          <Text className="text-xl font-bold text-primary-800 mb-1">{trip.title}</Text>
          <Text className="text-primary-600 mb-3">{trip.destination}</Text>
          
          {trip.description && (
            <Text className="text-sm text-primary-700 leading-5 mb-4">{trip.description}</Text>
          )}

          <View className="border-t border-primary-200 pt-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#666" />
                <Text className="text-sm text-primary-600 ml-2">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </Text>
              </View>
              <Text className="text-sm font-semibold text-secondary-600">{trip.duration} days</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="people" size={16} color="#666" />
                <Text className="text-sm text-primary-600 ml-2 capitalize">{trip.tripType} trip</Text>
              </View>
              {trip.budget && (
                <Text className="text-sm font-semibold text-secondary-600">
                  ₹{trip.budget.total.toLocaleString('en-IN')}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-primary-800 mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            {trip.status === 'draft' && (
              <>
                <Pressable
                  className="flex-1 bg-secondary-600 p-3 rounded-lg"
                  onPress={() => router.push(`/trip-planner/trip/${trip.id}/edit`)}
                >
                  <Text className="text-white font-semibold text-center">Complete Planning</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-blue-600 p-3 rounded-lg"
                  onPress={() => handleStatusUpdate('planned')}
                >
                  <Text className="text-white font-semibold text-center">Mark as Planned</Text>
                </Pressable>
              </>
            )}
            
            {trip.status === 'planned' && (
              <>
                <Pressable
                  className="flex-1 bg-green-600 p-3 rounded-lg"
                  onPress={() => handleStatusUpdate('active')}
                >
                  <Text className="text-white font-semibold text-center">Start Trip</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-secondary-600 p-3 rounded-lg"
                  onPress={() => router.push(`/trip-planner/trip/${trip.id}/edit`)}
                >
                  <Text className="text-white font-semibold text-center">Edit Trip</Text>
                </Pressable>
              </>
            )}
            
            {trip.status === 'active' && (
              <>
                <Pressable
                  className="flex-1 bg-blue-600 p-3 rounded-lg"
                  onPress={() => router.push(`/tracking?tripId=${trip.id}`)}
                >
                  <Text className="text-white font-semibold text-center">Live Tracking</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-red-600 p-3 rounded-lg"
                  onPress={() => router.push('/(app)/safety')}
                >
                  <Text className="text-white font-semibold text-center">Emergency</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Budget Breakdown */}
        {trip.budget && trip.budget.total > 0 && (
          <View className="bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm border border-primary-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-primary-800">Budget</Text>
              <Text className="text-xl font-bold text-secondary-600">
                ₹{trip.budget.total.toLocaleString('en-IN')}
              </Text>
            </View>

            <View className="space-y-2">
              {[
                { label: 'Accommodation', amount: trip.budget.accommodation, icon: 'bed' },
                { label: 'Food', amount: trip.budget.food, icon: 'restaurant' },
                { label: 'Transport', amount: trip.budget.transport, icon: 'car' },
                { label: 'Activities', amount: trip.budget.activities, icon: 'camera' },
                { label: 'Shopping', amount: trip.budget.shopping, icon: 'bag' },
                { label: 'Miscellaneous', amount: trip.budget.miscellaneous, icon: 'ellipsis-horizontal' }
              ].filter(item => item.amount > 0).map((item) => (
                <View key={item.label} className="flex-row items-center justify-between py-1">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={item.icon as any} size={16} color="#666" />
                    <Text className="text-primary-700 ml-2">{item.label}</Text>
                  </View>
                  <Text className="font-semibold text-primary-800">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preferences */}
        <View className="bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm border border-primary-200">
          <Text className="text-lg font-bold text-primary-800 mb-3">Trip Preferences</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-secondary-100 px-3 py-1 rounded-full">
              <Text className="text-secondary-800 text-sm font-medium capitalize">
                {trip.preferences.budgetRange.replace('-', ' ')}
              </Text>
            </View>
            <View className="bg-secondary-100 px-3 py-1 rounded-full">
              <Text className="text-secondary-800 text-sm font-medium capitalize">
                {trip.preferences.activityLevel}
              </Text>
            </View>
            <View className="bg-secondary-100 px-3 py-1 rounded-full">
              <Text className="text-secondary-800 text-sm font-medium capitalize">
                {trip.preferences.accommodationType.replace('_', ' ')}
              </Text>
            </View>
            {trip.preferences.interests.map((interest) => (
              <View key={interest} className="bg-primary-100 px-3 py-1 rounded-full">
                <Text className="text-primary-800 text-sm font-medium">{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripDetailsScreen;
