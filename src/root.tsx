import React from 'react';
import {Composition} from 'remotion';
import {CentrePointVideo} from './projects/vungtau-centrepoint/CentrePointVideo';
export const Root: React.FC=()=> <Composition id="VungTauCentrePoint" component={CentrePointVideo} durationInFrames={900} fps={30} width={1080} height={1920}/>;
