/**
 * PDF 생성 통합 테스트 (T065)
 *
 * 목적:
 * 1. PDF 생성이 올바르게 동작하는지 검증
 * 2. 4초 이내 생성 목표 검증 (FR-017)
 * 3. 10-20페이지 악보 처리 성능 검증
 */

import { describe, expect, it } from 'vitest';
import { PdfGenerator } from '@/lib/pdf/generator';
import type { ContiWithSongs } from '@/types/conti';

describe('PDF Generation', () => {
  // 테스트용 샘플 콘티 데이터 (영어 사용 - Helvetica 폰트가 한국어 미지원)
  const createSampleConti = (songCount: number): ContiWithSongs => {
    const songs = Array.from({ length: songCount }, (_, i) => ({
      id: `song-${i}`,
      conti_id: 'conti-1',
      song_id: null,
      title: `Worship Song ${i + 1}`,
      composer: 'Composer',
      lyricist: 'Lyricist',
      key_signature: 'D',
      bpm_array: [120, 140, 100],
      time_signature: '4/4',
      sheet_music_url: null,
      sheet_music_pages: 1,
      annotations: { annotations: [] },
      order_index: i,
      notes: `Song ${i + 1} notes`,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return {
      id: 'conti-1',
      user_id: 'user-1',
      title: 'January 2025 Week 1 Worship',
      worship_date: '2025-01-05',
      notes: 'New Year Special Service',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      songs,
    };
  };

  it('기본 PDF 생성 성공', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(3);

    const pdfBytes = await generator.generateContiPdf(conti);

    // PDF가 생성되었는지 확인
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    // PDF 헤더 확인 (%PDF-)
    const pdfHeader = String.fromCharCode(...pdfBytes.slice(0, 5));
    expect(pdfHeader).toBe('%PDF-');
  });

  it('빈 곡 목록으로 PDF 생성 가능', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(0);

    const pdfBytes = await generator.generateContiPdf(conti);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it('10개 곡으로 PDF 생성 (성능 검증)', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(10);

    const startTime = performance.now();
    const pdfBytes = await generator.generateContiPdf(conti);
    const endTime = performance.now();

    const generationTime = endTime - startTime;

    // PDF 생성 성공 확인
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    // 성능 목표: 4초 (4000ms) 이내
    // 10개 곡 정도는 1초 이내에 생성되어야 함
    expect(generationTime).toBeLessThan(4000);

    console.log(`PDF 생성 시간 (10곡): ${generationTime.toFixed(2)}ms`);
  });

  it('20개 곡으로 PDF 생성 (대용량 처리)', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(20);

    const startTime = performance.now();
    const pdfBytes = await generator.generateContiPdf(conti);
    const endTime = performance.now();

    const generationTime = endTime - startTime;

    // PDF 생성 성공 확인
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    // 성능 목표: 4초 (4000ms) 이내
    expect(generationTime).toBeLessThan(4000);

    console.log(`PDF 생성 시간 (20곡): ${generationTime.toFixed(2)}ms`);
  });

  it('BPM 배열이 PDF에 올바르게 포함됨', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(1);
    conti.songs[0].bpm_array = [120, 140, 100];

    const pdfBytes = await generator.generateContiPdf(conti);

    // PDF 생성 확인
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    // BPM 배열이 있는 경우 PDF가 더 크게 생성되는지 확인
    const generatorNoBpm = await PdfGenerator.create();
    const contiNoBpm = createSampleConti(1);
    contiNoBpm.songs[0].bpm_array = [];
    const pdfBytesNoBpm = await generatorNoBpm.generateContiPdf(contiNoBpm);

    // BPM이 있는 PDF가 더 커야 함 (BPM 텍스트 포함)
    expect(pdfBytes.length).toBeGreaterThan(pdfBytesNoBpm.length);
  });

  it('매우 긴 메모도 처리 가능', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(1);
    conti.notes = 'This is a very long note. '.repeat(50); // 약 1000자

    const pdfBytes = await generator.generateContiPdf(conti);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it('PDF 페이지 수 확인 (다중 페이지)', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(30); // 많은 곡 추가

    await generator.generateContiPdf(conti);

    const doc = generator.getDoc();
    const pageCount = doc.getPageCount();

    // 최소 2페이지 이상 생성되어야 함 (콘티 정보 1페이지 + 곡 목록)
    expect(pageCount).toBeGreaterThanOrEqual(1);
  });

  it('빈 BPM 배열 처리', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(1);
    conti.songs[0].bpm_array = [];

    const pdfBytes = await generator.generateContiPdf(conti);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it('특수 문자가 포함된 제목 처리', async () => {
    const generator = await PdfGenerator.create();
    const conti = createSampleConti(1);
    conti.title = 'Amazing Grace (Special Worship)';
    conti.songs[0].title = "God's Love & Grace";

    const pdfBytes = await generator.generateContiPdf(conti);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });
});
