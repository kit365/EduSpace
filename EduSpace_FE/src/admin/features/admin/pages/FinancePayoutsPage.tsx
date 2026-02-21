import { AdminLayout } from "../../../layouts/AdminLayout";
import { DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, Settings, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function FinancePayoutsPage() {
    const [commissionRate, setCommissionRate] = useState(10);
    const [minWithdraw, setMinWithdraw] = useState(500000);

    return (
        <AdminLayout title="Finance & Payouts">
            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1">1.2B</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Wallet className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">Escrow</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1">450M</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Wallet (Pending)</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-500 rounded-xl"><ArrowUpRight className="w-6 h-6" /></div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1">120M</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commission Earned</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><ArrowDownLeft className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">Pending</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1">12</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payout Requests</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-900 text-white rounded-lg"><Settings className="w-5 h-5" /></div>
                        <h3 className="font-black text-gray-900 text-lg">Finance Rules</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">System Commission (%)</label>
                            <input
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-2 font-medium">Fee taken from every booking transaction.</p>
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Min Withdraw Limit (VNĐ)</label>
                            <input
                                type="number"
                                value={minWithdraw}
                                onChange={(e) => setMinWithdraw(parseInt(e.target.value))}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                            Update Configuration
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-900 text-lg mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {[
                            { id: 'TRX-9821', type: 'Booking Payment', amount: '+1,200,000', user: 'Nguyen Van A', status: 'Escrow', time: '2 mins ago' },
                            { id: 'TRX-9820', type: 'Payout Request', amount: '-5,000,000', user: 'Host Tran B', status: 'Pending', time: '15 mins ago' },
                            { id: 'TRX-9819', type: 'Refund', amount: '-800,000', user: 'Le Van C', status: 'Completed', time: '1 hour ago' },
                            { id: 'TRX-9818', type: 'Commission', amount: '+120,000', user: 'System', status: 'Completed', time: '2 hours ago' },
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tx.amount.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.amount.startsWith('+') ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{tx.type} <span className="text-gray-400 font-medium">#{tx.id}</span></p>
                                        <p className="text-xs text-gray-500 font-medium">{tx.user} • {tx.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-base ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount}</p>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${tx.status === 'Escrow' ? 'bg-amber-100 text-amber-700' :
                                            tx.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                        }`}>{tx.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
