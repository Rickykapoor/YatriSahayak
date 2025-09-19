// File: app/_layout.tsx

import '../global.css';
import { useEffect } from 'react';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TouristProvider } from '@/context/TouristContext';
import { SafetyProvider } from '@/context/SafetyContext';

// Keep the splash screen visible until auth logic is complete
SplashScreen.preventAutoHideAsync();

function AuthLayer() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is known
    if (isLoading) {
      return;
    }

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    // Redirect based on auth state
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/language');
     } 
    //else if (isAuthenticated && inAuthGroup) {
    //   router.replace('/(app)/home');
    // }
  }, [isAuthenticated, isLoading, segments]);

  // Show a loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ea580c' }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Once loaded, the <Slot> will render the appropriate child layout
  // (e.g., app/(auth)/_layout.tsx or app/(app)/_layout.tsx)
  return (
    <>
      <StatusBar style="light" backgroundColor="#ea580c" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <TouristProvider>
          <AuthLayer />
        </TouristProvider>
      </SafetyProvider>
    </AuthProvider>
  );
}