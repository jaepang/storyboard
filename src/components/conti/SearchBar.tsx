'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export interface SearchBarProps {
  onSearch: (filters: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: 'worship_date_desc' | 'worship_date_asc' | 'created_at_desc' | 'title_asc';
  }) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<
    'worship_date_desc' | 'worship_date_asc' | 'created_at_desc' | 'title_asc'
  >('worship_date_desc');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: search.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sort,
    });
  };

  const handleReset = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSort('worship_date_desc');
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <Input
            label="검색"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="콘티 제목 또는 곡 제목 검색..."
            disabled={isLoading}
          />
        </div>

        {/* Date From */}
        <div>
          <Input
            label="시작 날짜"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Date To */}
        <div>
          <Input
            label="종료 날짜"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Sort & Actions */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="sort" className="block text-sm font-medium text-white/80 mb-2">
            정렬
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            disabled={isLoading}
            className="block w-full rounded-xl px-4 py-2.5 text-base glass-input disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="worship_date_desc">예배 날짜 (최신순)</option>
            <option value="worship_date_asc">예배 날짜 (오래된순)</option>
            <option value="created_at_desc">생성일 (최신순)</option>
            <option value="title_asc">제목 (가나다순)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoading}>
            초기화
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            검색
          </Button>
        </div>
      </div>
    </form>
  );
}
