import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTourist } from '@/context/TouristContext';
import  TripPlanningForm from '@/components/TripPlanningForm';
import ActiveTripDashboard from '@/components/ActiveTripDashboard';
import UpcomingTripsManager from '@/components/UpcomingTripsManager';
import DestinationCard from '@/components/DestinationCard';
import { Destination, Trip } from '@/types/auth';

type TabType = 'plan' | 'active' | 'upcoming';

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  companions: string[];
  accommodations: string[];
}

const TripPlannerScreen: React.FC = () => {
  const { currentTrip, upcomingTrips, createTrip } = useTourist();
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const popularDestinations: Destination[] = [
    { id: 1, name: 'Goa', safetyScore: 85, image: 'beach', description: 'Beautiful beaches and nightlife' },
    { id: 2, name: 'Kerala', safetyScore: 90, image: 'backwaters', description: 'Serene backwaters and hill stations' },
    { id: 3, name: 'Rajasthan', safetyScore: 78, image: 'palace', description: 'Royal palaces and desert landscapes' },
    { id: 4, name: 'Himachal Pradesh', safetyScore: 82, image: 'mountains', description: 'Snow-capped mountains and adventure sports' },
  ];

  const handleCreateTrip = useCallback(async (tripData: TripFormData): Promise<void> => {
    try {
      const tripPayload: Partial<Trip> = {
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        companions: tripData.companions,
        status: 'planned',
      };
      
      await createTrip(tripPayload);
      Alert.alert('Success', 'Trip created successfully!');
      setActiveTab('active');
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip');
    }
  }, [createTrip]);

  const handleDestinationSelect = useCallback((destination: Destination): void => {
    // Pre-fill form with selected destination
    console.log('Selected destination:', destination);
  }, []);

  const handleTabChange = useCallback((tab: TabType): void => {
    setActiveTab(tab);
  }, []);

  const handleQuickTripType = useCallback((type: 'weekend' | 'vacation' | 'business'): void => {
    // Pre-configure form based on trip type
    console.log('Quick trip type:', type);
  }, []);

  const renderTabButton = (tab: TabType, title: string, badge?: number) => (
    <Pressable
      key={tab}
      className={`flex-1 py-2 px-3 rounded-lg relative ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
      onPress={() => handleTabChange(tab)}
    >
      <Text className={`text-sm font-medium text-center ${activeTab === tab ? 'text-secondary-700' : 'text-primary-500'}`}>
        {title}
      </Text>
      {badge && badge > 0 && (
        <View className="absolute -top-0.5 -right-2 w-5 h-5 bg-danger rounded-full justify-center items-center">
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white pt-14 px-4 pb-4 border-b border-primary-200">
        <Text className="text-2xl font-bold text-primary-800 mb-4">Trip Planner</Text>
        
        {/* Tab Switcher */}
        <View className="flex-row bg-primary-100 rounded-lg p-0.5">
          {renderTabButton('plan', 'Plan New')}
          {renderTabButton('active', 'Active', currentTrip ? 1 : 0)}
          {renderTabButton('upcoming', 'Upcoming', upcomingTrips.length)}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {activeTab === 'plan' && (
          <View>
            {/* Search Bar */}
            <View className="flex-row items-center bg-white m-4 px-4 py-3 rounded-xl shadow-sm">
              <Ionicons name="search" size={20} color="#A8A29E" />
              <TextInput
                className="flex-1 text-base text-primary-800 ml-3"
                placeholder="Search destinations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#A8A29E"
              />
            </View>

            {/* Quick Start Options */}
            <View className="m-4">
              <Text className="text-xl font-semibold text-primary-800 mb-3">Quick Start</Text>
              <View className="flex-row gap-3">
                <Pressable 
                  className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm"
                  onPress={() => handleQuickTripType('weekend')}
                >
                  <Ionicons name="calendar" size={24} color="#B45309" />
                  <Text className="text-sm font-medium text-primary-800 text-center mt-2">Weekend Getaway</Text>
                </Pressable>
                
                <Pressable 
                  className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm"
                  onPress={() => handleQuickTripType('vacation')}
                >
                  <Ionicons name="airplane" size={24} color="#B45309" />
                  <Text className="text-sm font-medium text-primary-800 text-center mt-2">Long Vacation</Text>
                </Pressable>
                
                <Pressable 
                  className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm"
                  onPress={() => handleQuickTripType('business')}
                >
                  <Ionicons name="business" size={24} color="#B45309" />
                  <Text className="text-sm font-medium text-primary-800 text-center mt-2">Business Trip</Text>
                </Pressable>
              </View>
            </View>

            {/* Popular Destinations */}
            <View className="m-4">
              <Text className="text-xl font-semibold text-primary-800 mb-3">Popular Destinations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3 px-1">
                  {popularDestinations.map((destination: Destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      onSelect={() => handleDestinationSelect(destination)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Trip Planning Form */}
            <TripPlanningForm onSubmit={handleCreateTrip} />
          </View>
        )}

        {activeTab === 'active' && (
          <View>
            {currentTrip ? (
              <ActiveTripDashboard trip={currentTrip} />
            ) : (
              <View className="items-center p-10">
                <Ionicons name="map-outline" size={64} color="#A8A29E" />
                <Text className="text-xl font-semibold text-primary-800 mt-4 mb-2">No Active Trip</Text>
                <Text className="text-base text-primary-500 text-center mb-6">
                  Plan a new trip to get started
                </Text>
                <Pressable 
                  className="bg-secondary-700 px-8 py-4 rounded-xl shadow-lg"
                  onPress={() => setActiveTab('plan')}
                >
                  <Text className="text-white text-base font-semibold">Plan Trip</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {activeTab === 'upcoming' && (
          <UpcomingTripsManager trips={upcomingTrips} />
        )}
      </ScrollView>
    </View>
  );
};

export default TripPlannerScreen;
