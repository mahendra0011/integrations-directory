import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'Find Your Integration',
    desc: 'Browse 10 hand-picked integrations by category. Filter by tech stack, use-case, or pricing model to find exactly what you need for your MERN application.',
  },
  {
    num: '02',
    icon: '📋',
    title: 'Copy the Code',
    desc: 'Every integration ships with production-ready Node.js and React snippets — no boilerplate, no guesswork, just working code you can paste and run immediately.',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'Ship to Production',
    desc: 'Follow the step-by-step guide, drop in your ENV keys, and deploy. From a blank project to a live feature in under 30 minutes.',
  },
];

export default function HowItWorks() {
  const ref = useScrollReveal();

  return (
    <section id="how" className="relative z-[2] pt-[100px] pb-[100px] px-10 bg-white">
      <div className="max-w-[1150px] mx-auto">
        <div ref={ref} className="reveal">
          <div className="section-label">          {'// workflow'}</div>
          <h2 className="text-[clamp(30px,4vw,46px)] font-extrabold tracking-[-1.5px] text-black mt-2.5">
            From Zero to Production<br />in Three Steps
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 mt-[52px]">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="how-card bg-white border border-border rounded-[16px] p-8 transition-all duration-300 relative overflow-hidden shadow-sm hover:border-gray-300 hover:-translate-y-[3px] hover:shadow-md"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="text-[56px] font-black tracking-[-3px] text-gray-200 leading-none mb-5">
                {step.num}
              </div>
              <div className="w-[50px] h-[50px] rounded-xl bg-gray-100 flex items-center justify-center text-[22px] mb-4">
                {step.icon}
              </div>
              <h3 className="text-[17px] font-bold text-black mb-2.5">{step.title}</h3>
              <p className="text-[13.5px] text-gray-500 leading-[1.75]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}