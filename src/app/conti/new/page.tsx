'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import ContiForm from '@/components/conti/ContiForm';
import type { CreateContiRequest } from '@/types/conti';

export default function NewContiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateContiRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/conti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘티 생성에 실패했습니다.');
      }

      const result = await response.json();

      // Redirect to edit page with the new conti
      router.push(`/conti/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">새 콘티 생성</h1>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          <ContiForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
