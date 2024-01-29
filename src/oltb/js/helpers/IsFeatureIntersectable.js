import { GeometryType } from '../ol-types/GeometryType';
import { FeatureProperties } from './constants/FeatureProperties';

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