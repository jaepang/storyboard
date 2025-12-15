'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * 회원가입 페이지
 *
 * Supabase Auth UI를 사용하여 이메일/비밀번호 회원가입 제공
 */
export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };

    checkUser();

    // 회원가입 후 자동 로그인 시 홈으로 리다이렉트
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            찬양 콘티 관리 시스템
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정을 생성하여 콘티를 관리하세요
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            view="sign_up"
            showLinks={true}
            localization={{
              variables: {
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '처리 중...',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
              },
            }}
          />
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">회원가입 시 자동으로 로그인됩니다.</p>
      </div>
    </div>
  );
}
