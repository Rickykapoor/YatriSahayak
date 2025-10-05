// File: hooks/useRegistrationProgress.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export enum RegistrationStatus {
  NOT_STARTED = 'not_started',
  PERSONAL_INFO = 'personal_info',
  DOCUMENTS = 'documents',
  EMERGENCY_CONTACTS = 'emergency_contacts',
  MEDICAL_INFO = 'medical_info',
  CONSENT = 'consent',
  PERMISSIONS = 'permissions',
  SECURITY = 'security',
  COMPLETE = 'complete'
}

export interface RegistrationProgress {
  status: RegistrationStatus;
  currentStep: number;
  totalSteps: number;
  completedSections: string[];
  isLoading: boolean;
  error: string | null;
}

// Check user's registration progress
const checkRegistrationStatus = async (userId: string): Promise<Omit<RegistrationProgress, 'isLoading' | 'error'>> => {
  try {
    // 🔥 DEV OVERRIDE: Control registration status for testing
    if (__DEV__ && userId.includes('dummy')) {
      // Uncomment the line for the page you want to test:
      
      return { status: RegistrationStatus.NOT_STARTED, currentStep: 1, totalSteps: 17, completedSections: [] }; // → language
    //   return { status: RegistrationStatus.PERSONAL_INFO, currentStep: 4, totalSteps: 17, completedSections: ['language'] }; // → personal-info
      // return { status: RegistrationStatus.EMERGENCY_CONTACTS, currentStep: 8, totalSteps: 17, completedSections: ['language', 'personal_info'] }; // → emergency-contacts
    //   return { status: RegistrationStatus.MEDICAL_INFO, currentStep: 9, totalSteps: 17, completedSections: ['language', 'personal_info', 'emergency_contacts'] }; // → medical-info
      // return { status: RegistrationStatus.CONSENT, currentStep: 10, totalSteps: 17, completedSections: ['language', 'personal_info', 'emergency_contacts', 'medical_info'] }; // → data-consent
      // return { status: RegistrationStatus.PERMISSIONS, currentStep: 11, totalSteps: 17, completedSections: ['language', 'personal_info', 'emergency_contacts', 'medical_info', 'consent'] }; // → system-permissions
      // return { status: RegistrationStatus.SECURITY, currentStep: 12, totalSteps: 17, completedSections: ['language', 'personal_info', 'emergency_contacts', 'medical_info', 'consent', 'permissions'] }; // → security-setup
      
      // Default: Registration complete - goes to app
      // return {
      //   status: RegistrationStatus.COMPLETE,
      //   currentStep: 17,
      //   totalSteps: 17,
      //   completedSections: ['language', 'personal_info', 'emergency_contacts', 'medical_info', 'consent', 'permissions', 'security']
      // };
    }

    // Production: Check various tables for completion status
    const [
      personalInfo,
      emergencyContacts,
      medicalInfo,
      consentSettings,
      systemPermissions,
      securitySettings
    ] = await Promise.all([
      supabase.from('users').select('first_name, last_name, email, phone, date_of_birth, gender').eq('id', userId).single(),
      supabase.from('emergency_contacts').select('id').eq('user_id', userId).eq('is_active', true),
      supabase.from('medical_information').select('id').eq('user_id', userId).single(),
      supabase.from('consent_settings').select('id').eq('user_id', userId).single(),
      supabase.from('system_permissions').select('location_permission, camera_permission').eq('user_id', userId).single(),
      supabase.from('security_settings').select('id').eq('user_id', userId).single()
    ]);

    const completedSections: string[] = [];
    let currentStep = 1;
    let status = RegistrationStatus.NOT_STARTED;

    // Check personal info completion
    const hasPersonalInfo = personalInfo.data && 
      personalInfo.data.first_name && 
      personalInfo.data.last_name && 
      personalInfo.data.email && 
      personalInfo.data.phone &&
      personalInfo.data.date_of_birth &&
      personalInfo.data.gender;

    if (hasPersonalInfo) {
      completedSections.push('personal_info');
      currentStep = Math.max(currentStep, 5);
      status = RegistrationStatus.PERSONAL_INFO;
    }

    // Check emergency contacts
    const hasEmergencyContacts = emergencyContacts.data && emergencyContacts.data.length > 0;
    if (hasEmergencyContacts) {
      completedSections.push('emergency_contacts');
      currentStep = Math.max(currentStep, 9);
      status = RegistrationStatus.EMERGENCY_CONTACTS;
    }

    // Check medical info (optional but tracked)
    const hasMedicalInfo = medicalInfo.data;
    if (hasMedicalInfo) {
      completedSections.push('medical_info');
      currentStep = Math.max(currentStep, 10);
      status = RegistrationStatus.MEDICAL_INFO;
    }

    // Check consent settings
    const hasConsent = consentSettings.data;
    if (hasConsent) {
      completedSections.push('consent');
      currentStep = Math.max(currentStep, 11);
      status = RegistrationStatus.CONSENT;
    }

    // Check system permissions
    const hasPermissions = systemPermissions.data && 
      systemPermissions.data.location_permission === 'granted' && 
      systemPermissions.data.camera_permission === 'granted';
    if (hasPermissions) {
      completedSections.push('permissions');
      currentStep = Math.max(currentStep, 12);
      status = RegistrationStatus.PERMISSIONS;
    }

    // Check security settings
    const hasSecurity = securitySettings.data;
    if (hasSecurity) {
      completedSections.push('security');
      currentStep = Math.max(currentStep, 13);
      status = RegistrationStatus.SECURITY;
    }

    // Check if registration is complete
    const requiredSections = ['personal_info', 'emergency_contacts', 'consent', 'permissions', 'security'];
    const isComplete = requiredSections.every(section => completedSections.includes(section));
    
    if (isComplete) {
      status = RegistrationStatus.COMPLETE;
      currentStep = 17;
    }

    return {
      status,
      currentStep,
      totalSteps: 17,
      completedSections
    };

  } catch (error) {
    console.error('Error checking registration status:', error);
    return {
      status: RegistrationStatus.NOT_STARTED,
      currentStep: 1,
      totalSteps: 17,
      completedSections: []
    };
  }
};

