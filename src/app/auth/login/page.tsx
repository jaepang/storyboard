'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/common/Loading';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      <div className="h-full flex items-center justify-center">
        <Loading size="large" text="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            찬양 콘티 관리 시스템
          </h2>
          <p className="mt-2 text-sm text-white/60">
            로그인하여 콘티를 생성하고 관리하세요
          </p>
        </div>

        <div className="glass-card p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#818cf8',
                    brandAccent: '#a5b4fc',
                    inputBackground: 'rgba(255, 255, 255, 0.08)',
                    inputText: 'white',
                    inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                    inputBorder: 'rgba(255, 255, 255, 0.1)',
                    inputBorderFocus: '#818cf8',
                    inputBorderHover: 'rgba(255, 255, 255, 0.2)',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    inputBorderRadius: '12px',
                  },
                },
              },
              className: {
                container: 'text-white',
                label: 'text-white/80',
                button: 'glass-button-primary',
                anchor: 'text-indigo-300 hover:text-indigo-200',
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

        <p className="text-center text-sm text-white/50">
          로그인하지 않아도 콘티를 조회하고 PDF를 다운로드할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
