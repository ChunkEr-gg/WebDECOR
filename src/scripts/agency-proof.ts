document.querySelectorAll<HTMLElement>('[data-layout-proof]').forEach(proof=>{
 const controls=proof.querySelector<HTMLElement>('.wd-proof-controls');
 const buttons=Array.from(proof.querySelectorAll<HTMLButtonElement>('[data-viewport-choice]'));
 const label=proof.querySelector('[data-viewport-label]');
 const status=proof.querySelector('[data-proof-status]');
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const size=button.dataset.viewportChoice;
  if(size!=='wide'&&size!=='compact')return;
  proof.dataset.viewport=size;
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  if(label)label.textContent=size==='wide'?'WIDE LAYOUT':'COMPACT LAYOUT';
  if(status)status.textContent=size==='wide'?'Wide: image and headline sit side by side.':'Compact: content stacks and navigation condenses.';
 }));
 if(controls)controls.hidden=false;
});
