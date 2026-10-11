import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';

const geometry = await build({entryPoints:['src/scripts/agency-energy-geometry.ts'],bundle:true,write:false,format:'iife',globalName:'geometry',platform:'node'});
const geometryContext=vm.createContext({});
vm.runInContext(geometry.outputFiles[0].text,geometryContext);
const {buildEnergyNetwork:network,routeIsClear}=geometryContext.geometry;
function pathPoints(path) {
  const tokens=path.match(/[MLVQ]|-?\d*\.?\d+/g);let x=0,y=0,i=0;const result=[];
  while(i<tokens.length){const command=tokens[i++];
    if(command==='M'||command==='L'){x=Number(tokens[i++]);y=Number(tokens[i++]);}
    else if(command==='V')y=Number(tokens[i++]);
    else if(command==='Q'){result.push({x:Number(tokens[i++]),y:Number(tokens[i++])});x=Number(tokens[i++]);y=Number(tokens[i++]);}
    else throw Error('Unexpected SVG command');
    result.push({x,y});
  }return result;
}
const buses=result=>result.routes.filter(route=>route.kind==='bus');
const branches=result=>result.routes.filter(route=>route.kind==='branch');
const busX=(width,side)=>side==='left'?Math.min(22,Math.max(7,width*.014)):width-Math.min(22,Math.max(7,width*.014));
const mirror=(box,width)=>({...box,left:width-box.right,right:width-box.left});
function assertBounds(result,width,height) {
  for(const route of result.routes)for(const point of pathPoints(route.d))assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=0&&point.x<=width&&point.y>=0&&point.y<=height,`Route escapes ${width} × ${height}`);
}
for(const width of [80,320,959,1600])for(const height of [24,76,734,2200])for(const side of ['left','right']) {
  const base={left:width*.55,right:width-5,top:5,bottom:height-5};
  const dock={...(side==='left'?base:mirror(base,width)),side};
  const result=network(width,height,[dock],height*.3);
  assert.equal(buses(result).length,2);assert.equal(branches(result).length,1);assert.equal(result.ports.length,1);
  assert.deepEqual(Array.from(buses(result),route=>route.points[0].x),[busX(width,'left'),busX(width,'right')]);
  for(const route of buses(result)){assert.equal(route.points[0].y,0);assert.equal(route.points.at(-1).y,height);assert.equal(route.points.at(-1).x,busX(width,route.side));assert.equal(route.phase,0);assert.ok(route.length>=height);}
  assertBounds(result,width,height);
  const branch=branches(result)[0];assert.equal(branch.points[0].x,busX(width,side));assertSourcePhase(result,branch);
  assert.equal(result.ports[0].x,side==='left'?dock.left:dock.right);assert.ok(result.ports[0].y>=dock.top+4&&result.ports[0].y<=dock.bottom-4);
}
for(const args of [[NaN,500],[500,Infinity],[79,500],[500,23]])assert.equal(network(...args).routes.length,0);
for(const dock of [{left:40,right:20,top:5,bottom:50},{left:40,right:90,top:-1,bottom:50},{left:NaN,right:90,top:5,bottom:50}])assert.equal(network(100,100,[dock]).routes.length,2);
assert.equal(routeIsClear([{x:0,y:0},{x:10,y:10}],[]),false,'Only orthogonal corridors are allowed');
assert.equal(routeIsClear([{x:0,y:0},{x:NaN,y:10}],[]),false);
const blocked={left:40,right:100,top:20,bottom:100,blockers:[{left:20,right:35,top:0,bottom:120}]};
for(const side of ['left','right']) {
  const dock=side==='left'?{...blocked,side}:{...mirror(blocked,200),side,blockers:blocked.blockers.map(box=>mirror(box,200))};
  assert.equal(network(200,120,[dock],5).routes.length,2,'Unreachable docks are omitted instead of crossing copy');
}
// Sample every actual rounded corner, including its interior, rather than only centerline segments.
function samples(path){const tokens=path.match(/[MLVQ]|-?\d*\.?\d+/g);let x=0,y=0,i=0;const samples=[];
  while(i<tokens.length){const c=tokens[i++];if(c==='M'){x=+tokens[i++];y=+tokens[i++];samples.push({x,y});continue;}
    const oldX=x,oldY=y;let cx,cy;if(c==='Q'){cx=+tokens[i++];cy=+tokens[i++];}if(c==='V')y=+tokens[i++];else{x=+tokens[i++];y=+tokens[i++];}
    for(let j=0;j<=160;j++){const t=j/160;samples.push(c==='Q'?{x:(1-t)**2*oldX+2*(1-t)*t*cx+t*t*x,y:(1-t)**2*oldY+2*(1-t)*t*cy+t*t*y}:{x:oldX+(x-oldX)*t,y:oldY+(y-oldY)*t});}
  }return samples;}
