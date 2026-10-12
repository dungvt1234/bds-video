import React from 'react';
import {AbsoluteFill,Sequence,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';
import {CentrePointGroundRiseIntro} from './CentrePointGroundRiseIntro';
import {CentrePointVideo} from './CentrePointVideo';
import {CentrePointHybridIntroV2} from './CentrePointHybridIntroV2';

/** P06-A editorial assembly. VO text is a script cue, not synthesized audio.
 * Route geometry and coordinates are candidates; no distance or travel time claims.
 * Existing map component is used as a temporary visual underlay, not final verified route cut.
 */
const scenes=[
 {start:0,end:150,kicker:'GIỮA NHỊP SỐNG VŨNG TÀU',headline:'MỘT TÂM ĐIỂM VƯƠN LÊN',voice:'Giữa nhịp sống Vũng Tàu, một tâm điểm mới vươn lên.'},
 {start:150,end:270,kicker:'TỪ CENTRE POINT',headline:'TÂM ĐIỂM KẾT NỐI',voice:'Từ Centre Point, những kết nối đô thị dần mở ra.'},
 {start:270,end:390,kicker:'MUA SẮM · GIẢI TRÍ',headline:'LOTTE MART',voice:'Mua sắm và giải trí tại Lotte Mart.'},
 {start:390,end:510,kicker:'DỊCH VỤ Y TẾ',headline:'BỆNH VIỆN VŨNG TÀU',voice:'Kết nối dịch vụ y tế tại Bệnh viện Vũng Tàu.'},
 {start:510,end:630,kicker:'ĐIỂM ĐẾN ĐÔ THỊ',headline:'THÁP TAM THẮNG',voice:'Khám phá dấu ấn đô thị tại Tháp Tam Thắng.'},
 {start:630,end:750,kicker:'KHÔNG GIAN BIỂN',headline:'BÃI TRƯỚC',voice:'Và cảm nhận không gian biển tại Bãi Trước.'},
 {start:750,end:900,kicker:'VŨNG TÀU CENTRE POINT',headline:'TÂM ĐIỂM KẾT NỐI',voice:'Vũng Tàu Centre Point. Tâm điểm kết nối, mở ra nhịp sống đô thị.'}
] as const;
const Caption:React.FC<{start:number;end:number;kicker:string;headline:string;voice:string}>=({start,end,kicker,headline,voice})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 const local=frame-start;
 const fade=interpolate(local,[0,12,end-start-12,end-start],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const enter=spring({frame:local-8,fps,config:{damping:19,stiffness:100}});
 return <AbsoluteFill style={{pointerEvents:'none',opacity:fade,fontFamily:'Arial,sans-serif',color:'#fff'}}>
  <div style={{position:'absolute',top:185,left:74,right:74,transform:`translateY(${(1-enter)*30}px)`}}>
   <div style={{fontSize:24,color:'#c8ff76',fontWeight:700,letterSpacing:4}}>{kicker}</div>
   <div style={{fontSize:55,fontWeight:800,lineHeight:1.12,marginTop:20,textShadow:'0 4px 22px rgba(0,0,0,.8)'}}>{headline}</div>
  </div>
  <div style={{position:'absolute',bottom:260,left:74,right:74,padding:'19px 24px',background:'rgba(2,14,22,.77)',borderLeft:'5px solid #c8ff76',fontSize:31,fontWeight:600,lineHeight:1.34,textShadow:'0 2px 9px #000'}}>{voice}</div>
 </AbsoluteFill>;
};
export const CentrePointStory30Draft:React.FC=()=>{
 return <AbsoluteFill style={{background:'#06141d'}}>
  <Sequence from={0} durationInFrames={150}><CentrePointGroundRiseIntro/></Sequence>
  <Sequence from={150} durationInFrames={600}><CentrePointVideo/></Sequence>
  <Sequence from={750} durationInFrames={150}><CentrePointHybridIntroV2/></Sequence>
  {scenes.map(s=><Caption key={s.start} {...s}/>)}
  <div style={{position:'absolute',left:74,right:74,bottom:72,color:'#c1cbd0',fontSize:17,fontFamily:'Arial,sans-serif'}}>BẢN DỰNG NHÁP · TUYẾN ĐƯỜNG / TỌA ĐỘ CHƯA XÁC MINH · CHƯA CÓ THUYẾT MINH</div>
 </AbsoluteFill>;
};
