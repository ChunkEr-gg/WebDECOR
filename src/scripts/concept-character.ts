// Concept page: header state, Cybercore switch, Paper Shaders backgrounds, Motion reveals and the comparison demo.
import 'img-comparison-slider';
import { mountGlass } from './concept-glass';
import { playMotion } from './concept-motion';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cybercore switch: turns the light sections dark and remembers the choice.
const switchButton = document.querySelector<HTMLButtonElement>('[data-concept-switch]');
const setPower = (on: boolean) => {
  if (on) root.dataset.on = 'true'; else delete root.dataset.on;
  switchButton?.setAttribute('aria-checked', String(on));
};
switchButton?.addEventListener('click', () => {
  const on = root.dataset.on !== 'true';
  setPower(on);
  try { localStorage.setItem('webdecor-concept-cybercore', String(on)); } catch { /* Storage unavailable: the choice lasts for this visit. */ }
});
setPower(root.dataset.on === 'true');

// The header is clear over the top of the hero, frosted once the page scrolls, and solid after the hero.
const header = document.querySelector<HTMLElement>('[data-header]');
const hero = document.querySelector<HTMLElement>('.cx-hero');
if (header && hero) {
  const update = () => {
    header.toggleAttribute('data-scrolled', scrollY > 8);
    header.toggleAttribute('data-solid', hero.getBoundingClientRect().bottom < header.offsetHeight);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Live fluted glass on the hero and the closing call to action. Without WebGL the CSS gradient behind each one stays visible.
const glassSurfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-shader="glass"]'));
if (glassSurfaces.length) mountGlass(glassSurfaces, !reducedMotion).catch(() => { /* WebGL unavailable: the CSS gradient stays. */ });

// Entrance, scroll and reveal animations. Content stays visible when motion is reduced or scripts fail.
if (!reducedMotion) playMotion();

// Template-versus-character demo: business tabs drive which art direction the slider shows.
document.querySelectorAll<HTMLElement>('[data-character-demo]').forEach(demo => {
  const status = demo.querySelector<HTMLElement>('[data-demo-status]');
  const panel = demo.querySelector<HTMLElement>('[role="tabpanel"]');
  const tabs = Array.from(demo.querySelectorAll<HTMLButtonElement>('[data-business-tab]'));
  const select = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    demo.dataset.business = tab.dataset.businessTab;
    panel?.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    const name = demo.querySelector<HTMLElement>(`.cc-demo-caption [data-for="${tab.dataset.businessTab}"] strong`)?.textContent?.replace(/\.$/, '');
    if (status && name) status.textContent = `Showing ${name}.`;
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (event.key === 'Home') { event.preventDefault(); select(tabs[0], true); }
      else if (event.key === 'End') { event.preventDefault(); select(tabs[tabs.length - 1], true); }
      else if (step) { event.preventDefault(); select(tabs[(index + step + tabs.length) % tabs.length], true); }
    });
  });
});
