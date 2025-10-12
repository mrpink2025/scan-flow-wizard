import { CorpMonitorHeader } from '@/components/branding/CorpMonitorHeader';
import { CorpMonitorFooter } from '@/components/branding/CorpMonitorFooter';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <CorpMonitorHeader />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <TestimonialsSection />
        <CTASection />
      </main>
      <CorpMonitorFooter />
    </div>
  );
};

export default Home;
