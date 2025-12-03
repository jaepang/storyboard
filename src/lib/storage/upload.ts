import { PDFDocument } from 'pdf-lib';
import { createClient } from '@/lib/supabase/client';

/**
 * Supabase Storage 업로드 유틸리티
 *
 * 악보 파일(PDF)을 Supabase Storage에 업로드하고 검증합니다.
 *
 * 제약사항:
 * - 최대 파일 크기: 10MB (FR-011)
 * - 최대 페이지 수: 20페이지 (FR-011)
 * - 파일 형식: PDF만 허용
 */

export interface UploadValidationError {
  type: 'FILE_TOO_LARGE' | 'TOO_MANY_PAGES' | 'INVALID_FILE_TYPE' | 'CORRUPTED_PDF';
  message: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  pageCount?: number;
  error?: UploadValidationError;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PAGE_COUNT = 20;
const ALLOWED_FILE_TYPE = 'application/pdf';
const PDF_MAGIC_NUMBER = [0x25, 0x50, 0x44, 0x46]; // %PDF

/**
 * 파일의 매직 넘버를 검증합니다.
 *
 * PDF 파일은 반드시 "%PDF" (0x25 0x50 0x44 0x46)로 시작해야 합니다.
 * 이를 통해 파일 확장자만 변경한 악의적인 파일을 차단할 수 있습니다.
 */
async function validatePdfMagicNumber(file: File): Promise<boolean> {
  try {
    // 파일의 첫 4바이트 읽기
    const arrayBuffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Magic Number 비교
    for (let i = 0; i < PDF_MAGIC_NUMBER.length; i++) {
      if (bytes[i] !== PDF_MAGIC_NUMBER[i]) {
        return false;
      }
    }

    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * PDF 파일의 페이지 수를 추출합니다.
 */
async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (_error) {
    throw new Error('PDF 파일이 손상되었거나 읽을 수 없습니다.');
  }
}

/**
 * 업로드 전 파일을 검증합니다.
 *
 * @param file - 검증할 파일
 * @returns 검증 결과 또는 에러
 */
export async function validateSheetMusicFile(
  file: File
): Promise<{ valid: true; pageCount: number } | { valid: false; error: UploadValidationError }> {
  // 파일 타입 검증 (MIME type)
  if (file.type !== ALLOWED_FILE_TYPE) {
    return {
      valid: false,
      error: {
        type: 'INVALID_FILE_TYPE',
        message: 'PDF 파일만 업로드할 수 있습니다.',
      },
    };
  }

  // Magic Number 검증 (파일 헤더)
  const isValidPdf = await validatePdfMagicNumber(file);
  if (!isValidPdf) {
    return {
      valid: false,
      error: {
        type: 'INVALID_FILE_TYPE',
        message: '올바른 PDF 파일이 아닙니다. 파일 형식을 확인하세요.',
      },
    };
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        type: 'FILE_TOO_LARGE',
        message: `파일 크기는 최대 ${MAX_FILE_SIZE / (1024 * 1024)}MB까지 허용됩니다.`,
      },
    };
  }

  // PDF 페이지 수 검증
  try {
    const pageCount = await getPdfPageCount(file);

    if (pageCount > MAX_PAGE_COUNT) {
      return {
        valid: false,
        error: {
          type: 'TOO_MANY_PAGES',
          message: `PDF 페이지 수는 최대 ${MAX_PAGE_COUNT}페이지까지 허용됩니다.`,
        },
      };
    }

    return { valid: true, pageCount };
  } catch (_error) {
    return {
      valid: false,
      error: {
        type: 'CORRUPTED_PDF',
        message: 'PDF 파일이 손상되었거나 읽을 수 없습니다.',
      },
    };
  }
}

/**
 * 악보 파일을 Supabase Storage에 업로드합니다.
 *
 * @param file - 업로드할 PDF 파일
 * @param userId - 사용자 ID
 * @param songId - 곡 ID
 * @returns 업로드 결과 (URL, 경로, 페이지 수)
 */
export async function uploadSheetMusic(
  file: File,
  userId: string,
  songId: string
): Promise<UploadResult> {
  // 파일 검증
  const validation = await validateSheetMusicFile(file);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const { pageCount } = validation;

  try {
    const supabase = createClient();

    // 파일명 생성: {userId}/{songId}/{timestamp}.pdf
    const timestamp = Date.now();
    const filePath = `${userId}/${songId}/${timestamp}.pdf`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage.from('sheet-music').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: ALLOWED_FILE_TYPE,
    });

    if (error) {
      throw error;
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from('sheet-music').getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      pageCount,
    };
  } catch (error) {
    console.error('Sheet music upload error:', error);
    return {
      success: false,
      error: {
        type: 'INVALID_FILE_TYPE',
        message: error instanceof Error ? error.message : '파일 업로드에 실패했습니다.',
      },
    };
  }
}

/**
 * 기존 악보 파일을 삭제합니다.
 *
 * @param filePath - 삭제할 파일 경로
 * @returns 삭제 성공 여부
 */
export async function deleteSheetMusic(filePath: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage.from('sheet-music').remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Sheet music deletion error:', error);
    return false;
  }
}
