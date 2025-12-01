/**
 * Supabase Database 타입 정의
 * Supabase CLI로 생성: pnpm supabase gen types typescript --project-id [PROJECT_ID]
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string;
          title: string;
          composer: string | null;
          lyricist: string | null;
          original_key: string | null;
          genre: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          composer?: string | null;
          lyricist?: string | null;
          original_key?: string | null;
          genre?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          composer?: string | null;
          lyricist?: string | null;
          original_key?: string | null;
          genre?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contis: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          worship_date: string;
          notes: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          worship_date: string;
          notes?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          worship_date?: string;
          notes?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      conti_songs: {
        Row: {
          id: string;
          conti_id: string;
          song_id: string | null;
          title: string;
          composer: string | null;
          lyricist: string | null;
          key_signature: string | null;
          bpm_array: number[];
          time_signature: string;
          sheet_music_url: string | null;
          sheet_music_pages: number;
          annotations: Json;
          order_index: number;
          notes: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conti_id: string;
          song_id?: string | null;
          title: string;
          composer?: string | null;
          lyricist?: string | null;
          key_signature?: string | null;
          bpm_array?: number[];
          time_signature?: string;
          sheet_music_url?: string | null;
          sheet_music_pages?: number;
          annotations?: Json;
          order_index?: number;
          notes?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conti_id?: string;
          song_id?: string | null;
          title?: string;
          composer?: string | null;
          lyricist?: string | null;
          key_signature?: string | null;
          bpm_array?: number[];
          time_signature?: string;
          sheet_music_url?: string | null;
          sheet_music_pages?: number;
          annotations?: Json;
          order_index?: number;
          notes?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
