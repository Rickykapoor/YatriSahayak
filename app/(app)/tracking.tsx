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

  // Default location if location is null (Mumbai coordinates as fallback)
  const defaultLocation = {
    latitude: 19.0760,
    longitude: 72.8777,
    address: 'Getting location...',
    timestamp: Date.now(),
    accuracy: 0,
    trail: []
  };

  // Use location or fallback to default
  const currentLocation = location || defaultLocation;

  // Show loading state if no location
  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <View className="items-center">
          <Ionicons name="location-outline" size={64} color="#A8A29E" />
          <Text className="text-lg text-primary-600 mt-4 mb-2">Getting your location...</Text>
          <Text className="text-sm text-primary-500 text-center px-8">
            Please make sure location services are enabled
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Live Status Header */}
      <View className="flex-row p-4 pt-14 bg-white border-b border-primary-200">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-success' : 'bg-danger'}`} />
            <Text className="text-sm font-semibold text-primary-800">
              {isTracking ? 'LIVE TRACKING' : 'TRACKING PAUSED'}
            </Text>
          </View>
          <Text className="text-base font-medium text-primary-800 mb-0.5">
            {currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
          </Text>
          <Text className="text-xs text-primary-500">
            Updated {new Date(currentLocation.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        
        <Pressable 
          className={`w-11 h-11 rounded-full justify-center items-center ${isTracking ? 'bg-secondary-600' : 'bg-primary-400'}`}
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
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
        >
          {/* User's trail */}
          {currentLocation.trail && currentLocation.trail.length > 0 && (
            <Polyline
              coordinates={currentLocation.trail}
              strokeColor="#B45309"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}

          {/* Checkpoints */}
          {checkpoints && checkpoints.map((checkpoint: Checkpoint) => (
            <Marker
              key={checkpoint.id}
              coordinate={checkpoint.location}
              pinColor={visitedCheckpoints.includes(checkpoint.id) ? '#10B981' : '#B45309'}
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
              fillColor={zone.type === 'danger' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}
              strokeColor={zone.type === 'danger' ? '#EF4444' : '#10B981'}
              strokeWidth={2}
            />
          ))}
        </MapView>

        {/* Map Controls */}
        <View className="absolute top-4 right-4 gap-2">
          <Pressable 
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-md border border-primary-200"
            onPress={toggleMapType}
          >
            <Ionicons name="layers" size={20} color="#B45309" />
          </Pressable>
          
          <Pressable 
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-md border border-primary-200"
            onPress={toggleHistory}
          >
            <Ionicons name="time" size={20} color="#B45309" />
          </Pressable>
        </View>
      </View>

      {/* Bottom Panel */}
      <View className="bg-white border-t border-primary-200 pb-8">
        {!showHistory ? (
          <>
            <TrackingStats location={currentLocation} currentTrip={currentTrip} />
            
            <View className="flex-row justify-around py-4">
              <Pressable className="items-center" onPress={() => handleCheckIn}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-xs text-primary-800 font-medium mt-1">Check In</Text>
              </Pressable>
              
              <Pressable className="items-center" onPress={shareLocation}>
                <Ionicons name="share" size={24} color="#B45309" />
                <Text className="text-xs text-primary-800 font-medium mt-1">Share Location</Text>
              </Pressable>
              
              <Pressable className="items-center" onPress={toggleHistory}>
                <Ionicons name="list" size={24} color="#A8A29E" />
                <Text className="text-xs text-primary-800 font-medium mt-1">History</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <CheckpointList 
            visitedCheckpoints={visitedCheckpoints || []}
            onClose={() => setShowHistory(false)}
          />
        )}
      </View>
    </View>
  );
};

export default TrackingScreen;
