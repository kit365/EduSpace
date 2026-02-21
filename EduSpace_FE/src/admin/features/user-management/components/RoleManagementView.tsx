import { useRoles } from '../hooks/useUserManagement';
import { Shield, Key } from 'lucide-react';

export function RoleManagementView() {
    const { roles, loading } = useRoles();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                <p className="text-gray-400 font-medium">Loading roles...</p>
            ) : (
                roles.map(role => (
                    <div key={role.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`p-3 rounded-xl bg-${role.id === 'admin' ? 'red' : 'blue'}-50`}>
                                <Shield className={`w-6 h-6 text-${role.id === 'admin' ? 'red' : 'blue'}-500`} />
                            </span>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-wider">{role.users} Members</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{role.name}</h3>
                        <div className="space-y-2">
                            {role.permissions.map((perm, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                    <Key className="w-3 h-3 text-gray-400" />
                                    {perm}
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-500 transition-all">
                            Edit Access
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
