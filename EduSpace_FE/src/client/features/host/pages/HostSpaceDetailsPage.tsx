import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowLeft, Edit2, Loader2, Share2, Heart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { SpaceGallery, BookingPanel, SpaceInfo, SpaceLocation, SpaceReviews } from '../../customer/spaces/components';
import { useSpaceDetails } from '../../customer/spaces/hooks/useSpaces';

export function HostSpaceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const spaceId = id ? parseInt(id) : 1;
    const { data: space, loading, error } = useSpaceDetails(spaceId);

    const onBack = () => navigate('/rental/spaces');
    const onEdit = () => navigate(`/rental/spaces/edit/${spaceId}`);

    if (loading) {
        return (
            <RentalLayout title="Chi tiết không gian">
                <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                    <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-sm">{t('customer.spaceDetail.loading')}</p>
                </div>
            </RentalLayout>
        );
    }

    if (error || !space) {
        return (
            <RentalLayout title="Không tìm thấy">
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mb-8">
                        <MapPin className="w-10 h-10 text-red-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{t('customer.spaceDetail.notFound')}</h2>
                    <p className="text-gray-500 mb-8 max-w-sm font-bold">{t('customer.spaceDetail.notFoundDesc')}</p>
                    <button onClick={onBack} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95">{t('common.goBack')}</button>
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title={space.name}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700 relative">

                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Quay lại danh sách
                    </button>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all text-gray-500 hover:text-gray-900">
                            <Share2 className="w-4 h-4 text-blue-500" />
                            {t('customer.spaceDetail.share')}
                        </button>
                        <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all text-gray-500 hover:text-red-500">
                            <Heart className="w-4 h-4 fill-none" />
                            {t('customer.spaceDetail.save')}
                        </button>
                    </div>
                </div>

                {/* Header Content */}
                <div className="mb-10">
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight leading-none">{space.name}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-sm font-black text-gray-500 uppercase tracking-tighter line-clamp-1">{space.address || space.location}</span>
                        </div>
                        {space.verified && (
                            <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">
                                {t('customer.spaceDetail.eduVerified')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Gallery */}
                <div className="mb-12">
                    <SpaceGallery images={space.images || [space.image]} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="lg:col-span-2">
                        <SpaceInfo
                            rating={space.rating}
                            capacity={space.capacity}
                            size={space.size || 0}
                            description={space.description || ''}
                            additionalInfo={space.additionalInfo || ''}
                            amenities={space.amenitiesDetailed || []}
                        />
                    </div>

                    {/* Sidebar Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <BookingPanel
                                price={space.price}
                                rating={space.rating}
                                reviewCount={space.reviewCount || 0}
                                spaceName={space.name}
                                spaceImage={space.image}
                            />
                        </div>
                    </div>
                </div>

                {/* Secondary Info */}
                <div className="mt-20 pt-20 border-t border-slate-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <SpaceLocation address={space.address || space.location} />
                        <SpaceReviews rating={space.rating} reviews={space.reviews} />
                    </div>
                </div>

                {/* Fixed Edit Button for Hoster */}
                <button
                    onClick={onEdit}
                    className="fixed bottom-8 right-8 bg-red-500 text-white px-8 py-5 rounded-[24px] shadow-2xl shadow-red-200 hover:bg-red-600 hover:-translate-y-1 transition-all active:scale-95 z-[100] flex items-center gap-3 font-black uppercase tracking-widest text-sm group"
                >
                    <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Chỉnh sửa phòng
                </button>
            </div>
        </RentalLayout>
    );
}
