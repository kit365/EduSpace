import { AdminLayout } from '../../../layouts/AdminLayout';

export function BookingManagementPage() {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                    <p className="text-sm text-gray-500">Track and manage all reservations and schedules</p>
                </div>
                <div className="p-12 text-center text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📅</span>
                    </div>
                    <p>Master booking schedule and reservation list.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
