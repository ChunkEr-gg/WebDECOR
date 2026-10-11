export type EnergyPoint = {x:number;y:number};
export type EnergyBox = {left:number;right:number;top:number;bottom:number};
export type EnergyDock = EnergyBox & {blockers?:EnergyBox[];side?:'left'|'right'};
export type EnergyRoute = {d:string;points:EnergyPoint[];kind:'bus'|'branch';phase:number;side?:'left'|'right';length?:number};
const clearance=4;
const finitePoint=(point:EnergyPoint)=>Number.isFinite(point.x)&&Number.isFinite(point.y);
const overlaps=(a:EnergyBox,b:EnergyBox)=>a.right>b.left-clearance&&a.left<b.right+clearance&&a.bottom>b.top-clearance&&a.top<b.bottom+clearance;
function cleanPoints(points:EnergyPoint[]) {
  return points.filter((point,index)=>!index||point.x!==points[index-1].x||point.y!==points[index-1].y);
}
function roundPath(points:EnergyPoint[],blockers:EnergyBox[],junctions:EnergyPoint[]=[]) {
  let d=`M${points[0].x} ${points[0].y}`;
  for(let i=1;i<points.length-1;i++) {
    const previous=points[i-1],current=points[i],next=points[i+1];
    const before=Math.hypot(current.x-previous.x,current.y-previous.y);
    const after=Math.hypot(next.x-current.x,next.y-current.y);
    let radius=junctions.some(point=>point.x===current.x&&point.y===current.y)?0:Math.min(6,before/2,after/2);
    // A curve cuts inside its orthogonal corner. Keep its whole control hull
    // outside copy, rather than checking only the original straight segments.
    let a=current,b=current;
    while(radius>0) {
      a={x:current.x-(current.x-previous.x)/before*radius,y:current.y-(current.y-previous.y)/before*radius};
      b={x:current.x+(next.x-current.x)/after*radius,y:current.y+(next.y-current.y)/after*radius};
      const hull={left:Math.min(a.x,b.x,current.x),right:Math.max(a.x,b.x,current.x),top:Math.min(a.y,b.y,current.y),bottom:Math.max(a.y,b.y,current.y)};
      if(blockers.every(box=>!overlaps(hull,box)))break;
      radius=radius>1?radius/2:0;
    }
    d+=radius?`L${a.x} ${a.y}Q${current.x} ${current.y} ${b.x} ${b.y}`:`L${current.x} ${current.y}`;
  }
  const end=points.at(-1)!;
  return d+`L${end.x} ${end.y}`;
}
export function routeIsClear(points:EnergyPoint[],blockers:EnergyBox[]) {
  if(points.length<2||!points.every(finitePoint))return false;
  return points.slice(1).every((point,index)=>{
    const previous=points[index];
    if(point.x!==previous.x&&point.y!==previous.y)return false;
    const segment={left:Math.min(point.x,previous.x),right:Math.max(point.x,previous.x),top:Math.min(point.y,previous.y),bottom:Math.max(point.y,previous.y)};
    return blockers.every(box=>!overlaps(segment,box));
  });
}
/** Length of the rendered rounded route, including its quadratic bends. */
function pathLength(path:string) {
  const tokens=path.match(/[MLQV]|-?\d*\.?\d+(?:e[+-]?\d+)?/g)||[];
  let i=0,x=0,y=0,length=0;
  while(i<tokens.length) {
    const command=tokens[i++];
    if(command==='M'){x=Number(tokens[i++]);y=Number(tokens[i++]);continue}
    let cx=0,cy=0;
    if(command==='Q'){cx=Number(tokens[i++]);cy=Number(tokens[i++]);}
    const nextX=command==='V'?x:Number(tokens[i++]),nextY=Number(tokens[i++]);
    if(command==='Q') {
      const startX=x,startY=y;
      for(let step=1;step<=64;step++) {
        const t=step/64,u=1-t,nx=u*u*startX+2*u*t*cx+t*t*nextX,ny=u*u*startY+2*u*t*cy+t*t*nextY;
        length+=Math.hypot(nx-x,ny-y);x=nx;y=ny;
      }
    }else length+=Math.hypot(nextX-x,nextY-y);
    x=nextX;y=nextY;
  }
  return length;
}
function bendSupply(base:number,height:number,feedYs:number[],docks:EnergyDock[],blockers:EnergyBox[],lowerFirst:boolean) {
  const barriers=[0,height,...feedYs,...docks.flatMap(dock=>[dock.top,dock.bottom])].filter(y=>Number.isFinite(y)&&y>=0&&y<=height).sort((a,b)=>a-b);
  const intervals=barriers.slice(1).map((end,index)=>({start:barriers[index],end})).filter(band=>band.end-band.start>=48).sort((a,b)=>(b.end-b.start)-(a.end-a.start));
  // One return bend in a measured open band. Feed stations and section ends
  // stay at the common gutter, so adjoining sections and taps remain exact.
  if(lowerFirst&&intervals.length>1)[intervals[0],intervals[1]]=[intervals[1],intervals[0]];
  for(const band of intervals) {
    const margin=Math.min(18,(band.end-band.start)*.2),start=band.start+margin,end=band.end-margin;
    for(const jog of [base+12,Math.max(4,base-8)]) {
      const points=cleanPoints([{x:base,y:0},{x:base,y:start},{x:jog,y:start},{x:jog,y:end},{x:base,y:end},{x:base,y:height}]);
      if(routeIsClear(points,blockers)) {
        const d=roundPath(points,blockers);
        return {points,d,extra:pathLength(d)-height,end};
      }
    }
  }
  const points=[{x:base,y:0},{x:base,y:height}],d=`M${base} 0V${height}`;
  return {points,d,extra:0,end:height};
}
/** Route one supply in normalized left-gutter coordinates. */
function buildSide(width:number,height:number,docks:EnergyDock[],feedY:number,blockers:EnergyBox[],lowerFirst=false) {
  const routes:EnergyRoute[]=[],ports:EnergyPoint[]=[],junctions:EnergyPoint[]=[];
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<80||height<24)return {routes,ports,junctions,routeBlockers:[] as EnergyBox[][]};
  const bus=Math.min(22,Math.max(7,width*.014));
  routes.push({d:`M${bus} 0V${height}`,points:[{x:bus,y:0},{x:bus,y:height}],kind:'bus',phase:0});
  const trunks:Array<{y:number;endX:number}>=[],routeBlockers:EnergyBox[][]=[[]];
  for(const dock of docks) {
    if(![dock.left,dock.right,dock.top,dock.bottom].every(Number.isFinite)||dock.left<bus+4||dock.right>width||dock.right-dock.left<12||dock.top<0||dock.bottom>height||dock.bottom-dock.top<12)continue;
    const x=Math.max(bus,dock.left-12),inset=Math.min(18,(dock.bottom-dock.top)/3);
    const upper={x:dock.left,y:dock.top+inset},lower={x:dock.left,y:dock.bottom-inset};
    const entry=Math.max(5,Math.min(Number.isFinite(feedY)?feedY:5,height-5));
    const blockers=dock.blockers||[];
    const seam=[{x:bus,y:entry},{x,y:entry},{x,y:lowerFirst?lower.y:upper.y},lowerFirst?lower:upper];
    const candidates=(lowerFirst?[
      // Right supplies enter near the lower component edge, independently of
      // the upper-divider feeds used on the left.
      ...(dock.bottom<=height-5?[[{x:bus,y:dock.bottom},{x,y:dock.bottom},{x,y:lower.y},lower]]:[]),
      seam,[{x:bus,y:lower.y},lower],
      [{x:bus,y:upper.y},upper],
    ]:[seam,
      [{x:bus,y:lower.y},lower],
      [{x:bus,y:upper.y},upper],
      [{x:bus,y:dock.top},{x:dock.left,y:dock.top},upper],
    ]).map(cleanPoints);
    const candidate=candidates.find(candidate=>routeIsClear(candidate,blockers));
    if(!candidate)continue;
    let points=candidate,phase=candidate[0].y;
    // Render a shared divider feed once. Later docks tap its actual junction;
    // their dash phase includes the distance already travelled on that feed.
    if(candidate.length>2&&candidate[0].y===candidate[1].y&&candidate[1].x>bus) {
      const endX=candidate[1].x,y=candidate[0].y;
      const supplied=Math.max(bus,...trunks.filter(trunk=>trunk.y===y).map(trunk=>trunk.endX));
      const tapX=Math.min(endX,supplied);
      if(tapX>bus) {
        points=cleanPoints([{x:tapX,y},...candidate.slice(tapX===endX?2:1)]);
        phase+=tapX-bus;
      }
      trunks.push({y,endX});
    }
    if(points.length<2)continue;
    routes.push({d:'',points,kind:'branch',phase});routeBlockers.push(blockers);
    ports.push(points.at(-1)!);
    if(!junctions.some(point=>point.x===points[0].x&&point.y===points[0].y))junctions.push(points[0]);
  }
  const supply=bendSupply(bus,height,junctions.filter(point=>point.x===bus).map(point=>point.y),docks,blockers,lowerFirst);
  routes[0].points=supply.points;routes[0].d=supply.d;routeBlockers[0]=blockers;
  routes.forEach((route,index)=>{
    if(route.kind==='branch') {
      if(route.points[0].y>supply.end)route.phase+=supply.extra;
      route.d=roundPath(route.points,routeBlockers[index],junctions);
    }
    route.length=pathLength(route.d);
  });
  return {routes,ports,junctions,routeBlockers};
}

