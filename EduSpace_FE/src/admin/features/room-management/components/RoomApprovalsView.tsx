import { User, CheckCircle2, XCircle } from 'lucide-react';

export function RoomApprovalsView() {
    return (
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
    );
}
