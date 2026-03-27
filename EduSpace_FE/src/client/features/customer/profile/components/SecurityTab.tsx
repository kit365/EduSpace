import { Lock, Shield, Loader2, CheckCircle, X, QrCode, Mail, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { showToast } from '../../../../../utils/toast';
import { profileService } from '../services/profileService';
import { useProfile } from '../hooks/useProfile';
import { useTranslation } from 'react-i18next';

export function SecurityTab() {
  const { t } = useTranslation();
  const { profile, loading: profileLoading } = useProfile();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA state
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string, qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [is2faEnabledLocal, setIs2faEnabledLocal] = useState(false);

  useEffect(() => {
    if (profile) {
      setIs2faEnabledLocal(profile.is2faEnabled);
    }
  }, [profile]);

  const handleUpdatePassword = async () => {
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t('customer.profile.security.passwordError'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('customer.profile.security.confirmPlaceholder'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('customer.profile.security.newPlaceholder'));
      return;
    }

    try {
      setLoading(true);
      await profileService.changePassword(oldPassword, newPassword);
      showToast.success(t('customer.profile.security.passwordSuccess'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const code = err.response?.data?.code || '';
      const msg = err.response?.data?.message || t('customer.profile.security.passwordError');

      if (code === 'UNAUTHORIZED') {
        showToast.error(t('customer.profile.security.wrongPassword'));
      } else {
        showToast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const start2faSetup = async () => {
    try {
      setLoading(true);
      setError('');
      const setup = await profileService.setup2fa();
      setTwoFactorSetup(setup);
      setShow2faSetup(true);
    } catch (err) {
      showToast.error(t('customer.profile.security.twoFactor.setup.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2fa = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t('customer.profile.security.twoFactor.setup.invalid'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await profileService.enable2fa(verificationCode);
      setIs2faEnabledLocal(true);
      setShow2faSetup(false);
      showToast.success(t('customer.profile.security.twoFactor.setup.success'));
      setVerificationCode('');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('customer.profile.security.twoFactor.setup.error');
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const startDisable2fa = () => {
    setDisableCode('');
    setError('');
    setShowDisableModal(true);
  };

  const handleDisable2fa = async () => {
    if (disableCode.length !== 6) {
      setError(t('customer.profile.security.twoFactor.setup.invalid'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await profileService.disable2fa(disableCode);
      setIs2faEnabledLocal(false);
      setShowDisableModal(false);
      showToast.success(t('customer.profile.security.twoFactor.disableModal.success'));
    } catch (err: any) {
      const msg = err.response?.data?.message || t('customer.profile.security.twoFactor.setup.error');
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const kycStatus = profile?.kycStatus;
  const isKycVerified = String(kycStatus || '').toLowerCase() === 'verified';
  const securityLevel = isKycVerified ? '3' : is2faEnabledLocal ? '2' : profile?.verified ? '1' : '0';

  const sectionTitleClass = "text-lg font-bold text-[#333333] mb-6";
  const cardClass = "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all";

  return (
    <div className="space-y-8 pb-8">
      {/* 1. Trust & Verification Summary Section */}
      <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#333333] mb-1">Xác thực & Bảo mật</h3>
              <p className="text-sm text-[#666666] font-medium">Hoàn thành các cột mốc để tăng độ uy tín</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
              <div className={`w-2 h-2 rounded-full ${isKycVerified ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-[11px] font-bold text-[#333333] uppercase tracking-wider">
                LEVEL {securityLevel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                id: 'email', 
                icon: Mail, 
                label: 'Xác minh Email', 
                desc: 'Tăng tính an toàn & nhận thông báo',
                active: profile?.verified,
                action: () => {} 
              },
              { 
                id: '2fa', 
                icon: Shield, 
                label: 'Bảo mật 2FA', 
                desc: 'Bảo vệ bằng mã OTP hai lớp',
                active: is2faEnabledLocal,
                action: () => {
                  document.getElementById('2fa-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              },
              { 
                id: 'ekyc', 
                icon: Shield, 
                label: 'Xác thực eKYC', 
                desc: 'Cần thiết để trở thành Đối tác',
                active: isKycVerified,
                action: () => window.location.href = '/ekyc'
              }
            ].map((step) => (
              <div key={step.id} className={`p-6 rounded-[24px] border transition-all ${
                step.active 
                  ? 'bg-white border-green-100 shadow-sm' 
                  : 'bg-white border-transparent hover:border-blue-100 hover:shadow-md'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  step.active ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${step.active ? 'text-[#333333]' : 'text-[#666666]'}`}>
                    {step.label}
                  </span>
                  {step.active && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                
                <p className="text-[11px] text-[#999999] font-medium leading-normal mb-6">
                  {step.desc}
                </p>

                {!step.active ? (
                  <button 
                    onClick={step.action}
                    className="w-full py-2.5 rounded-xl border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    Thực hiện ngay
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-green-50 flex items-center justify-center gap-1.5 border border-green-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Đã hoàn tất</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Change Password Section */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>
           {t('customer.profile.security.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm text-[#666666] ml-1">{t('customer.profile.security.currentPassword')}</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors" />
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all text-sm font-medium"
                placeholder={t('customer.profile.security.currentPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[#666666] ml-1">{t('customer.profile.security.newPassword')}</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all text-sm font-medium"
                placeholder={t('customer.profile.security.newPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[#666666] ml-1">{t('customer.profile.security.confirmPassword')}</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all text-sm font-medium"
                placeholder={t('customer.profile.security.confirmPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-red-500 font-bold shadow-lg shadow-gray-200 hover:shadow-red-200 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {loading ? t('customer.profile.security.updating') : 'Đổi mật khẩu ngay'}
          </button>
        </div>
      </div>

      {/* 3. Two-Factor Authentication Section */}
      <div id="2fa-section" className={cardClass}>
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <h3 className="font-bold text-lg text-[#333333]">{t('customer.profile.security.twoFactor.title')}</h3>
              {is2faEnabledLocal ? (
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-100">
                  {t('customer.profile.security.twoFactor.enabled')}
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-gray-100">
                  {t('customer.profile.security.twoFactor.disabled')}
                </span>
              )}
            </div>
            <p className="text-[#666666] text-sm mb-8 leading-relaxed">
              {t('customer.profile.security.twoFactor.description')}
              <br />
              <span className="text-[11px] text-blue-500 mt-2 block font-semibold">* Khuyên dùng: Sử dụng Google Authenticator.</span>
            </p>

            <div className="flex flex-wrap gap-4">
              {is2faEnabledLocal ? (
                <button
                  onClick={startDisable2fa}
                  disabled={loading}
                  className="px-6 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white font-bold transition-all text-sm border border-red-100"
                >
                  Tắt bảo mật 2FA
                </button>
              ) : (
                <button
                  onClick={start2faSetup}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold shadow-md shadow-blue-100 transition-all flex items-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Kích hoạt 2FA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal - scaled down */}
      {show2faSetup && twoFactorSetup && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-10 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShow2faSetup(false)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-50">
                <QrCode className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-[#333333] mb-2">{t('customer.profile.security.twoFactor.setup.title')}</h2>
              <p className="text-xs text-[#666666] font-medium leading-loose">
                {t('customer.profile.security.twoFactor.setup.scanDesc')}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center mb-8">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(twoFactorSetup.qrCodeUrl)}`}
                alt="2FA QR Code"
                className="w-32 h-32 object-contain mix-blend-multiply"
              />
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                 <p className="text-[10px] font-bold text-[#999999] uppercase tracking-wider mb-2">{t('customer.profile.security.twoFactor.setup.secretCode')}</p>
                 <code className="text-xs font-mono font-bold text-blue-600 truncate block px-2">{twoFactorSetup.secret}</code>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-center text-3xl tracking-widest text-[#333333]"
                  placeholder="000 000"
                />
              </div>

              <button
                onClick={handleEnable2fa}
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl hover:bg-gray-900 font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Xác minh & Hoàn tất'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal - scaled down */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-10 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowDisableModal(false)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-[#333333] mb-2">Tắt bảo mật 2FA</h2>
              <p className="text-xs text-[#666666] font-medium leading-relaxed">
                Nhập mã 6 số từ ứng dụng để xác thực việc tắt tính năng này.
              </p>
            </div>

            <div className="space-y-8">
              <input
                type="text"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all font-bold text-center text-3xl tracking-widest text-red-500"
                placeholder="000 000"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="py-4 bg-gray-50 text-[#666666] rounded-2xl font-bold transition-all text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDisable2fa}
                  disabled={loading || disableCode.length !== 6}
                  className="py-4 bg-red-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50 text-sm"
                >
                  Xác nhận tắt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
