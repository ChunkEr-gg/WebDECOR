// Live fluted glass for /concept/ (Paper Shaders).
// Behind the glass sits a scene drawn on a 2D canvas: a slowly moving mesh gradient of saturated sky blues, a pale mist
// down the right, and on the hero a blurred navy figure walking out of a long trail of peach, pink, magenta and violet light.
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

type Palette = {
  field: string[]; mist: string; figure: string; rim: string;
  peach: string; pink: string; violet: string; magenta: string; shadow: string; highlight: string;
};

// A person in three-quarter view, leaning forward into the light on the left, in a 1000-unit box: head, neck, body and two arms.
// The body runs off the bottom edge. The glass and the blur make it a presence rather than a portrait.
const FIGURE = (() => {
  const path = new Path2D();
  path.ellipse(565, 200, 52, 64, .12, 0, Math.PI * 2);
  for (const d of [
    'M530 250L595 250L610 310L535 310Z',
    'M495 300C460 310 440 340 435 390C428 460 440 540 460 620C472 680 480 760 485 1000L705 1000C708 860 712 760 720 680C735 580 752 480 745 400C740 340 720 308 680 298C630 288 540 290 495 300Z',
    'M450 340C420 400 400 480 392 560C388 610 390 650 396 680C410 690 428 688 436 676C440 620 450 540 470 470Z',
    'M730 340C760 390 782 450 792 520C800 570 804 610 800 640C788 652 770 650 764 640C760 590 752 530 736 470Z',
  ]) path.addPath(new Path2D(d));
  return path;
})();
const SPRITE = { left: 240, top: 0, width: 760, height: 1080 };
const FIGURE_BLUR = 48;
// The light around the figure, in figure units: [x, y, radius x, radius y, colour, strength].
type Glow = [number, number, number, number, keyof Palette, number];
const FIGURE_LIGHT: Glow[] = [
  [180, 560, 230, 250, 'pink', .65],
  [250, 640, 170, 160, 'peach', .7],
  [60, 840, 360, 100, 'pink', .85],
  [250, 790, 170, 110, 'violet', .7],
  [340, 300, 210, 280, 'peach', 1],
  [370, 540, 160, 230, 'pink', 1],
  [450, 500, 110, 300, 'magenta', .85],
  [400, 760, 140, 220, 'magenta', 1],
  [380, 720, 90, 140, 'magenta', .8],
  [640, 960, 200, 110, 'violet', .5],
];
// The closing call to action has no figure: the same light, rising from the bottom of the box (box fractions, radii in heights).
const BOX_LIGHT: Glow[] = [
  [.2, .6, .45, .35, 'peach', .55],
  [.36, .82, .6, .38, 'pink', .75],
  [.55, 1.02, .7, .45, 'magenta', .9],
  [.82, .9, .45, .3, 'pink', .45],
];
// Ghosts of the figure trail behind it to the left: [offset in figure units, colour, opacity, blur].
const TRAIL: [number, keyof Palette, number, number][] = [
  [270, 'peach', .3, 70], [180, 'pink', .35, 64], [90, 'magenta', .4, 56],
];

const GLASS = {
  u_shadows: .2, u_angle: 0, u_distortion: .55, u_shift: 0, u_blur: .3, u_edges: .25, u_stretch: 0,
  u_distortionShape: GlassDistortionShapes.lens, u_highlights: .15, u_shape: GlassGridShapes.lines,
};
// The shader fits a set number of ribs across the surface (u_size 0 is 200 ribs, 1 is 5).
// Fine ribs about 11px wide, and never fewer than 24 across.
const ribs = (width: number) => ({ u_size: (200 - Math.min(200, Math.max(24, width / 11))) / 195 });

const readPalette = (): Palette => {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    field: [1, 2, 3, 4].map(i => token(`--field-${i}`)),
    mist: token('--scene-mist'), figure: token('--scene-figure'), rim: token('--sky-soft'),
    peach: token('--scene-peach'), pink: token('--scene-pink'), violet: token('--scene-violet'), magenta: token('--scene-magenta'),
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
    ...fieldColours(palette), u_distortion: .7, u_swirl: .5, u_grainMixer: 0, u_grainOverlay: 0, ...sizing('cover'),
  }, { preserveDrawingBuffer: true }, 0, 0, 1, 320 * 200);
};

// A soft elliptical light.
const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, colour: string, alpha: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(colour, alpha));
  g.addColorStop(.5, rgba(colour, alpha * .7));
  g.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
};

