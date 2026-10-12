/**
 * Builds a static SVG map using authentic OSM road and coastline ways already
 * stored in basemap.geojson. Also draws EXISTING OSM building footprints.
 * Does not generate roads, fake POIs or assert verified distances.
 * Web Mercator projection constants must match CentrePointCinematicFutureV3.tsx.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'../../../public/centrepoint-v3-basemap.svg');
const audit=resolve(root,'../../../public/centrepoint-v3-map-evidence.json');
const basemap=JSON.parse(readFileSync(resolve(root,'basemap.geojson'),'utf8'));
const shapes=JSON.parse(readFileSync(resolve(root,'future-footprints.json'),'utf8'));
const R=6378137,DEG=Math.PI/180;
const CX=107.102,CY=10.369,SCALE=.12;
const merc=([lon,lat])=>[R*lon*DEG,R*Math.log(Math.tan(Math.PI/4+lat*DEG/2))];
const [ox,oy]=merc([CX,CY]);
const point=(p)=>{const [x,y]=merc(p);return [540+(x-ox)*SCALE,960-(y-oy)*SCALE]};
const valid=p=>Array.isArray(p)&&p.length===2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&p[0]>106.9&&p[0]<107.3&&p[1]>10.1&&p[1]<10.6;
const line=coords=>{
 if(!Array.isArray(coords)||coords.length<2||!coords.every(valid))return '';
 return coords.map((p,i)=>{let [x,y]=point(p);return (i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)}).join('');
};
const roads={major:[],minor:[],paths:[]},coasts=[],buildings=[];
let rejected=0;
for(const f of basemap.features||[]){
 const geom=f.geometry||{},prop=f.properties||{};
 if(geom.type!=='LineString'){rejected++;continue}
 const d=line(geom.coordinates);
 if(!d){rejected++;continue}
 if(prop.kind==='coastline'){coasts.push(d);continue}
 if(prop.kind!=='road')continue;
 const k=prop.highway;
 const bucket=['motorway','trunk','primary','secondary','tertiary'].includes(k)?'major':
  ['residential','unclassified','service','living_street'].includes(k)?'minor':'paths';
 roads[bucket].push(d);
}
for(const ring of shapes.polygons||[]){
 if(!Array.isArray(ring)||ring.length<3||!ring.every(valid))continue;
 const d=line([...ring,ring[0]]);
 if(d)buildings.push(d+'Z');
}
const total=Object.values(roads).reduce((s,a)=>s+a.length,0);
if(total<100||coasts.length<1)throw Error('NO_GO: Missing genuine OSM roads or coastline');
if(!/openstreetmap/i.test(JSON.stringify(basemap.metadata||{})))
 throw Error('NO_GO: OSM provenance not found; inspect source metadata');
const join=list=>list.join(' ');
const svg=[
 '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">',
 '<rect width="1080" height="1920" fill="#081D27"/>',
 '<g fill="#152D39" stroke="#31515C" stroke-width=".55" opacity=".92">',
 '<path d="'+join(buildings)+'" fill-rule="evenodd"/>','</g>',
 '<path d="'+join(roads.paths)+'" stroke="#254251" stroke-width="1.25" opacity=".61" stroke-linejoin="round" stroke-linecap="round" fill="none"/>',
 '<path d="'+join(roads.minor)+'" stroke="#43616E" stroke-width="1.65" opacity=".8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>',
 '<path d="'+join(roads.major)+'" stroke="#648996" stroke-width="3.4" opacity=".83" stroke-linejoin="round" stroke-linecap="round" fill="none"/>',
 '<path d="'+join(coasts)+'" stroke="#2E8397" stroke-width="13" opacity=".12" stroke-linejoin="round" stroke-linecap="round" fill="none"/>',
 '<path d="'+join(coasts)+'" stroke="#71D5DF" stroke-width="3.2" opacity=".82" stroke-linejoin="round" stroke-linecap="round" fill="none"/>',
 '</svg>',''
].join('\n');
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,svg,'utf8');
writeFileSync(audit,JSON.stringify({
 source:basemap.metadata,
 status:'OSM_GEOMETRY_LOADED_POI_AND_ROUTE_COORDINATES_STILL_REQUIRE_REVIEW',
 projection:'Web Mercator EPSG:3857',
 projectionCenter:[CX,CY],
 scalePixelsPerProjectedMeter:SCALE,
 features:{roads:total,coastline:coasts.length,buildingFootprints:buildings.length},
 rejectedFeatures:rejected,
 outputSvgBytes:Buffer.byteLength(svg),
 note:'Road/coastline are genuine OSM data, decorative neon effects are not geographic. Coordinates, route choice and local amenities are pending visual/location checks.'
},null,2)+'\n','utf8');
console.log('Authentic V3 OSM map prepared:',{roads:total,coasts:coasts.length,footprints:buildings.length,bytes:svg.length});
