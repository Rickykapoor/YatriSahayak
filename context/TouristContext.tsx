// context/TouristContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trip, Checkpoint, UserSettings, User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';

interface TouristContextType {
  user: User | null;  // Added user back to TouristContext
  currentTrip: Trip | null;
  upcomingTrips: Trip[];
  tripHistory: Trip[];
  checkpoints: Checkpoint[];
  visitedCheckpoints: string[];
  createTrip: (tripData: Partial<Trip>) => Promise<void>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  checkIn: (checkpointId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const TouristContext = createContext<TouristContextType | undefined>(undefined);

interface TouristProviderProps {
  children: ReactNode;
}

export const TouristProvider: React.FC<TouristProviderProps> = ({ children }) => {
  const { user: authUser, updateUser } = useAuth(); // Get user from AuthContext
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [visitedCheckpoints, setVisitedCheckpoints] = useState<string[]>([]);

  const createTrip = async (tripData: Partial<Trip>): Promise<void> => {
    try {
      const newTrip: Trip = {
        id: Date.now().toString(),
        destination: tripData.destination || '',
        startDate: tripData.startDate || new Date().toISOString(),
        endDate: tripData.endDate || new Date().toISOString(),
        status: 'planned',
        checkpoints: tripData.checkpoints || [],
        geofences: tripData.geofences || [],
        safetyScore: 85,
        companions: tripData.companions || [],
      };
      setCurrentTrip(newTrip);
      
      // Add trip to upcoming trips
      setUpcomingTrips(prev => [...prev, newTrip]);
    } catch (error) {
      throw new Error('Failed to create trip');
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>): Promise<void> => {
    try {
      if (currentTrip && currentTrip.id === tripId) {
        const updatedTrip = { ...currentTrip, ...updates };
        setCurrentTrip(updatedTrip);
        
        // Update in upcoming trips if exists
        setUpcomingTrips(prev => 
          prev.map(trip => trip.id === tripId ? updatedTrip : trip)
        );
      }
    } catch (error) {
      throw new Error('Failed to update trip');
    }
  };

  const checkIn = async (checkpointId: string): Promise<void> => {
    try {
      setVisitedCheckpoints(prev => [...prev, checkpointId]);
      
      // Update current trip checkpoints
      if (currentTrip) {
        const updatedCheckpoints = currentTrip.checkpoints.map(checkpoint =>
          checkpoint.id === checkpointId 
            ? { ...checkpoint, visited: true, visitedAt: new Date().toISOString() }
            : checkpoint
        );
        
        setCurrentTrip({
          ...currentTrip,
          checkpoints: updatedCheckpoints
        });
      }
    } catch (error) {
      throw new Error('Failed to check in');
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      // Refresh trip-related data
      // In a real app, this would fetch from API
      console.log('Refreshing trip data...');
      
      // Mock some trip history data
      const mockTripHistory: Trip[] = [
        {
          id: 'trip_1',
          destination: 'Goa',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          status: 'completed',
          checkpoints: [],
          geofences: [],
          safetyScore: 90,
          companions: []
        },
        {
          id: 'trip_2', 
          destination: 'Kerala',
          startDate: '2024-02-10',
          endDate: '2024-02-15',
          status: 'completed',
          checkpoints: [],
          geofences: [],
          safetyScore: 88,
          companions: []
        }
      ];
      
      setTripHistory(mockTripHistory);
    } catch (error) {
      console.error('Failed to refresh trip data');
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>): Promise<void> => {
    try {
      // Update user settings through AuthContext
      if (authUser) {
        await updateUser({ 
          settings: { 
            ...authUser.settings, 
            ...settings 
          } 
        });
      }
    } catch (error) {
      throw new Error('Failed to update settings');
    }
  };

  const value: TouristContextType = {
    user: authUser, // Pass user from AuthContext
    currentTrip,
    upcomingTrips,
    tripHistory,
    checkpoints,
    visitedCheckpoints,
    createTrip,
    updateTrip,
    checkIn,
    refreshUserData,
    updateUserSettings,
  };

  return <TouristContext.Provider value={value}>{children}</TouristContext.Provider>;
};

export const useTourist = (): TouristContextType => {
  const context = useContext(TouristContext);
  if (context === undefined) {
    throw new Error('useTourist must be used within a TouristProvider');
  }
  return context;
};
