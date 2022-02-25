import { LineString, Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';

const onFeatureChange = function(event) {
    const feature = this;

    // Check if feature has attributes and tooltipElement property, if not, it has no tooltip to update
    const hasTooltip = feature?.attributes?.tooltipElement;
    if(!hasTooltip) {
        return;
    }

    const geometry = event.target;

    let tooltipText;
    let tooltipPosition;

    if(geometry instanceof Polygon) {
        tooltipText = formatArea(geometry);
        tooltipPosition = geometry.getInteriorPoint().getCoordinates();
    }else if(geometry instanceof LineString) {
        tooltipText = formatLength(geometry);
        tooltipPosition = geometry.getLastCoordinate();
    }

    feature.attributes.tooltipElement.innerHTML = tooltipText;
    feature.attributes.tooltipOverlay.setPosition(tooltipPosition);
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

export { onFeatureChange };