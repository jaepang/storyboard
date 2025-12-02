import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import type { ApiResponse } from '@/types/api';
import type { CopySongRequest } from '@/types/song';

/**
 * POST /api/conti/[conti_id]/song/copy - 기존 곡 복사
 * 독립적 복사: song과 conti_song을 모두 새로 생성
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
    const body = (await request.json()) as CopySongRequest;

    if (!body.source_conti_song_id) {
      return createValidationErrorResponse('복사할 곡 ID가 필요합니다.');
    }

    // 원본 conti_song 조회
    const { data: sourceContiSong, error: sourceError } = await supabase
      .from('conti_songs')
      .select('*, songs(*)')
      .eq('id', body.source_conti_song_id)
      .single();

    if (sourceError || !sourceContiSong) {
      return createNotFoundResponse('복사할 곡');
    }

    // 원본 song 확인
    const sourceSong = Array.isArray((sourceContiSong as any).songs)
      ? (sourceContiSong as any).songs[0]
      : (sourceContiSong as any).songs;

    if (!sourceSong) {
      return createNotFoundResponse('복사할 곡 정보');
    }

    // 현재 최대 order_index 조회
    const { data: maxOrderData } = await supabase
      .from('conti_songs')
      .select('order_index')
      .eq('conti_id', conti_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrderIndex = ((maxOrderData as any)?.order_index ?? -1) + 1;

    // 1. 새로운 song 생성 (독립적 복사)
    // @ts-expect-error - Supabase types work correctly at runtime
    const { data: newSong, error: newSongError } = await supabase
      .from('songs')
      .insert({
        title: sourceSong.title,
        composer: sourceSong.composer,
        lyricist: sourceSong.lyricist,
        original_key: sourceSong.original_key,
        genre: sourceSong.genre,
      })
      .select()
      .single();

    if (newSongError || !newSong) {
      return createErrorResponse('DATABASE_ERROR', '곡 복사에 실패했습니다.', {
        error: newSongError,
      });
    }

    // 2. 새로운 conti_song 생성 (모든 정보 복사)
    // @ts-expect-error - Supabase types work correctly at runtime
    const { data: newContiSong, error: newContiSongError } = await supabase
      .from('conti_songs')
      .insert({
        conti_id,
        song_id: (newSong as any).id,
        title: (sourceContiSong as any).title,
        composer: (sourceContiSong as any).composer,
        lyricist: (sourceContiSong as any).lyricist,
        key_signature: (sourceContiSong as any).key_signature,
        bpm_array: (sourceContiSong as any).bpm_array,
        time_signature: (sourceContiSong as any).time_signature,
        sheet_music_url: (sourceContiSong as any).sheet_music_url,
        sheet_music_pages: (sourceContiSong as any).sheet_music_pages,
        annotations: (sourceContiSong as any).annotations,
        order_index: nextOrderIndex,
        notes: (sourceContiSong as any).notes,
      })
      .select()
      .single();

    if (newContiSongError) {
      // conti_song 생성 실패 시 song도 롤백
      await supabase
        .from('songs')
        .delete()
        .eq('id', (newSong as any).id);
      return createErrorResponse('DATABASE_ERROR', '콘티에 곡 복사 추가에 실패했습니다.', {
        error: newContiSongError,
      });
    }

    return NextResponse.json<ApiResponse<typeof newContiSong>>(
      {
        data: newContiSong,
        message: '곡이 복사되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
