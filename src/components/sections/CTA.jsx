import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CTA() {
  const ref = useScrollReveal();

  return (
    <section className="relative z-[2] pt-[100px] pb-[100px] px-10 text-center bg-white">
      <div ref={ref} className="reveal max-w-[680px] mx-auto bg-[#2D2D35] rounded-[20px] px-[52px] py-[56px] shadow-[0_20px_60px_rgba(0,0,0,.14)] text-white">
        <div className="w-[60px] h-[60px] rounded-2xl bg-white/10 flex items-center justify-center text-[26px] mx-auto mb-5.5">
          📬
        </div>
        <h2 className="text-[34px] font-extrabold tracking-[-1px] mb-3.5 text-white">
          Stay in the Loop
        </h2>
        <p className="text-[15px] text-white/60 leading-[1.8] mb-9">
          New integrations added every week. Get notified about new code snippets,
          breaking API changes, and community picks.
        </p>
        <div className="flex gap-2.5 max-w-[420px] mx-auto">
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 bg-white/8 border border-white/12 rounded-full px-5 h-[46px] text-white font-sans text-sm outline-none placeholder:text-white/35 focus:border-white/30 transition-colors"
          />
          <button className="h-[46px] px-7 bg-white border-none rounded-full text-black text-sm font-semibold cursor-pointer font-sans transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,.3)]">
            Subscribe
          </button>
        </div>
        <p className="mt-3.5 text-xs text-white/30 font-mono">
          {'// No spam · Unsubscribe anytime'}
        </p>
      </div>
    </section>
  );
}