import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { HeroSection, FeaturedCategories, HowItWorks, TopRatedSpaces, BecomeHostCTA } from '../components';
import type { Space } from '@/types/space';
import { ROUTES } from '@/config/constants';

export function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (filters: {
    district?: string;
    date?: string;
    capacity?: string;
  }) => {
    const sp = new URLSearchParams();
    if (filters.district) sp.set('district', filters.district);
    if (filters.date) sp.set('date', filters.date);
    if (filters.capacity) sp.set('capacity', filters.capacity);
    const qs = sp.toString();
    navigate(qs ? `${ROUTES.SEARCH}?${qs}` : ROUTES.SEARCH);
  };
  const handleSpaceClick = (space: Space) =>
    navigate(`${ROUTES.SPACE_DETAIL}/${space.slug || space.id}`);

  return (
    <CustomerLayout>
      <HeroSection onSearch={handleSearch} />
      <FeaturedCategories />
      <HowItWorks />
      <TopRatedSpaces onSpaceClick={handleSpaceClick} />
      <BecomeHostCTA />
    </CustomerLayout>
  );
}
