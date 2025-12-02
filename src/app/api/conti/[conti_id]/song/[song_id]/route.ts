import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createConflictResponse,
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import { validateBpmArray, validateTitle, validateVersion } from '@/lib/utils/validation';
import type { ApiResponse } from '@/types/api';
import type { UpdateSongRequest } from '@/types/song';

/**
 * PATCH /api/conti/[conti_id]/song/[song_id] - 곡 정보 수정 (낙관적 잠금 적용)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conti_id: string; song_id: string }> }
) {
  try {
    const { conti_id, song_id } = await params;
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
    const body = (await request.json()) as UpdateSongRequest;

    // 버전 검증
    const versionValidation = validateVersion(body.version);
    if (!versionValidation.valid) {
      return createValidationErrorResponse(versionValidation.error || '버전이 유효하지 않습니다.');
    }

    // 현재 conti_song 조회
    const { data: currentContiSong, error: fetchError } = await supabase
      .from('conti_songs')
      .select('*, songs(*)')
      .eq('id', song_id)
      .eq('conti_id', conti_id)
      .single();

    if (fetchError || !currentContiSong) {
      return createNotFoundResponse('곡');
    }

    // 낙관적 잠금 검증
    if ((currentContiSong as any).version !== body.version) {
      return createConflictResponse((currentContiSong as any).version, body.version);
    }

    const currentSong = Array.isArray((currentContiSong as any).songs)
      ? (currentContiSong as any).songs[0]
      : (currentContiSong as any).songs;

    // 필드 유효성 검증
    if (body.title !== undefined) {
      const titleValidation = validateTitle(body.title);
      if (!titleValidation.valid) {
        return createValidationErrorResponse(titleValidation.error || '제목이 유효하지 않습니다.');
      }
    }

    if (body.bpm_array !== undefined) {
      const bpmValidation = validateBpmArray(body.bpm_array);
      if (!bpmValidation.valid) {
        return createValidationErrorResponse(
          bpmValidation.error || 'BPM 배열이 유효하지 않습니다.'
        );
      }
    }

    // song 테이블 업데이트 (제목, 작곡가, 작사가)
    if (body.title !== undefined || body.composer !== undefined || body.lyricist !== undefined) {
      const songUpdateData: {
        title?: string;
        composer?: string | null;
        lyricist?: string | null;
      } = {};

      if (body.title !== undefined) songUpdateData.title = body.title;
      if (body.composer !== undefined) songUpdateData.composer = body.composer || null;
      if (body.lyricist !== undefined) songUpdateData.lyricist = body.lyricist || null;

      // @ts-expect-error - Supabase types work correctly at runtime
      const { error: songUpdateError } = await supabase
        .from('songs')
        .update(songUpdateData)
        .eq('id', currentSong.id);

      if (songUpdateError) {
        return createErrorResponse('DATABASE_ERROR', '곡 정보 수정에 실패했습니다.', {
          error: songUpdateError,
        });
      }
    }

    // conti_song 테이블 업데이트
    const contiSongUpdateData: {
      title?: string;
      composer?: string | null;
      lyricist?: string | null;
      key_signature?: string | null;
      bpm_array?: number[];
      time_signature?: string;
      notes?: string | null;
      version: number;
    } = {
      version: body.version + 1,
    };

    if (body.title !== undefined) contiSongUpdateData.title = body.title;
    if (body.composer !== undefined) contiSongUpdateData.composer = body.composer || null;
    if (body.lyricist !== undefined) contiSongUpdateData.lyricist = body.lyricist || null;
    if (body.key_signature !== undefined)
      contiSongUpdateData.key_signature = body.key_signature || null;
    if (body.bpm_array !== undefined) contiSongUpdateData.bpm_array = body.bpm_array;
    if (body.time_signature !== undefined) contiSongUpdateData.time_signature = body.time_signature;
    if (body.notes !== undefined) contiSongUpdateData.notes = body.notes || null;

    // @ts-expect-error - Supabase types work correctly at runtime
    const { data, error } = await supabase
      .from('conti_songs')
      .update(contiSongUpdateData)
      .eq('id', song_id)
      .eq('conti_id', conti_id)
      .eq('version', body.version)
      .select()
      .single();

    if (error) {
      return createErrorResponse('DATABASE_ERROR', '곡 정보 수정에 실패했습니다.', { error });
    }

    if (!data) {
      return createConflictResponse((currentContiSong as any).version, body.version);
    }

    return NextResponse.json<ApiResponse<typeof data>>({
      data,
      message: '곡 정보가 수정되었습니다.',
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}

/**
 * DELETE /api/conti/[conti_id]/song/[song_id] - 곡 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conti_id: string; song_id: string }> }
) {
  try {
    const { conti_id, song_id } = await params;
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

    // conti_song 조회
    const { data: contiSong, error: fetchError } = await supabase
      .from('conti_songs')
      .select('song_id')
      .eq('id', song_id)
      .eq('conti_id', conti_id)
      .single();

    if (fetchError || !contiSong) {
      return createNotFoundResponse('곡');
    }

    // conti_song 삭제
    const { error: deleteContiSongError } = await supabase
      .from('conti_songs')
      .delete()
      .eq('id', song_id)
      .eq('conti_id', conti_id);

    if (deleteContiSongError) {
      return createErrorResponse('DATABASE_ERROR', '곡 삭제에 실패했습니다.', {
        error: deleteContiSongError,
      });
    }

    // song도 삭제 (독립적 복사이므로)
    await supabase
      .from('songs')
      .delete()
      .eq('id', (contiSong as any).song_id);

    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        message: '곡이 삭제되었습니다.',
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
