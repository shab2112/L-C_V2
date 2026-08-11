import { supabase } from '../supabase';
import { Database } from '../database.types';

type VaultDocument = Database['public']['Tables']['vault_documents']['Row'];
type VaultDocumentInsert = Database['public']['Tables']['vault_documents']['Insert'];
type VaultDocumentUpdate = Database['public']['Tables']['vault_documents']['Update'];

export const vaultService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vault_documents')
      .select('*, client:clients(*)')
      .order('upload_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('vault_documents')
      .select('*, client:clients(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('vault_documents')
      .select('*, client:clients(*)')
      .eq('client_id', clientId)
      .order('upload_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByType(clientId: string, type: VaultDocument['type']) {
    const { data, error } = await supabase
      .from('vault_documents')
      .select('*, client:clients(*)')
      .eq('client_id', clientId)
      .eq('type', type)
      .order('upload_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(document: VaultDocumentInsert) {
    const { data, error } = await supabase
      .from('vault_documents')
      .insert(document)
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: VaultDocumentUpdate) {
    const { data, error } = await supabase
      .from('vault_documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('vault_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
