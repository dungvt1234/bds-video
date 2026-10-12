/**
 * Fetch real driving geometry from an OSRM-compatible routing service.
 * Run locally with: ROUTING_BASE_URL=https://router.project-osrm.org npm run routes:fetch
 * Public demo services are not guaranteed available or suitable for production.
 * Output is deliberately a candidate; review routes against a licensed map before marking verified.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const locations=JSON.parse(readFileSync(resolve(here,'../locations.json'),'utf8'));
const base=process.env.ROUTING_BASE_URL;
if(!base||!/^https:\/\//.test(base))throw Error('Set ROUTING_BASE_URL to an HTTPS OSRM-compatible endpoint');
const origin=locations.origin.coordinates;
if(!Array.isArray(origin)||origin.length!==2)throw Error('Missing origin coordinates');
const features=[];
for(const destination of locations.destinations){
 const target=destination.coordinates;
 if(!Array.isArray(target)||target.length!==2)throw Error('Missing coordinates for '+destination.id);
 const url=new URL(base.replace(/\/$/,'')+'/route/v1/driving/'+origin.join(',')+';'+target.join(','));
 url.searchParams.set('overview','full');url.searchParams.set('geometries','geojson');url.searchParams.set('steps','false');
 const response=await fetch(url);
 if(!response.ok)throw Error(destination.id+': HTTP '+response.status);
 const payload=await response.json();
 const route=payload.routes?.[0];
 if(payload.code!=='Ok'||route?.geometry?.type!=='LineString'||route.geometry.coordinates.length<2)throw Error(destination.id+': missing route geometry');
 if(!Number.isFinite(route.distance)||!Number.isFinite(route.duration))throw Error(destination.id+': missing route metrics');
 features.push({type:'Feature',properties:{id:destination.id,originId:'centrepoint',destinationId:destination.id,travelMode:'driving',provider:url.origin,retrievedAt:new Date().toISOString(),distanceMeters:route.distance,durationSeconds:route.duration,verificationStatus:'CANDIDATE_REQUIRES_MAP_REVIEW'},geometry:route.geometry});
 console.log(destination.id,Math.round(route.distance)+'m',Math.round(route.duration)+'s');
}
const out={type:'FeatureCollection',features,metadata:{status:'CANDIDATE_REQUIRES_MAP_REVIEW',note:'Provider-returned driving routes; review geometry and access conditions before production.'}};
writeFileSync(resolve(here,'../routes.geojson'),JSON.stringify(out,null,2)+'\n');
console.log('Saved four candidate routes. Not verified.');
