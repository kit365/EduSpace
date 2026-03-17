import { Phone, Save, Edit2, X } from 'lucide-react';
import { UserProfile } from '../types';
import { UserRole } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddress } from '../hooks/useAddress';

interface PersonalInfoTabProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
}

function getRoleLabel(role: UserRole | string, t: (k: string) => string): string {
  switch (role) {
    case 'renter': return t('customer.profile.header.roles.renter');
    case 'host': return t('customer.profile.header.roles.host');
    case 'staff': return t('customer.profile.header.roles.staff');
    case 'admin': return t('customer.profile.header.roles.admin');
    default: return String(role);
  }
}

const PLACEHOLDER_ADDRESS = {
  cityState: '',
  district: '',
  ward: '',
  streetAddress: '',
  postalCode: '700000',
  taxId: '—',
};

export function PersonalInfoTab({ profile, onUpdate }: PersonalInfoTabProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio,
    cityState: profile.cityState ?? PLACEHOLDER_ADDRESS.cityState,
    district: profile.district ?? PLACEHOLDER_ADDRESS.district,
    ward: profile.ward ?? PLACEHOLDER_ADDRESS.ward,
    streetAddress: profile.streetAddress ?? PLACEHOLDER_ADDRESS.streetAddress,
    postalCode: profile.postalCode ?? PLACEHOLDER_ADDRESS.postalCode,
    taxId: profile.taxId ?? PLACEHOLDER_ADDRESS.taxId,
  });

  const addressInitial = isEditing
    ? {
        provinceName: formData.cityState || undefined,
        districtName: formData.district || undefined,
        wardName: formData.ward || undefined,
      }
    : undefined;
  const {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvinceCode,
    selectedDistrictCode,
    selectedWardCode,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setProvince,
    setDistrict,
    setWard,
  } = useAddress(addressInitial);

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
      cityState: profile.cityState ?? PLACEHOLDER_ADDRESS.cityState,
      district: profile.district ?? PLACEHOLDER_ADDRESS.district,
      ward: profile.ward ?? PLACEHOLDER_ADDRESS.ward,
      streetAddress: profile.streetAddress ?? PLACEHOLDER_ADDRESS.streetAddress,
      postalCode: profile.postalCode ?? PLACEHOLDER_ADDRESS.postalCode,
      taxId: profile.taxId ?? PLACEHOLDER_ADDRESS.taxId,
    });
    setIsEditing(false);
  };

  const nameParts = (formData.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const labelClass = 'text-sm text-[#666666] mb-1 block';
  const valueClass = 'text-sm font-medium text-[#333333] min-h-[2.25rem] flex items-center';
  const sectionTitleClass = 'text-base font-bold text-[#333333] mb-4';
  const fieldWrapClass = 'flex flex-col min-h-[4rem]';
  const inputClasses = `w-full px-4 py-3 border border-gray-200 rounded-lg outline-none transition-all text-sm text-[#333333] ${isEditing ? 'bg-gray-50 focus:ring-2 focus:ring-[#E8F4FD] focus:border-[#0056B3]' : 'bg-transparent border-transparent'}`;
  const selectClasses = inputClasses + ' cursor-pointer appearance-none bg-no-repeat bg-[length:1rem] bg-[right_0.5rem_center] pr-10';

  const editButtonClass =
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0056B3] focus-visible:ring-offset-2 ' +
    'disabled:opacity-50';

  return (
    <div className="space-y-8">
      {/* Title + single Edit / Cancel+Save bar - fixed height to avoid layout shift */}
      <div className="flex items-center justify-between gap-4 min-h-[40px]">
        <h2 className="text-xl font-bold text-[#333333]">
          {t('customer.profile.personal.myProfile')}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                type="button"
                className={`${editButtonClass} border border-gray-200 text-[#666666] hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98]`}
              >
                <X className="w-4 h-4" />
                {t('customer.profile.personal.cancel')}
              </button>
              <button
                onClick={handleSave}
                type="button"
                className={`${editButtonClass} bg-[#0056B3] text-white hover:bg-[#004494] active:scale-[0.98]`}
              >
                <Save className="w-4 h-4" />
                {t('customer.profile.personal.save')}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setFormData({
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone,
                  location: profile.location,
                  bio: profile.bio,
                  cityState: profile.cityState ?? PLACEHOLDER_ADDRESS.cityState,
                  district: profile.district ?? PLACEHOLDER_ADDRESS.district,
                  ward: profile.ward ?? PLACEHOLDER_ADDRESS.ward,
                  streetAddress: profile.streetAddress ?? PLACEHOLDER_ADDRESS.streetAddress,
                  postalCode: profile.postalCode ?? PLACEHOLDER_ADDRESS.postalCode,
                  taxId: profile.taxId ?? PLACEHOLDER_ADDRESS.taxId,
                });
                setIsEditing(true);
              }}
              type="button"
              className={`${editButtonClass} bg-gray-100 text-[#333333] hover:bg-gray-200 active:scale-[0.98]`}
            >
              <Edit2 className="w-4 h-4" />
              {t('customer.profile.personal.edit')}
            </button>
          )}
        </div>
      </div>

      {/* User summary card - reference style */}
      <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
        <img
          src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=96`}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#333333]">{profile.name}</h3>
          <p className="text-sm text-[#666666] mt-0.5">{getRoleLabel(profile.role, t)}</p>
          {profile.location && (
            <p className="text-sm text-[#666666] mt-0.5">{profile.location}</p>
          )}
        </div>
      </div>

      {/* Personal Information - ẩn email khi edit */}
      <div>
        <h3 className={sectionTitleClass}>{t('customer.profile.personal.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          {isEditing ? (
            <div className={fieldWrapClass + ' sm:col-span-2'}>
              <label className={labelClass}>{t('customer.profile.personal.fullName')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClasses}
              />
            </div>
          ) : (
            <>
              <div className={fieldWrapClass}>
                <span className={labelClass}>{t('customer.profile.personal.firstName')}</span>
                <span className={valueClass}>{firstName || '—'}</span>
              </div>
              <div className={fieldWrapClass}>
                <span className={labelClass}>{t('customer.profile.personal.lastName')}</span>
                <span className={valueClass}>{lastName || '—'}</span>
              </div>
            </>
          )}
          {!isEditing && (
            <div className={fieldWrapClass + ' sm:col-span-2'}>
              <span className={labelClass}>{t('customer.profile.personal.email')}</span>
              <span className={valueClass}>{formData.email || '—'}</span>
            </div>
          )}
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.personal.phone')}</label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className={inputClasses + ' pl-10'}
                />
              </div>
            ) : (
              <span className={valueClass}>{formData.phone || '—'}</span>
            )}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.personal.bio')}</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={2}
                className={inputClasses + ' resize-none min-h-[4.5rem]'}
              />
            ) : (
              <span className={valueClass}>{formData.bio || getRoleLabel(profile.role, t) || '—'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Address - Tỉnh/Quận/Phường từ API + địa chỉ cụ thể */}
      <div>
        <h3 className={sectionTitleClass}>{t('customer.profile.address.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.address.cityState')}</label>
            {isEditing ? (
              <select
                value={selectedProvinceCode ?? ''}
                onChange={(e) => {
                  const code = e.target.value ? Number(e.target.value) : undefined;
                  setProvince(code);
                  const name = code ? provinces.find((p) => p.code === code)?.name : '';
                  setFormData((prev) => ({ ...prev, cityState: name }));
                }}
                className={selectClasses}
                disabled={loadingProvinces}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
              >
                <option value="">{loadingProvinces ? '...' : t('customer.profile.address.cityState')}</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className={valueClass}>{profile.cityState ?? '—'}</span>
            )}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.address.district')}</label>
            {isEditing ? (
              <select
                value={selectedDistrictCode ?? ''}
                onChange={(e) => {
                  const code = e.target.value ? Number(e.target.value) : undefined;
                  setDistrict(code);
                  const name = code ? districts.find((d) => d.code === code)?.name : '';
                  setFormData((prev) => ({ ...prev, district: name }));
                }}
                className={selectClasses}
                disabled={loadingDistricts || selectedProvinceCode == null}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
              >
                <option value="">{loadingDistricts ? '...' : t('customer.profile.address.district')}</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className={valueClass}>{profile.district ?? '—'}</span>
            )}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.address.ward')}</label>
            {isEditing ? (
              <select
                value={selectedWardCode ?? ''}
                onChange={(e) => {
                  const code = e.target.value ? Number(e.target.value) : undefined;
                  setWard(code);
                  const name = code ? wards.find((w) => w.code === code)?.name : '';
                  setFormData((prev) => ({ ...prev, ward: name }));
                }}
                className={selectClasses}
                disabled={loadingWards || selectedDistrictCode == null}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
              >
                <option value="">{loadingWards ? '...' : t('customer.profile.address.ward')}</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className={valueClass}>{profile.ward ?? '—'}</span>
            )}
          </div>
          <div className={fieldWrapClass + ' sm:col-span-2'}>
            <label className={labelClass}>{t('customer.profile.address.streetAddress')}</label>
            {isEditing ? (
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress ?? ''}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Số nhà, tên đường..."
              />
            ) : (
              <span className={valueClass}>{profile.streetAddress ?? '—'}</span>
            )}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.address.postalCode')}</label>
            {isEditing ? (
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode ?? ''}
                onChange={handleChange}
                className={inputClasses}
              />
            ) : (
              <span className={valueClass}>{profile.postalCode ?? PLACEHOLDER_ADDRESS.postalCode}</span>
            )}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass}>{t('customer.profile.address.taxId')}</label>
            {isEditing ? (
              <input
                type="text"
                name="taxId"
                value={formData.taxId ?? ''}
                onChange={handleChange}
                className={inputClasses}
              />
            ) : (
              <span className={valueClass}>{profile.taxId ?? PLACEHOLDER_ADDRESS.taxId}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
