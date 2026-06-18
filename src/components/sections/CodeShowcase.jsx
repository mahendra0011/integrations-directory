import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const FEATURES = [
  'Production-ready Express.js & React snippets',
  'ENV variable templates included per integration',
  'Error handling and edge cases documented',
  'Always updated for the latest API versions',
];

const CODE_LINES = [
  { num: 1, content: <><span className="text-white/40">{'// Stripe Checkout Session'}</span></> },
  { num: 2, content: <><span className="text-[#7C3AED]">import</span> Stripe <span className="text-[#7C3AED]">from</span> <span className="text-[#059669]">&apos;stripe&apos;</span>;</> },
  { num: 3, content: '' },
  { num: 4, content: <><span className="text-[#7C3AED]">const</span> stripe = <span className="text-[#2563EB]">Stripe</span>(process.<span className="text-[#D97706]">env</span>.STRIPE_SECRET);</> },
  { num: 5, content: '' },
  { num: 6, content: <><span className="text-[#D97706]">router</span>.<span className="text-[#2563EB]">post</span>(<span className="text-[#059669]">&apos;/checkout&apos;</span>, <span className="text-[#7C3AED]">async</span> (req, res) {'=>'} {'{'}</> },
  { num: 7, content: <>&nbsp;&nbsp;<span className="text-[#7C3AED]">const</span> session = <span className="text-[#7C3AED]">await</span> stripe.<span className="text-[#D97706]">checkout</span></> },
  { num: 8, content: <>&nbsp;&nbsp;&nbsp;&nbsp;.<span className="text-[#D97706]">sessions</span>.<span className="text-[#2563EB]">create</span>({'{'}</> },
  { num: 9, content: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mode: <span className="text-[#059669]">&apos;payment&apos;</span>,</> },
  { num: 10, content: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;line_items: req.<span className="text-[#D97706]">body</span>.items,</> },
  { num: 11, content: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;success_url: <span className="text-[#059669]">{`${'{'}BASE{'}'}/success`}</span>,</> },
  { num: 12, content: <>&nbsp;&nbsp;&nbsp;&nbsp;{'}'});</> },
  { num: 13, content: <>&nbsp;&nbsp;<span className="text-[#D97706]">res</span>.<span className="text-[#2563EB]">json</span>({'{'} url: session.<span className="text-[#D97706]">url</span> {'}'});</> },
  { num: 14, content: <>{'}'});</> },
];

export default function CodeShowcase() {
  const ref = useScrollReveal();

  return (
    <section className="relative z-[2] pt-[100px] pb-[100px] px-10 bg-gray-50">
      <div className="max-w-[1150px] mx-auto grid grid-cols-2 gap-[72px] items-center">
        {/* Left content */}
        <div ref={ref} className="reveal">
          <div className="section-label">          {'// code first'}</div>
          <h2 className="text-[clamp(30px,3.5vw,44px)] font-extrabold tracking-[-1.5px] leading-[1.12] mb-[18px] text-black">
            Real Code,<br />Not Just Doc Links
          </h2>
          <p className="text-[15px] text-gray-500 leading-[1.8] mb-8">
            Every integration page includes working code — auth flows, webhook handlers,
            error cases, and ENV templates — tested against the latest API versions.
          </p>
          <ul className="list-none flex flex-col gap-3.5">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-[22px] h-[22px] rounded-[7px] bg-black flex items-center justify-center text-xs text-white shrink-0 mt-px">
                  ✓
                </div>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Right code window */}
        <div className="reveal bg-[#2D2D35] rounded-[16px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.14)]" style={{ transitionDelay: '0.12s' }}>
          {/* Bar */}
          <div className="terminal-bar">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
            <div className="flex gap-1 ml-3">
              {['stripe.js', 'auth.js', 'upload.js'].map((tab, i) => (
                <div
                  key={tab}
                  className={`py-[5px] px-3.5 rounded-t-[7px] font-mono text-[11px] cursor-pointer transition-all ${
                    i === 0
                      ? 'bg-[rgba(99,102,241,.15)] text-[#A5B4FC]'
                      : 'text-white/40'
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
          {/* Body */}
          <div className="p-5 px-[22px]">
            {CODE_LINES.map((line) => (
              <div key={line.num} className="font-mono text-[12.5px] leading-[1.9] flex text-white/85">
                <span className="text-white/15 min-w-6 mr-[18px] text-right select-none text-[11px]">
                  {line.num}
                </span>
                <span>{line.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}