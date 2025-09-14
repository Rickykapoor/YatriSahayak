// types/auth.ts
export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface AuthState {
  phoneNumber: string;
  countryCode: string;
  otp: string;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
}
export interface UserSettings {
  locationEnabled: boolean;
  emergencyAlerts: boolean;
  biometricEnabled: boolean;
  language: string;
  languageName?: string;
  darkMode: boolean;
  soundEnabled: boolean;
  // Consent settings
  locationTracking: boolean;
  dataSharing: boolean;
  analyticsCollection: boolean;
  emergencySharing: boolean;
  thirdPartyIntegration: boolean;
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  joinDate: string;
  digitalID: string;
  verified: boolean;
  averageSafetyScore: number;
  checkinsCount: number;
  recentTrips: Trip[];
  settings: UserSettings;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}

export interface SendOTPResponse extends AuthResponse {
  // No otpId needed - Supabase handles internally
}

export interface VerifyOTPResponse extends AuthResponse {
  token?: string;
  user?: User;
  session?: any;
}



export interface UserSettings {
  locationEnabled: boolean;
  emergencyAlerts: boolean;
  biometricEnabled: boolean;
  language: string;
  darkMode: boolean;
  soundEnabled: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  lastCheckpoint?: string;
  checkpoints: Checkpoint[];
  geofences: Geofence[];
  safetyScore: number;
  companions: string[];
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'police' | 'hotel' | 'attraction' | 'transport';
  visited: boolean;
  visitedAt?: string;
}

export interface Geofence {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  type: 'safe' | 'caution' | 'danger';
  active: boolean;
}

export interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  time: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
  accuracy?: number;
  trail?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export interface Destination {
  id: number;
  name: string;
  safetyScore: number;
  image: string;
  description?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'safety' | 'trip' | 'system' | 'emergency';
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
}
