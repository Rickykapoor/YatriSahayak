// File: services/tripService.ts (Added missing methods)
import { supabase } from '@/lib/supabase';
import { Trip, TripDestination, DigitalTouristID, RealTimeSafetyIndex, TripTemplate, DestinationSearchParams } from '@/types/trip';
import 'react-native-get-random-values';

class TripServiceClass {
private simpleEncode(data: string): string {
    try {
      const base64 = btoa(unescape(encodeURIComponent(data)));
      const shifted = base64.split('').map(char => {
        const code = char.charCodeAt(0);
        return String.fromCharCode(code + 3);
      }).join('');
      return shifted;
    } catch (error) {
      console.error('Encoding error:', error);
      return btoa(data);
    }
  }

  private simpleDecode(encodedData: string): string {
    try {
      const unshifted = encodedData.split('').map(char => {
        const code = char.charCodeAt(0);
        return String.fromCharCode(code - 3);
      }).join('');
      const decoded = decodeURIComponent(escape(atob(unshifted)));
      return decoded;
    } catch (error) {
      console.error('Decoding error:', error);
      return atob(encodedData);
    }
  }

  private generateChecksum(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // 🔍 DECODE QR CODE DATA (PUBLIC STATIC METHOD)
static decodeQRData(encodedData: string): { valid: boolean; data?: any; error?: string } {
  try {
    const service = new TripServiceClass();
    const decodedString = service.simpleDecode(encodedData);
    
    if (!decodedString) {
      return { valid: false, error: 'Failed to decode QR code' };
    }

    const qrData = JSON.parse(decodedString);
    console.log('🔍 Decoded QR data:', qrData);
    
    if (qrData.typ !== 'YatriSahayak-DigitalID') {
      return { valid: false, error: 'Invalid Digital ID format' };
    }
    
    // More lenient expiration check - add some buffer time
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = qrData.exp;
    const bufferTime = 24 * 60 * 60; // 24 hours buffer
    
    console.log('🕐 Current time:', new Date(currentTime * 1000).toLocaleString());
    console.log('🕐 QR expires at:', new Date(expirationTime * 1000).toLocaleString());
    
    if (expirationTime && (expirationTime + bufferTime) < currentTime) {
      const expiredDate = new Date(expirationTime * 1000);
      return { 
        valid: false, 
        error: `Digital ID expired on ${expiredDate.toLocaleDateString('en-IN')}` 
      };
    }
    
    // Skip checksum validation for development/testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('🧪 Development mode: Skipping checksum validation');
    } else {
      const expectedChecksum = service.generateChecksum(qrData.tid + qrData.uid);
      if (qrData.checksum !== expectedChecksum) {
        return { valid: false, error: 'Digital ID integrity check failed' };
      }
    }
    
    return {
      valid: true,
      data: {
        userId: qrData.uid,
        tripId: qrData.tid,
        tripName: qrData.name,
        destination: qrData.dest,
        startDate: new Date(qrData.start),
        endDate: new Date(qrData.end),
        status: qrData.status,
        issuedAt: new Date(qrData.iat * 1000),
        version: qrData.ver
      }
    };
  } catch (error) {
    console.error('QR decode error:', error);
    return { valid: false, error: 'Invalid QR code format' };
  }
}

  // ... (keep all other existing methods)

  // Make generateEncodedQRData public so we can use it for testing
public generateEncodedQRData(userId: string, tripId: string, tripData: Trip): string {
  const now = new Date();
  const endDate = new Date(tripData.endDate);
  
  // Add buffer time to end date for QR validity
  const qrExpiryDate = new Date(endDate);
  qrExpiryDate.setHours(23, 59, 59, 999); // End of day
  
  const qrPayload = {
    uid: userId,
    tid: tripId,
    name: tripData.title,
    dest: tripData.destination,
    start: tripData.startDate,
    end: tripData.endDate,
    status: 'active',
    iat: Math.floor(now.getTime() / 1000), // Current time
    exp: Math.floor(qrExpiryDate.getTime() / 1000), // End of trip day
    ver: '1.0',
    typ: 'YatriSahayak-DigitalID',
    checksum: this.generateChecksum(tripId + userId)
  };

  console.log('🔐 Generating QR data for:', qrPayload.name);
  console.log('🕐 QR expires at:', new Date(qrPayload.exp * 1000).toLocaleString());
  
  const encodedData = this.simpleEncode(JSON.stringify(qrPayload));
  return encodedData;
}

