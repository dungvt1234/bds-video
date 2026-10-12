import React, {useMemo} from 'react';
import {AbsoluteFill,Easing,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import buildings from './buildings.geojson';
import basemap from './basemap.geojson';
import locations from './locations.json';

type Point=[number,number];
type Feature={geometry:{type:string;coordinates:any};properties:{heightMeters?:number|null;buildingLevels?:number|null;heightStatus?:string;kind?:string;highway?:string}};
const buildingFeatures=buildings.features as unknown as Feature[];
const roadFeatures=basemap.features as unknown as Feature[];
const origin=locations.origin.coordinates as Point;
const factor=56000;
const roadIsMajor=(highway?:string)=>['primary','secondary','tertiary','trunk','primary_link','secondary_link'].includes(highway??'');
const cos=Math.cos(origin[1]*Math.PI/180);
const project=(p:Point):[number,number]=>[(p[0]-origin[0])*cos*factor,-(p[1]-origin[1])*factor];
const makeShape=(ring:Point[])=>{
 const s=new THREE.Shape();
 ring.forEach((p,i)=>{const [x,y]=project(p);if(i===0)s.moveTo(x,y);else s.lineTo(x,y)});
 s.closePath();return s;
};
type MeshData={geometry:THREE.BufferGeometry;material:'measured'|'estimated'};
const preparedBuildings:MeshData[]=buildingFeatures.flatMap((f)=>{
 const polys:Point[][][]=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
 const h=f.properties.heightMeters;
 const height=h!=null?Math.min(h*2.2,180):f.properties.buildingLevels!=null?Math.min(f.properties.buildingLevels*6.6,150):11;
 return polys.flatMap((poly)=>{
  if(!poly?.[0]||poly[0].length<4)return [];
  try{
   const shape=makeShape(poly[0]);
   for(const hole of poly.slice(1)){if(hole.length<4)continue;const path=new THREE.Path();hole.forEach((p,i)=>{const [x,y]=project(p);if(i===0)path.moveTo(x,y);else path.lineTo(x,y)});shape.holes.push(path)}
   const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});
   geo.rotateX(-Math.PI/2);
   return [{geometry:geo,material:h!=null?'measured' as const:'estimated' as const}];
  }catch{return []}
 });
});
const preparedRoads=roadFeatures.filter(f=>f.geometry.type==='LineString'&&f.properties.kind==='road').map(f=>{
 const pts=(f.geometry.coordinates as Point[]).map(p=>{const [x,y]=project(p);return new THREE.Vector3(x,1.4,y)});
 return pts.length>1?{geometry:new THREE.BufferGeometry().setFromPoints(pts),major:roadIsMajor(f.properties.highway)}:null;
}).filter((v):v is {geometry:THREE.BufferGeometry;major:boolean}=>v!==null);
const City:React.FC<{frame:number}>=({frame})=>{
 const measured=useMemo(()=>new THREE.MeshStandardMaterial({color:'#7297a5',metalness:.25,roughness:.58,emissive:'#183c49',emissiveIntensity:.22}),[]);
 const estimated=useMemo(()=>new THREE.MeshStandardMaterial({color:'#315263',metalness:.12,roughness:.8,emissive:'#12313e',emissiveIntensity:.3}),[]);
 const road=useMemo(()=>new THREE.LineBasicMaterial({color:'#537985',transparent:true,opacity:.83}),[]);
 const majorRoad=useMemo(()=>new THREE.LineBasicMaterial({color:'#b0d8c0',transparent:true,opacity:.94}),[]);
 const glow=useMemo(()=>new THREE.MeshBasicMaterial({color:'#baff55'}),[]);
 const progress=interpolate(frame,[0,149],[0,1],{extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const pulse=1+Math.sin(frame*.13)*.13;
 const radar=18+((frame*1.7)%90);
 const radarOpacity=.7*(1-((frame*1.7)%90)/90);
 return <group position={[0,-18,-90+progress*85]} rotation={[0,-.22+progress*.17,0]} scale={.68+progress*.38}>
  <ambientLight intensity={2.2}/>
  <directionalLight position={[500,1200,400]} intensity={3.4} color="#b1e5ec"/>
  <pointLight position={[0,220,0]} intensity={34000} distance={950} color="#baff55"/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,0]}>
   <planeGeometry args={[8500,8500]}/><meshStandardMaterial color="#102633" roughness={1}/>
  </mesh>
  {preparedRoads.map((g,i)=><primitive key={i} object={new THREE.Line(g.geometry,g.major?majorRoad:road)}/>)}
  {preparedBuildings.map((b,i)=><mesh key={i} geometry={b.geometry} material={b.material==='measured'?measured:estimated}/>)}
  <mesh position={[0,55+Math.sin(frame*.13)*5,0]} scale={pulse} material={glow}><sphereGeometry args={[15,24,16]}/></mesh>
  <mesh position={[0,28,0]}><cylinderGeometry args={[2,2,52,12]}/><meshBasicMaterial color="#baff55" transparent opacity={.9}/></mesh>
  <mesh position={[0,4,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[radar,radar+3,64]}/><meshBasicMaterial color="#baff55" transparent opacity={radarOpacity} side={THREE.DoubleSide}/></mesh>
  <mesh position={[0,5,0]} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[25,30,48]}/><meshBasicMaterial color="#baff55" transparent opacity={.85} side={THREE.DoubleSide}/>
  </mesh>
 </group>;
};
export const CentrePointCity3DIntro:React.FC=()=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const title=spring({frame:frame-8,fps,config:{damping:18,stiffness:95}});
 return <AbsoluteFill style={{background:'#061019',fontFamily:'Arial,sans-serif',color:'#f4f7f4'}}>
  <ThreeCanvas width={1080} height={1920} camera={{fov:48,near:1,far:15000,position:[0,780,1050]}}>
   <color attach="background" args={['#061019']}/>
   <fog attach="fog" args={['#061019',1900,6200]}/>
   <City frame={frame}/>
  </ThreeCanvas>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(4,12,20,.78),transparent 32%,transparent 62%,rgba(4,12,20,.82))',pointerEvents:'none'}}/>
  <div style={{position:'absolute',top:175,left:75,right:75,opacity:title,transform:`translateY(${(1-title)*55}px)`}}>
   <div style={{fontSize:23,color:'#baff55',letterSpacing:6,fontWeight:700}}>VŨNG TÀU / CITY 3D</div>
   <div style={{fontSize:66,lineHeight:1.04,fontWeight:800,marginTop:25}}>TÂM ĐIỂM<br/><span style={{color:'#baff55'}}>KẾT NỐI</span></div>
  </div>
  <div style={{position:'absolute',bottom:215,left:75,right:75}}>
   <div style={{fontSize:27,color:'#baff55',letterSpacing:4}}>01 / LOCATION</div>
   <div style={{fontSize:46,fontWeight:800,marginTop:16}}>VŨNG TÀU<br/>CENTRE POINT</div>
  </div>
  <div style={{position:'absolute',bottom:62,left:75,right:75,fontSize:17,color:'#adbdc1'}}>© OPENSTREETMAP CONTRIBUTORS · KHỐI 3D THIẾU CHIỀU CAO CHỈ MANG TÍNH MINH HỌA</div>
 </AbsoluteFill>;
};
