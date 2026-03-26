import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { branchService, HostBranch } from '../services/branchService';
import apiClient from '@/lib/axios';
import { ACCOUNT_API } from '@/config/api/account';
import { fetchMyManagerScope } from '../services/hostStaffService';
import { useAuthStore } from '@/stores/authStore';
import { getRealmRolesFromAccessToken, normalizeRoleName } from '@/utils/keycloakTokenRoles';

interface BranchContextType {
    selectedBranch: HostBranch | null;
    setSelectedBranch: (branch: HostBranch | null) => void;
    branches: HostBranch[];
    loadingBranches: boolean;
    refreshBranches: () => Promise<void>;
}

export const BranchContext = createContext<BranchContextType>({
    selectedBranch: null,
    setSelectedBranch: () => { },
    branches: [],
    loadingBranches: false,
    refreshBranches: async () => { },
});

export const useBranch = () => useContext(BranchContext);

export function BranchProvider({ children }: { children: ReactNode }) {
    const [selectedBranch, setSelectedBranch] = useState<HostBranch | null>(null);
    const [branches, setBranches] = useState<HostBranch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const accessToken = useAuthStore((s) => s.accessToken);

    async function resolveOwnerAliases(): Promise<string[]> {
        const token = useAuthStore.getState().accessToken;
        if (!token) return [];
        try {
            const me = await apiClient.get(ACCOUNT_API.ME);
            const payload = (me as any)?.data ?? (me as any) ?? {};
            const ownerIds = [payload.id, payload.keycloakId]
                .map((v) => (typeof v === 'string' ? v.trim() : ''))
                .filter((v) => v.length > 0);
            return Array.from(new Set(ownerIds));
        } catch {
            return [];
        }
    }

    const refreshBranches = useCallback(async () => {
        setLoadingBranches(true);
        try {
            const roles = getRealmRolesFromAccessToken(accessToken).map(normalizeRoleName);
            const isManager = roles.includes('MANAGER') && !roles.includes('HOST');
            let list: HostBranch[] = [];
            if (isManager) {
                const scope = await fetchMyManagerScope().catch(() => ({ managerScoped: true, branchPropertyId: null }));
                if (scope.managerScoped && scope.branchPropertyId != null) {
                    const allBranches = await branchService.listAll();
                    list = allBranches.filter((b) => b.id === scope.branchPropertyId);
                } else {
                    list = [];
                }
            } else {
                const ownerAliases = await resolveOwnerAliases();
                list = ownerAliases.length > 0
                    ? await branchService.listByOwner(ownerAliases[0], ownerAliases.slice(1))
                    : [];
            }
            setBranches(list);
            setSelectedBranch((prev) => {
                if (isManager) return list[0] ?? null;
                return prev ? list.find((b) => b.id === prev.id) ?? null : null;
            });
        } catch {
            setBranches([]);
            setSelectedBranch(null);
        } finally {
            setLoadingBranches(false);
        }
    }, [accessToken]);

    useEffect(() => {
        void refreshBranches();
    }, [refreshBranches]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            void refreshBranches();
        }, 15000);

        const onFocus = () => {
            void refreshBranches();
        };
        window.addEventListener('focus', onFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
        };
    }, [refreshBranches]);

    return (
        <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, branches, loadingBranches, refreshBranches }}>
            {children}
        </BranchContext.Provider>
    );
}
