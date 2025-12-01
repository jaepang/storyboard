/**
 * 곡 관련 타입 정의
 */

import type { AnnotationData } from './annotation';

// 기본 곡 정보
export interface Song {
  id: string;
  title: string;
  composer: string | null;
  lyricist: string | null;
  original_key: string | null;
  genre: string | null;
  created_at: string;
  updated_at: string;
}

// 콘티별 곡 인스턴스
export interface ContiSong {
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
  annotations: AnnotationData;
  order_index: number;
  notes: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

// 새 곡 추가 요청
export interface CreateSongRequest {
  title: string;
  composer?: string;
  lyricist?: string;
  key_signature?: string;
  bpm_array?: number[];
  time_signature?: string;
  notes?: string;
  order_index?: number;
}

// 곡 정보 수정 요청
export interface UpdateSongRequest {
  title?: string;
  composer?: string;
  lyricist?: string;
  key_signature?: string;
  bpm_array?: number[];
  time_signature?: string;
  notes?: string;
  order_index?: number;
  version: number;
}

// 기존 곡 복사 요청
export interface CopySongRequest {
  song_id: string;
  order_index?: number;
}

// 곡 순서 변경 요청
export interface ReorderSongsRequest {
  song_orders: Array<{
    id: string;
    order_index: number;
  }>;
}
