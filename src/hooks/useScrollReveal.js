import { useEffect, useRef } from 'react';

/**
 * Custom hook for scroll-reveal animations using IntersectionObserver
 * Used for .reveal elements that animate in when scrolled into view
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger counter animations if present
            entry.target.querySelectorAll('[data-target]').forEach((el) => {
              animateCounter(el);
            });
          }
        });
      },
      {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || '0px',
      }
    );

    // Observe the element and all .reveal children
    const revealElements = element.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    if (element.classList.contains('reveal')) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

/**
 * Animate a counter element from 0 to its target value
 */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}