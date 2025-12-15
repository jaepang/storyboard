/**
 * 유효성 검증 유틸리티
 */

/**
 * 제목 유효성 검증 (1자 이상)
 */
export function validateTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: '제목은 1자 이상이어야 합니다.' };
  }
  return { valid: true };
}

/**
 * 날짜 형식 유효성 검증 (YYYY-MM-DD)
 */
export function validateDate(date: string): { valid: boolean; error?: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { valid: false, error: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' };
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return { valid: false, error: '유효하지 않은 날짜입니다.' };
  }

  return { valid: true };
}

/**
 * BPM 배열 유효성 검증 (모두 양수)
 */
export function validateBpmArray(bpmArray: number[]): { valid: boolean; error?: string } {
  if (!Array.isArray(bpmArray)) {
    return { valid: false, error: 'BPM 배열이 올바르지 않습니다.' };
  }

  if (bpmArray.some((bpm) => typeof bpm !== 'number' || bpm <= 0)) {
    return { valid: false, error: 'BPM 값은 양수여야 합니다.' };
  }

  return { valid: true };
}

/**
 * 버전 번호 유효성 검증
 */
export function validateVersion(version: unknown): { valid: boolean; error?: string } {
  if (typeof version !== 'number' || version < 1) {
    return { valid: false, error: '버전은 1 이상의 정수여야 합니다.' };
  }
  return { valid: true };
}

/**
 * 파일 크기 유효성 검증 (최대 10MB)
 */
export function validateFileSize(size: number): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (size > maxSize) {
    return {
      valid: false,
      error: `파일 크기는 최대 ${maxSize / 1024 / 1024}MB까지 허용됩니다.`,
    };
  }
  return { valid: true };
}

/**
 * PDF 페이지 수 유효성 검증 (최대 20페이지)
 */
export function validatePageCount(pages: number): { valid: boolean; error?: string } {
  if (pages < 1 || pages > 20) {
    return { valid: false, error: '악보는 1~20페이지까지 허용됩니다.' };
  }
  return { valid: true };
}
