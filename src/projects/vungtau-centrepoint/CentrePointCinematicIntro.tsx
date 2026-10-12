import React from 'react';
import {AbsoluteFill,Easing,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';
import basemap from './basemap.geojson';
import locations from './locations.json';

type P=[number,number];
type Way={properties:{kind:string;highway?:string|null};geometry:{coordinates:P[]}};
const ways=basemap.features as unknown as Way[];
const W=1080,H=1920;
const origin=locations.origin.coordinates as P;
const lon0=origin[0],lat0=origin[1];
const cos=Math.cos(lat0*Math.PI/180);
const toXY=([lon,lat]:P):P=>[W/2+(lon-lon0)*cos*116000,H/2-(lat-lat0)*116000];
const shapes=ways.filter(w=>w.geometry?.coordinates?.length>1).map(w=>({
  d:w.geometry.coordinates.map((p,i)=>{const [x,y]=toXY(p);return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' '),
  coast:w.properties.kind==='coastline',
  major:['trunk','primary','secondary','tertiary'].includes(w.properties.highway||'')
}));
export const CentrePointCinematicIntro:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const arrive=spring({frame:f,fps,config:{damping:19,stiffness:80,mass:1.2}});
 const scale=interpolate(f,[0,149],[1.9,1.07],{extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
 const angle=interpolate(f,[0,149],[-6,0],{extrapolateRight:'clamp'});
 const mapFade=interpolate(f,[0,22],[0,1],{extrapolateRight:'clamp'});
 const textY=interpolate(arrive,[0,1],[85,0]);
 const beacon=interpolate(f,[30,90],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const pulse=(f%48)/48;
 const y=H/2;
 return <AbsoluteFill style={{background:'#061019',color:'#f3f8f4',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 55% 45%,#213b44 0%,#081721 56%,#040b13 100%)'}}/>
  <svg viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:mapFade}}>
   <defs>
    <linearGradient id="introLine" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#83a4aa"/><stop offset="1" stopColor="#284550"/></linearGradient>
    <radialGradient id="introGlow"><stop stopColor="#baff55" stopOpacity=".55"/><stop offset="1" stopColor="#baff55" stopOpacity="0"/></radialGradient>
   </defs>
   <g transform={`translate(${540*(1-scale)} ${960*(1-scale)}) scale(${scale}) rotate(${angle} 540 960)`}>
    {shapes.map((w,i)=><path key={i} d={w.d} fill="none" stroke={w.coast?'#6eacb4':w.major?'#63818b':'#314954'} strokeWidth={w.coast?2.9:w.major?2.4:1.2} opacity={w.coast?.88:w.major?.66:.43} strokeLinecap="round"/>)}
   </g>
   <circle cx="540" cy={y} r={130+65*pulse} fill="url(#introGlow)" opacity={beacon*(1-pulse*.65)}/>
   <circle cx="540" cy={y} r={28+85*pulse} fill="none" stroke="#baff55" strokeWidth="3" opacity={beacon*(1-pulse)}/>
   <circle cx="540" cy={y} r="13" fill="#baff55" stroke="#07151d" strokeWidth="5" opacity={beacon}/>
   <path d={`M540 ${y-30} V${y-102}`} stroke="#baff55" strokeWidth="2" opacity={beacon}/>
  </svg>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(3,10,17,.83) 0%,transparent 34%,transparent 58%,rgba(3,10,17,.94) 100%)'}}/>
  <div style={{position:'absolute',left:74,right:74,top:145,opacity:arrive,transform:`translateY(${textY}px)`}}>
   <div style={{fontSize:22,letterSpacing:6,color:'#baff55',fontWeight:700}}>VŨNG TÀU / LOCATION FILM</div>
   <div style={{marginTop:26,fontSize:88,lineHeight:1.03,fontWeight:800,letterSpacing:-2}}>VỊ TRÍ<br/><span style={{color:'#baff55'}}>KẾT NỐI</span></div>
   <div style={{height:3,width:120,background:'#baff55',marginTop:34}}/>
  </div>
  <div style={{position:'absolute',left:74,right:74,bottom:245,opacity:interpolate(f,[35,68],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
   <div style={{fontSize:30,letterSpacing:5,color:'#baff55'}}>01 / VỊ TRÍ DỰ ÁN</div>
   <div style={{fontSize:57,fontWeight:800,marginTop:17,lineHeight:1.12}}>VŨNG TÀU<br/>CENTRE POINT</div>
   <div style={{fontSize:24,color:'#bdcbd0',marginTop:23}}>TỪ TÂM ĐIỂM • MỞ RỘNG KẾT NỐI</div>
  </div>
  <div style={{position:'absolute',bottom:72,left:74,right:74,fontSize:17,letterSpacing:1.5,color:'#a9bbc0'}}>© OPENSTREETMAP CONTRIBUTORS · BẢN ĐỒ / TUYẾN CHƯA XÁC MINH</div>
 </AbsoluteFill>;
};