function arcLength(path) {const points=samples(path);return points.slice(1).reduce((total,point,index)=>total+Math.hypot(point.x-points[index].x,point.y-points[index].y),0);}
function sourceDistance(bus,y) {
  const points=samples(bus.d);let length=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],segment=Math.hypot(b.x-a.x,b.y-a.y);
    if(Math.abs(a.y-y)<1e-6&&Math.abs(a.x-bus.points[0].x)<1e-6)return length;
    if(a.y<=y&&b.y>=y&&b.y>a.y&&a.x===bus.points[0].x&&b.x===a.x)return length+(y-a.y);
    length+=segment;
  }assert.fail(`No actual gutter source at y=${y}`);
}
function assertSourcePhase(result,branch){const bus=buses(result).find(route=>route.side===branch.side),source=branch.points[0];
  const expected=sourceDistance(bus,source.y)+Math.abs(source.x-bus.points[0].x);
  assert.ok(Math.abs(branch.phase-expected)<.04,`Feed phase ${branch.phase} must follow the bus arc and shared supply ${expected}`);
}
function assertCopyClear(route,blockers){
  assert.ok(routeIsClear(route.points,blockers));
  const tokens=route.d.match(/[MLVQ]|-?\d*\.?\d+/g);let x=0,y=0,index=0;
  while(index<tokens.length){const command=tokens[index++];if(command==='V'){y=+tokens[index++];continue;}if(command==='Q'){const cx=+tokens[index++],cy=+tokens[index++],nx=+tokens[index++],ny=+tokens[index++];const hull={left:Math.min(x,cx,nx),right:Math.max(x,cx,nx),top:Math.min(y,cy,ny),bottom:Math.max(y,cy,ny)};
    for(const box of blockers)assert.ok(!(hull.right>box.left-4&&hull.left<box.right+4&&hull.bottom>box.top-4&&hull.top<box.bottom+4),'Entire quadratic control hull clears text');x=nx;y=ny;
  }else{x=+tokens[index++];y=+tokens[index++];}}
  for(const point of samples(route.d))for(const box of blockers)assert.ok(!(point.x>box.left-4&&point.x<box.right+4&&point.y>box.top-4&&point.y<box.bottom+4),'Actual rounded paths respect copy clearance');
}

for(const width of [80,320,959,1600])for(const height of [24,76,734]){
  const gutter=busX(width,'left'),copy=[{left:gutter+8,right:gutter+22,top:20,bottom:height-12},{left:width-gutter-22,right:width-gutter-8,top:20,bottom:height-12}].filter(box=>box.bottom>box.top);
  const result=network(width,height,[],5,copy);assertBounds(result,width,height);
  for(const bus of buses(result)){assertCopyClear(bus,copy);assert.ok(Math.abs(bus.length-arcLength(bus.d))<.03,'Published bus length follows the actual rounded path');
    assert.equal(bus.points[0].x,busX(width,bus.side));assert.equal(bus.points[0].y,0);assert.equal(bus.points.at(-1).x,bus.points[0].x);assert.equal(bus.points.at(-1).y,height);
    if(height>=76)assert.ok(bus.points.some(point=>point.x!==bus.points[0].x),'Open gutter bands create actual doglegs, even on narrow screens and short sections');
  }
}
const bendFeeds=network(500,600,[{left:150,right:230,top:250,bottom:360,side:'left'},{left:300,right:430,top:320,bottom:450,side:'right'}],240);
for(const branch of branches(bendFeeds)){assertSourcePhase(bendFeeds,branch);assert.ok(Math.abs(branch.length-arcLength(branch.d))<.03);}
assert.ok(branches(bendFeeds).some(branch=>branch.phase>branch.points[0].y),'A feed downstream of a bend includes its extra arc distance');

