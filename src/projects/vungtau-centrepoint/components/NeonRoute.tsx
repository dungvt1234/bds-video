import React from 'react';
import {Easing,interpolate,useCurrentFrame} from 'remotion';
export type RouteLine={id:string;points:[number,number][]};
export const NeonRoute:React.FC<{route:RouteLine;duration:number;color?:string}>=({route,duration,color='#baff55'})=>{
 const frame=useCurrentFrame();
 if(route.points.length<2)return null;
 const d=route.points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
 const progress=interpolate(frame,[5,duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
  <path d={d} stroke="#6c8791" strokeWidth={3} opacity={0.38}/>
  <path d={d} stroke={color} strokeWidth={22} opacity={0.14} pathLength={1} strokeDasharray="1" strokeDashoffset={1-progress}/>
  <path d={d} stroke={color} strokeWidth={10} opacity={0.28} pathLength={1} strokeDasharray="1" strokeDashoffset={1-progress}/>
  <path d={d} stroke={color} strokeWidth={4} pathLength={1} strokeDasharray="1" strokeDashoffset={1-progress}/>
 </g>;
};
