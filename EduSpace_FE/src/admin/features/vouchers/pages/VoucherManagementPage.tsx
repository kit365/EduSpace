import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState } from 'react';
import { Ticket, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VoucherCampaignView } from '../components/VoucherCampaignView';
import { VoucherView } from '../components/VoucherView';

export function VoucherManagementPage() {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    const [activeTab, setActiveTab] = useState<'campaigns' | 'vouchers'>('campaigns');

    return (
        <AdminLayout title={isVi ? 'Quản lý Voucher' : 'Voucher Management'}>
            <div className="flex gap-2 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        activeTab === 'campaigns'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    {isVi ? 'Chiến dịch (Campaigns)' : 'Campaigns'}
                </button>
                <button
                    onClick={() => setActiveTab('vouchers')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        activeTab === 'vouchers'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Ticket className="w-4 h-4" />
                    {isVi ? 'Mã giảm giá (Vouchers)' : 'Vouchers'}
                </button>
            </div>

            {activeTab === 'campaigns' ? <VoucherCampaignView /> : <VoucherView />}
        </AdminLayout>
    );
}
