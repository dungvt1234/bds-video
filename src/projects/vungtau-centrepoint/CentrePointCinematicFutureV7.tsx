import React from 'react';
import {AbsoluteFill,Img,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import locations from './locations.json';
import routing from './routes.geojson';

/**
 * Cinematic Future V6 • authentic OSM streets/coastline + OSRM route candidates.
 * 900 frames / 30 fps / 1080x1920. POI categories on the orbit HUD are NOT
 * mapped pins: names and geographic positions await POI review.
 * Georeferencing: same EPSG:3857 projection as data/prepare-v3-map.mjs.
 */
type P = [number,number];
type R = {properties:{id:string};geometry:{coordinates:P[]}};
type Shot={id:string;start:number;end:number;headline:string;kicker:string;subtitle:string};
const W=1080,H=1920;
const NAVY='#06141D',LIME='#C8FF76',CYAN='#72DCE5',GOLD='#F0C98C',WHITE='#F6FAF8';
const RADIUS=6378137,DEG=Math.PI/180;
const center:[number,number]=[107.102,10.369],SCALE=.12;
const mx=(lon:number)=>RADIUS*lon*DEG;
const my=(lat:number)=>RADIUS*Math.log(Math.tan(Math.PI/4+lat*DEG/2));
const project=(p:P):P=>[540+(mx(p[0])-mx(center[0]))*SCALE,960-(my(p[1])-my(center[1]))*SCALE];
const origin=project(locations.origin.coordinates as P);
const points=(routing.features as R[]).map(r=>({id:r.properties.id,p:r.geometry.coordinates.map(project)}));
const destinations=locations.destinations.map(d=>({...d,p:project(d.coordinates as P)}));
const shots:Shot[]=[
 {id:'opening',start:0,end:120,kicker:'SYSTEM BOOT / VŨNG TÀU',headline:'MỘT TÂM ĐIỂM\nVƯƠN LÊN',subtitle:'Giữa nhịp sống Vũng Tàu, một tâm điểm mới vươn lên.'},
 {id:'orbit',start:120,end:270,kicker:'LOCAL AMENITY DISCOVERY',headline:'TIỆN ÍCH\nQUANH TÂM ĐIỂM',subtitle:'Khám phá hệ tiện ích sống, từ mua sắm, trường học đến biển xanh.'},
 {id:'lotte',start:270,end:360,kicker:'01 / MUA SẮM & GIẢI TRÍ',headline:'LOTTE MART',subtitle:'Mua sắm tại Lotte Mart.'},
 {id:'hospital',start:360,end:450,kicker:'02 / Y TẾ',headline:'BỆNH VIỆN VŨNG TÀU',subtitle:'Kết nối dịch vụ y tế tại Bệnh viện Vũng Tàu.'},
 {id:'tamthang',start:450,end:540,kicker:'03 / ĐIỂM THAM QUAN',headline:'THÁP TAM THẮNG',subtitle:'Khám phá Tháp Tam Thắng.'},
 {id:'baitruoc',start:540,end:630,kicker:'04 / KHÔNG GIAN BIỂN',headline:'BÃI TRƯỚC',subtitle:'Bãi Trước, nhịp sống ven biển.'},
 {id:'network',start:630,end:780,kicker:'CONNECTED CITY / NETWORK',headline:'MỘT TÂM ĐIỂM\nBỐN KẾT NỐI',subtitle:'Bốn điểm đến, cùng kết nối về một tâm điểm đô thị.'},
 {id:'final',start:780,end:900,kicker:'CENTRE POINT / VŨNG TÀU',headline:'VŨNG TÀU\nCENTRE POINT',subtitle:'Vũng Tàu Centre Point. Tâm điểm kết nối tương lai.'}
];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t)};
const pulse=(f:number,t:number,a:number,b:number)=>smooth((f-t)/a)*(1-smooth((f-t-a)/b));
const tween=(f:number,a:number,b:number)=>smooth((f-a)/(b-a));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const blend=(a:P,b:P,t:number):P=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
const fmt=(p:P)=>p[0].toFixed(1)+','+p[1].toFixed(1);
const path=(p:P[])=>p.map((a,i)=>(i?'L':'M')+fmt(a)).join(' ');
const findRoute=(id:string)=>points.find(r=>r.id===id);
const getEnd=(id:string)=>destinations.find(d=>d.id===id);
const dist=(a:P,b:P)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const along=(p:P[],t:number):P=>{
 const seg=p.slice(1).map((v,i)=>dist(p[i],v)),total=seg.reduce((s,v)=>s+v,0);
 let left=clamp(t)*total;
 for(let i=0;i<seg.length;i++){
  if(left<=seg[i])return blend(p[i],p[i+1],left/Math.max(seg[i],.001));
  left-=seg[i];
 }
 return p[p.length-1]||origin;
};
const ids=['lotte','hospital','tamthang','baitruoc'];
const accent=(id:string)=>id==='baitruoc'?CYAN:id==='tamthang'?GOLD:LIME;
const Icon:React.FC<{id:string;size?:number;color?:string}>=({id,size=70,color=LIME})=>{
 const attrs={stroke:color,strokeWidth:3.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,fill:'none'};
 let body:React.ReactNode;
 switch(id){
  case 'lotte':case 'market':
   body=<><rect x="13" y="22" width="38" height="33" rx="3"/><path d="M21 25V18a11 11 0 0 1 22 0v7M23 37h18M23 45h18"/></>;break;
  case 'hospital':
   body=<><rect x="13" y="18" width="38" height="37" rx="3"/><path d="M32 25v21M22 35h20M23 55V47h18"/></>;break;
  case 'tamthang':
   body=<><path d="M12 54h40M19 54V27l13-17 13 17v27M18 28h28M26 54V35h12v19"/><path d="M28 21h8"/></>;break;
  case 'baitruoc':case 'beach':
   body=<><path d="M6 26q9-10 18 0t18 0 16 0M6 39q9-10 18 0t18 0 16 0M6 52q9-10 18 0t18 0 16 0"/></>;break;
  case 'school':
   body=<><path d="M7 27l25-14 25 14-25 14zM17 35v12q15 12 30 0V35M56 27v22"/></>;break;
  default:body=<><path d="M14 54V20l18-10 18 10v34M23 54V33h18v21M23 24h18M8 55h48"/></>;
 }
 return <svg width={size} height={size} viewBox="0 0 64 64"><g {...attrs}>{body}</g></svg>;
};
const ProjectBeacon:React.FC<{frame:number;zoom:number}>=({frame,zoom})=>{
 const s=1/zoom,period=frame%58,r=35+period*.8;
 return <g transform={'translate('+fmt(origin)+') scale('+s+')'}>
  <circle r={r} stroke={LIME} strokeWidth="2.6" fill="none" opacity={.65*(1-period/58)}/>
  <circle r="47" fill="#071923" stroke={LIME} strokeWidth="2" strokeDasharray="7 7" opacity=".75"/>
  <path d="M-64 0h25M39 0h25M0-64v25M0 39v25" stroke={LIME} strokeWidth="2.5" opacity=".7"/>
  <circle r="18" fill="#103B3B" stroke={WHITE} strokeWidth="2"/>
  <circle r="8.5" fill={LIME}/>
 </g>;
};
const DestinationBeacon:React.FC<{id:string;frame:number;zoom:number;active:boolean;progress:number}>=({id,frame,zoom,active,progress})=>{
 const dest=getEnd(id);if(!dest)return null;
 const p=dest.p,s=1/zoom,c=accent(id);
 const reveal=active?tween(progress,0,.72):.5;
 const phase=frame%50;
 const size=active?1:0.6;
 return <g transform={'translate('+fmt(p)+') scale('+(s*size)+')'} opacity={active?Math.max(.35,reveal):.34}>
  {active&&<><circle r={45+phase*.9} stroke={c} strokeWidth="3" fill="none" opacity={1-phase/50}/>
   <circle r={75+(frame%60)*.3} fill="none" stroke={c} strokeDasharray="10 10" strokeWidth="1.8" opacity=".25"/></>}
  <circle r="42" fill="#091E2A" stroke={c} strokeWidth={active?4:2}/>
  <g transform="translate(-32 -32)"><Icon id={id} size={64} color={c}/></g>
 </g>;
};
const routeProgress=(id:string,local:number)=>{
 if(id==='hospital')return tween(local,3,78);
 if(id==='tamthang')return tween(local,16,58);
 if(id==='baitruoc')return tween(local,8,82);
 return tween(local,7,64);
};
const Routing:React.FC<{id:string;local:number;frame:number}>=({id,local,frame})=>{
 const network=id==='network',focus=findRoute(id);
 const activeProgress=network?tween(local,7,100):routeProgress(id,local);
 return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
  {points.map((r,i)=>{
   const selected=network||id===r.id;
   const p=network?tween(local,i*13+7,i*13+100):selected?activeProgress:0;
   const c=accent(r.id),d=path(r.p);
   return <g key={r.id}>
    <path d={d} stroke="#7891A0" opacity={selected?.38:.13} strokeWidth="2.5"/>
    {selected&&<><path d={d} stroke={c} strokeWidth={network?20:36} opacity=".18" pathLength={1} strokeDasharray="1" strokeDashoffset={1-p}/>
    <path d={d} stroke={c} strokeWidth={network?9:16} opacity=".42" pathLength={1} strokeDasharray="1" strokeDashoffset={1-p}/>
    <path d={d} stroke={WHITE} strokeWidth={network?2.6:5} opacity=".95" pathLength={1} strokeDasharray="1" strokeDashoffset={1-p}/></>}
   </g>;
  })}
  {focus&&activeProgress>0&&[0,.018,.04,.065,.09].map((lag,i)=>{
   const p=along(focus.p,Math.max(0,activeProgress-lag));
   return <circle key={i} cx={p[0]} cy={p[1]} r={i===0?8:Math.max(2,7-i)} fill={i===0?WHITE:accent(id)} opacity={Math.max(.08,.95-i*.17)}/>;
  })}
  {network&&points.map((r,i)=>{
   const p=along(r.p,tween(local,i*13+7,i*13+100));
   return <circle key={r.id} cx={p[0]} cy={p[1]} r="6" fill={accent(r.id)}/>;
  })}
 </g>;
};
const TrackingOverlay:React.FC<{frame:number;shot:Shot;local:number}>=({frame,shot,local})=>{
 const open=shot.id==='opening';
 return <svg width={W} height={H} viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
  <defs>
   <linearGradient id="sweep" x1="0" x2="1" y1="0" y2="0"><stop stopColor={LIME} stopOpacity="0"/><stop offset=".5" stopColor={LIME} stopOpacity=".11"/><stop offset="1" stopColor={LIME} stopOpacity="0"/></linearGradient>
  </defs>
  <g fill="none" stroke={LIME} strokeWidth="2" opacity=".35">
   <path d="M60 355V305H115M965 305h55v50M60 1480v55h55M965 1535h55v-55"/>
   {Array.from({length:4},(_,i)=><path key={i} d={'M'+(180+i*225)+' 354v-11'} strokeWidth="3"/>)}
  </g>
  <rect x="0" y={((frame*20)%2220)-210} width="1080" height="160" fill="url(#sweep)"/>
  <path d={'M0 '+(((frame*20)%2220)-120)+'H1080'} stroke={LIME} opacity=".3" strokeWidth="2"/>
  {open&&<><circle cx="540" cy="1000" r={95+local*1.6} stroke={LIME} strokeWidth="2.5" strokeDasharray="14 15" fill="none" opacity={.67*(1-local/145)}/>
   <circle cx="540" cy="1000" r="190" stroke={CYAN} strokeWidth="1.5" fill="none" opacity=".22"/>
   <path d="M540 750V1250M290 1000H790" stroke={LIME} opacity=".25" strokeWidth="2"/></>}
  {Array.from({length:30},(_,i)=>{
   const x=(i*163+67)%1080,y=(i*271+frame*((i%4)+1)*.9)%1920;
   return <circle key={i} cx={x} cy={y} r={i%6===0?3:1.4} fill={i%4===0?LIME:CYAN} opacity={i%5===0?.35:.13}/>;
  })}
 </svg>;
};

