import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function FilterPills({ categories, activeFilter, onFilterChange }) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="reveal max-w-[1150px] mx-auto mb-10 flex flex-wrap gap-2.5">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onFilterChange(cat.key)}
          className={`flex items-center gap-[7px] py-[9px] px-[18px] bg-white border border-border rounded-full text-[13px] font-medium cursor-pointer transition-all duration-300 shadow-sm ${
            activeFilter === cat.key
              ? 'bg-black border-black text-white'
              : 'text-gray-600 hover:bg-black hover:border-black hover:text-white'
          }`}
        >
          {cat.icon} {cat.label}{' '}
          <span
            className={`font-mono text-[10px] py-0.5 px-2 rounded-full ${
              activeFilter === cat.key
                ? 'bg-white/15 text-white/80'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {cat.count}
          </span>
        </button>
      ))}
    </div>
  );
}