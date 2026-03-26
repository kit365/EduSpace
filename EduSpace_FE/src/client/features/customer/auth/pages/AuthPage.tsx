import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { LoginForm, SignupForm } from '../components';
import { LoginFormData, SignupFormData } from '../types';
import { useLogin, useRegister } from '../hooks/useAuth';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';

export function AuthPage() {
  const navigate = useNavigate();
  const onAuthSuccess = () => navigate('/');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showOtp, setShowOtp] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData | null>(null);
  const [otpValue, setOtpValue] = useState('');

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: register } = useRegister();

  const handleLogin = (data: LoginFormData) => {
    const payload = {
      email: data.email,
      password: data.password,
      otp: otpValue || undefined
    };

    login(
      payload,
      {
        onSuccess: (res) => {
          toast.success(res.message || 'Login successful!');
          onAuthSuccess();
        },
        onError: (err: any) => {
          const code = err.response?.data?.code;
          if (code === 'REQUIRE_2FA') {
            setShowOtp(true);
            setLoginData(data);
            toast.info('Please enter your 2FA code');
          } else if (code === 'INVALID_2FA_CODE') {
            toast.error('Invalid 2FA code. Please try again.');
          } else if (code === 'EMAIL_NOT_VERIFIED') {
            toast.error(
              err.response?.data?.message ||
                'Vui lòng xác thực email trước khi đăng nhập (kiểm tra hộp thư).',
            );
          } else if (code === 'KEYCLOAK_UNAVAILABLE') {
            toast.error(
              err.response?.data?.message ||
                'Không kết nối được Keycloak. Chạy Keycloak (docker compose) và kiểm tra KEYCLOAK_SERVER_URL / cổng.',
            );
          } else {
            toast.error(err.response?.data?.message || err.message || 'Login failed');
          }
        },
      }
    );
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData) {
      handleLogin(loginData);
    }
  };

  const handleSignup = (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    register(
      {
        email: data.email,
        password: data.password,
        fullName: data.name,
        ...(data.userType === 'host' && {
          hostPartnerApplication: {
            applicantType: data.hostApplicantType,
            phone: data.hostPhone.trim() || undefined,
            address: data.hostAddress.trim(),
            documentFrontUrl: data.kycFrontUrl.trim() || undefined,
            documentBackUrl: data.kycBackUrl.trim() || undefined,
            businessLicenseUrl:
              data.hostApplicantType === 'BUSINESS' ? data.kycLicenseUrl.trim() || undefined : undefined,
          },
        }),
      },
      {
        onSuccess: (res) => {
          if (data.userType === 'host') {
            toast.success(
              res.message ||
                'Đã tạo tài khoản & gửi đơn đối tác. Kiểm tra email để xác thực — bạn vẫn là khách cho đến khi admin duyệt.',
            );
          } else {
            toast.success(res.message || 'Registration successful! Please login.');
          }
          setMode('login');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || err.message || 'Registration failed');
        },
      }
    );
  };

  return (
    <CustomerLayout>
      <div className="bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Illustration/Branding */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl p-12 shadow-xl">
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  <span className="font-bold text-2xl">EduSpace</span>
                </div>
                <p className="text-gray-600 text-lg mb-8">
                  Nền tảng kết nối không gian giáo dục hàng đầu Việt Nam
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">1000+ Không gian</div>
                    <div className="text-sm text-gray-600">Phòng học đa dạng khắp TP.HCM</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Đặt phòng nhanh</div>
                    <div className="text-sm text-gray-600">Xác nhận ngay lập tức</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">An toàn & Tin cậy</div>
                    <div className="text-sm text-gray-600">Thanh toán bảo mật 100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {showOtp ? (
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                    <Shield className="text-white w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">2FA Verification</h1>
                  <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-center text-3xl tracking-[0.5em] text-blue-600 shadow-inner"
                    placeholder="000000"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={isLoggingIn || otpValue.length !== 6}
                    className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-70 shadow-lg shadow-blue-100"
                  >
                    {isLoggingIn ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtp(false);
                      setOtpValue('');
                    }}
                    className="w-full text-gray-500 text-sm font-semibold hover:text-gray-700"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            ) : mode === 'login' ? (
              <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
