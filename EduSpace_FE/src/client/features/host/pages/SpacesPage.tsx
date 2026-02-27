import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RentalLayout } from "../../../layouts/RentalLayout";
import { useBranch } from "../context/BranchContext";
import { MOCK_HOST_SPACES } from "../data/mockData";
import { Users, MoreVertical, Edit2, Copy, Trash2, Search as SearchIcon, Filter, Eye } from "lucide-react";

export function SpacesPage() {
    const navigate = useNavigate();
    const { selectedBranch } = useBranch();
    const [spaces, setSpaces] = useState(MOCK_HOST_SPACES);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance'>('all');

    // Force re-sync data to avoid any weird Vite HMR caching issues across branches
    useEffect(() => {
        setSpaces(MOCK_HOST_SPACES);
    }, [selectedBranch]);

    const filteredSpaces = spaces.filter((s) => {
        // Branch Filter
        const matchesBranch = selectedBranch ? s.branchId === selectedBranch.id : true;
        // Search Filter
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.type.toLowerCase().includes(searchQuery.toLowerCase());
        // Status Filter
        const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter;

        return matchesBranch && matchesSearch && matchesStatus;
    });

    return (
        <RentalLayout title="My Spaces">
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Spaces</h1>
                        <p className="text-gray-500 font-medium">Manage your listed venues and rooms.</p>
                    </div>
                    <button
                        onClick={() => navigate('/rental/spaces/new')}
                        className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95"
                    >
                        Add New Space
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên phòng hoặc loại phòng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 text-sm font-medium outline-none transition-all"
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 text-sm font-bold text-gray-700 outline-none appearance-none cursor-pointer transition-all"
                        >
                            <option value="all">Tất cả trạng thái hoạt động</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="maintenance">Đang bảo trì</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="text-xs text-gray-400">▼</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {filteredSpaces.map((space) => (
                        <div key={space.id} className="border border-gray-100 p-0 rounded-2xl hover:shadow-lg transition-all bg-white group overflow-hidden flex flex-col">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden shrink-0">
                                <img src={space.image} alt={space.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${space.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                                        {space.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="cursor-pointer group/title" onClick={() => navigate(`/rental/spaces/${space.id}`)}>
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover/title:text-red-500 transition-colors" title={space.name}>{space.name}</h3>
                                        <p className="text-gray-500 text-sm font-medium">{space.type}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-50">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 mt-2">
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {space.capacity}</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-lg font-black text-red-500">{space.price}</div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/rental/spaces/${space.id}`)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/rental/spaces/edit/${space.id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Duplicate">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredSpaces.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="text-gray-400 mb-2">Không tìm thấy phòng nào trong chi nhánh này.</div>
                            <button onClick={() => navigate('/rental/spaces/new')} className="text-red-500 font-bold hover:underline">Thêm phòng mới ngay</button>
                        </div>
                    )}
                </div>
            </div>
        </RentalLayout>
    );
}
