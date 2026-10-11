// Refract the staged photograph at the rounded window rim. Text stays in a
// separate layer, so this does not filter or distort the interface itself.
const ns='http://www.w3.org/2000/svg';
function svgNode(name:string,attributes:Record<string,string>){const node=document.createElementNS(ns,name);Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value));return node;}
const stages=document.querySelectorAll<HTMLElement>('.cy-demo-stage');
const reduced=matchMedia('(prefers-reduced-transparency: reduce)');
stages.forEach((stage,index)=>{
 const window=stage.querySelector<HTMLElement>('.cy-demo');if(!window)return;
 const svg=svgNode('svg',{'class':'cy-glass-optics','aria-hidden':'true','focusable':'false'});
 const defs=svgNode('defs',{}),filter=svgNode('filter',{id:`rim-optics-${index}`,filterUnits:'userSpaceOnUse','color-interpolation-filters':'sRGB'});
 const map=svgNode('feImage',{result:'normalMap',preserveAspectRatio:'none'});
 const displacement=svgNode('feDisplacementMap',{in:'SourceGraphic',in2:'normalMap',scale:'22',xChannelSelector:'R',yChannelSelector:'G'});
 filter.append(map,displacement);defs.append(filter);svg.append(defs);
 const photograph=svgNode('image',{href:stage.dataset.glassBackground!,preserveAspectRatio:'xMidYMid slice',filter:`url(#rim-optics-${index})`});svg.append(photograph);window.prepend(svg);
 let frame=0;
 const update=()=>{
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   if(reduced.matches){svg.setAttribute('hidden','');return;}svg.removeAttribute('hidden');
   const bounds=window.getBoundingClientRect(),desktop=stage.getBoundingClientRect();
   const width=Math.round(bounds.width),height=Math.round(bounds.height);if(!width||!height)return;
   svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));
   filter.setAttribute('x','0');filter.setAttribute('y','0');filter.setAttribute('width',String(width));filter.setAttribute('height',String(height));
   photograph.setAttribute('x',String(desktop.left-bounds.left));photograph.setAttribute('y',String(desktop.top-bounds.top));photograph.setAttribute('width',String(desktop.width));photograph.setAttribute('height',String(desktop.height));
   const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)return;
   const ratio=.5;canvas.width=Math.ceil(width*ratio);canvas.height=Math.ceil(height*ratio);const pixels=context.createImageData(canvas.width,canvas.height);
   const radius=parseFloat(getComputedStyle(window).borderTopLeftRadius)||20;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const px=(x+.5)/ratio-width/2,py=(y+.5)/ratio-height/2;
    const qx=Math.abs(px)-(width/2-radius),qy=Math.abs(py)-(height/2-radius);
    const ox=Math.max(qx,0),oy=Math.max(qy,0),length=Math.hypot(ox,oy);
    const distance=length+Math.min(Math.max(qx,qy),0)-radius;
    let nx=0,ny=0;if(length>0){nx=ox/length*Math.sign(px);ny=oy/length*Math.sign(py);}else if(qx>qy){nx=Math.sign(px);}else{ny=Math.sign(py);}
    const inward=-distance,t=Math.max(0,Math.min(1,inward/24));
    const bend=inward>=0&&inward<24?Math.sin(t*Math.PI):0;
    const offset=(y*canvas.width+x)*4;
    pixels.data[offset]=Math.round(128+nx*bend*110);pixels.data[offset+1]=Math.round(128+ny*bend*110);pixels.data[offset+2]=128;pixels.data[offset+3]=255;
   }
   context.putImageData(pixels,0,0);map.setAttribute('href',canvas.toDataURL());map.setAttribute('x','0');map.setAttribute('y','0');map.setAttribute('width',String(width));map.setAttribute('height',String(height));
  });
 };
 const observer=new ResizeObserver(update);observer.observe(stage);observer.observe(window);reduced.addEventListener('change',update);update();
});
