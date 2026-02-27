import { useState } from 'react';
import { Plus, Building2, MapPin, MoreVertical, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { HostBranch, MOCK_BRANCHES } from '../data/mockBranches';

export function BranchesPage() {
    const [branches, setBranches] = useState<HostBranch[]>(MOCK_BRANCHES);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <RentalLayout title="Quản lý Cơ sở / Chi nhánh">
            <div className="max-w-6xl mx-auto animate-in fade-in duration-500">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">Cơ sở hoạt động ({branches.length})</h2>
                        <p className="text-gray-500 text-sm">Quản lý và thiết lập các địa điểm vật lý của bạn.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-600 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        Thêm cơ sở mới
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên cơ sở, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 font-medium outline-none"
                        />
                    </div>
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBranches.map(branch => (
                        <div key={branch.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={branch.name}>{branch.name}</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{branch.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span>{branch.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">{branch.email}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quản lý bởi</div>
                                    <div className="text-sm font-semibold text-gray-900">{branch.manager}</div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${branch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {branch.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Empty State Add Button */}
                    <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 transition-all group">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-gray-900">Thêm Cơ Sở</span>
                        <span className="text-sm mt-1">Mở rộng mạng lưới điểm dạy của bạn</span>
                    </button>
                </div>

            </div>
        </RentalLayout>
    );
}
