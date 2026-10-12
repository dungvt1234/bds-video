import React from 'react';
import {AbsoluteFill,Sequence,Easing,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';
import {CentrePointGroundRiseIntro} from './CentrePointGroundRiseIntro';
import {CentrePointHybridIntroV2} from './CentrePointHybridIntroV2';
import {Scene} from './CentrePointVideo';

/** Cinematic Future V1: 900 frames. Visual FX are illustrative; routing candidates need review.
 * No synthetic VO or licensed music is claimed to be included.
 */
const shots=[
 {from:0,len:150,id:'hero',name:'VŨNG TÀU CENTRE POINT',category:'TÂM ĐIỂM ĐÔ THỊ',voice:'Giữa nhịp sống Vũng Tàu, một tâm điểm mới vươn lên.',symbol:'◆'},
 {from:150,len:120,id:'intro',name:'TÂM ĐIỂM KẾT NỐI',category:'CITY SCAN',voice:'Từ Centre Point, những kết nối đô thị dần mở ra.',symbol:'◎'},
 {from:270,len:120,id:'lotte',name:'LOTTE MART',category:'MUA SẮM · GIẢI TRÍ',voice:'Mua sắm và giải trí tại Lotte Mart.',symbol:'▣'},
 {from:390,len:120,id:'hospital',name:'BỆNH VIỆN VŨNG TÀU',category:'Y TẾ',voice:'Kết nối dịch vụ y tế tại Bệnh viện Vũng Tàu.',symbol:'✚'},
 {from:510,len:120,id:'tamthang',name:'THÁP TAM THẮNG',category:'ĐIỂM ĐẾN ĐÔ THỊ',voice:'Khám phá dấu ấn đô thị tại Tháp Tam Thắng.',symbol:'♜'},
 {from:630,len:120,id:'baitruoc',name:'BÃI TRƯỚC',category:'BIỂN · THƯ GIÃN',voice:'Và cảm nhận không gian biển tại Bãi Trước.',symbol:'≈'},
 {from:750,len:150,id:'outro',name:'VŨNG TÀU CENTRE POINT',category:'TÂM ĐIỂM KẾT NỐI',voice:'Vũng Tàu Centre Point. Tâm điểm kết nối, mở ra nhịp sống đô thị.',symbol:'◆'},
] as const;
const HUD:React.FC<{shot:typeof shots[number]}>=({shot})=>{
 const f=useCurrentFrame()-shot.from,{fps}=useVideoConfig();
 const fade=interpolate(f,[0,10,shot.len-12,shot.len],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const enter=spring({frame:f-12,fps,config:{damping:18,stiffness:115}});
 const sweep=interpolate(f,[0,shot.len],[0,1080],{extrapolateRight:'clamp'});
 const isMap=shot.id!=='hero'&&shot.id!=='outro';
 return <AbsoluteFill style={{pointerEvents:'none',opacity:fade,fontFamily:'Arial,sans-serif',color:'#f5f2e9'}}>
  <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(3,14,23,.6) 0%,transparent 37%,transparent 63%,rgba(3,14,23,.86) 100%)'}}/>
  {isMap&&<svg width="1080" height="1920" style={{position:'absolute',inset:0,opacity:.55}}>
    <circle cx="540" cy="900" r={65+f*4} stroke="#c8ff76" strokeWidth="2" fill="none" opacity={Math.max(0,1-f/80)}/>
    <circle cx="540" cy="900" r={30+f*2.5} stroke="#c8ff76" strokeWidth="1" fill="none" opacity={Math.max(0,.65-f/110)}/>
    <path d={`M${sweep-120} 0 L${sweep} 1920`} stroke="#c8ff76" strokeWidth="3" opacity=".12"/>
    <path d="M65 310 V260 H115 M965 310 V260 H915 M65 1490 V1540 H115 M965 1490 V1540 H915" stroke="#c8ff76" strokeWidth="2" fill="none" opacity=".55"/>
  </svg>}
  <div style={{position:'absolute',top:175,left:74,right:74,transform:`translateY(${(1-enter)*34}px)`}}>
   <div style={{fontSize:24,letterSpacing:4,color:'#c8ff76',fontWeight:800}}>{shot.category}</div>
   <div style={{fontSize:57,lineHeight:1.13,fontWeight:900,marginTop:16,textShadow:'0 5px 25px #000'}}>{shot.name}</div>
  </div>
  {isMap&&<div style={{position:'absolute',top:430,left:74,display:'flex',alignItems:'center',gap:20,transform:`translateX(${(1-enter)*-40}px)`}}>
    <div style={{height:94,width:94,borderRadius:20,background:'rgba(8,32,40,.85)',border:'2px solid #c8ff76',boxShadow:'0 0 24px #c8ff7655',display:'grid',placeItems:'center',fontSize:52,color:'#c8ff76'}}>{shot.symbol}</div>
    <div style={{fontSize:20,letterSpacing:3,color:'#c8ff76'}}>LOCATION LOCKED</div>
  </div>}
  <div style={{position:'absolute',bottom:235,left:74,right:74,padding:'20px 26px',background:'rgba(3,15,23,.83)',borderLeft:'5px solid #c8ff76',fontSize:30,lineHeight:1.35,fontWeight:600}}>{shot.voice}</div>
  <div style={{position:'absolute',bottom:86,left:74,right:74,fontSize:17,color:'#b2c1c4'}}>© OpenStreetMap contributors · OSRM routes require verification · CONCEPT PREVIEW</div>
 </AbsoluteFill>;
};
export const CentrePointCinematicFuture30:React.FC=()=> <AbsoluteFill style={{background:'#06141d'}}>
 <Sequence from={0} durationInFrames={150}><CentrePointGroundRiseIntro/></Sequence>
 <Sequence from={150} durationInFrames={120}><Scene sceneId="intro" name="TÂM ĐIỂM KẾT NỐI" subtitle="CITY SCAN" hideUnverifiedMetrics/></Sequence>
 <Sequence from={270} durationInFrames={120}><Scene sceneId="lotte" name="LOTTE MART" subtitle="SHOPPING" hideUnverifiedMetrics/></Sequence>
 <Sequence from={390} durationInFrames={120}><Scene sceneId="hospital" name="BỆNH VIỆN VŨNG TÀU" subtitle="HEALTHCARE" hideUnverifiedMetrics/></Sequence>
 <Sequence from={510} durationInFrames={120}><Scene sceneId="tamthang" name="THÁP TAM THẮNG" subtitle="LANDMARK" hideUnverifiedMetrics/></Sequence>
 <Sequence from={630} durationInFrames={120}><Scene sceneId="baitruoc" name="BÃI TRƯỚC" subtitle="COASTAL" hideUnverifiedMetrics/></Sequence>
 <Sequence from={750} durationInFrames={150}><CentrePointHybridIntroV2/></Sequence>
 {shots.map(s=><HUD key={s.from} shot={s}/>)}
 </AbsoluteFill>;
