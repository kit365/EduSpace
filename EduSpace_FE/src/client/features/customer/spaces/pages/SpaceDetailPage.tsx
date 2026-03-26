import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Share2, Heart, Loader2, ArrowLeft, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { SpaceGallery, BookingPanel, SpaceInfo, SpaceLocation, SpaceReviews, PriceRulesCard } from '../components';
import { useSpaceDetails } from '../hooks/useSpaces';

export function SpaceDetailPage() {
  const { spaceRef } = useParams<{ spaceRef: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Ensure page scrolls to top on navigation/mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [spaceRef]);

  const ref = spaceRef ?? 'phong-hop-alpha';
  const { data: space, loading, error } = useSpaceDetails(ref);
  const [activeTab, setActiveTab] = useState('details');
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<number>(60); // Default to 60m
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);


  const sectionTabs = [
    { label: t('customer.spaceDetail.tabs.details'), id: 'details' },
    { label: t('customer.spaceDetail.tabs.policies'), id: 'policies' },
    { label: t('customer.spaceDetail.tabs.reviews'), id: 'reviews' },
    { label: t('customer.spaceDetail.tabs.messages'), id: 'messages' },
  ];

  const hostName = space?.hostName || 'EduSpace Host';

  const todaySchedule = useMemo(() => {
    if (!space?.schedules?.length) return undefined;
    const jsDay = new Date().getDay();
    const userDay = jsDay === 0 ? 8 : jsDay + 1;
    return space.schedules.find((s) => s.dayOfWeek === userDay);
  }, [space?.schedules]);

  const weekDays = [
    { id: 2, label: 'Thứ 2' },
    { id: 3, label: 'Thứ 3' },
    { id: 4, label: 'Thứ 4' },
    { id: 5, label: 'Thứ 5' },
    { id: 6, label: 'Thứ 6' },
    { id: 7, label: 'Thứ 7' },
    { id: 8, label: 'Chủ Nhật' },
  ];

  const onBack = () => navigate(-1);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
          <p className="font-black text-gray-400 uppercase tracking-widest text-sm">{t('customer.spaceDetail.loading')}</p>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !space) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mb-8">
            <MapPin className="w-10 h-10 text-red-200" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{t('customer.spaceDetail.notFound')}</h2>
          <p className="text-gray-500 mb-8 max-w-sm font-bold">{t('customer.spaceDetail.notFoundDesc')}</p>
          <button onClick={onBack} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95">{t('common.goBack')}</button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest"
          >
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            {t('customer.spaceDetail.backToExplorer')}
          </button>
        </div>

        {/* Hero Gallery Section */}
        <div className="mb-10">
          <SpaceGallery images={space.images || [space.image]} />
        </div>

        <div className="space-y-12">
          {/* Header Info & Booking Row */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
            {/* Left: Info & Content */}
            <div className="lg:col-span-7 space-y-10">
              <section className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  {space.facilityName && (
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-gray-900 text-white rounded text-[10px] font-black uppercase tracking-widest">
                        {t('host.listSpace.basics.facilityName')}
                      </div>
                      <span className="text-sm font-black text-gray-900 uppercase tracking-wider">{space.facilityName}</span>
                    </div>
                  )}
                  {space.verified && (
                    <div className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      {t('customer.spaceDetail.eduVerified')}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">{space.name}</h1>
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    {space.address || space.location}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
                      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all hover:shadow-md ${
                        todaySchedule?.isOpen ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${todaySchedule?.isOpen ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {todaySchedule?.isOpen
                          ? `Giờ hoạt động: ${todaySchedule.openTime?.substring(0, 5)} - ${todaySchedule.closeTime?.substring(0, 5)}`
                          : t('customer.spaceDetail.status.closed')}
                      </span>
                      <Clock className="w-4 h-4 opacity-40 ml-1" />
                    </button>

                    {showWeeklySchedule && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowWeeklySchedule(false)} />
                        <div className="absolute top-full mt-3 left-0 w-64 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{t('host.listSpace.pricing.sessionAvailability')}</h4>
                          <div className="space-y-4">
                            {weekDays.map((day) => {
                              const sched = space.schedules?.find(s => s.dayOfWeek === day.id);
                              const isToday = (new Date().getDay() === 0 ? 8 : new Date().getDay() + 1) === day.id;
                              return (
                                <div key={day.id} className={`flex items-center justify-between ${isToday ? 'text-red-600' : 'text-gray-600'}`}>
                                  <span className={`text-sm font-black ${isToday ? '' : 'text-gray-900'}`}>{day.label}</span>
                                  <span className="text-sm font-bold">
                                    {sched?.isOpen
                                      ? `${sched.openTime?.substring(0, 5)} - ${sched.closeTime?.substring(0, 5)}`
                                      : 'Đóng cửa'
                                    }
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500 text-lg">★</span>
                      <span className="font-black text-gray-900 text-lg leading-none">{space.rating}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer" onClick={() => setActiveTab('reviews')}>
                      {space.reviewCount || 0} {t('customer.spaceDetail.reviews')}
                    </span>
                  </div>

                  {space.weekendSurchargeEnabled && (
                    <div className="bg-amber-50 text-amber-700 border border-amber-100 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Phụ thu cuối tuần: +{space.weekendSurchargePercent}%
                        ({[
                          space.weekendApplySaturday && 'T7',
                          space.weekendApplySunday && 'CN'
                        ].filter(Boolean).join(' & ')})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-md transition-all text-gray-500 hover:text-gray-900">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    {t('customer.spaceDetail.share')}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-md transition-all text-gray-400 hover:text-red-500">
                    <Heart className="w-4 h-4 fill-none" />
                    {t('customer.spaceDetail.save')}
                  </button>
                </div>
              </section>

              {/* Content Tabs Inside Info Column */}
              <div className="space-y-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                  {sectionTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all relative pb-2 ${
                        activeTab === tab.id
                          ? 'text-red-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 min-h-[300px]">
                  {activeTab === 'details' && (
                    <div className="space-y-12">
                      <SpaceInfo
                        rating={space.rating}
                        capacity={space.capacity}
                        size={space.size || 0}
                        description={space.description || ''}
                        additionalInfo={space.additionalInfo || ''}
                        amenities={space.amenitiesDetailed || []}
                      />
                      <div className="pt-8 border-t border-gray-100">
                        <SpaceLocation
                          address={space.address || space.location}
                          roomLocationHint={space.roomLocationHint}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'policies' && (
                    <div className="grid grid-cols-1 gap-4">
                      {space.policies && space.policies.length > 0 ? (
                        space.policies.map((policy) => (
                          <div key={policy.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                            <div className="flex items-start gap-3">
                              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{policy.name}</p>
                                <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest py-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          Chưa có chính sách cụ thể
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <SpaceReviews rating={space.rating} reviews={space.reviews} />
                  )}

                  {activeTab === 'messages' && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                      <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{t('customer.spaceDetail.contactHostTitle')}</h3>
                      <p className="text-sm text-gray-500 mb-6 font-bold">
                        {space.host?.isVerified
                          ? t('customer.spaceDetail.verifiedHost')
                          : t('customer.spaceDetail.contactHostDesc')}
                      </p>
                      <button
                        onClick={() => navigate('/messages', {
                          state: {
                            recipientName: hostName,
                            spaceId: space.id,
                            spaceName: space.name,
                          }
                        })}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-colors shadow-lg shadow-gray-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('customer.spaceDetail.contactHostBtn')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Combined Booking/Rules Area */}
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-6 h-fit lg:sticky lg:top-24">
                <div className="w-full">
                  {space.priceRules && space.priceRules.length > 0 && (
                    <PriceRulesCard 
                      rules={space.priceRules} 
                      selectedDurationMinutes={duration}
                    />
                  )}
                </div>
                <div className="w-full">
                  <BookingPanel
                    roomId={space.roomId ?? space.id}
                    price={space.price}
                    priceRules={space.priceRules}
                    rating={space.rating}
                    reviewCount={space.reviewCount || 0}
                    spaceName={space.name}
                    spaceImage={space.image}
                    capacity={space.capacity}
                    schedules={space.schedules}
                    minDuration={space.minDuration}
                    stepUnit={space.stepUnit}
                    amenities={space.amenitiesDetailed || []}
                    selectedDate={bookingDate}
                    onSelectedDateChange={setBookingDate}
                    duration={duration}
                    onDurationChange={setDuration}
                  />
                </div>


                {/* Host Info as a simple card in sidebar */}
                <div className="w-full rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{t('customer.spaceDetail.contactHostTitle')}</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={space.host?.avatar || "https://i.pravatar.cc/120?img=32"}
                      alt={space.host?.name || hostName}
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-black text-gray-900 text-sm leading-tight uppercase">{space.host?.name || hostName}</p>
                      <button
                        onClick={() => navigate('/messages')}
                        className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1 hover:underline"
                      >
                        Gửi tin nhắn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
