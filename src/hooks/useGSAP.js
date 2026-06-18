import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom hook for GSAP scroll-triggered animations
 * Provides a ref and runs animations on mount
 */
export function useGSAP() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof gsap === 'undefined') return;

    const ctx = gsap.context(() => {
      // Hero entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
        .from('.h1-line1', { opacity: 0, y: 36, duration: 0.7 }, '-.4')
        .from('.h1-line2', { opacity: 0, y: 36, duration: 0.7 }, '-.5')
        .from('.hero-sub', { opacity: 0, y: 24, duration: 0.6 }, '-.4')
        .from('.hero-btns', { opacity: 0, y: 20, duration: 0.5 }, '-.35')
        .from('.hero-terminal', { opacity: 0, y: 40, scale: 0.97, duration: 0.7 }, '-.35');

      // How-it-works cards on scroll
      gsap.utils.toArray('.how-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: i * 0.12,
          ease: 'power3.out',
        });
      });

      // Stats counter on scroll
      gsap.from('.stat-n', {
        scrollTrigger: {
          trigger: '.stats',
          start: 'top 80%',
        },
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}