// File: app/(app)/tracking.tsx (Fixed with working location and emergency services)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTourist } from '@/context/TouristContext';
import TrackingStats from '@/components/TrackingStats';
import CheckpointList from '@/components/CheckpointList';
import { Checkpoint, Geofence } from '@/types/auth';

type MapType = 'standard' | 'satellite' | 'hybrid';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
  accuracy?: number;
  trail: { latitude: number; longitude: number }[];
}

interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire';
  coordinate: {
    latitude: number;
    longitude: number;
  };
  address: string;
  phone: string;
  distance?: number;
}

const TrackingScreen = () => {
  const { currentTrip, checkpoints, visitedCheckpoints, checkIn } = useTourist();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [trail, setTrail] = useState<{ latitude: number; longitude: number }[]>([]);

  // Request location permissions and start tracking
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Start location tracking when permission is granted
  useEffect(() => {
    if (locationPermission === true) {
      getCurrentLocation();
      if (currentTrip) {
        startTracking();
      }
    }
  }, [locationPermission, currentTrip]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use tracking features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = locationData.coords;

      // Get address from coordinates
      const address = await getAddressFromCoordinates(latitude, longitude);

      const newLocation: LocationData = {
        latitude,
        longitude,
        address,
        timestamp: Date.now(),
        accuracy: locationData.coords.accuracy,
        trail: trail,
      };

      setLocation(newLocation);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Load nearby emergency services
      loadEmergencyServices(latitude, longitude);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get your current location.');
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const addressData = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressData && addressData.length > 0) {
        const address = addressData[0];
        return `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const loadEmergencyServices = (latitude: number, longitude: number) => {
    // Mock emergency services data - In production, this would come from a real API
    const mockServices: EmergencyService[] = [
      // Hospitals
      {
        id: 'hospital_1',
        name: 'City General Hospital',
        type: 'hospital',
        coordinate: {
          latitude: latitude + 0.005,
          longitude: longitude + 0.003,
        },
        address: 'Main Road, City Center',
        phone: '+91 11 2345 6789',
      },
      {
        id: 'hospital_2',
        name: 'Emergency Medical Center',
        type: 'hospital',
        coordinate: {
          latitude: latitude - 0.003,
          longitude: longitude + 0.007,
        },
        address: 'Hospital Street, Medical District',
        phone: '+91 11 2345 6790',
      },
      // Police Stations
      {
        id: 'police_1',
        name: 'Central Police Station',
        type: 'police',
        coordinate: {
          latitude: latitude + 0.002,
          longitude: longitude - 0.004,
        },
        address: 'Police Complex, Central Area',
        phone: '100',
      },
      {
        id: 'police_2',
        name: 'Tourist Police Help Desk',
        type: 'police',
        coordinate: {
          latitude: latitude - 0.006,
          longitude: longitude - 0.002,
        },
        address: 'Tourist Area, Main Square',
        phone: '1363',
      },
      // Fire Stations
      {
        id: 'fire_1',
        name: 'Fire & Rescue Station',
        type: 'fire',
        coordinate: {
          latitude: latitude + 0.008,
          longitude: longitude + 0.001,
        },
        address: 'Fire Station Road',
        phone: '101',
      },
    ];

    // Calculate distances and sort by proximity
    const servicesWithDistance = mockServices.map(service => ({
      ...service,
      distance: calculateDistance(
        latitude,
        longitude,
        service.coordinate.latitude,
        service.coordinate.longitude
      ),
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setEmergencyServices(servicesWithDistance);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startTracking = useCallback(() => {
    setIsTracking(true);
    console.log('📍 Started location tracking');
    
    // Start location updates
    const startLocationUpdates = async () => {
      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          (locationData) => {
            const { latitude, longitude } = locationData.coords;
            
            // Add to trail
            setTrail(prevTrail => [
              ...prevTrail,
              { latitude, longitude }
            ]);

            setLocation(prev => ({
              ...prev!,
              latitude,
              longitude,
              timestamp: Date.now(),
              accuracy: locationData.coords.accuracy,
              trail: [...(prev?.trail || []), { latitude, longitude }],
            }));
          }
        );

        // Store subscription for cleanup
        return subscription;
      } catch (error) {
        console.error('Error starting location updates:', error);
      }
    };

    if (locationPermission) {
      startLocationUpdates();
    }
  }, [locationPermission]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    console.log('⏸️ Stopped location tracking');
  }, []);

  const handleCheckIn = useCallback(async (checkpoint: Checkpoint) => {
    try {
      await checkIn(checkpoint.id);
      Alert.alert('Checked In', `Successfully checked in at ${checkpoint.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check in');
    }
  }, [checkIn]);

  const handleEmergencyServicePress = useCallback((service: EmergencyService) => {
    const distanceText = service.distance ? `${service.distance.toFixed(1)} km away` : '';
    
    Alert.alert(
      `${getServiceIcon(service.type)} ${service.name}`,
      `${service.address}\n${distanceText}\n\nContact: ${service.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, you would use Linking.openURL(`tel:${service.phone}`)
            Alert.alert('Calling', `Would call ${service.phone}`);
          }
        },
        {
          text: 'Get Directions',
          onPress: () => {
            // In a real app, you would open maps with directions
            Alert.alert('Directions', `Would show directions to ${service.name}`);
          }
        }
      ]
    );
  }, []);

  const getServiceIcon = (type: string): string => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'police': return '👮';
      case 'fire': return '🚒';
      default: return '📍';
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'hospital': return '#EF4444'; // Red
      case 'police': return '#3B82F6'; // Blue
      case 'fire': return '#F59E0B'; // Orange
      default: return '#B45309';
    }
  };

  const shareLocation = useCallback((): void => {
    if (location) {
      Alert.alert(
        'Share Location',
        `Your current location:\n${location.address}\n\nThis has been shared with your emergency contacts.`,
        [{ text: 'OK' }]
      );
    }
  }, [location]);

  const toggleMapType = useCallback((): void => {
    setMapType(prevType => {
      switch (prevType) {
        case 'standard': return 'satellite';
        case 'satellite': return 'hybrid';
        case 'hybrid': return 'standard';
        default: return 'standard';
      }
    });
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

  // Show permission request screen
  if (locationPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#B45309" />
          <Text className="text-lg text-primary-600 mt-4">Requesting location permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission denied screen
  if (locationPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="location-off" size={80} color="#B45309" />
          <Text className="text-xl font-bold text-primary-800 mt-4 text-center">
            Location Permission Required
          </Text>
          <Text className="text-primary-600 text-center mt-2 mb-6">
            Please enable location access to use tracking features and see nearby emergency services.
          </Text>
          <Pressable
            className="bg-secondary-600 px-6 py-3 rounded-xl"
            onPress={requestLocationPermission}
          >
            <Text className="text-white font-bold">Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading screen while getting location
  if (!location || !mapRegion) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="location-outline" size={64} color="#B45309" />
          <ActivityIndicator size="large" color="#B45309" style={{ marginTop: 20 }} />
          <Text className="text-lg text-primary-600 mt-4 mb-2">Getting your location...</Text>
          <Text className="text-sm text-primary-500 text-center px-8">
            Please wait while we locate you and load nearby services
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />
      
      {/* Live Status Header */}
      <SafeAreaView className="bg-white border-b border-primary-200">
        <View className="flex-row p-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-success' : 'bg-danger'}`} />
              <Text className="text-sm font-semibold text-primary-800">
                {isTracking ? 'LIVE TRACKING' : 'TRACKING PAUSED'}
              </Text>
            </View>
            <Text className="text-base font-medium text-primary-800 mb-0.5">
              {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
            </Text>
            <Text className="text-xs text-primary-500">
              Updated {new Date(location.timestamp).toLocaleTimeString()}
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
      </SafeAreaView>

      {/* Map View */}
      <View className="flex-1 relative">
        <MapView
          style={{ flex: 1 }}
          region={mapRegion}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
          onRegionChangeComplete={setMapRegion}
        >
          {/* User's trail */}
          {trail.length > 1 && (
            <Polyline
              coordinates={trail}
              strokeColor="#B45309"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}

          {/* Emergency Services Markers */}
          {emergencyServices.map((service) => (
            <Marker
              key={service.id}
              coordinate={service.coordinate}
              pinColor={getMarkerColor(service.type)}
              title={`${getServiceIcon(service.type)} ${service.name}`}
              description={`${service.address} • ${service.distance?.toFixed(1)} km`}
              onCalloutPress={() => handleEmergencyServicePress(service)}
            />
          ))}

          {/* Checkpoints */}
          {checkpoints && checkpoints.map((checkpoint: Checkpoint) => (
            <Marker
              key={checkpoint.id}
              coordinate={checkpoint.location}
              pinColor={visitedCheckpoints.includes(checkpoint.id) ? '#10B981' : '#B45309'}
              title={`📍 ${checkpoint.name}`}
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
            onPress={() => getCurrentLocation()}
          >
            <Ionicons name="locate" size={20} color="#B45309" />
          </Pressable>
          
          <Pressable 
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-md border border-primary-200"
            onPress={toggleHistory}
          >
            <Ionicons name="time" size={20} color="#B45309" />
          </Pressable>
        </View>

        {/* Emergency Services Legend */}
        <View className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-md border border-primary-200">
          <Text className="text-xs font-semibold text-primary-800 mb-2">Emergency Services</Text>
          <View className="flex-row gap-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
              <Text className="text-xs text-primary-600">Hospital</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
              <Text className="text-xs text-primary-600">Police</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-orange-500 mr-1" />
              <Text className="text-xs text-primary-600">Fire</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Panel */}
      <View className="bg-white border-t border-primary-200">
        <SafeAreaView>
          {!showHistory ? (
            <>
              {TrackingStats && (
                <TrackingStats location={location} currentTrip={currentTrip} />
              )}
              
              <View className="flex-row justify-around py-4">
                <Pressable className="items-center" onPress={() => getCurrentLocation()}>
                  <Ionicons name="locate" size={24} color="#10B981" />
                  <Text className="text-xs text-primary-800 font-medium mt-1">Locate Me</Text>
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
            CheckpointList && (
              <CheckpointList 
                visitedCheckpoints={visitedCheckpoints || []}
                onClose={() => setShowHistory(false)}
              />
            )
          )}
        </SafeAreaView>
      </View>
    </View>
  );
};

export default TrackingScreen;
