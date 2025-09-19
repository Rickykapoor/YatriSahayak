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
      className={`flex-1 py-3 px-4 rounded-lg items-center ${activeSection === section ? 'bg-secondary-700' : 'bg-primary-100'}`}
      onPress={() => setActiveSection(section)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeSection === section ? 'white' : '#A8A29E'} 
      />
      <Text className={`text-sm font-medium mt-1 ${activeSection === section ? 'text-white' : 'text-primary-600'}`}>
        {title}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-secondary-700 p-6 pt-8">
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
      <View className="flex-row gap-2 p-4 bg-primary-50">
        {renderTabButton('overview', 'Overview', 'information-circle')}
        {renderTabButton('checkpoints', 'Checkpoints', 'location')}
        {renderTabButton('companions', 'Companions', 'people')}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-primary-50">
        {activeSection === 'overview' && (
          <View className="p-4">
            {/* Next Checkpoint */}
            {getNextCheckpoint() && (
              <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                <Text className="text-lg font-semibold text-primary-800 mb-2">Next Checkpoint</Text>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-secondary-600 rounded-full justify-center items-center mr-3">
                    <Ionicons name="location" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-primary-800">{getNextCheckpoint()?.name}</Text>
                    <Text className="text-sm text-primary-600">{getNextCheckpoint()?.description}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Trip Stats */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm">
                <Text className="text-2xl font-bold text-secondary-700">{trip.checkpoints.filter(c => c.visited).length}</Text>
                <Text className="text-sm text-primary-600">Completed</Text>
              </View>
              
              <View className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm">
                <Text className="text-2xl font-bold text-warning">{trip.checkpoints.length - trip.checkpoints.filter(c => c.visited).length}</Text>
                <Text className="text-sm text-primary-600">Remaining</Text>
              </View>
              
              <View className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm">
                <Text className="text-2xl font-bold text-success">{trip.safetyScore}</Text>
                <Text className="text-sm text-primary-600">Safety</Text>
              </View>
            </View>

            {/* Safety Status */}
            <View className="bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-lg font-semibold text-primary-800 mb-3">Safety Status</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-2 ${trip.safetyScore >= 80 ? 'bg-success' : trip.safetyScore >= 60 ? 'bg-warning' : 'bg-danger'}`} />
                  <Text className="text-base text-primary-800">
                    {trip.safetyScore >= 80 ? 'Safe Zone' : trip.safetyScore >= 60 ? 'Caution Zone' : 'High Risk Zone'}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-primary-800">{trip.safetyScore}%</Text>
              </View>
            </View>
          </View>
        )}

        {activeSection === 'checkpoints' && (
          <View className="p-4">
            {trip.checkpoints.map((checkpoint, index) => (
              <View key={checkpoint.id} className="bg-white p-4 rounded-xl mb-3 shadow-sm">
                <View className="flex-row items-center">
                  <View className={`w-8 h-8 rounded-full justify-center items-center mr-3 ${checkpoint.visited ? 'bg-success' : 'bg-primary-300'}`}>
                    {checkpoint.visited ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className={`text-base font-medium ${checkpoint.visited ? 'text-primary-600' : 'text-primary-800'}`}>
                      {checkpoint.name}
                    </Text>
                    <Text className="text-sm text-primary-500">{checkpoint.description}</Text>
                    {checkpoint.visited && checkpoint.visitedAt && (
                      <Text className="text-xs text-success mt-1">
                        Visited: {new Date(checkpoint.visitedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  
                  <Ionicons 
                    name={checkpoint.visited ? "checkmark-circle" : "location-outline"} 
                    size={20} 
                    color={checkpoint.visited ? "#10B981" : "#A8A29E"} 
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
                <View key={index} className="bg-white p-4 rounded-xl mb-3 flex-row items-center shadow-sm">
                  <View className="w-10 h-10 bg-primary-300 rounded-full justify-center items-center mr-3">
                    <Ionicons name="person" size={20} color="#A8A29E" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-primary-800">{companion}</Text>
                    <Text className="text-sm text-primary-600">Travel Companion</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white p-8 rounded-xl items-center shadow-sm">
                <Ionicons name="person-add-outline" size={48} color="#A8A29E" />
                <Text className="text-primary-500 text-center mt-4">No companions added</Text>
                <Text className="text-primary-400 text-sm text-center">You're traveling solo on this trip</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ActiveTripDashboard;
