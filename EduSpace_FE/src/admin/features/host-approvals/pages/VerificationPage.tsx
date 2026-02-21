import { AdminLayout } from '../../../layouts/AdminLayout';
import { User, CheckCircle2, XCircle, Search, ImageIcon, FileCheck } from 'lucide-react';
import { useState } from 'react';

export function VerificationPage() {
    const [tab, setTab] = useState<'rooms' | 'users'>('rooms');

    return (
        <AdminLayout title="Approvals & Verification">
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setTab('rooms')}
                    className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 ${tab === 'rooms' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    Pending Rooms
                </button>
                <button
                    onClick={() => setTab('users')}
                    className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 ${tab === 'users' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    User KYC
                </button>
            </div>

            {tab === 'rooms' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {[
                        { id: '1', name: 'Premium Meeting Room A', host: 'Host A', location: 'District 1, HCMC', price: '200,000', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80' },
                        { id: '2', name: 'Creative Studio Space', host: 'Host B', location: 'Thu Duc City', price: '350,000', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80' },
                    ].map((room) => (
                        <div key={room.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                <img src={room.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">Pending</div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-black text-xl text-gray-900 mb-1">{room.name}</h3>
                                <p className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-1">
                                    <User className="w-4 h-4" /> {room.host} • {room.location}
                                </p>
                                <div className="flex gap-2 mt-6">
                                    <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                    <button className="flex-1 bg-white border border-gray-200 text-gray-500 py-3 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-900">KYC Requests</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input className="pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-bold w-64" placeholder="Search user..." />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {[
                            { name: 'Tran Thi B', email: 'hostB@example.com', docType: 'Identity Card', date: '2023-10-25' },
                            { name: 'Le Van C', email: 'hostC@example.com', docType: 'Business License', date: '2023-10-24' },
                        ].map((req, i) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{req.name}</h4>
                                        <p className="text-sm text-gray-500 font-medium">{req.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Document</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                            <ImageIcon className="w-4 h-4" /> {req.docType}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
