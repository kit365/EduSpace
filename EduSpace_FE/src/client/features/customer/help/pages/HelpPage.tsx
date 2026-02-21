import { useNavigate } from 'react-router-dom';
import {
    Search,
    Book,
    ShieldCheck,
    CreditCard,
    MessageCircle,
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';

export function HelpPage() {
    const navigate = useNavigate();

    const categories = [
        { title: 'Getting Started', icon: Book, items: ['How to book a space', 'Finding nearby venues', 'Verification process'] },
        { title: 'Payments', icon: CreditCard, items: ['Refund policy', 'Available payment methods', 'Invoice management'] },
        { title: 'Safety & Trust', icon: ShieldCheck, items: ['Community guidelines', 'Reporting a problem', 'Identity protection'] },
    ];

    return (
        <CustomerLayout>
            <div className="bg-white">
                {/* Hero */}
                <div className="bg-gray-900 py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <h1 className="text-5xl font-black text-white mb-8">How can we help today?</h1>
                        <div className="relative group max-w-2xl mx-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400 transition-colors group-focus-within:text-red-500" />
                            <input
                                type="text"
                                placeholder="Search for articles, guides..."
                                className="w-full pl-16 pr-8 py-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] outline-none text-white text-xl focus:bg-white focus:text-gray-900 transition-all font-bold placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="grid grid-cols-3 gap-8">
                        {categories.map((cat) => (
                            <div key={cat.title} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 hover:shadow-2xl hover:bg-white transition-all duration-500 group">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-red-500 group-hover:rotate-6 transition-all">
                                    <cat.icon className="w-8 h-8 text-gray-700 group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-6">{cat.title}</h3>
                                <ul className="space-y-4">
                                    {cat.items.map(item => (
                                        <li key={item}>
                                            <button className="flex items-center justify-between w-full text-left text-gray-500 font-bold hover:text-red-500 transition-colors group/item">
                                                {item}
                                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-20 bg-red-500 rounded-[48px] p-16 text-white flex items-center justify-between overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full -mb-32 -mr-32 blur-3xl" />
                        <div className="relative z-10 max-w-lg">
                            <h2 className="text-4xl font-black mb-4">Still need answers?</h2>
                            <p className="text-red-100 text-lg font-bold mb-8">Our support team is available 24/7 to help you find the space you need.</p>
                            <button
                                onClick={() => navigate('/messages')}
                                className="bg-white text-red-500 px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:translate-x-2 transition-transform shadow-xl shadow-red-600/20"
                            >
                                <MessageCircle className="w-6 h-6" />
                                Start Chatting Now
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-8 bg-white/10 backdrop-blur-lg rounded-[32px] border border-white/20">
                                <h4 className="font-black text-xl mb-2">Documentation</h4>
                                <p className="text-red-50 text-sm mb-4">Read our deep guides</p>
                                <ExternalLink className="w-6 h-6 text-red-100" />
                            </div>
                            <div className="p-8 bg-white/10 backdrop-blur-lg rounded-[32px] border border-white/20">
                                <h4 className="font-black text-xl mb-2">Community</h4>
                                <p className="text-red-50 text-sm mb-4">Ask other educators</p>
                                <ExternalLink className="w-6 h-6 text-red-100" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
