export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'Owner' | 'Admin' | 'Property Advisor' | 'Client'
          avatar: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'Owner' | 'Admin' | 'Property Advisor' | 'Client'
          avatar?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'Owner' | 'Admin' | 'Property Advisor' | 'Client'
          avatar?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string | null
          property_advisor_id: string | null
          card_drive_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          property_advisor_id?: string | null
          card_drive_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          property_advisor_id?: string | null
          card_drive_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          client_id: string | null
          title: string
          address: string
          price: number
          bedrooms: number
          bathrooms: number
          sqft: number
          property_type: 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse'
          status: 'For Sale' | 'For Rent' | 'Sold'
          image_url: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          title: string
          address: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          sqft?: number
          property_type?: 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse'
          status?: 'For Sale' | 'For Rent' | 'Sold'
          image_url?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          title?: string
          address?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          sqft?: number
          property_type?: 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse'
          status?: 'For Sale' | 'For Rent' | 'Sold'
          image_url?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          type: 'Agency Agreement' | 'Seller-to-Agent Agreement' | 'Buyer-to-Agent Agreement' | 'Agent-to-Agent Referral'
          party_name: string
          start_date: string
          expiry_date: string
          status: 'Draft' | 'Signed' | 'Expired'
          document_url: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'Agency Agreement' | 'Seller-to-Agent Agreement' | 'Buyer-to-Agent Agreement' | 'Agent-to-Agent Referral'
          party_name: string
          start_date: string
          expiry_date: string
          status?: 'Draft' | 'Signed' | 'Expired'
          document_url?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'Agency Agreement' | 'Seller-to-Agent Agreement' | 'Buyer-to-Agent Agreement' | 'Agent-to-Agent Referral'
          party_name?: string
          start_date?: string
          expiry_date?: string
          status?: 'Draft' | 'Signed' | 'Expired'
          document_url?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drive_projects: {
        Row: {
          id: string
          name: string
          developer: string
          drive_folder_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          developer: string
          drive_folder_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          developer?: string
          drive_folder_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      drive_assets: {
        Row: {
          id: string
          project_id: string | null
          name: string
          type: 'image' | 'video' | 'brochure' | 'factsheet'
          url: string
          content: string
          drive_file_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          type: 'image' | 'video' | 'brochure' | 'factsheet'
          url: string
          content?: string
          drive_file_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          type?: 'image' | 'video' | 'brochure' | 'factsheet'
          url?: string
          content?: string
          drive_file_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      content_posts: {
        Row: {
          id: string
          project_id: string | null
          platform: 'Facebook' | 'LinkedIn' | 'Instagram' | 'YouTube' | 'Twitter'
          post_type: 'Image' | 'Video' | 'Text'
          status: 'Draft' | 'Pending Approval' | 'Approved' | 'Published'
          scheduled_date: string
          created_by: string | null
          approved_by: string | null
          post_text: string
          image_url: string
          video_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          platform: 'Facebook' | 'LinkedIn' | 'Instagram' | 'YouTube' | 'Twitter'
          post_type: 'Image' | 'Video' | 'Text'
          status?: 'Draft' | 'Pending Approval' | 'Approved' | 'Published'
          scheduled_date: string
          created_by?: string | null
          approved_by?: string | null
          post_text?: string
          image_url?: string
          video_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          platform?: 'Facebook' | 'LinkedIn' | 'Instagram' | 'YouTube' | 'Twitter'
          post_type?: 'Image' | 'Video' | 'Text'
          status?: 'Draft' | 'Pending Approval' | 'Approved' | 'Published'
          scheduled_date?: string
          created_by?: string | null
          approved_by?: string | null
          post_text?: string
          image_url?: string
          video_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      vault_documents: {
        Row: {
          id: string
          client_id: string | null
          name: string
          type: 'Passport' | 'KYC' | 'SPA' | 'Title Deed' | 'Other'
          url: string
          upload_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          name: string
          type: 'Passport' | 'KYC' | 'SPA' | 'Title Deed' | 'Other'
          url: string
          upload_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          name?: string
          type?: 'Passport' | 'KYC' | 'SPA' | 'Title Deed' | 'Other'
          url?: string
          upload_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          title: string
          mode: 'staff' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          mode?: 'staff' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          mode?: 'staff' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string | null
          role: string
          content: string
          sources: Json
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          role: string
          content: string
          sources?: Json
          action?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          role?: string
          content?: string
          sources?: Json
          action?: string
          created_at?: string
        }
      }
      master_prompts: {
        Row: {
          id: string
          category: string
          title: string
          content: string
          created_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          title: string
          content: string
          created_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          title?: string
          content?: string
          created_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'Owner' | 'Admin' | 'Property Advisor' | 'Client'
      contract_type: 'Agency Agreement' | 'Seller-to-Agent Agreement' | 'Buyer-to-Agent Agreement' | 'Agent-to-Agent Referral'
      contract_status: 'Draft' | 'Signed' | 'Expired'
      listing_status: 'For Sale' | 'For Rent' | 'Sold'
      property_type: 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse'
      asset_type: 'image' | 'video' | 'brochure' | 'factsheet'
      social_platform: 'Facebook' | 'LinkedIn' | 'Instagram' | 'YouTube' | 'Twitter'
      post_type: 'Image' | 'Video' | 'Text'
      post_status: 'Draft' | 'Pending Approval' | 'Approved' | 'Published'
      document_type: 'Passport' | 'KYC' | 'SPA' | 'Title Deed' | 'Other'
      chat_mode: 'staff' | 'client'
    }
  }
}
