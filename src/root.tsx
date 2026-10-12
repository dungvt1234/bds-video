import React from 'react';
import {CentrePointCinematicFuture30} from './projects/vungtau-centrepoint/CentrePointCinematicFuture30';
import {CentrePointCity3DIntro} from './projects/vungtau-centrepoint/CentrePointCity3DIntro';
import {Composition} from 'remotion';
import {CentrePointRealMap3DPreview} from './projects/vungtau-centrepoint/CentrePointRealMap3DPreview';
import {CentrePointMiniature3DDemo} from './projects/vungtau-centrepoint/CentrePointMiniature3DDemo';
import {CentrePointStory30Draft} from './projects/vungtau-centrepoint/CentrePointStory30Draft';
import {CentrePointGroundRiseIntro} from './projects/vungtau-centrepoint/CentrePointGroundRiseIntro';
import {CentrePointHybridIntro} from './projects/vungtau-centrepoint/CentrePointHybridIntro';
import {CentrePointHybridIntroV2} from './projects/vungtau-centrepoint/CentrePointHybridIntroV2';
import {CentrePointVideo} from './projects/vungtau-centrepoint/CentrePointVideo';
import {CentrePointCinematicIntro} from './projects/vungtau-centrepoint/CentrePointCinematicIntro';
export const Root: React.FC=()=> <>
 <Composition id="CentrePointCinematicFuture30" component={CentrePointCinematicFuture30} durationInFrames={900} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointRealMap3DPreview" component={CentrePointRealMap3DPreview} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointMiniature3DDemo" component={CentrePointMiniature3DDemo} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointStory30Draft" component={CentrePointStory30Draft} durationInFrames={900} fps={30} width={1080} height={1920}/>
 <Composition id="VungTauCentrePoint" component={CentrePointVideo} durationInFrames={900} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointCinematicIntro" component={CentrePointCinematicIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointGroundRiseIntro" component={CentrePointGroundRiseIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointHybridIntroV2" component={CentrePointHybridIntroV2} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointHybridIntro" component={CentrePointHybridIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointHero3DIntro" component={()=><CentrePointCity3DIntro hero/>} durationInFrames={150} fps={30} width={1080} height={1920}/>
 <Composition id="CentrePointCity3DIntro" component={CentrePointCity3DIntro} durationInFrames={150} fps={30} width={1080} height={1920}/>
</>;
