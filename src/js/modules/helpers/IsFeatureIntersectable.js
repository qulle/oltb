import { FEATURE_PROPERTIES } from "./constants/FeatureProperties";

const isFeatureIntersectable = function(type, geometry) {
    return type !== FEATURE_PROPERTIES.type.marker      && 
           type !== FEATURE_PROPERTIES.type.measurement &&
           type !== FEATURE_PROPERTIES.type.windbarb    && 
           type !== FEATURE_PROPERTIES.type.layer       &&
           geometry.getType() !== 'LineString'          &&
           geometry.getType() !== 'Point';
}

export { isFeatureIntersectable };