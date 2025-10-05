// File: app/(app)/trip-planner/trip/[id]/itinerary.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { TripService } from '@/services/tripService';
import { Trip, TripItineraryItem } from '@/types/trip';

const ItineraryScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<TripItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    if (id && user?.id) {
      loadTripItinerary();
    }
  }, [id, user?.id]);

  const loadTripItinerary = async () => {
    if (!id || !user?.id) return;

    try {
      setIsLoading(true);
      const tripData = await TripService.getTripById(id, user.id);
      setTrip(tripData);
      if (tripData?.itinerary) {
        setItinerary(tripData.itinerary);
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
      Alert.alert('Error', 'Failed to load trip itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const groupItineraryByDay = (items: TripItineraryItem[]) => {
    const grouped: { [day: number]: TripItineraryItem[] } = {};
    
    items.forEach(item => {
      if (!grouped[item.dayNumber]) {
        grouped[item.dayNumber] = [];
      }
      grouped[item.dayNumber].push(item);
    });

    // Sort items within each day by order index
    Object.keys(grouped).forEach(day => {
      grouped[parseInt(day)].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return grouped;
  };

  const getTransportIcon = (mode: TripItineraryItem['transportMode']) => {
    switch (mode) {
      case 'walking': return 'walk';
      case 'taxi': return 'car';
      case 'bus': return 'bus';
      case 'train': return 'train';
      case 'flight': return 'airplane';
      case 'own_vehicle': return 'car-sport';
      default: return 'location';
    }
  };

  const getPriorityColor = (priority: TripItineraryItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-primary-600 text-lg">Loading itinerary...</Text>
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

  const groupedItinerary = groupItineraryByDay(itinerary);
  const totalDays = trip.duration;

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
              <Text className="text-lg font-bold text-primary-800">Itinerary</Text>
              <Text className="text-sm text-primary-600">{trip.title}</Text>
            </View>
          </View>
          <Pressable
            className="bg-secondary-600 px-4 py-2 rounded-lg"
            onPress={() => router.push(`/trip-planner/trip/${trip.id}/add-destination`)}
          >
            <Text className="text-white font-semibold text-sm">Add Stop</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Trip Overview */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-primary-200 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-primary-600">Trip Duration</Text>
              <Text className="text-2xl font-bold text-primary-800">{totalDays} Days</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-primary-600">Total Stops</Text>
              <Text className="text-2xl font-bold text-secondary-600">{itinerary.length}</Text>
            </View>
          </View>
        </View>

        {/* Itinerary by Day */}
        {Array.from({ length: totalDays }, (_, index) => index + 1).map(dayNumber => {
          const dayItems = groupedItinerary[dayNumber] || [];
          const dayDate = new Date(trip.startDate);
          dayDate.setDate(dayDate.getDate() + dayNumber - 1);

          return (
            <View key={dayNumber} className="mb-6">
              {/* Day Header */}
              <View className="bg-white p-4 rounded-xl shadow-sm border border-primary-200 mb-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-primary-800">Day {dayNumber}</Text>
                    <Text className="text-sm text-primary-600">
                      {dayDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-primary-600 mr-2">
                      {dayItems.length} stops
                    </Text>
                    <Pressable
                      className="bg-secondary-100 p-2 rounded-lg"
                      onPress={() => router.push(`/trip-planner/trip/${trip.id}/add-destination?day=${dayNumber}`)}
                    >
                      <Ionicons name="add" size={16} color="#B45309" />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Day Items */}
              {dayItems.length === 0 ? (
                <View className="bg-white p-6 rounded-xl shadow-sm border border-primary-200 border-dashed">
                  <View className="items-center">
                    <Ionicons name="add-circle-outline" size={32} color="#A8A29E" />
                    <Text className="text-primary-600 mt-2 mb-3">No activities planned for this day</Text>
                    <Pressable
                      className="bg-secondary-600 px-4 py-2 rounded-lg"
                      onPress={() => router.push(`/trip-planner/trip/${trip.id}/add-destination?day=${dayNumber}`)}
                    >
                      <Text className="text-white font-semibold text-sm">Add Activity</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="space-y-3">
                  {dayItems.map((item, index) => (
                    <View key={item.id} className="relative">
                      {/* Timeline Connector */}
                      {index < dayItems.length - 1 && (
                        <View className="absolute left-6 top-12 w-0.5 h-8 bg-primary-300 z-0" />
                      )}

                      <View className="bg-white p-4 rounded-xl shadow-sm border border-primary-200 relative z-10">
                        <View className="flex-row items-start">
                          {/* Timeline Dot & Transport Icon */}
                          <View className="items-center mr-4">
                            <View className="bg-secondary-600 w-6 h-6 rounded-full items-center justify-center">
                              <Text className="text-white text-xs font-bold">{index + 1}</Text>
                            </View>
                            {item.transportMode && index > 0 && (
                              <View className="mt-2 bg-primary-100 p-1 rounded">
                                <Ionicons 
                                  name={getTransportIcon(item.transportMode)} 
                                  size={12} 
                                  color="#666" 
                                />
                              </View>
                            )}
                          </View>

                          {/* Item Content */}
                          <View className="flex-1">
                            <View className="flex-row items-start justify-between mb-2">
                              <View className="flex-1">
                                <Text className="text-lg font-bold text-primary-800">
                                  {item.destination.name}
                                </Text>
                                <Text className="text-sm text-primary-600">
                                  {item.destination.city}
                                </Text>
                              </View>
                              
                              <View className="items-end ml-3">
                                {item.startTime && (
                                  <Text className="text-sm font-semibold text-secondary-600">
                                    {formatTime(item.startTime)}
                                  </Text>
                                )}
                                {item.endTime && (
                                  <Text className="text-xs text-primary-500">
                                    - {formatTime(item.endTime)}
                                  </Text>
                                )}
                              </View>
                            </View>

                            {/* Item Details */}
                            <View className="flex-row items-center gap-4 mb-2">
                              <View className="flex-row items-center">
                                <Ionicons name="time" size={14} color="#666" />
                                <Text className="text-xs text-primary-600 ml-1">
                                  {item.estimatedDuration}h
                                </Text>
                              </View>
                              
                              <View className="flex-row items-center">
                                <Ionicons name="flag" size={14} color={getPriorityColor(item.priority).includes('red') ? '#EF4444' : getPriorityColor(item.priority).includes('yellow') ? '#F59E0B' : '#10B981'} />
                                <Text className={`text-xs ml-1 font-medium ${getPriorityColor(item.priority)}`}>
                                  {item.priority}
                                </Text>
                              </View>

                              {item.isCompleted && (
                                <View className="bg-green-100 px-2 py-1 rounded">
                                  <Text className="text-green-800 text-xs font-medium">Completed</Text>
                                </View>
                              )}
                            </View>

                            {/* Notes */}
                            {item.notes && (
                              <Text className="text-sm text-primary-700 leading-5 mb-2">
                                {item.notes}
                              </Text>
                            )}

                            {/* Action Buttons */}
                            <View className="flex-row gap-2 mt-2">
                              <Pressable
                                className="flex-1 bg-secondary-100 py-2 rounded-lg"
                                onPress={() => setEditingItem(editingItem === item.id ? null : item.id)}
                              >
                                <Text className="text-secondary-800 text-center text-sm font-medium">
                                  Edit
                                </Text>
                              </Pressable>
                              
                              {trip.status === 'active' && !item.isCompleted && (
                                <Pressable
                                  className="flex-1 bg-green-100 py-2 rounded-lg"
                                  onPress={() => {
                                    // Mark as completed
                                    Alert.alert('Mark as Completed', 'Mark this activity as completed?');
                                  }}
                                >
                                  <Text className="text-green-800 text-center text-sm font-medium">
                                    Complete
                                  </Text>
                                </Pressable>
                              )}
                            </View>

                            {/* Edit Form */}
                            {editingItem === item.id && (
                              <View className="mt-3 p-3 bg-primary-50 rounded-lg border-t border-primary-200">
                                <Text className="font-semibold text-primary-800 mb-2">Edit Notes</Text>
                                <TextInput
                                  className="border border-primary-300 rounded-lg px-3 py-2 text-sm text-primary-800 bg-white"
                                  placeholder="Add notes for this activity..."
                                  value={item.notes || ''}
                                  onChangeText={(text) => {
                                    // Update notes in state
                                    setItinerary(prev => prev.map(i => 
                                      i.id === item.id ? { ...i, notes: text } : i
                                    ));
                                  }}
                                  multiline
                                  numberOfLines={2}
                                />
                                <View className="flex-row gap-2 mt-2">
                                  <Pressable
                                    className="flex-1 bg-secondary-600 py-2 rounded-lg"
                                    onPress={() => {
                                      // Save changes
                                      setEditingItem(null);
                                      Alert.alert('Saved', 'Changes saved successfully');
                                    }}
                                  >
                                    <Text className="text-white text-center text-sm font-medium">Save</Text>
                                  </Pressable>
                                  <Pressable
                                    className="flex-1 bg-gray-300 py-2 rounded-lg"
                                    onPress={() => setEditingItem(null)}
                                  >
                                    <Text className="text-gray-800 text-center text-sm font-medium">Cancel</Text>
                                  </Pressable>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Trip Summary */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-primary-200">
          <Text className="text-lg font-bold text-primary-800 mb-3">Trip Summary</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-primary-700">Total Activities:</Text>
              <Text className="font-semibold text-primary-800">{itinerary.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-primary-700">Estimated Duration:</Text>
              <Text className="font-semibold text-primary-800">
                {itinerary.reduce((sum, item) => sum + item.estimatedDuration, 0)}h
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-primary-700">Completed:</Text>
              <Text className="font-semibold text-secondary-600">
                {itinerary.filter(item => item.isCompleted).length}/{itinerary.length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItineraryScreen;
