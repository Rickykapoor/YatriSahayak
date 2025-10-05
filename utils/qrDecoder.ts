// File: utils/qrDecoder.ts (Fixed utility functions)
import { TripServiceClass } from '@/services/tripService';

export interface QRVerificationResult {
  valid: boolean;
  data?: {
    userId: string;
    tripId: string;
    tripName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    status: string;
    issuedAt: Date;
    version: string;
  };
  error?: string;
}

export const verifyQRCode = (qrData: string): QRVerificationResult => {
  try {
    console.log('🔍 Verifying QR code...');
    const result = TripServiceClass.decodeQRData(qrData); // Fixed: using static method correctly
    
    if (result.valid) {
      console.log('✅ QR code is valid for:', result.data?.tripName);
    } else {
      console.log('❌ QR verification failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('QR verification error:', error);
    return { valid: false, error: 'Failed to verify QR code' };
  }
};

export const validateOfflineCode = (code: string): boolean => {
  // Basic validation for offline verification codes
  if (!code || code.length !== 6) {
    return false;
  }
  
  // Check if code contains only alphanumeric characters
  const alphanumericRegex = /^[A-Z0-9]{6}$/;
  return alphanumericRegex.test(code.toUpperCase());
};

export const generateMockQRData = (): string => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    // Create test QR with current valid dates
    const testQRPayload = {
      uid: 'user_test_456',
      tid: 'trip_test_123',
      name: 'Test Golden Triangle Trip',
      dest: 'Delhi, Agra, Jaipur',
      start: today.toISOString().split('T')[0],
      end: nextWeek.toISOString().split('T')[0],
      status: 'active',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(nextWeek.getTime() / 1000) + (24 * 60 * 60), // +24 hours buffer
      ver: '1.0',
      typ: 'YatriSahayak-DigitalID',
      checksum: 'test123' // Simple test checksum
    };

    console.log('🧪 Generated test QR payload:', testQRPayload);
    console.log('🕐 Test QR expires:', new Date(testQRPayload.exp * 1000).toLocaleString());

    // Simple encoding for testing
    const jsonString = JSON.stringify(testQRPayload);
    const encodedData = btoa(jsonString);
    
    // Apply simple cipher (shift characters by 3)
    const shifted = encodedData.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + 3);
    }).join('');

    return shifted;
  } catch (error) {
    console.error('Error generating mock QR data:', error);
    return 'test_qr_data_fallback';
  }
};
