import { ReactNode, useState, useRef, useEffect } from 'react';
import { RentalSidebar } from '../features/host/components/RentalSidebar';
import { BranchProvider, useBranch } from '../features/host/context/BranchContext';
import { MOCK_BRANCHES } from '../features/host/data/mockBranches';
import { Building2, ChevronDown, MapPin, Globe } from 'lucide-react';

function RentalLayoutInner({ children, title }: { children: ReactNode; title?: string }) {
    const { selectedBranch, setSelectedBranch } = useBranch();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            <RentalSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">{title}</h1>

                    {/* Custom Global Branch Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center justify-between min-w-[260px] px-4 py-2.5 bg-white border rounded-[16px] shadow-sm transition-all focus:outline-none ${isDropdownOpen ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 hover:border-red-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl transition-colors ${selectedBranch ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                    {selectedBranch ? <MapPin className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-gray-900 leading-tight">
                                        {selectedBranch ? selectedBranch.name : 'Tất cả chi nhánh'}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 mt-0.5 max-w-[150px] truncate uppercase tracking-wider">
                                        {selectedBranch ? selectedBranch.address : 'Tổng hợp dữ liệu'}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full mt-3 right-0 w-[320px] bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1">
                                    {/* Global Option */}
                                    <button
                                        onClick={() => { setSelectedBranch(null); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left ${!selectedBranch ? 'bg-red-50 border-red-100' : 'hover:bg-gray-50 border-transparent'} border`}
                                    >
                                        <div className={`p-2.5 rounded-xl shrink-0 ${!selectedBranch ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-gray-100 text-gray-500'}`}>
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-black ${!selectedBranch ? 'text-red-800' : 'text-gray-900'}`}>Tất cả chi nhánh</div>
                                            <div className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Xem số liệu, lịch đặt và phòng của hệ thống</div>
                                        </div>
                                    </button>

                                    <div className="h-px bg-gray-100 my-2 mx-2"></div>

                                    {/* Branch Options */}
                                    {MOCK_BRANCHES.map(branch => {
                                        const isSelected = selectedBranch?.id === branch.id;
                                        return (
                                            <button
                                                key={branch.id}
                                                onClick={() => { setSelectedBranch(branch); setIsDropdownOpen(false); }}
                                                className={`w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left group border ${isSelected ? 'bg-red-50 border-red-100' : 'hover:bg-gray-50 border-transparent'}`}
                                            >
                                                <div className={`p-2.5 rounded-xl shrink-0 transition-all ${isSelected ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-black ${isSelected ? 'text-red-800' : 'text-gray-900'}`}>{branch.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1 font-medium leading-relaxed line-clamp-2">{branch.address}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Fixed Notification if All Branches selected (Optional) */}
                    {!selectedBranch && (
                        <div className="absolute top-0 right-8 bg-amber-50 text-amber-700 px-4 py-2 rounded-b-xl text-xs font-bold border border-t-0 border-amber-200 shadow-sm z-10 transition-all">
                            Đang hiển thị tổng hợp tất cả chi nhánh
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
