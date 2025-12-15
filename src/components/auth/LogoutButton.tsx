'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/common/Button';
import { createClient } from '@/lib/supabase/client';

interface LogoutButtonProps {
  /**
   * 버튼 스타일 variant
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /**
   * 버튼 크기
   */
  className?: string;
}

/**
 * 로그아웃 버튼 컴포넌트
 *
 * 클릭 시 Supabase Auth signOut을 호출하여 로그아웃 처리
 */
export default function LogoutButton({ variant = 'secondary', className = '' }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
      // 로그아웃 후 홈으로 리다이렉트
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="small"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </Button>
  );
}
