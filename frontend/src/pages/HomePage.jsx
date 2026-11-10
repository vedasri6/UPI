import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import FeaturesPreview from '../components/FeaturesPreview';
import ScamAwarenessSection from '../components/ScamAwarenessSection';
import UpiSafetyGuide from '../components/UpiSafetyGuide';
import WhyThisWebsite from '../components/WhyThisWebsite';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300">
      <Navbar />
      <main>
        <Hero />
        <StatsSection />
        <FeaturesPreview />
        <ScamAwarenessSection />
        <UpiSafetyGuide />
        <WhyThisWebsite />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
