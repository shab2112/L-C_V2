import { supabase } from '../supabase';
import { Database } from '../database.types';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert'];
type ChatSessionUpdate = Database['public']['Tables']['chat_sessions']['Update'];

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export const chatSessionsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByMode(userId: string, mode: ChatSession['mode']) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('mode', mode)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(session: ChatSessionInsert) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ChatSessionUpdate) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const chatMessagesService = {
  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(message: ChatMessageInsert) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBySession(sessionId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
  }
};
