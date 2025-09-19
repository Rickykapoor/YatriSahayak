import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafety } from '@/context/SafetyContext';
import { useTourist } from '@/context/TouristContext';
import SafetyStatusIndicator from '@/components/SafetyStatusIndicator';

export default function TabLayout() {
  const { safetyScore, hasActiveAlerts } = useSafety();
  const { currentTrip } = useTourist();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#b45309',
        tabBarInactiveTintColor: '#78716c',
        tabBarStyle: {
          backgroundColor: '#fafaf9',
          borderTopWidth: 1,
          borderTopColor: '#e7e5e4',
          height: Platform.OS === 'ios' ? 90 : 90,
          paddingBottom: Platform.OS === 'ios' ? 30 : 15,
          paddingTop: 6,
          paddingHorizontal: 4,
          shadowColor: '#78716c',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
        tabBarItemStyle: {
          paddingVertical: 8,
          paddingHorizontal: 4,
          height: Platform.OS === 'ios' ? 60 : 55,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: focused ? '#fef7ed' : 'transparent',
              minWidth: 32,
              minHeight: 32,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <View style={{
                padding: 4,
                borderRadius: 8,
                backgroundColor: focused ? '#fef7ed' : 'transparent',
                minWidth: 32,
                minHeight: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name={focused ? 'location' : 'location-outline'} size={22} color={color} />
              </View>
              {currentTrip && currentTrip.status === 'active' && (
                <View 
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    backgroundColor: '#16a34a',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#fafaf9',
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
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: focused ? '#fef7ed' : 'transparent',
              minWidth: 32,
              minHeight: 32,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <View style={{
                padding: 4,
                borderRadius: 8,
                backgroundColor: focused ? '#fef7ed' : 'transparent',
                minWidth: 32,
                minHeight: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={22} color={color} />
              </View>
              <SafetyStatusIndicator score={safetyScore} />
            </View>
          ),
          tabBarBadge: hasActiveAlerts ? '!' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#dc2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
          },
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: focused ? '#fef7ed' : 'transparent',
              minWidth: 32,
              minHeight: 32,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}