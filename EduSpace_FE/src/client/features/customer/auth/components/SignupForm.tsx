import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, MapPin, Phone, Building2, ImageIcon, ChevronLeft } from 'lucide-react';
import { SignupFormData } from '../types';

interface SignupFormProps {
  onSignup: (data: SignupFormData) => void;
  onSwitchToLogin: () => void;
}

const initialForm = (): SignupFormData => ({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: 'guest',
  agreeToTerms: false,
  hostApplicantType: 'INDIVIDUAL',
  hostPhone: '',
  hostAddress: '',
  kycFrontUrl: '',
  kycBackUrl: '',
  kycLicenseUrl: '',
});

export function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>(initialForm());
  /** Bước 1: tài khoản | 2: thông tin host | 3: KYC (chỉ host) */
  const [step, setStep] = useState(1);

  const isHost = formData.userType === 'host';
  const maxStep = isHost ? 3 : 1;

  const goNext = () => {
    if (step === 1 && isHost) {
      setStep(2);
      return;
    }
    if (step === 2 && isHost) {
      if (!formData.hostAddress.trim()) {
        alert('Vui lòng nhập địa chỉ / khu vực hoạt động.');
        return;
      }
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Vui lòng đồng ý điều khoản');
      return;
    }
    if (isHost && step < 3) {
      goNext();
      return;
    }
    if (isHost && step === 3) {
      onSignup(formData);
      setFormData(initialForm());
      setStep(1);
      return;
    }
    onSignup(formData);
    setFormData(initialForm());
    setStep(1);
  };

  const primaryLabel =
    isHost && step === 1
      ? 'Tiếp theo — thông tin đối tác'
      : isHost && step === 2
        ? 'Tiếp theo — KYC'
        : isHost && step === 3
          ? 'Tạo tài khoản & gửi đơn'
          : 'Create Account';

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
          <span className="text-2xl font-bold text-white">E</span>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
        <p className="text-gray-600">Join EduSpace to find your perfect learning space</p>
        {isHost && (
          <p className="mt-3 text-xs font-bold text-amber-800">
            Host: bước {step}/{maxStep} — tài khoản vẫn là khách cho đến khi admin duyệt đơn &amp; bạn xác thực
            email.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyen Van A"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 outline-none focus:border-red-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 outline-none focus:border-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">I want to:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, userType: 'guest' });
                    setStep(1);
                  }}
                  className={`rounded-lg border-2 p-4 transition ${
                    formData.userType === 'guest'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="mb-1 font-semibold">Find Spaces</div>
                  <div className="text-sm text-gray-600">I&apos;m looking to rent</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'host' })}
                  className={`rounded-lg border-2 p-4 transition ${
                    formData.userType === 'host'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="mb-1 font-semibold">List My Space</div>
                  <div className="text-sm text-gray-600">I&apos;m a host</div>
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 h-4 w-4 accent-red-500"
                required
              />
              <span className="text-sm text-gray-700">
                I agree to EduSpace&apos;s{' '}
                <a href="#" className="font-semibold text-red-500 hover:text-red-600">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-red-500 hover:text-red-600">
                  Privacy Policy
                </a>
              </span>
            </label>
          </>
        )}

        {step === 2 && isHost && (
          <div className="animate-in fade-in space-y-4 duration-300">
            <h3 className="text-lg font-black text-gray-900">Thông tin đối tác</h3>
            <p className="text-sm text-gray-500">Dùng chung cho đơn gửi admin — không cần nhập lại sau.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hostApplicantType: 'INDIVIDUAL' })}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${
                  formData.hostApplicantType === 'INDIVIDUAL' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                <User className="h-6 w-6 text-red-500" />
                <span className="text-xs font-black uppercase">Cá nhân</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hostApplicantType: 'BUSINESS' })}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${
                  formData.hostApplicantType === 'BUSINESS' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                <Building2 className="h-6 w-6 text-red-500" />
                <span className="text-xs font-black uppercase">Doanh nghiệp</span>
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.hostPhone}
                  onChange={(e) => setFormData({ ...formData, hostPhone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm"
                  placeholder="090..."
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">Địa chỉ / khu vực *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  value={formData.hostAddress}
                  onChange={(e) => setFormData({ ...formData, hostAddress: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm"
                  rows={3}
                  placeholder="Số nhà, quận, TP..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && isHost && (
          <div className="animate-in fade-in space-y-4 duration-300">
            <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
              <ImageIcon className="h-5 w-5 text-red-500" />
              KYC (tạm: URL ảnh)
            </h3>
            <p className="text-sm text-gray-500">
              Dán link ảnh (hoặc để trống nếu chưa có). Sau có thể bổ sung trên trang đối tác.
            </p>
            <input
              type="url"
              placeholder="URL CCCD mặt trước"
              value={formData.kycFrontUrl}
              onChange={(e) => setFormData({ ...formData, kycFrontUrl: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            />
            <input
              type="url"
              placeholder="URL CCCD mặt sau"
              value={formData.kycBackUrl}
              onChange={(e) => setFormData({ ...formData, kycBackUrl: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            />
            {formData.hostApplicantType === 'BUSINESS' && (
              <input
                type="url"
                placeholder="URL giấy phép KD (tuỳ chọn)"
                value={formData.kycLicenseUrl}
                onChange={(e) => setFormData({ ...formData, kycLicenseUrl: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-3 font-semibold text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-lg bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
          >
            {primaryLabel}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-red-500 hover:text-red-600"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
