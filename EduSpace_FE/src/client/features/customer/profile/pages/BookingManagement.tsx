import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Calendar, Clock, MapPin, ChevronRight, Star, MessageSquare, ShieldCheck, Search, Filter, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';
import { SubmitReviewReq } from '../../../../../types/api';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
    id: string;
    roomName: string;
    image: string;
    date: string;
    time: string;
    address: string;
    price: number;
    status: BookingStatus;
    hostName: string;
}

export function BookingManagement() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [review, setReview] = useState<Partial<SubmitReviewReq>>({
        rating: 5,
        comment: ''
    });

    const bookings: Booking[] = [
        {
            id: 'EDU-2024-0010',
            roomName: 'Modern Training Room A',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop',
            date: 'Th 7, 20/01/2024',
            time: '09:00 - 12:00',
            address: 'Quận 1, TP. Hồ Chí Minh',
            price: 2100000,
            status: 'upcoming',
            hostName: 'EduCenter Q1'
        },
        {
            id: 'EDU-2024-0008',
            roomName: 'Creative Workshop Space',
            image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=250&fit=crop',
            date: 'Th 3, 16/01/2024',
            time: '14:00 - 17:00',
            address: 'Quận 3, TP. Hồ Chí Minh',
            price: 1500000,
            status: 'completed',
            hostName: 'InnovateHub'
        }
    ];

    const filteredBookings = bookings.filter(b => b.status === activeTab);

    const stats = [
        { label: t('customer.bookings.tabs.upcoming'), count: 1, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: t('customer.bookings.tabs.completed'), count: 12, color: 'text-green-500', bg: 'bg-green-50' },
        { label: t('customer.bookings.tabs.cancelled'), count: 2, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gray-50/50 py-12 animate-in fade-in duration-700">
                <div className="max-w-6xl mx-auto px-4">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('customer.bookings.title')}</h1>
                            <p className="text-gray-500 font-medium">Manage your educational space reservations and history.</p>
                        </div>

                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                            {stats.map((tab) => (
                                <button
                                    key={tab.label}
                                    onClick={() => setActiveTab(tab.label.toLowerCase().includes('sắp') ? 'upcoming' : tab.label.toLowerCase().includes('hoàn') ? 'completed' : 'cancelled' as any)}
                                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === (tab.label.toLowerCase().includes('sắp') ? 'upcoming' : tab.label.toLowerCase().includes('hoàn') ? 'completed' : 'cancelled' as any)
                                            ? 'bg-gray-900 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === (tab.label.toLowerCase().includes('sắp') ? 'upcoming' : tab.label.toLowerCase().includes('hoàn') ? 'completed' : 'cancelled' as any) ? 'bg-white/20' : tab.bg + ' ' + tab.color
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-72 shrink-0 relative overflow-hidden">
                                            <img src={booking.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg ${booking.status === 'upcoming' ? 'bg-blue-500' : booking.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-8">
                                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{booking.id}</div>
                                                    <h3 className="text-xl font-black text-gray-900 mb-2">{booking.roomName}</h3>
                                                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                                                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-red-500" /> {booking.date}</div>
                                                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-red-500" /> {booking.time}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Paid</div>
                                                    <div className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(booking.price)}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-8">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                {booking.address}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-dashed border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 text-xs">
                                                        {booking.hostName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Host</div>
                                                        <div className="text-xs font-bold text-gray-900">{booking.hostName}</div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button className="px-6 py-3 rounded-xl border border-gray-100 font-black text-xs uppercase tracking-widest text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {t('customer.bookings.actions.contact')}
                                                    </button>
                                                    {booking.status === 'completed' && (
                                                        <button
                                                            onClick={() => { setSelectedBooking(booking); setShowReviewModal(true); }}
                                                            className="px-6 py-3 rounded-xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                                        >
                                                            <Star className="w-4 h-4 text-yellow-400" />
                                                            {t('customer.bookings.actions.review')}
                                                        </button>
                                                    )}
                                                    <button className="p-3 rounded-xl border border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-[32px] border border-gray-100 p-20 text-center shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">{t('customer.bookings.empty')}</h3>
                                <p className="text-gray-400 font-medium mb-8">You don't have any bookings in this category.</p>
                                <button className="bg-red-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100">
                                    Explore Spaces
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowReviewModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-yellow-50 rounded-2xl"><Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /></div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Share your experience</h2>
                                <div className="text-sm font-bold text-gray-400">Reviewing {selectedBooking.roomName}</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="text-center">
                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Your Rating</div>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReview({ ...review, rating: star })}
                                            className="p-1 transition-transform active:scale-90"
                                        >
                                            <Star className={`w-10 h-10 ${review.rating && review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tell us more</label>
                                <textarea
                                    placeholder="How was the space? Cleanliness, amenities, host support..."
                                    className="w-full h-32 px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 transition-all resize-none"
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl border border-gray-100 font-black text-xs uppercase tracking-widest text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        console.log('Submit Review:', review);
                                        setShowReviewModal(false);
                                    }}
                                    className="flex-[2] py-4 px-6 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all active:scale-95"
                                >
                                    Post Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
