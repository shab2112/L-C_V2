import { supabase } from '../supabase';
import { Database } from '../database.types';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export const listingsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, client:clients(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, client:clients(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByStatus(status: Listing['status']) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, client:clients(*)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async search(filters: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: Listing['property_type'];
    status?: Listing['status'];
  }) {
    let query = supabase
      .from('listings')
      .select('*, client:clients(*)');

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.bedrooms) {
      query = query.eq('bedrooms', filters.bedrooms);
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(listing: ListingInsert) {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ListingUpdate) {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
