import { FEATURE_PROPERTIES } from "./constants/FeatureProperties";

const isFeatureIntersectable = function(type, geometry) {
    return type !== FEATURE_PROPERTIES.Type.Marker      && 
           type !== FEATURE_PROPERTIES.Type.Measurement &&
           type !== FEATURE_PROPERTIES.Type.Windbarb    && 
           type !== FEATURE_PROPERTIES.Type.Layer       &&
           geometry.getType() !== 'LineString'          &&
           geometry.getType() !== 'Point';
}

export { isFeatureIntersectable };