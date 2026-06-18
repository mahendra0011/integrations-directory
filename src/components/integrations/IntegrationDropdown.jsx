import React, { useState, useRef, useEffect } from 'react';
import { INTEGRATIONS, CAT_META } from '@/data/integrations';
import IntegrationModal from './IntegrationModal';
import { ChevronDown, Search } from 'lucide-react';

const DROPDOWN_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'auth', label: '🔐 Auth' },
  { key: 'payments', label: '💳 Payments' },
  { key: 'ai', label: '🤖 AI' },
  { key: 'database', label: '🗄️ Database' },
  { key: 'storage', label: '📁 Storage' },
  { key: 'realtime', label: '⚡ Realtime' },
];

export default function IntegrationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const dropRef = useRef(null);

  const items =
    activeCat === 'all'
      ? INTEGRATIONS
      : INTEGRATIONS.filter((d) => d.cat === activeCat);

  const filtered = items.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.cat.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={dropRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 h-10 px-[18px] bg-black border-none rounded-full cursor-pointer font-sans text-[13.5px] font-semibold text-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,.1)] hover:bg-[#2D2D35] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,.18)]"
        >
          ⚡ Integrations{' '}
          <span className="bg-white/18 text-white text-[10px] font-bold py-0.5 px-2 rounded-full font-mono">
            10
          </span>
          <ChevronDown
            size={10}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[54px] right-0 w-[560px] bg-white border border-border rounded-[16px] p-[18px] shadow-[0_20px_60px_rgba(0,0,0,.14)] z-[999]">
            {/* Search */}
            <div className="flex items-center gap-2.5 bg-gray-50 border border-border rounded-[10px] px-3.5 mb-3.5 transition-colors focus-within:border-brand-accent focus-within:shadow-[0_0_0_3px_#EEF2FF]">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none py-2.5 font-sans text-[13.5px] text-foreground placeholder:text-gray-400"
              />
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {DROPDOWN_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCat(cat.key)}
                  className={`py-[5px] px-3.5 rounded-full border text-xs font-medium cursor-pointer font-sans transition-all ${
                    activeCat === cat.key
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-border text-gray-600 hover:bg-black hover:border-black hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto pr-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-[10px] text-gray-700 text-[13.5px] font-medium cursor-pointer hover:bg-gray-50 hover:text-black transition-all"
                  onClick={() => {
                    setSelectedId(item.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-[30px] h-[30px] rounded-lg bg-gray-100 flex items-center justify-center text-[15px] shrink-0">
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <IntegrationModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}