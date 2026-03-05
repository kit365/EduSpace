import { Lock, Shield, Loader2, CheckCircle, X, QrCode } from 'lucide-react';
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
      setError(t('customer.profile.security.confirmPlaceholder')); // Actually should be a mismatch error
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

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div>
        <h3 className="font-black mb-6 text-2xl tracking-tight text-gray-900">{t('customer.profile.security.title')}</h3>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-500 text-sm font-bold border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-400 ml-1">{t('customer.profile.security.currentPassword')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors z-10" />
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
                placeholder={t('customer.profile.security.currentPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-400 ml-1">{t('customer.profile.security.newPassword')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors z-10" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
                placeholder={t('customer.profile.security.newPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-400 ml-1">{t('customer.profile.security.confirmPassword')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors z-10" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-700 shadow-inner"
                placeholder={t('customer.profile.security.confirmPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="px-10 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 font-black shadow-xl shadow-red-200 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('customer.profile.security.updating')}
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {t('customer.profile.security.update')}
            </>
          )}
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-t border-gray-100 pt-10 mt-10">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-xl text-gray-900 tracking-tight">{t('customer.profile.security.twoFactor.title')}</h3>
              <div className="flex items-center gap-3">
                {is2faEnabledLocal ? (
                  <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">
                    {t('customer.profile.security.twoFactor.enabled')}
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-gray-100">
                    {t('customer.profile.security.twoFactor.disabled')}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-500 font-medium mb-6 leading-relaxed max-w-xl">
              {t('customer.profile.security.twoFactor.description')}
            </p>

            {is2faEnabledLocal ? (
              <button
                onClick={startDisable2fa}
                disabled={loading}
                className="px-6 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 font-black transition-all active:scale-95 border border-red-100"
              >
                {t('customer.profile.security.twoFactor.disable')}
              </button>
            ) : (
              <button
                onClick={start2faSetup}
                disabled={loading}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-black shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {t('customer.profile.security.twoFactor.enable')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2faSetup && twoFactorSetup && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShow2faSetup(false)}
              className="absolute right-8 top-8 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <QrCode className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('customer.profile.security.twoFactor.setup.title')}</h2>
              <p className="text-gray-500 font-medium">
                {t('customer.profile.security.twoFactor.setup.scanDesc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border-4 border-dashed border-gray-50 flex items-center justify-center mb-8 bg-slate-50/30">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(twoFactorSetup.qrCodeUrl)}`}
                alt="2FA QR Code"
                className="w-48 h-48 object-contain mix-blend-multiply"
              />
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('customer.profile.security.twoFactor.setup.secretCode')}</p>
                <code className="text-sm font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg break-all select-all tracking-wider">{twoFactorSetup.secret}</code>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-3 text-gray-400 text-center">{t('customer.profile.security.twoFactor.setup.enterCode')}</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-center text-3xl tracking-[0.3em] text-blue-600 shadow-inner"
                  placeholder="000 000"
                />
              </div>

              <button
                onClick={handleEnable2fa}
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-5 bg-blue-500 text-white rounded-[24px] hover:bg-blue-600 font-black shadow-2xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 h-16"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (t('customer.profile.security.twoFactor.setup.verify'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowDisableModal(false)}
              className="absolute right-8 top-8 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-red-100">
                <Shield className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('customer.profile.security.twoFactor.disableModal.title')}</h2>
              <p className="text-gray-500 font-medium">
                {t('customer.profile.security.twoFactor.disableModal.desc')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-500 text-sm font-black border border-red-100 flex items-center gap-3">
                <X className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-3 text-gray-400 text-center">
                  {t('customer.profile.security.twoFactor.setup.enterCode')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-black text-center text-3xl tracking-[0.3em] text-red-600 shadow-inner"
                  placeholder="000 000"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="py-5 bg-gray-100 text-gray-600 rounded-2xl font-black transition-all active:scale-95 hover:bg-gray-200"
                >
                  {t('customer.profile.personal.cancel')}
                </button>
                <button
                  onClick={handleDisable2fa}
                  disabled={loading || disableCode.length !== 6}
                  className="py-5 bg-red-500 text-white rounded-2xl font-black shadow-2xl shadow-red-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t('customer.profile.security.twoFactor.disableModal.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
