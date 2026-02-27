import { Camera, CheckCircle, GraduationCap, Building2, UserCircle2, Mic, Code2 } from 'lucide-react';
import { UserProfile } from '../types';
import { UserRole } from '../../../../../types/user';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'renter': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100"><GraduationCap className="w-3.5 h-3.5" /> Học sinh / Sinh viên</span>;
      case 'host': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100"><Building2 className="w-3.5 h-3.5" /> Hoster</span>;
      case 'staff': return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-wider border border-green-100"><UserCircle2 className="w-3.5 h-3.5" /> Nhân viên</span>;
      case 'admin': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-wider border border-red-100"><Code2 className="w-3.5 h-3.5" /> Admin</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=120`}
            alt={profile.name}
            className="w-32 h-32 rounded-full object-cover"
          />
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            {profile.verified && (
              <CheckCircle className="w-6 h-6 text-blue-500" />
            )}
            {getRoleBadge(profile.role)}
          </div>
          <p className="text-gray-600 mb-4">{profile.bio}</p>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-600">Member since</span>
              <span className="ml-2 font-semibold">{profile.memberSince}</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div>
              <span className="text-gray-600">{profile.totalBookings} bookings</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div>
              <span className="text-gray-600">{profile.totalReviews} reviews</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{profile.rating}</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
