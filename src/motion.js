import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initHero() {
  if (reduce) return;
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.mask .ln', { y: 0, duration: 0.9, stagger: 0.08 })
    .to('.rise', { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.35);
}

export function initReveals() {
  if (reduce) return;
  ScrollTrigger.batch('.row, .stage, .skills > div', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }),
  });
  document.querySelectorAll('.sec h2').forEach((h) => gsap.to(h, { clipPath: 'inset(0 0 -12% 0)', y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 92%', once: true } }));
}

export function initSectionState() {
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0 } });
  const label = document.getElementById('where');
  document.querySelectorAll('main section[data-label]').forEach((s) =>
    ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => { if (self.isActive) { label.textContent = s.dataset.label; document.body.classList.toggle('reading', s.id === 'case'); } } }));
}

export function initMagnetic() {
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.mag').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' }), y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.18); y((e.clientY - r.top - r.height / 2) * 0.25); });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

export function initMenu(lenis) {
  const btn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  const open = (v) => {
    btn.setAttribute('aria-expanded', String(v)); btn.textContent = v ? 'Close' : 'Menu';
    if (v) { menu.hidden = false; lenis?.stop(); document.body.style.overflow = 'hidden';
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: reduce ? 0 : 0.6, ease: 'power3.inOut' }); if (!reduce) gsap.fromTo('.menu a', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.2, ease: 'power3.out' }); menu.querySelector('a').focus(); }
    else { document.body.style.overflow = ''; lenis?.start();
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 0.45, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; } }); btn.focus(); }
  };
  btn.addEventListener('click', () => open(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) open(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) open(false); });
}

export function initChapters() {  // the case study reads as one story: the chapter in view is bright, the rest recede
  const label = document.getElementById('where');
  document.querySelectorAll('.cs').forEach((c) => ScrollTrigger.create({ trigger: c, start: 'top 60%', end: 'bottom 40%',
    toggleClass: { targets: c, className: 'on' }, onToggle: (t) => { if (t.isActive) label.textContent = 'Case study: ' + c.querySelector('h3').textContent; } }));
}

export function initSpotlight() {  // pointer-tracked highlight on project rows; CSS variables only, no layout work
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.row').forEach((r) => r.addEventListener('pointermove', (e) => { const b = r.getBoundingClientRect();
    r.style.setProperty('--mx', e.clientX - b.left + 'px'); r.style.setProperty('--my', e.clientY - b.top + 'px'); }));
}
