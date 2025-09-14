import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafety } from '@/context/SafetyContext';
import { useTourist } from '@/context/TouristContext';
import SafetyStatusIndicator from '@/components/SafetyStatusIndicator';

export default function TabLayout() {
  const { safetyScore, hasActiveAlerts } = useSafety();
  const { currentTrip } = useTourist(); // Remove isTracking as it's not defined in TouristContext

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name="location" size={size} color={color} />
              {currentTrip && currentTrip.status === 'active' && (
                <View 
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    backgroundColor: '#34C759',
                    borderRadius: 4,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="trip-planner"
        options={{
          title: 'Plan Trip',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name="shield-checkmark" size={size} color={color} />
              <SafetyStatusIndicator score={safetyScore} />
            </View>
          ),
          tabBarBadge: hasActiveAlerts ? '!' : undefined,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
