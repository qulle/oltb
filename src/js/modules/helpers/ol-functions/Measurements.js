import { Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';

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
        return Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    }
    
    return Math.round(length * 100) / 100 + ' ' + 'm';
};

const formatArea = function(polygon) {
    const area = getArea(polygon);
    
    if(area > 10000) {
        return Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    }
        
    return Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
};

export {
    getMeasureValue,
    getMeasureCoordinates
};