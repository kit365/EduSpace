import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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
  agreeToTerms: false,
});

export function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>(initialForm());

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

    onSignup(formData);
    setFormData(initialForm());
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
          <span className="text-2xl font-bold text-white">E</span>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
        <p className="text-gray-600">Join EduSpace to find your perfect learning space</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          className="w-full rounded-lg bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
        >
          Create Account
        </button>

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
