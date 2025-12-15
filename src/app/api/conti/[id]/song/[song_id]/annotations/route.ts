import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asUpdate } from '@/lib/supabase/types';
import {
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error';
import type { Annotation } from '@/types/annotation';
import type { ApiResponse } from '@/types/api';

/**
 * GET /api/conti/[id]/song/[song_id]/annotations - 주석 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; song_id: string }> }
) {
  try {
    const { id: contiId, song_id: songId } = await params;
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return createUnauthorizedResponse();
    }

    // conti_song 조회 (권한 확인 포함)
    const { data: contiSong, error: contiSongError } = await supabase
      .from('conti_songs')
      .select('annotations, contis!inner(user_id)')
      .eq('id', songId)
      .eq('conti_id', contiId)
      .single();

    if (contiSongError || !contiSong) {
      return createNotFoundResponse('곡');
    }

    // 권한 확인
    const contiSongData = contiSong as {
      annotations: Annotation | null;
      contis: { user_id: string } | { user_id: string }[];
    };
    const contiData = Array.isArray(contiSongData.contis)
      ? contiSongData.contis[0]
      : contiSongData.contis;

    if (contiData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json<ApiResponse<Annotation | null>>({
      data: contiSongData.annotations,
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}

/**
 * PUT /api/conti/[id]/song/[song_id]/annotations - 주석 저장
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; song_id: string }> }
) {
  try {
    const { id: contiId, song_id: songId } = await params;
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return createUnauthorizedResponse();
    }

    // 요청 본문 파싱
    const body = (await request.json()) as Annotation;

    // conti_song 존재 및 권한 확인
    const { data: contiSong, error: contiSongError } = await supabase
      .from('conti_songs')
      .select('id, contis!inner(user_id)')
      .eq('id', songId)
      .eq('conti_id', contiId)
      .single();

    if (contiSongError || !contiSong) {
      return createNotFoundResponse('곡');
    }

    // 권한 확인
    const contiSongData = contiSong as {
      id: string;
      contis: { user_id: string } | { user_id: string }[];
    };
    const contiData = Array.isArray(contiSongData.contis)
      ? contiSongData.contis[0]
      : contiSongData.contis;

    if (contiData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 주석 저장
    const updateData = asUpdate('conti_songs', {
      annotations: body as never,
    });

    const { error: updateError } = await supabase
      .from('conti_songs')
      .update(updateData as never)
      .eq('id', songId);

    if (updateError) {
      return createErrorResponse('DATABASE_ERROR', '주석 저장에 실패했습니다.', {
        error: updateError,
      });
    }

    return NextResponse.json<ApiResponse<Annotation>>({
      data: body,
      message: '주석이 저장되었습니다.',
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
