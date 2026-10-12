import React from 'react';
import {AbsoluteFill,Img,Easing,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

/** P05-D: fast ground-up reveal of a 2D reference photograph, not a 3D building construction simulation. */
export const CentrePointGroundRiseIntro:React.FC=()=>{
 const frame=useCurrentFrame();
 const {fps}=useVideoConfig();
 const rise=spring({frame:frame-5,fps,config:{damping:22,stiffness:60,mass:1.1}});
 const eased=interpolate(frame,[0,94],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
 const title=spring({frame:frame-48,fps,config:{damping:20,stiffness:90}});
 const bottom=interpolate(frame,[77,100],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const beam=interpolate(frame,[7,55],[105,35],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'#06141d',fontFamily:'Arial,sans-serif',color:'#fff',overflow:'hidden'}}>
  {/* Whole photo rises behind a moving ground-edge matte. No claim of independent building geometry. */}
  <AbsoluteFill style={{clipPath:`inset(${(1-rise)*100}% 0 0 0)`,transform:`translateY(${(1-rise)*440}px) scale(${1.92+eased*.18})`,transformOrigin:'50% 54%',filter:'saturate(1.1) contrast(1.07)'}}>
   <Img src={staticFile('centrepoint-reference.webp')} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
  </AbsoluteFill>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(2,12,20,.80),rgba(2,12,20,.08) 35%,rgba(2,12,20,.10) 65%,rgba(2,12,20,.86))'}}/>
  <div style={{position:'absolute',left:0,right:0,top:`${beam}%`,height:4,opacity:interpolate(frame,[0,14,47,67],[0,.9,.8,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),background:'linear-gradient(90deg,transparent,#c8ff76 25%,#ffffff 50%,#c8ff76 75%,transparent)',boxShadow:'0 0 35px 12px rgba(200,255,118,.35)'}}/>
  <div style={{position:'absolute',left:70,top:140,right:70,opacity:title,transform:`translateY(${(1-title)*35}px)`}}>
   <div style={{color:'#c8ff76',fontSize:22,fontWeight:700,letterSpacing:5}}>VŨNG TÀU / VỊ TRÍ DỰ ÁN</div>
   <div style={{fontSize:64,fontWeight:800,lineHeight:1.06,marginTop:22}}>TÂM ĐIỂM<br/><span style={{color:'#c8ff76'}}>KẾT NỐI</span></div>
  </div>
  <div style={{position:'absolute',bottom:170,left:70,right:70,opacity:bottom,transform:`translateY(${(1-bottom)*30}px)`}}>
   <div style={{height:4,width:86,background:'#c8ff76',marginBottom:20}}/>
   <div style={{fontSize:42,fontWeight:800}}>VŨNG TÀU<br/>CENTRE POINT</div>
   <div style={{fontSize:21,marginTop:16,letterSpacing:2,color:'#d8e1df'}}>PHỐI CẢNH DỰ ÁN · HIỆU ỨNG NÂNG TỪ MẶT ĐẤT</div>
  </div>
  <div style={{position:'absolute',bottom:52,left:70,right:70,fontSize:17,color:'#d1d9da'}}>HÌNH ẢNH PHỐI CẢNH THAM KHẢO · HIỆU ỨNG 2.5D MÔ PHỎNG</div>
 </AbsoluteFill>;
};
