import {createIcon} from './ui-icon';
import type {IconName} from '../data/icons';
const start=document.querySelector<HTMLButtonElement>('.xp-start');
const menu=document.querySelector<HTMLElement>('#xp-start-menu');
const restoreButton=document.querySelector<HTMLButtonElement>('.xp-restore-button');
const restoreList=document.querySelector<HTMLElement>('[data-xp-closed]');
const progress=document.querySelector<HTMLElement>('[data-xp-progress]');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function setMenu(open:boolean){if(!menu||!start)return;menu.hidden=!open;start.setAttribute('aria-expanded',String(open));if(open)menu.querySelector<HTMLElement>('a,button')?.focus()}
start?.addEventListener('click',()=>setMenu(!!menu?.hidden));
restoreButton?.addEventListener('click',()=>setMenu(true));
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('pointerdown',event=>{const target=event.target as Node;if(menu&&!menu.hidden&&!menu.contains(target)&&!start?.contains(target)&&!restoreButton?.contains(target))setMenu(false)});
type DesktopWindow={element:HTMLElement;title:string;minimized:boolean;closed:boolean;maximized:boolean;children:Map<HTMLElement,boolean>;min:HTMLButtonElement;max:HTMLButtonElement;x:number;y:number};
const windows:DesktopWindow[]=[];
let fullWindow:DesktopWindow|null=null;
function focusWindow(item:DesktopWindow){if(fullWindow&&fullWindow!==item)maximize(fullWindow,false);if(item.closed||item.minimized)restore(item);item.element.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'center'});item.element.querySelector<HTMLElement>('.u-xp-title')?.focus({preventScroll:true})}
function updateRestoreList(){
 const hidden=windows.filter(item=>item.closed||item.minimized);
 if(restoreButton){restoreButton.hidden=!hidden.length;restoreButton.textContent=`Restore (${hidden.length})`}
 if(restoreList){restoreList.replaceChildren();hidden.forEach(item=>{const button=document.createElement('button');button.type='button';button.textContent=item.title;button.addEventListener('click',()=>{setMenu(false);restore(item);focusWindow(item)});restoreList.append(button)});const list=restoreList.closest<HTMLElement>('.xp-closed-list');if(list)list.hidden=!hidden.length}
}
function minimize(item:DesktopWindow){
 if(item.minimized){restore(item);return}
 if(item.maximized)maximize(item,false);
 item.children.clear();Array.from(item.element.children).forEach(child=>{if(child instanceof HTMLElement&&!child.classList.contains('u-xp-bar')){item.children.set(child,child.hidden);child.hidden=true}});
 item.minimized=true;item.element.classList.add('xp-minimized');item.min.replaceChildren(createIcon('restore'));item.min.setAttribute('aria-label',`Restore ${item.title}`);item.min.title=`Restore ${item.title}`;item.min.setAttribute('aria-expanded','false');updateRestoreList();
}
function restore(item:DesktopWindow){item.closed=false;item.element.classList.remove('xp-closed');if(item.minimized){item.children.forEach((hidden,child)=>child.hidden=hidden);item.children.clear();item.minimized=false;item.element.classList.remove('xp-minimized')};item.min.replaceChildren(createIcon('minus'));item.min.setAttribute('aria-label',`Minimise ${item.title}`);item.min.title=`Minimise ${item.title}`;item.min.setAttribute('aria-expanded','true');updateRestoreList()}
function maximize(item:DesktopWindow,open=!item.maximized){
 if(open){if(fullWindow&&fullWindow!==item)maximize(fullWindow,false);restore(item);fullWindow=item}
 else if(fullWindow===item)fullWindow=null;
 item.maximized=open;item.element.classList.toggle('xp-maximized',open);document.body.classList.toggle('xp-focus-open',!!fullWindow);item.max.replaceChildren(createIcon(open?'restore':'maximize'));item.max.setAttribute('aria-label',`${open?'Restore size of':'Maximise'} ${item.title}`);item.max.setAttribute('aria-pressed',String(open));item.max.title=`${open?'Restore size of':'Maximise'} ${item.title}`;
}
const candidates=document.querySelectorAll<HTMLElement>('.u-world main section[data-window]:not(.u-work):not(.u-pricing):not(.u-principles):not(.u-case-spec):not(.u-brief-body),.u-price-card,.u-service-detail aside');
candidates.forEach((element,index)=>{
 const oldBar=element.querySelector<HTMLElement>(':scope > .u-card-title');
 const serviceNames:Record<string,string>={direction:'Strategy & direction',design:'Website design',build:'Development & launch',evolve:'Redesign & evolution'};
 const service=serviceNames[element.id]||serviceNames[element.closest<HTMLElement>('.u-service-detail')?.id||''];
 const fileTitle=oldBar?.querySelector('span')?.textContent;
 const title=service?(fileTitle?`${service} / ${fileTitle}`:service):fileTitle||element.dataset.window||element.querySelector('h2,h3')?.textContent||'WebDECOR';
 oldBar?.remove();if(!element.id)element.id=`xp-window-${index+1}`;
 element.classList.add('xp-window','xp-enhanced');
 const bar=document.createElement('div');bar.className='u-xp-bar';
 const handle=document.createElement('button');handle.type='button';handle.className='u-xp-title';handle.textContent=title;handle.setAttribute('aria-label',`Move ${title}. Arrow keys move; Home resets.`);bar.append(handle);
 const control=(label:string,icon:IconName,extra='')=>{const button=document.createElement('button');button.type='button';button.className=`u-xp-control ${extra}`;button.append(createIcon(icon));button.setAttribute('aria-label',label);button.title=label;bar.append(button);return button};
 const min=control(`Minimise ${title}`,'minus');min.setAttribute('aria-expanded','true');
 const max=control(`Maximise ${title}`,'maximize');max.setAttribute('aria-pressed','false');
 const close=control(`Close ${title}`,'close','xp-close');
 element.prepend(bar);
 const item:DesktopWindow={element,title,minimized:false,closed:false,maximized:false,children:new Map(),min,max,x:0,y:0};windows.push(item);
 min.addEventListener('click',()=>minimize(item));max.addEventListener('click',()=>maximize(item));close.addEventListener('click',()=>{if(item.maximized)maximize(item,false);item.closed=true;element.classList.add('xp-closed');updateRestoreList();restoreButton?.focus()});
 const move=(x:number,y:number)=>{item.x=Math.max(-window.innerWidth*.25,Math.min(window.innerWidth*.25,x));item.y=Math.max(-180,Math.min(180,y));element.style.setProperty('--xp-x',`${item.x}px`);element.style.setProperty('--xp-y',`${item.y}px`)};
 let drag:{px:number;py:number;x:number;y:number;pointer:number}|null=null;
 handle.addEventListener('pointerdown',event=>{if(event.button!==0||item.maximized||window.innerWidth<761)return;drag={px:event.clientX,py:event.clientY,x:item.x,y:item.y,pointer:event.pointerId};handle.setPointerCapture(event.pointerId);element.classList.add('xp-dragging');event.preventDefault()});
 handle.addEventListener('pointermove',event=>{if(drag&&event.pointerId===drag.pointer)move(drag.x+event.clientX-drag.px,drag.y+event.clientY-drag.py)});
 const endDrag=()=>{drag=null;element.classList.remove('xp-dragging')};handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);handle.addEventListener('lostpointercapture',endDrag);
 handle.addEventListener('keydown',event=>{if(item.maximized)return;const d=event.shiftKey?30:10;const shifts:Record<string,[number,number]>={ArrowLeft:[-d,0],ArrowRight:[d,0],ArrowUp:[0,-d],ArrowDown:[0,d]};if(event.key==='Home'){event.preventDefault();move(0,0)}else if(shifts[event.key]){event.preventDefault();const [x,y]=shifts[event.key];move(item.x+x,item.y+y)}});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(menu&&!menu.hidden){setMenu(false);start?.focus()}else if(fullWindow){const current=fullWindow;maximize(current,false);current.max.focus()}}});
const reveal=new IntersectionObserver(entries=>{entries.forEach(entry=>{const element=entry.target as HTMLElement;element.dataset.xpVisible=String(entry.isIntersecting)})},{rootMargin:'0px 0px -7% 0px',threshold:.07});
windows.forEach(item=>reveal.observe(item.element));
let scheduled=false;
function scrollProgress(){scheduled=false;const height=document.documentElement.scrollHeight-window.innerHeight;const position=height>0?Math.round(window.scrollY/height*100):0;if(progress)progress.textContent=`Desktop · ${Math.max(0,Math.min(100,position))}%`}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scrollProgress)}},{passive:true});window.addEventListener('resize',scrollProgress);scrollProgress();
window.addEventListener('pageshow',()=>{updateRestoreList();scrollProgress()});
