import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Geofence, SafetyAlert, Trip } from '@/types/auth';

interface SafetyContextType {
  safetyScore: number;
  currentZone: Geofence | null;
  nearbyHazards: SafetyAlert[];
  hasActiveAlerts: boolean;
  triggerEmergency: () => Promise<void>;
  shareLocation: () => Promise<void>;
  findNearestPolice: () => Promise<void>;
  findNearestHospital: () => Promise<void>;
  updateSafetyScore: (score: number) => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

interface SafetyProviderProps {
  children: ReactNode;
}

export const SafetyProvider: React.FC<SafetyProviderProps> = ({ children }) => {
  const [safetyScore, setSafetyScore] = useState(85);
  const [currentZone, setCurrentZone] = useState<Geofence | null>({
    id: 'zone_1',
    name: 'Tourist Area',
    type: 'safe',
    center: { latitude: 15.2993, longitude: 74.1240 },
    radius: 1000,
    active: true,
  });
  const [nearbyHazards, setNearbyHazards] = useState<SafetyAlert[]>([]);

  useEffect(() => {
    // Simulate safety monitoring
    const interval = setInterval(() => {
      // Update safety score based on time, location, etc.
      const newScore = Math.max(60, Math.min(95, safetyScore + (Math.random() - 0.5) * 10));
      setSafetyScore(Math.round(newScore));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [safetyScore]);

  const triggerEmergency = async (): Promise<void> => {
    try {
      console.log('Emergency triggered!');
      // In real app: send location to emergency contacts and authorities
      
      // Mock emergency alert
      const emergencyAlert: SafetyAlert = {
        id: `emergency_${Date.now()}`,
        title: 'Emergency Alert Sent',
        description: 'Your location has been shared with emergency contacts and local authorities.',
        severity: 'high',
        time: new Date().toLocaleTimeString(),
      };
      
      setNearbyHazards(prev => [emergencyAlert, ...prev]);
    } catch (error) {
      console.error('Emergency trigger failed:', error);
      throw error;
    }
  };

  const shareLocation = async (): Promise<void> => {
    try {
      console.log('Sharing location...');
      // Mock location sharing
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Location sharing failed:', error);
      throw error;
    }
  };

  const findNearestPolice = async (): Promise<void> => {
    try {
      console.log('Finding nearest police...');
      // Mock finding police
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Finding police failed:', error);
      throw error;
    }
  };

  const findNearestHospital = async (): Promise<void> => {
    try {
      console.log('Finding nearest hospital...');
      // Mock finding hospital
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Finding hospital failed:', error);
      throw error;
    }
  };

  const updateSafetyScore = (score: number): void => {
    setSafetyScore(Math.max(0, Math.min(100, score)));
  };

  const value: SafetyContextType = {
    safetyScore,
    currentZone,
    nearbyHazards,
    hasActiveAlerts: nearbyHazards.length > 0,
    triggerEmergency,
    shareLocation,
    findNearestPolice,
    findNearestHospital,
    updateSafetyScore,
  };

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = (): SafetyContextType => {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
