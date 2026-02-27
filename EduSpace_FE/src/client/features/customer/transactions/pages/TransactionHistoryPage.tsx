import { useState } from 'react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { ArrowLeft, Clock, Search, Filter, Download, CreditCard, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../../../utils';

type TransactionStatus = 'completed' | 'pending' | 'refunded' | 'failed';
type TransactionType = 'payment' | 'refund' | 'deposit';

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    spaceName?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'TRX-2026-9871',
        date: '2026-02-27T08:30:00',
        description: 'Thanh toán đặt phòng Meeting Room A',
        amount: -450000,
        type: 'payment',
        status: 'completed',
        spaceName: 'Meeting Room A',
    },
    {
        id: 'TRX-2026-9870',
        date: '2026-02-25T14:15:00',
        description: 'Hoàn tiền hủy phòng Workshop Space C',
        amount: 1200000,
        type: 'refund',
        status: 'completed',
        spaceName: 'Workshop Space C',
    },
    {
        id: 'TRX-2026-9865',
        date: '2026-02-20T09:45:00',
        description: 'Nạp tiền vào ví EduSpace',
        amount: 500000,
        type: 'deposit',
        status: 'completed',
    },
    {
        id: 'TRX-2026-9860',
        date: '2026-02-18T16:20:00',
        description: 'Thanh toán đặt phòng Study Room B',
        amount: -300000,
        type: 'payment',
        status: 'failed',
        spaceName: 'Study Room B',
    },
    {
        id: 'TRX-2026-9855',
        date: '2026-02-15T10:00:00',
        description: 'Yêu cầu hoàn tiền (Đang xử lý)',
        amount: 450000,
        type: 'refund',
        status: 'pending',
        spaceName: 'Meeting Room A',
    }
];

export function TransactionHistoryPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'payment' | 'refund'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = MOCK_TRANSACTIONS.filter(trx => {
        const matchesTab = activeTab === 'all' || trx.type === activeTab;
        const matchesSearch = trx.description.toLowerCase().includes(searchTerm.toLowerCase()) || trx.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case 'completed': return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Thành công</span>;
            case 'pending': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold"><Clock className="w-3.5 h-3.5" /> Đang xử lý</span>;
            case 'refunded': return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold"><ArrowRightLeft className="w-3.5 h-3.5" /> Đã hoàn tiền</span>;
            case 'failed': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Thất bại</span>;
        }
    };

    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case 'payment': return <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-red-500" /></div>;
            case 'refund': return <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><ArrowRightLeft className="w-5 h-5 text-green-500" /></div>;
            case 'deposit': return <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><ArrowRightLeft className="w-5 h-5 text-blue-500" /></div>;
        }
    };

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gray-50 py-10 animate-in fade-in duration-700">
                <div className="max-w-5xl mx-auto px-4">

                    <button onClick={() => navigate('/profile')} className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest mb-8">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Quay lại Hồ sơ
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Lịch sử giao dịch</h1>
                            <p className="text-gray-500 font-medium">Quản lý thanh toán, hóa đơn và yêu cầu hoàn tiền của bạn.</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-6 shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng chi tiêu tháng này</p>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(750000)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex bg-gray-100 p-1.5 rounded-xl w-full sm:w-auto">
                                {[
                                    { id: 'all', label: 'Tất cả' },
                                    { id: 'payment', label: 'Thanh toán' },
                                    { id: 'refund', label: 'Hoàn tiền' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Tìm mã giao dịch..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                                <button className="flex items-center justify-center w-11 h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="flex items-center justify-center w-11 h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-gray-100">
                            {filteredTransactions.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 font-medium">Không tìm thấy giao dịch nào phù hợp.</div>
                            ) : (
                                filteredTransactions.map(trx => (
                                    <div key={trx.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            {getTransactionIcon(trx.type)}
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{trx.description}</h4>
                                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                                    <span>{new Date(trx.date).toLocaleString('vi-VN')}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="font-mono">{trx.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 sm:gap-8">
                                            {getStatusBadge(trx.status)}
                                            <div className={`text-right font-black w-24 ${trx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                {trx.amount > 0 ? '+' : ''}{formatCurrency(trx.amount)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </CustomerLayout>
    );
}
