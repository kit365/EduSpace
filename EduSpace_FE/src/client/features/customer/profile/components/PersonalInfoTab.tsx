import { Mail, Phone, MapPin, User, Save, Edit2, X } from 'lucide-react';
import { UserProfile } from '../types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PersonalInfoTabProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export function PersonalInfoTab({ profile, onUpdate }: PersonalInfoTabProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
    });
    setIsEditing(false);
  };

  const inputClasses = `w-full pl-12 pr-4 py-4 border-none rounded-2xl outline-none transition-all font-bold text-gray-700 ${isEditing ? 'bg-gray-50 focus:ring-4 focus:ring-red-100 shadow-inner' : 'bg-transparent'
    }`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          {t('customer.profile.personal.title')}
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all font-bold rounded-xl active:scale-95"
          >
            <Edit2 className="w-4 h-4" />
            {t('customer.profile.personal.edit')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t('customer.profile.personal.fullName')}
          </label>
          <div className="relative group">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 ${isEditing ? 'text-gray-300 group-focus-within:text-red-500' : 'text-slate-400'}`} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t('customer.profile.personal.email')}
          </label>
          <div className="relative group">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 ${isEditing ? 'text-gray-300' : 'text-slate-400'}`} />
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={true}
              className={`${inputClasses} opacity-60 cursor-not-allowed`}
              title={t('customer.profile.personal.emailReadOnly')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t('customer.profile.personal.phone')}
          </label>
          <div className="relative group">
            <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 ${isEditing ? 'text-gray-300 group-focus-within:text-red-500' : 'text-slate-400'}`} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t('customer.profile.personal.location')}
          </label>
          <div className="relative group">
            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 ${isEditing ? 'text-gray-300 group-focus-within:text-red-500' : 'text-slate-400'}`} />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
          {t('customer.profile.personal.bio')}
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={!isEditing}
          rows={4}
          className={`w-full px-6 py-4 border-none outline-none transition-all font-bold text-gray-700 resize-none ${isEditing ? 'bg-gray-50 rounded-[24px] focus:ring-4 focus:ring-red-100 shadow-inner' : 'bg-transparent px-0'
            }`}
          placeholder={isEditing ? (t('customer.profile.personal.bio')) : ''}
        />
      </div>

      {isEditing && (
        <div className="flex justify-end gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={handleCancel}
            className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl hover:border-gray-300 hover:text-gray-900 transition-all font-black flex items-center gap-2 active:scale-95"
          >
            <X className="w-5 h-5" />
            {t('customer.profile.personal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-10 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all font-black shadow-xl shadow-red-200 flex items-center gap-2 active:scale-95"
          >
            <Save className="w-5 h-5" />
            {t('customer.profile.personal.save')}
          </button>
        </div>
      )}
    </div>
  );
}
