// File: app/(app)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ea580c',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      {/* ONLY THESE 5 TABS WILL SHOW */}
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
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="trip-planner"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
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

      {/* HIDE ALL OTHER SCREENS */}
      <Tabs.Screen name="emergency" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/create" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/all-trips" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/templates" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/destinations" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/search-results" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/trip" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/trip/[id]/itinerary" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/trip/[id]/budget" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/trip/[id]/companions" options={{ href: null }} />
      <Tabs.Screen name="trip-planner/trip/[id]" options={{ href: null }} />

    </Tabs>
  );
}
