const disciplines:Record<string,{index:string;name:string;title:string;description:string;tags:string[]}>= {
 identity:{index:'01',name:'IDENTITY',title:'Visual identity',description:'Brand strategy, logos, typography, and colour. We develop a consistent identity for your website and the places your brand appears.',tags:['POSITIONING','VISUAL LANGUAGE','ART DIRECTION']},
 web:{index:'02',name:'WEB DESIGN',title:'Web design',description:'Page layouts, navigation, and interactions designed around your content. We balance a distinct visual identity with an experience that is clear to use.',tags:['WEB DESIGN','INTERACTION','CONTENT STRUCTURE']},
 commerce:{index:'03',name:'COMMERCE',title:'Commerce',description:'Collection pages, product stories, and shopping journeys. We design storefronts that let people explore your products and understand the details.',tags:['STOREFRONTS','PRODUCT STORIES','COLLECTIONS']},
 development:{index:'04',name:'DEVELOPMENT',title:'Development',description:'We build responsive websites with Astro, including accessible navigation and interactions. Design and development stay connected from prototype to launch.',tags:['ASTRO','RESPONSIVE DESIGN','ACCESSIBILITY']},
 editorial:{index:'05',name:'EDITORIAL',title:'Editorial',description:'Article templates, image-led features, and comfortable reading layouts. We design publications and brand journals that support a consistent editorial voice.',tags:['PUBLICATIONS','BRAND JOURNALS','LONG-FORM STORIES']},
 culture:{index:'06',name:'ARTS & CULTURE',title:'Arts & culture',description:'Websites for artists, exhibitions, and cultural programmes. We pair expressive art direction with clear information about the work and how to experience it.',tags:['EXHIBITIONS','ARTIST PORTFOLIOS','PROGRAMMES']},
};
const map=document.querySelector<HTMLElement>('[data-node-map]');
const core=document.querySelector<HTMLElement>('[data-node-core]');
const wires=document.querySelector<SVGGElement>('[data-node-wires]');
const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-node]'));
const previews=Array.from(document.querySelectorAll<HTMLElement>('[data-node-preview]'));
const state=document.querySelector<HTMLElement>('[data-core-state]');
const index=document.querySelector<HTMLElement>('[data-output-index]');
const title=document.querySelector<HTMLElement>('[data-output-title]');
const description=document.querySelector<HTMLElement>('[data-output-description]');
const tags=document.querySelector<HTMLElement>('[data-output-tags]');
let selected='identity',frame=0;
function selectNode(id:string){
 const item=disciplines[id];if(!item)return;selected=id;
 buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.node===id)));
 previews.forEach(preview=>{preview.hidden=preview.dataset.nodePreview!==id;});
 if(state)state.textContent=`${item.name} / ${item.index}`;
 if(index)index.textContent=`SELECTED / ${item.index}`;
 if(title)title.textContent=item.title;
 if(description)description.textContent=item.description;
 if(tags)tags.replaceChildren(...item.tags.map(label=>{const span=document.createElement('span');span.textContent=label;return span;}));
 wires?.querySelectorAll<SVGElement>('[data-for]').forEach(path=>{path.dataset.active=String(path.dataset.for===id);});
}
function drawWires(){
 if(!map||!core||!wires)return;
 const bounds=map.getBoundingClientRect();if(!bounds.width)return;
 const hub=core.getBoundingClientRect();
 const fragment=document.createDocumentFragment();
 buttons.forEach(button=>{
  const rect=button.getBoundingClientRect(),left=button.dataset.side==='left';
  const fromX=(left?rect.right:rect.left)-bounds.left,fromY=rect.top+rect.height/2-bounds.top;
  const toX=(left?hub.left:hub.right)-bounds.left,toY=hub.top+hub.height/2-bounds.top;
  const trunk=fromX+(toX-fromX)*.47,dir=left?1:-1,vertical=toY>fromY?1:-1;
  const radius=Math.min(18,Math.abs(toY-fromY)/2,Math.abs(toX-fromX)/4);
  const d=radius<1?`M${fromX} ${fromY}H${toX}`:`M${fromX} ${fromY}H${trunk-dir*radius}Q${trunk} ${fromY} ${trunk} ${fromY+vertical*radius}V${toY-vertical*radius}Q${trunk} ${toY} ${trunk+dir*radius} ${toY}H${toX}`;
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.dataset.for=button.dataset.node;path.dataset.active=String(button.dataset.node===selected);fragment.append(path);
  const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',String(trunk));dot.setAttribute('cy',String(toY));dot.setAttribute('r','3');dot.dataset.for=button.dataset.node;dot.dataset.active=String(button.dataset.node===selected);fragment.append(dot);
 });
 wires.replaceChildren(fragment);
 // Draw the active branch last, so its signal stays legible at shared junctions.
 wires.querySelectorAll<SVGElement>('[data-active=true]').forEach(element=>wires.append(element));
}
const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(drawWires);};
buttons.forEach((button,i)=>{
 button.addEventListener('click',()=>{selectNode(button.dataset.node!);schedule();});
 button.addEventListener('keydown',event=>{
  let next=i;
  if(event.key==='ArrowDown')next=(i+1)%buttons.length;
  else if(event.key==='ArrowUp')next=(i-1+buttons.length)%buttons.length;
  else if(event.key==='ArrowLeft'||event.key==='ArrowRight')next=(i+3)%buttons.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=buttons.length-1;
  else return;
  event.preventDefault();buttons[next].focus();selectNode(buttons[next].dataset.node!);schedule();
 });
});
if(map&&core){new ResizeObserver(schedule).observe(map);document.fonts.ready.then(schedule);window.addEventListener('resize',schedule);schedule();}
