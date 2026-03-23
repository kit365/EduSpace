import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { HeroSection, FeaturedCategories, HowItWorks, TopRatedSpaces, PromotedSpaces, BecomeHostCTA } from '../components';
import type { Space } from '@/types/space';
import { ROUTES } from '@/config/constants';

export function HomePage() {
  const navigate = useNavigate();

  const handleSearch = () => navigate(ROUTES.SEARCH);
  const handleSpaceClick = (space: Space) =>
    navigate(`${ROUTES.SPACE_DETAIL}/${space.slug || space.id}`);

  return (
    <CustomerLayout>
      <HeroSection onSearch={handleSearch} />
      <FeaturedCategories />
      <HowItWorks />
      <TopRatedSpaces onSpaceClick={handleSpaceClick} />
      <PromotedSpaces onSpaceClick={handleSpaceClick} />
      <BecomeHostCTA />
    </CustomerLayout>
  );
}