const bendDock={left:100,right:150,top:32,bottom:100,blockers:[{left:83,right:84,top:37,bottom:38}]};
for(const side of ['left','right']) {
  const dock=side==='left'?{...bendDock,side}:{...mirror(bendDock,200),side,blockers:bendDock.blockers.map(box=>mirror({...box,top:132-box.bottom,bottom:132-box.top},200))};
  const result=network(200,150,[dock],30),bend=branches(result)[0];
  assert.ok(bend,'Clear straight corridors remain available');assertBounds(result,200,150);
  assert.ok(routeIsClear(bend.points,dock.blockers));
  for(const point of samples(bend.d))for(const box of dock.blockers)assert.ok(!(point.x>box.left-4&&point.x<box.right+4&&point.y>box.top-4&&point.y<box.bottom+4),'Rounded bends respect copy clearance on either side');
  assert.equal(network(200,150,[dock],NaN).routes.length,3,'Invalid divider measurements use the safe default feed');
}
const leftDocks=[{left:150,right:230,top:50,bottom:180},{left:300,right:430,top:50,bottom:180}];
for(const side of ['left','right']) {
  const docks=leftDocks.map(dock=>({... (side==='left'?dock:mirror(dock,500)),side}));
  const shared=network(500,300,docks,20),feeds=branches(shared);
  assert.equal(shared.routes.length,4);assert.equal(shared.ports.length,2);
  assert.equal(feeds[1].points[0].x,side==='left'?138:362,'Second dock taps the existing divider feed on its own side');
  assertSourcePhase(shared,feeds[0]);assertSourcePhase(shared,feeds[1]);assert.ok(feeds[1].phase>feeds[1].points[0].y,'Branch pulse includes the supplied horizontal distance and upstream bends');
  assert.ok(shared.junctions.some(point=>point.x===(side==='left'?138:362)&&point.y===(side==='left'?20:180)));
  assert.ok(feeds[0].d.includes(side==='left'?'L138 20L138':'L362 180L362'),'Shared junctions have no rounded disconnect');
}
const distinctDocks=[{left:100,right:230,top:50,bottom:180,side:'left'},{left:300,right:430,top:90,bottom:240,side:'right'}];
const distinct=network(500,300,distinctDocks,20);
assert.equal(branches(distinct).length,2,'Each panel gets exactly one branch, rather than two duplicate attachments');
assert.equal(distinct.ports.length,2);assert.equal(distinct.ports[0].x,100);assert.equal(distinct.ports[1].x,430);
assert.ok(distinct.ports[0].y<distinctDocks[0].top+40,'Left routes prefer the upper entry');
assert.ok(distinct.ports[1].y>distinctDocks[1].bottom-40,'Right routes prefer the lower entry');
assert.equal(branches(distinct)[0].points[0].x,busX(500,'left'));
assert.equal(branches(distinct)[1].points[0].x,busX(500,'right'),'Trunks are independent across gutters');

