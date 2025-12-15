import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asInsert } from '@/lib/supabase/types';
import {
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import type { ApiResponse } from '@/types/api';
import type { CopySongRequest } from '@/types/song';

/**
 * POST /api/conti/[contiId]/song/copy - 기존 곡 복사
 * 독립적 복사: song과 conti_song을 모두 새로 생성
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // 원본 song 확인 (typed as unknown then cast)
    const sourceData = sourceContiSong as unknown as {
      songs:
        | {
            title: string;
            composer: string | null;
            lyricist: string | null;
            original_key: string | null;
            genre: string | null;
          }
        | {
            title: string;
            composer: string | null;
            lyricist: string | null;
            original_key: string | null;
            genre: string | null;
          }[];
    };
    const sourceSong = Array.isArray(sourceData.songs) ? sourceData.songs[0] : sourceData.songs;

    if (!sourceSong) {
      return createNotFoundResponse('복사할 곡 정보');
    }

    // 현재 최대 order_index 조회
    const { data: maxOrderData } = await supabase
      .from('conti_songs')
      .select('order_index')
      .eq('conti_id', contiId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const maxOrder = (maxOrderData as { order_index: number } | null)?.order_index ?? -1;
    const nextOrderIndex = maxOrder + 1;

    // 1. 새로운 song 생성 (독립적 복사)
    const newSongData = asInsert('songs', {
      title: sourceSong.title,
      composer: sourceSong.composer,
      lyricist: sourceSong.lyricist,
      original_key: sourceSong.original_key,
      genre: sourceSong.genre,
    });

    const { data: newSong, error: newSongError } = await supabase
      .from('songs')
      .insert(newSongData as never)
      .select()
      .single();

    if (newSongError || !newSong) {
      return createErrorResponse('DATABASE_ERROR', '곡 복사에 실패했습니다.', {
        error: newSongError,
      });
    }

    // 2. 새로운 conti_song 생성 (모든 정보 복사)
    const sourceContiData = sourceContiSong as unknown as {
      title: string;
      composer: string | null;
      lyricist: string | null;
      key_signature: string | null;
      bpm_array: number[];
      time_signature: string | null;
      sheet_music_url: string | null;
      sheet_music_pages: number | null;
      annotations: unknown;
      notes: string | null;
    };

    const newContiSongData = asInsert('conti_songs', {
      conti_id: contiId,
      song_id: (newSong as { id: string }).id,
      title: sourceContiData.title,
      composer: sourceContiData.composer || undefined,
      lyricist: sourceContiData.lyricist || undefined,
      key_signature: sourceContiData.key_signature || undefined,
      bpm_array: sourceContiData.bpm_array,
      time_signature: sourceContiData.time_signature || undefined,
      sheet_music_url: sourceContiData.sheet_music_url || undefined,
      sheet_music_pages: sourceContiData.sheet_music_pages || undefined,
      annotations: sourceContiData.annotations as never,
      order_index: nextOrderIndex,
      notes: sourceContiData.notes || undefined,
    });

    const { data: newContiSong, error: newContiSongError } = await supabase
      .from('conti_songs')
      .insert(newContiSongData as never)
      .select()
      .single();

    if (newContiSongError) {
      // conti_song 생성 실패 시 song도 롤백
      await supabase
        .from('songs')
        .delete()
        .eq('id', (newSong as { id: string }).id);
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
