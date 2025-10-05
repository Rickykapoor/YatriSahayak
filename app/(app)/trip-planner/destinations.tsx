// File: app/(app)/trip-planner/destinations.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TripService } from '@/services/tripService';
import { TripDestination } from '@/types/trip';

const DestinationsScreen: React.FC = () => {
  const [destinations, setDestinations] = useState<TripDestination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<TripDestination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { key: '', label: 'All', icon: 'apps' },
    { key: 'historical', label: 'Historical', icon: 'library' },
    { key: 'religious', label: 'Religious', icon: 'flower' },
    { key: 'nature', label: 'Nature', icon: 'leaf' },
    { key: 'adventure', label: 'Adventure', icon: 'flame' },
    { key: 'cultural', label: 'Cultural', icon: 'color-palette' },
    { key: 'beach', label: 'Beach', icon: 'water' },
    { key: 'mountain', label: 'Mountain', icon: 'triangle' },
    { key: 'city', label: 'City', icon: 'business' },
  ];

  const indianStates = [
    '', 'Delhi', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'Kerala', 'Goa', 
    'Tamil Nadu', 'Karnataka', 'Gujarat', 'West Bengal', 'Himachal Pradesh'
  ];

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [destinations, searchQuery, selectedCategory, selectedState]);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const data = await TripService.searchDestinations({
        limit: 100,
      });
      setDestinations(data);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDestinations();
    setRefreshing(false);
  };

  const filterDestinations = useCallback(() => {
    let filtered = destinations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(query) ||
        dest.city.toLowerCase().includes(query) ||
        dest.state.toLowerCase().includes(query) ||
        dest.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(dest => dest.category === selectedCategory);
    }

    if (selectedState) {
      filtered = filtered.filter(dest => dest.state === selectedState);
    }

    setFilteredDestinations(filtered);
  }, [destinations, searchQuery, selectedCategory, selectedState]);

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderDestinationCard = ({ item }: { item: TripDestination }) => (
    <Pressable
      className="bg-white rounded-xl shadow-sm border border-primary-200 mb-4 overflow-hidden"
      onPress={() => router.push(`/trip-planner/destination/${item.id}`)}
    >
      {/* Image Placeholder */}
      <View className="h-48 bg-primary-100 items-center justify-center">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Ionicons name="image" size={48} color="#A8A29E" />
        )}
        
        {/* Category Badge */}
        <View className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-medium capitalize">{item.category}</Text>
        </View>

        {/* Popularity Badge */}
        <View className="absolute top-3 left-3 bg-secondary-600 px-2 py-1 rounded-full flex-row items-center">
          <Ionicons name="star" size={12} color="white" />
          <Text className="text-white text-xs font-bold ml-1">{item.popularityScore}/10</Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-primary-800" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-primary-600 text-sm">{item.city}, {item.state}</Text>
          </View>
          
          {item.entryFee !== undefined && (
            <View className="bg-secondary-100 px-2 py-1 rounded">
              <Text className="text-secondary-800 text-xs font-semibold">
                {item.entryFee === 0 ? 'Free' : `₹${item.entryFee}`}
              </Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text className="text-sm text-primary-700 leading-5 mb-3" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons name="time" size={14} color="#666" />
              <Text className="text-xs text-primary-600 ml-1">{item.estimatedDuration}h</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="shield" size={14} color={getSafetyColor(item.safetyRating).includes('green') ? '#10B981' : getSafetyColor(item.safetyRating).includes('yellow') ? '#F59E0B' : '#EF4444'} />
              <Text className={`text-xs ml-1 font-semibold ${getSafetyColor(item.safetyRating)}`}>
                {item.safetyRating}/5
              </Text>
            </View>
          </View>

          <Pressable
            className="bg-secondary-600 px-4 py-2 rounded-lg"
            onPress={() => router.push(`/trip-planner/destination/${item.id}/add-to-trip`)}
          >
            <Text className="text-white text-xs font-semibold">Add to Trip</Text>
          </Pressable>
        </View>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} className="bg-primary-100 px-2 py-1 rounded">
                <Text className="text-primary-700 text-xs">{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <View className="bg-primary-100 px-2 py-1 rounded">
                <Text className="text-primary-700 text-xs">+{item.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <Text className="text-xl font-bold text-primary-800">Explore Destinations</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-primary-100 rounded-lg px-4 py-3 mb-3">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-3 text-base text-primary-800"
            placeholder="Search destinations, cities, or attractions..."
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

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <Pressable
                key={category.key}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  selectedCategory === category.key
                    ? 'bg-secondary-600 border-secondary-600'
                    : 'bg-white border-primary-300'
                }`}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.key ? 'white' : '#666'} 
                />
                <Text className={`ml-2 text-sm font-medium ${
                  selectedCategory === category.key ? 'text-white' : 'text-primary-700'
                }`}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* State Filter */}
      <View className="bg-white px-4 py-2 border-b border-primary-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {indianStates.map((state) => (
              <Pressable
                key={state || 'all'}
                className={`px-3 py-1 rounded-full ${
                  selectedState === state
                    ? 'bg-secondary-100'
                    : 'bg-primary-100'
                }`}
                onPress={() => setSelectedState(state)}
              >
                <Text className={`text-sm ${
                  selectedState === state
                    ? 'text-secondary-800 font-semibold'
                    : 'text-primary-700'
                }`}>
                  {state || 'All States'}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results Header */}
      <View className="px-4 py-3 bg-white border-b border-primary-200">
        <Text className="text-sm text-primary-600">
          {isLoading ? 'Loading...' : `${filteredDestinations.length} destinations found`}
        </Text>
      </View>

      {/* Destinations List */}
      <FlatList
        data={filteredDestinations}
        renderItem={renderDestinationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="compass" size={64} color="#A8A29E" />
              <Text className="text-lg font-semibold text-primary-800 mt-4 mb-2">No Destinations Found</Text>
              <Text className="text-primary-600 text-center">
                {searchQuery || selectedCategory || selectedState
                  ? 'Try adjusting your filters to see more results'
                  : 'Discover amazing places to visit in India'
                }
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default DestinationsScreen;
