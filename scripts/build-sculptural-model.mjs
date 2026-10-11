import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs';
import sharp from 'sharp';
class BlobReader{readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.()})}readAsDataURL(blob){blob.arrayBuffer().then(data=>{this.result=`data:${blob.type};base64,${Buffer.from(data).toString('base64')}`;this.onloadend?.()})}}
globalThis.FileReader=BlobReader;
const root=new THREE.Group();root.name='WebDECOR_Asterisk_001';
const ceramic=new THREE.MeshPhysicalMaterial({color:0x153fcb,metalness:.04,roughness:.26,clearcoat:.6,clearcoatRoughness:.24});ceramic.name='Cobalt_Ceramic';
const metal=new THREE.MeshStandardMaterial({color:0xbfc3c5,metalness:.93,roughness:.29});metal.name='Brushed_Aluminium';
const s=new THREE.Shape();s.moveTo(0,-.2);s.bezierCurveTo(.4,-.23,.88,-.37,1.45,-.31);s.bezierCurveTo(1.72,-.28,1.81,-.13,1.79,.04);s.bezierCurveTo(1.77,.25,1.59,.32,1.37,.31);s.bezierCurveTo(.87,.3,.41,.21,0,.2);s.quadraticCurveTo(-.12,0,0,-.2);
const petalGeometry=new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelThickness:.09,bevelSize:.085,bevelSegments:5,curveSegments:24,steps:1});petalGeometry.translate(0,0,-.11);
// Average coincident vertex normals so the ceramic bevels catch the studio light continuously.
const positions=petalGeometry.attributes.position,normals=petalGeometry.attributes.normal,normalGroups=new Map();
for(let i=0;i<positions.count;i++){const key=[positions.getX(i),positions.getY(i),positions.getZ(i)].map(n=>Math.round(n*100000)).join(',');let group=normalGroups.get(key);if(!group){group={normal:new THREE.Vector3(),indices:[]};normalGroups.set(key,group)}group.normal.add(new THREE.Vector3().fromBufferAttribute(normals,i));group.indices.push(i)}
for(const group of normalGroups.values()){group.normal.normalize();for(const i of group.indices)normals.setXYZ(i,group.normal.x,group.normal.y,group.normal.z)}
const hingeGeometry=new THREE.CylinderGeometry(.15,.15,.55,32),hubGeometry=new THREE.CylinderGeometry(.49,.49,.34,64);
const hub=new THREE.Mesh(hubGeometry,metal);hub.rotation.x=Math.PI/2;hub.name='Central_Hub';root.add(hub);
const cap=new THREE.Mesh(new THREE.SphereGeometry(.39,48,24),ceramic);cap.scale.set(1,1,.38);cap.position.z=.22;cap.name='Ceramic_Cap';root.add(cap);
for(let i=0;i<8;i++){
 const radial=new THREE.Group();radial.name=`Radial_${i}`;radial.rotation.z=i*Math.PI/4;root.add(radial);
 const pivot=new THREE.Group();pivot.name=`PetalPivot_${i}`;pivot.position.x=.49;radial.add(pivot);
 const petal=new THREE.Mesh(petalGeometry,ceramic);petal.name=`Petal_${i}`;pivot.add(petal);
 const hinge=new THREE.Mesh(hingeGeometry,metal);hinge.position.set(.01,0,-.015);hinge.name=`Hinge_${i}`;radial.add(hinge);hinge.position.x=.5;
}
fs.mkdirSync('public/models',{recursive:true});
const bytes=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});fs.writeFileSync('public/models/webdecor-asterisk.glb',Buffer.from(bytes));
const proofPath=process.argv[2]==='--proof'?process.argv[3]:undefined;
if(!proofPath){process.stdout.write(JSON.stringify({glbBytes:bytes.byteLength})+'\n');process.exit(0)}
// Deterministic geometry proof. The art-directed public poster is maintained separately.
root.rotation.set(-.12,-.38,-.2);root.updateMatrixWorld(true);
const camera=new THREE.PerspectiveCamera(37,1,.1,100);camera.position.set(0,.5,8.2);camera.lookAt(0,0,0);camera.updateMatrixWorld();camera.updateProjectionMatrix();
const light=new THREE.Vector3(-.6,.8,1).normalize(),faces=[];
root.traverse(mesh=>{
 if(!mesh.isMesh)return;const g=mesh.geometry,p=g.attributes.position,index=g.index;const count=index?index.count:p.count;
 for(let i=0;i<count;i+=3){const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld));const normal=new THREE.Vector3().subVectors(vertices[1],vertices[0]).cross(new THREE.Vector3().subVectors(vertices[2],vertices[0])).normalize();const center=vertices.reduce((a,v)=>a.add(v),new THREE.Vector3()).divideScalar(3);if(normal.dot(new THREE.Vector3().subVectors(camera.position,center))<=0)continue;
  const illumination=.42+.58*Math.max(0,normal.dot(light));const colour=mesh.material.color.clone().multiplyScalar(illumination);const view=new THREE.Vector3().subVectors(camera.position,center).normalize(),half=light.clone().add(view).normalize();const spec=Math.pow(Math.max(0,normal.dot(half)),mesh.material===metal?20:38)*(mesh.material===metal?.38:.18);colour.lerp(new THREE.Color(0xffffff),spec);
  const points=vertices.map(v=>{const p=v.clone().project(camera);return`${((p.x+1)*600).toFixed(2)},${((1-p.y)*600).toFixed(2)}`}).join(' ');
  faces.push({depth:center.clone().applyMatrix4(camera.matrixWorldInverse).z,path:`<polygon points="${points}" fill="#${colour.getHexString()}" stroke="#${colour.getHexString()}" stroke-width=".5"/>`});
 }
});faces.sort((a,b)=>a.depth-b.depth);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><defs><radialGradient id="bg"><stop stop-color="#f4f0e8"/><stop offset="1" stop-color="#e8e2d8"/></radialGradient><filter id="shadow"><feGaussianBlur stdDeviation="22"/></filter></defs><rect width="1200" height="1200" fill="url(#bg)"/><ellipse cx="610" cy="1020" rx="235" ry="28" fill="#4b3b2d" opacity=".17" filter="url(#shadow)"/>${faces.map(f=>f.path).join('')}</svg>`;
await sharp(Buffer.from(svg)).webp({quality:88}).toFile(proofPath);
process.stdout.write(JSON.stringify({glbBytes:bytes.byteLength,triangles:faces.length})+'\n');
