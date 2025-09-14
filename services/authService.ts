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

export const sendOTP = async (phoneNumber: string): Promise<SendOTPResponse> => {
  try {
    phoneNumber = `+91${phoneNumber}`; // Remove spaces
    // Use Supabase Auth's built-in phone authentication
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        // Configure custom SMS provider (Twilio via Edge Function)
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
      // Supabase handles OTP ID internally
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
      phoneNumber: data.user.phone || phoneNumber,
      createdAt: data.user.created_at,
      isVerified: !!data.user.phone_confirmed_at,
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

export const resendOTP = async (phoneNumber: string): Promise<AuthResponse> => {
  try {
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
