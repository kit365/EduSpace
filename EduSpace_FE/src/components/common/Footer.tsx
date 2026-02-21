import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Linkedin, Youtube, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">EduSpace</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.explore')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/search" className="hover:text-white transition">{t('footer.findClassroom')}</Link></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.corporateEvents')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.spacesTrusted')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.pricingPlans')}</a></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.hosting')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/list-space" className="hover:text-white transition">{t('footer.becomeHost')}</Link></li>
              <li><Link to="/host" className="hover:text-white transition">{t('footer.hostDashboard')}</Link></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.resources')}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-white transition">{t('footer.helpCenter')}</Link></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.safetyHub')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.cancellationPolicy')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('footer.termsOfService')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 EduSpace Inc. {t('footer.allRightsReserved')}
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition">{t('footer.cookiePolicy')}</a>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <Link
        to="/list-space"
        className="fixed bottom-8 right-8 bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl hover:bg-red-600 transition-all flex items-center gap-2 font-black z-40 active:scale-95"
      >
        {t('customer.nav.listSpace')}
        <ChevronRight className="w-5 h-5" />
      </Link>
    </footer>
  );
}
