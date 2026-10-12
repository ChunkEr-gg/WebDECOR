const root = document.documentElement;
const toggles = document.querySelectorAll<HTMLButtonElement>('[data-activation-toggle]');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const storageKey = 'webdecor-activated';

if (root.dataset.world === 'cybercore' && toggles.length) {
  const status = document.querySelector<HTMLElement>('[data-activation-status]');
  const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  let cleanup: ReturnType<typeof setTimeout> | undefined;
  let sweep: HTMLElement | undefined;
  let sweepMotion: Animation | undefined;
  const fields: Array<{ image: HTMLImageElement; host: HTMLElement; canvas: HTMLCanvasElement; visible: boolean; dirty: boolean }> = [];
  const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const active = () => root.dataset.activated === 'true';

  function stopTransition() {
    clearTimeout(cleanup);
    delete root.dataset.activationTransition;
    sweepMotion?.cancel();
    sweep?.remove();
    sweep = undefined;
    sweepMotion = undefined;
  }

  function render(field: typeof fields[number]) {
    if (!active() || !field.visible || !field.dirty || document.hidden || !field.image.complete || !field.image.naturalWidth) return;
    const box = field.host.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // A real ordered-dither pass, with the image's original alt text retained.
    const pitch = box.width > 700 ? 3 : 2;
    const w = Math.ceil(box.width / pitch), h = Math.ceil(box.height / pitch);
    field.canvas.width = w; field.canvas.height = h;
    const ctx = field.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const scale = Math.max(w / field.image.naturalWidth, h / field.image.naturalHeight);
    const iw = field.image.naturalWidth * scale, ih = field.image.naturalHeight * scale;
    try {
      ctx.drawImage(field.image, (w-iw)/2, (h-ih)/2, iw, ih);
      const pixels = ctx.getImageData(0,0,w,h);
      for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
        const index = (y*w+x)*4;
        const value = ((pixels.data[index]*.2126 + pixels.data[index+1]*.7152 + pixels.data[index+2]*.0722)/255-.5)*1.1+.5;
        const light = value > (bayer[(y%4)*4+x%4]+.5)/16;
        pixels.data[index] = light ? 242 : 30;
        pixels.data[index+1] = light ? 242 : 30;
        pixels.data[index+2] = light ? 240 : 30;
        pixels.data[index+3] = 255;
      }
      ctx.putImageData(pixels,0,0);
      field.host.classList.add('wd-dither-ready');
      field.dirty = false;
    } catch {
      // Cross-origin restrictions leave the original image visible.
      field.host.classList.remove('wd-dither-ready');
    }
  }

  document.querySelectorAll<HTMLImageElement>('.cy-archive-image>img,.wd-capability-art>img,.wd-observation>img,.wd-preview-cybercore>.wd-preview-wallpaper,.wd-preview-cybercore .wd-preview-picture>img,.wd-preview-cybercore .wd-preview-ascii>img').forEach(image => {
    const host = image.parentElement!;
    const canvas = document.createElement('canvas');
    canvas.className = 'wd-dither-canvas';
    canvas.setAttribute('aria-hidden','true');
    host.appendChild(canvas);
    const field = { image,host,canvas,visible:!('IntersectionObserver' in window),dirty:true };
    fields.push(field);
    image.addEventListener('load',()=>{field.dirty=true;render(field)});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries=>{
        field.visible = entries[0].isIntersecting;
        if(field.visible)render(field);
      },{rootMargin:'100px'}).observe(host);
    }
    if ('ResizeObserver' in window) new ResizeObserver(()=>{
      field.dirty=true;render(field);
    }).observe(host);
  });

  function sync() {
    const enabled = active();
    const action=enabled?'Switch to the light appearance':'Switch to Cybercore';
    toggles.forEach(toggle=>{
      toggle.setAttribute('aria-pressed',String(enabled));
      toggle.setAttribute('aria-label',toggle.hasAttribute('data-activation-logo')?`WebDECOR — ${action.toLowerCase()}`:action);
      const label=toggle.querySelector('[data-theme-label]');
      if(label)label.textContent=enabled?'LIGHT APPEARANCE':'ACTIVATE CYBERCORE';
      toggle.title=action;
    });
    if(theme)theme.content=enabled?'#1E1E1E':'#e6e6e2';
    fields.forEach(render);
  }

  function change(enabled: boolean, animate = true, persist = true) {
    stopTransition();
    if(animate&&!reduced.matches&&!document.hidden) {
      root.dataset.activationTransition='true';
      // Flush the initial colours so both directions interpolate consistently.
      void root.offsetWidth;
      if(enabled && 'animate' in document.documentElement) {
        sweep=document.createElement('div');sweep.className='wd-power-sweep';sweep.setAttribute('aria-hidden','true');document.body.appendChild(sweep);
        sweepMotion=sweep.animate([{transform:'translateY(65%)',opacity:0},{opacity:1,offset:.25},{transform:'translateY(-65%)',opacity:0}],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});
        sweepMotion.finished.catch(()=>{});
      }
      cleanup=setTimeout(stopTransition,900);
    }
    if(enabled)root.dataset.activated='true';else delete root.dataset.activated;
    if(persist)try{localStorage.setItem(storageKey,String(enabled))}catch{}
    sync();
    if(animate&&status)status.textContent=enabled?'Cybercore activated.':'Cybercore deactivated.';
    window.dispatchEvent(new CustomEvent('webdecor:activationchange',{detail:{active:enabled}}));
  }

  toggles.forEach(toggle=>toggle.addEventListener('click',()=>change(!active())));
  window.addEventListener('storage',event=>{
    if(event.key===storageKey||event.key===null)change(event.key===storageKey&&event.newValue==='true',false,false);
  });
  window.addEventListener('pageshow',()=>{try{change(localStorage.getItem(storageKey)==='true',false,false)}catch{sync()}});
  window.addEventListener('pagehide',stopTransition);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stopTransition();else fields.forEach(render);
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)stopTransition()});
  sync();
}

export {};
