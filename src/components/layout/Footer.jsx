import React from 'react';
import { Zap } from 'lucide-react';

const FOOTER_LINKS = {
  Integrations: ['Authentication', 'Payments', 'Database', 'AI & ML', 'Realtime'],
  Resources: ['Documentation', 'Code Snippets', 'Tutorials', 'Blog'],
  Company: ['About', 'Submit Integration', 'GitHub', 'Contact'],
};

export default function Footer() {
  return (
    <footer className="relative z-[2] pt-[60px] pb-10 px-10 border-t border-border bg-white">
      <div className="max-w-[1150px] mx-auto">
        {/* Top */}
        <div className="flex justify-between gap-12 mb-[52px] flex-wrap">
          {/* Brand */}
          <div className="max-w-[250px]">
            <a href="#" className="flex items-center gap-2.5 no-underline mb-0">
              <div className="w-9 h-9 rounded-[10px] bg-black flex items-center justify-center text-base text-white shadow-lg">
                <Zap size={17} />
              </div>
              <span className="text-[17px] font-extrabold text-black tracking-tight">
                Integrate<span className="text-brand-accent">Kit</span>
              </span>
            </a>
            <p className="text-[13px] text-gray-400 leading-relaxed mt-3.5">
              The definitive integration directory for MERN Stack and modern web developers.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16 flex-wrap">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px] mb-4 font-mono">
                  {title}
                </h4>
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-gray-500 no-underline text-[13.5px] mb-2.5 hover:text-black transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between pt-7 border-t border-gray-100">
          <span className="text-[11.5px] text-gray-400 font-mono">
          {'// © 2025 IntegrateKit · Built for Developers'}
          </span>
          <div className="flex gap-2.5">
            {['𝕏', '⌥', '★'].map((icon) => (
              <a
                key={icon}
                href="#"
                className="w-9 h-9 rounded-[10px] bg-gray-50 border border-border flex items-center justify-center text-sm no-underline text-gray-500 hover:bg-black hover:border-black hover:text-white transition-all"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}