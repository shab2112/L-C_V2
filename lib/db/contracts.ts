import { supabase } from '../supabase';
import { Database } from '../database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export const contractsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByStatus(status: Contract['status']) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .eq('created_by', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getExpiring(daysFromNow: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);

    const { data, error } = await supabase
      .from('contracts')
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .eq('status', 'Signed')
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(contract: ContractInsert) {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ContractUpdate) {
    const { data, error } = await supabase
      .from('contracts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, creator:users!contracts_created_by_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
