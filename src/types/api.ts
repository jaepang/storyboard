/**
 * API 요청/응답 타입 정의
 */

import type { AnnotationData } from './annotation';
import type { Conti, ContiListItem, ContiWithSongs } from './conti';
import type { ContiSong } from './song';

// 공통 API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// API 에러 응답 타입
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// 콘티 목록 조회 응답
export interface GetContisResponse {
  contis: ContiListItem[];
  total: number;
  limit: number;
  offset: number;
}

// 콘티 상세 조회 응답
export type GetContiResponse = ContiWithSongs;

// 콘티 생성 응답
export type CreateContiResponse = Conti;

// 콘티 수정 응답
export type UpdateContiResponse = Conti;

// 곡 추가 응답
export type CreateSongResponse = ContiSong;

// 곡 수정 응답
export type UpdateSongResponse = Partial<ContiSong> & {
  id: string;
  version: number;
  updated_at: string;
};

// 주석 저장 응답
export interface SaveAnnotationsResponse {
  annotations: AnnotationData;
  version: number;
}

// 주석 조회 응답
export interface GetAnnotationsResponse {
  annotations: AnnotationData;
  version: number;
}

// 파일 업로드 응답
export interface UploadSheetMusicResponse {
  url: string;
  pages: number;
  file_size: number;
}

// 에러 코드 타입
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INVALID_FILE'
  | 'PDF_GENERATION_FAILED'
  | 'INTERNAL_ERROR';
