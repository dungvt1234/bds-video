import React from 'react';
import {AbsoluteFill} from 'remotion';
/** Visual placeholder only. Replace with a licensed, georeferenced basemap before final render. */
export const DarkMap:React.FC<{children?:React.ReactNode}>=({children})=><AbsoluteFill style={{background:'radial-gradient(ellipse at center, #1c3039 0%, #0c1620 75%)'}}>{children}<div style={{position:'absolute',bottom:24,right:32,fontSize:20,color:'#95a7ac'}}>MAP DATA PENDING VERIFICATION</div></AbsoluteFill>;
