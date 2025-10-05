// File: types/trip.ts (Fixed exports)
export interface TripDestination {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  category: 'historical' | 'religious' | 'nature' | 'adventure' | 'cultural' | 'beach' | 'mountain' | 'city';
  estimatedDuration: number; // in hours
  safetyRating: number; // 1-5
  popularityScore: number; // 1-10
  imageUrl?: string;
  entryFee?: number;
  timings?: string;
  bestTimeToVisit?: string[];
  tags?: string[];
  
  // Safety & Emergency Features
  nearbyFacilities?: {
    hospitals: EmergencyFacility[];
    policeStations: EmergencyFacility[];
    touristHelpCenters: EmergencyFacility[];
    embassies?: EmergencyFacility[];
  };
  safetyAlerts?: SafetyAlert[];
  crowdLevel?: 'low' | 'moderate' | 'high';
  femaleTravel?: {
    rating: number; // 1-5
    tips: string[];
  };
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'tourist_help' | 'embassy';
  address: string;
  phone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number; // in meters
  available24x7: boolean;
  services?: string[];
}

export interface SafetyAlert {
  id: string;
  type: 'weather' | 'crowd' | 'security' | 'health' | 'transport';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  validUntil: string;
  source: string;
}

export interface DigitalTouristID {
  id: string;
  userId: string;
  tripId: string;
  qrCodeData: string;
  blockchainHash: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  verificationLevel: 'basic' | 'standard' | 'premium';
  offlineVerificationCode: string;
  emergencyContacts: string[];
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    emergencyContact: string;
  };
}

export interface RealTimeSafetyIndex {
  overallScore: number; // 1-100
  factors: {
    weather: { score: number; status: string; alerts: string[] };
    crowd: { score: number; level: 'low' | 'moderate' | 'high'; density: number };
    security: { score: number; incidents: number; policePresence: boolean };
    health: { score: number; outbreaks: string[]; airQuality: number };
    transport: { score: number; disruptions: string[] };
  };
  recommendations: string[];
  lastUpdated: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
  tripType: 'solo' | 'family' | 'friends' | 'business' | 'group';
  
  // Safety & Digital ID Focus
  digitalId?: DigitalTouristID;
  safetyIndex?: RealTimeSafetyIndex;
  itinerary?: TripItineraryItem[];
  companions?: TripCompanion[];
  
  // Safety Features
  emergencyPlan: {
    primaryContact: string;
    secondaryContact: string;
    medicalInfo?: string;
    insuranceInfo?: string;
  };
  
  // Real-time tracking
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    address: string;
  };
  
  // Preferences (No budget)
  preferences: {
    activityLevel: 'relaxed' | 'moderate' | 'active';
    interests: string[];
    accommodationType: 'hotel' | 'resort' | 'hostel' | 'guest_house' | 'homestay';
    safetyPriority: 'low' | 'medium' | 'high';
    groupSize: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface TripTemplate {
  id: string;
  name: string;
  description: string;
  destination: string;
  duration: number;
  category: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  highlights: string[];
  itinerary: any[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripItineraryItem {
  id: string;
  tripId: string;
  destinationId: string;
  destination: TripDestination;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  estimatedDuration: number;
  transportMode: 'walking' | 'taxi' | 'bus' | 'train' | 'flight' | 'own_vehicle';
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  orderIndex: number;
  isCompleted: boolean;
  safetyStatus: 'safe' | 'caution' | 'avoid';
  createdAt: string;
  updatedAt: string;
}

export interface TripCompanion {
  id: string;
  userId: string;
  tripId: string;
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  isEmergencyContact: boolean;
  isActive: boolean;
  medicalInfo?: string;
  createdAt: string;
  updatedAt: string;
}

// Search parameters
export interface DestinationSearchParams {
  query?: string;
  category?: string;
  state?: string;
  safetyRating?: number;
  popularityScore?: number;
  limit?: number;
  offset?: number;
}

export interface TripSearchParams {
  status?: Trip['status'];
  tripType?: Trip['tripType'];
  startDateFrom?: string;
  startDateTo?: string;
  destination?: string;
  limit?: number;
  offset?: number;
}
