import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const locations=JSON.parse(readFileSync(resolve(here,'../locations.json'),'utf8'));
const routes=JSON.parse(readFileSync(resolve(here,'../routes.geojson'),'utf8'));
if(routes.features?.length!==4)throw Error('Four route geometries required before basemap fetch');
const pts=[locations.origin.coordinates,...locations.destinations.map(x=>x.coordinates),...routes.features.flatMap(f=>f.geometry.coordinates)];
const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
const bounds=[Math.min(...ys)-.009,Math.min(...xs)-.009,Math.max(...ys)+.009,Math.max(...xs)+.009];
const bbox=bounds.join(',');
const query=`[out:json][timeout:90];(way["highway"](${bbox});way["natural"="coastline"](${bbox}););out geom;`;
const endpoint=process.env.OVERPASS_URL||'https://overpass.kumi.systems/api/interpreter';
if(!endpoint.startsWith('https://'))throw Error('HTTPS Overpass endpoint required');
const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),120000);
let response;
try{response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}),signal:abort.signal});}
finally{clearTimeout(timer)}
if(!response.ok)throw Error('Overpass HTTP '+response.status);
const json=await response.json();
const features=json.elements.filter(x=>x.type==='way'&&Array.isArray(x.geometry)&&x.geometry.length>1).map(x=>({
 type:'Feature',
 properties:{osmId:x.id,kind:x.tags?.natural==='coastline'?'coastline':'road',highway:x.tags?.highway||null,name:x.tags?.name||null},
 geometry:{type:'LineString',coordinates:x.geometry.map(p=>[p.lon,p.lat])}
}));
if(features.filter(x=>x.properties.kind==='road').length<20)throw Error('Insufficient road geometry; refusing to overwrite basemap');
const output={type:'FeatureCollection',features,metadata:{source:'© OpenStreetMap contributors',license:'ODbL 1.0',attribution:'© OpenStreetMap contributors',endpoint,retrievedAt:new Date().toISOString(),bbox,status:'CANDIDATE_REQUIRES_VISUAL_REVIEW'}};
writeFileSync(resolve(here,'../basemap.geojson'),JSON.stringify(output)+'\n');
console.log('Saved',features.length,'OSM road/coastline features. Visual review required.');
