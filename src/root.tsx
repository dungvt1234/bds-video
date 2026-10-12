import React from 'react';
import {CentrePointCity3DIntro} from './projects/vungtau-centrepoint/CentrePointCity3DIntro';
import {Composition} from 'remotion';
import {CentrePointHybridIntro} from './projects/vungtau-centrepoint/CentrePointHybridIntro';
import {CentrePointVideo} from './projects/vungtau-centrepoint/CentrePointVideo';
import {CentrePointCinematicIntro} from './projects/vungtau-centrepoint/CentrePointCinematicIntro';
export const Root: React.FC=()=> <>
 <Composition id="VungTauCentrePoint" component={CentrePointVideo} durationInFrames={900} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointCinematicIntro" component={CentrePointCinematicIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointHybridIntro" component={CentrePointHybridIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointHero3DIntro" component={()=><CentrePointCity3DIntro hero/>} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointCity3DIntro" component={CentrePointCity3DIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
</>;
