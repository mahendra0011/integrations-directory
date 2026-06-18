import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INTEGRATIONS } from '@/data/integrations';
import IntegrationCard from '@/components/integrations/IntegrationCard';
import Navbar from '@/components/layout/Navbar';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  { key: 'all',       icon: '⚡', label: 'All Integrations' },
  { key: 'auth',      icon: '🔐', label: 'Authentication' },
  { key: 'payments',  icon: '💳', label: 'Payments' },
  { key: 'ai',        icon: '🤖', label: 'AI & ML' },
  { key: 'database',  icon: '🗄️', label: 'Database' },
  { key: 'storage',   icon: '📁', label: 'Storage' },
  { key: 'realtime',  icon: '⚡', label: 'Realtime' },
  { key: 'email',     icon: '📧', label: 'Email' },
  { key: 'search',    icon: '🔍', label: 'Search' },
  { key: 'maps',      icon: '📍', label: 'Maps & Location' },
  { key: 'analytics', icon: '📊', label: 'Analytics' },
  { key: 'deployment',icon: '🚀', label: 'Deployment' },
];

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  let filtered = activeCat === 'all'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(d => d.cat === activeCat);

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      d.cat.toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Header with search */}
      <div className="pt-24 pb-6 px-8 border-b border-border">
        <div className="max-w-[1150px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black">
                ⚡ Integrations
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Browse our collection of production-ready integrations for MERN Stack developers
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-3 mb-5 transition-all focus-within:border-brand-accent focus-within:shadow-[0_0_0_4px_#EEF2FF]">
            <Search size={22} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search integrations by name, category, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-gray-400 font-sans"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-gray-400 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCat(cat.key)}
                className={`py-2.5 px-5 rounded-full border text-sm font-medium cursor-pointer font-sans transition-all ${
                  activeCat === cat.key
                    ? 'bg-black border-black text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-[1150px] mx-auto">
          <p className="text-sm text-gray-400 font-mono mb-6">
            {'// ' + filtered.length + ' integration' + (filtered.length !== 1 ? 's' : '') + ' found'}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-black mb-2">No integrations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
              {filtered.map(item => (
                <IntegrationCard
                  key={item.id}
                  integration={item}
                  onClick={(id) => navigate(`/integration/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
