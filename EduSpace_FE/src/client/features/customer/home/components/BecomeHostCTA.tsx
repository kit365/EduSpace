import { ArrowRight, LayoutGrid, DollarSign, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function BecomeHostCTA() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="relative rounded-[48px] overflow-hidden bg-gray-900 shadow-2xl">
                {/* Background Pattern/Overlay */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/30 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] -ml-24 -mb-24" />
                </div>

                <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-12 p-8 md:p-16 lg:p-20">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">{t('customer.home.cta.badge')}</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                            {t('customer.home.cta.title')}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">{t('customer.home.cta.feature1')}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                    <LayoutGrid className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">{t('customer.home.cta.feature2')}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">{t('customer.home.cta.feature3')}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/rental/register')}
                            className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-95"
                        >
                            {t('customer.home.cta.registerNow')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative">
                        <div className="relative h-[400px] rounded-[40px] overflow-hidden group shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWV0aW5nJTIwcm9vbSUyMGhvc3R8ZW58MXx8fHwxNjk0MzQ0MTMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Become a Host"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s} className="text-xs text-amber-400">★</span>
                                        ))}
                                    </div>
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('customer.home.cta.trustedBy')}</span>
                                </div>
                                <p className="text-white/80 text-xs font-medium leading-relaxed italic">
                                    "{t('customer.home.cta.testimonial')}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
