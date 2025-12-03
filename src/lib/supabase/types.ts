/**
 * Supabase 타입 유틸리티
 * SSR 패키지의 타입 추론 이슈를 해결하기 위한 헬퍼 타입
 */

import type { Database } from '@/types/database';

/**
 * 테이블별 타입 정의
 */
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

/**
 * Insert 타입 추출
 */
export type InsertData<T extends TableName> = Tables[T]['Insert'];

/**
 * Update 타입 추출
 */
export type UpdateData<T extends TableName> = Tables[T]['Update'];

/**
 * Row 타입 추출
 */
export type RowData<T extends TableName> = Tables[T]['Row'];

/**
 * 타입 단언 헬퍼 - Insert
 * @example
 * const data = asInsert('contis', { title: 'foo', worship_date: '2025-01-01' });
 */
export function asInsert<T extends TableName>(_table: T, data: InsertData<T>): InsertData<T> {
  return data;
}

/**
 * 타입 단언 헬퍼 - Update
 * @example
 * const data = asUpdate('contis', { title: 'foo' });
 */
export function asUpdate<T extends TableName>(_table: T, data: UpdateData<T>): UpdateData<T> {
  return data;
}
