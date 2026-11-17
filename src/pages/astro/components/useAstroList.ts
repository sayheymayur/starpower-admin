import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import type { AstroPagination } from '../../../services/api/astro';

export function useAstroList<T>(
  fetcher: (page: number, search: string) => Promise<{ data: T[]; pagination: AstroPagination }>
) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<AstroPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetcher(page, search);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, pagination, loading, error, search, setSearch, page, setPage, load, setError };
}
