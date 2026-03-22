import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Share2, Heart, Loader2, ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { SpaceGallery, BookingPanel, SpaceInfo, SpaceLocation, SpaceReviews } from '../components';
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

  const sectionTabs = [
    { label: t('customer.spaceDetail.tabs.details'), id: 'details' },
    { label: t('customer.spaceDetail.tabs.policies'), id: 'policies' },
    { label: t('customer.spaceDetail.tabs.reviews'), id: 'reviews' },
    { label: t('customer.spaceDetail.tabs.messages'), id: 'messages' },
  ];

  const hostName = space?.hostName || 'EduSpace Host';

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
        <div className="flex justify-between items-center mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Content ~2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <SpaceGallery images={space.images || [space.image]} />

            {/* Name + stats + share/save under images */}
            <section className="space-y-4 pb-4 border-b border-gray-100">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm font-semibold text-gray-500 line-clamp-1">{space.address || space.location}</span>
                    {space.verified && (
                      <div className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em]">
                        {t('customer.spaceDetail.eduVerified')}
                      </div>
                    )}
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">{space.name}</h1>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-500">★</span>
                    <span className="font-bold text-gray-900">{space.rating}</span>
                    <span className="font-semibold text-gray-700 underline underline-offset-2">
                      {space.reviewCount || 0} {t('customer.spaceDetail.reviews').toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-md transition-all text-gray-500 hover:text-gray-900">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    {t('customer.spaceDetail.share')}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-md transition-all text-gray-500 hover:text-red-500">
                    <Heart className="w-4 h-4 fill-none" />
                    {t('customer.spaceDetail.save')}
                  </button>
                </div>
              </div>
            </section>

            <div className="bg-white border-b border-gray-100 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex items-center gap-8 overflow-x-auto py-3 no-scrollbar">
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap text-sm font-bold transition-all relative pb-2 ${
                      activeTab === tab.id 
                        ? 'text-red-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full animate-in slide-in-from-left-2 duration-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'details' && (
              <section className="pt-4">
                <SpaceInfo
                  rating={space.rating}
                  capacity={space.capacity}
                  size={space.size || 0}
                  description={space.description || ''}
                  additionalInfo={space.additionalInfo || ''}
                  amenities={space.amenitiesDetailed || []}
                />

                <div className="mt-10 pt-8 border-t border-gray-100">
                  <SpaceLocation address={space.address || space.location} />
                </div>
              </section>
            )}

            {activeTab === 'policies' && (
              <section className="pt-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-5">{t('customer.spaceDetail.policiesTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                      <p className="text-sm font-medium text-gray-700">{t('customer.spaceDetail.policyCancellation')}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <p className="text-sm font-medium text-gray-700">{t('customer.spaceDetail.policyCheckIn')}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'reviews' && (
              <section className="pt-4">
                <SpaceReviews rating={space.rating} reviews={space.reviews} />
              </section>
            )}

            {activeTab === 'messages' && (
              <section className="pt-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('customer.spaceDetail.contactHostTitle')}</h3>
                  <p className="text-gray-600 mb-5">{t('customer.spaceDetail.contactHostDesc')}</p>
                  <button
                    onClick={() => navigate('/messages', {
                      state: {
                        recipientName: hostName,
                        spaceId: space.id,
                        spaceName: space.name,
                      }
                    })}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('customer.spaceDetail.contactHostBtn')}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar ~1/3 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 h-fit">
            <BookingPanel
              price={space.price}
              rating={space.rating}
              reviewCount={space.reviewCount || 0}
              spaceName={space.name}
              spaceImage={space.image}
            />

            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{t('customer.spaceDetail.contactHostTitle')}</p>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://i.pravatar.cc/120?img=32"
                  alt={hostName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{hostName}</p>
                  <p className="text-xs text-gray-500">{t('customer.spaceDetail.contactHostDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/messages', {
                  state: {
                    recipientName: hostName,
                    spaceId: space.id,
                    spaceName: space.name,
                  }
                })}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t('customer.spaceDetail.contactHostBtn')}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
