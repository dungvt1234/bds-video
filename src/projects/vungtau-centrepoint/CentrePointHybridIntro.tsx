import React from 'react';
import {AbsoluteFill,Img,Easing,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

/**
 * P05-B isolated 5s photo-based concept.
 * Requires public/centrepoint-reference.webp (provided reference photo, not generated geometry).
 * No claims of verified building dimensions, live footage or drone flight.
 */
export const CentrePointHybridIntro:React.FC=()=>{
 const frame=useCurrentFrame();
 const {fps}=useVideoConfig();
 const progress=interpolate(frame,[0,149],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const reveal=spring({frame:frame-8,fps,config:{damping:18,stiffness:80}});
 const scale=interpolate(progress,[0,1],[1.16,1.39]);
 const panX=interpolate(progress,[0,1],[-65,42]);
 const panY=interpolate(progress,[0,1],[25,-78]);
 const vignette='linear-gradient(180deg,rgba(3,14,22,.76) 0%,rgba(3,14,22,.15) 36%,rgba(3,14,22,.12) 58%,rgba(3,14,22,.86) 100%)';
 return <AbsoluteFill style={{background:'#071721',overflow:'hidden',fontFamily:'Arial,sans-serif',color:'#fff'}}>
  <AbsoluteFill style={{transform:`translate(${panX*.42}px,${panY*.5}px) scale(${scale*1.12})`,filter:'blur(18px) brightness(.42) saturate(1.1)'}}>
   <Img src={staticFile('centrepoint-reference.webp')} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
  </AbsoluteFill>
  <AbsoluteFill style={{transform:`translate(${panX}px,${panY}px) scale(${scale})`,filter:'contrast(1.04) saturate(1.08)'}}>
   <Img src={staticFile('centrepoint-reference.webp')} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
  </AbsoluteFill>
  <AbsoluteFill style={{background:vignette}}/>
  <AbsoluteFill style={{background:'radial-gradient(circle at 53% 51%,transparent 15%,rgba(1,10,16,.38) 86%)'}}/>
  <div style={{position:'absolute',top:170,left:72,right:72,opacity:reveal,transform:`translateY(${(1-reveal)*38}px)`}}>
   <div style={{fontSize:23,letterSpacing:6,color:'#c8ff76',fontWeight:700}}>VŨNG TÀU / CENTRE POINT</div>
   <div style={{fontSize:69,lineHeight:1.05,fontWeight:800,marginTop:24}}>TÂM ĐIỂM<br/><span style={{color:'#c8ff76'}}>KẾT NỐI</span></div>
  </div>
  <div style={{position:'absolute',bottom:240,left:74,right:74,opacity:interpolate(frame,[35,65],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
   <div style={{width:90,height:4,background:'#c8ff76',marginBottom:24}}/>
   <div style={{fontSize:39,fontWeight:800,lineHeight:1.2}}>VŨNG TÀU<br/>CENTRE POINT</div>
   <div style={{fontSize:21,letterSpacing:3,color:'#e4e9e7',marginTop:20}}>GÓC NHÌN TỪ PHỐI CẢNH DỰ ÁN</div>
  </div>
  <div style={{position:'absolute',bottom:66,left:74,right:74,fontSize:17,color:'#c3cdd1'}}>HÌNH ẢNH THAM KHẢO · HIỆU ỨNG CAMERA 2.5D MÔ PHỎNG</div>
 </AbsoluteFill>;
};
