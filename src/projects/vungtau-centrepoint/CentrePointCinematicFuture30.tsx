import React from 'react';
import {AbsoluteFill,Img,Easing,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import locations from './locations.json';
import routing from './routes.geojson';
import footprintData from './future-footprints.json';

/**
 * Cinematic Future V2 — 900 frames / 1080x1920 / 30fps.
 * City silhouettes: ACTUAL OSM building polygons. Heights NOT represented.
 * Paths: OSRM route candidates requiring independent geographic review.
 * HUD overlays and camera scanning effects are conceptual imagery.
 * VO is subtitle text; no voice recording or music is embedded.
 */
type Point = [number, number];
type Route = {properties:{id:string};geometry:{coordinates:Point[]}};
type Shot = {from:number;to:number;id:string;title:string;category:string;voice:string;number:string};
const NAVY='#06141D',LIME='#C8FF76',CYAN='#72DCE5',WHITE='#F4FAF6';
const ORIGIN=locations.origin.coordinates as Point;
const routes=(routing.features as Route[]);
const destinations=locations.destinations;
const SHOTS:Shot[]=[
 {from:0,to:150,id:'opening',title:'MỘT TÂM ĐIỂM\nVƯƠN LÊN',category:'INITIALIZING / VŨNG TÀU',voice:'Giữa nhịp sống Vũng Tàu, một tâm điểm mới vươn lên.',number:'00'},
 {from:150,to:270,id:'reveal',title:'TÂM ĐIỂM\nKẾT NỐI',category:'CITY NETWORK / DISCOVERY',voice:'Từ Centre Point, những kết nối đô thị dần mở ra.',number:'00'},
 {from:270,to:390,id:'lotte',title:'LOTTE MART',category:'MUA SẮM & GIẢI TRÍ',voice:'Mua sắm và giải trí tại Lotte Mart.',number:'01'},
 {from:390,to:510,id:'hospital',title:'BỆNH VIỆN\nVŨNG TÀU',category:'Y TẾ & CHĂM SÓC SỨC KHỎE',voice:'Kết nối dịch vụ y tế tại Bệnh viện Vũng Tàu.',number:'02'},
 {from:510,to:630,id:'tamthang',title:'THÁP TAM THẮNG',category:'BIỂU TƯỢNG ĐÔ THỊ',voice:'Khám phá dấu ấn đô thị tại Tháp Tam Thắng.',number:'03'},
 {from:630,to:750,id:'baitruoc',title:'BÃI TRƯỚC',category:'BIỂN & KHÔNG GIAN THƯ GIÃN',voice:'Và cảm nhận không gian biển tại Bãi Trước.',number:'04'},
 {from:750,to:900,id:'final',title:'VŨNG TÀU\nCENTRE POINT',category:'THE CONNECTED CITY',voice:'Vũng Tàu Centre Point. Tâm điểm kết nối, mở ra nhịp sống đô thị.',number:'00'},
];
const clamp=(a:number)=>Math.max(0,Math.min(1,a));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(t:number)=>{const x=clamp(t);return x*x*(3-2*x)};
const inTime=(f:number,a:number,b:number)=>smooth((f-a)/(b-a));
const colorFor=(id:string)=>id==='baitruoc'?CYAN:LIME;
const rad=Math.PI/180;
const centerLng=107.102,centerLat=10.369;
const geo=(p:Point):Point=>[540+(p[0]-centerLng)*13350*Math.cos(centerLat*rad),960-(p[1]-centerLat)*13350];
const cityCenter:Point=[540,960];
const base=footprintData.polygons as Point[][];
const footprints=base.filter((ring,i)=>i%2===0 && ring.length>=3)
 .map((ring,i)=>({id:i,d:ring.map((p,j)=>{const [x,y]=geo(p);return (j?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ')+'Z'}));
const routePaths=routes.map(route=>({id:route.properties.id,points:route.geometry.coordinates.map(geo)}));
const routeFor=(id:string)=>routePaths.find(r=>r.id===id);
const length=(a:Point,b:Point)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const sample=(pts:Point[],t:number):Point=>{
 if(!pts.length)return cityCenter;
 if(pts.length===1)return pts[0];
 const distances=pts.slice(1).map((p,i)=>length(pts[i],p));
 const total=distances.reduce((a,b)=>a+b,0);
 let left=clamp(t)*total;
 for(let i=0;i<distances.length;i++){
  if(left<=distances[i])return [lerp(pts[i][0],pts[i+1][0],left/Math.max(distances[i],.001)),lerp(pts[i][1],pts[i+1][1],left/Math.max(distances[i],.001))];
  left-=distances[i];
 }
 return pts[pts.length-1];
};
const SVGIcon:React.FC<{id:string;size?:number;color?:string}>=({id,size=72,color=LIME})=>{
 const common={fill:'none',stroke:color,strokeWidth:3.6,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 let art:React.ReactNode;
 switch(id){
 case 'lotte':art=<><rect x="11" y="20" width="42" height="34" rx="5"/><path d="M22 24V17a10 10 0 0 1 20 0v7"/><path d="M22 36h20M32 26v20"/></>;break;
 case 'hospital':art=<><rect x="12" y="20" width="40" height="36" rx="3"/><rect x="22" y="9" width="20" height="16" rx="2"/><path d="M32 12v10M27 17h10M22 56V41h20v15M19 32h5M40 32h5"/></>;break;
 case 'tamthang':art=<><path d="M12 54h40M20 54V26l12-16 12 16v28M17 27h30M25 39h14M29 27v27M35 27v27"/><circle cx="32" cy="17" r="2"/></>;break;
 case 'baitruoc':art=<><path d="M7 32c7-7 14-7 21 0s14 7 21 0 8-6 8-6M7 44c7-7 14-7 21 0s14 7 21 0 8-6 8-6M9 19c12-10 22-10 34-2"/></>;break;
 default:art=<><path d="M14 54V20l18-10 18 10v34M25 54V34h14v20M23 25h4M37 25h4M10 55h44"/><circle cx="32" cy="12" r="4"/></>;
 }
 return <svg width={size} height={size} viewBox="0 0 64 64"><g {...common}>{art}</g></svg>;
};
const BuildingCity:React.FC<{opacity:number}>=({opacity})=><g opacity={opacity}>
 <g transform="translate(0 7)" fill="#294E5A" opacity=".4">{footprints.map(f=><path key={f.id} d={f.d}/>)}</g>
 <g fill="#19353F" stroke="#4E7C87" strokeWidth=".65" strokeOpacity=".6">{footprints.map(f=><path key={f.id} d={f.d}/>)}</g>
 </g>;
const polyPath=(p:Point[])=>p.map((q,i)=>(i?'L':'M')+q[0].toFixed(2)+' '+q[1].toFixed(2)).join(' ');
const ProjectPin:React.FC<{frame:number}>=({frame})=>{
 const [x,y]=geo(ORIGIN);
 const r=38+(frame%64)*1.4;
 return <g>
  <circle cx={x} cy={y} r={r} stroke={LIME} strokeWidth="2" strokeOpacity={.85*(1-(frame%64)/64)} fill="none"/>
  <circle cx={x} cy={y} r="26" fill="#06141D" stroke={LIME} strokeWidth="3"/>
  <circle cx={x} cy={y} r="9" fill={LIME}/>
  <path d={'M'+(x-40)+' '+y+'h-29 M'+(x+40)+' '+y+'h29 M'+x+' '+(y-40)+'v-29 M'+x+' '+(y+40)+'v29'} stroke={LIME} strokeWidth="2.4"/>
 </g>;
};
const RouteLines:React.FC<{id:string;local:number;opening:boolean}>=({id,local,opening})=>{
 const active=routeFor(id);
 const progress=opening?0:inTime(local,8,77);
 return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
  {routePaths.map(r=>{
   const selected=!opening&&id===r.id;
   const d=polyPath(r.points);
   const c=colorFor(r.id);
   return <g key={r.id}>
    <path d={d} stroke="#5B7180" strokeWidth="2.3" opacity=".44"/>
    <path d={d} stroke={selected?c:'#7CA09F'} strokeWidth={selected?32:4} opacity={selected?.14:.17} pathLength={1} strokeDasharray="1" strokeDashoffset={selected?1-progress:0}/>
    <path d={d} stroke={selected?c:'#7CA09F'} strokeWidth={selected?13:2} opacity={selected?.42:.35} pathLength={1} strokeDasharray="1" strokeDashoffset={selected?1-progress:0}/>
    {selected&&<path d={d} stroke="#F7FFCF" strokeWidth="4.5" pathLength={1} strokeDasharray="1" strokeDashoffset={1-progress}/>}
   </g>;
  })}
  {active&&!opening&&progress>.005&&(()=>{
   const [hx,hy]=sample(active.points,progress),c=colorFor(id);
   return <g>
    <circle cx={hx} cy={hy} r="41" fill={c} opacity=".12"/>
    <circle cx={hx} cy={hy} r="21" fill={c} opacity=".28"/>
    <circle cx={hx} cy={hy} r="7" fill="#FFFFFF"/>
   </g>;
  })()}
 </g>;
};
const EndpointPin:React.FC<{id:string;frame:number;isActive:boolean;settled:boolean}>=({id,frame,isActive,settled})=>{
 const target=destinations.find(x=>x.id===id);
 if(!target)return null;
 const [x,y]=geo(target.coordinates as Point);
 const c=colorFor(id);
 const pulse=46+frame%38*1.15;
 const scale=isActive?(settled?1:0.55):.5;
 return <g opacity={isActive?1:.45} transform={'translate('+x+' '+y+') scale('+scale+')'}>
  {isActive&&<circle r={pulse} stroke={c} strokeWidth="2" fill="none" opacity={1-(frame%38)/38}/>}
  <circle r="49" fill="#061720" stroke={c} strokeWidth={isActive?4:2}/>
  <circle r="36" fill="#132A35" stroke="#335C61" strokeWidth="1"/>
  <g transform="translate(-32 -32)"><svg width="64" height="64" viewBox="0 0 64 64">
   {id==='lotte'&&<g fill="none" stroke={c} strokeWidth="4" strokeLinecap="round"><rect x="13" y="23" width="38" height="29" rx="4"/><path d="M21 25v-6a11 11 0 0 1 22 0v6"/></g>}
   {id==='hospital'&&<g fill="none" stroke={c} strokeWidth="4" strokeLinecap="round"><rect x="12" y="15" width="40" height="40" rx="5"/><path d="M32 24v22M21 35h22"/></g>}
   {id==='tamthang'&&<g fill="none" stroke={c} strokeWidth="4" strokeLinecap="round"><path d="M14 52h36M22 50V25l10-15 10 15v25M20 28h24"/></g>}
   {id==='baitruoc'&&<g fill="none" stroke={c} strokeWidth="4" strokeLinecap="round"><path d="M6 23q12-11 24 0t28 0M6 38q12-11 24 0t28 0M6 51q12-11 24 0t28 0"/></g>}
  </svg></g>
 </g>;
};
const FrameNoise:React.FC<{frame:number}>=({frame})=><svg width="1080" height="1920" style={{position:'absolute',inset:0,pointerEvents:'none'}} viewBox="0 0 1080 1920">
 <defs>
  <pattern id="future-grid" width="110" height="110" patternUnits="userSpaceOnUse"><path d="M110 0H0V110" fill="none" stroke={CYAN} strokeWidth="1" opacity=".1"/><circle cx="0" cy="0" r="2" fill={CYAN} opacity=".18"/></pattern>
  <linearGradient id="scan-beam"><stop offset="0" stopColor={LIME} stopOpacity="0"/><stop offset=".5" stopColor={LIME} stopOpacity=".12"/><stop offset="1" stopColor={LIME} stopOpacity="0"/></linearGradient>
 </defs>
 <rect width="1080" height="1920" fill="url(#future-grid)"/>
 <path d={'M0 '+(-140+(frame*18)%2060)+' H1080'} stroke={LIME} opacity=".3" strokeWidth="3"/>
 <rect y={-180+(frame*18)%2060} width="1080" height="180" fill="url(#scan-beam)"/>
 {Array.from({length:32},(_,i)=>{
   const x=(i*211+53)%1080,y=(i*293+frame*(i%3+1)*.55)%1920;
   return <circle key={i} cx={x} cy={y} r={i%4===0?2.8:1.3} fill={i%4===0?LIME:CYAN} opacity={.12+(i%3)*.1}/>;
 })}
 </svg>;
const UIOverlay:React.FC<{shot:Shot;local:number;frame:number}>=({shot,local,frame})=>{
 const {fps}=useVideoConfig();
 const active=['lotte','hospital','tamthang','baitruoc'].includes(shot.id);
 const intro=shot.id==='opening',reveal=shot.id==='reveal',final=shot.id==='final';
 const show=interpolate(local,[0,12,shot.to-shot.from-11,shot.to-shot.from],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const entry=spring({frame:local-10,fps,config:{damping:18,stiffness:100}});
 const locked=active?inTime(local,71,85):1;
 const accent=colorFor(shot.id);
 const number=active?shot.number:'';
 const captionOpacity=inTime(local,14,27);
 return <AbsoluteFill style={{fontFamily:'Arial,Helvetica,sans-serif',color:WHITE,pointerEvents:'none',opacity:show}}>
  <div style={{position:'absolute',top:0,left:0,right:0,height:520,background:'linear-gradient(180deg,#06141DF8 0%,#06141DE8 35%,transparent 100%)'}}/>
  <div style={{position:'absolute',bottom:0,left:0,right:0,height:680,background:'linear-gradient(0deg,#06141D 0%,#06141DF0 42%,transparent 100%)'}}/>
  <div style={{position:'absolute',top:115,left:74,right:74,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
   <span style={{fontSize:22,fontWeight:700,letterSpacing:5,color:accent}}>VT / CENTRE POINT</span>
   <span style={{fontSize:19,letterSpacing:3,color:'#7999A3'}}>SYS // 0{Math.min(7,Math.floor(frame/120)+1)}</span>
  </div>
  <div style={{position:'absolute',top:175,left:74,right:74,height:2,background:'linear-gradient(90deg,'+accent+',transparent)',opacity:.7}}/>
  {intro&&<div style={{position:'absolute',top:272,left:74,right:74}}>
   <div style={{color:accent,fontSize:23,letterSpacing:5,fontWeight:800}}>ESTABLISHING CONNECTION...</div>
   <div style={{fontSize:84,fontWeight:900,lineHeight:1.02,marginTop:38,letterSpacing:-2,whiteSpace:'pre-line',transform:'translateY('+((1-entry)*60)+'px)'}}>MỘT TÂM ĐIỂM{'\n'}<span style={{color:accent}}>VƯƠN LÊN.</span></div>
   <div style={{color:'#AFC4C7',fontSize:27,marginTop:34}}>Hệ tọa độ đô thị · Vũng Tàu</div>
  </div>}
  {reveal&&<div style={{position:'absolute',top:270,left:74,right:74}}>
   <div style={{color:accent,fontSize:24,letterSpacing:5}}>CITY SCAN / CONNECTIVITY</div>
   <div style={{fontSize:79,fontWeight:900,lineHeight:1.03,marginTop:29}}>TÂM ĐIỂM{'\n'}<span style={{color:accent}}>KẾT NỐI</span></div>
   <div style={{marginTop:27,fontSize:24,color:'#AEC5CC'}}>Bốn điểm đến. Một tâm điểm kết nối.</div>
  </div>}
  {active&&<div style={{position:'absolute',top:245,left:74,right:74,display:'flex',alignItems:'flex-start',gap:25}}>
   <div style={{fontSize:90,fontWeight:900,lineHeight:.9,color:accent,opacity:.95}}>{number}</div>
   <div style={{height:90,width:2,background:accent,opacity:.7}}/>
   <div style={{paddingTop:2}}>
    <div style={{fontSize:22,letterSpacing:3.6,color:accent,fontWeight:800}}>{shot.category}</div>
    <div style={{fontSize:53,fontWeight:900,lineHeight:1.05,whiteSpace:'pre-line',marginTop:13,textShadow:'0 3px 24px #000'}}>{shot.title}</div>
   </div>
  </div>}
  {active&&<div style={{position:'absolute',bottom:445,left:74,right:74,height:186,background:'linear-gradient(100deg,rgba(18,48,55,.94),rgba(6,20,29,.76))',border:'1px solid rgba(200,255,118,.34)',borderRadius:22,boxShadow:'0 0 60px rgba(200,255,118,.08)',display:'flex',alignItems:'center',gap:31,padding:'22px 27px',transform:'translateY('+((1-entry)*40)+'px)'}}>
    <div style={{width:122,height:122,borderRadius:20,background:'rgba(7,24,33,.9)',border:'2px solid '+accent,boxShadow:'0 0 30px '+accent+'44',display:'grid',placeItems:'center',transform:'scale('+(.8+.2*entry)+')'}}>
     <SVGIcon id={shot.id} size={80} color={accent}/>
    </div>
    <div style={{flex:1}}>
     <div style={{fontSize:19,letterSpacing:3,color:locked>.7?accent:'#8CB6B7'}}>{locked>.7?'DESTINATION LOCKED':'SCANNING LOCATION...'}</div>
     <div style={{fontSize:37,fontWeight:800,marginTop:14,lineHeight:1.05}}>{shot.title.replace('\n',' ')}</div>
     <div style={{height:3,background:'#395A62',marginTop:22,borderRadius:3}}>
      <div style={{height:'100%',width:(locked*100)+'%',background:accent,boxShadow:'0 0 15px '+accent}}/>
     </div>
    </div>
   </div>}
  {final&&<div style={{position:'absolute',top:235,left:74,right:74}}>
    <div style={{color:accent,fontSize:23,letterSpacing:5,fontWeight:800}}>FOUR DESTINATIONS. ONE CENTRE.</div>
    <div style={{fontSize:75,fontWeight:900,lineHeight:1.03,marginTop:35}}>VŨNG TÀU{'\n'}<span style={{color:LIME}}>CENTRE POINT</span></div>
    <div style={{fontSize:28,color:'#C8D8D6',marginTop:24,letterSpacing:2}}>TÂM ĐIỂM KẾT NỐI</div>
  </div>}
  <div style={{position:'absolute',bottom:273,left:74,right:74,opacity:captionOpacity,transform:'translateY('+((1-captionOpacity)*15)+'px)',borderLeft:'5px solid '+accent,padding:'14px 22px',background:'rgba(4,18,27,.84)',fontSize:29,lineHeight:1.4,fontWeight:600}}>{shot.voice}</div>
  <div style={{position:'absolute',left:74,right:74,bottom:150,display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:18,letterSpacing:2,color:'#8299A1'}}>
   <span>MAP DATA · OSM / ROUTE · OSRM</span><span>{('00'+Math.round(frame/30)).slice(-2)} : 30</span>
  </div>
  <div style={{position:'absolute',left:74,right:74,bottom:90,fontSize:17,color:'#9CB0B6'}}>© OpenStreetMap contributors · Route/locations pending independent review · Concept preview</div>
 </AbsoluteFill>;
};
const HeroPhoto:React.FC<{frame:number}>=({frame})=>{
 const reveal=inTime(frame,769,802);
 const slide=1.11-.11*inTime(frame,769,880);
 return <div style={{position:'absolute',top:485,left:112,right:112,height:735,opacity:reveal,transform:'perspective(1100px) rotateX('+(-7*(1-reveal))+'deg) scale('+slide+')',border:'2px solid rgba(200,255,118,.65)',boxShadow:'0 0 120px rgba(200,255,118,.15),0 40px 90px #000c',background:'#06141D',borderRadius:18,overflow:'hidden'}}>
   <Img src={staticFile('centrepoint-reference.webp')} style={{height:'100%',width:'100%',objectFit:'cover',objectPosition:'center 52%',filter:'contrast(1.10) saturate(1.05)'}}/>
   <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(6,20,29,.45),transparent 40%,rgba(6,20,29,.35))'}}/>
   <div style={{position:'absolute',top:20,left:25,padding:'9px 14px',fontSize:17,color:LIME,background:'#06141DDD',letterSpacing:2,fontWeight:700}}>PROJECT CONCEPT IMAGE</div>
   <div style={{position:'absolute',bottom:15,left:25,color:'#FFFFFF',fontSize:19,textShadow:'0 2px 5px #000'}}>Hình ảnh phối cảnh tham khảo</div>
 </div>;
};
export const CentrePointCinematicFuture30:React.FC=()=>{
 const frame=useCurrentFrame();
 const shot=SHOTS.find(s=>frame>=s.from&&frame<s.to)??SHOTS[6];
 const local=frame-shot.from,opening=shot.id==='opening',reveal=shot.id==='reveal',final=shot.id==='final';
 const active=['lotte','hospital','tamthang','baitruoc'].includes(shot.id);
 const previous=shot.id==='hospital'?'lotte':shot.id==='tamthang'?'hospital':shot.id==='baitruoc'?'tamthang':null;
 const route=routeFor(shot.id);
 const easing=inTime(local,0,20);
 const lineMotion=inTime(local,10,76);
 const ahead=route?sample(route.points,lineMotion):geo(ORIGIN);
 const prevDestination=previous?geo(destinations.find(d=>d.id===previous)!.coordinates as Point):geo(ORIGIN);
 const tracked:Point=[lerp(prevDestination[0],ahead[0],easing),lerp(prevDestination[1],ahead[1],easing)];
 const target:Point=opening?geo(ORIGIN):reveal?cityCenter:final?geo(ORIGIN):tracked;
 const scale=opening?lerp(2.9,2.3,inTime(local,0,140)):reveal?lerp(2.3,1.08,inTime(local,8,108)):final?lerp(1.1,2.25,inTime(local,0,55)):lerp(1.4,1.78,inTime(local,15,90));
 const posX=540-target[0]*scale;
 const posY=(opening?1030:final?920:active?950:960)-target[1]*scale;
 const opacity=opening?inTime(local,7,56):1;
 const mapFade=final?1-inTime(local,766-750,802-750):1;
 return <AbsoluteFill style={{background:NAVY,overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 47% 47%,#1A4044 0%,#06141D 65%,#030C14 100%)'}}/>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,opacity:mapFade}}>
   <defs>
    <radialGradient id="future-core"><stop offset="0" stopColor={LIME} stopOpacity=".23"/><stop offset=".5" stopColor={CYAN} stopOpacity=".065"/><stop offset="1" stopColor={CYAN} stopOpacity="0"/></radialGradient>
   </defs>
   <g transform={'translate('+posX+' '+posY+') scale('+scale+')'}>
    <circle cx={geo(ORIGIN)[0]} cy={geo(ORIGIN)[1]} r="240" fill="url(#future-core)" opacity={opening?1:.7}/>
    <BuildingCity opacity={opacity}/>
    <RouteLines id={shot.id} local={local} opening={opening||reveal||final}/>
    <ProjectPin frame={frame}/>
    {destinations.map(d=><EndpointPin key={d.id} id={d.id} frame={frame} isActive={d.id===shot.id} settled={local>68}/>)}
   </g>
  </svg>
  <FrameNoise frame={frame}/>
  {final&&<HeroPhoto frame={frame}/>}
  {opening&&<svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
   <g opacity={.35+.2*Math.sin(frame/12)} stroke={LIME} fill="none" strokeWidth="2">
    <circle cx="540" cy="1030" r={115+frame*.55}/>
    <circle cx="540" cy="1030" r={185+frame*.85} strokeDasharray="15 15"/>
    <path d="M365 1030h350M540 855v350"/>
   </g>
  </svg>}
  <UIOverlay shot={shot} local={local} frame={frame}/>
 </AbsoluteFill>;
};
