import React from 'react';
import {AbsoluteFill,useCurrentFrame,interpolate,Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';

// Stylized illustrative city: NOT a geospatially accurate building model.
const blocks=Array.from({length:13*13},(_,i)=>{
 const x=i%13-6,z=Math.floor(i/13)-6;
 const empty=(Math.abs(x)<=1&&Math.abs(z)<=1)||(x===-4&&z===2)||(x===3&&z===-3);
 const height=2.5+((i*37)%11)*.75;
 return {x:x*6.4,z:z*6.4,height,empty};
});
const towers=blocks.filter(b=>!b.empty);
const routePoints=[[-39,0,-30],[-29,0,-30],[-24,0,-25],[-24,0,-10],[-19,0,-5],[-5,0,-5],[0,0,0],[10,0,0],[17,0,7],[17,0,27],[35,0,27]].map(([x,y,z])=>new THREE.Vector3(x,y+.24,z));
const curve=new THREE.CatmullRomCurve3(routePoints,false,'catmullrom',.18);
const route=curve.getPoints(260);
const segments=route.slice(1).map((p,i)=>({a:route[i],b:p}));
const Buildings:React.FC=()=> <group>{towers.map((b,i)=><group key={i} position={[b.x,b.height/2,b.z]}>
 <mesh castShadow><boxGeometry args={[4.6,b.height,4.6]}/><meshStandardMaterial color={i%4===0?'#41526a':'#29384b'} metalness={.3} roughness={.65}/></mesh>
 <mesh position={[0,b.height/2+.06,0]}><boxGeometry args={[4.65,.12,4.65]}/><meshBasicMaterial color={i%7===0?'#65c8ff':'#61768a'}/></mesh>
 {Array.from({length:Math.floor(b.height/1.6)},(_,j)=><group key={j} position={[0,-b.height/2+.9+j*1.6,0]}>
  <mesh position={[0,0,2.33]}><boxGeometry args={[3.7,.13,.03]}/><meshBasicMaterial color={j%3===0?'#ffb56e':'#77a9c3'} transparent opacity={.7}/></mesh>
  <mesh position={[2.33,0,0]}><boxGeometry args={[.03,.13,3.7]}/><meshBasicMaterial color="#8ba9c5" transparent opacity={.6}/></mesh>
 </group>)}
 </group>)}</group>;
const RoadNetwork:React.FC=()=> <group>
 {Array.from({length:14},(_,i)=>{const pos=(i-6.5)*6.4;return <group key={i}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,pos]}><planeGeometry args={[95,1.75]}/><meshBasicMaterial color="#16232d"/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[pos,.027,0]}><planeGeometry args={[1.75,95]}/><meshBasicMaterial color="#16232d"/></mesh>
 </group>})}
 </group>;
const GlowRoute:React.FC<{frame:number}>=({frame})=>{
 const progress=interpolate(frame,[15,110],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const count=Math.floor(segments.length*progress);
 return <group>{segments.slice(0,count).map((s,i)=>{
  const v=new THREE.Vector3().subVectors(s.b,s.a);
  const mid=new THREE.Vector3().addVectors(s.a,s.b).multiplyScalar(.5);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());
  return <group key={i} position={mid} quaternion={q}>
   <mesh><cylinderGeometry args={[.45,.45,v.length(),5]}/><meshBasicMaterial color="#ff5dce" transparent opacity={.2}/></mesh>
   <mesh><cylinderGeometry args={[.15,.15,v.length(),6]}/><meshBasicMaterial color="#ffae54"/></mesh>
  </group>;
 })}
 {count>0&&<mesh position={route[Math.min(count,route.length-1)]}><sphereGeometry args={[.8,12,12]}/><meshBasicMaterial color="#fff0a3"/></mesh>}
 </group>;
};
const City:React.FC<{frame:number}>=({frame})=>{
 const a=interpolate(frame,[0,140],[.15,.65],{extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 return <group rotation={[0,a,0]}>
 <ambientLight intensity={1.15}/>
 <directionalLight position={[20,60,25]} intensity={2.5} color="#c2d8ff"/>
 <pointLight position={[0,18,0]} intensity={120} color="#ff8e66"/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,0]}><planeGeometry args={[110,110]}/><meshStandardMaterial color="#14282a" roughness={1}/></mesh>
 <RoadNetwork/><Buildings/><GlowRoute frame={frame}/>
 <mesh position={[0,10,0]}><boxGeometry args={[5.3,20,5.3]}/><meshStandardMaterial color="#1b384c" emissive="#0a4059" emissiveIntensity={.5}/></mesh>
 <mesh position={[0,20.15,0]}><boxGeometry args={[5.5,.3,5.5]}/><meshBasicMaterial color="#79e5ff"/></mesh>
 </group>;
};
export const CentrePointMiniature3DDemo:React.FC=()=>{
 const frame=useCurrentFrame();
 const zoom=interpolate(frame,[0,140],[105,83],{extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 40%,#344456,#09131c 80%)'}}>
  <ThreeCanvas width={1080} height={1920} orthographic camera={{position:[75,zoom,95],zoom:8,near:.1,far:1000}}>
   <City frame={frame}/>
  </ThreeCanvas>
  <div style={{position:'absolute',top:160,left:70,right:70,fontFamily:'Arial,sans-serif',color:'#fff',textShadow:'0 3px 12px #000'}}>
   <div style={{color:'#c8ff76',fontSize:27,letterSpacing:4}}>MINIATURE CITY · MOTION STUDY</div>
   <div style={{fontSize:64,fontWeight:800,marginTop:18}}>TÂM ĐIỂM KẾT NỐI</div>
  </div>
  <div style={{position:'absolute',bottom:100,left:70,right:70,color:'#a7b7bd',fontSize:23,fontFamily:'Arial,sans-serif'}}>DEMO 3D MINH HỌA · KHÔNG PHẢI MÔ HÌNH ĐÔ THỊ THỰC TẾ</div>
 </AbsoluteFill>;
};
