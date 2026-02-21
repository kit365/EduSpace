import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { HeroSection, FeaturedCategories, HowItWorks, TopRatedSpaces, BecomeHostCTA } from '../components';

export function HomePage() {
  const navigate = useNavigate();

  const handleSearch = () => navigate('/search');
  const handleSpaceClick = (id: number) => navigate(`/spaces/${id}`);

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
