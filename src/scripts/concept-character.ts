// Concept page: header state, Cybercore switch, Paper Shaders backgrounds, Motion reveals and the comparison demo.
import 'img-comparison-slider';
import { animate, inView } from 'motion';
import {
  ShaderMount, ShaderFitOptions, defaultObjectSizing, getShaderColorFromString,
  flutedGlassFragmentShader, GlassDistortionShapes, GlassGridShapes, staticMeshGradientFragmentShader,
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

// Shader backgrounds (Paper Shaders). Without WebGL the CSS gradient behind each one stays visible.
const sizing = (fit: keyof typeof ShaderFitOptions, scale = 1) => ({
  u_fit: ShaderFitOptions[fit], u_scale: scale, u_rotation: defaultObjectSizing.rotation,
  u_offsetX: 0, u_offsetY: 0, u_originX: .5, u_originY: .5, u_worldWidth: 0, u_worldHeight: 0,
});

// The colour field behind the glass: a static mesh gradient in sky blue with a little pink, rendered once to an image.
const renderColourField = async () => {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:960px;height:640px;opacity:0;pointer-events:none;z-index:-10';
  document.body.append(host);
  const colors = ['#1f7fe8', '#4db4f7', '#a8dcff', '#ff74b4', '#2a92ee'];
  const field = new ShaderMount(host, staticMeshGradientFragmentShader, {
    u_colors: colors.map(getShaderColorFromString), u_colorsCount: colors.length,
    u_positions: 7, u_waveX: .6, u_waveXShift: 0, u_waveY: .7, u_waveYShift: .2,
    u_mixing: .6, u_grainMixer: 0, u_grainOverlay: 0,
    ...sizing('cover'),
  }, { preserveDrawingBuffer: true }, 0, 0, 1);
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const image = new Image();
  image.src = field.canvasElement.toDataURL('image/png');
  field.dispose();
  host.remove();
  await image.decode();
  return image;
};

// Fluted glass over that colour field, for the hero and the closing call to action.
const glass = (element: HTMLElement, image: HTMLImageElement) => {
  new ShaderMount(element, flutedGlassFragmentShader, {
    u_image: image,
    u_colorBack: getShaderColorFromString('#00000000'), u_colorShadow: getShaderColorFromString('#0a2a66'), u_colorHighlight: getShaderColorFromString('#ffffff'),
    u_shadows: .4, u_size: .6, u_angle: 0, u_distortion: 1, u_shift: 0, u_blur: .2, u_edges: .35, u_stretch: 0,
    u_distortionShape: GlassDistortionShapes.prism, u_highlights: .3, u_shape: GlassGridShapes.lines,
    u_marginLeft: 0, u_marginRight: 0, u_marginTop: 0, u_marginBottom: 0, u_grainMixer: 0, u_grainOverlay: .06,
    ...sizing('cover'),
  });
  element.dataset.ready = '';
};
const glassSurfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-shader="glass"]'));
if (glassSurfaces.length) {
  renderColourField().then(image => glassSurfaces.forEach(element => glass(element, image))).catch(() => { /* WebGL unavailable: the CSS gradient stays. */ });
}

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
