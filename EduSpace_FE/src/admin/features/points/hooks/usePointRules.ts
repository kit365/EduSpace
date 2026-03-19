import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { pointRuleService } from '../services/pointRuleService';
import type { PointEarningRule, PointEarningRuleRequest } from '../types';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function usePointRules() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<PointEarningRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await pointRuleService.getAllRules();
      setRules(list);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, t('points.error.fetchRules'));
      setError(msg);
      setRules([]);
      showToast.error(t('common.error.title') || 'Error', msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (body: PointEarningRuleRequest) => {
      try {
        await pointRuleService.createRule(body);
        showToast.success(t('common.success') || 'Success', t('points.success.ruleCreated') || 'Rule created');
        await fetchRules();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.fetchRules'));
        showToast.error(t('common.error.title') || 'Error', msg);
        throw err;
      }
    },
    [fetchRules, t]
  );

  const updateRule = useCallback(
    async (id: number, body: PointEarningRuleRequest) => {
      try {
        await pointRuleService.updateRule(id, body);
        showToast.success(t('common.success') || 'Success', t('points.success.ruleUpdated') || 'Rule updated');
        await fetchRules();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.fetchRules'));
        showToast.error(t('common.error.title') || 'Error', msg);
        throw err;
      }
    },
    [fetchRules, t]
  );

  const deleteRule = useCallback(
    async (id: number) => {
      try {
        await pointRuleService.deleteRule(id);
        showToast.success(t('common.success') || 'Success', t('points.success.ruleDeleted') || 'Rule deleted');
        await fetchRules();
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.fetchRules'));
        showToast.error(t('common.error.title') || 'Error', msg);
        throw err;
      }
    },
    [fetchRules, t]
  );

  return { rules, loading, error, refresh: fetchRules, createRule, updateRule, deleteRule };
}
