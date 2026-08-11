import { supabase } from '../supabaseClient';

export interface UserFavorite {
  id: string;
  user_id: string;
  name: string;
  community?: string;
  image_url?: string;
  features?: string[];
  notes?: string;
  project_specs?: any;
  starting_price?: number;
  project_type?: string;
  property_type?: string;
  service_charge?: number;
  created_at?: string;
  updated_at?: string;
}

export const favoritesService = {
  async getAllByUserId(userId: string): Promise<UserFavorite[]> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(favorite: Omit<UserFavorite, 'id' | 'created_at' | 'updated_at'>): Promise<UserFavorite> {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert(favorite)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<UserFavorite>): Promise<UserFavorite> {
    const { data, error } = await supabase
      .from('user_favorites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async upsert(favorite: Partial<UserFavorite> & { user_id: string; name: string }): Promise<UserFavorite> {
    const { data, error } = await supabase
      .from('user_favorites')
      .upsert(favorite, { onConflict: 'user_id,name' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const chatHistoryService = {
  async getSessionHistory(userId: string, sessionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('map_chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAllUserSessions(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('map_chat_history')
      .select('session_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get unique session IDs
    const uniqueSessions = [...new Set(data?.map(d => d.session_id) || [])];
    return uniqueSessions;
  },

  async saveMessage(message: {
    user_id: string;
    session_id: string;
    role: 'user' | 'agent' | 'system';
    text: string;
    is_final: boolean;
    metadata?: any;
  }): Promise<void> {
    const { error } = await supabase
      .from('map_chat_history')
      .insert(message);

    if (error) throw error;
  },

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('map_chat_history')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId);

    if (error) throw error;
  }
};
