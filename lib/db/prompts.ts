import { supabase } from '../supabase';
import { Database } from '../database.types';

type MasterPrompt = Database['public']['Tables']['master_prompts']['Row'];
type MasterPromptInsert = Database['public']['Tables']['master_prompts']['Insert'];
type MasterPromptUpdate = Database['public']['Tables']['master_prompts']['Update'];

export const masterPromptsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('master_prompts')
      .select('*, creator:users!master_prompts_created_by_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getActive() {
    const { data, error } = await supabase
      .from('master_prompts')
      .select('*, creator:users!master_prompts_created_by_fkey(*)')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('master_prompts')
      .select('*, creator:users!master_prompts_created_by_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('master_prompts')
      .select('*, creator:users!master_prompts_created_by_fkey(*)')
      .eq('category', category)
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(prompt: MasterPromptInsert) {
    const { data, error } = await supabase
      .from('master_prompts')
      .insert(prompt)
      .select('*, creator:users!master_prompts_created_by_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: MasterPromptUpdate) {
    const { data, error } = await supabase
      .from('master_prompts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, creator:users!master_prompts_created_by_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('master_prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
