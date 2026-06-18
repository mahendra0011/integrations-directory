import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] h-[68px] flex items-center justify-between px-10',
        'bg-white/82 backdrop-blur-[20px] saturate-[180%] border-b border-border',
        'transition-all duration-300',
        scrolled && 'shadow-md bg-white/96'
      )}
    >
      {/* Logo / Home */}
      <a href="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-9 h-9 rounded-[10px] bg-black flex items-center justify-center text-base text-white shadow-lg">
          <Zap size={17} />
        </div>
        <span className="text-[17px] font-extrabold text-black tracking-tight">
          Integrate<span className="text-brand-accent">Kit</span>
        </span>
      </a>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1">
        <a
          href="/"
          className="px-3.5 py-[7px] rounded-lg text-[13.5px] font-medium text-gray-600 no-underline hover:text-black hover:bg-gray-100 transition-colors"
        >
          Home
        </a>
        <a
          href="/integrations"
          className="px-3.5 py-[7px] rounded-lg text-[13.5px] font-medium text-gray-600 no-underline hover:text-black hover:bg-gray-100 transition-colors"
        >
          Integrations
        </a>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3"></div>
    </nav>
  );
}