// File: app/(app)/trip-planner.tsx (Fixed router navigation)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import TripService from '@/services/tripService';
import { Trip, TripDestination, TripTemplate } from '@/types/trip';

const TripPlannerScreen: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<TripDestination[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<TripTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const [userTrips, destinations, templates] = await Promise.all([
        TripService.getUserTrips(user.id),
        TripService.searchDestinations({ limit: 6 }),
        TripService.getTripTemplates()
      ]);

      setTrips(userTrips);
      setPopularDestinations(destinations);
      setRecommendedTemplates(templates.slice(0, 4));
    } catch (error) {
      console.error('Error loading trip data:', error);
      Alert.alert('Error', 'Failed to load trip information');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleQuickPlanTrip = (destination: TripDestination) => {
    Alert.alert(
      'Plan Trip to ' + destination.name,
      'Would you like to create a quick trip or use a detailed planner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quick Plan',
          onPress: () => {
            router.push(`/trip-planner/create?destination=${encodeURIComponent(destination.name)}&city=${encodeURIComponent(destination.city)}`);
          }
        },
        {
          text: 'Detailed Planner',
          onPress: () => router.push('/trip-planner/create')
        }
      ]
    );
  };

  const handleStartTrip = async (trip: Trip) => {
    if (!user?.id) return;

    Alert.alert(
      'Start Trip: ' + trip.title,
      'This will:\n• Activate your Digital Tourist ID\n• Enable real-time safety monitoring\n• Generate QR code for verification\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Trip',
          style: 'default',
          onPress: async () => {
            try {
              const { trip: updatedTrip, digitalId } = await TripService.startTrip(trip.id, user.id);
              
              // Update local state
              setTrips(prev => prev.map(t => t.id === trip.id ? updatedTrip : t));
              
              Alert.alert(
                '🎉 Trip Started Successfully!',
                'Your Digital Tourist ID is now active with QR code verification. Stay safe and enjoy your trip!',
                [
                  { text: 'View Digital ID', onPress: () => router.push(`/trip-planner/trip/${trip.id}` as any) }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to start trip. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-primary-800">Trip Planner</Text>
            <Text className="text-sm text-primary-600">{getCurrentTimeGreeting()}, ready to explore?</Text>
          </View>
          <Pressable
            className="bg-secondary-600 px-4 py-2 rounded-lg flex-row items-center"
            onPress={() => router.push('/trip-planner/create')}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Plan Trip</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-primary-100 rounded-lg px-4 py-3">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-3 text-base text-primary-800"
            placeholder="Where do you want to go?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#A8A29E"
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                router.push(`/trip-planner/search-results?query=${encodeURIComponent(searchQuery)}`);
              }
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => router.push(`/trip-planner/search-results?query=${encodeURIComponent(searchQuery)}`)}>
              <Ionicons name="arrow-forward-circle" size={24} color="#ea580c" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Trip Highlight */}
        {trips.some(t => t.status === 'active') && (
          <View className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6">
            <View className="flex-row items-center">
              <Ionicons name="location" size={24} color="#059669" />
              <View className="flex-1 ml-3">
                <Text className="text-green-800 font-bold">You're currently on a trip!</Text>
                <Text className="text-green-700 text-sm">Your Digital Tourist ID is active with live tracking</Text>
              </View>
              <Pressable 
                className="bg-green-600 px-4 py-2 rounded-lg"
                onPress={() => {
                  const activeTrip = trips.find(t => t.status === 'active');
                  if (activeTrip) router.push(`/trip-planner/trip/${activeTrip.id}` as any);
                }}
              >
                <Text className="text-white font-semibold text-sm">View Details</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Quick Plan Actions */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-primary-800 mb-3">Quick Planning</Text>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-secondary-200 items-center"
              onPress={() => router.push('/trip-planner/create')}
            >
              <Ionicons name="map" size={32} color="#ea580c" />
              <Text className="text-sm font-semibold text-secondary-800 mt-2 text-center">Custom Trip</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-blue-200 items-center"
              onPress={() => router.push('/trip-planner/templates')}
            >
              <Ionicons name="library" size={32} color="#2563EB" />
              <Text className="text-sm font-semibold text-blue-800 mt-2 text-center">Trip Templates</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-purple-200 items-center"
              onPress={() => router.push('/trip-planner/destinations')}
            >
              <Ionicons name="compass" size={32} color="#7C3AED" />
              <Text className="text-sm font-semibold text-purple-800 mt-2 text-center">Explore</Text>
            </Pressable>
          </View>
        </View>

        {/* Popular Destinations */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-primary-800">Popular Destinations</Text>
            <Pressable onPress={() => router.push('/trip-planner/destinations')}>
              <Text className="text-secondary-600 font-medium">View All</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4">
              {popularDestinations.map((destination) => (
                <Pressable
                  key={destination.id}
                  className="bg-white rounded-xl shadow-sm border border-primary-200 overflow-hidden"
                  style={{ width: 200 }}
                  onPress={() => handleQuickPlanTrip(destination)}
                >
                  <View className="h-32 bg-primary-100 items-center justify-center">
                    {destination.imageUrl ? (
                      <Image source={{ uri: destination.imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Ionicons name="image" size={32} color="#A8A29E" />
                    )}
                    <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                      <Text className="text-white text-xs font-medium">{destination.category}</Text>
                    </View>
                  </View>
                  
                  <View className="p-3">
                    <Text className="text-sm font-bold text-primary-800">{destination.name}</Text>
                    <Text className="text-xs text-primary-600">{destination.city}, {destination.state}</Text>
                    
                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text className="text-xs text-primary-600 ml-1">{destination.popularityScore}/10</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={12} color="#666" />
                        <Text className="text-xs text-primary-600 ml-1">{destination.estimatedDuration}h</Text>
                      </View>
                    </View>

                    <Pressable
                      className="bg-secondary-600 py-2 rounded-lg mt-3"
                      onPress={() => handleQuickPlanTrip(destination)}
                    >
                      <Text className="text-white font-semibold text-center text-xs">Plan Trip</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recommended Trip Templates */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-primary-800">Recommended for You</Text>
            <Pressable onPress={() => router.push('/trip-planner/templates')}>
              <Text className="text-secondary-600 font-medium">View All</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {recommendedTemplates.map((template) => (
              <Pressable
                key={template.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-primary-200"
                onPress={() => router.push('/trip-planner/templates' as any)}
              >
                <View className="flex-row items-start">
                  <View className="w-16 h-16 bg-primary-100 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="map" size={24} color="#ea580c" />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary-800">{template.name}</Text>
                    <Text className="text-sm text-primary-600 mt-1" numberOfLines={2}>
                      {template.description}
                    </Text>
                    
                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={14} color="#666" />
                          <Text className="text-xs text-primary-600 ml-1">{template.duration} days</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text className="text-xs text-primary-600 ml-1">{template.rating}</Text>
                        </View>
                      </View>
                      
                      <Pressable
                        className="bg-secondary-100 px-3 py-1 rounded-lg"
                        onPress={() => router.push('/trip-planner/create')}
                      >
                        <Text className="text-secondary-800 font-semibold text-xs">Use Template</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Your Trips */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-primary-800">Your Trips</Text>
            <Pressable onPress={() => router.push('/trip-planner/all-trips')}>
              <Text className="text-secondary-600 font-medium">View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="bg-white p-6 rounded-xl shadow-sm border border-primary-200">
              <Text className="text-center text-primary-600">Loading your trips...</Text>
            </View>
          ) : trips.length === 0 ? (
            <View className="bg-white p-6 rounded-xl shadow-sm border border-primary-200">
              <View className="items-center">
                <Ionicons name="airplane" size={48} color="#A8A29E" />
                <Text className="text-primary-600 text-center mt-2 text-base font-medium">Ready for your first adventure?</Text>
                <Text className="text-primary-500 text-sm text-center mt-1">
                  Create a trip to get your Digital Tourist ID with safety monitoring
                </Text>
                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    className="bg-secondary-600 px-4 py-2 rounded-lg"
                    onPress={() => router.push('/trip-planner/create')}
                  >
                    <Text className="text-white font-semibold">Plan Custom Trip</Text>
                  </Pressable>
                  <Pressable
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                    onPress={() => router.push('/trip-planner/templates')}
                  >
                    <Text className="text-white font-semibold">Use Template</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {trips.slice(0, 3).map((trip) => (
                <Pressable
                  key={trip.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-primary-200"
                  onPress={() => router.push(`/trip-planner/trip/${trip.id}` as any)}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-primary-800">{trip.title}</Text>
                      <Text className="text-primary-600 text-sm">{trip.destination}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded border ${getStatusColor(trip.status)}`}>
                      <Text className="text-xs font-semibold capitalize">{trip.status}</Text>
                    </View>
                  </View>

                  {/* Safety Score */}
                  {trip.safetyIndex && (
                    <View className="flex-row items-center justify-between mb-3 p-2 rounded-lg bg-primary-50">
                      <View className="flex-row items-center">
                        <Ionicons name="shield" size={16} color="#666" />
                        <Text className="text-sm text-primary-700 ml-1">Safety Score</Text>
                      </View>
                      <View className={`px-2 py-1 rounded ${getSafetyScoreColor(trip.safetyIndex.overallScore)}`}>
                        <Text className="text-sm font-bold">{trip.safetyIndex.overallScore}/100</Text>
                      </View>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <Ionicons name="calendar" size={14} color="#666" />
                        <Text className="text-xs text-primary-600 ml-1">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={14} color="#666" />
                        <Text className="text-xs text-primary-600 ml-1">{trip.duration} days</Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    {trip.status === 'planned' && (
                      <Pressable
                        className="bg-green-600 px-3 py-2 rounded-lg"
                        onPress={() => handleStartTrip(trip)}
                      >
                        <Text className="text-white font-semibold text-xs">Start Trip</Text>
                      </Pressable>
                    )}

                    {trip.status === 'active' && (
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <Text className="text-green-600 font-semibold text-xs">Active</Text>
                      </View>
                    )}
                  </View>

                  {/* Digital ID Status */}
                  {trip.digitalId && (
                    <View className="mt-3 pt-3 border-t border-primary-200">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="qr-code" size={16} color="#059669" />
                          <Text className="text-sm text-green-700 ml-2 font-medium">Digital ID Active</Text>
                        </View>
                        <Pressable
                          className="bg-green-100 px-2 py-1 rounded"
                          onPress={() => router.push(`/trip-planner/trip/${trip.id}` as any)}
                        >
                          <Text className="text-green-800 font-semibold text-xs">View QR</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Travel Inspiration */}
        <View className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
          <View className="flex-row items-start">
            <Ionicons name="compass" size={24} color="#B45309" />
            <View className="flex-1 ml-3">
              <Text className="text-secondary-800 font-semibold mb-1">Discover India with Confidence</Text>
              <Text className="text-sm text-primary-700 leading-5">
                Plan your trips with Digital Tourist ID for enhanced safety, real-time monitoring, and seamless verification at checkpoints.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripPlannerScreen;
