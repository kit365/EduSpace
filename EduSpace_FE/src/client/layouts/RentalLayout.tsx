import { ReactNode, useState, useRef, useEffect, useMemo } from 'react';
import { RentalSidebar } from '../features/host/components/RentalSidebar';
import { BranchProvider, useBranch } from '../features/host/context/BranchContext';
import { Building2, ChevronDown, MapPin, Globe, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleSwitcher, type UserRole } from '../../components/common/RoleSwitcher';
import { useAuthStore } from '../../stores/authStore';
import {
    canAccessAdminPortal,
    canAccessHostConsole,
    getRealmRolesFromAccessToken,
} from '../../utils/keycloakTokenRoles';

function RentalLayoutInner({ children, title }: { children: ReactNode; title?: string }) {
    const navigate = useNavigate();
    const { selectedBranch, setSelectedBranch, branches, loadingBranches } = useBranch();
    const accessToken = useAuthStore((s) => s.accessToken);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const realmRoles = useMemo(() => getRealmRolesFromAccessToken(accessToken), [accessToken]);
    const allowedModes = useMemo((): UserRole[] => {
        const modes: UserRole[] = ['user'];
        if (isAuthenticated && canAccessHostConsole(realmRoles)) {
            modes.push('host');
        }
        if (isAuthenticated && canAccessAdminPortal(realmRoles)) {
            modes.push('admin');
        }
        return modes;
    }, [isAuthenticated, realmRoles]);

    const handleRoleChange = (newRole: UserRole) => {
        if (!allowedModes.includes(newRole)) return;
        if (newRole === 'admin') navigate('/admin');
        else if (newRole === 'host') navigate('/rental');
        else navigate('/');
    };

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <RentalSidebar isCollapsed={isSidebarCollapsed} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                            title={isSidebarCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
                        >
                            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <RoleSwitcher
                            variant="inline"
                            currentRole="host"
                            onRoleChange={handleRoleChange}
                            allowedModes={allowedModes}
                        />

                        {/* Custom Global Branch Selector */}
                        <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm transition-all focus:outline-none ${isDropdownOpen ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-red-300'}`}
                        >
                            <div className={`p-1.5 rounded-lg transition-colors ${selectedBranch ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                {selectedBranch ? <MapPin className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {selectedBranch ? selectedBranch.name : 'Tất cả chi nhánh'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1">
                                    {/* Global Option */}
                                    <button
                                        onClick={() => { setSelectedBranch(null); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${!selectedBranch ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-900'}`}
                                    >
                                        <Globe className="w-4 h-4 shrink-0" />
                                        <span className="text-sm font-semibold">Tất cả chi nhánh</span>
                                    </button>

                                    {branches.length > 0 && <div className="h-px bg-gray-100 my-1" />}

                                    {/* Branch Options */}
                                    {branches.map(branch => {
                                        const isSelected = selectedBranch?.id === branch.id;
                                        return (
                                            <button
                                                key={branch.id}
                                                onClick={() => { setSelectedBranch(branch); setIsDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${isSelected ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-900'}`}
                                            >
                                                <MapPin className="w-4 h-4 shrink-0" />
                                                <span className="text-sm font-semibold truncate">{branch.name}</span>
                                            </button>
                                        );
                                    })}
                                    {!loadingBranches && branches.length === 0 && (
                                        <div className="px-3 py-2 text-xs font-medium text-gray-500">
                                            Không có chi nhánh
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Notification badge - shows on left when dropdown is open */}
                    {isDropdownOpen && selectedBranch && (
                        <div className="absolute top-0 left-8 bg-blue-50 text-blue-700 px-4 py-2 rounded-b-xl text-xs font-bold border border-t-0 border-blue-200 shadow-sm z-10 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                            {selectedBranch.address}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}

interface RentalLayoutProps {
    children: ReactNode;
    title?: string;
}

export function RentalLayout({ children, title }: RentalLayoutProps) {
    return (
        <BranchProvider>
            <RentalLayoutInner title={title}>
                {children}
            </RentalLayoutInner>
        </BranchProvider>
    );
}