const createScene = (element: HTMLElement, field: ShaderMount, withFigure: boolean) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const figure = document.createElement('canvas');
  const rim = document.createElement('canvas');
  const ghosts = TRAIL.map(() => document.createElement('canvas'));
  let palette = readPalette();
  let place = { scale: 1, x: 0, y: 0 };

  // Shadows ignore the transform, so the shape is drawn far off the canvas and only its blurred shadow lands on it.
  const blurred = (sprite: HTMLCanvasElement, colour: string, blur: number) => {
    const c = sprite.getContext('2d')!;
    const off = 10000;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, sprite.width, sprite.height);
    c.setTransform(place.scale, 0, 0, place.scale, -SPRITE.left * place.scale - off, -SPRITE.top * place.scale);
    c.shadowOffsetX = off;
    c.shadowColor = colour;
    c.shadowBlur = blur * place.scale;
    c.fill(FIGURE);
    c.shadowColor = 'transparent';
    return c;
  };

  // The figure, its pale rim and its warm ghosts are drawn once per size and palette, then moved each frame.
  const paintSprites = () => {
    for (const sprite of [figure, rim, ...ghosts]) {
      sprite.width = Math.ceil(SPRITE.width * place.scale);
      sprite.height = Math.ceil(SPRITE.height * place.scale);
    }
    // Navy at the head and shoulders, turning violet and magenta towards the bottom.
    const c = blurred(figure, palette.figure, FIGURE_BLUR);
    c.setTransform(place.scale, 0, 0, place.scale, -SPRITE.left * place.scale, -SPRITE.top * place.scale);
    c.globalCompositeOperation = 'source-atop';
    const tint = c.createLinearGradient(0, 480, 0, 1000);
    tint.addColorStop(0, rgba(palette.violet, 0));
    tint.addColorStop(.5, rgba(palette.violet, .55));
    tint.addColorStop(1, rgba(palette.magenta, .8));
    c.fillStyle = tint;
    c.fillRect(SPRITE.left, 480, SPRITE.width, 600);
    c.globalCompositeOperation = 'source-over';
    blurred(rim, palette.rim, FIGURE_BLUR);
    TRAIL.forEach(([, colour, , blur], i) => blurred(ghosts[i], palette[colour] as string, blur));
  };

  const resize = () => {
    const { width, height } = element.getBoundingClientRect();
    const k = Math.min(1, 760 / Math.max(width, height, 1));
    canvas.width = Math.max(2, Math.round(width * k));
    canvas.height = Math.max(2, Math.round(height * k));
    const W = canvas.width, H = canvas.height;
    // The figure stands right of centre with its head a fifth of the way down, and runs off the bottom.
    const scale = Math.min(H / 1000, W * .9 / 424);
    place = { scale, x: (W / H > 1.1 ? .59 : .6) * W - 565 * scale, y: H - 1000 * scale };
    if (withFigure) paintSprites();
  };

  const draw = (t: number) => {
    const W = canvas.width, H = canvas.height;
    const { scale } = place;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(field.canvasElement, 0, 0, W, H);

    // A pale mist down the right-hand side, warming at the bottom corner.
    glow(ctx, .9 * W, .34 * H, .3 * W, .62 * H, palette.mist, .9);
    glow(ctx, .7 * W, .02 * H, .2 * W, .2 * H, palette.mist, .4);
    glow(ctx, .9 * W, H, .24 * W, .2 * H, palette.peach, .25);

    const breathe = .9 + .1 * Math.sin(t * .8);
    if (!withFigure) {
      BOX_LIGHT.forEach(([x, y, rx, ry, colour, a], i) => {
        const drift = Math.sin(t * (.25 + i * .07) + i) * .06 * W;
        glow(ctx, x * W + drift, y * H, rx * H * 1.6, ry * H, palette[colour] as string, a * breathe);
      });
      return;
    }

    // The figure drifts and its trail stretches and gathers, as if it were walking out of its own light.
    const sway = { x: Math.sin(t * .23) * .015 * W, y: Math.sin(t * .37 + 1) * .006 * H };
    const stretch = 1 + .35 * Math.sin(t * .45);
    const ox = place.x + sway.x, oy = place.y + sway.y;
    FIGURE_LIGHT.forEach(([x, y, rx, ry, colour, a], i) => {
      const lag = (500 - x) * (stretch - 1) * .25;
      glow(ctx, ox + (x - lag) * scale, oy + y * scale, rx * scale, ry * scale, palette[colour] as string, a * (i > 3 ? breathe : 1));
    });
    const sx = ox + SPRITE.left * scale, sy = oy + SPRITE.top * scale;
    TRAIL.forEach(([offset, , alpha], i) => {
      ctx.globalAlpha = alpha * breathe;
      ctx.drawImage(ghosts[i], sx - offset * stretch * scale, sy + Math.sin(t * .6 + i) * 6 * scale);
    });
    ctx.globalAlpha = .4;
    ctx.drawImage(rim, sx + 24 * scale, sy - 4 * scale);
    ctx.globalAlpha = 1;
    ctx.drawImage(figure, sx, sy);
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
