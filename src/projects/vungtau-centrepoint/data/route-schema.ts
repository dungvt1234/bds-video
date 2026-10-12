export type Coordinates=[number,number]; // [longitude,latitude] WGS84
export type VerifiedLocation={id:string;name:string;coordinates:Coordinates;sourceUrl:string;verifiedAt:string};
export type VerifiedRoute={id:string;originId:'centrepoint';destinationId:string;travelMode:'driving'|'walking';provider:string;retrievedAt:string;geometry:{type:'LineString';coordinates:Coordinates[]};distanceMeters:number|null;durationSeconds:number|null};
export const assertVerifiedRoute=(r:VerifiedRoute)=>{
 if(!r.provider||!r.retrievedAt||r.geometry.type!=='LineString'||r.geometry.coordinates.length<2)throw new Error('Verified routing geometry required');
 for(const [lon,lat] of r.geometry.coordinates)if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)throw new Error('Invalid WGS84 coordinates');
 if(r.distanceMeters!==null&&(!Number.isFinite(r.distanceMeters)||r.distanceMeters<0))throw new Error('Invalid distance');
 if(r.durationSeconds!==null&&(!Number.isFinite(r.durationSeconds)||r.durationSeconds<0))throw new Error('Invalid duration');
};
