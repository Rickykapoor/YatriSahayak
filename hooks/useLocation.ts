// hooks/useLocation.ts
import { useState, useEffect } from 'react';
import { LocationData } from '@/types/auth';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Mock location data after 2 seconds
    const timer = setTimeout(() => {
      setLocation({
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Mumbai, Maharashtra, India',
        timestamp: Date.now(),
        accuracy: 5,
        trail: [
          { latitude: 19.0760, longitude: 72.8777 },
          { latitude: 19.0765, longitude: 72.8780 },
          { latitude: 19.0770, longitude: 72.8785 },
        ]
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const startTracking = () => {
    setIsTracking(true);
    // In real implementation, start location updates
  };

  const stopTracking = () => {
    setIsTracking(false);
    // In real implementation, stop location updates
  };

  return {
    location,
    isTracking,
    startTracking,
    stopTracking
  };
};
