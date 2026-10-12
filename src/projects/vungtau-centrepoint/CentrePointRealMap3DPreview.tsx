import React,{useEffect,useState} from 'react';
import {AbsoluteFill,continueRender,delayRender,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import locations from './locations.json';
import routing from './routes.geojson';

type Feature={geometry:{coordinates:number[][][]};properties:{heightMeters:number|null;heightSource:string}};
type Collection={features:Feature[]};
const origin=locations.origin.coordinates as number[];
const meters=(p:number[])=>[(p[0]-origin[0])*111320*Math.cos(origin[1]*Math.PI/180),(p[1]-origin[1])*111320] as const;
const scale=.055;
const RoadGlow:React.FC<{frame:number}>=({frame})=>{
 const route=routing.features[0].geometry.coordinates as number[][];
 const coords=route.filter((_,i)=>i%Math.max(1,Math.floor(route.length/450))===0).map(p=>{const [x,z]=meters(p);return new THREE.Vector3(x*scale,.35,-z*scale)});
 if(coords.length<2)return null;
 const points=new THREE.CatmullRomCurve3(coords).getPoints(450);
 const progress=interpolate(frame,[10,140],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const n=Math.max(2,Math.floor(points.length*progress));
 const partial=new THREE.CatmullRomCurve3(points.slice(0,n));
 return <group>
  <mesh><tubeGeometry args={[partial,Math.max(2,n),.25,5,false]}/><meshBasicMaterial color="#ffb267"/></mesh>
  <mesh><tubeGeometry args={[partial,Math.max(2,n),.68,5,false]}/><meshBasicMaterial color="#fa4bb0" transparent opacity={.22} depthWrite={false}/></mesh>
 </group>;
};
const Model:React.FC<{buildings:Feature[];frame:number}>=({buildings,frame})=>{
 const rotation=interpolate(frame,[0,149],[-.18,.2],{extrapolateRight:'clamp'});
 return <group rotation={[0,rotation,0]}>
  <ambientLight intensity={1.4}/><directionalLight position={[30,70,40]} intensity={2.2}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.3,0]}><planeGeometry args={[150,150]}/><meshStandardMaterial color="#172934"/></mesh>
  {buildings.slice(0,1800).map((f,i)=>{
   const ring=f.geometry?.coordinates?.[0];if(!ring||ring.length<4)return null;
   const pts=ring.map(p=>{const [x,z]=meters(p);return new THREE.Vector2(x*scale,-z*scale)});
   const shape=new THREE.Shape(pts);
   const height=(f.properties.heightMeters??9)*scale;
   return <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0,0,0]}>
    <extrudeGeometry args={[shape,{depth:height,bevelEnabled:false,steps:1}]}/>
    <meshStandardMaterial color={i%5===0?'#5a7186':'#334b60'} metalness={.18} roughness={.8}/>
   </mesh>;
  })}
  <RoadGlow frame={frame}/>
  <mesh position={[0,1.8,0]}><cylinderGeometry args={[.6,.6,3.6,12]}/><meshBasicMaterial color="#c8ff76" transparent opacity={.85}/></mesh>
 </group>;
};
export const CentrePointRealMap3DPreview:React.FC=()=>{
 const frame=useCurrentFrame();
 const [handle]=useState(()=>delayRender('Loading OSM building footprints'));
 const [data,setData]=useState<Collection|null>(null);
 const [error,setError]=useState<string|null>(null);
 useEffect(()=>{let active=true;fetch(staticFile('centrepoint-buildings.geojson')).then(r=>{if(!r.ok)throw Error('OSM building data missing');return r.json()}).then((d:Collection)=>{if(!d.features?.length)throw Error('OSM building data empty');if(active)setData(d)}).catch(e=>{if(active)setError(String(e))}).finally(()=>continueRender(handle));return ()=>{active=false}},[handle]);
 if(error)throw Error(error);
 return <AbsoluteFill style={{background:'#0b1824'}}>
  {data&&<ThreeCanvas width={1080} height={1920} orthographic camera={{position:[80,105,110],zoom:8,near:.1,far:1000}}><Model buildings={data.features} frame={frame}/></ThreeCanvas>}
  <div style={{position:'absolute',top:170,left:65,right:65,color:'#fff',fontFamily:'Arial,sans-serif',fontSize:50,fontWeight:800}}>VŨNG TÀU CENTRE POINT</div>
  <div style={{position:'absolute',bottom:100,left:65,right:65,color:'#b6c7c9',fontSize:21,fontFamily:'Arial,sans-serif'}}>OSM BUILDING FOOTPRINTS · HEIGHTS MAY BE ESTIMATED · ROUTE UNVERIFIED · 3D PREVIEW ONLY</div>
 </AbsoluteFill>;
};
