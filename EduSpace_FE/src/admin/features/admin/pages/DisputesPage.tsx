import { AdminLayout } from "../../../layouts/AdminLayout";
import { MessageSquareWarning, User, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

export function DisputesPage() {
    return (
        <AdminLayout title="Disputes & Reports">
            <div className="grid grid-cols-1 gap-6">
                {[
                    { id: 'DSP-221', title: 'Room not as described', reporter: 'User A', against: 'Host B', status: 'Open', priority: 'High', date: '2 hours ago' },
                    { id: 'DSP-220', title: 'Host cancelled last minute', reporter: 'User C', against: 'Host D', status: 'Pending Review', priority: 'Medium', date: '5 hours ago' },
                    { id: 'DSP-219', title: 'Payment issue', reporter: 'Host E', against: 'User F', status: 'Resolved', priority: 'Low', date: 'Yesterday' },
                ].map((dispute, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${dispute.priority === 'High' ? 'bg-red-500' :
                                dispute.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                            }`} />

                        <div className="flex justify-between items-start ml-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-2xl ${dispute.priority === 'High' ? 'bg-red-50 text-red-500' :
                                        dispute.priority === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'
                                    }`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{dispute.title}</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">#{dispute.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase tracking-wider">
                                            <User className="w-3 h-3" /> {dispute.reporter}
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-gray-300" />
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-xs font-bold uppercase tracking-wider">
                                            <Shield className="w-3 h-3" /> {dispute.against}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${dispute.status === 'Open' ? 'bg-red-100 text-red-600 animate-pulse' :
                                        dispute.status === 'Pending Review' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {dispute.status}
                                </span>
                                <span className="text-xs font-bold text-gray-400">{dispute.date}</span>
                            </div>
                        </div>

                        {dispute.status !== 'Resolved' && (
                            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end gap-3 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                                    View Details
                                </button>
                                <button className="px-6 py-2 bg-white border border-red-100 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all active:scale-95">
                                    Close Dispute
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
