import { FeatureProperties } from "./constants/FeatureProperties";

const isFeatureIntersectable = function(type, geometry) {
    return (
        type !== FeatureProperties.type.marker      && 
        type !== FeatureProperties.type.measurement &&
        type !== FeatureProperties.type.windBarb    && 
        type !== FeatureProperties.type.layer       &&
        geometry.getType() !== 'LineString'          &&
        geometry.getType() !== 'Point'
    );
}

export { isFeatureIntersectable };