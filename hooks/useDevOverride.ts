// File: hooks/useDevOverride.ts (Optional - for easy dev testing)
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export const useDevOverride = (enabled: boolean = false) => {
  const router = useRouter();

  useEffect(() => {
    if (__DEV__ && enabled) {
      // Uncomment the route you want to test:
      
      router.replace('/language');
      // router.replace('/registration/personal-info');
      // router.replace('/registration/emergency-contacts'); 
      // router.replace('/registration/medical-info');
      // router.replace('/registration/data-consent');
      // router.replace('/registration/system-permissions');
      // router.replace('/registration/security-setup');
      // router.replace('/(app)'); // Go directly to main app
    }
  }, [enabled]);
};
