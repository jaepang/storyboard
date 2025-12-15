'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/common/Loading';
import { createClient } from '@/lib/supabase/client';

/**
 * 로그인 페이지
 *
 * Supabase Auth UI를 사용하여 이메일/비밀번호 로그인 제공
 */
export default function LoginPage() {
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

    // 로그인 성공 시 홈으로 리다이렉트
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
      <div className="flex-1 flex items-center justify-center">
        <Loading size="large" text="로딩 중..." light />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-6 fade-in">
        {/* Header Card */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            찬양 콘티 관리 시스템
          </h2>
          <p className="mt-2 text-gray-600">
            로그인하여 콘티를 생성하고 관리하세요
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-card rounded-2xl p-6 slide-up">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#6366f1',
                    brandAccent: '#4f46e5',
                    inputBackground: 'rgba(255, 255, 255, 0.8)',
                    inputBorder: 'rgba(255, 255, 255, 0.5)',
                    inputBorderFocus: '#6366f1',
                    inputBorderHover: 'rgba(99, 102, 241, 0.5)',
                  },
                  borderWidths: {
                    buttonBorderWidth: '0px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                  space: {
                    inputPadding: '14px',
                    buttonPadding: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
                    buttonFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
                    inputFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
                  },
                },
              },
              className: {
                button: 'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
                input: 'backdrop-blur-sm',
                anchor: 'text-indigo-600 hover:text-indigo-700',
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={true}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  social_provider_text: '{{provider}}로 로그인',
                  link_text: '계정이 없으신가요? 회원가입',
                },
              },
            }}
          />
        </div>

        {/* Info Card */}
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-sm text-white/80">
            로그인하지 않아도 콘티를 조회하고 PDF를 다운로드할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
