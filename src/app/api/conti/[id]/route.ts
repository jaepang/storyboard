import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createConflictResponse,
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import { validateDate, validateTitle, validateVersion } from '@/lib/utils/validation';
import type { ApiResponse } from '@/types/api';
import type { ContiWithSongs, UpdateContiRequest } from '@/types/conti';
import type { ContiSong } from '@/types/song';

/**
 * GET /api/conti/[id] - 단일 콘티 조회 (곡 목록 포함)
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return createUnauthorizedResponse();
    }

    // 콘티 조회
    const { data: conti, error: contiError } = await supabase
      .from('contis')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (contiError || !conti) {
      return createNotFoundResponse('콘티');
    }

    // 곡 목록 조회
    const { data: songs, error: songsError } = await supabase
      .from('conti_songs')
      .select('*')
      .eq('conti_id', id)
      .order('order_index', { ascending: true });

    if (songsError) {
      return createErrorResponse('DATABASE_ERROR', '곡 목록 조회에 실패했습니다.', {
        error: songsError,
      });
    }

    const contiWithSongs: ContiWithSongs = {
      ...(conti as unknown as Omit<ContiWithSongs, 'songs'>),
      songs: (songs || []) as ContiSong[],
    };

    return NextResponse.json<ApiResponse<ContiWithSongs>>({
      data: contiWithSongs,
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}

/**
 * PATCH /api/conti/[id] - 콘티 수정 (낙관적 잠금 적용)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const body = (await request.json()) as UpdateContiRequest;

    // 버전 검증
    const versionValidation = validateVersion(body.version);
    if (!versionValidation.valid) {
      return createValidationErrorResponse(versionValidation.error || '버전이 유효하지 않습니다.');
    }

    // 현재 콘티 조회
    const { data: currentConti, error: fetchError } = await supabase
      .from('contis')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !currentConti) {
      return createNotFoundResponse('콘티');
    }

    // 낙관적 잠금 검증
    const currentContiData = currentConti as { version: number };
    if (currentContiData.version !== body.version) {
      return createConflictResponse(currentContiData.version, body.version);
    }

    // 필드 유효성 검증
    if (body.title !== undefined) {
      const titleValidation = validateTitle(body.title);
      if (!titleValidation.valid) {
        return createValidationErrorResponse(titleValidation.error || '제목이 유효하지 않습니다.');
      }
    }

    if (body.worship_date !== undefined) {
      const dateValidation = validateDate(body.worship_date);
      if (!dateValidation.valid) {
        return createValidationErrorResponse(dateValidation.error || '날짜가 유효하지 않습니다.');
      }
    }

    // 콘티 업데이트
    const updateData: {
      title?: string;
      worship_date?: string;
      notes?: string | null;
      version: number;
    } = {
      version: body.version + 1,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.worship_date !== undefined) updateData.worship_date = body.worship_date;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    // @ts-expect-error - Supabase types work correctly at runtime
    const { data, error } = await supabase
      .from('contis')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('version', body.version)
      .select()
      .single();

    if (error) {
      return createErrorResponse('DATABASE_ERROR', '콘티 수정에 실패했습니다.', { error });
    }

    if (!data) {
      return createConflictResponse((currentConti as { version: number }).version, body.version);
    }

    return NextResponse.json<ApiResponse<typeof data>>({
      data,
      message: '콘티가 수정되었습니다.',
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}

/**
 * DELETE /api/conti/[id] - 콘티 삭제
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return createUnauthorizedResponse();
    }

    // 콘티 삭제 (CASCADE로 conti_songs도 자동 삭제됨)
    const { error } = await supabase.from('contis').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      return createErrorResponse('DATABASE_ERROR', '콘티 삭제에 실패했습니다.', { error });
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        message: '콘티가 삭제되었습니다.',
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
