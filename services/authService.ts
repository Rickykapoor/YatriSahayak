// services/authService.ts
import { supabase } from '../lib/supabase';
import type { 
  SendOTPResponse, 
  VerifyOTPResponse, 
  AuthResponse,
  User
} from '../types/auth';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};
export const verifyOTP = async (
  phoneNumber: string, 
  otp: string
): Promise<VerifyOTPResponse> => {
  try {
    // Use Supabase Auth's built-in OTP verification
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms'
    });

    if (error) {
      console.error('Supabase Auth Verification Error:', error);
      return {
        success: false,
        message: error.message || 'Invalid OTP',
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        message: 'Verification failed',
      };
    }

    // Map Supabase user to our User type
    const user: User = {
      id: data.user.id,
      phone: data.user.phone || phoneNumber,
      name: '',
      firstName: '',
      lastName: '',
      email: '',
      joinDate: '',
      digitalID: '',
      verified: false,
      averageSafetyScore: 0,
      checkinsCount: 0,
      recentTrips: [],
      settings: undefined
    };

    return {
      success: true,
      token: data.session.access_token,
      user,
      session: data.session,
    };
    
  } catch (error) {
    console.error('Verify OTP Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    return {
      success: false,
      message: errorMessage,
    };
  }
};
export const sendOTP = async (phoneNumber: string): Promise<SendOTPResponse> => {
  try {
    // Convert phoneNumber to E.164 format (no spaces, no dashes)
    // Assumes phoneNumber is entered without country code
    let formattedPhone = phoneNumber.trim();
    
    // Remove any spaces, dashes, or special characters from input
    formattedPhone = formattedPhone.replace(/\D/g, "");

    // Add country code +91 (for India) at the beginning
    formattedPhone = `+91${formattedPhone}`;

    console.log('Sending OTP to:', formattedPhone);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: 'sms',
      }
    });

    if (error) {
      console.error('Supabase Auth OTP Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP',
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully',
    };
    
  } catch (error) {
    console.error('Send OTP Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const resendOTP = async (phoneNumber: string): Promise<AuthResponse> => {
  try {
    console.log('Resending OTP to:', phoneNumber);
    // Send raw number to sendOTP - it will handle formatting
    const result = await sendOTP(phoneNumber);
    return {
      success: result.success,
      message: result.success ? 'OTP resent successfully' : result.message,
    };
  } catch (error) {
    console.error('Resend OTP Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};
// Get current user from Supabase Auth
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    return {
      id: user.id,
      phone: user.phone || '',
      name: user.user_metadata?.name || '',
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      email: user.email || '',
      joinDate: user.user_metadata?.joinDate || user.created_at || '',
      digitalID: user.user_metadata?.digitalID || '',
      verified: !!user.phone_confirmed_at,
      averageSafetyScore: user.user_metadata?.averageSafetyScore || 0,
      checkinsCount: user.user_metadata?.checkinsCount || 0,
      recentTrips: user.user_metadata?.recentTrips || [],
      settings: user.user_metadata?.settings || {},

      // Add other required properties with default values if needed
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
};
// Logout user
export const logout = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    return !error;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};
