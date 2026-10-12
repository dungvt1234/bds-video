import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
const segments=[
 {from:0,to:150,title:'VŨNG TÀU CENTRE POINT',subtitle:'VỊ TRÍ DỰ ÁN'},
 {from:150,to:300,title:'LOTTE MART VŨNG TÀU',subtitle:'TUYẾN 01 • CHƯA XÁC MINH'},
 {from:300,to:450,title:'BỆNH VIỆN VŨNG TÀU',subtitle:'TUYẾN 02 • CHƯA XÁC MINH'},
 {from:450,to:600,title:'THÁP TAM THẮNG',subtitle:'TUYẾN 03 • CHƯA XÁC MINH'},
 {from:600,to:750,title:'BÃI TRƯỚC',subtitle:'TUYẾN 04 • CHƯA XÁC MINH'},
 {from:750,to:900,title:'VŨNG TÀU CENTRE POINT',subtitle:'KẾT NỐI KHU VỰC'},
];
const Scene: React.FC<{title:string;subtitle:string}>=({title,subtitle})=>{
 const frame=useCurrentFrame();
 const opacity=interpolate(frame,[0,18,125,149],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 48% 42%, #1b2c35 0%, #0c1620 75%)',color:'#f5f9f3',fontFamily:'Arial, sans-serif',justifyContent:'center',alignItems:'center',opacity}}>
 <div style={{position:'absolute',top:100,left:65,fontSize:28,letterSpacing:6,color:'#baff55'}}>LOCATION MOTION STUDY</div>
 <div style={{width:150,height:150,border:'4px solid #baff55',boxShadow:'0 0 55px #baff5580',borderRadius:'50%',marginBottom:65,display:'flex',justifyContent:'center',alignItems:'center'}}><div style={{width:22,height:22,background:'#baff55',borderRadius:'50%'}}/></div>
 <div style={{fontSize:58,fontWeight:700,textAlign:'center',maxWidth:900}}>{title}</div>
 <div style={{marginTop:30,fontSize:28,color:'#baff55',letterSpacing:4}}>{subtitle}</div>
 <div style={{position:'absolute',bottom:110,fontSize:25,color:'#a5b5b8'}}>PREVIEW ONLY • ROUTING DATA NOT VERIFIED</div>
 </AbsoluteFill>;
};
export const CentrePointVideo:React.FC=()=> <AbsoluteFill style={{background:'#0c1620'}}>{segments.map(s=><Sequence key={s.from} from={s.from} durationInFrames={s.to-s.from}><Scene title={s.title} subtitle={s.subtitle}/></Sequence>)}</AbsoluteFill>;