  // 🏛️ SEARCH DESTINATIONS (Added Missing Method)
  async searchDestinations(params: DestinationSearchParams = {}): Promise<TripDestination[]> {
    try {
      if (__DEV__) {
        const mockDestinations = this.getMockDestinations();
        let filtered = mockDestinations;

        if (params.query) {
          const query = params.query.toLowerCase();
          filtered = filtered.filter(dest => 
            dest.name.toLowerCase().includes(query) ||
            dest.city.toLowerCase().includes(query) ||
            dest.state.toLowerCase().includes(query)
          );
        }

        if (params.category) {
          filtered = filtered.filter(dest => dest.category === params.category);
        }

        return filtered.slice(0, params.limit || 20);
      }

      // Production: Search in Supabase
      let query = supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true);

      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,city.ilike.%${params.query}%,state.ilike.%${params.query}%`);
      }
      if (params.category) query = query.eq('category', params.category);

      const { data, error } = await query
        .order('popularity_score', { ascending: false })
        .limit(params.limit || 20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }

  // 📋 GET TRIP TEMPLATES (Added Missing Method)
  async getTripTemplates(category?: string): Promise<TripTemplate[]> {
    try {
      if (__DEV__) {
        const mockTemplates = this.getMockTemplates();
        return category ? mockTemplates.filter(t => t.category === category) : mockTemplates;
      }

      let query = supabase
        .from('trip_templates')
        .select('*')
        .eq('is_active', true);

      if (category) query = query.eq('category', category);

      const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // 🚫 CHECK IF USER CAN CREATE NEW TRIP
  async canCreateNewTrip(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const trips = await this.getUserTrips(userId);
      
      const activeTrip = trips.find(trip => trip.status === 'active');
      if (activeTrip) {
        return { 
          canCreate: false, 
          reason: `You have an active trip: "${activeTrip.title}". Complete it before planning a new one.` 
        };
      }
      
      const plannedTrip = trips.find(trip => trip.status === 'planned');
      if (plannedTrip) {
        return { 
          canCreate: false, 
          reason: `You have a planned trip: "${plannedTrip.title}". Start or cancel it before planning a new one.` 
        };
      }
      
      return { canCreate: true };
    } catch (error) {
      console.error('Error checking trip creation eligibility:', error);
      return { canCreate: true };
    }
  }

  // 🆕 CREATE TRIP
  async createTrip(userId: string, tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    try {
      const eligibility = await this.canCreateNewTrip(userId);
      if (!eligibility.canCreate) {
        throw new Error(eligibility.reason || 'Cannot create new trip');
      }

      if (__DEV__ && userId.includes('dummy')) {
        const mockTrip: Trip = {
          ...tripData,
          id: `trip_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log('✅ Dev mode: Mock trip created', mockTrip.title);
        return mockTrip;
      }

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userId,
          title: tripData.title,
          description: tripData.description,
          destination: tripData.destination,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          duration: tripData.duration,
          trip_type: tripData.tripType,
          status: tripData.status,
          emergency_plan: tripData.emergencyPlan,
          preferences: tripData.preferences,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...tripData,
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('❌ Error creating trip:', error);
      throw error;
    }
  }

  // 🚀 START TRIP WITH QR CODE GENERATION
  async startTrip(tripId: string, userId: string): Promise<{ trip: Trip; digitalId: DigitalTouristID }> {
    try {
      console.log('🎯 Starting trip with QR generation:', { tripId, userId });

      const trip = await this.getTripById(tripId, userId);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const updatedTrip = await this.updateTrip(tripId, userId, { status: 'active' });
      
      console.log('🔐 Generating QR code...');
      const encodedQRData = this.generateEncodedQRData(userId, tripId, updatedTrip);
      
      const digitalId: DigitalTouristID = {
        id: `digital_${Date.now()}`,
        userId,
        tripId,
        qrCodeData: encodedQRData,
        blockchainHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
        issuedAt: new Date().toISOString(),
        expiresAt: updatedTrip.endDate,
        status: 'active',
        verificationLevel: 'standard',
        offlineVerificationCode: this.generateOfflineCode(),
        emergencyContacts: updatedTrip.emergencyPlan ? [updatedTrip.emergencyPlan.primaryContact] : [],
      };

      updatedTrip.digitalId = digitalId;

      console.log('✅ Trip started with QR code generated successfully');
      
      return { trip: updatedTrip, digitalId };
    } catch (error) {
      console.error('❌ Error starting trip:', error);
      throw error;
    }
  }

  // Helper methods
  private generateOfflineCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    if (__DEV__ && userId.includes('dummy')) {
      return this.getMockTrips();
    }
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data?.map(trip => this.mapDatabaseTrip(trip)) || [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    }
  }

  async getTripById(tripId: string, userId: string): Promise<Trip | null> {
    if (__DEV__ && tripId.includes('trip_')) {
      const mockTrips = this.getMockTrips();
      return mockTrips.find(t => t.id === tripId) || null;
    }
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapDatabaseTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      return null;
    }
  }

  async updateTrip(tripId: string, userId: string, updates: Partial<Trip>): Promise<Trip> {
    if (__DEV__ && tripId.includes('trip_')) {
      const mockTrips = this.getMockTrips();
      const trip = mockTrips.find(t => t.id === tripId);
      if (!trip) throw new Error('Trip not found');
      return { ...trip, ...updates, updatedAt: new Date().toISOString() };
    }
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          title: updates.title,
          description: updates.description,
          destination: updates.destination,
          start_date: updates.startDate,
          end_date: updates.endDate,
          trip_type: updates.tripType,
          status: updates.status,
          emergency_plan: updates.emergencyPlan,
          preferences: updates.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseTrip(data);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  // Map database trip to our Trip type
  private mapDatabaseTrip(dbTrip: any): Trip {
    return {
      id: dbTrip.id,
      userId: dbTrip.user_id,
      title: dbTrip.title || dbTrip.destination,
      description: dbTrip.description,
      destination: dbTrip.destination,
      startDate: dbTrip.start_date,
      endDate: dbTrip.end_date,
      duration: Math.ceil((new Date(dbTrip.end_date).getTime() - new Date(dbTrip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
      status: dbTrip.status,
      tripType: dbTrip.trip_type || 'solo',
      emergencyPlan: dbTrip.emergency_plan || {
        primaryContact: '',
        secondaryContact: ''
      },
      preferences: dbTrip.preferences || {
        activityLevel: 'moderate',
        interests: [],
        accommodationType: 'hotel',
        safetyPriority: 'medium',
        groupSize: 1
      },
      createdAt: dbTrip.created_at,
      updatedAt: dbTrip.updated_at
    };
  }

  // 🗺️ MOCK DESTINATIONS DATA
  private getMockDestinations(): TripDestination[] {
    return [
      {
        id: 'dest_1',
        name: 'Red Fort',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        coordinates: { latitude: 28.6562, longitude: 77.2410 },
        description: 'Historic Mughal fort complex',
        category: 'historical',
        estimatedDuration: 3,
        safetyRating: 4,
        popularityScore: 9,
        imageUrl: 'https://example.com/red-fort.jpg',
        entryFee: 30,
        timings: '9:30 AM - 4:30 PM',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February'],
        tags: ['unesco', 'mughal', 'architecture'],
        nearbyFacilities: {
          hospitals: [],
          policeStations: [],
          touristHelpCenters: []
        },
        safetyAlerts: [],
        crowdLevel: 'high',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dest_2',
        name: 'Taj Mahal',
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        coordinates: { latitude: 27.1751, longitude: 78.0421 },
        description: 'Iconic white marble mausoleum',
        category: 'historical',
        estimatedDuration: 4,
        safetyRating: 4,
        popularityScore: 10,
        imageUrl: 'https://example.com/taj-mahal.jpg',
        entryFee: 50,
        timings: '6:00 AM - 6:30 PM',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
        tags: ['unesco', 'wonder', 'architecture'],
        nearbyFacilities: {
          hospitals: [],
          policeStations: [],
          touristHelpCenters: []
        },
        safetyAlerts: [],
        crowdLevel: 'high',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dest_3',
        name: 'Hawa Mahal',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        coordinates: { latitude: 26.9239, longitude: 75.8267 },
        description: 'Palace of Winds with intricate lattice work',
        category: 'historical',
        estimatedDuration: 2,
        safetyRating: 4,
        popularityScore: 8,
        imageUrl: 'https://example.com/hawa-mahal.jpg',
        entryFee: 20,
        timings: '9:00 AM - 4:30 PM',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February'],
        tags: ['rajasthan', 'palace', 'architecture'],
        nearbyFacilities: {
          hospitals: [],
          policeStations: [],
          touristHelpCenters: []
        },
        safetyAlerts: [],
        crowdLevel: 'moderate',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dest_4',
        name: 'Gateway of India',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        coordinates: { latitude: 18.9220, longitude: 72.8347 },
        description: 'Iconic arch monument overlooking the Arabian Sea',
        category: 'historical',
        estimatedDuration: 2,
        safetyRating: 4,
        popularityScore: 9,
        imageUrl: 'https://example.com/gateway-india.jpg',
        entryFee: 0,
        timings: '24 hours',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February'],
        tags: ['mumbai', 'colonial', 'monument'],
        nearbyFacilities: {
          hospitals: [],
          policeStations: [],
          touristHelpCenters: []
        },
        safetyAlerts: [],
        crowdLevel: 'high',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dest_5',
        name: 'Backwaters',
        city: 'Alleppey',
        state: 'Kerala',
        country: 'India',
        coordinates: { latitude: 9.4981, longitude: 76.3388 },
        description: 'Serene network of lagoons and lakes',
        category: 'nature',
        estimatedDuration: 6,
        safetyRating: 5,
        popularityScore: 9,
        imageUrl: 'https://example.com/backwaters.jpg',
        entryFee: 0,
        timings: '24 hours',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
        tags: ['kerala', 'backwaters', 'houseboat'],
        nearbyFacilities: {
          hospitals: [],
          policeStations: [],
          touristHelpCenters: []
        },
        safetyAlerts: [],
        crowdLevel: 'low',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dest_6',
        name: 'Golden Temple',
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        coordinates: { latitude: 31.6200, longitude: 74.8765 },
        description: 'Sacred Sikh shrine with golden dome',
        category: 'religious',
        estimatedDuration: 4,
        safetyRating: 5,
        popularityScore: 9,
        imageUrl: 'https://example.com/golden-temple.jpg',
        entryFee: 0,
        timings: '24 hours',
        bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
        tags: ['sikh', 'religious', 'golden'],
        nearbyFacilities: {
          hospitals: [],
          policeStations: [],
          touristHelpCenters: []
        },
        safetyAlerts: [],
        crowdLevel: 'high',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // 📋 MOCK TRIP TEMPLATES DATA
  private getMockTemplates(): TripTemplate[] {
    return [
      {
        id: 'template_1',
        name: 'Golden Triangle Classic',
        description: 'Explore Delhi, Agra, and Jaipur in this popular circuit covering India\'s most iconic monuments',
        destination: 'Delhi, Agra, Jaipur',
        duration: 5,
        category: 'historical',
        difficulty: 'easy',
        highlights: ['Red Fort', 'Taj Mahal', 'Hawa Mahal', 'Amber Fort'],
        itinerary: [],
        imageUrl: 'https://example.com/golden-triangle.jpg',
        rating: 4.5,
        reviewCount: 1250,
        isFeatured: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template_2',
        name: 'Kerala Backwater Bliss',
        description: 'Peaceful houseboat journey through Kerala\'s famous backwaters with traditional cuisine',
        destination: 'Kochi, Alleppey, Kumarakom',
        duration: 4,
        category: 'nature',
        difficulty: 'easy',
        highlights: ['Houseboat Stay', 'Traditional Cuisine', 'Bird Watching', 'Village Tours'],
        itinerary: [],
        imageUrl: 'https://example.com/kerala-backwaters.jpg',
        rating: 4.7,
        reviewCount: 890,
        isFeatured: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template_3',
        name: 'Rajasthan Royal Heritage',
        description: 'Experience the grandeur of Rajasthan with palaces, forts, and desert adventures',
        destination: 'Jaipur, Udaipur, Jaisalmer',
        duration: 7,
        category: 'cultural',
        difficulty: 'moderate',
        highlights: ['City Palace', 'Desert Safari', 'Lake Pichola', 'Camel Ride'],
        itinerary: [],
        imageUrl: 'https://example.com/rajasthan-royal.jpg',
        rating: 4.6,
        reviewCount: 670,
        isFeatured: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template_4',
        name: 'Mumbai City Explorer',
        description: 'Discover the commercial capital with its iconic landmarks, street food, and Bollywood culture',
        destination: 'Mumbai',
        duration: 3,
        category: 'city',
        difficulty: 'easy',
        highlights: ['Gateway of India', 'Marine Drive', 'Bollywood Studio', 'Street Food Tour'],
        itinerary: [],
        imageUrl: 'https://example.com/mumbai-explorer.jpg',
        rating: 4.3,
        reviewCount: 420,
        isFeatured: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Mock data with sample trips
private getMockTrips(): Trip[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  const lastWeekEnd = new Date(lastMonth);
  lastWeekEnd.setDate(lastMonth.getDate() + 5);

  return [
    {
      id: 'trip_1',
      userId: 'dummy_user_001',
      title: 'Golden Triangle Adventure',
      description: 'Exploring the historic cities of Delhi, Agra, and Jaipur',
      destination: 'Delhi, Agra, Jaipur',
      startDate: today.toISOString().split('T')[0], // Today
      endDate: nextWeek.toISOString().split('T')[0], // One week from today
      duration: 7,
      status: 'planned',
      tripType: 'family',
      emergencyPlan: {
        primaryContact: '+919876543210',
        secondaryContact: '+919876543211',
        medicalInfo: 'No known allergies',
      },
      preferences: {
        activityLevel: 'moderate',
        interests: ['history', 'culture', 'photography'],
        accommodationType: 'hotel',
        safetyPriority: 'high',
        groupSize: 4,
      },
      createdAt: today.toISOString(),
      updatedAt: today.toISOString()
    },
    {
      id: 'trip_2',
      userId: 'dummy_user_001',
      title: 'Kerala Backwaters',
      description: 'Peaceful houseboat journey through the backwaters',
      destination: 'Alleppey, Kerala',
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: lastWeekEnd.toISOString().split('T')[0],
      duration: 4,
      status: 'completed',
      tripType: 'family',
      emergencyPlan: {
        primaryContact: '+919876543210',
        secondaryContact: '+919876543211',
      },
      preferences: {
        activityLevel: 'relaxed',
        interests: ['nature', 'photography'],
        accommodationType: 'resort',
        safetyPriority: 'medium',
        groupSize: 2,
      },
      createdAt: lastMonth.toISOString(),
      updatedAt: lastMonth.toISOString()
    }
  ];
}
}

// Export both the instance and the class
const TripService = new TripServiceClass();
export default TripService;
export { TripServiceClass };
