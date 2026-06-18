import React from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Marquee from '@/components/sections/Marquee';
import BrowseIntegrations from '@/components/sections/BrowseIntegrations';
import HowItWorks from '@/components/sections/HowItWorks';
import CodeShowcase from '@/components/sections/CodeShowcase';
import CTA from '@/components/sections/CTA';

export default function Layout() {
  const containerRef = useGSAP();

  return (
    <div ref={containerRef}>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Marquee />
        <BrowseIntegrations />
        <HowItWorks />
        <CodeShowcase />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}