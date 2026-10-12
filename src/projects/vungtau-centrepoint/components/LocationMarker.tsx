import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
/** Screen-space marker with edge-aware label placement. */
export const LocationMarker:React.FC<{x:number;y:number;label:string;primary?:boolean}>=({x,y,label,primary=false})=>{
 const frame=useCurrentFrame();
 const pulse=interpolate(frame%50,[0,49],[14,42]);
 const right=x<540;
 const above=y>1100;
 const tx=x+(right?24:-24);
 const ty=y+(above?-35:47);
 return <g>
  <circle cx={x} cy={y} r={pulse} stroke="#baff55" strokeWidth={primary?3:2} opacity={1-(pulse-14)/28} fill="none"/>
  <circle cx={x} cy={y} r={primary?13:10} fill="#baff55" stroke="#0b1921" strokeWidth="4"/>
  <text x={tx} y={ty} textAnchor={right?'start':'end'} fill="#f5f9f3" fontSize={primary?24:20} fontWeight="700" stroke="#0b1921" strokeWidth="6" paintOrder="stroke">{label}</text>
 </g>;
};
