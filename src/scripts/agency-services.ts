const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.ag-service-tabs [role="tab"]'));
function activate(tab: HTMLButtonElement, focus = false) {
 tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; const panel = document.getElementById(item.getAttribute('aria-controls') || ''); if (panel) panel.hidden = !selected; });
 if(focus) tab.focus();
}
tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>activate(tab));
 tab.addEventListener('keydown',event=>{
  let next=index;
  if(event.key==='ArrowDown'||event.key==='ArrowRight') next=(index+1)%tabs.length;
  else if(event.key==='ArrowUp'||event.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
  else if(event.key==='Home') next=0;
  else if(event.key==='End') next=tabs.length-1;
  else return;
  event.preventDefault();activate(tabs[next],true);
 });
});
