// File: app/(app)/trip-planner/templates.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { TripTemplate } from '@/types/trip';

const TemplatesScreen: React.FC = () => {
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TripTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { key: '', label: 'All' },
    { key: 'historical', label: 'Historical' },
    { key: 'nature', label: 'Nature' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'adventure', label: 'Adventure' },
    { key: 'religious', label: 'Religious' },
    { key: 'beach', label: 'Beach' },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await TripService.getTripTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  };

  const filterTemplates = () => {
    if (!selectedCategory) {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.category === selectedCategory));
    }
  };

  const getDifficultyColor = (difficulty: TripTemplate['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'challenging': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderTemplateCard = ({ item }: { item: TripTemplate }) => (
    <Pressable
      className="bg-white rounded-xl shadow-sm border border-primary-200 mb-4 overflow-hidden"
      onPress={() => router.push(`/trip-planner/template/${item.id}`)}
    >
      {/* Image */}
      <View className="h-48 bg-primary-100 items-center justify-center">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Ionicons name="image" size={48} color="#A8A29E" />
        )}
        
        {/* Featured Badge */}
        {item.isFeatured && (
          <View className="absolute top-3 right-3 bg-secondary-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">Featured</Text>
          </View>
        )}

        {/* Rating */}
        <View className="absolute top-3 left-3 bg-black/70 px-2 py-1 rounded-full flex-row items-center">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-white text-xs font-bold ml-1">{item.rating}</Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-primary-800" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-primary-600 text-sm">{item.destination}</Text>
          </View>
          
          <View className="bg-secondary-100 px-2 py-1 rounded">
            <Text className="text-secondary-800 text-xs font-semibold">
              {item.duration} days
            </Text>
          </View>
        </View>

        <Text className="text-sm text-primary-700 leading-5 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Highlights */}
        <View className="mb-3">
          <Text className="text-xs font-semibold text-primary-800 mb-1">Highlights:</Text>
          <View className="flex-row flex-wrap gap-1">
            {item.highlights.slice(0, 3).map((highlight) => (
              <View key={highlight} className="bg-primary-100 px-2 py-1 rounded">
                <Text className="text-primary-700 text-xs">{highlight}</Text>
              </View>
            ))}
            {item.highlights.length > 3 && (
              <View className="bg-primary-100 px-2 py-1 rounded">
                <Text className="text-primary-700 text-xs">+{item.highlights.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Ionicons name="trending-up" size={14} color={getDifficultyColor(item.difficulty).includes('green') ? '#10B981' : getDifficultyColor(item.difficulty).includes('yellow') ? '#F59E0B' : '#EF4444'} />
              <Text className={`text-xs ml-1 capitalize ${getDifficultyColor(item.difficulty)}`}>
                {item.difficulty}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="people" size={14} color="#666" />
              <Text className="text-xs text-primary-600 ml-1">{item.reviewCount} reviews</Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-secondary-600">
            ₹{item.estimatedBudget.total.toLocaleString('en-IN')}
          </Text>
        </View>

        <Pressable
          className="bg-secondary-600 py-3 rounded-lg mt-3"
          onPress={() => router.push(`/trip-planner/template/${item.id}/create`)}
        >
          <Text className="text-white font-semibold text-center">Use This Template</Text>
        </Pressable>
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
          <Text className="text-xl font-bold text-primary-800">Trip Templates</Text>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <Pressable
                key={category.key}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category.key
                    ? 'bg-secondary-600 border-secondary-600'
                    : 'bg-white border-primary-300'
                }`}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text className={`text-sm font-medium ${
                  selectedCategory === category.key ? 'text-white' : 'text-primary-700'
                }`}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results Header */}
      <View className="px-4 py-3 bg-white border-b border-primary-200">
        <Text className="text-sm text-primary-600">
          {isLoading ? 'Loading...' : `${filteredTemplates.length} templates available`}
        </Text>
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="library" size={64} color="#A8A29E" />
              <Text className="text-lg font-semibold text-primary-800 mt-4 mb-2">No Templates Found</Text>
              <Text className="text-primary-600 text-center">
                {selectedCategory
                  ? 'Try selecting a different category'
                  : 'Check back later for more trip templates'
                }
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default TemplatesScreen;
