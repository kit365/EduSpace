import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { HeroSection, FeaturedCategories, HowItWorks, TopRatedSpaces, BecomeHostCTA } from '../components';
import type { Space } from '@/types/space';

export function HomePage() {
  const navigate = useNavigate();

  const handleSearch = () => navigate('/search');
  const handleSpaceClick = (space: Space) =>
    navigate(`/${encodeURIComponent(String(space.slug ?? space.id))}`);

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
