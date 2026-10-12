import React from 'react';
import {AbsoluteFill,Img,Easing,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

/** P05-C: independent composition; photo remains a concept rendering, not actual drone footage. */
export const CentrePointHybridIntroV2:React.FC=()=>{
 const frame=useCurrentFrame();
 const {fps}=useVideoConfig();
 const p=interpolate(frame,[0,149],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const title=spring({frame:frame-7,fps,config:{damping:19,stiffness:85}});
 const info=interpolate(frame,[55,80],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const scale=interpolate(p,[0,1],[1.82,2.18]);
 const shiftX=interpolate(p,[0,1],[65,-58]);
 const shiftY=interpolate(p,[0,1],[80,-50]);
 return <AbsoluteFill style={{background:'#06141d',fontFamily:'Arial,sans-serif',color:'#fff',overflow:'hidden'}}>
  {/* Cover crop rather than contain: prioritize the building and avoid large letterbox bands. */}
  <AbsoluteFill style={{transform:`translate(${shiftX}px,${shiftY}px) scale(${scale})`,transformOrigin:'50% 52%',filter:'saturate(1.09) contrast(1.08)'}}>
   <Img src={staticFile('centrepoint-reference.webp')} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
  </AbsoluteFill>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(2,12,20,.83),rgba(2,12,20,.05) 35%,rgba(2,12,20,.06) 65%,rgba(2,12,20,.83))'}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 55%,transparent 27%,rgba(0,10,17,.35) 100%)'}}/>
  <div style={{position:'absolute',left:70,top:140,right:70,opacity:title,transform:`translateY(${(1-title)*36}px)`}}>
   <div style={{color:'#c8ff76',fontSize:22,fontWeight:700,letterSpacing:5}}>VŨNG TÀU / VỊ TRÍ DỰ ÁN</div>
   <div style={{fontSize:64,fontWeight:800,lineHeight:1.06,marginTop:22}}>TÂM ĐIỂM<br/><span style={{color:'#c8ff76'}}>KẾT NỐI</span></div>
  </div>
  <div style={{position:'absolute',bottom:170,left:70,right:70,opacity:info,transform:`translateY(${(1-info)*28}px)`}}>
   <div style={{height:4,width:86,background:'#c8ff76',marginBottom:20}}/>
   <div style={{fontSize:42,fontWeight:800}}>VŨNG TÀU<br/>CENTRE POINT</div>
   <div style={{fontSize:21,marginTop:16,letterSpacing:2,color:'#d8e1df'}}>PHỐI CẢNH DỰ ÁN · CAMERA MÔ PHỎNG</div>
  </div>
  <div style={{position:'absolute',bottom:52,left:70,right:70,fontSize:17,color:'#d1d9da'}}>HÌNH ẢNH PHỐI CẢNH THAM KHẢO · KHÔNG PHẢI VIDEO FLYCAM THỰC TẾ</div>
 </AbsoluteFill>;
};
