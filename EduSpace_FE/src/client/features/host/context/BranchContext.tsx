import { createContext, useContext, useState, ReactNode } from 'react';
import { HostBranch } from '../data/mockBranches';

interface BranchContextType {
    selectedBranch: HostBranch | null;
    setSelectedBranch: (branch: HostBranch | null) => void;
}

export const BranchContext = createContext<BranchContextType>({ selectedBranch: null, setSelectedBranch: () => { } });

export const useBranch = () => useContext(BranchContext);

export function BranchProvider({ children }: { children: ReactNode }) {
    const [selectedBranch, setSelectedBranch] = useState<HostBranch | null>(null);
    return (
        <BranchContext.Provider value={{ selectedBranch, setSelectedBranch }}>
            {children}
        </BranchContext.Provider>
    );
}
