import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
export type RouteLine={id:string;points:[number,number][]};
export const NeonRoute:React.FC<{route:RouteLine;duration:number;color?:string}>=({route,duration,color='#baff55'})=>{
 const frame=useCurrentFrame();
 if(route.points.length<2)return null;
 const d=route.points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');
 const progress=interpolate(frame,[0,duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={d} stroke={color} strokeWidth={13} opacity={.2} pathLength={1} strokeDasharray="1" strokeDashoffset={1-progress}/><path d={d} stroke={color} strokeWidth={4} pathLength={1} strokeDasharray="1" strokeDashoffset={1-progress}/></g>;
};
