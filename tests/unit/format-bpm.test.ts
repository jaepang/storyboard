/**
 * BPM 배열 포맷 단위 테스트 (T066)
 *
 * 목적: BPM 배열이 "120 → 140 → 100" 형태로 올바르게 포맷되는지 검증
 */

import { describe, expect, it } from 'vitest';
import { formatBpmArray } from '@/lib/utils/format';

describe('formatBpmArray', () => {
  it('단일 BPM 값을 문자열로 반환', () => {
    const result = formatBpmArray([120]);
    expect(result).toBe('120');
  });

  it('여러 BPM 값을 화살표로 연결', () => {
    const result = formatBpmArray([120, 140, 100]);
    expect(result).toBe('120 → 140 → 100');
  });

  it('두 개의 BPM 값을 화살표로 연결', () => {
    const result = formatBpmArray([80, 120]);
    expect(result).toBe('80 → 120');
  });

  it('빈 배열은 빈 문자열 반환', () => {
    const result = formatBpmArray([]);
    expect(result).toBe('');
  });

  it('null 또는 undefined는 빈 문자열 반환', () => {
    // biome-ignore lint/suspicious/noExplicitAny: 테스트 목적으로 null/undefined 케이스 검증
    expect(formatBpmArray(null as any)).toBe('');
    // biome-ignore lint/suspicious/noExplicitAny: 테스트 목적으로 null/undefined 케이스 검증
    expect(formatBpmArray(undefined as any)).toBe('');
  });

  it('4개 이상의 BPM 값도 올바르게 처리', () => {
    const result = formatBpmArray([60, 80, 100, 120, 140]);
    expect(result).toBe('60 → 80 → 100 → 120 → 140');
  });

  it('매우 느린 템포와 빠른 템포 처리', () => {
    const result = formatBpmArray([40, 200]);
    expect(result).toBe('40 → 200');
  });
});
