import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, SignupForm } from '../components';
import { LoginFormData, SignupFormData } from '../types';

export function AuthPage() {
  const navigate = useNavigate();
  const onAuthSuccess = () => navigate('/');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleLogin = (data: LoginFormData) => {
    console.log('Login:', data);
    // In a real app, this would call an API
    onAuthSuccess();
  };

  const handleSignup = (data: SignupFormData) => {
    console.log('Signup:', data);
    // In a real app, this would call an API
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
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
          {mode === 'login' ? (
            <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
