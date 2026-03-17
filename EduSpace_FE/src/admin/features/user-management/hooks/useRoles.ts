import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { roleService } from '../services/roleService';
import { Role } from '@/types';
import { showToast } from '@/utils/toast';

export const useRoles = () => {
    const { t } = useTranslation();
    const [state, setState] = useState<{ roles: Role[]; loading: boolean }>({ roles: [], loading: true });
    const roles = state.roles;
    const loading = state.loading;
    const toastShown = useRef(false);

    useEffect(() => {
        let cancelled = false;

        roleService
            .getRoles()
            .then((data) => {
                if (cancelled) return;
                setState({ roles: Array.isArray(data) ? data : [], loading: false });
            })
            .catch((error: any) => {
                if (cancelled) return;
                console.error('Failed to fetch roles:', error);
                if (!toastShown.current) {
                    toastShown.current = true;
                    const errMsg = error.response?.data?.message || error.message || t('common.error.fetchRoles');
                    showToast.error(t('common.error.title'), errMsg);
                }
                setState({ roles: [], loading: false });
            });

        return () => {
            cancelled = true;
        };
    }, [t]);

    return { roles, loading };
};
