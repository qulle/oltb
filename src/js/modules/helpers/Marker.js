import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { SVGPaths, getIcon } from '../core/Icons';

const defaultIcon = getIcon({
    path: SVGPaths.GeoPin,
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)',
    stroke: 'none'
});

const generateMarker = function(options = {}) {
    const {
        name,
        info,
        lat,
        lon,
        backgroundColor = '#0166A5FF',
        color = '#FFFFFF',
        iconName,
        icon = defaultIcon,
        width = 15,
        radius = 15,
        scale = .7,
        notSelectable,
        infoWindow
    } = options;
    
    const point = new Point(fromLonLat([lon, lat]));

    const featureBackground = new Feature({geometry: point});
    const featureIcon = new Feature({geometry: point});

    featureBackground.setStyle(new Style({
        image: new CircleStyle({
            radius: radius,
            fill: new Fill({color: backgroundColor}),
            stroke: new Stroke({
                color: backgroundColor.slice(0, -2) + '66',
                width: width,
            })
        })
    }));

    featureBackground.attributes = {
        notSelectable, 
        infoWindow,
        name,
        info,
        backgroundColor,
        color,
        icon: iconName,
        linkedFeature: featureIcon
    };
    
    featureIcon.setStyle(new Style({
        image: new Icon({
            src: 'data:image/svg+xml;utf8,' + icon,
            scale: scale,
            color: color
        })
    }));

    featureIcon.attributes = {
        notSelectable,
        infoWindow,
        name,
        info,
        backgroundColor,
        color,
        icon: iconName,
        linkedFeature: featureBackground
    };

    return [featureBackground, featureIcon];
}

export { generateMarker };