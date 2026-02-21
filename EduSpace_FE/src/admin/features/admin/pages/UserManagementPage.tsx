import { AdminLayout } from "../../../layouts/AdminLayout";
import { useUsers } from '../hooks/useAdmin';
import { User, Shield, Lock, Search } from 'lucide-react';

export function UserManagementPage() {
    const { users, loading } = useUsers();

    return (
        <AdminLayout title="User Management">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Users</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input className="pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-bold w-72" placeholder="Search user..." />
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">User</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Role</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400 font-bold">Loading users...</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${user.role === 'Admin' ? 'bg-purple-50 text-purple-600' :
                                                user.role === 'Host' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {user.role === 'Admin' && <Shield className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-50 text-green-600' :
                                                user.status === 'Blocked' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500 animate-pulse' : user.status === 'Blocked' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500">{user.joined}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