/** Two continuous supplies; each component docks to exactly one chosen edge. */
export function buildEnergyNetwork(width:number,height:number,docks:EnergyDock[]=[],feedY=5,blockers:EnergyBox[]=[]) {
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<80||height<24)return {routes:[] as EnergyRoute[],ports:[] as EnergyPoint[],junctions:[] as EnergyPoint[]};
  const reflectBox=(box:EnergyBox):EnergyBox=>({left:width-box.right,right:width-box.left,top:box.top,bottom:box.bottom});
  const left=buildSide(width,height,docks.filter(dock=>dock.side!=='right'),feedY,blockers);
  const right=buildSide(width,height,docks.filter(dock=>dock.side==='right').map(dock=>({...reflectBox(dock),blockers:dock.blockers?.map(reflectBox)})),feedY,blockers.map(reflectBox),true);
  const reflectPoint=(point:EnergyPoint):EnergyPoint=>({x:width-point.x,y:point.y});
  const rightJunctions=right.junctions.map(reflectPoint);
  const rightRoutes=right.routes.map((route,index)=>{
    const points=route.points.map(reflectPoint);
    // Rebuild geometry in actual page coordinates, including corner-safe hulls;
    // a CSS transform would also mirror highlight depth and port decoration.
    return {...route,side:'right' as const,points,d:roundPath(points,right.routeBlockers[index].map(reflectBox),rightJunctions)};
  });
  const leftRoutes=left.routes.map(route=>({...route,side:'left' as const}));
  return {routes:[leftRoutes[0],rightRoutes[0],...leftRoutes.slice(1),...rightRoutes.slice(1)],ports:[...left.ports,...right.ports.map(reflectPoint)],junctions:[...left.junctions,...rightJunctions]};
}
