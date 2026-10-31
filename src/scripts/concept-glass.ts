// Live fluted glass for /concept/ (Paper Shaders).
// Behind the glass sits a scene drawn on a 2D canvas: a moving mesh gradient in the page's sky blues, night falling from the top,
// a pink flare, and on the hero a black figure in profile with pink light flaring off its edge.
// The scene is uploaded as the fluted glass shader's image on every frame. Colours come from CSS custom properties,
// so the glass follows the palette and the Cybercore switch. Without WebGL the CSS gradient behind each surface stays.
import {
  ShaderMount, ShaderFitOptions, defaultObjectSizing, getShaderColorFromString,
  flutedGlassFragmentShader, GlassDistortionShapes, GlassGridShapes, meshGradientFragmentShader,
} from '@paper-design/shaders';

// ShaderMount keeps its WebGL context and textures private. The live feed replaces the image texture's pixels in place.
type MountInternals = {
  gl: WebGLRenderingContext;
  textures: Map<string, WebGLTexture>;
  textureUnitMap: Map<string, number>;
  uniformLocations: Record<string, WebGLUniformLocation | null>;
};

type Palette = { field: string[]; night: string; pink: string; blush: string; shadow: string; highlight: string };

// A person in profile facing left, in a 1000-unit box. The shoulders run off the bottom edge.
const FIGURE = new Path2D('M610 470C650 420 690 330 680 250C670 150 590 95 500 100C440 103 400 140 392 200C388 230 385 250 378 265C370 290 345 320 340 335C345 345 362 350 370 352C365 365 362 375 368 382C360 390 362 400 370 405C368 425 372 445 395 455C430 462 455 460 468 470C470 500 465 530 455 560C380 600 250 640 200 720C170 780 150 880 140 1000L900 1000C890 860 850 700 760 620C700 570 640 540 610 470Z');
// Where the light sits, just in front of the face (figure units).
const LIGHT = { x: 330, y: 300 };
const SPRITE = { left: -60, top: -40, width: 1080, height: 1040 };

const GLASS = {
  u_shadows: .5, u_angle: 0, u_distortion: .35, u_shift: 0, u_blur: .25, u_edges: .4, u_stretch: 0,
  u_distortionShape: GlassDistortionShapes.lens, u_highlights: .45, u_shape: GlassGridShapes.lines,
};
// The shader fits a set number of ribs across the surface (u_size 0 is 200 ribs, 1 is 5).
// Ribs are about 24px wide on a desktop and never fewer than 24 across, so a figure still reads on a phone.
const ribs = (width: number) => ({ u_size: (200 - Math.max(24, width / (14 + width * .007))) / 195 });

const readPalette = (): Palette => {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    field: [1, 2, 3, 4].map(i => token(`--field-${i}`)),
    night: token('--night'), pink: token('--pink'), blush: token('--blush'),
    shadow: token('--midnight'), highlight: token('--cloud'),
  };
};

const rgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.replace(/./g, c => c + c) : value.slice(0, 6);
  const n = parseInt(full, 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${alpha})`;
};

const sizing = (fit: keyof typeof ShaderFitOptions) => ({
  u_fit: ShaderFitOptions[fit], u_scale: 1, u_rotation: defaultObjectSizing.rotation,
  u_offsetX: 0, u_offsetY: 0, u_originX: .5, u_originY: .5, u_worldWidth: 0, u_worldHeight: 0,
});

const fieldColours = (palette: Palette) => ({ u_colors: palette.field.map(getShaderColorFromString), u_colorsCount: palette.field.length });
const glassColours = (palette: Palette) => ({
  u_colorBack: getShaderColorFromString('#00000000'),
  u_colorShadow: getShaderColorFromString(palette.shadow),
  u_colorHighlight: getShaderColorFromString(palette.highlight),
});

// One small moving mesh gradient feeds every surface; the glass blurs it, so it can stay low resolution.
const createField = (palette: Palette) => {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:320px;height:200px;opacity:0;pointer-events:none;z-index:-10';
  document.body.append(host);
  return new ShaderMount(host, meshGradientFragmentShader, {
    ...fieldColours(palette), u_distortion: 1, u_swirl: .8, u_grainMixer: 0, u_grainOverlay: 0, ...sizing('cover'),
  }, { preserveDrawingBuffer: true }, 0, 0, 1, 320 * 200);
};

const createScene = (element: HTMLElement, field: ShaderMount, withFigure: boolean) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const halo = document.createElement('canvas');
  const figure = document.createElement('canvas');
  const echoPink = document.createElement('canvas');
  const echoSky = document.createElement('canvas');
  let palette = readPalette();
  let place = { scale: 1, x: 0, y: 0 };

  // Shadows ignore the transform, so the shape is drawn far off the canvas and only its blurred shadow lands on it.
  const blurred = (sprite: HTMLCanvasElement, layers: [string, number][]) => {
    const c = sprite.getContext('2d')!;
    const off = 10000;
    c.clearRect(0, 0, sprite.width, sprite.height);
    for (const [colour, blur] of layers) {
      c.setTransform(place.scale, 0, 0, place.scale, -SPRITE.left * place.scale - off, -SPRITE.top * place.scale);
      c.shadowOffsetX = off;
      c.shadowColor = colour;
      c.shadowBlur = blur * place.scale;
      c.fill(FIGURE);
    }
  };

  // The figure, its pink halo and two coloured echoes are drawn once per size, then moved around each frame.
  const paintSprites = () => {
    const { scale } = place;
    for (const sprite of [halo, figure, echoPink, echoSky]) {
      sprite.width = Math.ceil(SPRITE.width * scale);
      sprite.height = Math.ceil(SPRITE.height * scale);
    }
    blurred(halo, [[palette.pink, 90], [palette.blush, 26]]);
    blurred(echoPink, [[palette.pink, 10]]);
    blurred(echoSky, [[palette.field[3], 10]]);
    const f = figure.getContext('2d')!;
    f.setTransform(scale, 0, 0, scale, -SPRITE.left * scale, -SPRITE.top * scale);
    f.save();
    f.clip(FIGURE);
    f.fillStyle = palette.pink;
    f.fill(FIGURE);
    // The black body is shifted away from the light, which leaves a pink rim along the face.
    f.translate(14, 4);
    f.fillStyle = palette.night;
    f.fill(FIGURE);
    f.restore();
  };

  const resize = () => {
    const { width, height } = element.getBoundingClientRect();
    const k = Math.min(1, 760 / Math.max(width, height, 1));
    canvas.width = Math.max(2, Math.round(width * k));
    canvas.height = Math.max(2, Math.round(height * k));
    const W = canvas.width, H = canvas.height;
    const wide = W / H > 1.1;
    const scale = wide ? H * .86 / 1000 : Math.min(H * .9 / 1000, W * 1.7 / 760);
    place = { scale, x: (wide ? .63 : .64) * W - 530 * scale, y: (wide ? .1 : .06) * H };
    if (withFigure) paintSprites();
  };

  const draw = (t: number) => {
    const W = canvas.width, H = canvas.height;
    const { scale } = place;
    const sway = { x: Math.sin(t * .23) * .012 * W, y: Math.sin(t * .37 + 1) * .008 * H };
    const pulse = .82 + .18 * Math.sin(t * .9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(field.canvasElement, 0, 0, W, H);

    // Night falls from the top, as in the reference heroes.
    const night = ctx.createLinearGradient(0, 0, 0, H);
    night.addColorStop(0, rgba(palette.night, .78));
    night.addColorStop(.5, rgba(palette.night, 0));
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, W, H);

    // The pink flare: a wide glow, a hot core and a horizontal streak that the ribs break into dashes.
    const light = withFigure
      ? { x: place.x + LIGHT.x * scale + sway.x + Math.sin(t * .41) * .012 * W, y: place.y + LIGHT.y * scale + sway.y, r: .62 * H }
      : { x: .5 * W + Math.sin(t * .31) * .1 * W, y: .8 * H, r: 1.05 * H };
    const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.r * (1 + .05 * Math.sin(t * .7)));
    glow.addColorStop(0, rgba(palette.pink, pulse));
    glow.addColorStop(.4, rgba(palette.pink, .58 * pulse));
    glow.addColorStop(1, rgba(palette.pink, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    const core = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, .1 * H);
    core.addColorStop(0, rgba(palette.highlight, .8 * pulse));
    core.addColorStop(.4, rgba(palette.blush, .45 * pulse));
    core.addColorStop(1, rgba(palette.blush, 0));
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(light.x, light.y);
    ctx.scale(1, .05);
    const streak = ctx.createRadialGradient(0, 0, 0, 0, 0, .55 * W);
    streak.addColorStop(0, rgba(palette.highlight, .6 * pulse));
    streak.addColorStop(.3, rgba(palette.pink, .5 * pulse));
    streak.addColorStop(1, rgba(palette.pink, 0));
    ctx.fillStyle = streak;
    ctx.fillRect(-W, -H * 20, W * 2, H * 40);
    ctx.restore();

    if (withFigure) {
      const x = place.x + SPRITE.left * scale + sway.x, y = place.y + SPRITE.top * scale + sway.y;
      ctx.globalAlpha = .75 + .25 * pulse;
      ctx.drawImage(halo, x, y);
      // Chromatic echoes drift apart and back behind the figure.
      const split = (.025 + .02 * Math.sin(t * .53)) * W;
      ctx.globalAlpha = .8;
      ctx.drawImage(echoPink, x - split, y - split * .15);
      ctx.drawImage(echoSky, x + split * .8, y + split * .1);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.drawImage(figure, x, y);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  const repaint = (next: Palette) => { palette = next; if (withFigure) paintSprites(); };
  resize();
  return { canvas, resize, draw, repaint };
};

export const mountGlass = async (elements: HTMLElement[], animate: boolean) => {
  let palette = readPalette();
  const field = createField(palette);
  field.setFrame(0);

  const surfaces = await Promise.all(elements.map(async element => {
    const scene = createScene(element, field, element.hasAttribute('data-figure'));
    scene.draw(0);
    const image = new Image();
    image.src = scene.canvas.toDataURL('image/png');
    await image.decode();
    const mount = new ShaderMount(element, flutedGlassFragmentShader, {
      u_image: image, ...glassColours(palette), ...GLASS, ...ribs(element.clientWidth),
      u_marginLeft: 0, u_marginRight: 0, u_marginTop: 0, u_marginBottom: 0, u_grainMixer: 0, u_grainOverlay: .05,
      ...sizing('cover'),
      // The glass redraws every frame, so it renders at 1x and at most about 1.6 megapixels.
    }, undefined, 0, 0, 1, 1600 * 1000);
    const internals = mount as unknown as MountInternals;
    const upload = () => {
      const { gl } = internals;
      const unit = internals.textureUnitMap.get('u_image');
      const texture = internals.textures.get('u_image');
      if (unit === undefined || !texture) return;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene.canvas);
    };
    element.dataset.ready = '';
    return { element, scene, mount, internals, upload, visible: false };
  }));

  const start = performance.now();
  const render = (now: number, all = false) => {
    const t = (now - start) / 1000;
    field.setFrame(t * 350);
    for (const surface of surfaces) {
      if (!all && !surface.visible) continue;
      surface.scene.draw(t);
      surface.upload();
      // The ribs' refraction slides slowly from side to side.
      surface.mount.setUniforms({ u_shift: Math.sin(t * .27) * .3 });
      surface.mount.setFrame(t * 1000);
    }
  };

  // Animate at about 30 frames a second while a surface is on screen and the tab is visible.
  let raf = 0, last = 0;
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 32) return;
    last = now;
    render(now);
  };
  const update = () => {
    const run = animate && !document.hidden && surfaces.some(s => s.visible);
    if (run && !raf) raf = requestAnimationFrame(tick);
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const surface = surfaces.find(s => s.element === entry.target);
      if (surface) surface.visible = entry.isIntersecting;
    }
    update();
  });
  surfaces.forEach(s => observer.observe(s.element));
  document.addEventListener('visibilitychange', update);

  // A new size or a palette change redraws straight away, which is all a still scene needs.
  const resizer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const surface = surfaces.find(s => s.element === entry.target);
      if (!surface) continue;
      surface.scene.resize();
      surface.mount.setUniforms(ribs(surface.element.clientWidth));
      const { gl, uniformLocations } = surface.internals;
      const location = uniformLocations.u_imageAspectRatio;
      if (location) gl.uniform1f(location, surface.scene.canvas.width / surface.scene.canvas.height);
    }
    render(performance.now(), true);
  });
  surfaces.forEach(s => resizer.observe(s.element));
  new MutationObserver(() => {
    palette = readPalette();
    field.setUniforms(fieldColours(palette));
    surfaces.forEach(s => { s.scene.repaint(palette); s.mount.setUniforms(glassColours(palette)); });
    render(performance.now(), true);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-on'] });

  render(start, true);
};
