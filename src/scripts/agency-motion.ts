const root=document.documentElement;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const hero=document.querySelector<HTMLElement>('.cy-hero');
const bars=Array.from(document.querySelectorAll<HTMLElement>('.cy-system-cell i'));
let pointerFrame=0,pendingX=.5,pendingY=.5;
hero?.addEventListener('pointermove',event=>{
 if(reduced.matches||event.pointerType!=='mouse')return;
 const box=hero.getBoundingClientRect();pendingX=(event.clientX-box.left)/box.width;pendingY=(event.clientY-box.top)/box.height;
 if(pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;hero.style.setProperty('--scene-x',`${(pendingX-.5)*18}px`);hero.style.setProperty('--scene-y',`${(pendingY-.5)*12}px`);bars.forEach((bar,index)=>bar.style.transform=`scaleY(${.55+Math.abs(Math.sin(index*.65+pendingX*4+pendingY*2))*.65})`)});
});
hero?.addEventListener('pointerleave',()=>{cancelAnimationFrame(pointerFrame);pointerFrame=0;pendingX=pendingY=.5;bars.forEach(bar=>bar.style.transform='');hero.style.setProperty('--scene-x','0px');hero.style.setProperty('--scene-y','0px')});
document.querySelectorAll<HTMLElement>('.cy-project-image').forEach(card=>{
 let raf=0,x=0,y=0;
 card.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType!=='mouse')return;const box=card.getBoundingClientRect();x=((event.clientX-box.left)/box.width-.5)*2;y=((event.clientY-box.top)/box.height-.5)*2;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;card.style.setProperty('--card-x',String(x));card.style.setProperty('--card-y',String(y))})});
 card.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);raf=0;card.style.setProperty('--card-x','0');card.style.setProperty('--card-y','0')});
});
// Animate actual type and images, with complete static rendering underneath.
const motions=new Set<Animation>();
const play=(element:Element,frames:Keyframe[],options:KeyframeAnimationOptions)=>{
 if(reduced.matches||!('animate' in element))return;
 const animation=element.animate(frames,options);motions.add(animation);animation.finished.catch(()=>{}).finally(()=>motions.delete(animation));
};
function wrapWords(element:Element){
 function visit(parent:Node){Array.from(parent.childNodes).forEach(node=>{if(node.nodeType===3&&node.textContent?.trim()){const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){fragment.appendChild(document.createTextNode(word));return}const span=document.createElement('span');span.className='wd-motion-word';span.textContent=word;fragment.appendChild(span)});parent.replaceChild(fragment,node)}else if(node.nodeType===1)visit(node)})}
 visit(element);
}
const headings=Array.from(document.querySelectorAll<HTMLElement>('.cy-manifesto h2,.ag-section-heading h2,.cy-section-heading h2,.cy-studio-copy h2,.ag-process-heading h2,.wd-hero-copy h2,.wd-studio-intro h2,.wd-manifesto h2,.wd-capability-heading h2,.wd-case-interface-heading h2,.wd-brief-intro h2,.ag-invitation h2'));
headings.forEach(wrapWords);
const images=Array.from(document.querySelectorAll<HTMLElement>('.cy-project-image > img,.wd-capability-art > img,.wd-observation > img,.ag-study-art > img'));
const visited=new WeakMap<Element,string>();
const artworks=Array.from(document.querySelectorAll<HTMLElement>('.wd-collage-art figure,.wd-paper-back,.wd-collage-sticker,.wd-swiss-art svg'));
const candidates=[...headings,...images,...artworks];
function enter(element:HTMLElement,force=false){
 const world=root.dataset.world||'cybercore';if(root.dataset.morphing||reduced.matches||(!force&&visited.get(element)===world))return;visited.set(element,world);
 if(world==='hackerlair')return;
 if(artworks.includes(element)){
  if(world==='collage')play(element,[{transform:'translateY(45px) rotate(-7deg) scale(.96)',opacity:0},{transform:'translateY(0) rotate(0) scale(1)',opacity:1}],{duration:950,delay:artworks.indexOf(element)*90,easing:'cubic-bezier(.16,1,.3,1)'});
  if(world==='swiss')play(element,[{clipPath:'inset(0 100% 0 0)',transform:'rotate(-20deg)',opacity:0},{clipPath:'inset(0)',transform:'rotate(0)',opacity:1}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});
 }else if(element.tagName==='IMG'){
  play(element,[{clipPath:world==='collage'?'inset(0 100% 0 0)':'inset(12% 0 12% 0)',opacity:.35},{clipPath:'inset(0 0 0 0)',opacity:1}],{duration:world==='swiss'?700:850,easing:'cubic-bezier(.16,1,.3,1)'});
 }else{
  element.querySelectorAll('.wd-motion-word').forEach((word,index)=>play(word,[{transform:world==='collage'?'translateY(40px) rotate(-5deg)':world==='swiss'?'translateX(-25px)':'translateY(25px)',opacity:.1,filter:'blur(0px)'},{transform:'translateY(0) rotate(0)',opacity:1,filter:'blur(0px)'}],{duration:world==='swiss'?650:750,delay:Math.min(index,18)*35,easing:'cubic-bezier(.16,1,.3,1)'}));
 }
}
function intro(event?:Event){
 const morphed=!!(event as CustomEvent<{morph?:string}>|undefined)?.detail?.morph;
 motions.forEach(animation=>animation.cancel());motions.clear();
 candidates.forEach(element=>{const rect=element.getBoundingClientRect();if(rect.top<window.innerHeight&&rect.bottom>0){if(morphed)visited.set(element,root.dataset.world||'cybercore');else enter(element,true)}});
 if(!morphed&&root.dataset.world==='cybercore'&&hero){const box=hero.getBoundingClientRect();if(box.bottom>0&&box.top<window.innerHeight){hero.querySelectorAll<SVGGeometryElement>('.cy-title-cell .cy-wordmark .wd-logo-face path,.cy-title-cell .cy-wordmark .wd-logo-face rect').forEach((path,index)=>{if(typeof path.getTotalLength!=='function')return;const length=path.getTotalLength();play(path,[{strokeDasharray:`${length}`,strokeDashoffset:length,opacity:.2},{strokeDasharray:`${length}`,strokeDashoffset:0,opacity:1}],{duration:1200,delay:index*45,easing:'cubic-bezier(.16,1,.3,1)'})})}}
}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)enter(entry.target as HTMLElement)}),{threshold:.12});candidates.forEach(element=>observer.observe(element));}
window.addEventListener('webdecor:morphstart',()=>{motions.forEach(animation=>animation.cancel());motions.clear()});window.addEventListener('webdecor:worldchange',intro);intro();
// An ambient field is active only while the hero is on screen.
if(hero){
 const canvas=document.createElement('canvas');canvas.className='wd-hero-field';canvas.setAttribute('aria-hidden','true');hero.appendChild(canvas);
 const ctx=canvas.getContext('2d');let fieldFrame=0,width=0,height=0,last=0,visible=true;
 function size(){const box=hero!.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0)}
 function stop(){cancelAnimationFrame(fieldFrame);fieldFrame=0;ctx?.clearRect(0,0,width,height)}
 function run(){if(fieldFrame||!ctx||!visible||reduced.matches||document.hidden||root.dataset.morphing||root.dataset.world!=='cybercore')return;fieldFrame=requestAnimationFrame(draw)}
 function draw(now:number){
  fieldFrame=0;if(!ctx||!visible||reduced.matches||document.hidden||root.dataset.morphing||root.dataset.world!=='cybercore')return;
  if(now-last<40){fieldFrame=requestAnimationFrame(draw);return}last=now;
  ctx.clearRect(0,0,width,height);const time=now*.00025;
  const pitch=width<600?35:45;
  for(let y=20;y<height;y+=pitch){ctx.beginPath();for(let x=20;x<width;x+=pitch){const distance=Math.hypot(x-pendingX*width,y-pendingY*height);const wave=Math.sin(time*2+x*.01+y*.009)*4+Math.cos(distance*.02-time*3)*8*Math.exp(-distance/250);const py=y+wave;ctx.lineTo(x,py);ctx.fillStyle=root.dataset.activated==='true'?'rgba(255,138,99,.5)':'rgba(162,40,33,.16)';ctx.fillRect(x,py,1.3,1.3)}ctx.strokeStyle=root.dataset.activated==='true'?'rgba(255,138,99,.085)':'rgba(28,28,27,.035)';ctx.lineWidth=.5;ctx.stroke()}
  fieldFrame=requestAnimationFrame(draw);
 }
 size();if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)run();else stop()}).observe(hero)}
 window.addEventListener('webdecor:morphstart',stop);window.addEventListener('resize',()=>{size();run()});window.addEventListener('webdecor:worldchange',()=>{stop();size();run()});document.addEventListener('visibilitychange',()=>document.hidden?stop():run());window.addEventListener('pagehide',stop);window.addEventListener('pageshow',run);reduced.addEventListener('change',()=>reduced.matches?stop():run());run();
}
reduced.addEventListener('change',()=>{if(reduced.matches){motions.forEach(animation=>animation.cancel());motions.clear();cancelAnimationFrame(pointerFrame);bars.forEach(bar=>bar.style.transform='');hero?.style.setProperty('--scene-x','0px');hero?.style.setProperty('--scene-y','0px')}});
