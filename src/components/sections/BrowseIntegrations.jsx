import React, { useState } from 'react';
import { INTEGRATIONS, FILTER_CATEGORIES } from '@/data/integrations';
import IntegrationGrid from '@/components/integrations/IntegrationGrid';
import FilterPills from '@/components/shared/FilterPills';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function BrowseIntegrations() {
  const [activeFilter, setActiveFilter] = useState('all');
  const ref = useScrollReveal();

  return (
    <section id="browse" className="relative z-[2] pt-[100px] pb-[100px] px-10 bg-gray-50">
      {/* Header */}
      <div ref={ref} className="reveal max-w-[1150px] mx-auto flex items-end justify-between mb-9">
        <div>
          <div className="section-label">          {'// directory'}</div>
          <h2 className="text-[clamp(30px,4vw,46px)] font-extrabold tracking-[-1.5px] text-black mt-2.5">
            Browse Integrations
          </h2>
        </div>
        <a
          href="/integrations"
          className="inline-flex items-center gap-2 h-11 px-6 bg-black text-white text-[14px] font-semibold rounded-full no-underline hover:bg-[#2D2D35] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.15)] transition-all duration-300 shrink-0"
        >
          View All Integrations →
        </a>
      </div>

      {/* Filter Pills */}
      <FilterPills
        categories={FILTER_CATEGORIES}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Integration Cards Grid - Show 6 cards on home page */}
      <IntegrationGrid
        integrations={INTEGRATIONS}
        filter={activeFilter}
        limit={6}
      />
    </section>
  );
}
