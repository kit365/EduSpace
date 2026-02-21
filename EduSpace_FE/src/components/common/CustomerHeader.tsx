import { useNavigate, Link } from 'react-router-dom';
import { User, Heart, MessageCircle, Calendar, PlusCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  variant?: 'home' | 'default';
}

export function CustomerHeader({ variant = 'default' }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { label: t('customer.nav.findSpace'), path: '/search' },
    { label: t('customer.nav.forHosts'), path: '/rental' },
    { label: t('customer.nav.help'), path: '/help' },
  ];

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
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-2 pr-4 h-11 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all group"
                title="Profile"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700">@minht</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}