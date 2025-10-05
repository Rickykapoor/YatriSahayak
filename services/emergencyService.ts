// services/emergencyService.ts
import { supabase } from '@/lib/supabase';

export interface EmergencyContactData {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  priorityOrder: number;
}

export const saveEmergencyContacts = async (
  userId: string, 
  contacts: EmergencyContactData[]
): Promise<boolean> => {
  try {
    // Development mode: Just return success
    if (__DEV__ && userId.includes('dummy')) {
      console.log('Development mode: Mock saving emergency contacts');
      return true;
    }

    // Start transaction by deactivating existing contacts
    const { error: deactivateError } = await supabase
      .from('emergency_contacts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (deactivateError) {
      throw deactivateError;
    }

    // Insert/update each contact
    for (const contact of contacts) {
      const contactData = {
        user_id: userId,
        name: contact.name.trim(),
        phone: contact.phone.replace(/\D/g, ''),
        relationship: contact.relationship || 'Other',
        is_primary: contact.isPrimary,
        priority_order: contact.priorityOrder,
        is_active: true,
      };

      if (contact.id && !contact.id.startsWith('temp-')) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from('emergency_contacts')
          .update({ ...contactData, updated_at: new Date().toISOString() })
          .eq('id', contact.id)
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new contact
        const { error: insertError } = await supabase
          .from('emergency_contacts')
          .insert(contactData);

        if (insertError) {
          throw insertError;
        }
      }
    }

    // Log the update
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'emergency_contacts_update',
        resource_type: 'emergency_contacts',
        metadata: { contact_count: contacts.length },
      });

    return true;
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
    throw error;
  }
};

export const loadEmergencyContacts = async (userId: string): Promise<EmergencyContactData[]> => {
  try {
    // Development mode: Return mock data
    if (__DEV__ && userId.includes('dummy')) {
      return [
        {
          id: 'mock-1',
          name: 'John Doe',
          phone: '9876543210',
          relationship: 'Father',
          isPrimary: true,
          priorityOrder: 1,
        },
        {
          id: 'mock-2',
          name: 'Jane Doe',
          phone: '9876543211',
          relationship: 'Mother',
          isPrimary: false,
          priorityOrder: 2,
        },
      ];
    }

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority_order', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || '',
      isPrimary: contact.is_primary,
      priorityOrder: contact.priority_order,
    }));
  } catch (error) {
    console.error('Error loading emergency contacts:', error);
    throw error;
  }
};
