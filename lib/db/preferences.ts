import { supabase } from '../supabaseClient';

export interface ClientPreference {
  id: string;
  user_id: string;
  project_interested_in?: string;
  budget?: string;
  communities_interested_in?: string;
  work_location?: string;
  max_bedrooms?: string;
  max_bathrooms?: string;
  property_type?: string;
  project_type?: string;
  age?: string;
  salary?: string;
  is_first_property?: string;
  purpose?: string;
  downpayment_ready?: string;
  is_married?: string;
  children_count?: string;
  specific_requirements?: string;
  handover_consideration?: string;
  needs_mortgage_agent?: string;
  needs_golden_visa?: string;
  created_at?: string;
  updated_at?: string;
}

export const clientPreferencesService = {
  async getByUserId(userId: string): Promise<ClientPreference | null> {
    const { data, error } = await supabase
      .from('client_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(preference: Omit<ClientPreference, 'id' | 'created_at' | 'updated_at'>): Promise<ClientPreference> {
    const { data, error } = await supabase
      .from('client_preferences')
      .insert(preference)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: Partial<ClientPreference>): Promise<ClientPreference> {
    const { data, error } = await supabase
      .from('client_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsert(preference: Partial<ClientPreference> & { user_id: string }): Promise<ClientPreference> {
    const { data, error } = await supabase
      .from('client_preferences')
      .upsert(preference, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId: string): Promise<void> {
    const { error } = await supabase
      .from('client_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
};
