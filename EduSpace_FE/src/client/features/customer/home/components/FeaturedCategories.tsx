import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FEATURED_CATEGORIES } from '../data/mockData';

export function FeaturedCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Map category IDs to translation keys
  const categoryTranslations: Record<number, { name: string; description: string }> = {
    1: { name: t('customer.home.categories.meetingRooms'), description: t('customer.home.categories.meetingDesc') },
    2: { name: t('customer.home.categories.classrooms'), description: t('customer.home.categories.classroomsDesc') },
    3: { name: t('customer.home.categories.halls'), description: t('customer.home.categories.hallsDesc') },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl">{t('customer.home.categories.title')}</h2>
        <button
          onClick={() => navigate('/search')}
          className="text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
        >
          {t('customer.home.categories.viewAll')}
          <ArrowRight className="w-4 h-4 ml-1 hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_CATEGORIES.map((category) => {
          const translated = categoryTranslations[category.id];
          return (
            <div
              key={category.id}
              onClick={() => navigate('/search')}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img
                src={category.image}
                alt={translated?.name || category.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <span className="text-white/80 text-sm mb-1">{category.count}</span>
                <h3 className="text-white text-2xl mb-1">{translated?.name || category.name}</h3>
                <p className="text-white/90 text-sm">{translated?.description || category.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
