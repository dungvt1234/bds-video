import React from 'react';
import {Composition} from 'remotion';
import {CentrePointVideo} from './projects/vungtau-centrepoint/CentrePointVideo';
import {CentrePointCinematicIntro} from './projects/vungtau-centrepoint/CentrePointCinematicIntro';
export const Root: React.FC=()=> <>
 <Composition id="VungTauCentrePoint" component={CentrePointVideo} durationInFrames={900} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointCinematicIntro" component={CentrePointCinematicIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
</>;
