import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loyaltyConfigService } from '../services/loyaltyConfigService';
import type { LoyaltyConfigRequest } from '../types';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function useLoyaltyConfig() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<{ vndPerPoint: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loyaltyConfigService.getConfig();
      setConfig({ vndPerPoint: data?.vndPerPoint ?? 100 });
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, t('points.error.fetchConfig'));
      showToast.error(t('common.error.title') || 'Error', msg);
      setConfig({ vndPerPoint: 100 });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(
    async (body: LoyaltyConfigRequest) => {
      setSaving(true);
      try {
        const data = await loyaltyConfigService.updateConfig(body);
        setConfig({ vndPerPoint: data?.vndPerPoint ?? body.vndPerPoint });
        showToast.success(t('common.success') || 'Success', t('points.success.configUpdated') || 'Config updated');
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, t('points.error.updateConfig'));
        showToast.error(t('common.error.title') || 'Error', msg);
      } finally {
        setSaving(false);
      }
    },
    [t]
  );

  return { config, loading, saving, refresh: fetchConfig, updateConfig };
}
