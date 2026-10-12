import React from 'react';
import * as THREE from 'three';
import {interpolate,useCurrentFrame} from 'remotion';

/**
 * Stylized architectural study from three supplied visual references.
 * Dimensions, storey count and footprint are illustrative, NOT surveyed.
 * Place at the known Centre Point map pin; do not claim as-built accuracy.
 */
const ivory='#e4e9e9';
const glass='#4c8094';
const gold='#bd9462';
const floorCount=17; // visual repetition only, not a verified storey count
const Wing:React.FC<{position:[number,number,number];size:[number,number,number];axis:'x'|'z'}>=({position,size,axis})=>{
 const [w,h,d]=size;
 const windows=Array.from({length:floorCount},(_,floor)=>floor).flatMap(floor=>{
  const count=axis==='x'?Math.floor(w/7):Math.floor(d/7);
  return Array.from({length:count},(_,i)=>({floor,i,count}));
 });
 return <group position={position}>
  <mesh position={[0,h/2,0]}><boxGeometry args={size}/><meshStandardMaterial color={ivory} roughness={.7}/></mesh>
  <mesh position={[0,h+.8,0]}><boxGeometry args={[w+2,1.6,d+2]}/><meshStandardMaterial color="#cbd7d8"/></mesh>
  {windows.map(({floor,i,count})=>{
   const y=11+(floor+.5)*(h-14)/floorCount;
   const t=(i+.5-count/2)*((axis==='x'?w:d)-8)/count;
   return <group key={floor+'-'+i}>
    <mesh position={axis==='x'?[t,y,d/2+.2]:[w/2+.2,y,t]} rotation={axis==='x'?[0,0,0]:[0,Math.PI/2,0]}>
     <planeGeometry args={[Math.max(2,(axis==='x'?w:d)/count-2),(h-14)/floorCount*.67]}/>
     <meshStandardMaterial color={glass} emissive="#0e394d" emissiveIntensity={.25} metalness={.25} roughness={.3} side={THREE.DoubleSide}/>
    </mesh>
    <mesh position={axis==='x'?[t,y,d/2+.65]:[w/2+.65,y,t]} rotation={axis==='x'?[0,0,0]:[0,Math.PI/2,0]}>
     <boxGeometry args={[Math.max(2,(axis==='x'?w:d)/count-1),.7,1]}/>
     <meshStandardMaterial color="#d4d9da"/>
    </mesh>
   </group>;
  })}
 </group>;
};
export const CentrePointHeroBuilding:React.FC=()=>{
 const frame=useCurrentFrame();
 const reveal=interpolate(frame,[8,55],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const pulse=1+Math.sin(frame*.1)*.07;
 return <group scale={[1,reveal,1]}>
  <mesh position={[0,5,0]}><boxGeometry args={[188,10,110]}/><meshStandardMaterial color={gold} metalness={.5} roughness={.5}/></mesh>
  <mesh position={[0,10,0]}><boxGeometry args={[185,2,108]}/><meshStandardMaterial color="#d3b487"/></mesh>
  {/* Three wings arranged as a U, open toward the foreground. */}
  <Wing position={[0,0,-42]} size={[174,118,24]} axis="x"/>
  <Wing position={[-73,0,0]} size={[28,118,100]} axis="z"/>
  <Wing position={[73,0,0]} size={[28,118,100]} axis="z"/>
  <mesh position={[0,11,0]} rotation={[-Math.PI/2,0,0]}>
   <planeGeometry args={[87,43]}/><meshStandardMaterial color="#188da0" metalness={.25} roughness={.22} side={THREE.DoubleSide}/>
  </mesh>
  <mesh position={[0,12,0]} rotation={[-Math.PI/2,0,0]}>
   <planeGeometry args={[68,27]}/><meshBasicMaterial color="#32c6d0" transparent opacity={.65} side={THREE.DoubleSide}/>
  </mesh>
  <mesh position={[0,3,0]} rotation={[-Math.PI/2,0,0]} scale={pulse}>
   <ringGeometry args={[128,133,96]}/><meshBasicMaterial color="#baff55" transparent opacity={.8} side={THREE.DoubleSide}/>
  </mesh>
  <pointLight position={[0,180,30]} intensity={22000} distance={480} color="#fff3c4"/>
 </group>;
};