export const useRegistrationProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<RegistrationProgress>({
    status: RegistrationStatus.NOT_STARTED,
    currentStep: 1,
    totalSteps: 17,
    completedSections: [],
    isLoading: true,
    error: null,
  });

  const refreshProgress = async () => {
    if (!user?.id) return;

    setProgress(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newProgress = await checkRegistrationStatus(user.id);
      setProgress({
        ...newProgress,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing registration progress:', error);
      setProgress(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load registration progress',
      }));
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshProgress();
    }
  }, [user?.id]);

  return {
    ...progress,
    refreshProgress,
  };
};

// Helper function - Using direct file paths that match your structure
export const getRegistrationRoute = (status: RegistrationStatus): string => {
  switch (status) {
    case RegistrationStatus.NOT_STARTED:
      return '/language';
    case RegistrationStatus.PERSONAL_INFO:
      return '/registration/personal-info';
    case RegistrationStatus.DOCUMENTS:
      return '/registration/emergency-contacts';
    case RegistrationStatus.EMERGENCY_CONTACTS:
      return '/registration/medical-info';
    case RegistrationStatus.MEDICAL_INFO:
      return '/registration/data-consent';
    case RegistrationStatus.CONSENT:
      return '/registration/system-permissions';
    case RegistrationStatus.PERMISSIONS:
      return '/registration/security-setup';
    case RegistrationStatus.SECURITY:
      return '/otp-verification';
    case RegistrationStatus.COMPLETE:
      return '/(app)';
    default:
      return '/language';
  }
};
