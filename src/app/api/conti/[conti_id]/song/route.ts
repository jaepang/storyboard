import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import { validateBpmArray, validateTitle } from '@/lib/utils/validation';
import type { ApiResponse } from '@/types/api';
import type { CreateSongRequest } from '@/types/song';

/**
 * POST /api/conti/[conti_id]/song - 새 곡 추가
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conti_id: string }> }
) {
  try {
    const { conti_id } = await params;
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
      .eq('id', conti_id)
      .eq('user_id', user.id)
      .single();

    if (contiError || !conti) {
      return createNotFoundResponse('콘티');
    }

    // 요청 본문 파싱
    const body = (await request.json()) as CreateSongRequest;

    // 유효성 검증
    const titleValidation = validateTitle(body.title);
    if (!titleValidation.valid) {
      return createValidationErrorResponse(titleValidation.error || '제목이 유효하지 않습니다.');
    }

    const bpmValidation = validateBpmArray(body.bpm_array);
    if (!bpmValidation.valid) {
      return createValidationErrorResponse(bpmValidation.error || 'BPM 배열이 유효하지 않습니다.');
    }

    // 현재 최대 order_index 조회
    const { data: maxOrderData } = await supabase
      .from('conti_songs')
      .select('order_index')
      .eq('conti_id', conti_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrderIndex = (maxOrderData?.order_index ?? -1) + 1;

    // 먼저 songs 테이블에 곡 추가
    // @ts-expect-error - Supabase types work correctly at runtime
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        title: body.title,
        composer: body.composer || null,
        lyricist: body.lyricist || null,
      })
      .select()
      .single();

    if (songError || !song) {
      return createErrorResponse('DATABASE_ERROR', '곡 생성에 실패했습니다.', {
        error: songError,
      });
    }

    // conti_songs에 연결
    // @ts-expect-error - Supabase types work correctly at runtime
    const { data: contiSong, error: contiSongError } = await supabase
      .from('conti_songs')
      .insert({
        conti_id,
        song_id: (song as { id: string }).id,
        title: body.title,
        composer: body.composer || null,
        lyricist: body.lyricist || null,
        key_signature: body.key_signature || null,
        bpm_array: body.bpm_array,
        time_signature: body.time_signature || '4/4',
        sheet_music_url: null,
        sheet_music_pages: 1,
        annotations: { annotations: [] },
        order_index: nextOrderIndex,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (contiSongError) {
      // conti_song 생성 실패 시 song도 롤백
      await supabase
        .from('songs')
        .delete()
        .eq('id', (song as { id: string }).id);
      return createErrorResponse('DATABASE_ERROR', '콘티에 곡 추가에 실패했습니다.', {
        error: contiSongError,
      });
    }

    return NextResponse.json<ApiResponse<typeof contiSong>>(
      {
        data: contiSong,
        message: '곡이 추가되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
