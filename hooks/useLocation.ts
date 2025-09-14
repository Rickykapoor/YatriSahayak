import { useState, useEffect } from 'react';
import { LocationData } from '@/types/auth';
import * as Location from 'expo-location';

interface UseLocationReturn {
  location: LocationData | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  getCurrentLocation: () => Promise<LocationData>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      setIsTracking(true);
      const currentLocation = await Location.getCurrentPositionAsync({});
      
      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: Date.now(),
        accuracy: currentLocation.coords.accuracy || undefined,
      };

      setLocation(locationData);
      setError(null);
    } catch (err) {
      setError('Failed to get location');
      setIsTracking(false);
    }
  };

  const stopTracking = (): void => {
    setIsTracking(false);
  };

  const getCurrentLocation = async (): Promise<LocationData> => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      return {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: Date.now(),
        accuracy: currentLocation.coords.accuracy || undefined,
      };
    } catch (err) {
      throw new Error('Failed to get current location');
    }
  };

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
};
