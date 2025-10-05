// File: app/(app)/trip-planner/create.tsx (Updated with calendar)
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { useAuth } from '@/context/AuthContext';
import TripService from '@/services/tripService';
import { Trip } from '@/types/trip';

const CreateTripScreen: React.FC = () => {
  const { user } = useAuth();
  const [tripTitle, setTripTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDateSelect = (day: DateData) => {
    const selectedDate = day.dateString;
    
    if (calendarMode === 'start') {
      setStartDate(selectedDate);
      // If end date is before start date, reset it
      if (endDate && new Date(endDate) < new Date(selectedDate)) {
        setEndDate('');
      }
    } else {
      // Ensure end date is not before start date
      if (startDate && new Date(selectedDate) < new Date(startDate)) {
        Alert.alert('Invalid Date', 'End date cannot be before start date');
        return;
      }
      setEndDate(selectedDate);
    }
    
    setShowCalendar(false);
  };

  const openCalendar = (mode: 'start' | 'end') => {
    setCalendarMode(mode);
    setShowCalendar(true);
  };

  const calculateDuration = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1; // Include both start and end days
    }
    return 0;
  };

  const handleCreateTrip = async () => {
    if (!user?.id) return;

    // Validation
    if (!tripTitle.trim()) {
      Alert.alert('Error', 'Please enter a trip title');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }
    if (!startDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }
    if (!endDate) {
      Alert.alert('Error', 'Please select an end date');
      return;
    }
    if (!emergencyContact.trim()) {
      Alert.alert('Error', 'Please enter an emergency contact');
      return;
    }

    try {
      setIsSubmitting(true);

      const tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        title: tripTitle.trim(),
        description: description.trim() || undefined,
        destination: destination.trim(),
        startDate,
        endDate,
        duration: calculateDuration(),
        status: 'planned',
        tripType: 'solo', // You can add a selector for this
        emergencyPlan: {
          primaryContact: emergencyContact.trim(),
          secondaryContact: '',
        },
        preferences: {
          activityLevel: 'moderate',
          interests: [],
          accommodationType: 'hotel',
          safetyPriority: 'high',
          groupSize: 1,
        },
      };

      const newTrip = await TripService.createTrip(user.id, tripData);

      Alert.alert(
        '🎉 Trip Created!',
        `Your trip "${newTrip.title}" has been created successfully. You can start it when you're ready to travel.`,
        [
          {
            text: 'View Trip',
            onPress: () => router.replace(`/trip-planner/trip/${newTrip.id}`)
          },
          {
            text: 'Back to Trips',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-primary-200 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </Pressable>
        <Text className="text-xl font-bold text-primary-800">Create New Trip</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Trip Title */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-primary-800 mb-2">Trip Title *</Text>
          <TextInput
            className="bg-white border border-primary-200 rounded-lg px-4 py-3 text-primary-800"
            placeholder="e.g., Golden Triangle Adventure"
            value={tripTitle}
            onChangeText={setTripTitle}
            maxLength={100}
          />
        </View>

        {/* Destination */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-primary-800 mb-2">Destination *</Text>
          <TextInput
            className="bg-white border border-primary-200 rounded-lg px-4 py-3 text-primary-800"
            placeholder="e.g., Delhi, Agra, Jaipur"
            value={destination}
            onChangeText={setDestination}
            maxLength={200}
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-primary-800 mb-2">Description</Text>
          <TextInput
            className="bg-white border border-primary-200 rounded-lg px-4 py-3 text-primary-800"
            placeholder="Tell us about your trip plans..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Date Selection */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-primary-800 mb-3">Travel Dates *</Text>
          
          <View className="flex-row gap-3 mb-4">
            {/* Start Date */}
            <View className="flex-1">
              <Text className="text-sm text-primary-700 mb-2">Start Date</Text>
              <Pressable
                className="bg-white border border-primary-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => openCalendar('start')}
              >
                <Text className={`${startDate ? 'text-primary-800' : 'text-primary-400'}`}>
                  {startDate ? formatDate(startDate) : 'Select date'}
                </Text>
                <Ionicons name="calendar" size={20} color="#ea580c" />
              </Pressable>
            </View>

            {/* End Date */}
            <View className="flex-1">
              <Text className="text-sm text-primary-700 mb-2">End Date</Text>
              <Pressable
                className="bg-white border border-primary-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => openCalendar('end')}
              >
                <Text className={`${endDate ? 'text-primary-800' : 'text-primary-400'}`}>
                  {endDate ? formatDate(endDate) : 'Select date'}
                </Text>
                <Ionicons name="calendar" size={20} color="#ea580c" />
              </Pressable>
            </View>
          </View>

          {/* Duration Display */}
          {startDate && endDate && (
            <View className="bg-secondary-50 border border-secondary-200 p-3 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#B45309" />
                <Text className="text-secondary-800 font-semibold ml-2">
                  Duration: {calculateDuration()} days
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Calendar Modal */}
        {showCalendar && (
          <View className="mb-6">
            <View className="bg-white rounded-lg shadow-sm border border-primary-200 overflow-hidden">
              <View className="bg-primary-600 px-4 py-3 flex-row items-center justify-between">
                <Text className="text-white font-semibold">
                  Select {calendarMode === 'start' ? 'Start' : 'End'} Date
                </Text>
                <Pressable onPress={() => setShowCalendar(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>
              
              <Calendar
                onDayPress={handleDateSelect}
                minDate={new Date().toISOString().split('T')[0]} // Today
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 1 year from now
                markedDates={{
                  [startDate]: { 
                    selected: true, 
                    selectedColor: '#10B981',
                    selectedTextColor: 'white'
                  },
                  [endDate]: { 
                    selected: true, 
                    selectedColor: '#EF4444',
                    selectedTextColor: 'white'
                  }
                }}
                theme={{
                  selectedDayBackgroundColor: '#ea580c',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#ea580c',
                  dayTextColor: '#2d3748',
                  textDisabledColor: '#d1d5db',
                  arrowColor: '#ea580c',
                  monthTextColor: '#2d3748',
                  indicatorColor: '#ea580c',
                }}
              />
            </View>
          </View>
        )}

        {/* Emergency Contact */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-primary-800 mb-2">Emergency Contact *</Text>
          <TextInput
            className="bg-white border border-primary-200 rounded-lg px-4 py-3 text-primary-800"
            placeholder="e.g., +91 9876543210"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            keyboardType="phone-pad"
            maxLength={15}
          />
          <Text className="text-xs text-primary-600 mt-1">
            This contact will be notified in case of emergency
          </Text>
        </View>

        {/* Safety Notice */}
        <View className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-semibold mb-1">Digital Tourist ID</Text>
              <Text className="text-sm text-blue-700">
                When you start this trip, you'll get a Digital Tourist ID with QR code for easy verification at checkpoints and real-time safety monitoring.
              </Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <Pressable
          className={`py-4 rounded-lg ${isSubmitting || !tripTitle || !destination || !startDate || !endDate || !emergencyContact 
            ? 'bg-gray-400' : 'bg-green-600'}`}
          onPress={handleCreateTrip}
          disabled={isSubmitting || !tripTitle || !destination || !startDate || !endDate || !emergencyContact}
        >
          <Text className="text-white font-semibold text-center text-lg">
            {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTripScreen;
