import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, MapPressEvent } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTourist } from '@/context/TouristContext';
import { useLocation } from '@/hooks/useLocation';
import TrackingStats from '@/components/TrackingStats';
import CheckpointList from '@/components/CheckpointList';
import { Checkpoint, Geofence } from '@/types/auth';

type MapType = 'standard' | 'satellite' | 'hybrid';

const TrackingScreen = () => {
  const { currentTrip, checkpoints, visitedCheckpoints, checkIn } = useTourist();
  const { location, isTracking, startTracking, stopTracking } = useLocation();
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [mapType, setMapType] = useState<MapType>('standard');

  useEffect(() => {
    if (currentTrip && !isTracking) {
      startTracking();
    }
  }, [currentTrip, isTracking, startTracking]);

  const handleCheckIn = useCallback(async (checkpoint) => {
    try {
      await checkIn(checkpoint.id);
      Alert.alert('Checked In', `Successfully checked in at ${checkpoint.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check in');
    }
  }, [checkIn]);

  const shareLocation = useCallback((): void => {
    Alert.alert('Location Shared', 'Your location has been shared with emergency contacts');
  }, []);

  const toggleMapType = useCallback((): void => {
    setMapType(prevType => prevType === 'standard' ? 'satellite' : 'standard');
  }, []);

  const toggleHistory = useCallback((): void => {
    setShowHistory(prev => !prev);
  }, []);

  const toggleTracking = useCallback((): void => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Getting your location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Live Status Header */}
      <View className="flex-row p-4 pt-14 bg-white border-b border-gray-border">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-success' : 'bg-danger'}`} />
            <Text className="text-sm font-semibold text-black">
              {isTracking ? 'LIVE TRACKING' : 'TRACKING PAUSED'}
            </Text>
          </View>
          <Text className="text-base font-medium text-black mb-0.5">
            {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
          </Text>
          <Text className="text-xs text-gray-500">
            Updated {new Date(location.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        
        <Pressable 
          className="w-11 h-11 rounded-full bg-primary justify-center items-center"
          onPress={toggleTracking}
        >
          <Ionicons 
            name={isTracking ? 'pause' : 'play'} 
            size={20} 
            color="white" 
          />
        </Pressable>
      </View>

      {/* Map View */}
      <View className="flex-1 relative">
        <MapView
          className="flex-1"
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={true}
        >
          {/* User's trail */}
          {location.trail && (
            <Polyline
              coordinates={location.trail}
              strokeColor="#007AFF"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}

          {/* Checkpoints */}
          {checkpoints.map((checkpoint: Checkpoint) => (
            <Marker
              key={checkpoint.id}
              coordinate={checkpoint.location}
              pinColor={visitedCheckpoints.includes(checkpoint.id) ? 'green' : 'blue'}
              title={checkpoint.name}
              description={checkpoint.description}
              onCalloutPress={() => handleCheckIn(checkpoint)}
            />
          ))}

          {/* Geofence zones */}
          {currentTrip?.geofences?.map((zone: Geofence) => (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              fillColor={zone.type === 'danger' ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)'}
              strokeColor={zone.type === 'danger' ? '#FF0000' : '#00FF00'}
              strokeWidth={2}
            />
          ))}
        </MapView>

        {/* Map Controls */}
        <View className="absolute top-4 right-4 gap-2">
          <Pressable 
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-md"
            onPress={toggleMapType}
          >
            <Ionicons name="layers" size={20} color="#007AFF" />
          </Pressable>
          
          <Pressable 
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-md"
            onPress={toggleHistory}
          >
            <Ionicons name="time" size={20} color="#007AFF" />
          </Pressable>
        </View>
      </View>

      {/* Bottom Panel */}
      <View className="bg-white border-t border-gray-border pb-8">
        {!showHistory ? (
          <>
            <TrackingStats location={location} currentTrip={currentTrip} />
            
            <View className="flex-row justify-around py-4">
              <Pressable className="items-center" onPress={() => handleCheckIn}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text className="text-xs text-black font-medium mt-1">Check In</Text>
              </Pressable>
              
              <Pressable className="items-center" onPress={shareLocation}>
                <Ionicons name="share" size={24} color="#007AFF" />
                <Text className="text-xs text-black font-medium mt-1">Share Location</Text>
              </Pressable>
              
              <Pressable className="items-center" onPress={toggleHistory}>
                <Ionicons name="list" size={24} color="#8E8E93" />
                <Text className="text-xs text-black font-medium mt-1">History</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <CheckpointList 
            visitedCheckpoints={visitedCheckpoints}
            onClose={() => setShowHistory(false)}
          />
        )}
      </View>
    </View>
  );
};

export default TrackingScreen;
