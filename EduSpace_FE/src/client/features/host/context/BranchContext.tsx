import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { branchService, HostBranch } from '../services/branchService';

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

    const refreshBranches = useCallback(async () => {
        setLoadingBranches(true);
        try {
            const list = await branchService.listAll();
            setBranches(list);
            setSelectedBranch((prev) => (prev ? list.find((b) => b.id === prev.id) ?? null : null));
        } catch {
            setBranches([]);
            setSelectedBranch(null);
        } finally {
            setLoadingBranches(false);
        }
    }, []);

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
