import { AdminLayout } from '../../../layouts/AdminLayout';

export function FacilityManagementPage() {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
                        <p className="text-sm text-gray-500">Manage education centers and hubs</p>
                    </div>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors">
                        + Add Facility
                    </button>
                </div>
                <div className="p-12 text-center text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🏢</span>
                    </div>
                    <p>Facility list will be displayed here.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
