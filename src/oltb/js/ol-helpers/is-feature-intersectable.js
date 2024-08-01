import { GeometryType } from '../ol-mappers/ol-geometry/ol-geometry';
import { FeatureProperties } from './feature-properties';

const isFeatureIntersectable = function(type, geometry) {
    return (
        type !== FeatureProperties.type.iconMarker     && 
        type !== FeatureProperties.type.windBarb       && 
        type !== FeatureProperties.type.measurement    &&
        type !== FeatureProperties.type.layer          &&
        geometry.getType() !== GeometryType.LineString &&
        geometry.getType() !== GeometryType.Point
    );
}

export { isFeatureIntersectable };