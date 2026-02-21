import { Mail, Phone, MapPin, User, Save } from 'lucide-react';
import { UserProfile } from '../types';
import { useState } from 'react';

interface PersonalInfoTabProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export function PersonalInfoTab({ profile, onUpdate }: PersonalInfoTabProps) {
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
    // In a real app, we might show a success toast here
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Personal Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Short Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-6 py-4 bg-gray-50 border-none rounded-[24px] outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          onClick={() => setFormData({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            bio: profile.bio,
          })}
          className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl hover:border-gray-200 hover:text-gray-900 transition-all font-black"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="px-10 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all font-black shadow-xl shadow-red-200 flex items-center gap-2 active:scale-95"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
