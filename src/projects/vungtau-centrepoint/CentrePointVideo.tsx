import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import locations from './locations.json';
import routing from './routes.geojson';
import basemap from './basemap.geojson';
import {NeonRoute} from './components/NeonRoute';
import {LocationMarker} from './components/LocationMarker';

type Point=[number,number];
type RouteFeature={type:'Feature';properties:{id:string;distanceMeters:number;durationSeconds:number;verificationStatus:string};geometry:{type:'LineString';coordinates:Point[]}};
const routes=(routing.features as RouteFeature[]);
type BaseFeature={properties:{kind:string;highway?:string|null};geometry:{coordinates:Point[]}};
const mapFeatures=(basemap.features as unknown as BaseFeature[]).filter(f=>f?.properties?.kind && Array.isArray(f?.geometry?.coordinates));
const destinations=locations.destinations;
const origin=locations.origin;
const scenes=[
 {id:'intro',name:'VŨNG TÀU CENTRE POINT',subtitle:'VỊ TRÍ KẾT NỐI'},
 ...destinations.map((d,i)=>({id:d.id,name:d.name.toUpperCase(),subtitle:`KẾT NỐI 0${i+1}` })),
 {id:'outro',name:'VŨNG TÀU CENTRE POINT',subtitle:'BỐN ĐIỂM ĐẾN • MỘT VỊ TRÍ'}
];
const W=1080,H=1920;
const rad=Math.PI/180;
const mercator=(p:Point):Point=>[p[0]*rad,Math.log(Math.tan(Math.PI/4+p[1]*rad/2))];
const allCoordinates:Point[]=[origin.coordinates as Point,...destinations.map(d=>d.coordinates as Point),...routes.flatMap(r=>r.geometry.coordinates)];
const projectFactory=(points:Point[],marginX=110,marginTop=300,marginBottom=420)=>{
 const projected=points.map(mercator);
 const xs=projected.map(p=>p[0]),ys=projected.map(p=>p[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const scale=Math.min((W-2*marginX)/Math.max(maxX-minX,1e-8),(H-marginTop-marginBottom)/Math.max(maxY-minY,1e-8));
 const midX=(minX+maxX)/2,midY=(minY+maxY)/2;
 const cy=(marginTop+H-marginBottom)/2;
 return (p:Point):Point=>{const [x,y]=mercator(p);return [W/2+(x-midX)*scale,cy-(y-midY)*scale]};
};
const overviewProject=projectFactory(allCoordinates);
const BaseMap:React.FC<{position:(p:Point)=>Point}>=({position})=><g fill="none" strokeLinejoin="round" strokeLinecap="round">{mapFeatures.map((f,i)=>{const coast=f.properties.kind==='coastline';const main=['primary','secondary','trunk'].includes(f.properties.highway||'');const d=f.geometry.coordinates.map((p,j)=>{const [x,y]=position(p);return `${j?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`}).join(' ');return <path key={i} d={d} stroke={coast?'#547c8d':main?'#607580':'#354b59'} strokeWidth={coast?3:main?2.5:1.25} opacity={coast?.85:main?.65:.48}/>})}</g>;
export const Scene:React.FC<{sceneId:string;name:string;subtitle:string}>=({sceneId,name,subtitle})=>{
 const frame=useCurrentFrame();
 const focus=routes.find(r=>r.properties.id===sceneId);
 const isOverview=!focus;
 const points=focus?[origin.coordinates as Point,...focus.geometry.coordinates]:allCoordinates;
 const localProject=projectFactory(points);
 const ease=interpolate(frame,[0,35],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const position=(p:Point):Point=>{const a=overviewProject(p),b=localProject(p);return [a[0]+(b[0]-a[0])*ease,a[1]+(b[1]-a[1])*ease]};
 const visibleRoutes=isOverview?routes:[focus];
 const opacity=interpolate(frame,[0,15,132,149],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const target=destinations.find(d=>d.id===sceneId);
 const formatKm=(m:number)=>(m/1000).toFixed(1).replace('.',',')+' km';
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 44%, #1d303a 0%, #09131d 82%)',color:'#f6f9f4',fontFamily:'Arial, sans-serif',opacity,overflow:'hidden'}}>
 <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position:'absolute',inset:0}}>
 <BaseMap position={position}/>
 {visibleRoutes.map(r=><NeonRoute key={r.properties.id} route={{id:r.properties.id,points:r.geometry.coordinates.map(position)}} duration={isOverview?95:105} color="#baff55"/>)}
 <LocationMarker x={position(origin.coordinates as Point)[0]} y={position(origin.coordinates as Point)[1]} label="CENTRE POINT" primary/>
 {target&&<LocationMarker x={position(target.coordinates as Point)[0]} y={position(target.coordinates as Point)[1]} label={target.name.toUpperCase()}/>}
 </svg>
 <div style={{position:'absolute',top:108,left:66,right:66}}>
 <div style={{fontSize:23,letterSpacing:5,color:'#baff55',fontWeight:700}}>VŨNG TÀU / LOCATION MOTION</div>
 <div style={{marginTop:38,fontSize:62,lineHeight:1.08,fontWeight:800,maxWidth:950}}>{name}</div>
 <div style={{marginTop:22,fontSize:25,letterSpacing:4,color:'#baff55'}}>{subtitle}</div>
 </div>
 {focus&&<div style={{position:'absolute',bottom:270,left:66,padding:'23px 30px',background:'#09131dd9',borderLeft:'5px solid #baff55'}}>
 <div style={{fontSize:49,fontWeight:800}}>{formatKm(focus.properties.distanceMeters)}</div>
 <div style={{fontSize:23,color:'#bacbd0',marginTop:8}}>OSRM • TUYẾN Ô TÔ ƯỚC TÍNH</div>
 </div>}
 <div style={{position:'absolute',bottom:104,left:66,right:66,fontSize:22,color:'#aebec4',lineHeight:1.5}}>
 {mapFeatures.length?'BẢN ĐỒ NỀN: © OPENSTREETMAP CONTRIBUTORS':'CHƯA TẢI BẢN ĐỒ NỀN OSM'}
 <div>ĐƯỜNG ĐI OSRM CHƯA XÁC MINH • KHÔNG PHẢI BẢN XUẤT BẢN</div>
 </div>
 </AbsoluteFill>;
};
export const CentrePointVideo:React.FC=()=> <AbsoluteFill style={{background:'#09131d'}}>{scenes.map((s,i)=><Sequence key={s.id} from={i*150} durationInFrames={150}><Scene sceneId={s.id} name={s.name} subtitle={s.subtitle}/></Sequence>)}</AbsoluteFill>;
