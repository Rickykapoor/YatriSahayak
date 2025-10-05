// File: app/_layout.tsx
import '../global.css';
import { useEffect, useState } from 'react';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TouristProvider } from '@/context/TouristContext';
import { SafetyProvider } from '@/context/SafetyContext';
import { 
  useRegistrationProgress, 
  RegistrationStatus, 
  getRegistrationRoute 
} from '@/hooks/useRegistrationProgress';

// Keep the splash screen visible until auth logic is complete
SplashScreen.preventAutoHideAsync();

function AuthLayer() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { status, currentStep, totalSteps, isLoading: regLoading, refreshProgress } = useRegistrationProgress();
  const segments = useSegments();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  // 🔥 TEMPORARY DEV OVERRIDE - Remove in production
  useEffect(() => {
    if (__DEV__ && !authLoading  && user?.id && !hasNavigated) {
      // Force navigate to a specific registration page for testing
      // Uncomment the page you want to test:
      
      // router.replace('/language' as any);
      // router.replace('/registration/personal-info' as any);
      // router.replace('/registration/emergency-contacts' as any); 
      // router.replace('/registration/medical-info' as any);
      // router.replace('/registration/data-consent' as any);
      // router.replace('/registration/system-permissions' as any);
      // router.replace('/registration/security-setup' as any);
      router.replace('/(app)/home' as any); // Go directly to main app
      // Comment out the lines below to enable dev override
      // setHasNavigated(true);
      // SplashScreen.hideAsync();
      // return;
    }
  }, [authLoading, isAuthenticated, user?.id, hasNavigated]);

  useEffect(() => {
    const handleNavigation = async () => {
      // Wait until both auth and registration states are known
      if (authLoading || regLoading || hasNavigated) {
        return;
      }

      const inAuthGroup = segments[0] === '(auth)';
      const inAppGroup = segments[0] === '(app)';
      const segmentsLength = segments.length;

      console.log('Current segments:', segments);
      console.log('Segments length:', segmentsLength);
      console.log('Auth status:', { isAuthenticated, status, inAuthGroup, inAppGroup });

      // Handle unauthenticated users
      if (!isAuthenticated) {
        if (!inAuthGroup) {
          console.log('User not authenticated, redirecting to language selection');
          router.replace('/language' as any);
          setHasNavigated(true);
        }
        SplashScreen.hideAsync();
        return;
      }

      // Handle authenticated users - check registration progress
      if (isAuthenticated && user?.id) {
        const targetRoute = getRegistrationRoute(status);
        const currentRoute = `/${segments.join('/')}`;
        
        console.log('Registration progress:', {
          status,
          currentStep,
          targetRoute,
          currentRoute,
          segmentsLength
        });

        // Navigate based on registration status
        if (status === RegistrationStatus.COMPLETE) {
          // Registration complete - redirect to app if not already there
          if (inAuthGroup || segmentsLength === 1 || !inAppGroup) {
            console.log('Registration complete, redirecting to app');
            router.replace('/(app)' as any);
            setHasNavigated(true);
          }
        } else {
          // Registration incomplete - redirect to appropriate auth screen
          const targetPath = targetRoute.replace('/', '');
          const isOnCorrectPage = currentRoute.includes(targetPath) || 
                                  segments.some(segment => segment.includes(targetPath));
          
          // Check if we need to navigate
          if (!isOnCorrectPage) {
            console.log(`Registration incomplete, redirecting to ${targetRoute}`);
            try {
              router.replace(targetRoute as any);
              setHasNavigated(true);
            } catch (error) {
              console.error('Navigation error:', error);
              // Fallback navigation
              router.replace('/language' as any);
              setHasNavigated(true);
            }
          }
        }
      }

      SplashScreen.hideAsync();
    };

    handleNavigation();
  }, [isAuthenticated, authLoading, regLoading, segments, user?.id, status, currentStep, hasNavigated]);

  // Show loading screen while checking authentication or registration
  if (authLoading || regLoading) {
    const loadingMessage = authLoading ? 'Checking authentication...' : 
                          regLoading ? 'Checking registration status...' : 
                          'Loading...';
    
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#ea580c' 
      }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ 
          color: 'white', 
          marginTop: 10, 
          fontSize: 16,
          textAlign: 'center' 
        }}>
          {loadingMessage}
        </Text>
        {status !== RegistrationStatus.COMPLETE && currentStep > 1 && (
          <Text style={{ 
            color: 'white', 
            marginTop: 5, 
            fontSize: 14,
            opacity: 0.8 
          }}>
            Step {currentStep} of {totalSteps}
          </Text>
        )}
      </View>
    );
  }

  // Once loaded, the <Slot> will render the appropriate child layout
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
