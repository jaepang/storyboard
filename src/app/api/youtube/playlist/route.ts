import { type NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createValidationErrorResponse } from '@/lib/utils/error';
import { getPlaylistVideoCount } from '@/lib/utils/youtube';
import type { ApiResponse } from '@/types/api';

/**
 * POST /api/youtube/playlist
 *
 * 유튜브 재생목록 URL을 받아 영상 개수를 추출하고 초기 곡 목록을 생성합니다.
 *
 * Request Body:
 * {
 *   "url": "https://www.youtube.com/playlist?list=PLxxxxxx"
 * }
 *
 * Response:
 * {
 *   "videoCount": 10,
 *   "songs": [
 *     { "title": "", "bpm": [], "songForms": [] },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    // URL 유효성 검증
    if (!url || typeof url !== 'string') {
      return createValidationErrorResponse('유튜브 재생목록 URL이 필요합니다.');
    }

    // 환경 변수에서 YouTube API 키 가져오기
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return createErrorResponse(
        'INTERNAL_ERROR',
        'YouTube API 키가 설정되지 않았습니다. 관리자에게 문의하세요.',
        undefined,
        500
      );
    }

    // 재생목록 영상 개수 추출
    let videoCount: number;
    try {
      videoCount = await getPlaylistVideoCount(url, apiKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return createValidationErrorResponse(
        `재생목록 정보를 가져오는데 실패했습니다: ${errorMessage}`
      );
    }

    // 초기 곡 목록 생성 (빈 곡 객체 배열)
    const songs = Array.from({ length: videoCount }, () => ({
      title: '',
      bpm: [],
      songForms: [],
    }));

    return NextResponse.json<ApiResponse<{ videoCount: number; songs: unknown[] }>>(
      {
        data: {
          videoCount,
          songs,
        },
        message: `${videoCount}개의 곡이 생성될 예정입니다.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('YouTube playlist API error:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      '재생목록 처리 중 오류가 발생했습니다.',
      undefined,
      500
    );
  }
}
