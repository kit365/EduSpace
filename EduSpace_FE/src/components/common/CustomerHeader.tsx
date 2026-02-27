import { useNavigate, Link } from 'react-router-dom';
import { User, Heart, MessageCircle, Calendar, PlusCircle, HelpCircle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationDropdown } from '../../client/features/customer/notifications/components/NotificationDropdown';

interface HeaderProps {
  variant?: 'home' | 'default';
}

export function CustomerHeader({ variant = 'default' }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock authentication role for demonstration
  // In a real app, this would come from an AuthContext (e.g., const { user } = useAuth(); const isHost = user?.role === 'host')
  const isHost = false;

  const navItems = [
    { label: t('customer.nav.findSpace'), path: '/search', show: true },
    { label: t('customer.nav.forHosts'), path: '/rental', show: isHost },
    { label: t('customer.nav.help'), path: '/help', show: true },
  ].filter(item => item.show);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-red-200">
              <span className="text-white font-black text-xl">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-gray-900 leading-none">EduSpace</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Premium Venues</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-sm font-bold text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth & User Menu */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button
                onClick={() => navigate('/favorites')}
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-red-500"
                title="Favorites"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/messages')}
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-blue-500 relative"
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-green-500"
                title="My Bookings"
              >
                <Calendar className="w-5 h-5" />
              </button>

              <NotificationDropdown />

              <div className="w-px h-6 bg-gray-200 mx-1" />

              <div className="relative group">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 pl-2 pr-4 h-11 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-100 transition-all group-hover:border-red-500"
                  title="Profile"
                >
                  <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">@minht</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pt-2">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ring-4 ring-black/5">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-all text-left"
                    >
                      <User className="w-4 h-4" />
                      Trang cá nhân
                    </button>
                    <div className="h-px bg-gray-100 mx-2" />
                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}