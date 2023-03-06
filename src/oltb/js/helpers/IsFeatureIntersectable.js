import { FEATURE_PROPERTIES } from "./constants/FeatureProperties";

const FILENAME = 'helpers/IsFeatureIntersectable.js';

const isFeatureIntersectable = function(type, geometry) {
    return (
        type !== FEATURE_PROPERTIES.Type.Marker      && 
        type !== FEATURE_PROPERTIES.Type.Measurement &&
        type !== FEATURE_PROPERTIES.Type.WindBarb    && 
        type !== FEATURE_PROPERTIES.Type.Layer       &&
        geometry.getType() !== 'LineString'          &&
        geometry.getType() !== 'Point'
    );
}

export { isFeatureIntersectable };