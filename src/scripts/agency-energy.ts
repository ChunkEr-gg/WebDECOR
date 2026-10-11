import { buildEnergyNetwork, type EnergyBox, type EnergyDock } from './agency-energy-geometry';
const root=document.documentElement;
const shell=document.querySelector<HTMLElement>('.cy-shell');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if(shell&&root.dataset.world==='cybercore') {
  const namespace='http://www.w3.org/2000/svg',epoch=performance.now();
  const fields:Array<{target:HTMLElement;host:HTMLDivElement;svg:SVGSVGElement;visible:boolean;signature:string;docks:HTMLElement[];divider:HTMLElement|null;blockers:HTMLElement[]}>=[];
  let frame=0,live=true;
  const enabled=()=>root.dataset.world==='cybercore'&&root.dataset.activated==='true';
  const make=(tag:string,attributes:Record<string,string>={})=>{
    const node=document.createElementNS(namespace,tag);
    Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value));return node;
  };
  function motion() {
    const elapsed=performance.now()-epoch;
    fields.forEach(field=>{
      field.host.hidden=!enabled();
      const running=enabled()&&live&&field.visible&&!reduced.matches&&!document.hidden;
      const resumed=running&&field.host.dataset.running!=='true';
      field.host.dataset.running=String(running);
      if(resumed)field.host.getAnimations?.({subtree:true}).forEach(animation=>animation.currentTime=elapsed);
    });
  }
  function measure() {
    frame=0;if(!enabled()||!live)return;
    const shellBox=shell!.getBoundingClientRect(),width=shell!.clientWidth;
    const contentTop=fields[0]?.target.getBoundingClientRect().top||0;
    // Read the complete layout before writing SVGs, avoiding layout thrash.
    const extra={left:0,right:0};
    const measurements=fields.map((field,sectionIndex)=>{
      const box=field.target.getBoundingClientRect(),height=box.height;
      const originY=box.top;
      const offset=shellBox.left+shell!.clientLeft-box.left-field.target.clientLeft;
      const sectionY=originY-contentTop;
      const local=(element:HTMLElement):EnergyBox=>{
        const r=element.getBoundingClientRect();
        return {left:r.left-shellBox.left-shell!.clientLeft,right:r.right-shellBox.left-shell!.clientLeft,top:r.top-originY,bottom:r.bottom-originY};
      };
      const obstacles=field.blockers.map(element=>({element,...local(element)})).filter(r=>r.right>r.left&&r.bottom>r.top);
      const docks:EnergyDock[]=field.docks.map((element,dockIndex)=>{
        const bounds=local(element),centre=(bounds.left+bounds.right)/2;
        const spanning=bounds.right-bounds.left>width*.6;
        // Respect the component's nearest side; distribute central and spanning
        // panels by stable document order, never attach both edges to one panel.
        const side:EnergyDock['side']=!spanning&&centre<width*.44?'left':!spanning&&centre>width*.56?'right':(sectionIndex+dockIndex)%2?'right':'left';
        return {...bounds,side,blockers:obstacles.filter(r=>!element.contains(r.element)).map(({element,...box})=>box)};
      });
      const divider=field.divider?local(field.divider):null;
      const feedY=divider?divider.bottom+1:1;
      const network=buildEnergyNetwork(width,height,docks,feedY,obstacles.map(({element,...bounds})=>bounds));
      const phaseOffset={left:sectionY+extra.left,right:sectionY+extra.right};
      network.routes.filter(route=>route.kind==='bus').forEach(route=>extra[route.side||'left']+=(route.length||height)-height);
      return {field,width,height,offset,sectionY,phaseOffset,network,signature:JSON.stringify([width,height,offset,sectionY,phaseOffset,network])};
    });
    measurements.forEach(({field,width,height,offset,phaseOffset,network,signature},fieldIndex)=>{
      if(signature===field.signature)return;
      field.signature=signature;field.host.style.left=`${offset}px`;field.host.style.right='auto';field.host.style.width=`${width}px`;
      field.host.style.top=`${-field.target.clientTop}px`;field.host.style.height=`${height}px`;field.host.style.bottom='auto';
      field.svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const fragment=document.createDocumentFragment();
      ['channel','housing','tube','reflection','wake','charge'].forEach(layer=>{
        const group=make('g',{'class':`wd-pipe-${layer}`});
        network.routes.forEach(route=>group.appendChild(make('path',{d:route.d,'class':`wd-pipe-route wd-pipe-${route.kind} wd-pipe-${route.side}`,style:`--pipe-phase:${(phaseOffset[route.side||'left']+route.phase)%248}px`,'vector-effect':'non-scaling-stroke'})));
        fragment.appendChild(group);
      });
      const ports=make('g',{'class':'wd-pipe-ports'});
      network.ports.forEach(point=>ports.appendChild(make('rect',{x:String(point.x-2),y:String(point.y-4),width:'4',height:'8',rx:'1'})));
      network.junctions.forEach(point=>ports.appendChild(make('circle',{cx:String(point.x),cy:String(point.y),r:'2.5','class':'wd-pipe-junction'})));
      fragment.appendChild(ports);
      const edge=fieldIndex===0&&!field.target.matches('.cy-footer')?'top':fieldIndex===fields.length-1&&field.target.matches('.cy-footer')?'bottom':null;
      if(edge) {
        const id=`wd-energy-surface-${fieldIndex}-${edge}`,defs=make('defs');
        const gradient=make('linearGradient',{id:`${id}-fade`,gradientUnits:'userSpaceOnUse',x1:'0',x2:'0',y1:String(edge==='top'?0:height-16),y2:String(edge==='top'?16:height)});
        const stops=edge==='top'?[['0','0'],['.25','.08'],['1','1']]:[['0','1'],['.75','.08'],['1','0']];
        stops.forEach(([offset,opacity])=>gradient.appendChild(make('stop',{offset,'stop-color':'#fff','stop-opacity':opacity})));
        const mask=make('mask',{id,'class':'wd-energy-surface-mask','data-edge':edge,maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:'0',y:'0',width:String(width),height:String(height),'mask-type':'alpha'});
        mask.appendChild(make('rect',{x:'0',y:'0',width:String(width),height:String(height),fill:`url(#${id}-fade)`}));
        defs.appendChild(gradient);defs.appendChild(mask);
        // Fade the pipes themselves beneath the edge, without an endpoint device.
        Array.from(fragment.childNodes).forEach(node=>(node as SVGElement).setAttribute('mask',`url(#${id})`));
        fragment.appendChild(defs);
      }
      field.svg.replaceChildren(fragment);
      // Newly rebuilt paths rejoin the same animation epoch as surviving fields.
      field.host.dataset.running='false';
    });motion();
  }
  function schedule(){if(!frame&&enabled()&&live)frame=requestAnimationFrame(measure)}
  const visibility='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const field=fields.find(item=>item.target===entry.target);if(field)field.visible=entry.isIntersecting});motion();
  },{rootMargin:'60px'}):undefined;
  const resize='ResizeObserver' in window?new ResizeObserver(schedule):undefined;
  function initialize() {
    if(!enabled()){cancelAnimationFrame(frame);frame=0;motion();return}
    if(!fields.length) {
      const targets=Array.from(shell!.querySelectorAll<HTMLElement>('main section,.cy-footer')).filter(target=>!target.parentElement?.closest('section'));
      targets.forEach(target=>{
        if(getComputedStyle(target).position==='static')target.classList.add('wd-energy-relative');
        const host=document.createElement('div');host.className='wd-energy-field';host.setAttribute('aria-hidden','true');
        const svg=make('svg',{'class':'wd-energy-svg',fill:'none',focusable:'false'}) as SVGSVGElement;
        host.appendChild(svg);target.appendChild(host);
        const docks=Array.from(target.querySelectorAll<HTMLElement>('.cy-red-panel,.ag-service-console,.ag-price-plan,.cy-project-image,.wd-study-cover,.wd-proof,.wd-direction-map,.wd-design-specimen,.wd-capability-art,.wd-observation,.ag-faq-list,.ag-process-grid,.ag-invitation-body>.ag-button,.cy-footer-wordmark,.ag-inquiry-form,.ag-study-art')).filter(element=>element.getBoundingClientRect().width>20);
        const divider=target.querySelector<HTMLElement>('.cy-title-cell,.ag-pricing-heading,.cy-work-rail,.wd-archive-rail,.ag-rail');
        const blockers=Array.from(target.querySelectorAll<HTMLElement>('h1,h2,h3,p,summary,label,input,textarea,select,a,button,strong,li,figcaption,.cy-wordmark,.cy-label,.cy-project-meta,.wd-study-card-caption,.cy-title-meta,.cy-wordmark-foot'));
        fields.push({target,host,svg,visible:!visibility,signature:'',docks,divider,blockers});
        visibility?.observe(target);resize?.observe(target);docks.forEach(dock=>resize?.observe(dock));
      });
      resize?.observe(shell!);
    }schedule();motion();
  }
  document.fonts?.ready.then(schedule);
  document.fonts?.addEventListener('loadingdone',schedule);
  window.addEventListener('webdecor:activationchange',initialize);window.addEventListener('resize',schedule);
  document.addEventListener('visibilitychange',motion);reduced.addEventListener('change',motion);
  window.addEventListener('pagehide',()=>{live=false;cancelAnimationFrame(frame);frame=0;motion()});
  window.addEventListener('pageshow',()=>{live=true;initialize()});initialize();
}
export {};
