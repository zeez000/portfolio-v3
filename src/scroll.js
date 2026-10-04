import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export const scrollState = { velocity: 0, lenis: null };
export function initScroll() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  gsap.ticker.lagSmoothing(0);
  if (reduce || coarse) return null;            // native scroll
  const lenis = new Lenis({ autoRaf: false, lerp: 0.15, wheelMultiplier: 1, syncTouch: false });
  lenis.on('scroll', (l) => { scrollState.velocity = l.velocity; ScrollTrigger.update(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));  // single clock
  scrollState.lenis = lenis;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href') === '#') return;
    const el = document.querySelector(a.getAttribute('href')); if (!el) return;
    e.preventDefault(); lenis.scrollTo(el, { duration: 0.9 }); history.replaceState(null, '', a.getAttribute('href'));
  });
  return lenis;
}