class Node {
  constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.events={};this.clientLeft=0;this.clientTop=0;this.clientWidth=1000;this.clientHeight=600;this.box={left:20,right:1020,top:100,bottom:700,width:1000,height:600};this.animations=[];this.parentElement=null;this.styles={};this.style={setProperty:(key,value)=>this.styles[key]=value};this.classes=new Set();this.classList={add:value=>this.classes.add(value)};}
  get childNodes(){return this.children;}
  setAttribute(key,value){this.attrs[key]=value;}
  addEventListener(name,callback){(this.events[name]??=[]).push(callback)}
  emit(name){for(const callback of this.events[name]||[])callback()}
  appendChild(child){if(child.tag==='fragment')this.children.push(...child.children);else this.children.push(child);return child}
  replaceChildren(fragment){this.children=[...fragment.children];}
  getBoundingClientRect(){return this.box;}
  closest(){return null;}
  matches(selector){return selector==='.ag-header'?this.tag==='header':selector==='.cy-footer'?this.tag==='footer':false;}
  contains(element){return this===element||this.children.some(child=>child.contains(element));}
  querySelectorAll(){return [];}
  querySelector(){return null;}
  getAnimations(){return this.animations;}
}
function harness({world='cybercore',active=false,reduced=false}={}) {
  const document=new Node(),root=new Node('html'),shell=new Node(),window=new Node(),media=new Node();
  root.dataset.world=world;if(active)root.dataset.activated='true';
  document.documentElement=root;document.hidden=false;document.querySelector=()=>shell;
  document.createElement=tag=>new Node(tag);document.createElementNS=(_,tag)=>new Node(tag);document.createDocumentFragment=()=>new Node('fragment');
  const targets=[new Node('header'),new Node('section'),new Node('section'),new Node('footer')];
  targets[0].box.height=76;targets[0].clientHeight=76;targets[1].box.left=55;targets[1].clientLeft=1;targets[1].box.width=930;targets[1].clientTop=2;targets[2].box.top=700;targets[2].box.bottom=1000;targets[2].box.height=300;targets[3].box.top=1000;targets[3].box.bottom=1600;
  const dock=new Node();dock.box={left:300,right:500,top:200,bottom:460,width:200,height:260};
  const rightDock=new Node();rightDock.box={left:700,right:940,top:300,bottom:600,width:240,height:300};
  const centralRight=new Node();centralRight.box={left:400,right:650,top:470,bottom:650,width:250,height:180};
  const centralLeft=new Node();centralLeft.box={left:400,right:650,top:250,bottom:400,width:250,height:150};
  const divider=new Node();divider.box={left:55,right:985,top:102,bottom:142,width:930,height:40};
  const blocker=new Node();blocker.box={left:80,right:250,top:180,bottom:230,width:170,height:50};
  targets[1].querySelectorAll=selector=>selector.includes('.cy-red-panel')?[dock,rightDock,centralRight,centralLeft]:[blocker];targets[1].querySelector=()=>divider;
  const nested=new Node('section');nested.parentElement={closest:()=>targets[1]};
  shell.querySelectorAll=selector=>[...(selector.includes('.ag-header')?targets:targets.slice(1)),nested];
  media.matches=reduced;window.matchMedia=()=>media;
  const frames=new Map();let frameId=0,now=1024;const intersection=[],resizes=[];
  class IntersectionObserver {constructor(callback){this.callback=callback;intersection.push(this)}observe(){}}
  class ResizeObserver {constructor(callback){this.callback=callback;resizes.push(this)}observe(){}}
  window.IntersectionObserver=IntersectionObserver;window.ResizeObserver=ResizeObserver;
  const context=vm.createContext({performance:{now:()=>now},window,document,IntersectionObserver,ResizeObserver,getComputedStyle:()=>({position:'static'}),requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId},cancelAnimationFrame:id=>frames.delete(id)});
  const flush=()=>{for(const [id,callback] of [...frames]){frames.delete(id);callback()}};
  const hosts=()=>targets.map(target=>target.children.find(child=>child.className==='wd-energy-field')).filter(Boolean);
  return {context,root,window,document,media,targets,shell,frames,flush,hosts,intersection,resizes,setClock:value=>{now=value}};
}
const code=(await build({entryPoints:['src/scripts/agency-energy.ts'],bundle:true,write:false,format:'iife',platform:'browser'})).outputFiles[0].text;
const off=harness();vm.runInContext(code,off.context);assert.equal(off.hosts().length,0,'Deactivated Cybercore creates no pipe nodes');assert.equal(off.frames.size,0);off.window.emit('resize');off.window.emit('pageshow');assert.equal(off.frames.size,0);assert.equal(off.hosts().length,0);
off.root.dataset.activated='true';off.window.emit('webdecor:activationchange');assert.equal(off.hosts().length,3,'Activation creates exactly the content section fields');assert.equal(off.frames.size,1);off.flush();assert.ok(off.hosts().every(host=>host.hidden===false));
assert.equal(off.targets[0].children.length,0,'The real topbar receives no energy overlay');
const originalHosts=off.hosts(),originalSVGs=originalHosts.map(host=>host.children[0]);
assert.equal(off.hosts()[0].style.left,'-36px','Inset sections share the outer shell coordinates');
assert.equal(off.hosts()[0].children[0].attrs.viewBox,'0 0 1000 600');
const measuredGroups=off.hosts()[0].children[0].children;
for(const group of measuredGroups.slice(0,6)){assert.equal(group.children.filter(path=>path.attrs.class.includes('wd-pipe-bus')).length,2);assert.equal(group.children.filter(path=>path.attrs.class.includes('wd-pipe-branch')).length,4);}
function checkSurfaceEnds(runtime){
  assert.equal(runtime.targets[0].children.length,0,'Topbar remains entirely free of pipe overlays');
  const ids=new Set();let fadedEdges=0;
  const descendants=node=>[node,...node.children.flatMap(descendants)];
  for(const [index,host] of runtime.hosts().entries()){
    const svg=host.children[0],groups=svg.children.filter(node=>node.tag==='g'),nodes=descendants(svg);
    assert.equal(host.attrs['aria-hidden'],'true');assert.equal(svg.attrs.focusable,'false');
    assert.equal(groups.length,7,'Only the six pipe layers and panel ports remain, with no hardware layer');
    assert.ok(nodes.every(node=>!String(node.attrs.class||'').includes('wd-power-')),'No generators or couplers remain anywhere in the SVG');
    for(const node of nodes){if(node.attrs.id){assert.ok(!ids.has(node.attrs.id),'Surface mask definitions are unique across fields');ids.add(node.attrs.id);}assert.ok(!['a','button','foreignObject'].includes(node.tag));assert.equal(node.attrs.tabindex,undefined);}
    const defs=svg.children.find(node=>node.tag==='defs');
    if(index===1){assert.equal(defs,undefined,'Interior sections have no surface fade');assert.ok(groups.every(group=>!group.attrs.mask));continue;}
    fadedEdges++;assert.ok(defs,'Each outer content edge provides a native SVG fade');
    const mask=defs.children.find(node=>node.tag==='mask');assert.ok(mask);assert.equal(mask.attrs['data-edge'],index===0?'top':'bottom');assert.equal(mask.attrs.maskUnits,'userSpaceOnUse');assert.equal(mask.attrs.maskContentUnits,'userSpaceOnUse');
    const ref=`url(#${mask.attrs.id})`;assert.ok(groups.every(group=>group.attrs.mask===ref),'Every layer, including charges and panel ports, shares the same surface fade');
    const rect=mask.children.find(node=>node.tag==='rect');assert.ok(rect);
    const bounds=svg.attrs.viewBox.split(' ').map(Number);assert.equal(Number(rect.attrs.x||0),0);assert.equal(Number(rect.attrs.y||0),0);assert.equal(Number(rect.attrs.width),bounds[2]);assert.equal(Number(rect.attrs.height),bounds[3]);
    const gradientId=rect.attrs.fill.match(/^url\(#(.+)\)$/)?.[1];const gradient=defs.children.find(node=>node.tag==='linearGradient'&&node.attrs.id===gradientId);assert.ok(gradient,'Mask paint resolves to its local native gradient');
    assert.equal(gradient.attrs.gradientUnits,'userSpaceOnUse');assert.ok(Number(gradient.attrs.y2)>Number(gradient.attrs.y1));assert.ok(Number(gradient.attrs.y2)-Number(gradient.attrs.y1)<=24,'The fade is confined to the outer pipe end');
    const stops=gradient.children;assert.ok(stops.length>=2);assert.equal(stops[0].attrs['stop-opacity'],index===0?'0':'1');assert.equal(stops.at(-1).attrs['stop-opacity'],index===0?'1':'0','Pipe opacity falls to zero beneath the selected page edge');
    if(index===0)assert.equal(Number(gradient.attrs.y1),0);else assert.equal(Number(gradient.attrs.y2),bounds[3]);
  }
  assert.equal(fadedEdges,2,'Only the first content and footer ends disappear under the surface');
}
checkSurfaceEnds(off);
const phaseValue=path=>Number(path.attrs.style.match(/--pipe-phase:([\d.]+)px/)[1]);
const previousExtra=side=>off.hosts().slice(0,2).reduce((total,host,index)=>total+arcLength(host.children[0].children[0].children[side].attrs.d)-off.targets[index+1].box.height,0);
for(const side of [0,1])assert.ok(Math.abs(phaseValue(off.hosts()[2].children[0].children[0].children[side])-(900+previousExtra(side))%248)<.06,'Section pulse includes each gutter’s actual upstream bend lengths');
const measuredBuses=measuredGroups[0].children.filter(path=>path.attrs.class.includes('wd-pipe-bus'));
const measuredBranches=measuredGroups[0].children.filter(path=>path.attrs.class.includes('wd-pipe-branch'));
assert.equal(measuredBuses.length,2,'Both measured gutter buses render in each layer');
assert.equal(measuredBranches.length,4,'Each distinct target gets one feed; no target is wired from both gutters');
const measuredPorts=measuredGroups.find(group=>group.attrs.class==='wd-pipe-ports').children.filter(node=>node.tag==='rect');
assert.deepEqual(measuredPorts.map(port=>[port.attrs.x,port.attrs.y]),[['278','114'],['378','384'],['918','478'],['628','278']], 'Ports attach real left/right panel edges; central panels alternate to different targets');
assert.equal(off.hosts()[0].style.top,'-2px','Border-box rails bridge adjacent section borders');
for(const [index,branch] of measuredBranches.entries()){const side=index<2?0:1,source=pathPoints(branch.attrs.d)[0],bus=measuredBuses[side];
  const expected=(sourceDistance({d:bus.attrs.d,points:[pathPoints(bus.attrs.d)[0]]},source.y)+Math.abs(source.x-pathPoints(bus.attrs.d)[0].x))%248;
  assert.ok(Math.abs(phaseValue(branch)-expected)<.06,'Measured branch pulse follows prior section bend lengths and its exact source arc');}
assert.ok(measuredBranches[0].attrs.d.startsWith('M14 43'));
assert.ok(measuredBranches[2].attrs.d.startsWith('M986 500'));
assert.ok(measuredBranches[3].attrs.d.startsWith('M986 300'),'Right attachments use separate measured bottom corridors');
off.hosts()[0].animations.push({currentTime:null});
off.intersection[0].callback(off.targets.map(target=>({target,isIntersecting:true})));
assert.ok(off.hosts().every(host=>host.dataset.running==='true'));
assert.equal(off.hosts()[0].animations[0].currentTime,0,'Newly visible animations resume on one shared epoch');
off.intersection[0].callback([{target:off.targets[2],isIntersecting:false}]);assert.equal(off.hosts()[1].dataset.running,'false');
off.document.hidden=true;off.document.emit('visibilitychange');assert.ok(off.hosts().every(host=>host.dataset.running==='false'));
off.document.hidden=false;off.document.emit('visibilitychange');assert.equal(off.hosts()[0].dataset.running,'true');
off.media.matches=true;off.media.emit('change');assert.ok(off.hosts().every(host=>host.dataset.running==='false'));
off.media.matches=false;off.media.emit('change');
for(const [index,active] of [false,true,false,true].entries()){
  off.setClock(1100+index*100);
  if(!active){off.window.emit('resize');assert.equal(off.frames.size,1);delete off.root.dataset.activated;}else off.root.dataset.activated='true';
  off.window.emit('webdecor:activationchange');
  if(!active){assert.equal(off.frames.size,0,'Deactivation cancels pending geometry immediately');assert.ok(off.hosts().every(host=>host.hidden===true&&host.dataset.running==='false'),'All cached pipes hide and pause immediately');off.window.emit('resize');assert.equal(off.frames.size,0);off.window.emit('pagehide');off.window.emit('pageshow');assert.equal(off.frames.size,0);assert.ok(off.hosts().every(host=>host.hidden===true&&host.dataset.running==='false'),'Page restoration keeps deactivated cached pipes hidden');}
  off.flush();assert.equal(off.hosts().length,3);assert.deepEqual(off.hosts(),originalHosts);assert.deepEqual(off.hosts().map(host=>host.children[0]),originalSVGs);checkSurfaceEnds(off);
  assert.equal(off.hosts()[1].dataset.running,'false','Offscreen motion stays suspended');assert.equal(off.hosts()[0].dataset.running,String(active));assert.ok(off.hosts().every(host=>host.hidden===!active));
  if(active)assert.equal(off.hosts()[0].animations[0].currentTime,1100+index*100-1024,'Reactivation resynchronizes cached paths to the shared elapsed epoch');
  off.document.hidden=true;off.document.emit('visibilitychange');assert.ok(off.hosts().every(host=>host.dataset.running==='false'));off.document.hidden=false;off.document.emit('visibilitychange');
  off.media.matches=true;off.media.emit('change');assert.ok(off.hosts().every(host=>host.dataset.running==='false'));off.media.matches=false;off.media.emit('change');assert.equal(off.hosts()[0].dataset.running,String(active));
}
off.setClock(2072);off.hosts()[0].animations=[{currentTime:null}];
off.shell.clientWidth=360;off.window.emit('resize');off.window.emit('resize');off.resizes[0].callback();assert.equal(off.frames.size,1,'Geometry work coalesces');off.flush();assert.equal(off.hosts()[0].children[0].attrs.viewBox,'0 0 360 600');assert.equal(off.frames.size,0,'There is no continuous JavaScript animation loop');assert.equal(off.hosts()[0].animations[0].currentTime,1048,'Geometry rebuilds resynchronize new path animations to the shared elapsed epoch');checkSurfaceEnds(off);
off.window.emit('resize');assert.equal(off.frames.size,1);
off.window.emit('pagehide');assert.equal(off.frames.size,0,'Page suspension cancels pending measurements');assert.ok(off.hosts().every(host=>host.dataset.running==='false'));off.window.emit('pageshow');off.flush();assert.equal(off.hosts()[0].dataset.running,'true');
for(const active of [false,true]){const still=harness({active,reduced:true});vm.runInContext(code,still.context);still.flush();
  if(active){assert.equal(still.hosts().length,3);assert.ok(still.hosts().every(host=>host.children[0].children.length>=7&&host.dataset.running==='false'&&host.hidden===false),'Reduced motion preserves complete static pipes only after activation');checkSurfaceEnds(still);}
  else{assert.equal(still.hosts().length,0);assert.equal(still.frames.size,0);}
}
for(const world of ['collage','swiss','hackerlair'])for(const active of [false,true]){const other=harness({world,active});vm.runInContext(code,other.context);assert.equal(other.hosts().length,0);assert.equal(other.frames.size,0);}
console.log('PASS: empty topbar, native fading pipe ends without hardware, asymmetric measured targets, obstruction-safe bent dual gutter buses, one attachment per panel, bounded SVG control points, mirrored obstruction-safe corners, shared feeds and pulse alignment, nested-section exclusion, resize coalescing, activation-only visibility and immediate deactivation, arc-distance phase continuity, palette-toggle reuse, motion suspension, page restoration, and world isolation.');
