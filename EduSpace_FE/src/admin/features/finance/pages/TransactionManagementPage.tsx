import { AdminLayout } from '../../../layouts/AdminLayout';

export function TransactionManagementPage() {
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
                    <p className="text-sm text-gray-500">Monitor cash flows and financial transactions</p>
                </div>
                <div className="p-12 text-center text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">💰</span>
                    </div>
                    <p>Financial ledger and payment history.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
