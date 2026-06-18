import React from 'react';

const TERMINAL_LINES = [
  { prefix: '~', text: 'npm install ', highlight: 'stripe @clerk/clerk-react mongoose openai', type: 'command' },
  { text: '// Installing top integrations...', type: 'comment' },
  { prefix: '✔', label: 'Authentication ·····', value: 'Clerk v5', type: 'success' },
  { prefix: '✔', label: 'Payments ···········', value: 'Stripe v16', type: 'success' },
  { prefix: '✔', label: 'Database ···········', value: 'Mongoose v8', type: 'success' },
  { prefix: '✔', label: 'AI ·················', value: 'OpenAI v4', type: 'success' },
  { prefix: '~', text: 'node server.js', type: 'command', cursor: true },
];

export default function Hero() {
  return (
    <section className="relative z-[2] min-h-screen flex items-center justify-center pt-[100px] pb-[60px] px-10 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, #000 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, #000 30%, transparent 70%)',
        }}
      />

      <div className="relative z-[1] max-w-[1200px] mx-auto w-full grid grid-cols-2 gap-12 items-center">
        {/* Left: Text content */}
        <div className="flex flex-col">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-[18px] py-1.5 bg-white border border-border rounded-full mb-8 text-[12.5px] font-semibold text-gray-600 tracking-wide shadow-sm w-fit">
            <div className="w-[7px] h-[7px] rounded-full bg-brand-green shadow-[0_0_8px_rgba(16,185,129,.5)] animate-blink" />
            v1.0 — 10 Top Integrations · Built for Developers
          </div>

          {/* Heading */}
          <h1 className="hero-h1 font-black tracking-[-3.5px] leading-[1.05] mb-6 text-[clamp(36px,4vw,64px)]">
            <span className="h1-line1 block text-black">Ship Faster with</span>
            <span className="h1-line2 block gradient-text">Production-Ready Integrations</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub text-[17px] text-gray-500 leading-[1.8] mb-10 max-w-[480px]">
            The definitive integration directory for MERN Stack developers — real code snippets
            for Auth, Payments, AI, Database & more. Copy, paste, and ship in minutes.
          </p>

          {/* Buttons */}
          <div className="hero-btns flex items-center gap-3.5">
            <a
              href="#browse"
              className="inline-flex items-center gap-[7px] h-12 px-7 bg-black border-none rounded-full text-white text-[15px] font-semibold no-underline shadow-[0_2px_10px_rgba(0,0,0,.08)] hover:bg-[#2D2D35] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.18)] transition-all duration-300"
            >
              ⚡ Browse Integrations
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-[7px] h-12 px-7 bg-white border border-border rounded-full text-gray-700 text-[15px] font-medium no-underline hover:border-gray-300 hover:text-black hover:bg-gray-50 transition-all duration-300"
            >
              How it works →
            </a>
          </div>
        </div>

        {/* Right: Terminal */}
        <div className="hero-terminal relative w-full bg-[#2D2D35] rounded-[14px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,.18),0_0_0_1px_rgba(0,0,0,.04)] text-left">
          <div className="terminal-bar">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
            <span className="ml-1.5 font-mono text-[11px] text-white/35">terminal — integratekit</span>
          </div>
          <div className="p-5 px-[22px]">
            {TERMINAL_LINES.map((line, i) => (
              <span key={i} className="font-mono text-[13px] leading-[2] block text-white/90">
                {line.type === 'comment' && (
                  <span className="text-white/40">{line.text}</span>
                )}
                {line.type === 'command' && (
                  <>
                    <span className="text-[#34D399]">{line.prefix}</span> {line.text}
                    <span className="text-[#22D3EE]">{line.highlight}</span>
                    {line.cursor && <span className="cursor-blink" />}
                  </>
                )}
                {line.type === 'success' && (
                  <>
                    <span className="text-[#34D399]">{line.prefix}</span>{' '}
                    <span className="text-white/40">{line.label}</span>{' '}
                    <span className="text-white">{line.value}</span>
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}