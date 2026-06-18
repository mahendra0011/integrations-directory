import React from 'react';
import { STATS } from '@/data/integrations';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Stats() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="reveal relative z-[3] border-t border-b border-border bg-white">
      <div className="stats-inner max-w-[1000px] mx-auto grid grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat py-9 px-6 text-center border-r border-border last:border-r-0">
            <span
              className="stat-n block text-[44px] font-black tracking-[-2px] text-black leading-none mb-2"
              data-target={stat.target}
              data-suffix={stat.suffix}
            >
              0
            </span>
            <div className="stat-l text-[12.5px] text-gray-500 font-mono font-medium tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}