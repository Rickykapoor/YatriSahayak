// File: app/(app)/trip-planner/search-results.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TripService from '@/services/tripService';
import { TripDestination } from '@/types/trip';

const SearchResultsScreen: React.FC = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [destinations, setDestinations] = useState<TripDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchDestinations();
    }
  }, [query]);

  const searchDestinations = async () => {
    if (!query) return;

    try {
      setIsLoading(true);
      const results = await TripService.searchDestinations({
        query: decodeURIComponent(query),
        limit: 50
      });
      setDestinations(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search destinations');
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Image */}
      <View className="h-32 bg-primary-100 items-center justify-center">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Ionicons name="image" size={32} color="#A8A29E" />
        )}
        
        {/* Category Badge */}
        <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
          <Text className="text-white text-xs font-medium capitalize">{item.category}</Text>
        </View>

        {/* Popularity Badge */}
        <View className="absolute top-2 left-2 bg-secondary-600 px-2 py-1 rounded flex-row items-center">
          <Ionicons name="star" size={10} color="white" />
          <Text className="text-white text-xs font-bold ml-1">{item.popularityScore}/10</Text>
        </View>
      </View>

      <View className="p-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-base font-bold text-primary-800" numberOfLines={1}>
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
          <Text className="text-sm text-primary-700 leading-5 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Ionicons name="time" size={12} color="#666" />
              <Text className="text-xs text-primary-600 ml-1">{item.estimatedDuration}h</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="shield" size={12} color={getSafetyColor(item.safetyRating).includes('green') ? '#10B981' : getSafetyColor(item.safetyRating).includes('yellow') ? '#F59E0B' : '#EF4444'} />
              <Text className={`text-xs ml-1 font-semibold ${getSafetyColor(item.safetyRating)}`}>
                {item.safetyRating}/5
              </Text>
            </View>
          </View>

          <Pressable
            className="bg-secondary-600 px-3 py-1 rounded"
            onPress={() => Alert.alert('Add to Trip', 'Feature coming soon!')}
          >
            <Text className="text-white text-xs font-semibold">Add to Trip</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200">
        <View className="flex-row items-center mb-2">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#44403C" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-bold text-primary-800">Search Results</Text>
            <Text className="text-sm text-primary-600">"{decodeURIComponent(query || '')}"</Text>
          </View>
        </View>
        
        <Text className="text-sm text-primary-600">
          {isLoading ? 'Searching...' : `${destinations.length} destinations found`}
        </Text>
      </View>

      {/* Results */}
      <FlatList
        data={destinations}
        renderItem={renderDestinationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="search" size={64} color="#A8A29E" />
              <Text className="text-lg font-semibold text-primary-800 mt-4 mb-2">No Results Found</Text>
              <Text className="text-primary-600 text-center mb-4">
                Try searching for other destinations or use different keywords
              </Text>
              <Pressable
                className="bg-secondary-600 px-6 py-3 rounded-lg"
                onPress={() => router.push('/trip-planner/destinations')}
              >
                <Text className="text-white font-semibold">Explore All Destinations</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default SearchResultsScreen;
