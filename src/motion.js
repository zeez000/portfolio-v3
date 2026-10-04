import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initHero() {
  if (reduce) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.mask .ln', { y: 0, duration: 0.95, stagger: 0.09 })
    .to('.rise', { opacity: 1, y: 0, duration: 0.65, stagger: 0.06 }, 0.28)
    .fromTo('.hero-visual', { clipPath: 'polygon(0 100%,0 100%,100% 100%,100% 100%,100% 100%,0 100%)' },
      { clipPath: 'polygon(0 8%,8% 0,100% 0,100% 92%,92% 100%,0 100%)', duration: 0.9, ease: 'power4.inOut' }, 0.2)
    .from('.visual-node', { scale: 0.72, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.8)' }, 0.62)
    .from('.visual-status', { scale: 0.88, opacity: 0, duration: 0.45 }, 0.9);

  gsap.to('.visual-beam', { xPercent: 110, duration: 6.5, ease: 'none', repeat: -1 });
  gsap.to('.visual-links path', { strokeDashoffset: -180, duration: 9, ease: 'none', repeat: -1 });
  gsap.to('.visual-status i', { opacity: 0.25, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  if (fine) {
    const visual = document.querySelector('.hero-visual');
    visual?.addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(visual, { rotateY: nx * 3.5, rotateX: ny * -3.5, transformPerspective: 900, duration: 0.45, ease: 'power2.out' });
      gsap.to('.visual-node', { x: nx * 10, y: ny * 8, duration: 0.45, ease: 'power2.out' });
    });
    visual?.addEventListener('pointerleave', () => {
      gsap.to(visual, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
      gsap.to('.visual-node', { x: 0, y: 0, duration: 0.6, ease: 'power3.out' });
    });
  }
}

export function initReveals() {
  if (reduce) return;

  ScrollTrigger.batch('.sec h2, .row, .sim, .diagram, .cs, .skills > div', {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.72,
      stagger: 0.07,
      ease: 'power3.out'
    }),
  });

  gsap.utils.toArray('.sec h2').forEach((h) => {
    gsap.to(h, {
      x: 0,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
      onStart: () => gsap.to(h, { '--lineReveal': 1 })
    });
    const after = h;
    ScrollTrigger.create({
      trigger: h,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const rule = h;
        rule.classList.add('is-visible');
      }
    });
  });

  const edges = document.querySelectorAll('.diagram .e path');
  edges.forEach((path) => {
    const len = path.getTotalLength?.() || 400;
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
  });
  ScrollTrigger.create({
    trigger: '.diagram',
    start: 'top 78%',
    once: true,
    onEnter: () => {
      gsap.to('.diagram .e path', { strokeDashoffset: 0, duration: 1.15, stagger: 0.14, ease: 'power2.out' });
      gsap.fromTo('.diagram .n', { opacity: 0.2 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    }
  });

  gsap.utils.toArray('.cs').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el, { x: 28 }, { x: 0, duration: 0.65, ease: 'power3.out' });
        gsap.to(el, { '--caseLine': 1, duration: 0.7 });
      }
    });
  });
}

export function initSectionState() {
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0 } });
  const label = document.getElementById('where');
  document.querySelectorAll('main section[data-label]').forEach((s) =>
    ScrollTrigger.create({
      trigger: s,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) {
          gsap.fromTo(label, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
          label.textContent = s.dataset.label;
          document.body.classList.toggle('reading', s.id === 'case');
        }
      }
    })
  );

  if (!reduce) {
    gsap.to('.hero-stage h1', {
      yPercent: 10,
      opacity: 0.48,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.hero-visual', {
      yPercent: -7,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
    });
  }
}

export function initMagnetic() {
  if (reduce || !fine) return;

  document.querySelectorAll('.mag').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.18);
      y((e.clientY - r.top - r.height / 2) * 0.25);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });

  document.querySelectorAll('.row').forEach((row) => {
    row.addEventListener('pointermove', (e) => {
      const r = row.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      gsap.to(row, { x: nx * 5, duration: 0.35, ease: 'power2.out' });
    });
    row.addEventListener('pointerleave', () => gsap.to(row, { x: 0, duration: 0.45, ease: 'power3.out' }));
  });
}

export function initMenu(lenis) {
  const btn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  const open = (v) => {
    btn.setAttribute('aria-expanded', String(v)); btn.textContent = v ? 'Close' : 'Menu';
    if (v) {
      menu.hidden = false;
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: reduce ? 0 : 0.6, ease: 'power3.inOut' });
      if (!reduce) gsap.fromTo(menu.querySelectorAll('a'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.055, duration: 0.5, ease: 'power3.out', delay: 0.12 });
      menu.querySelector('a').focus();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 0.45, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; } });
      btn.focus();
    }
  };
  btn.addEventListener('click', () => open(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) open(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) open(false); });
}

export function initSimulation() {
  const log = document.getElementById('sim-log'), sel = document.getElementById('sim-stock');
  const steps = () => {
    const ok = sel.value === 'ok';
    return [
      ['Client sends POST /orders/orders through the gateway.'],
      ['Order Service saves the order as pending and publishes order.created to order-events.'],
      ['Inventory Service consumes order.created and tries a conditional stock update.'],
      ok ? ['Stock was sufficient. Inventory publishes inventory.reserved to inventory-events.', 'ok'] : ['Stock was insufficient. Inventory publishes inventory.rejected.', 'bad'],
      ok ? ['Order Service consumes the event and marks the order confirmed.', 'ok'] : ['Order Service consumes the event and marks the order rejected.', 'bad']
    ];
  };
  let i = 0, timer = null, cur = steps();
  const stop = () => { clearInterval(timer); timer = null; };
  const step = () => {
    if (i >= cur.length) return stop();
    const li = document.createElement('li');
    li.textContent = cur[i][0];
    if (cur[i][1]) li.className = cur[i][1];
    log.append(li);
    if (!reduce) gsap.fromTo(li, { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    i++;
    if (i >= cur.length) stop();
  };
  const reset = () => { stop(); i = 0; log.textContent = ''; cur = steps(); };
  document.getElementById('sim-step').addEventListener('click', () => { stop(); step(); });
  document.getElementById('sim-play').addEventListener('click', () => { reset(); step(); timer = setInterval(step, 900); });
  document.getElementById('sim-reset').addEventListener('click', reset);
  sel.addEventListener('change', reset);
}
