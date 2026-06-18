import React, { useEffect } from 'react';
import { INTEGRATIONS, CAT_META } from '@/data/integrations';
import { X } from 'lucide-react';

export default function IntegrationModal({ id, onClose }) {
  const data = INTEGRATIONS.find((i) => i.id === id);
  const steps = data?.steps || data?.fullSteps?.slice(0, 5) || data?.workflowSteps?.slice(0, 5) || [];

  useEffect(() => {
    if (!data) return undefined;

    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [data, onClose]);

  if (!data) return null;

  const category = CAT_META[data.cat];

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-[6px] flex items-center justify-center p-10 max-sm:p-5 animate-[fadeIn_0.25s_ease]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ animation: 'fadeIn 0.25s ease' }}
    >
      <div
        className="w-full max-w-[720px] max-h-[85vh] bg-white rounded-[20px] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,.3)] relative animate-[modalIn_0.35s_cubic-bezier(.4,0,.2,1)]"
        style={{ animation: 'modalIn 0.35s cubic-bezier(.4,0,.2,1)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-4 z-10 float-right mr-4 mt-4 w-9 h-9 rounded-[10px] bg-white border border-border flex items-center justify-center text-lg cursor-pointer text-gray-500 hover:bg-gray-50 hover:text-black transition-all"
        >
          <X size={18} />
        </button>

        {/* Hero */}
        <div className="px-8 pt-4 pb-7">
          <div className="w-[72px] h-[72px] rounded-[18px] bg-gray-100 flex items-center justify-center text-[34px] mb-5">
            {data.icon}
          </div>
          <div className="text-[32px] font-black tracking-[-1px] text-black mb-1.5">
            {data.name}
          </div>
          <div className="text-[15px] text-brand-accent font-semibold mb-4">
            {data.sideHeading}
          </div>
          <div className="flex gap-2 flex-wrap mb-5">
            <span className="py-[5px] px-3.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium font-mono">
              {category?.icon} {category?.label}
            </span>
            {data.badge && (
              <span className="py-[5px] px-3.5 rounded-full bg-black text-white text-xs font-medium font-mono uppercase">
                {data.badge}
              </span>
            )}
          </div>
        </div>

        {/* About */}
        <div className="px-8 pb-6">
          <h3 className="text-lg font-bold text-black mb-3 tracking-tight">
            About {data.name}
          </h3>
          <p className="text-sm text-gray-500 leading-[1.8] mb-4">{data.desc}</p>
          <p className="text-sm text-gray-500 leading-[1.8]">{data.explanation}</p>
        </div>

        {/* Code */}
        <div className="px-8 pb-6">
          <h3 className="text-lg font-bold text-black mb-3 tracking-tight">
            Code Snippet
          </h3>
        </div>
        <div className="mx-8 mb-6 bg-[#2D2D35] rounded-xl overflow-hidden">
          <div className="terminal-bar">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
            <span className="ml-2 font-mono text-[11px] text-white/35">
              {data.name.toLowerCase()}.js
            </span>
          </div>
          <div className="p-5 px-[18px]">
            {data.code.map((line, i) => (
              <span key={i} className="font-mono text-[12.5px] leading-[2] block text-white/85">
                {line}
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="px-8 flex gap-2 flex-wrap mb-6">
          {data.tags.map((tag) => (
            <span key={tag} className="py-[5px] px-3.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium font-mono border border-border">
              {tag}
            </span>
          ))}
        </div>

        {/* Steps */}
        <div className="px-8 pb-8">
          <h3 className="text-lg font-bold text-black mb-4 tracking-tight">
            Steps to Integrate
          </h3>
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => {
              const text = typeof step === 'string' ? step : step.title || step.desc;
              return (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-[10px] bg-black text-white flex items-center justify-center text-[13px] font-bold shrink-0 font-mono">
                    {i + 1}
                  </div>
                  <div className="text-sm text-gray-600 leading-[1.7] pt-1">
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(.96); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
