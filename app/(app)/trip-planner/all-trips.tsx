// File: app/(app)/trip-planner/all-trips.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import TripService from '@/services/tripService';
import { Trip } from '@/types/trip';

const AllTripsScreen: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Trip['status'] | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statusFilters: { key: Trip['status'] | ''; label: string }[] = [
    { key: '', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'planned', label: 'Planned' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    loadTrips();
  }, [user?.id]);

  useEffect(() => {
    filterTrips();
  }, [trips, searchQuery, selectedStatus]);

  const loadTrips = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const userTrips = await TripService.getUserTrips(user.id);
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const filterTrips = () => {
    let filtered = trips;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.title.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        trip.description?.toLowerCase().includes(query)
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(trip => trip.status === selectedStatus);
    }

    setFilteredTrips(filtered);
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <Pressable
      className="bg-white p-4 rounded-xl shadow-sm border border-primary-200 mb-3"
      onPress={() => router.push(`/trip-planner/trip/${item.id}`)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-primary-800">{item.title}</Text>
          <Text className="text-primary-600 text-sm">{item.destination}</Text>
        </View>
        <View className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-semibold capitalize">{item.status}</Text>
        </View>
      </View>

      {item.description && (
        <Text className="text-sm text-primary-700 mb-3" numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={14} color="#666" />
            <Text className="text-xs text-primary-600 ml-1">
              {formatDate(item.startDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color="#666" />
            <Text className="text-xs text-primary-600 ml-1">{item.duration} days</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="people" size={14} color="#666" />
            <Text className="text-xs text-primary-600 ml-1 capitalize">{item.tripType}</Text>
          </View>
        </View>

        {item.budget && item.budget.total > 0 && (
          <Text className="text-sm font-semibold text-secondary-600">
            ₹{item.budget.total.toLocaleString('en-IN')}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#44403C" />
            </Pressable>
            <Text className="text-xl font-bold text-primary-800">All Trips</Text>
          </View>
          <Pressable
            className="bg-secondary-600 px-4 py-2 rounded-lg"
            onPress={() => router.push('/trip-planner/create')}
          >
            <Text className="text-white font-semibold text-sm">New Trip</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-primary-100 rounded-lg px-4 py-3 mb-3">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-3 text-base text-primary-800"
            placeholder="Search trips..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#A8A29E"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </Pressable>
          )}
        </View>

        {/* Status Filter */}
        <View className="flex-row gap-2">
          {statusFilters.map((filter) => (
            <Pressable
              key={filter.key || 'all'}
              className={`px-3 py-2 rounded-full border ${
                selectedStatus === filter.key
                  ? 'bg-secondary-600 border-secondary-600'
                  : 'bg-white border-primary-300'
              }`}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <Text className={`text-sm font-medium ${
                selectedStatus === filter.key ? 'text-white' : 'text-primary-700'
              }`}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Results Header */}
      <View className="px-4 py-3 bg-white border-b border-primary-200">
        <Text className="text-sm text-primary-600">
          {isLoading ? 'Loading...' : `${filteredTrips.length} trips found`}
        </Text>
      </View>

      {/* Trips List */}
      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="airplane" size={64} color="#A8A29E" />
              <Text className="text-lg font-semibold text-primary-800 mt-4 mb-2">
                {searchQuery || selectedStatus ? 'No Matching Trips' : 'No Trips Yet'}
              </Text>
              <Text className="text-primary-600 text-center mb-6">
                {searchQuery || selectedStatus
                  ? 'Try adjusting your search or filters'
                  : 'Start planning your first adventure!'
                }
              </Text>
              <Pressable
                className="bg-secondary-600 px-6 py-3 rounded-lg"
                onPress={() => router.push('/trip-planner/create')}
              >
                <Text className="text-white font-semibold">Create New Trip</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default AllTripsScreen;
