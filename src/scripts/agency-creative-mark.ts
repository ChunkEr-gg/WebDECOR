/** Original WebDECOR glyphs as three small mechanisms, with long settled rests. */
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const marks=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-creative-mark]'));
marks.forEach(button=>{
  let visible=false,live=true,entered=false,animations:Animation[]=[],idle=0,busy=false,serial=0;
  const canMove=()=>live&&visible&&!document.hidden&&!reduced.matches;
  const clearIdle=()=>{window.clearTimeout(idle);idle=0};
  const settled=()=>{
    animations.forEach(animation=>animation.cancel());animations=[];busy=false;
  };
  function queueIdle() {
    clearIdle();if(canMove())idle=window.setTimeout(()=>play(),19000);
  }
  function animate(part:string,keyframes:Keyframe[],duration:number,delay:number) {
    const target=button.querySelector<SVGElement>(`[data-part="${part}"]`);
    if(target)animations.push(target.animate(keyframes,{duration,delay,easing:'cubic-bezier(.22,.8,.25,1)',fill:'none'}));
  }
  function play() {
    if(!canMove()||busy)return;
    clearIdle();busy=true;const turn=++serial;
    // A sliding gate opens first; the conduits find their sockets in two beats.
    animate('human-gate',[{transform:'translate(0,0)'},{transform:'translate(6px,-7px)',offset:.28},{transform:'translate(-1px,1px)',offset:.78},{transform:'translate(0,0)'}],1050,0);
    animate('human-conduit',[{transform:'translate(0,0)'},{transform:'translate(-5px,4px)',offset:.25},{transform:'translate(1px,-1px)',offset:.72},{transform:'translate(0,0)'}],900,90);
    animate('human-cross',[{transform:'translate(0,0)'},{transform:'translate(4px,0)',offset:.3},{transform:'translate(-1px,0)',offset:.76},{transform:'translate(0,0)'}],780,190);
    animate('human-rail',[{transform:'translate(0,0)'},{transform:'translate(-3px,0)',offset:.3},{transform:'translate(0,0)'}],620,300);
    // The central chassis lifts, compresses on landing, then locks its cross-arm.
    animate('expression-frame',[{transform:'translateY(0) scale(1)'},{transform:'translateY(-7px) scale(.96,1.04)',offset:.3},{transform:'translateY(1px) scale(1.025,.975)',offset:.66},{transform:'translateY(-.6px) scale(.995,1.005)',offset:.83},{transform:'translateY(0) scale(1)'}],1050,380);
    animate('expression-cross',[{transform:'rotate(0deg)'},{transform:'rotate(90deg)',offset:.32},{transform:'rotate(-5deg)',offset:.76},{transform:'rotate(0deg)'}],900,480);
    animate('expression-spine',[{transform:'translateY(0)'},{transform:'translateY(6px)',offset:.3},{transform:'translateY(-1px)',offset:.77},{transform:'translateY(0)'}],740,650);
    // A hinged bridge joins the last assembly; its pin seats after the frame.
    animate('integration-frame',[{transform:'translate(0,0)'},{transform:'translate(4px,-4px)',offset:.27},{transform:'translate(-.8px,.8px)',offset:.75},{transform:'translate(0,0)'}],960,850);
    animate('integration-bridge',[{transform:'rotate(0deg)'},{transform:'rotate(-11deg)',offset:.3},{transform:'rotate(1.5deg)',offset:.78},{transform:'rotate(0deg)'}],1000,960);
    animate('integration-rail',[{transform:'translateX(0)'},{transform:'translateX(-5px)',offset:.25},{transform:'translateX(.8px)',offset:.78},{transform:'translateX(0)'}],660,1240);
    animate('integration-joint',[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-5px) rotate(25deg)',offset:.3},{transform:'translateY(.5px) rotate(-3deg)',offset:.78},{transform:'translateY(0) rotate(0deg)'}],620,1430);
    animate('trace',[{opacity:0,strokeDashoffset:'18px'},{opacity:.45,offset:.25},{opacity:.45,offset:.6},{opacity:0,strokeDashoffset:'0px'}],1150,1150);
    Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{
      if(turn!==serial)return;
      settled();queueIdle();
    });
  }
  function update() {
    button.disabled=reduced.matches;
    if(reduced.matches) {
      ++serial;clearIdle();settled();return;
    }
    if(!canMove()) {
      clearIdle();animations.forEach(animation=>animation.pause());return;
    }
    if(busy)animations.forEach(animation=>animation.play());
    else if(!entered){entered=true;play()}
    else queueIdle();
  }
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting);update();
  },{threshold:.3}):null;
  if(observer)observer.observe(button);else visible=true;
  button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')play()});
  button.addEventListener('click',play);
  document.addEventListener('visibilitychange',update);
  reduced.addEventListener('change',update);
  window.addEventListener('pagehide',()=>{live=false;update()});
  window.addEventListener('pageshow',()=>{live=true;update()});
  update();
});
export {};
