import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import type { ApiResponse } from '@/types/api';
import type { ReorderSongsRequest } from '@/types/song';

/**
 * PUT /api/conti/[contiId]/song/reorder - 곡 순서 변경
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: contiId } = await params;
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return createUnauthorizedResponse();
    }

    // 콘티 존재 및 권한 확인
    const { data: conti, error: contiError } = await supabase
      .from('contis')
      .select('id')
      .eq('id', contiId)
      .eq('user_id', user.id)
      .single();

    if (contiError || !conti) {
      return createNotFoundResponse('콘티');
    }

    // 요청 본문 파싱
    const body = (await request.json()) as ReorderSongsRequest;

    if (!Array.isArray(body.song_ids) || body.song_ids.length === 0) {
      return createValidationErrorResponse('곡 ID 목록이 유효하지 않습니다.');
    }

    // 현재 콘티의 모든 곡 조회
    const { data: currentSongs, error: fetchError } = await supabase
      .from('conti_songs')
      .select('id')
      .eq('contiId', contiId);

    if (fetchError) {
      return createErrorResponse('DATABASE_ERROR', '곡 목록 조회에 실패했습니다.', {
        error: fetchError,
      });
    }

    const currentSongIds = new Set((currentSongs || []).map((s: { id: string }) => s.id));

    // 요청된 모든 곡이 현재 콘티에 속하는지 확인
    const allSongsValid = body.song_ids.every((id) => currentSongIds.has(id));
    if (!allSongsValid) {
      return createValidationErrorResponse('일부 곡이 현재 콘티에 속하지 않습니다.');
    }

    // 각 곡의 order_index 업데이트
    // @ts-expect-error - Supabase types work correctly at runtime
    const updatePromises = body.song_ids.map((songId, index) =>
      supabase
        .from('conti_songs')
        .update({ order_index: index })
        .eq('id', songId)
        .eq('contiId', contiId)
    );

    const results = await Promise.all(updatePromises);

    // 에러 확인
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      return createErrorResponse('DATABASE_ERROR', '곡 순서 변경에 실패했습니다.', {
        errors: errors.map((e) => e.error),
      });
    }

    // 업데이트된 곡 목록 조회
    const { data: updatedSongs, error: refetchError } = await supabase
      .from('conti_songs')
      .select('*')
      .eq('contiId', contiId)
      .order('order_index', { ascending: true });

    if (refetchError) {
      return createErrorResponse('DATABASE_ERROR', '업데이트된 곡 목록 조회에 실패했습니다.', {
        error: refetchError,
      });
    }

    return NextResponse.json<ApiResponse<typeof updatedSongs>>({
      data: updatedSongs || [],
      message: '곡 순서가 변경되었습니다.',
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
