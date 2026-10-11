// Luminance from the actual photographs drives every character in Hackerlair.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const alphabet = ' .,:;i!+*tfLCG08@#';
const fields = Array.from(document.querySelectorAll<HTMLImageElement>(
  '.wd-hacker-image > img, .cy-project-image > img, .cy-archive-image > img, .cy-organic > img, .wd-capability-art > img, .wd-observation > img, .wd-mini-art > img, .ag-study-art > img, .ht-live-art > img, .ht-project-art > img'
)).map(image => {
  const host = image.parentElement!;
  host.classList.add('wd-ascii-host');
  const canvas = document.createElement('canvas');
  canvas.className = 'wd-ascii-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  return { image, host, canvas, ctx: canvas.getContext('2d'), pixels: new Uint8Array(), cols: 0, rows: 0,
    width: 0, height: 0, visible: false, x: .5, y: .5, hover: false, source: '', dirty: true };
});
type Field = typeof fields[number];
let frame = 0, last = 0;
const palette={background:'#040806',primary:'182,255,137',secondary:'194,157,255'};
const active = () => root.dataset.world === 'hackerlair' && !document.hidden && !root.dataset.morphing;
function sample(field: Field) {
  const { image, host, canvas } = field;
  if (!image.complete || !image.naturalWidth || !field.ctx) return;
  const width = image.clientWidth, height = image.clientHeight;
  if (width < 2 || height < 2) return;
  field.width = width; field.height = height;
  const pitch = width < 400 ? 7 : 8;
  field.cols = Math.min(150, Math.max(12, Math.round(width / pitch)));
  field.rows = Math.min(135, Math.max(6, Math.round(height / (width / field.cols * 1.7))));
  const buffer = document.createElement('canvas');
  buffer.width = field.cols; buffer.height = field.rows;
  const sampleContext = buffer.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) return;
  // Match object-fit:cover so character edges line up with the underlying photograph.
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sw = width / scale, sh = height / scale;
  try {
    sampleContext.drawImage(image, (image.naturalWidth-sw)/2, (image.naturalHeight-sh)/2, sw, sh, 0, 0, field.cols, field.rows);
    const rgba = sampleContext.getImageData(0, 0, field.cols, field.rows).data;
    field.pixels = new Uint8Array(field.cols * field.rows);
    for (let i=0;i<field.pixels.length;i++) field.pixels[i] = .2126*rgba[i*4]+.7152*rgba[i*4+1]+.0722*rgba[i*4+2];
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    canvas.style.left = `${image.offsetLeft}px`; canvas.style.top = `${image.offsetTop}px`;
    field.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    field.source = image.currentSrc; field.dirty = false;
    host.classList.add('wd-ascii-ready');
  } catch {
    // The original image remains visible if a future external source cannot be sampled.
    host.classList.remove('wd-ascii-ready'); field.pixels = new Uint8Array(); field.dirty = false;
  }
}
function paint(field: Field, time: number) {
  if (field.dirty || field.source !== field.image.currentSrc) sample(field);
  const {ctx, cols, rows, pixels, width, height} = field;
  if (!ctx || !pixels.length) return;
  const cw = width / cols, ch = height / rows;
  ctx.fillStyle=palette.background; ctx.fillRect(0,0,width,height);
  ctx.font=`${Math.max(6, ch*.92)}px "JetBrains Mono Variable", monospace`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  const t = reduced.matches ? 0 : time * .00035;
  for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
    const nx=x/cols, ny=y/rows;
    const distance=Math.hypot((nx-field.x)*width/height, ny-field.y);
    const ripple = !reduced.matches && field.hover ? Math.sin(distance*38-t*15)*Math.exp(-distance*3)*3 : 0;
    const drift = reduced.matches ? 0 : Math.sin(ny*11+t*2)*Math.cos(nx*9-t)*1.8;
    const sx=Math.max(0,Math.min(cols-1,Math.round(x+drift+ripple)));
    const light=pixels[y*cols+sx]/255;
    const phase=Math.sin(nx*16+ny*12+t*4);
    const brightness=Math.min(1, Math.pow(light,.72));
    const index=Math.min(alphabet.length-1,Math.floor(brightness*(alphabet.length-1)));
    if (index===0) continue;
    ctx.fillStyle=phase>.8 ? `rgba(${palette.secondary},${.25+brightness*.65})` : `rgba(${palette.primary},${.18+brightness*.8})`;
    ctx.fillText(alphabet[index],(x+.5)*cw,(y+.5)*ch+Math.sin(nx*14+t)*ripple*.35,cw*1.3);
  }
}
function stop(){cancelAnimationFrame(frame);frame=0;}
function draw(time:number){
  frame=0;if(!active())return;
  if(time-last>70){fields.filter(field=>field.visible).forEach(field=>paint(field,time));last=time;}
  if(!reduced.matches && fields.some(field=>field.visible))frame=requestAnimationFrame(draw);
}
function refresh(){
  stop();if(!active())return;
  const styles=getComputedStyle(root);
  palette.background=styles.getPropertyValue('--ht-art-bg').trim()||'#040806';
  palette.primary=styles.getPropertyValue('--ht-art-primary').trim()||'182,255,137';
  palette.secondary=styles.getPropertyValue('--ht-art-secondary').trim()||'194,157,255';
  fields.filter(field=>field.visible).forEach(field=>paint(field,performance.now()));
  if(!reduced.matches&&fields.some(field=>field.visible))frame=requestAnimationFrame(draw);
}
const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){const field=fields.find(item=>item.host===entry.target);if(field)field.visible=entry.isIntersecting;}
  refresh();
},{rootMargin:'60px'});
const resize=new ResizeObserver(entries=>{for(const entry of entries){const field=fields.find(item=>item.image===entry.target);if(field)field.dirty=true;}refresh();});
for(const field of fields){
  observer.observe(field.host);resize.observe(field.image);
  field.image.addEventListener('load',()=>{field.dirty=true;refresh();});
  field.host.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse')return;const rect=field.image.getBoundingClientRect();field.x=(event.clientX-rect.left)/rect.width;field.y=(event.clientY-rect.top)/rect.height;field.hover=true;});
  field.host.addEventListener('pointerleave',()=>{field.hover=false;});
}
window.addEventListener('webdecor:worldchange',()=>{fields.forEach(field=>field.dirty=true);refresh();});
window.addEventListener('webdecor:terminaltheme',refresh);
window.addEventListener('webdecor:morphstart',stop);
document.addEventListener('visibilitychange',refresh);
window.addEventListener('pagehide',stop);window.addEventListener('pageshow',refresh);
reduced.addEventListener('change',refresh);
document.fonts.ready.then(refresh);
