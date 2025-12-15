'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import ContiList from '@/components/conti/ContiList';
import SearchBar from '@/components/conti/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import type { ContiListItem, GetContisParams } from '@/types/conti';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [contis, setContis] = useState<ContiListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GetContisParams>({
    limit: 20,
    offset: 0,
    sort: 'worship_date_desc',
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchContis is defined after useEffect
  useEffect(() => {
    fetchContis();
  }, [filters]);

  const fetchContis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', filters.limit?.toString() || '20');
      params.append('offset', filters.offset?.toString() || '0');
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/conti?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘티 목록 조회에 실패했습니다.');
      }

      const result = await response.json();
      setContis(result.data.contis);
      setTotal(result.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchFilters: Omit<GetContisParams, 'limit' | 'offset'>) => {
    setFilters({
      ...filters,
      ...searchFilters,
      offset: 0, // Reset to first page on new search
    });
  };

  const handlePageChange = (newOffset: number) => {
    setFilters({
      ...filters,
      offset: newOffset,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/conti/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘티 삭제에 실패했습니다.');
      }

      // Refresh the list
      await fetchContis();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      throw err;
    }
  };

  const handleCreateNew = () => {
    router.push('/conti/new');
  };

  return (
    <div className="flex-1 flex flex-col lg:h-[calc(100vh-72px)] lg:overflow-hidden py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col flex-1 gap-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">찬양 콘티</h1>
              <p className="text-gray-600 mt-1">
                {isAuthenticated
                  ? '주간 예배 찬양 콘티를 관리하세요'
                  : '콘티를 조회하고 PDF를 다운로드하세요'}
              </p>
            </div>
            {isAuthenticated && (
              <Button variant="primary" onClick={handleCreateNew} className="self-start sm:self-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 콘티 생성
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Conti List - Scrollable on desktop */}
        <div className="flex-1 lg:overflow-y-auto lg:min-h-0">
          <ContiList
            contis={contis}
            total={total}
            limit={filters.limit || 20}
            offset={filters.offset || 0}
            isLoading={isLoading}
            error={error}
            onPageChange={handlePageChange}
            onDelete={handleDelete}
            onRetry={fetchContis}
          />
        </div>
      </div>
    </div>
  );
}
