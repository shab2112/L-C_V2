import { supabase } from '../supabase';
import { Database } from '../database.types';

type DriveProject = Database['public']['Tables']['drive_projects']['Row'];
type DriveProjectInsert = Database['public']['Tables']['drive_projects']['Insert'];
type DriveProjectUpdate = Database['public']['Tables']['drive_projects']['Update'];

type DriveAsset = Database['public']['Tables']['drive_assets']['Row'];
type DriveAssetInsert = Database['public']['Tables']['drive_assets']['Insert'];
type DriveAssetUpdate = Database['public']['Tables']['drive_assets']['Update'];

type ContentPost = Database['public']['Tables']['content_posts']['Row'];
type ContentPostInsert = Database['public']['Tables']['content_posts']['Insert'];
type ContentPostUpdate = Database['public']['Tables']['content_posts']['Update'];

export const driveProjectsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('drive_projects')
      .select('*, assets:drive_assets(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('drive_projects')
      .select('*, assets:drive_assets(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(project: DriveProjectInsert) {
    const { data, error } = await supabase
      .from('drive_projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: DriveProjectUpdate) {
    const { data, error } = await supabase
      .from('drive_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('drive_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const driveAssetsService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('drive_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('drive_assets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(asset: DriveAssetInsert) {
    const { data, error } = await supabase
      .from('drive_assets')
      .insert(asset)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: DriveAssetUpdate) {
    const { data, error } = await supabase
      .from('drive_assets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('drive_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const contentPostsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .eq('project_id', projectId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByStatus(status: ContentPost['status']) {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .eq('status', status)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getScheduled(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(post: ContentPostInsert) {
    const { data, error } = await supabase
      .from('content_posts')
      .insert(post)
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ContentPostUpdate) {
    const { data, error } = await supabase
      .from('content_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, project:drive_projects(*), creator:users!content_posts_created_by_fkey(*), approver:users!content_posts_approved_by_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('content_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
