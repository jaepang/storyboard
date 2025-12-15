import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asInsert } from '@/lib/supabase/types';
import {
  createErrorResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error';
import { validateDate, validateTitle } from '@/lib/utils/validation';
import type { ApiResponse, ContiListResponse } from '@/types/api';
import type { CreateContiRequest, GetContisParams } from '@/types/conti';

/**
 * GET /api/conti - 콘티 목록 조회
 *
 * Public Read: 인증 없이 모든 콘티 조회 가능
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const params: GetContisParams = {
      limit: Number.parseInt(searchParams.get('limit') || '20', 10),
      offset: Number.parseInt(searchParams.get('offset') || '0', 10),
      sort: (searchParams.get('sort') as GetContisParams['sort']) || 'worship_date_desc',
      search: searchParams.get('search') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    };

    // 기본 쿼리 구성 (Public Read: user_id 필터 제거)
    let query = supabase.from('contis').select(
      `
        id,
        user_id,
        title,
        worship_date,
        notes,
        version,
        created_at,
        updated_at,
        conti_songs (count)
      `,
      { count: 'exact' }
    );

    // 검색 필터 (콘티 제목 또는 곡 제목)
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,conti_songs.title.ilike.%${params.search}%`);
    }

    // 날짜 범위 필터
    if (params.date_from) {
      query = query.gte('worship_date', params.date_from);
    }
    if (params.date_to) {
      query = query.lte('worship_date', params.date_to);
    }

    // 정렬
    switch (params.sort) {
      case 'worship_date_asc':
        query = query.order('worship_date', { ascending: true });
        break;
      case 'created_at_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'title_asc':
        query = query.order('title', { ascending: true });
        break;
      default:
        query = query.order('worship_date', { ascending: false });
    }

    // 페이지네이션
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 20;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return createErrorResponse('DATABASE_ERROR', '콘티 목록 조회에 실패했습니다.', { error });
    }

    // ContiListItem 형식으로 변환
    const contis = (data || []).map(
      (item: {
        id: string;
        user_id: string;
        title: string;
        worship_date: string;
        notes: string | null;
        version: number;
        created_at: string;
        updated_at: string;
        conti_songs: unknown[];
      }) => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        worship_date: item.worship_date,
        notes: item.notes,
        version: item.version,
        created_at: item.created_at,
        updated_at: item.updated_at,
        song_count: Array.isArray(item.conti_songs) ? item.conti_songs.length : 0,
      })
    );

    return NextResponse.json<ApiResponse<ContiListResponse>>({
      data: {
        contis,
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}

/**
 * POST /api/conti - 콘티 생성
 */
export async function POST(request: NextRequest) {
  try {
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
    const body = (await request.json()) as CreateContiRequest;

    // 유효성 검증
    const titleValidation = validateTitle(body.title);
    if (!titleValidation.valid) {
      return createValidationErrorResponse(titleValidation.error || '제목이 유효하지 않습니다.');
    }

    const dateValidation = validateDate(body.worship_date);
    if (!dateValidation.valid) {
      return createValidationErrorResponse(dateValidation.error || '날짜가 유효하지 않습니다.');
    }

    // 콘티 생성
    const insertData = asInsert('contis', {
      user_id: user.id,
      title: body.title,
      worship_date: body.worship_date,
      notes: body.notes || null,
    });

    const { data, error } = await supabase
      .from('contis')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return createErrorResponse('DATABASE_ERROR', '콘티 생성에 실패했습니다.', { error });
    }

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        data,
        message: '콘티가 생성되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.', { error });
  }
}
