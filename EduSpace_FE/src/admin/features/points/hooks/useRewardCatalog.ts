import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { rewardCatalogService } from '../services/rewardCatalogService';
import type { RewardCatalog, RewardCatalogRequest } from '../types';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function useRewardCatalog() {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState<RewardCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await rewardCatalogService.getAllRewards();
      setRewards(list);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, t('points.error.fetchRewards'));
      setError(msg);
      setRewards([]);
      showToast.error(t('common.error.title') || 'Error', msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const createReward = useCallback(
    async (body: RewardCatalogRequest) => {
      try {
        await rewardCatalogService.createReward(body);
        showToast.success(t('common.success') || 'Success', t('points.success.rewardCreated') || 'Reward created');
        await fetchRewards();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.fetchRewards'));
        showToast.error(t('common.error.title') || 'Error', msg);
        throw err;
      }
    },
    [fetchRewards, t]
  );

  const updateReward = useCallback(
    async (id: number, body: RewardCatalogRequest) => {
      try {
        await rewardCatalogService.updateReward(id, body);
        showToast.success(t('common.success') || 'Success', t('points.success.rewardUpdated') || 'Reward updated');
        await fetchRewards();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.fetchRewards'));
        showToast.error(t('common.error.title') || 'Error', msg);
        throw err;
      }
    },
    [fetchRewards, t]
  );

  const deleteReward = useCallback(
    async (id: number) => {
      try {
        await rewardCatalogService.deleteReward(id);
        showToast.success(t('common.success') || 'Success', t('points.success.rewardDeleted') || 'Reward deleted');
        await fetchRewards();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.fetchRewards'));
        showToast.error(t('common.error.title') || 'Error', msg);
        throw err;
      }
    },
    [fetchRewards, t]
  );

  return { rewards, loading, error, refresh: fetchRewards, createReward, updateReward, deleteReward };
}
