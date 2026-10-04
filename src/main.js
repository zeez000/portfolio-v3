import { initScroll } from './scroll.js';
import { initHero, initReveals, initSectionState, initMagnetic, initMenu, initSimulation } from './motion.js';

window.__ok = true;

const lenis = initScroll();
initMenu(lenis);
initSimulation();
initMagnetic();
initSectionState();
initHero();
initReveals();

const loadBackground = () => import('./background.js').then((m) => m.initBackground()).catch(() => {});
if ('requestIdleCallback' in window) window.requestIdleCallback(loadBackground, { timeout: 1500 });
else setTimeout(loadBackground, 800);
