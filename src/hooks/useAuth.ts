'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * 인증 상태 확인 커스텀 훅
 *
 * 현재 로그인한 사용자 정보를 제공하고, 인증 상태 변화를 실시간으로 감지합니다.
 *
 * @returns { user, isLoading, isAuthenticated }
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user || null);
      setIsLoading(false);
    };

    getSession();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
