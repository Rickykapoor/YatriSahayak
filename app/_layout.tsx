import '../global.css';
import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

// Import all providers
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TouristProvider } from '@/context/TouristContext';
import { SafetyProvider } from '@/context/SafetyContext';

// Navigation component that uses auth context
function RootLayoutNav() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  // useEffect(() => {
  //   if (isLoading) return;

  //   const inAuthGroup = segments[0] === '(auth)';

  //   if (!isAuthenticated && !inAuthGroup) {
  //     router.replace('/(auth)/welcome');
  //   } else if (isAuthenticated && inAuthGroup) {
  //     router.replace('/(tabs)');
  //   }
  // }, [isAuthenticated, isLoading, segments]);

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ 
          presentation: 'modal',
          headerShown: true 
        }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

// CRITICAL: Proper provider nesting order
export default function RootLayout() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <TouristProvider>
          <RootLayoutNav />
        </TouristProvider>
      </SafetyProvider>
    </AuthProvider>
  );
}
