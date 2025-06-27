import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          wallet_address: string | null;
          role: string;
          issues_reported: number;
          issues_resolved: number;
          reputation_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          wallet_address?: string | null;
          role?: string;
          issues_reported?: number;
          issues_resolved?: number;
          reputation_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          wallet_address?: string | null;
          role?: string;
          issues_reported?: number;
          issues_resolved?: number;
          reputation_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      issues: {
        Row: {
          id: string;
          title: string;
          description: string;
          latitude: number;
          longitude: number;
          address: string;
          image_url: string | null;
          status: string;
          priority: string;
          category: string;
          reporter_id: string;
          votes_up: number;
          votes_down: number;
          transaction_hash: string | null;
          ipfs_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          latitude: number;
          longitude: number;
          address: string;
          image_url?: string | null;
          status?: string;
          priority?: string;
          category: string;
          reporter_id: string;
          votes_up?: number;
          votes_down?: number;
          transaction_hash?: string | null;
          ipfs_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          latitude?: number;
          longitude?: number;
          address?: string;
          image_url?: string | null;
          status?: string;
          priority?: string;
          category?: string;
          reporter_id?: string;
          votes_up?: number;
          votes_down?: number;
          transaction_hash?: string | null;
          ipfs_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};