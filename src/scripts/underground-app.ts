// App documents keep their existing interactions and ask the desktop to open links.
const desktop=window.parent;
if(desktop!==window){
 document.addEventListener('pointerdown',()=>desktop.postMessage({type:'webdecor:focus'},location.origin));
 document.addEventListener('click',event=>{
  const brief=(event.target as Element)?.closest('[data-project-brief]');
  if(brief){event.preventDefault();desktop.postMessage({type:'webdecor:open',path:'/underground/start/'},location.origin);return}
  const anchor=(event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
  if(!anchor||anchor.hasAttribute('download')||anchor.target==='_blank'||event.defaultPrevented||event.ctrlKey||event.metaKey)return;
  const target=new URL(anchor.href,location.href);
  if(target.origin!==location.origin||!target.pathname.startsWith('/underground'))return;
  if(target.pathname===location.pathname&&anchor.getAttribute('href')?.startsWith('#')&&document.getElementById(target.hash.slice(1)))return;
  event.preventDefault();desktop.postMessage({type:'webdecor:open',path:target.pathname+target.search+target.hash},location.origin);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape')desktop.postMessage({type:'webdecor:escape'},location.origin)});
 desktop.postMessage({type:'webdecor:ready'},location.origin);
}
