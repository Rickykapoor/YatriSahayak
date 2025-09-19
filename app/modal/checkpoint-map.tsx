import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Stack } from 'expo-router';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTourist } from '@/context/TouristContext';
import { useLocation } from '@/hooks/useLocation';

const CheckpointMapModal: React.FC = () => {
  const { checkpoints, currentTrip } = useTourist();
  const { location } = useLocation();
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const handleCheckIn = useCallback((checkpointId: string) => {
    Alert.alert('Check In', 'Check-in functionality will be implemented');
  }, []);

  const toggleMapType = useCallback(() => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  }, []);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <Text className="text-primary-600 text-lg">Loading map...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen 
        options={{ 
          title: 'Checkpoint Map',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#F5F5F4' },
          headerTitleStyle: { color: '#44403C' }
        }} 
      />

      <MapView
        className="flex-1"
        mapType={mapType}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {checkpoints.map((checkpoint) => (
          <Marker
            key={checkpoint.id}
            coordinate={checkpoint.location}
            title={checkpoint.name}
            description={checkpoint.description}
            onCalloutPress={() => handleCheckIn(checkpoint.id)}
            pinColor="#B45309"
          />
        ))}

        {currentTrip?.geofences?.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            fillColor={zone.type === 'danger' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}
            strokeColor={zone.type === 'danger' ? '#EF4444' : '#10B981'}
            strokeWidth={2}
          />
        ))}
      </MapView>

      {/* Map Controls */}
      <View className="absolute top-4 right-4">
        <Pressable
          className="bg-white w-12 h-12 rounded-full justify-center items-center shadow-md border border-primary-200"
          onPress={toggleMapType}
        >
          <Ionicons name="layers" size={24} color="#B45309" />
        </Pressable>
      </View>

      {/* Bottom Panel */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl border-t border-primary-200 shadow-lg">
        <Text className="text-lg font-semibold text-primary-800 mb-2">Nearby Checkpoints</Text>
        <Text className="text-sm text-primary-600">
          {checkpoints.length} checkpoints found in your area
        </Text>
      </View>
    </View>
  );
};

export default CheckpointMapModal;
