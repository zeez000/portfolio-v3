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
  ScrollTrigger.batch('.sec h2, .row, .sim, .diagram, .cs, .skills > div', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }),
  });
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
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: reduce ? 0 : 0.6, ease: 'power3.inOut' }); menu.querySelector('a').focus(); }
    else { document.body.style.overflow = ''; lenis?.start();
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 0.45, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; } }); btn.focus(); }
  };
  btn.addEventListener('click', () => open(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) open(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) open(false); });
}

export function initSimulation() {
  const log = document.getElementById('sim-log'), sel = document.getElementById('sim-stock');
  const steps = () => {
    const ok = sel.value === 'ok';
    return [['Client sends POST /orders/orders through the gateway.'], ['Order Service saves the order as pending and publishes order.created to order-events.'],
      ['Inventory Service consumes order.created and tries a conditional stock update.'],
      ok ? ['Stock was sufficient. Inventory publishes inventory.reserved to inventory-events.', 'ok'] : ['Stock was insufficient. Inventory publishes inventory.rejected.', 'bad'],
      ok ? ['Order Service consumes the event and marks the order confirmed.', 'ok'] : ['Order Service consumes the event and marks the order rejected.', 'bad']];
  };
  let i = 0, timer = null, cur = steps();
  const stop = () => { clearInterval(timer); timer = null; };
  const step = () => { if (i >= cur.length) return stop(); const li = document.createElement('li'); li.textContent = cur[i][0]; if (cur[i][1]) li.className = cur[i][1]; log.append(li); i++; if (i >= cur.length) stop(); };
  const reset = () => { stop(); i = 0; log.textContent = ''; cur = steps(); };
  document.getElementById('sim-step').addEventListener('click', () => { stop(); step(); });
  document.getElementById('sim-play').addEventListener('click', () => { reset(); step(); timer = setInterval(step, 900); });
  document.getElementById('sim-reset').addEventListener('click', reset);
  sel.addEventListener('change', reset);
}
