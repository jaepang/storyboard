/**
 * 콘티 관련 타입 정의
 */

import type { ContiSong } from './song';

export interface Conti {
  id: string;
  user_id: string;
  title: string;
  worship_date: string; // ISO 8601 날짜
  notes: string | null;
  version: number;
  created_at: string; // ISO 8601 타임스탬프
  updated_at: string;
}

export interface ContiWithSongs extends Conti {
  songs: ContiSong[];
}

export interface ContiListItem extends Conti {
  song_count: number;
}

// 콘티 생성 요청
export interface CreateContiRequest {
  title: string;
  worship_date: string;
  notes?: string;
}

// 콘티 수정 요청
export interface UpdateContiRequest {
  title?: string;
  worship_date?: string;
  notes?: string;
  version: number;
}

// 콘티 목록 조회 파라미터
export interface GetContisParams {
  limit?: number;
  offset?: number;
  sort?: 'worship_date_desc' | 'worship_date_asc' | 'created_at_desc' | 'title_asc';
  search?: string;
  date_from?: string;
  date_to?: string;
}
