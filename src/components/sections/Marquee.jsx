import React from 'react';
import { MARQUEE_ITEMS } from '@/data/integrations';

export default function Marquee() {
  // Duplicate items for seamless infinite scroll
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="relative z-[2] py-[52px] border-b border-border overflow-hidden bg-white">
      <div className="marquee-label text-center text-[11px] font-semibold text-gray-400 tracking-[2px] uppercase mb-7 font-mono">
        Trusted by Developers Building Modern SaaS
      </div>
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[120px] z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, white, transparent)' }}
        />
        <div
          className="absolute top-0 bottom-0 right-0 w-[120px] z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, white, transparent)' }}
        />
        {/* Track */}
        <div className="flex gap-3 w-max animate-marquee hover:[animation-play-state:paused]">
          {items.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="flex items-center gap-[9px] py-[10px] px-[22px] bg-white border border-border rounded-full whitespace-nowrap text-[13.5px] font-medium text-gray-700 cursor-pointer transition-all duration-200 shrink-0 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:text-black hover:-translate-y-px hover:shadow-md"
            >
              <span className="text-[17px]">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}