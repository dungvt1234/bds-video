import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const locations=JSON.parse(readFileSync(resolve(dir,'../locations.json'),'utf8'));
const [lon,lat]=locations.origin.coordinates;
// Local neighborhood around Centre Point only; not a complete 4-destination 3D city.
const radius=.006;
const bbox=[lat-radius,lon-radius,lat+radius,lon+radius].join(',');
const query=`[out:json][timeout:90];way["building"](${bbox});out geom;`;
const endpoints=process.env.OVERPASS_URL?[process.env.OVERPASS_URL]:[
 'https://overpass-api.de/api/interpreter',
 'https://overpass.private.coffee/api/interpreter',
 'https://overpass.kumi.systems/api/interpreter'
];
let data,endpoint,errors=[];
for(const url of endpoints){
 if(!url.startsWith('https://'))throw Error('HTTPS endpoint required');
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),75000);
 try{
  const response=await fetch(url,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}),signal:ctrl.signal});
  if(!response.ok)throw Error('HTTP '+response.status);
  const result=await response.json();
  if(!Array.isArray(result.elements))throw Error('Missing Overpass elements');
  data=result;endpoint=url;break;
 }catch(e){errors.push(url+': '+String(e));console.warn('Overpass endpoint failed:',url,String(e))}
 finally{clearTimeout(timer)}
}
if(!data)throw Error('All Overpass endpoints failed: '+errors.join(' | '));
const features=data.elements.filter(w=>w.type==='way'&&w.geometry?.length>=4).map(w=>{
 const p=w.geometry.map(x=>[x.lon,x.lat]);
 if(p[0][0]!==p.at(-1)[0]||p[0][1]!==p.at(-1)[1])p.push(p[0]);
 const rawHeight=Number.parseFloat(w.tags?.height);
 const levels=Number.parseFloat(w.tags?.['building:levels']);
 const heightMeters=Number.isFinite(rawHeight)&&rawHeight>0?rawHeight:Number.isFinite(levels)&&levels>0?levels*3:null;
 return {type:'Feature',properties:{osmId:w.id,building:w.tags?.building||'yes',heightMeters,heightSource:heightMeters===null?'UNKNOWN':Number.isFinite(rawHeight)&&rawHeight>0?'OSM_HEIGHT':'ESTIMATED_FROM_OSM_LEVELS'},geometry:{type:'Polygon',coordinates:[p]}};
});
if(features.length<10)throw Error('Too few OSM building footprints; refusing to emit misleading empty model');
const out={type:'FeatureCollection',metadata:{source:'OpenStreetMap',attribution:'© OpenStreetMap contributors',license:'ODbL 1.0',bbox,endpoint,retrievedAt:new Date().toISOString(),status:'CANDIDATE_REQUIRES_VISUAL_REVIEW',note:'Footprints from OSM. Height unknown for some buildings; never present as verified building geometry.'},features};
const output=resolve(dir,'../buildings-osm-candidate.geojson');
writeFileSync(output,JSON.stringify(out)+'\n');
console.log('OSM candidate buildings:',features.length,'known/derived heights:',features.filter(f=>f.properties.heightMeters!==null).length);
