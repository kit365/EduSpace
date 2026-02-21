import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { SignupFormData } from '../types';

interface SignupFormProps {
  onSignup: (data: SignupFormData) => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'guest',
    agreeToTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to terms and conditions');
      return;
    }
    onSignup(formData);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
          <span className="text-white font-bold text-2xl">E</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-600">Join EduSpace to find your perfect learning space</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nguyen Van A"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* User Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">I want to:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, userType: 'guest' })}
              className={`p-4 border-2 rounded-lg transition ${
                formData.userType === 'guest'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold mb-1">Find Spaces</div>
              <div className="text-sm text-gray-600">I'm looking to rent</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, userType: 'host' })}
              className={`p-4 border-2 rounded-lg transition ${
                formData.userType === 'host'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold mb-1">List My Space</div>
              <div className="text-sm text-gray-600">I'm a host</div>
            </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            className="w-4 h-4 mt-1 accent-red-500"
            required
          />
          <span className="text-sm text-gray-700">
            I agree to EduSpace's{' '}
            <a href="#" className="text-red-500 hover:text-red-600 font-semibold">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-red-500 hover:text-red-600 font-semibold">Privacy Policy</a>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Create Account
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-red-500 hover:text-red-600 font-semibold"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
