import { useState } from 'react';
import { UserPlus, Shield, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { HOST_STAFF } from '../data/mockData';
import { StaffMember, StaffPermission } from '../types';

const PERMISSION_LABELS: Record<StaffPermission, string> = {
    check_in: 'Check-in khách',
    collect_payment: 'Thu tiền',
    manage_schedule: 'Quản lý lịch',
    view_bookings: 'Xem đặt phòng',
    add_services: 'Thêm dịch vụ',
};

export function StaffManagementPage() {
    const [staffList, setStaffList] = useState<StaffMember[]>(HOST_STAFF);
    const [showForm, setShowForm] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', permissions: [] as StaffPermission[] });

    const togglePermission = (perm: StaffPermission) => {
        setNewStaff(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
        }));
    };

    const handleAdd = () => {
        if (!newStaff.name || !newStaff.email) return;
        const staff: StaffMember = {
            id: `STF-${Date.now()}`, name: newStaff.name, email: newStaff.email, phone: newStaff.phone,
            permissions: newStaff.permissions, status: 'active', createdAt: new Date().toISOString().split('T')[0]
        };
        setStaffList(prev => [...prev, staff]);
        setNewStaff({ name: '', email: '', phone: '', permissions: [] });
        setShowForm(false);
    };

    const handleRemove = (id: string) => {
        if (window.confirm('Bạn chắc chắn muốn xoá nhân viên này?')) {
            setStaffList(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleToggleStatus = (id: string) => {
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    };

    return (
        <RentalLayout title="Quản lý nhân viên">
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Quản lý Staff</h1>
                        <p className="text-gray-500 font-medium">Tạo tài khoản nhân viên lễ tân để check-in và thu tiền tại quầy.</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95">
                        <UserPlus className="w-5 h-5" /> Thêm nhân viên
                    </button>
                </div>

                {/* Add Staff Form */}
                {showForm && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg mb-8 animate-in slide-in-from-top duration-500">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Tạo tài khoản Staff mới</h3>
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Họ tên *</label>
                                <input type="text" value={newStaff.name} onChange={e => setNewStaff(p => ({ ...p, name: e.target.value }))} placeholder="Nguyễn Văn A" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email *</label>
                                <input type="email" value={newStaff.email} onChange={e => setNewStaff(p => ({ ...p, email: e.target.value }))} placeholder="staff@company.vn" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                                <input type="text" value={newStaff.phone} onChange={e => setNewStaff(p => ({ ...p, phone: e.target.value }))} placeholder="09xxxxxxxx" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Phân quyền</label>
                            <div className="flex flex-wrap gap-3">
                                {(Object.keys(PERMISSION_LABELS) as StaffPermission[]).map(perm => (
                                    <button key={perm} onClick={() => togglePermission(perm)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${newStaff.permissions.includes(perm) ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {newStaff.permissions.includes(perm) ? '✓ ' : ''}{PERMISSION_LABELS[perm]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Huỷ</button>
                            <button onClick={handleAdd} className="px-8 py-3 rounded-xl font-black bg-gray-900 text-white hover:bg-red-500 shadow-lg transition-all active:scale-95">Tạo tài khoản</button>
                        </div>
                    </div>
                )}

                {/* Staff List */}
                <div className="space-y-4">
                    {staffList.map(staff => (
                        <div key={staff.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-6">
                                {/* Avatar */}
                                <div className="relative">
                                    {staff.avatar ? (
                                        <img src={staff.avatar} alt={staff.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
                                            {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${staff.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-gray-900 text-lg">{staff.name}</h4>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${staff.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>{staff.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{staff.email} · {staff.phone}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Shield className="w-3 h-3 text-gray-300" />
                                        {staff.permissions.map(p => (
                                            <span key={p} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{PERMISSION_LABELS[p]}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleToggleStatus(staff.id)} className={`p-3 rounded-xl transition-all ${staff.status === 'active' ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-green-50 text-green-500'}`}>
                                        {staff.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    </button>
                                    <button className="p-3 rounded-xl hover:bg-blue-50 text-blue-500 transition-all"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => handleRemove(staff.id)} className="p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {staffList.length === 0 && (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center">
                            <UserPlus className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">Chưa có nhân viên</h3>
                            <p className="text-gray-400 font-medium">Thêm Staff để hỗ trợ check-in và quản lý phòng tại quầy.</p>
                        </div>
                    )}
                </div>
            </div>
        </RentalLayout>
    );
}
