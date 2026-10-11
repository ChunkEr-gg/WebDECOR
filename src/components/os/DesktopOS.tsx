import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {iconPaths,type IconName} from '../../data/icons';

type AppId='welcome'|'internet'|'work'|'services'|'studio'|'pricing'|'brief'|'forme'|'object'|'notepad'|'appearance';
type App={id:AppId;name:string;icon:string;route?:string;fragment?:string;width?:number;height?:number};
const APPS:App[]=[
 {id:'welcome',name:'Welcome to WebDECOR',icon:'computer',width:620,height:505},
 {id:'internet',name:'The Weird Internet',icon:'browser',route:'/weird-internet/'},
 {id:'work',name:'My Work',icon:'folder',route:'/weird-internet/',fragment:'u-work'},
 {id:'services',name:'Services',icon:'tools',route:'/weird-internet/services/'},
 {id:'studio',name:'The Studio',icon:'computer',route:'/weird-internet/studio/'},
 {id:'pricing',name:'Pricing',icon:'folder',route:'/weird-internet/services/',fragment:'pricing'},
 {id:'brief',name:'New Project Brief',icon:'document',route:'/weird-internet/start/'},
 {id:'forme',name:'FORME — Design study',icon:'picture',route:'/weird-internet/work/forme/'},
 {id:'object',name:'OBJECT / ROOM — Design study',icon:'picture',route:'/weird-internet/work/object/'},
 {id:'notepad',name:'Notepad',icon:'notepad',width:580,height:440},
 {id:'appearance',name:'Display Properties',icon:'display',width:520,height:435},
];
const byId=(id:AppId)=>APPS.find(app=>app.id===id)!;
const shortcuts:AppId[]=['studio','work','internet','brief'];
type Win={id:AppId;x:number;y:number;w:number;h:number;z:number;min:boolean;max:boolean;source?:string;loaded:boolean;history:string[];index:number};
const safeGet=(key:string,fallback:string)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
const safeSet=(key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{}};
function resolveApp(url:URL):AppId{
 if(url.pathname.includes('/work/forme'))return'forme';
 if(url.pathname.includes('/work/object'))return'object';
 if(url.pathname.includes('/services'))return url.hash==='#pricing'?'pricing':'services';
 if(url.pathname.includes('/studio'))return'studio';
 if(url.pathname.includes('/start'))return'brief';
 if(url.hash==='#u-work'||url.hash==='#work')return'work';
 if(url.hash==='#u-studio')return'studio';
 if(url.hash==='#u-practice')return'services';
 return'welcome';
}
function Icon({kind,small=false}:{kind:string;small?:boolean}){return <span className={`os-icon os-icon-${kind}${small?' os-icon-small':''}`} aria-hidden="true"><i/><b/></span>}
function UiIcon({name}:{name:IconName}){return <svg className="wd-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false">{iconPaths[name].map((d,index)=><path key={index} d={d}/>)}</svg>}
export default function DesktopOS(){
 const [wins,setWins]=useState<Win[]>([]),[active,setActive]=useState<AppId|null>(null),[start,setStart]=useState(false),[selected,setSelected]=useState<AppId|null>(null),[clock,setClock]=useState(new Date()),[crt,setCrt]=useState(()=>safeGet('wd-xp-crt','on')==='on'),[wallpaper,setWallpaper]=useState(()=>safeGet('wd-xp-wallpaper','hills')),[notes,setNotes]=useState(()=>safeGet('wd-xp-notes','An unexpected idea?\nA brand ready for its next expression?\n\nStart here.\n')),[notice,setNotice]=useState(''),[full,setFull]=useState(false),[menu,setMenu]=useState<{id:AppId;name:string}|null>(null);
 const frames=useRef<Partial<Record<AppId,HTMLIFrameElement|null>>>({});
 const z=useRef(10),desk=useRef<HTMLElement>(null),gesture=useRef<{id:AppId;kind:'move'|'resize';sx:number;sy:number;x:number;y:number;w:number;h:number}|null>(null);
 function focus(id:AppId){setActive(id);setWins(old=>old.map(w=>w.id===id?{...w,z:++z.current,min:false}:w))}
 function open(id:AppId,path?:string,update=true){
  const app=byId(id);let source:string|undefined;
  if(app.route){const u=new URL(path||app.route,location.origin);u.searchParams.set('app',id);if(!u.hash&&app.fragment)u.hash=app.fragment;source=u.pathname+u.search+u.hash}
  const width=desk.current?.clientWidth||innerWidth,height=desk.current?.clientHeight||innerHeight;
  setWins(old=>{const existing=old.find(w=>w.id===id);if(existing)return old.map(w=>w.id===id?{...w,min:false,z:++z.current,...(path&&source!==w.source?{source,loaded:false,history:[...w.history.slice(0,w.index+1),source],index:w.index+1}:{})}:w);
   const w=Math.min(app.width||850,Math.max(290,width-145)),h=Math.min(app.height||640,height-76),offset=(old.length%4)*28;
   return [...old,{id,x:Math.max(10,Math.min(width-w-16,Math.max(130,(width-w)*.5)+offset)),y:Math.max(10,Math.min(height-h-10,42+offset)),w,h,z:++z.current,min:false,max:false,source,loaded:!source,history:source?[source]:[],index:0}];});
  setActive(id);setStart(false);setMenu(null);setSelected(null);setNotice(`${app.name} opened.`);
  if(update&&app.route){const u=new URL(path||app.route,location.origin);u.searchParams.delete('app');if(!u.hash&&app.fragment)u.hash=app.fragment;history.pushState({app:id},'',u.pathname+u.search+u.hash);document.title=`${app.name} — WebDECOR XP`;}
 }
 function close(id:AppId){setMenu(null);setWins(old=>old.filter(w=>w.id!==id));if(active===id)setActive(null);setNotice(`${byId(id).name} closed.`);}
 function minimize(id:AppId){setMenu(null);setWins(old=>old.map(w=>w.id===id?{...w,min:true}:w));if(active===id)setActive(null)}
 function maximize(id:AppId){setMenu(null);focus(id);setWins(old=>old.map(w=>w.id===id?{...w,max:!w.max}:w))}
 function navigateWindow(id:AppId,delta:number){setWins(old=>old.map(w=>{if(w.id!==id)return w;const index=Math.max(0,Math.min(w.history.length-1,w.index+delta));return index===w.index?w:{...w,index,source:w.history[index],loaded:false}}));setMenu(null)}
 function reloadWindow(id:AppId){const frame=frames.current[id];if(frame?.contentWindow){setWins(old=>old.map(w=>w.id===id?{...w,loaded:false}:w));frame.contentWindow.location.reload()}}
 function menuAction(action:string,id:AppId){setMenu(null);if(action==='close')close(id);else if(action==='minimize')minimize(id);else if(action==='size')maximize(id);else if(action==='desktop')showDesktop();else if(action==='save')downloadNotes();else if(action==='open')setStart(true);else open(action as AppId)}
 function downloadNotes(){const u=URL.createObjectURL(new Blob([notes],{type:'text/plain'})),a=document.createElement('a');a.href=u;a.download='webdecor-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);setNotice('Notes downloaded.')}
 function showDesktop(){setMenu(null);setWins(old=>old.map(w=>({...w,min:true})));setActive(null);setStart(false)}
 function resetDesktop(){setWins([]);setActive(null);history.pushState({},'','/weird-internet/');open('welcome',undefined,false)}
 useEffect(()=>{
  const original=new URL(location.href);open(resolveApp(original),original.pathname==='/'?undefined:original.pathname+original.search+original.hash,false);
  const timer=setInterval(()=>setClock(new Date()),1000);
  const msg=(event:MessageEvent)=>{if(event.origin!==location.origin||!event.data)return;const frame=Array.from(document.querySelectorAll<HTMLIFrameElement>('.os-app-frame')).find(f=>f.contentWindow===event.source);if(!frame)return;
   if(event.data.type==='webdecor:open'&&typeof event.data.path==='string'){const u=new URL(event.data.path,location.origin);if(u.origin===location.origin&&u.pathname.startsWith('/weird-internet'))open(resolveApp(u)==='welcome'?'internet':resolveApp(u),u.pathname+u.search+u.hash)}
   if(event.data.type==='webdecor:focus'){const title=frame.getAttribute('title');const app=APPS.find(app=>app.name===title);if(app)focus(app.id)}
   if(event.data.type==='webdecor:escape'){setStart(false);setMenu(null);const app=APPS.find(app=>app.name===frame.getAttribute('title'));if(app)setWins(old=>old.map(w=>w.id===app.id&&w.max?{...w,max:false}:w))}
  };
  const back=()=>{const u=new URL(location.href);open(resolveApp(u),u.pathname+u.search+u.hash,false)};
  const fullChange=()=>setFull(!!document.fullscreenElement);
  window.addEventListener('message',msg);window.addEventListener('popstate',back);document.addEventListener('fullscreenchange',fullChange);
  return()=>{clearInterval(timer);window.removeEventListener('message',msg);window.removeEventListener('popstate',back);document.removeEventListener('fullscreenchange',fullChange)};
 },[]);
 useEffect(()=>{safeSet('wd-xp-crt',crt?'on':'off');safeSet('wd-xp-wallpaper',wallpaper)},[crt,wallpaper]);
 useEffect(()=>{safeSet('wd-xp-notes',notes)},[notes]);
 function pointerStart(event:React.PointerEvent,id:AppId,kind:'move'|'resize'){
  const w=wins.find(w=>w.id===id)!;if(w.max||event.button!==0||innerWidth<650)return;
  event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);gesture.current={id,kind,sx:event.clientX,sy:event.clientY,x:w.x,y:w.y,w:w.w,h:w.h};focus(id);
  document.documentElement.classList.add('os-moving');
 }
 function pointerMove(event:React.PointerEvent){const g=gesture.current;if(!g)return;const dw=desk.current!.clientWidth,dh=desk.current!.clientHeight,dx=event.clientX-g.sx,dy=event.clientY-g.sy;
  setWins(old=>old.map(w=>w.id!==g.id?w:g.kind==='move'?{...w,x:Math.max(0,Math.min(dw-100,g.x+dx)),y:Math.max(0,Math.min(dh-42,g.y+dy))}:{...w,w:Math.max(340,Math.min(dw-w.x,g.w+dx)),h:Math.max(250,Math.min(dh-w.y,g.h+dy))}));
 }
 function pointerEnd(){gesture.current=null;document.documentElement.classList.remove('os-moving')}
 function moveByKey(event:React.KeyboardEvent,id:AppId){const delta:Record<string,number[]>={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};if(!delta[event.key])return;event.preventDefault();const [x,y]=delta[event.key];setWins(old=>old.map(w=>w.id===id?{...w,x:Math.max(0,Math.min(innerWidth-100,w.x+x)),y:Math.max(0,Math.min(innerHeight-90,w.y+y))}:w))}
 async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setNotice('Full screen is unavailable in this browser.')}}
 return <div className={`os ${crt?'os-crt':''} os-wallpaper-${wallpaper}`} onKeyDown={event=>{if(event.key==='Escape'){setStart(false);setMenu(null);setWins(old=>old.map(w=>w.id===active&&w.max?{...w,max:false}:w))}}}>
  <main id="main" className="os-desktop" ref={desk} aria-label="WebDECOR desktop" onPointerDown={event=>{if(event.target===event.currentTarget){setSelected(null);setStart(false);setMenu(null)}}}>
   <nav className="os-shortcuts" aria-label="Desktop applications">{shortcuts.map(id=><button key={id} className={selected===id?'is-selected':''} aria-label={`Open ${byId(id).name}`} onClick={()=>{setSelected(id);setStart(false);if(matchMedia('(pointer:coarse)').matches)open(id)}} onDoubleClick={()=>open(id)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();open(id)}}}><Icon kind={byId(id).icon}/><span>{byId(id).name==='Display Properties'?'Display':byId(id).name}</span></button>)}</nav>
   <div className="os-desktop-brand" aria-hidden="true"><span>webdecor<span>.</span><sup>xp</sup></span><small>THE INTERNET SHOULD BE WEIRDER.</small></div>
   <p className="os-desktop-hint">Double-click to explore. Make yourself at home.</p>
   {wins.map(w=>{const app=byId(w.id);return <section key={w.id} className={`os-window ${active===w.id?'is-active':''} ${w.max?'is-maximized':''}`} role="region" aria-label={app.name} hidden={w.min} style={{left:w.x,top:w.y,width:w.w,height:w.h,zIndex:w.z}} onPointerDownCapture={()=>{if(active!==w.id)focus(w.id)}}>
    <div className="os-titlebar"><button className="os-window-title" aria-label={`Move ${app.name} window`} onPointerDown={e=>pointerStart(e,w.id,'move')} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onDoubleClick={()=>maximize(w.id)} onKeyDown={e=>moveByKey(e,w.id)}><Icon kind={app.icon} small/><span>{app.name}</span></button><div className="os-window-controls"><button aria-label={`Minimize ${app.name}`} onClick={()=>minimize(w.id)}><UiIcon name="minus"/></button><button className="os-maximize" aria-label={`${w.max?'Restore':'Maximize'} ${app.name}`} onClick={()=>maximize(w.id)}><UiIcon name={w.max?'restore':'maximize'}/></button><button className="os-close" aria-label={`Close ${app.name}`} onClick={()=>close(w.id)}><UiIcon name="close"/></button></div></div>
    <div className="os-menubar">{['File','View','Tools','Help'].map(name=><button key={name} aria-expanded={menu?.id===w.id&&menu.name===name} onClick={()=>{focus(w.id);setMenu(menu?.id===w.id&&menu.name===name?null:{id:w.id,name})}}>{name}</button>)}<span className="os-menubar-brand" aria-hidden="true">wd<span>.</span></span></div>
    {menu?.id===w.id&&<div className="os-app-menu" role="menu" aria-label={`${menu.name} menu`}>{(menu.name==='File'?[['open','Open application…'],...(w.id==='notepad'?[['save','Save as .txt']]:[]),['close','Close']]:menu.name==='View'?[['size',w.max?'Restore window':'Maximize window'],['minimize','Minimize window'],['desktop','Show Desktop']]:menu.name==='Tools'?[['appearance','Display properties'],['notepad','Notepad']]:[['welcome','About WebDECOR XP']]).map(([action,label])=><button key={action} role="menuitem" onClick={()=>menuAction(action,w.id)}>{label}</button>)}</div>}
    {w.source&&<div className="os-browser-toolbar"><button disabled={w.index===0} onClick={()=>navigateWindow(w.id,-1)}><UiIcon name="arrow-left"/>Back</button><button disabled={w.index>=w.history.length-1} onClick={()=>navigateWindow(w.id,1)}><UiIcon name="arrow-right"/>Forward</button><i/><button onClick={()=>open('work')}><Icon kind="folder" small/>My Work</button><button onClick={()=>open('brief')}><Icon kind="document" small/>New Brief</button><button className="os-refresh" aria-label={`Refresh ${app.name}`} onClick={()=>reloadWindow(w.id)}><UiIcon name="refresh"/></button></div>}
    {w.source&&<div className="os-addressbar"><span>Address</span><div><Icon kind="folder" small/><span>{app.route}{app.fragment?`#${app.fragment}`:''}</span></div><button aria-label={`Open ${app.name} in a new tab`} onClick={()=>window.open(new URL(app.route!+(app.fragment?`#${app.fragment}`:''),location.origin).href,'_blank','noopener')}>Go</button></div>}
    <div className="os-window-body">
     {w.source?<><iframe className="os-app-frame" ref={node=>{frames.current[w.id]=node}} src={w.source} title={app.name} onLoad={()=>setWins(old=>old.map(x=>x.id===w.id?{...x,loaded:true}:x))}/>{!w.loaded&&<div className="os-loading" role="status">Opening {app.name}…</div>}</>:w.id==='welcome'?<div className="os-welcome"><div className="os-welcome-heading"><span className="os-vintage-wd">wd<span>.</span></span><div><h1>Welcome to WebDECOR XP</h1><p>Websites with character.</p></div></div><div className="os-welcome-content"><h2>The internet should be weirder.</h2><p>Independent minds. Unexpected websites. Explore the work, meet the studio, or give your next idea a starting point.</p><div className="os-welcome-links"><button onClick={()=>open('work')}><Icon kind="folder"/><span><strong>Explore the work</strong><small>Open the design archive</small></span></button><button onClick={()=>open('brief')}><Icon kind="document"/><span><strong>Start a project</strong><small>Build a brief, save it as .txt</small></span></button><button onClick={()=>open('internet')}><Icon kind="browser"/><span><strong>The Weird Internet</strong><small>Original artwork, strange energy</small></span></button></div></div></div>:w.id==='notepad'?<div className="os-notepad"><div><button onClick={downloadNotes}>Save as .txt</button><span>Saved on this device</span></div><textarea aria-label="Notepad text" value={notes} onChange={e=>setNotes(e.target.value)} spellCheck={false}/></div>:<div className="os-display"><div className="os-display-tabs"><span>Desktop</span><span>Settings</span></div><div className={`os-display-preview os-wallpaper-${wallpaper}`}><div>wd<span>.</span></div></div><fieldset><legend>Background</legend>{['hills','midnight','plum'].map(bg=><label key={bg}><input type="radio" name="wallpaper" value={bg} checked={wallpaper===bg} onChange={()=>setWallpaper(bg)}/>{bg==='hills'?'Green hills':bg==='midnight'?'Midnight blue':'Deep plum'}</label>)}</fieldset><label className="os-crt-setting"><input type="checkbox" checked={crt} onChange={e=>setCrt(e.target.checked)}/> CRT screen texture</label><button className="os-standard-button" onClick={toggleFullscreen}>{full?'Exit full screen':'Enter full screen'}</button></div>}
    </div><div className="os-statusbar"><span>{w.id==='notepad'?`${notes.length} characters`:w.loaded?'Ready':'Loading…'}</span><span>{w.id==='brief'?'Local .txt export':'WebDECOR XP'}</span></div><button className="os-resize" aria-label={`Resize ${app.name} window`} onPointerDown={e=>pointerStart(e,w.id,'resize')} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();setWins(old=>old.map(x=>x.id===w.id?{...x,w:x.w+20,h:x.h+20}:x))}}}/>
   </section>})}
  </main>
  {start&&<><button className="os-menu-dismiss" aria-label="Close Start menu" onClick={()=>setStart(false)}/><nav className="os-start-menu" aria-label="Start menu"><div className="os-start-user"><span className="os-user-avatar">wd<span>.</span></span><strong>WebDECOR</strong></div><div className="os-start-columns"><div>{(['internet','work','services','studio','pricing','brief'] as AppId[]).map(id=><button key={id} onClick={()=>open(id)}><Icon kind={byId(id).icon}/><span>{byId(id).name}</span></button>)}</div><div>{(['welcome','notepad','appearance'] as AppId[]).map(id=><button key={id} onClick={()=>open(id)}><Icon kind={byId(id).icon} small/><span>{byId(id).name}</span></button>)}<hr/><button onClick={showDesktop}><Icon kind="display" small/>Show Desktop</button></div></div><div className="os-start-footer"><button onClick={showDesktop}>Show Desktop</button><button onClick={resetDesktop}>Restart WebDECOR</button></div></nav></>}
  <footer className="os-taskbar"><button className={`os-start ${start?'is-open':''}`} aria-label="Start" aria-expanded={start} onClick={()=>setStart(s=>!s)}><span className="os-start-mark">wd<span>.</span></span><em>start</em></button><button className="os-quick-desktop" aria-label="Show Desktop" title="Show Desktop" onClick={showDesktop}><Icon kind="display" small/></button><nav className="os-tasks" aria-label="Open windows">{wins.map(w=><button key={w.id} className={active===w.id&&!w.min?'is-active':''} aria-label={`${w.min?'Restore':'Switch to'} ${byId(w.id).name}`} aria-pressed={active===w.id&&!w.min} onClick={()=>active===w.id&&!w.min?minimize(w.id):focus(w.id)}><Icon kind={byId(w.id).icon} small/><span>{byId(w.id).name}</span></button>)}</nav><a className="os-study-back" href="/studies/weird-internet/" aria-label="Return to The Weird Internet design study"><UiIcon name="arrow-left"/><span>Back to study</span></a><div className="os-tray"><button aria-label="Display settings" title="Display settings" onClick={()=>open('appearance')}><UiIcon name="maximize"/></button><time dateTime={clock.toISOString()} title={clock.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}>{clock.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</time></div></footer><span className="os-sr" role="status" aria-live="polite">{notice}</span>
 </div>
}
export function mountDesktop(element:Element){createRoot(element).render(<DesktopOS/>)}
