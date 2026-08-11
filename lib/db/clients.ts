import { supabase } from '../supabase';
import { Database } from '../database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export const clientsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*, user:users!clients_user_id_fkey(*), advisor:users!clients_property_advisor_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*, user:users!clients_user_id_fkey(*), advisor:users!clients_property_advisor_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByAdvisor(advisorId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*, user:users!clients_user_id_fkey(*), advisor:users!clients_property_advisor_id_fkey(*)')
      .eq('property_advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*, user:users!clients_user_id_fkey(*), advisor:users!clients_property_advisor_id_fkey(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(client: ClientInsert) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select('*, user:users!clients_user_id_fkey(*), advisor:users!clients_property_advisor_id_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ClientUpdate) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, user:users!clients_user_id_fkey(*), advisor:users!clients_property_advisor_id_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
