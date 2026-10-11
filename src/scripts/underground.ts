const toggle=document.querySelector<HTMLButtonElement>('.u-menu');
const panel=document.querySelector<HTMLElement>('#u-menu-panel');
const close=()=>{if(panel&&toggle){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open page menu')}};
toggle?.addEventListener('click',()=>{if(!panel)return;panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));toggle.setAttribute('aria-label',panel.hidden?'Open page menu':'Close page menu')});
panel?.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',close));
document.addEventListener('click',event=>{if(event.target instanceof Node&&!panel?.contains(event.target)&&!toggle?.contains(event.target))close()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden){close();toggle?.focus()}});
