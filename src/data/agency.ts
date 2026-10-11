// Update the baseline copy and real contact details here.
export const agency = {
 name: 'WebDECOR',
 tagline: 'Websites with character.',
 email: '', // Add a real public email to enable the email-draft contact route.
 bookingUrl: '',
 // Add the full public profile URLs when ready; empty entries stay noninteractive.
 socials: [
  {id:'instagram',name:'Instagram',purpose:'Images & process',url:''},
  {id:'linkedin',name:'LinkedIn',purpose:'Studio & connections',url:''},
  {id:'behance',name:'Behance',purpose:'Selected projects',url:''}
 ] satisfies Array<{id:'instagram'|'linkedin'|'behance';name:string;purpose:string;url:string}>,
 description: 'An independent web design agency connecting strategy, art direction, and development. Distinctive websites, made to work beautifully.',
 pricing: [
  {id:'essential',number:'01',name:'Essential',price:'$1,200',description:'A focused website with a clear visual direction.',features:['Core website experience','Responsive design','Launch essentials'],label:'CHOOSE ESSENTIAL'},
  {id:'expanded',number:'02',name:'Expanded',price:'$2,400',description:'A more complete presence with room for richer content.',features:['Expanded page structure','A cohesive visual system','More detailed interactions'],label:'CHOOSE EXPANDED'},
  {id:'custom',number:'03',name:'Custom',price:'Custom',description:'A tailored scope for a website with different requirements.',features:['Project-specific scope','Special features & integrations','A tailored proposal'],label:'DEFINE YOUR SCOPE'}
 ],
 services: [
  {id:'direction',number:'01',name:'Strategy & direction',line:'A clear idea before a single pixel.',description:'Define what your website needs to say, who it needs to reach, and what it needs to do. We turn that thinking into a structure and a visual direction.',deliverables:['Discovery & website audit','Audience & content priorities','Site architecture','Creative direction'],outcome:'A shared direction and a useful plan.'},
  {id:'design',number:'02',name:'Website design',line:'Your character, made visible.',description:'Typography, imagery, layout, and interaction working as one. We design a digital world around your identity, with clear paths through the content.',deliverables:['Art direction & visual system','Key page designs','Responsive layouts','Interaction prototypes'],outcome:'A website that feels unmistakably yours.'},
  {id:'build',number:'03',name:'Development & launch',line:'Built as carefully as it looks.',description:'Carry the design into a responsive website. Content structure, accessible navigation, and careful implementation turn the visual idea into an experience people can use.',deliverables:['Responsive development','Content & CMS setup as scoped','Accessibility & device checks','Launch & handover'],outcome:'A working website and a clear handover.'},
  {id:'evolve',number:'04',name:'Redesign & evolution',line:'Keep what works. Move the rest forward.',description:'Reconsider an existing website or develop its next chapter. We look at the content, journeys, and visual language together, then prioritise the changes that matter.',deliverables:['Existing website review','Content & journey improvements','Design system refinement','New pages & features as scoped'],outcome:'A more coherent experience with room to grow.'}
 ],
 process: [
  {number:'01',name:'Discover',text:'Start with your goals, audience, content, and constraints. Agree the scope and what a successful project should achieve.',output:'PROJECT BRIEF'},
  {number:'02',name:'Design',text:'Explore a visual direction, then work through the pages and interactions. Review the choices in context, not in isolation.',output:'DESIGN SYSTEM + PAGES'},
  {number:'03',name:'Build',text:'Translate the approved designs into a responsive website. Bring in the content and check the experience across devices.',output:'WORKING WEBSITE'},
  {number:'04',name:'Launch',text:'Review the final details, publish the site, and hand over the essentials for its next chapter.',output:'LIVE SITE + HANDOVER'}
 ],
 faqs: [
  {question:'What kinds of websites can we make?',answer:'Brand and business websites, portfolios, editorial platforms, and commerce experiences. The structure and functionality are defined around the project rather than a fixed visual template.'},
  {question:'Can we work with an existing brand or website?',answer:'Yes. A project can begin with an established identity, an existing website, or a completely new direction. The first step is deciding what to carry forward and what needs to change.'},
  {question:'What should I prepare before a project?',answer:'Your goals, intended audience, existing website, brand assets, and any available copy or imagery are useful starting points. A desired launch date and budget range help define the scope.'},
  {question:'How are timing and cost decided?',answer:'Essential is $1,200 and Expanded is $2,400. Custom projects are quoted around the scope. Timing depends on the content, pages, and features; deliverables and milestones are confirmed before work begins.'},
  {question:'Are FORME and OBJECT / ROOM client projects?',answer:'They are self-initiated design studies. They demonstrate visual direction and interface ideas, and are clearly labelled as concepts rather than client commissions.'},
  {question:'What happens when I create a project brief?',answer:'The brief is downloaded to your device. It is not submitted or sent to anyone. You can keep it, revise it, or share it when you are ready.'}
 ]
};
export const studies = [
 {slug:'forme',number:'01',name:'FORME',category:'FASHION / COMMERCE',headline:'Desire, reframed.',image:'/images/cybercore-forme-scan.webp',width:1402,height:1122,alt:'A technical black shoulder bag framed by scan textures, contour lines, and a red registration mark',summary:'An experimental fashion storefront where material scans and precise typography give a technical collection its own visual world.',challenge:'How can a technical object feel expressive without making the shopping experience harder to use?',direction:'Treat the collection like a material archive. Photocopied textures and displaced contours bring tension to the imagery; a geometric identity gives the experience a clear signature.',experience:'A campaign-led entrance introduces the collection. A measured product index and considered object details carry that visual world through the shopping journey.',deliverables:['Art direction','Geometric identity','Storefront concept'],sequence:['DISCOVER THE COLLECTION','EXPLORE THE OBJECT','MAKE A SELECTION']},
 {slug:'object',number:'02',name:'OBJECT / ROOM',category:'INTERIORS / CULTURE',headline:'A different perspective.',image:'/images/cybercore-object-wireframe.webp',width:1254,height:1254,alt:'A sculptural metal chair dissolving into fine wireframe linework inside a stark architectural space',summary:'A digital showroom study that connects photographic space with archival CAD linework and a measured project index.',challenge:'How can a furniture website communicate the relationship between an object and the space around it?',direction:'Bring the photograph and the drawing together. Wireframe geometry makes the construction visible, while the architectural image gives the object scale and atmosphere.',experience:'An image-led project index makes room for the work. Material notes and clear object information sit inside a precise editorial grid.',deliverables:['Visual direction','Showroom concept','Content architecture'],sequence:['ENTER THE SPACE','OBSERVE THE OBJECT','EXPLORE THE MATERIAL']}
];