/** Project-centric radial UX. Orbit icons are interface categories, NOT geolocated markers. */
const OrbitHUD:React.FC<{local:number}>=({local})=>{
 const {fps}=useVideoConfig();
 const cx=540,cy=1060;
 const units=[
  {id:'market',name:'CHỢ',x:245,y:880,t0:17},
  {id:'school',name:'TRƯỜNG HỌC',x:830,y:907,t0:56},
  {id:'beach',name:'BIỂN CHÍ LINH',x:635,y:1340,t0:98},
 ];
 const active=local<55?0:local<98?1:2;
 const a=units[active];
 const globalFade=tween(local,0,20);
 const ring=tween(local,6,64);
 const rays=Array.from({length:32},(_,i)=>i*Math.PI*2/32);
 return <AbsoluteFill style={{pointerEvents:'none',opacity:globalFade}}>
  <svg width={W} height={H} viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,overflow:'visible'}}>
   <defs>
    <radialGradient id="v5energyCore"><stop stopColor={LIME} stopOpacity=".4"/><stop offset=".45" stopColor={CYAN} stopOpacity=".1"/><stop offset="1" stopColor={CYAN} stopOpacity="0"/></radialGradient>
    <linearGradient id="v5projectBeam" x1="0" x2="0" y1="0" y2="1"><stop stopColor={LIME} stopOpacity="0"/><stop offset=".5" stopColor={LIME} stopOpacity=".18"/><stop offset="1" stopColor={LIME} stopOpacity="0"/></linearGradient>
   </defs>
   <circle cx={cx} cy={cy} r="330" fill="url(#v5energyCore)" opacity={.75+.1*Math.sin(local/16)}/>
   <ellipse cx={cx} cy={cy+60} rx="124" ry="33" stroke={LIME} strokeWidth="3" fill="#071C27" fillOpacity=".52" opacity=".8"/>
   <path d={'M'+(cx-88)+' 575 L'+(cx+88)+' 575 L'+(cx+110)+' 1095 L'+(cx-110)+' 1095Z'} fill="url(#v5projectBeam)" opacity=".8"/>
   {[178,268,340].map((r,i)=>{
    const v=r*ring;
    return <g key={r}>
     <circle cx={cx} cy={cy} r={v} stroke={i===1?LIME:CYAN} strokeWidth={i===1?3:2} opacity={.47-i*.075} strokeDasharray={i===1?'14 19':'6 12'} fill="none"/>
     <circle cx={cx} cy={cy} r={v+9} stroke={i===1?LIME:CYAN} strokeWidth="1" opacity=".19" fill="none"/>
    </g>;
   })}
   <g transform={'rotate('+(local*.3)+' '+cx+' '+cy+')'}>
    <path d={'M'+(cx+281)+' '+cy+'A281 281 0 0 1 '+cx+' '+(cy+281)} stroke={LIME} strokeWidth="9" fill="none" strokeLinecap="round" opacity=".8"/>
    <path d={'M'+(cx-316)+' '+cy+'A316 316 0 0 1 '+cx+' '+(cy-316)} stroke={CYAN} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".63"/>
   </g>
   {rays.map((ang,i)=>{
     const x1=cx+118*Math.cos(ang),y1=cy+118*Math.sin(ang),x2=cx+(135+Math.sin(local/10+i)*6)*Math.cos(ang),y2=cy+(135+Math.sin(local/10+i)*6)*Math.sin(ang);
     return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i%4===0?LIME:CYAN} strokeWidth={i%4===0?3:1} opacity=".6"/>;
   })}
   {units.map((u,i)=>{
    const progress=tween(local,u.t0-8,u.t0+17),selected=i===active;
    return <g key={u.id} opacity={Math.max(.09,progress)}>
     <path d={'M'+cx+','+cy+' Q'+((cx+u.x)/2+45).toFixed(1)+','+((cy+u.y)/2-46).toFixed(1)+' '+u.x+','+u.y} stroke={selected?LIME:CYAN} strokeWidth={selected?3:1.6} strokeDasharray="7 11" fill="none" opacity={selected?.85:.38}/>
     {selected&&<circle cx={u.x} cy={u.y} r={80+((local-u.t0+100)%38)*1.7} stroke={LIME} fill="none" strokeWidth="3" opacity=".28"/>}
     <circle cx={u.x} cy={u.y} r={selected?79:68} fill="#061720" fillOpacity=".88" stroke={selected?LIME:CYAN} strokeWidth={selected?4:2}/>
     <circle cx={u.x} cy={u.y} r={selected?91:74} stroke={selected?LIME:CYAN} strokeWidth="1.5" strokeDasharray="9 10" fill="none" opacity=".5"/>
    </g>;
   })}
   <circle cx={cx} cy={cy} r="111" fill="#0A242D" stroke={LIME} strokeWidth="3.5"/>
   <circle cx={cx} cy={cy} r="100" fill="none" stroke={CYAN} strokeWidth="2" strokeDasharray="12 14" opacity=".7"/>
   <circle cx={cx} cy={cy} r={57+Math.sin(local/9)*3} fill={LIME} opacity=".16"/>
   <path d={'M'+(cx-24)+' '+(cy+25)+' V'+(cy-19)+' l24-14 24 14 v44 M'+(cx-8)+' '+(cy+25)+' v-20 h16 v20'} stroke={LIME} strokeWidth="5" strokeLinejoin="round" fill="none"/>
   <text x={cx} y={cy+84} textAnchor="middle" fontFamily="monospace" fontSize="12" fill={LIME} fontWeight="bold">CENTRE POINT CORE</text>
  </svg>
  {units.map((u,i)=>{
   const appear=spring({frame:local-u.t0,fps,config:{damping:17,stiffness:112}});
   const highlight=i===active;
   const p=clamp(appear);
   return <div key={u.id} style={{position:'absolute',left:u.x-64,top:u.y-64,width:128,height:128,display:'grid',placeItems:'center',opacity:p,transform:'scale('+(highlight?1+.075*Math.sin(local/8):.9)+')'}}>
    <Icon id={u.id} size={highlight?83:69} color={highlight?LIME:CYAN}/>
   </div>;
  })}
  <div style={{position:'absolute',top:1421,left:76,right:76,minHeight:160,background:'linear-gradient(100deg,rgba(9,32,41,.96),rgba(14,50,52,.96))',border:'2px solid #B9E992',boxShadow:'0 0 50px #C8FF763D',borderRadius:18,padding:'18px 28px'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',color:LIME,fontFamily:'Consolas,monospace',fontSize:19,letterSpacing:2,fontWeight:700}}>
    <span>[ AMENITY DISCOVERY ]</span><span>0{active+1} / 03</span>
   </div>
   <div style={{fontSize:46,color:WHITE,fontWeight:900,marginTop:12}}>{a.name}</div>
   <div style={{fontSize:16,color:'#AAC4C8',marginTop:7}}>Danh mục minh họa · Địa điểm cụ thể / tọa độ cần xác minh</div>
  </div>
  <div style={{position:'absolute',top:1613,left:76,right:76,textAlign:'center',fontSize:16,letterSpacing:1.15,color:'#AAC5C6'}}>CÁC ICON LÀ GIAO DIỆN HUD, KHÔNG THỂ HIỆN VỊ TRÍ ĐỊA LÝ</div>
 </AbsoluteFill>;
};

const UtilityCard:React.FC<{id:string;local:number}>=({id,local})=>{
 const {fps}=useVideoConfig(),c=accent(id),end=getEnd(id);
 const val=spring({frame:local-27,fps,config:{damping:17,stiffness:102}});
 const complete=tween(local,35,71),title=end?.name.toUpperCase()||id.toUpperCase();
 return <div style={{position:'absolute',left:69,right:69,bottom:407,height:174,background:'linear-gradient(105deg,#102D38F2,#071D27E8)',border:'2px solid '+c+'7A',borderRadius:18,padding:'18px 23px',display:'flex',alignItems:'center',gap:26,transform:'translateY('+((1-val)*56)+'px)',opacity:clamp(val),boxShadow:'0 0 75px '+c+'20'}}>
  <div style={{width:123,height:123,borderRadius:16,flexShrink:0,display:'grid',placeItems:'center',background:'#091F2B',border:'2px solid '+c,boxShadow:'inset 0 0 26px '+c+'27,0 0 24px '+c+'3D'}}>
   <Icon id={id} size={87} color={c}/>
  </div>
  <div style={{flex:1,minWidth:0}}>
   <div style={{color:c,fontSize:19,letterSpacing:2,fontWeight:800}}>{complete>.95?'LOCATION LOCKED':'SCANNING ROUTE...'}</div>
   <div style={{color:WHITE,fontSize:34,marginTop:10,fontWeight:900,lineHeight:1.06}}>{title}</div>
   <div style={{height:3,background:'#395963',marginTop:18}}><div style={{background:c,width:(complete*100)+'%',height:'100%',boxShadow:'0 0 13px '+c}}/></div>
  </div>
 </div>;
};
const OutroPhoto:React.FC<{local:number}>=({local})=>{
 const enter=tween(local,14,46),zoom=1.04+.08*tween(local,12,120);
 return <div style={{position:'absolute',left:120,right:120,top:645,height:700,opacity:enter,transform:'translateY('+((1-enter)*60)+'px) perspective(1200px) rotateX('+((1-enter)*6)+'deg)',overflow:'hidden',border:'2px solid #A5DFA5',borderRadius:17,boxShadow:'0 0 85px rgba(200,255,118,.24),0 50px 110px #000B'}}>
  <Img src={staticFile('centrepoint-reference.webp')} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',transform:'scale('+zoom+')',filter:'contrast(1.07) saturate(1.14)'}}/>
  <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,#06141D75,transparent 45%,#06141D77)'}}/>
  <div style={{position:'absolute',left:17,top:15,background:'#071923EB',fontSize:17,letterSpacing:2,padding:10,color:LIME}}>PHỐI CẢNH THAM KHẢO</div>
 </div>;
};
const TerminalSubtitle:React.FC<{shot:Shot;local:number;color:string;bottom:number}>=({shot,local,color,bottom})=>{
 const sys:Record<string,string>={
  opening:'[SYS] VUNG_TAU_GRID // INIT',
  orbit:'[SCAN] AMENITY_DISCOVERY // REVIEW',
  lotte:'[ROUTE_01] LOCATION_TRACKING',
  hospital:'[ROUTE_02] HEALTHCARE_NODE',
  tamthang:'[ROUTE_03] LANDMARK_ACCESS',
  baitruoc:'[ROUTE_04] COASTAL_ROUTE',
  network:'[NETWORK] LINK_GRAPH_04',
  final:'[CORE] CENTRE_POINT // CONNECTED'
 };
 const text=shot.subtitle;
 const count=Math.max(0,Math.min(text.length,Math.floor(Math.max(0,local-9)*1.85)));
 const blink=Math.floor(local/9)%2===0;
 const fade=tween(local,5,12);
 const glitch=local===14||local===15;
 const typed=text.slice(0,count);
 return <div style={{position:'absolute',bottom,left:75,right:75,minHeight:116,padding:'12px 17px',borderLeft:'4px solid '+color,borderTop:'1px solid '+color+'55',background:'#051823F2',opacity:fade,boxShadow:'0 0 30px '+color+'18',fontFamily:'Consolas,monospace'}}>
  <div style={{color,fontSize:17,letterSpacing:1.7,fontWeight:800,marginBottom:10}}>{sys[shot.id]||'[MAP] GEO_LOCK'} <span style={{opacity:blink?.9:.25}}>●</span></div>
  <div style={{color:'#F3FAF5',fontSize:25,lineHeight:1.3,fontWeight:700,textShadow:'0 0 6px '+color+'47',transform:glitch?'translateX(2px)':'none'}}>› {typed}<span style={{color,opacity:blink?1:0}}>▌</span></div>
  <div style={{position:'absolute',bottom:0,left:0,height:2,width:(count/Math.max(1,text.length)*100)+'%',background:color,boxShadow:'0 0 12px '+color}}/>
 </div>;
};


/** Three visual stages: targeting > deciphering > arrival pulse.
 * An on-screen graphic, deliberately not placed at invented lat/lng.
 */
const TargetHologram:React.FC<{id:string;local:number}>=({id,local})=>{
 const colour=accent(id),arrival=tween(local,40,74);
 const materialise=tween(local,12,37);
 const lock=Math.floor(local/3)%5;
 const rotation=local*(id==='tamthang'?-1.4:1.8);
 const status=arrival>.88?'TARGET ACQUIRED':arrival>.35?'COORDINATE SYNC':'DECODING SIGNAL';
 const bar=Math.round(tween(local,16,72)*100);
 const title=(getEnd(id)?.name||id).toUpperCase();
 return <AbsoluteFill style={{pointerEvents:'none',opacity:materialise}}>
  <svg width={W} height={H} viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,overflow:'visible'}}>
   <defs>
    <radialGradient id={'v5hotspot-'+id}><stop stopColor={colour} stopOpacity=".3"/><stop offset=".53" stopColor={colour} stopOpacity=".07"/><stop offset="1" stopColor={colour} stopOpacity="0"/></radialGradient>
   </defs>
   <ellipse cx="540" cy="995" rx="305" ry="290" fill={'url(#v5hotspot-'+id+')'}/>
   <ellipse cx="540" cy="1121" rx={250*materialise} ry={48*materialise} stroke={colour} strokeWidth="4" opacity=".58" fill="none"/>
   <ellipse cx="540" cy="1121" rx={175*materialise} ry={23*materialise} stroke={colour} strokeWidth="2" opacity=".7" fill="none"/>
   <path d="M420 1140 L465 826 L615 826 L660 1140Z" fill={colour} opacity=".075"/>
   <path d="M495 1121 L525 835 M585 1121 L555 835" stroke={colour} strokeWidth="3" opacity=".28"/>
   {[160,195,232].map((r,i)=>{
    const y=940;
    return <circle key={r} cx="540" cy={y} r={r*(.55+.45*arrival)} stroke={i===1?colour:CYAN} strokeWidth={i===1?4:2} strokeDasharray={i===1?'12 16':'7 12'} opacity={.28+.13*arrival-i*.055} fill="none" transform={'rotate('+(rotation*(i%2?-1:1))+' 540 940)'}/>;
   })}
   {[0,1,2,3].map(i=>{
    const phase=Math.max(0,local-55-i*7),expand=110+phase*11;
    return <circle key={i} cx="540" cy="940" r={expand} fill="none" stroke={colour} strokeWidth={4-i*.7} opacity={Math.max(0,arrival*(.26-phase*.003))}/>;
   })}
   {Array.from({length:22},(_,i)=>{
    const a=i*Math.PI*2/22,progress=Math.max(0,local-48-i%5*3);
    const r=105+progress*(1.5+i%3*.7);
    return <circle key={i} cx={540+r*Math.cos(a)} cy={940+r*Math.sin(a)*.7} r={i%4===0?4:2} fill={i%2?colour:WHITE} opacity={Math.max(0,Math.min(1,progress/17))*(1-Math.min(1,progress/80))}/>;
   })}
   <path d="M300 1037h-55v-75M780 1037h55v-75M300 841h-55v75M780 841h55v75" stroke={colour} fill="none" strokeWidth="3" opacity=".75"/>
   <text x="540" y="1198" fontSize="19" fontFamily="Consolas,monospace" fill={colour} textAnchor="middle" letterSpacing="3" fontWeight="700">{status}</text>
   <text x="540" y="1242" fontSize="17" fontFamily="Consolas,monospace" fill="#D6F1EF" textAnchor="middle" letterSpacing="2">HOLD TO FOCUS / {bar}%</text>
  </svg>
  <div style={{position:'absolute',left:540-102,top:940-102,width:204,height:204,border:'3px solid '+colour,borderRadius:38,display:'grid',placeItems:'center',background:'radial-gradient(circle at 50% 43%,#173F48EC,#061922F0 75%)',boxShadow:'0 0 80px '+colour+'6A,inset 0 0 60px '+colour+'22',transform:'perspective(700px) rotateY('+(id==='lotte'?-13:id==='hospital'?12:id==='tamthang'?-7:8)+'deg) translateY('+((1-materialise)*47)+'px) scale('+(0.7+.3*materialise)+')'}}>
   <Icon id={id} size={135} color={colour}/>
   <div style={{position:'absolute',top:-26,left:-17,right:-17,height:3,background:'linear-gradient(90deg,transparent,'+colour+',transparent)',boxShadow:'0 0 17px '+colour,opacity:lock===0?.2:.85}}/>
  </div>
  <div style={{position:'absolute',left:280,right:280,top:1283,fontSize:20,letterSpacing:1.5,textAlign:'center',color:WHITE,fontWeight:800,textShadow:'0 0 12px '+colour+'60'}}>{title}</div>
 </AbsoluteFill>;
};
const CoreActivation:React.FC<{local:number}>=({local})=>{
 const t=tween(local,7,74);
 const flash=Math.max(0,1-Math.abs(local-62)/15);
 return <AbsoluteFill style={{pointerEvents:'none'}}>
  <svg width={W} height={H} viewBox="0 0 1080 1920" style={{position:'absolute',inset:0}}>
   <defs>
    <linearGradient id="v5Beam" x1="0" y1="1" x2="0" y2="0"><stop stopColor={LIME} stopOpacity=".36"/><stop offset=".65" stopColor={CYAN} stopOpacity=".11"/><stop offset="1" stopColor={CYAN} stopOpacity="0"/></linearGradient>
    <radialGradient id="v5Halo"><stop stopColor={LIME} stopOpacity=".21"/><stop offset="1" stopColor={LIME} stopOpacity="0"/></radialGradient>
   </defs>
   <circle cx="540" cy="1030" r={420*t} fill="url(#v5Halo)"/>
   <path d="M447 1140L490 590H590L633 1140Z" fill="url(#v5Beam)" opacity={t}/>
   {[110,180,275,350].map((r,i)=><circle key={r} cx="540" cy="1030" r={r*t} stroke={i%2?CYAN:LIME} fill="none" strokeWidth={i===0?5:2.4} strokeDasharray={i%2?'9 13':undefined} opacity={.55-i*.08}/>)}
   {[...Array(12)].map((_,i)=>{
    const a=i*Math.PI/6+local*.009,rad=190+Math.sin(local*.04+i)*18;
    return <circle key={i} cx={540+rad*Math.cos(a)} cy={1030+rad*Math.sin(a)*.8} r={i%3===0?4:2} fill={i%2?CYAN:LIME} opacity={t*.6}/>;
   })}
   <path d={'M'+(540-105*t)+' 1080 L540 '+(950-290*t)+' L'+(540+105*t)+' 1080'} fill="none" stroke={CYAN} strokeWidth="3.5" opacity={.62*t}/>
   <path d={'M'+(540-90*t)+' 1070V'+(980-195*t)+'L540 '+(925-235*t)+' L'+(540+90*t)+' '+(980-195*t)+'V1070'} fill="none" stroke={LIME} strokeWidth="3" opacity={.7*t}/>
   <ellipse cx="540" cy="1099" rx={220*t} ry={36*t} fill="none" stroke={LIME} strokeWidth="3.5"/>
   <ellipse cx="540" cy="1103" rx={165*t} ry={25*t} fill="none" stroke={CYAN} strokeWidth="2.5"/>
   <circle cx="540" cy="1030" r={390*t} fill={WHITE} opacity={flash*.018}/>
   <text x="540" y="1245" textAnchor="middle" fill={LIME} fontSize="18" letterSpacing="4" fontFamily="Consolas,monospace" opacity={t}>CORE NODE / SIGNAL ONLINE</text>
  </svg>
 </AbsoluteFill>;
};
const NetworkSurge:React.FC<{local:number}>=({local})=>{
 const appear=tween(local,12,75);
 return <AbsoluteFill style={{pointerEvents:'none'}}>
  <svg viewBox="0 0 1080 1920" width={W} height={H} style={{position:'absolute',inset:0}}>
   <defs><radialGradient id="v5networkGlow"><stop stopColor={LIME} stopOpacity=".19"/><stop offset=".65" stopColor={CYAN} stopOpacity=".07"/><stop offset="1" stopColor={CYAN} stopOpacity="0"/></radialGradient></defs>
   <circle cx="540" cy="1010" r="400" fill="url(#v5networkGlow)" opacity={appear}/>
   {[150,230,300].map((r,i)=>{
     const expand=r*appear+(local%50)*1.4;
     return <circle key={r} cx="540" cy="1010" r={expand} fill="none" stroke={i%2?CYAN:LIME} strokeWidth="3" opacity={.46-i*.1-(local%50)/220} strokeDasharray="10 12"/>;
   })}
   {[0,1,2,3].map((i)=>{
     const a=(i*Math.PI/2-local*.006),start=170,end=290;
     return <g key={i}>
      <line x1={540+start*Math.cos(a)} y1={1010+start*Math.sin(a)} x2={540+end*Math.cos(a)} y2={1010+end*Math.sin(a)} stroke={i%2?CYAN:LIME} strokeWidth="3" opacity={appear*.55}/>
      <circle cx={540+end*Math.cos(a)} cy={1010+end*Math.sin(a)} r="9" fill={i%2?CYAN:LIME} opacity={appear*.86}/>
     </g>;
   })}
  </svg>
 </AbsoluteFill>;
};
/** Each shot has a distinct directional light-wipe, not a repeated zoom/reset. */
const KineticTransition:React.FC<{shot:Shot;local:number}>=({shot,local})=>{
 const t=tween(local,0,13);
 const opacity=(1-t)*.9;
 if(shot.id==='opening'||opacity<=0)return null;
 const dir=shot.id==='hospital'?'vertical':shot.id==='baitruoc'?'coastal':shot.id==='tamthang'?'diagonal':'horizontal';
 return <svg width={W} height={H} viewBox="0 0 1080 1920" style={{position:'absolute',inset:0,pointerEvents:'none',opacity}}>
  {Array.from({length:20},(_,i)=>{
   const p=i/19,shift=(1-t)*550,wide=12+(i%4)*11;
   if(dir==='vertical')return <path key={i} d={'M'+(p*1080)+' '+(-30)+' L'+(p*1080+100)+' '+(1920-shift)} stroke={CYAN} strokeWidth={wide/3} opacity={1-p*.7}/>;
   if(dir==='coastal')return <path key={i} d={'M'+(-shift)+' '+(480+i*37)+' Q540 '+(580+i*30)+' '+(1120+shift)+' '+(480+i*41)} fill="none" stroke={CYAN} strokeWidth="4" opacity=".6"/>;
   if(dir==='diagonal')return <path key={i} d={'M'+(-330+shift+i*67)+' 0 L'+(500-shift+i*67)+' 1920'} stroke={GOLD} strokeWidth={wide/3} opacity=".6"/>;
   return <path key={i} d={'M0 '+(200+i*76+shift)+'H1080'} stroke={LIME} strokeWidth={wide/3} opacity=".6"/>;
  })}
 </svg>;
};

