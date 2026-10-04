import { initScroll } from './scroll.js';
import { initHero, initReveals, initSectionState, initMagnetic, initMenu, initChapters, initSpotlight } from './motion.js';
import { initHeroTopology, initSystem } from './flow.js';

window.__ok = true; // tells the inline failsafe in index.html that the app started

const lenis = initScroll();
initMenu(lenis); initSystem(); initHeroTopology(); initChapters(); initSpotlight(); initMagnetic(); initSectionState(); initHero(); initReveals();

const loadBackground = () => import('./background.js').then((m) => m.initBackground()).catch(() => {});
if ('requestIdleCallback' in window) window.requestIdleCallback(loadBackground, { timeout: 1500 });
else setTimeout(loadBackground, 800);
