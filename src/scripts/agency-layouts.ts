export type AgencyWorld='cybercore'|'collage'|'swiss'|'hackerlair'|'weird-internet';
const homeOrder:Record<AgencyWorld,string[]>={
 cybercore:['hero','services','pricing','work','archive','studio','process','questions','invitation'],
 collage:['hero','work','archive','studio','services','process','pricing','questions','invitation'],
 hackerlair:['hero','work','archive','services','pricing','studio','process','questions','invitation'],
 swiss:['hero','services','work','archive','studio','process','pricing','questions','invitation'],
 'weird-internet':['hero','work','archive','services','studio','pricing','process','questions','invitation']
};
const studioOrder:Record<AgencyWorld,string[]>={'weird-internet':['hero','manifesto','principles','proof','links','invitation'],hackerlair:['hero','manifesto','proof','principles','links','invitation'],cybercore:['hero','manifesto','principles','proof','links','invitation'],collage:['hero','manifesto','proof','principles','links','invitation'],swiss:['hero','proof','manifesto','principles','links','invitation']};
const caseOrder:Record<AgencyWorld,string[]>={'weird-internet':['hero','narrative','specification','interface','journey','next'],hackerlair:['hero','narrative','interface','specification','journey','next'],cybercore:['hero','narrative','interface','specification','journey','next'],collage:['hero','narrative','specification','interface','journey','next'],swiss:['hero','interface','narrative','specification','journey','next']};
function reorder(container:HTMLElement,order:string[]){
 const sections=Array.from(container.children) as HTMLElement[];
 const keyed=new Map(sections.map(section=>[section.dataset.layoutKey,section]));
 order.forEach(key=>{const section=keyed.get(key);if(section)container.appendChild(section)});
}
export function applyWorldLayout(world:AgencyWorld){
 const main=document.querySelector<HTMLElement>('main[data-agency-page]');if(!main)return;
 if(main.dataset.agencyPage==='home')reorder(main,homeOrder[world]);
 if(main.dataset.agencyPage==='studio')reorder(main,studioOrder[world]);
 const study=main.querySelector<HTMLElement>('.wd-case');if(study)reorder(study,caseOrder[world]);
 const brief=main.querySelector<HTMLElement>('.wd-start-body');
 if(brief){const sidebar=brief.querySelector('.wd-brief-sidebar'),inquiry=brief.querySelector('.ag-inquiry');if(sidebar&&inquiry){brief.appendChild(world==='collage'?inquiry:sidebar);brief.appendChild(world==='collage'?sidebar:inquiry)}}
 main.dataset.layout=world;
}
