import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';

const code=(await build({entryPoints:['src/scripts/agency-ascii.ts'],bundle:true,write:false,format:'iife',platform:'browser'})).outputFiles[0].text;
function harness({world='hackerlair',reduced=false,readable=true}={}){
  class Target{
    constructor(){this.events={};this.dataset={};this.children=[];this.styles={};this.style={};this.classes=new Set();this.classList={add:cls=>this.classes.add(cls),remove:cls=>this.classes.delete(cls)};}
    addEventListener(name,callback){(this.events[name]??=[]).push(callback)}
    emit(name,event={}){for(const cb of this.events[name]||[])cb(event)}
    appendChild(child){this.children.push(child);return child}
    setAttribute(){}
  }
  const root=new Target(),document=new Target(),window=new Target(),media=new Target(),host=new Target(),image=new Target();
  root.dataset.world=world;media.matches=reduced;document.documentElement=root;document.hidden=false;
  Object.assign(image,{parentElement:host,complete:true,naturalWidth:200,naturalHeight:100,clientWidth:140,clientHeight:140,offsetLeft:0,offsetTop:0,currentSrc:'/images/crt-eye.webp'});
  image.getBoundingClientRect=()=>({left:0,top:0,width:140,height:140});
  const contexts=[],canvases=[],intersections=[],resizes=[],frames=new Map();let next=0,clock=100;
  document.querySelectorAll=()=>[image];
  document.createElement=()=>{
    const canvas=new Target();canvases.push(canvas);
    const ctx={fills:[],glyphs:[],draws:[],setTransform(){},drawImage(...args){this.draws.push(args)},getImageData(){if(!readable)throw new Error('Unreadable image');const pixels=new Uint8ClampedArray(canvas.width*canvas.height*4);for(let i=0;i<pixels.length;i+=4){pixels[i]=pixels[i+1]=pixels[i+2]=150;pixels[i+3]=255;}return{data:pixels}},fillRect(...args){this.fills.push({color:this.fillStyle,args})},fillText(char,x,y,width){this.glyphs.push({char,x,y,width,color:this.fillStyle})}};
    contexts.push(ctx);canvas.getContext=()=>ctx;return canvas;
  };
  document.fonts={ready:Promise.resolve()};
  const css={'--ht-art-bg':'#080c0a','--ht-art-primary':'182,255,137','--ht-art-secondary':'194,157,255'};
  class IntersectionObserver{constructor(cb){this.callback=cb;intersections.push(this)}observe(){}}
  class ResizeObserver{constructor(cb){this.callback=cb;resizes.push(this)}observe(){}}
  const context=vm.createContext({window,document,IntersectionObserver,ResizeObserver,matchMedia:()=>media,getComputedStyle:()=>({getPropertyValue:name=>css[name]||''}),devicePixelRatio:2,performance:{now:()=>clock},requestAnimationFrame:cb=>{frames.set(++next,cb);return next},cancelAnimationFrame:id=>frames.delete(id)});
  vm.runInContext(code,context);
  const visible=value=>intersections[0].callback([{target:host,isIntersecting:value}]);
  const tick=()=>{clock+=100;for(const[id,cb]of[...frames]){frames.delete(id);cb(clock)}};
  return{root,document,window,media,host,image,contexts,canvases,css,frames,visible,tick,resizes};
}
const h=harness();h.visible(true);
assert.ok(h.host.classes.has('wd-ascii-ready'),'The actual source must be sampled before replacing the photograph');
assert.equal(h.contexts[1].draws[0][0],h.image);
assert.deepEqual(h.contexts[1].draws[0].slice(1,5),[50,0,100,100],'Cover crop follows the photograph, not a stretched thumbnail');
assert.ok(h.contexts[0].glyphs.length>0);
assert.equal(h.canvases[0].width,210,'Canvas resolution is capped at 1.5× pixel density');
assert.equal(h.frames.size,1);
h.css['--ht-art-bg']='#0f0c08';h.css['--ht-art-primary']='255,202,118';h.css['--ht-art-secondary']='234,161,157';
h.window.emit('webdecor:terminaltheme');
assert.equal(h.contexts[0].fills.at(-1).color,'#0f0c08');
assert.ok(h.contexts[0].glyphs.at(-1).color.startsWith('rgba(255,202,118,')||h.contexts[0].glyphs.at(-1).color.startsWith('rgba(234,161,157,'),'The live artwork follows the selected terminal palette');
h.visible(false);assert.equal(h.frames.size,0,'Offscreen artwork does not consume animation frames');
h.visible(true);h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.frames.size,0);
h.document.hidden=false;h.document.emit('visibilitychange');assert.equal(h.frames.size,1);
h.media.matches=true;h.media.emit('change');assert.equal(h.frames.size,0,'Reduced motion paints one stable character image');
h.image.currentSrc='/images/crt-keyboard.webp';h.image.emit('load');assert.equal(h.contexts.at(-1).draws[0][0],h.image,'Switching documents samples the new source');
h.window.emit('pagehide');assert.equal(h.frames.size,0);
h.window.emit('pageshow');assert.equal(h.frames.size,0);
h.media.matches=false;h.media.emit('change');assert.equal(h.frames.size,1);
h.tick();assert.equal(h.frames.size,1,'Only one artwork loop is scheduled');
const failed=harness({readable:false});failed.visible(true);assert.ok(!failed.host.classes.has('wd-ascii-ready'),'An unreadable source keeps its original photograph visible');
for(const world of ['cybercore','collage','swiss']){const other=harness({world});other.visible(true);assert.equal(other.contexts[0].glyphs.length,0);assert.equal(other.frames.size,0)}
console.log('PASS: source crop, real-image sampling, bounded canvas, theme updates, new sources, fallback imagery, reduced motion, offscreen/background suspension, and world isolation.');
