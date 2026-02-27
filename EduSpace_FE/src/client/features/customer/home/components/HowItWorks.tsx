import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, Star, Building, ShieldCheck, Banknote } from 'lucide-react';

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'renters' | 'hosts'>('renters');
  const { t } = useTranslation();

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl text-center mb-12">{t('customer.home.howItWorks.title')}</h2>

        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveTab('renters')}
            className={`px-6 py-2 rounded-full ${activeTab === 'renters'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            {t('customer.home.howItWorks.forRenters')}
          </button>
          <button
            onClick={() => setActiveTab('hosts')}
            className={`px-6 py-2 rounded-full ${activeTab === 'hosts'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            {t('customer.home.howItWorks.forHosts')}
          </button>
        </div>

        {activeTab === 'renters' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center group">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500 transition-colors duration-300">
                <Search className="w-8 h-8 text-red-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-2 font-bold">{t('customer.home.howItWorks.step1Title')}</h3>
              <p className="text-gray-600">
                {t('customer.home.howItWorks.step1Desc')}
              </p>
            </div>

            <div className="text-center group flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500 transition-colors duration-300">
                <Calendar className="w-8 h-8 text-red-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-2 font-bold">{t('customer.home.howItWorks.step2Title')}</h3>
              <p className="text-gray-600">
                {t('customer.home.howItWorks.step2Desc')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500 transition-colors duration-300">
                <Star className="w-8 h-8 text-red-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-2 font-bold">{t('customer.home.howItWorks.step3Title')}</h3>
              <p className="text-gray-600">
                {t('customer.home.howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                <Building className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-2 font-bold">{t('customer.home.howItWorks.hostStep1Title')}</h3>
              <p className="text-gray-600">
                {t('customer.home.howItWorks.hostStep1Desc')}
              </p>
            </div>

            <div className="text-center group flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                <ShieldCheck className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-2 font-bold">{t('customer.home.howItWorks.hostStep2Title')}</h3>
              <p className="text-gray-600">
                {t('customer.home.howItWorks.hostStep2Desc')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                <Banknote className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-2 font-bold">{t('customer.home.howItWorks.hostStep3Title')}</h3>
              <p className="text-gray-600">
                {t('customer.home.howItWorks.hostStep3Desc')}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
