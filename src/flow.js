// Topology of the e-commerce platform, drawn from the repo README. One SVG builder, two uses:
// a quiet ambient loop in the hero and a user-controlled order-flow simulation in #system.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const NS = 'http://www.w3.org/2000/svg', reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NODES = [['client', 20, 200, 'Client'], ['gateway', 210, 200, 'API gateway :8080'], ['product', 430, 40, 'Product :3000'], ['inventory', 430, 200, 'Inventory :3001'],
  ['order', 430, 360, 'Order :3002'], ['redis', 690, 40, 'Redis'], ['kafka', 690, 200, 'Kafka :9092'], ['mongo', 690, 360, 'MongoDB']];
const PATHS = { cg: 'M140 222H210', gp: 'M330 222C380 222 380 62 430 62', gi: 'M330 222H430', go: 'M330 222C380 222 380 382 430 382', pr: 'M550 62H690', om: 'M550 382H690',
  ok: 'M550 372C620 372 620 206 690 206', ki: 'M690 232H550', ik: 'M550 214H690', ko: 'M690 240C620 240 620 392 550 392' };
const STEPS = [['cg', 'gateway', 'Client sends POST /orders/orders to the gateway.'], ['go', 'order', 'Gateway routes it to Order Service.'],
  ['ok', 'kafka', 'Order Service saves a pending order and publishes order.created to order-events.'], ['ki', 'inventory', 'Inventory Service consumes order.created.'],
  ['ik', 'kafka', (ok) => `Conditional stock update ${ok ? 'succeeds: inventory.reserved' : 'fails: inventory.rejected'} is published to inventory-events.`],
  ['ko', 'order', (ok) => `Order Service consumes the result and marks the order ${ok ? 'confirmed' : 'rejected'}.`]];
const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p?.append(e); return e; };

export function build(host, labels = true) {
  const svg = el('svg', { viewBox: '0 0 830 440', class: 'tp', focusable: 'false' }, host), paths = {}, nodes = {};
  for (const k in PATHS) paths[k] = el('path', { d: PATHS[k], class: 'tl' }, svg);
  for (const [id, x, y, t] of NODES) { const g = el('g', { class: `nd nd-${id}` }, svg); el('rect', { x, y, width: 120, height: 44, rx: 4 }, g);
    if (labels) { const tx = el('text', { x: x + 60, y: y + 27 }, g); tx.textContent = t; } nodes[id] = g; }
  const pulse = el('circle', { r: 5, class: 'pulse', cx: -20, cy: -20 }, svg);
  return { svg, paths, nodes, pulse };
}
function travel(s, k, dur, done) {
  const p = s.paths[k], L = p.getTotalLength(), o = { t: 0 };
  return gsap.to(o, { t: 1, duration: dur, ease: 'power1.inOut', onUpdate() { const q = p.getPointAtLength(o.t * L); s.pulse.setAttribute('cx', q.x); s.pulse.setAttribute('cy', q.y); }, onComplete: done });
}

export function initHeroTopology() {
  const host = document.querySelector('[data-topo]'); if (!host) return;
  const s = build(host, false);
  if (reduce) return;
  const L = (p) => p.getTotalLength();
  Object.values(s.paths).forEach((p) => { p.style.strokeDasharray = L(p); p.style.strokeDashoffset = L(p); });
  gsap.set(Object.values(s.nodes), { opacity: 0 });
  const intro = gsap.timeline({ delay: 0.3 })
    .to(Object.values(s.nodes), { opacity: 1, duration: 0.5, stagger: 0.06 })
    .to(Object.values(s.paths), { strokeDashoffset: 0, duration: 1, stagger: 0.07, ease: 'power2.inOut' }, 0.15);
  intro.eventCallback('onComplete', () => {
    Object.values(s.paths).forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
    STEPS.forEach(([k]) => loop.add(travel(s, k, 0.8)));
    ScrollTrigger.create({ trigger: host, start: 'top bottom', end: 'bottom top', onToggle: (t) => (t.isActive ? loop.play() : loop.pause()) });
    document.addEventListener('visibilitychange', () => (document.hidden ? loop.pause() : loop.play()));
  });
}

export function initSystem() {
  const host = document.querySelector('[data-flow]'); if (!host) return;
  const s = build(host), log = document.getElementById('sim-log'), sel = document.getElementById('sim-stock');
  let i = 0, auto = false, busy = false, calls = [];
  const ok = () => sel.value === 'ok';
  const light = (id, c) => s.nodes[id].classList.add(c);
  const reset = () => { calls.forEach((c) => c.kill()); calls = []; auto = busy = false; i = 0; log.textContent = ''; s.pulse.setAttribute('cx', -20);
    Object.values(s.paths).forEach((p) => p.classList.remove('hot')); Object.values(s.nodes).forEach((n) => n.classList.remove('on', 'is-ok', 'is-bad')); };
  const step = () => {
    if (busy || i >= STEPS.length) return; busy = true;
    const [k, dest, txt] = STEPS[i++], last = i === STEPS.length, li = document.createElement('li');
    li.textContent = typeof txt === 'function' ? txt(ok()) : txt; log.append(li); s.paths[k].classList.add('hot');
    calls.push(travel(s, k, reduce ? 0 : 0.7, () => { busy = false; light(dest, last ? (ok() ? 'is-ok' : 'is-bad') : 'on'); if (last) li.className = ok() ? 'ok' : 'bad';
      if (auto && !last) calls.push(gsap.delayedCall(0.25, step)); }));
  };
  document.getElementById('sim-step').addEventListener('click', () => { auto = false; step(); });
  document.getElementById('sim-play').addEventListener('click', () => { reset(); auto = true; step(); });
  document.getElementById('sim-reset').addEventListener('click', reset);
  sel.addEventListener('change', reset);
}
