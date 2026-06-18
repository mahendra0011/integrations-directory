import React from 'react';
import { INTEGRATIONS, CAT_META } from '@/data/integrations';

const BADGE_STYLES = {
  popular: 'bg-[#22D3EE] text-[#1A1A22]',
  new: 'bg-[#6366F1] text-white',
  free: 'bg-[#6B7280] text-white',
};

const BADGE_LABELS = {
  popular: '✦ Popular',
  new: '✨ New',
  free: '○ Free',
};

function CodePreview({ lines }) {
  if (!lines || lines.length === 0) {
    return (
      <div className="bg-[#1A1A22] rounded-[10px] overflow-hidden mb-4 border border-white/[0.06] shadow-inner">
        <div className="flex items-center gap-[5px] px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
          <div className="w-[7px] h-[7px] rounded-full bg-[#FF5F57]" />
          <div className="w-[7px] h-[7px] rounded-full bg-[#FFBC2E]" />
          <div className="w-[7px] h-[7px] rounded-full bg-[#28C840]" />
          <span className="ml-2 text-[10px] text-white/20 font-mono">code.js</span>
        </div>
        <div className="p-3 px-[14px]">
          <span className="font-mono text-[11.5px] leading-[1.9] block text-white/30 italic">
            <span className="text-white/15 mr-3 select-none"> 1</span>
            {'// Ready-to-use code in detail page'}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#1A1A22] rounded-[10px] overflow-hidden mb-4 border border-white/[0.06] shadow-inner">
      <div className="flex items-center gap-[5px] px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
        <div className="w-[7px] h-[7px] rounded-full bg-[#FF5F57]" />
        <div className="w-[7px] h-[7px] rounded-full bg-[#FFBC2E]" />
        <div className="w-[7px] h-[7px] rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] text-white/20 font-mono">code.js</span>
      </div>
      <div className="p-3 px-[14px]">
        {lines.slice(0, 3).map((line, i) => {
          let parts = [];
          if (!line) return null;
          if (line.startsWith('import ') || line.startsWith("const ")) {
            const keyword = line.startsWith('import ') ? 'import' : 'const';
            parts.push(
              <span key="kw" className="text-[#C792EA]">{keyword}</span>,
              <span key="rest" className="text-white/70">{line.slice(keyword.length)}</span>
            );
          } else if (line.includes('function ') || line.includes('async ')) {
            parts.push(
              <span key="pre" className="text-[#C792EA]">{line.split('function')[0]}</span>,
              <span key="fn" className="text-[#82AAFF]">function</span>,
              <span key="rest" className="text-white/70">{line.split('function')[1]}</span>
            );
          } else if (line.startsWith('//')) {
            parts.push(<span key="comment" className="text-white/30 italic">{line}</span>);
          } else {
            parts.push(<span key="line" className="text-white/70">{line}</span>);
          }
          return (
            <span key={i} className="font-mono text-[11.5px] leading-[1.9] block whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-white/15 mr-3 select-none">{String(i + 1).padStart(2, ' ')}</span>
              {parts}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function IntegrationCard({ integration, onClick }) {
  if (!integration) return null;
  const { id, name, cat, icon, badge, sideHeading, tags, code } = integration;
  const category = CAT_META[cat];
  const safeCode = code || [];
  const safeTags = tags || [];

  return (
    <div
      className="bg-[#2D2D35] border border-white/[0.08] rounded-[16px] p-6 no-underline text-inherit transition-all duration-300 relative overflow-hidden cursor-pointer block shadow-[0_2px_12px_rgba(0,0,0,.12)] hover:border-white/[0.18] hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,.30)]"
      onClick={() => onClick(id)}
    >
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22D3EE] via-[#C792EA] to-[#22D3EE] opacity-50" />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4 relative z-[1]">
        <div className="w-11 h-11 rounded-[12px] bg-white/[0.07] flex items-center justify-center text-[20px] ring-1 ring-white/[0.06]">
          {icon || '🔧'}
        </div>
        {badge && (
          <span className={`text-[10px] font-bold font-mono py-[5px] px-2.5 rounded-[6px] tracking-wide ${BADGE_STYLES[badge] || 'bg-[#6B7280] text-white'}`}>
            {BADGE_LABELS[badge] || badge}
          </span>
        )}
      </div>

      {/* Name & Category inline */}
      <div className="flex items-center gap-2 mb-3 relative z-[1]">
        <div className="text-[15px] font-bold text-white tracking-tight">
          {name}
        </div>
        <span className="text-[10px] text-white/25 font-mono uppercase tracking-[.6px] bg-white/[0.05] px-2 py-0.5 rounded-[4px]">
          {category?.icon} {category?.label || cat}
        </span>
      </div>

      {/* Description */}
      <div className="text-[13px] text-white/50 leading-[1.7] mb-[18px] relative z-[1]">
        {sideHeading}
      </div>

      {/* Code preview */}
      <CodePreview lines={safeCode} />

      {/* Footer */}
      <div className="flex items-center justify-between relative z-[1]">
        <div className="flex gap-1.5 flex-wrap">
          {safeTags.slice(0, 3).map((tag) => (
            <span key={tag} className="font-mono text-[9.5px] py-[4px] px-[10px] rounded-[5px] bg-white/[0.06] text-white/40 border border-white/[0.06] tracking-wide">
              {tag}
            </span>
          ))}
        </div>
        <div className="w-[30px] h-[30px] rounded-[8px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 text-[14px] transition-all duration-300 shrink-0 hover:bg-[#22D3EE] hover:text-[#1A1A22] hover:border-[#22D3EE] hover:translate-x-0.5 hover:-translate-y-0.5 group-hover:bg-[#22D3EE]">
          ↗
        </div>
      </div>
    </div>
  );
}