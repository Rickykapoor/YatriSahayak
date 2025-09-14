import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip, Checkpoint } from '@/types/auth';

interface ActiveTripDashboardProps {
  trip: Trip;
}

const ActiveTripDashboard: React.FC<ActiveTripDashboardProps> = ({ trip }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'checkpoints' | 'companions'>('overview');

  const getCompletionPercentage = (): number => {
    const completed = trip.checkpoints.filter(c => c.visited).length;
    return Math.round((completed / trip.checkpoints.length) * 100);
  };

  const getNextCheckpoint = (): Checkpoint | null => {
    return trip.checkpoints.find(c => !c.visited) || null;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderTabButton = (section: typeof activeSection, title: string, icon: keyof typeof Ionicons.glyphMap) => (
    <Pressable
      key={section}
      className={`flex-1 py-3 px-4 rounded-lg items-center ${activeSection === section ? 'bg-primary' : 'bg-gray-100'}`}
      onPress={() => setActiveSection(section)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeSection === section ? 'white' : '#8E8E93'} 
      />
      <Text className={`text-sm font-medium mt-1 ${activeSection === section ? 'text-white' : 'text-gray-600'}`}>
        {title}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-primary p-6 pt-8">
        <Text className="text-white text-2xl font-bold mb-2">{trip.destination}</Text>
        <Text className="text-white/80 text-base">
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </Text>
        
        {/* Progress Circle */}
        <View className="items-center mt-6">
          <View className="w-24 h-24 rounded-full bg-white/20 justify-center items-center">
            <Text className="text-white text-xl font-bold">{getCompletionPercentage()}%</Text>
            <Text className="text-white/80 text-xs">Complete</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row gap-2 p-4 bg-gray-light">
        {renderTabButton('overview', 'Overview', 'information-circle')}
        {renderTabButton('checkpoints', 'Checkpoints', 'location')}
        {renderTabButton('companions', 'Companions', 'people')}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-gray-light">
        {activeSection === 'overview' && (
          <View className="p-4">
            {/* Next Checkpoint */}
            {getNextCheckpoint() && (
              <View className="bg-white p-4 rounded-xl mb-4">
                <Text className="text-lg font-semibold text-black mb-2">Next Checkpoint</Text>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary rounded-full justify-center items-center mr-3">
                    <Ionicons name="location" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-black">{getNextCheckpoint()?.name}</Text>
                    <Text className="text-sm text-gray-600">{getNextCheckpoint()?.description}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Trip Stats */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white p-4 rounded-xl items-center">
                <Text className="text-2xl font-bold text-primary">{trip.checkpoints.filter(c => c.visited).length}</Text>
                <Text className="text-sm text-gray-600">Completed</Text>
              </View>
              
              <View className="flex-1 bg-white p-4 rounded-xl items-center">
                <Text className="text-2xl font-bold text-warning">{trip.checkpoints.length - trip.checkpoints.filter(c => c.visited).length}</Text>
                <Text className="text-sm text-gray-600">Remaining</Text>
              </View>
              
              <View className="flex-1 bg-white p-4 rounded-xl items-center">
                <Text className="text-2xl font-bold text-success">{trip.safetyScore}</Text>
                <Text className="text-sm text-gray-600">Safety</Text>
              </View>
            </View>

            {/* Safety Status */}
            <View className="bg-white p-4 rounded-xl">
              <Text className="text-lg font-semibold text-black mb-3">Safety Status</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-2 ${trip.safetyScore >= 80 ? 'bg-success' : trip.safetyScore >= 60 ? 'bg-warning' : 'bg-danger'}`} />
                  <Text className="text-base text-black">
                    {trip.safetyScore >= 80 ? 'Safe Zone' : trip.safetyScore >= 60 ? 'Caution Zone' : 'High Risk Zone'}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-black">{trip.safetyScore}%</Text>
              </View>
            </View>
          </View>
        )}

        {activeSection === 'checkpoints' && (
          <View className="p-4">
            {trip.checkpoints.map((checkpoint, index) => (
              <View key={checkpoint.id} className="bg-white p-4 rounded-xl mb-3">
                <View className="flex-row items-center">
                  <View className={`w-8 h-8 rounded-full justify-center items-center mr-3 ${checkpoint.visited ? 'bg-success' : 'bg-gray-300'}`}>
                    {checkpoint.visited ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className={`text-base font-medium ${checkpoint.visited ? 'text-gray-600' : 'text-black'}`}>
                      {checkpoint.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{checkpoint.description}</Text>
                    {checkpoint.visited && checkpoint.visitedAt && (
                      <Text className="text-xs text-success mt-1">
                        Visited: {new Date(checkpoint.visitedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  
                  <Ionicons 
                    name={checkpoint.visited ? "checkmark-circle" : "location-outline"} 
                    size={20} 
                    color={checkpoint.visited ? "#34C759" : "#8E8E93"} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {activeSection === 'companions' && (
          <View className="p-4">
            {trip.companions.length > 0 ? (
              trip.companions.map((companion, index) => (
                <View key={index} className="bg-white p-4 rounded-xl mb-3 flex-row items-center">
                  <View className="w-10 h-10 bg-gray-300 rounded-full justify-center items-center mr-3">
                    <Ionicons name="person" size={20} color="#8E8E93" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-black">{companion}</Text>
                    <Text className="text-sm text-gray-600">Travel Companion</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white p-8 rounded-xl items-center">
                <Ionicons name="person-add-outline" size={48} color="#8E8E93" />
                <Text className="text-gray-500 text-center mt-4">No companions added</Text>
                <Text className="text-gray-400 text-sm text-center">You're traveling solo on this trip</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ActiveTripDashboard;
