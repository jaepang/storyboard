import { createClient } from '@/lib/supabase/client';

/**
 * Supabase Storage 다운로드 유틸리티
 *
 * 악보 파일(PDF)을 Supabase Storage에서 다운로드합니다.
 */

export interface DownloadResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

/**
 * 악보 파일을 Supabase Storage에서 다운로드합니다.
 *
 * @param filePath - 다운로드할 파일 경로
 * @returns 다운로드 결과 (Blob)
 */
export async function downloadSheetMusic(filePath: string): Promise<DownloadResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage.from('sheet-music').download(filePath);

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    return {
      success: true,
      blob: data,
    };
  } catch (error) {
    console.error('Sheet music download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '파일 다운로드에 실패했습니다.',
    };
  }
}

/**
 * 악보 파일의 Public URL을 가져옵니다.
 *
 * @param filePath - 파일 경로
 * @returns Public URL
 */
export function getSheetMusicUrl(filePath: string): string {
  const supabase = createClient();

  const {
    data: { publicUrl },
  } = supabase.storage.from('sheet-music').getPublicUrl(filePath);

  return publicUrl;
}

/**
 * 악보 파일이 존재하는지 확인합니다.
 *
 * @param filePath - 확인할 파일 경로
 * @returns 파일 존재 여부
 */
export async function checkSheetMusicExists(filePath: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage.from('sheet-music').list(filePath, {
      limit: 1,
    });

    if (error) {
      throw error;
    }

    return data.length > 0;
  } catch (error) {
    console.error('Sheet music existence check error:', error);
    return false;
  }
}

/**
 * 사용자의 모든 악보 파일을 조회합니다.
 *
 * @param userId - 사용자 ID
 * @returns 파일 목록
 */
export async function listUserSheetMusic(userId: string): Promise<string[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage.from('sheet-music').list(userId);

    if (error) {
      throw error;
    }

    return data.map((file) => `${userId}/${file.name}`);
  } catch (error) {
    console.error('Sheet music list error:', error);
    return [];
  }
}
