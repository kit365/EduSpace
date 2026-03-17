import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { rewardCatalogService } from '../services/rewardCatalogService';
import type { PointTransaction } from '../types';
import { showToast } from '@/utils/toast';

export function usePointTransactions(userId: string | null, page: number, size: number) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId?.trim()) {
      setTransactions([]);
      setPagination(null);
      return;
    }
    setLoading(true);
    try {
      const result = await rewardCatalogService.getUserTransactions(userId, { page, size });
      setTransactions(result.items);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('points.error.fetchTransactions');
      showToast.error(t('common.error.title') || 'Error', msg);
      setTransactions([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [userId, page, size, t]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, pagination, refresh: fetchTransactions };
}
