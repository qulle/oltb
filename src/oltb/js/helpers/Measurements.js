import { Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';

const FILENAME = 'helpers/Measurements.js';

const getMeasureValue = function(geometry) {
    return geometry instanceof Polygon
        ? formatArea(geometry)
        : formatLength(geometry);
}

const getMeasureCoordinates = function(geometry) {
    return geometry instanceof Polygon
        ? geometry.getInteriorPoint().getCoordinates()
        : geometry.getLastCoordinate();
}

const formatLength = function(line) {
    const length = getLength(line);
    
    if(length > 100) {
        return {
            value: Math.round((length / 1000) * 100) / 100,
            unit: 'km'
        };
    }
    
    return {
        value: Math.round(length * 100) / 100,
        unit: 'm'
    };
};

const formatArea = function(polygon) {
    const area = getArea(polygon);
    
    if(area > 10000) {
        return {
            value: Math.round((area / 1000000) * 100) / 100,
            unit: 'km<sup>2</sup>'
        };
    }
    
    return {
        value: Math.round(area * 100) / 100,
        unit: 'm<sup>2</sup>'
    };
};

export { getMeasureValue, getMeasureCoordinates };