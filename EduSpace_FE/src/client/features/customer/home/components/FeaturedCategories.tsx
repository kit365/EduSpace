import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFeaturedCategories } from '../../spaces/hooks/useSpaces';

export function FeaturedCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: displayCategories, loading } = useFeaturedCategories();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-900">{t('customer.home.categories.title')}</h2>
        <button
          onClick={() => navigate('/search')}
          className="text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
        >
          {t('customer.home.categories.viewAll')}
          <ArrowRight className="w-4 h-4 ml-1 hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/${category.slug}`)}
            className="relative rounded-2xl overflow-hidden group cursor-pointer h-80 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-white text-3xl font-black mb-2">{category.name}</h3>
              <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
