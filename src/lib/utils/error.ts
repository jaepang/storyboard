/**
 * 에러 핸들링 유틸리티
 */

import { NextResponse } from 'next/server';
import type { ApiError, ErrorCode } from '@/types/api';
import * as logger from './logger';

/**
 * API 에러 응답 생성
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  status: number = 500
): NextResponse<ApiError> {
  // 에러 로깅 (500번대 에러만)
  if (status >= 500) {
    logger.error(`API Error: ${code} - ${message}`, undefined, { code, details, status });
  }

  return NextResponse.json<ApiError>(
    {
      error: code,
      message,
      details,
    },
    { status }
  );
}

/**
 * 낙관적 잠금 충돌 에러 응답
 */
export function createConflictResponse(
  currentVersion: number,
  providedVersion: number
): NextResponse<ApiError> {
  return createErrorResponse(
    'CONFLICT',
    '다른 사용자가 이미 수정했습니다. 페이지를 새로고침하세요.',
    {
      current_version: currentVersion,
      provided_version: providedVersion,
    },
    409
  );
}

/**
 * 인증 실패 에러 응답
 */
export function createUnauthorizedResponse(): NextResponse<ApiError> {
  return createErrorResponse('UNAUTHORIZED', '인증이 필요합니다.', undefined, 401);
}

/**
 * 리소스 없음 에러 응답
 */
export function createNotFoundResponse(resource: string): NextResponse<ApiError> {
  return createErrorResponse('NOT_FOUND', `${resource}을(를) 찾을 수 없습니다.`, undefined, 404);
}

/**
 * 유효성 검증 실패 에러 응답
 */
export function createValidationErrorResponse(
  message: string,
  details?: Record<string, unknown>
): NextResponse<ApiError> {
  return createErrorResponse('VALIDATION_ERROR', message, details, 400);
}
