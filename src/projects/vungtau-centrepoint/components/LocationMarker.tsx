import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
export const LocationMarker:React.FC<{x:number;y:number;label:string}>=({x,y,label})=>{
 const frame=useCurrentFrame();const r=interpolate(frame%45,[0,44],[10,34]);
 return <g><circle cx={x} cy={y} r={r} stroke="#baff55" strokeWidth="2" opacity={1-(r-10)/24} fill="none"/><circle cx={x} cy={y} r="8" fill="#baff55"/><text x={x+17} y={y-18} fill="#f5f9f3" fontSize="23" fontWeight="700">{label}</text></g>;
};
