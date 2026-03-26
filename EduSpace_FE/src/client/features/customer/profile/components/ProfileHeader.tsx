import { Camera, CheckCircle, GraduationCap, Building2, UserCircle2, Mic, Code2 } from 'lucide-react';
import { UserProfile } from '../types';
import { User, UserRole } from '@/types';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { t, i18n } = useTranslation();

  const getRoleBadge = (role: UserRole | string) => {
    switch (role) {
      case 'renter':
      case 'guest': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100"><GraduationCap className="w-3.5 h-3.5" /> {t('customer.profile.header.roles.guest')}</span>;
      case 'host': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100"><Building2 className="w-3.5 h-3.5" /> {t('customer.profile.header.roles.host')}</span>;
      case 'staff':
      case 'manager': return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-wider border border-green-100"><UserCircle2 className="w-3.5 h-3.5" /> {t('customer.profile.header.roles.manager')}</span>;
      case 'admin': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-wider border border-red-100"><Code2 className="w-3.5 h-3.5" /> {t('customer.profile.header.roles.admin')}</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
      <div className="flex items-center gap-8">
        {/* Avatar */}
        <div className="relative">
          <div className="p-1 rounded-full border-2 border-red-100 bg-white">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=120`}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover shadow-inner"
            />
          </div>
          <button className="absolute bottom-1 right-1 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg active:scale-90 border-4 border-white">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
            {profile.verified && (
              <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
            )}
            {getRoleBadge(profile.role)}
          </div>
          <p className="text-gray-500 font-medium mb-4 max-w-2xl leading-relaxed">{profile.bio}</p>

          <div className="flex items-center gap-8 flex-wrap">
            {profile.location && (
              <div className="flex items-center gap-2 text-gray-400 text-sm font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </div>
            )}

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-tighter text-xs">
                  {t('customer.profile.header.memberSince')}
                </span>
                <span className="font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                  {profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(
                    i18n.language === 'en' ? 'en-US' : 'vi-VN',
                    { month: 'long', year: 'numeric' }
                  ) : t('customer.profile.header.recently')}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-4 w-px bg-gray-100"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-gray-900">{profile.totalBookings}</span>
                  <span className="text-gray-400 font-bold text-xs uppercase">{t('customer.profile.header.bookings')}</span>
                </div>
                <div className="h-4 w-px bg-gray-100"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-gray-900">{profile.totalReviews}</span>
                  <span className="text-gray-400 font-bold text-xs uppercase">{t('customer.profile.header.reviews')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-100 shadow-sm">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-black text-yellow-700">{profile.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
