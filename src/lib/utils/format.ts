/**
 * 포맷팅 유틸리티
 */

/**
 * BPM 배열을 화살표로 연결된 문자열로 포맷
 * 예: [120, 140, 100] → "120 → 140 → 100"
 */
export function formatBpmArray(bpmArray: number[]): string {
  if (!bpmArray || bpmArray.length === 0) {
    return '';
  }
  return bpmArray.join(' → ');
}

/**
 * ISO 8601 날짜 문자열을 한국어 형식으로 포맷
 * 예: "2025-01-05" → "2025년 1월 5일"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * ISO 8601 타임스탬프를 한국어 형식으로 포맷
 * 예: "2025-12-01T10:00:00Z" → "2025년 12월 1일 10:00"
 */
export function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 포맷
 * 예: 2048576 → "2.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
