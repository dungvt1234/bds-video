declare module '*.geojson' {
  const value: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      properties: {id: string; distanceMeters: number; durationSeconds: number; verificationStatus: string};
      geometry: {type: 'LineString'; coordinates: [number, number][]};
    }>;
  };
  export default value;
}
