// Concept page: header state, Cybercore switch, Paper Shaders backgrounds, Motion reveals and the comparison demo.
import 'img-comparison-slider';
import { animate, inView } from 'motion';
import {
  ShaderMount, ShaderFitOptions, defaultObjectSizing, getShaderColorFromString,
  godRaysFragmentShader, getShaderNoiseTexture, meshGradientFragmentShader,
} from '@paper-design/shaders';

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

// The header is light-on-dark over the hero, then turns solid once the demo card that overlaps the hero reaches it.
const header = document.querySelector<HTMLElement>('[data-header]');
const showcase = document.querySelector<HTMLElement>('.cx-showcase');
if (header && showcase) {
  const update = () => {
    header.toggleAttribute('data-scrolled', scrollY > 8);
    header.toggleAttribute('data-solid', showcase.getBoundingClientRect().top < header.offsetHeight);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Shader backgrounds (Paper Shaders). Without WebGL the CSS gradient behind each one stays visible.
const sizing = (fit: keyof typeof ShaderFitOptions, scale = 1) => ({
  u_fit: ShaderFitOptions[fit], u_scale: scale, u_rotation: defaultObjectSizing.rotation,
  u_offsetX: 0, u_offsetY: 0, u_originX: .5, u_originY: .5, u_worldWidth: 0, u_worldHeight: 0,
});
const mount = (element: Element | null, create: (element: HTMLElement) => void) => {
  if (!(element instanceof HTMLElement)) return;
  try { create(element); element.dataset.ready = ''; } catch { /* WebGL unavailable. */ }
};

// Hero: soft god rays in the brand colours, blue from above and warm light rising from below.
mount(document.querySelector('[data-shader="hero"]'), element => {
  const colors = ['#1b2fd1cc', '#ff3616aa', '#ffffff', '#ffb08a'];
  new ShaderMount(element, godRaysFragmentShader, {
    u_colorBack: getShaderColorFromString('#05060f'), u_colorBloom: getShaderColorFromString('#1b2fd1'),
    u_colors: colors.map(getShaderColorFromString), u_colorsCount: colors.length,
    u_density: .3, u_spotty: .3, u_midIntensity: .4, u_midSize: .2, u_intensity: .8, u_bloom: .4,
    u_noiseTexture: getShaderNoiseTexture(),
    ...sizing('cover'), u_offsetY: -.55,
  }, undefined, reducedMotion ? 0 : .5);
});

// Closing call to action: a slow mesh gradient in the brand colours.
mount(document.querySelector('[data-shader="final"]'), element => {
  const colors = ['#05060f', '#1b2fd1', '#ff3616', '#ffb08a'];
  new ShaderMount(element, meshGradientFragmentShader, {
    u_colors: colors.map(getShaderColorFromString), u_colorsCount: colors.length,
    u_distortion: .8, u_swirl: .15, u_grainMixer: 0, u_grainOverlay: .1,
    ...sizing('cover'),
  }, undefined, reducedMotion ? 0 : .25);
});

// Gentle reveals on scroll (Motion). Content stays visible when motion is reduced or scripts fail.
if (!reducedMotion) {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
    element.style.opacity = '0';
    inView(element, () => { animate(element, { opacity: [0, 1], y: [18, 0] }, { duration: .7, ease: [.2, .7, .2, 1] }); }, { amount: .2 });
  });
}

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