const Panels:React.FC<{shot:Shot;frame:number;local:number}>=({shot,frame,local})=>{
 const isRoute=ids.includes(shot.id),isOrbit=shot.id==='orbit',isFinal=shot.id==='final',isNetwork=shot.id==='network';
 const {fps}=useVideoConfig(),entry=spring({frame:local-7,fps,config:{damping:19,stiffness:85}});
 const fade=tween(local,0,12)*(1-tween(local,shot.end-shot.start-14,shot.end-shot.start));
 const c=accent(shot.id);
 return <AbsoluteFill style={{pointerEvents:'none',fontFamily:'Arial,Helvetica,sans-serif',color:WHITE,opacity:fade}}>
  <div style={{position:'absolute',top:0,height:560,left:0,right:0,background:'linear-gradient(180deg,#04131FF9,#04131FDE 65%,transparent)'}}/>
  <div style={{position:'absolute',bottom:0,height:605,left:0,right:0,background:'linear-gradient(0deg,#04131FFB,#04131FEB 60%,transparent)'}}/>
  <div style={{position:'absolute',top:103,left:75,right:75,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
   <div style={{fontSize:22,color:LIME,letterSpacing:4,fontWeight:800}}>VT / CENTRE POINT</div>
   <div style={{fontSize:19,letterSpacing:2,color:'#9DB8C0'}}>CINEMATIC FUTURE · 07</div>
  </div>
  <div style={{position:'absolute',top:163,left:75,right:75,height:2,background:'linear-gradient(90deg,'+c+',transparent)'}}/>
  <div style={{position:'absolute',left:76,right:60,top:isRoute?216:228,transform:'translateY('+((1-entry)*37)+'px)'}}>
   <div style={{fontSize:22,letterSpacing:4,color:c,fontWeight:800}}>{shot.kicker}</div>
   <div style={{fontSize:isRoute?62:isFinal?76:70,lineHeight:1.08,fontWeight:900,whiteSpace:'pre-line',marginTop:22,textShadow:'0 3px 22px #000'}}>{shot.headline}</div>
   {shot.id==='opening'&&<div style={{fontSize:24,color:'#B4D0CD',marginTop:23}}>BẢN ĐỒ VŨNG TÀU · KÍCH HOẠT HỆ THỐNG</div>}
  </div>
  {shot.id==='opening'&&<CoreActivation local={local}/>}
  {isOrbit&&<OrbitHUD local={local}/>}
  {/* Destination photo panels are composited over georeferenced map pins
      in the clean V7 post-render pass. Suppress V6's giant center HUD,
      target hologram, and repeated bottom card to give those photos focus. */}
  {isNetwork&&<NetworkSurge local={local}/>}
  {isNetwork&&<div style={{position:'absolute',bottom:485,left:76,right:76,display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
   {ids.map((id,i)=><div key={id} style={{height:86,display:'flex',alignItems:'center',gap:13,padding:12,border:'1px solid '+accent(id)+'66',background:'#0A222DDC',borderRadius:12,opacity:tween(local,i*14+17,i*14+40)}}>
    <Icon id={id} color={accent(id)} size={48}/><span style={{fontSize:21,fontWeight:700,color:WHITE}}>{['LOTTE MART','BỆNH VIỆN','THÁP TAM THẮNG','BÃI TRƯỚC'][i]}</span>
   </div>)}
  </div>}
  {isFinal&&<OutroPhoto local={local}/>}
  <TerminalSubtitle shot={shot} local={local} color={c} bottom={isRoute?216:169}/>
  <div style={{position:'absolute',left:75,right:75,bottom:75,fontSize:16,letterSpacing:.6,color:'#9FB4BB'}}>© OpenStreetMap contributors · Tuyến OSRM / tọa độ đang chờ đối chiếu · Bản dựng xem trước</div>
  <div style={{position:'absolute',top:1760,left:76,right:76,height:3,background:'#254A54'}}>
   <div style={{height:3,background:c,width:((frame/899)*100)+'%',boxShadow:'0 0 22px '+c}}/>
  </div>
 </AbsoluteFill>;
};
/**
 * V6 / 35 seconds at 30fps.
 * Piecewise continuous temporal remapping of proven V5 shot choreography.
 * No frame copying, no audio. Each visual pose is recomputed for each of
 * 1,050 frames, so every camera move, route tracer, target animation and
 * terminal subtitle slows naturally. Original geographic coordinates remain
 * untouched.
 *
 * Seconds:
 * core 0-4.40 | amenities 4.40-10.67 | Lotte 10.67-14.33
 * hospital 14.33-18.00 | Tam Thang 18.00-21.67
 * Bai Truoc 21.67-25.33 | city network 25.33-30.50
 * final reveal 30.50-35.00.
 */
const sourceCutFrames=[0,120,270,360,450,540,630,780,900] as const;
const outputCutFrames=[0,132,320,430,540,650,760,915,1050] as const;
const slowedFrame=(outputFrame:number):number=>{
 const f=Math.max(0,Math.min(1049,outputFrame));
 for(let i=0;i<sourceCutFrames.length-1;i++){
  const outStart=outputCutFrames[i],outEnd=outputCutFrames[i+1];
  if(f<outEnd||i===sourceCutFrames.length-2){
   const ratio=(f-outStart)/(outEnd-outStart);
   return sourceCutFrames[i]+ratio*(sourceCutFrames[i+1]-sourceCutFrames[i]);
  }
 }
 return 899;
};
export const CentrePointCinematicFutureV7:React.FC=()=>{
 const frame=slowedFrame(useCurrentFrame());
 const shot=shots.find(s=>frame>=s.start&&frame<s.end)??shots[7],local=frame-shot.start;
 const isRoute=ids.includes(shot.id),isOrbit=shot.id==='orbit',isNetwork=shot.id==='network',isFinal=shot.id==='final';
 const rt=findRoute(shot.id),progress=routeProgress(shot.id,local);
 const moving=rt?along(rt.p,progress):origin;
 const destination=getEnd(shot.id);
 let focus:P=origin,zoom=2,roll=0,cameraY=1035,cameraX=540;
 if(shot.id==='opening'){
  // Approach is a centre-lock-on dive, not the destination tracking move.
  focus=origin;zoom=lerp(1.55,2.55,tween(local,7,86))-0.08*tween(local,90,119);
  roll=lerp(7,0,tween(local,6,115));cameraY=1040;
 }else if(isOrbit){
  // Smooth circular crane orbit around the project; radius itself contracts.
  const angle=local/150*1.45-Math.PI*.7;
  const radius=110*(1-tween(local,95,149)) + 35;
  focus=[origin[0]+Math.cos(angle)*radius,origin[1]+Math.sin(angle)*radius*.48];
  zoom=lerp(2.45,1.72,tween(local,0,145));
  roll=4.4*Math.sin(local/65);cameraY=1078;
 }else if(shot.id==='lotte'){
  // Fast lateral chase, then controlled destination lock.
  focus=blend(origin,moving,tween(local,3,24));
  zoom=lerp(1.65,2.14,tween(local,11,70));
  roll=lerp(-6,1,tween(local,0,80));cameraY=1060;
 }else if(shot.id==='hospital'){
  // Reverse aerial crane: widening field of view as the route reveals.
  focus=blend(origin,moving,tween(local,8,32));
  zoom=lerp(2.37,1.38,tween(local,7,79));
  roll=lerp(7,-3,tween(local,0,82));cameraY=1080;
 }else if(shot.id==='tamthang'){
  // Off-axis arc toward the landmark with a short focus pull on arrival.
  const u=tween(local,0,74);
  focus=blend(origin,moving,tween(local,5,30));
  zoom=1.63+0.62*Math.sin(Math.PI*u*.78);
  roll=lerp(-10,7,tween(local,0,87));cameraY=1030;
 }else if(shot.id==='baitruoc'){
  // Coastal reveal: start closer, then open out rather than pushing in.
  focus=blend(origin,moving,tween(local,6,35));
  zoom=lerp(2.1,1.28,tween(local,5,80));
  roll=lerp(4,-1.5,tween(local,0,85));cameraY=1040;cameraX=520;
 }else if(isNetwork){
  // High aerial wide pullback to see all four routes in context.
  focus=project(center);zoom=lerp(1.27,.98,tween(local,9,145));
  roll=lerp(5,0,tween(local,10,148));cameraY=1000;
 }else if(isFinal){
  // Return to project then hand over to render/brand hero image.
  focus=origin;zoom=lerp(1.28,2.18,tween(local,0,80));
  roll=lerp(-4,0,tween(local,0,95));cameraY=1050;
 }
 const mapOpacity=isFinal?1-tween(local,18,52):1;
 const cameraTransform='translate('+cameraX+'px,'+cameraY+'px) rotate('+roll.toFixed(3)+'deg) scale('+zoom.toFixed(4)+') translate('+(-focus[0]).toFixed(2)+'px,'+(-focus[1]).toFixed(2)+'px)';
 return <AbsoluteFill style={{background:NAVY,overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 52%,#153B44 0%,#06141D 61%,#020B12 100%)'}}/>
  <div style={{position:'absolute',left:0,top:0,width:1080,height:1920,transform:cameraTransform,transformOrigin:'0 0',opacity:mapOpacity,willChange:'transform'}}>
   <Img src={staticFile('centrepoint-v3-basemap.svg')} style={{position:'absolute',left:-540,top:-960,width:2160,height:3840,maxWidth:'none'}}/>
   <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position:'absolute',left:0,top:0,overflow:'visible'}}>
    <Routing id={shot.id} local={local} frame={frame}/>
    {destinations.map(d=><DestinationBeacon key={d.id} id={d.id} frame={frame} zoom={zoom} active={shot.id===d.id||isNetwork} progress={isNetwork?tween(local,20,119):progress}/>)}
    <ProjectBeacon frame={frame} zoom={zoom}/>
    {(shot.id==='opening'||isOrbit||isNetwork)&&[125,230,370].map((r,i)=><circle key={r} cx={origin[0]} cy={origin[1]} r={r*(.4+.6*tween(local,0,66))} fill="none" stroke={i===1?LIME:CYAN} strokeWidth={i===1?2.6:1.6} strokeDasharray={i===1?'12 15':'5 15'} opacity={.45-i*.1}/>)}
   </svg>
  </div>
  {/* Reduce UI scanning noise: keep geographic map, marker and route only. */}
  {/* Remove the repeated kinetic light wipes for a calmer 35s pace. */}
  <Panels shot={shot} frame={frame} local={local}/>
 </AbsoluteFill>;
};