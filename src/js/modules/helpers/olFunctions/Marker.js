import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { SVG_PATHS, getIcon } from '../../core/Icons';

const DEFAULT_ICON = getIcon({
    path: SVG_PATHS.GeoPin,
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)',
    stroke: 'none'
});

const DEFAULT_OPTIONS = {
    name: undefined,
    info: undefined,
    lat: undefined,
    lon: undefined,
    backgroundColor: '#0166A5FF',
    color: '#FFFFFF',
    iconName: undefined,
    icon: DEFAULT_ICON,
    width: 15,
    radius: 15,
    scale: .7,
    notSelectable: false,
    infoWindow: undefined
};

const generateMarker = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };
    
    const point = new Point(fromLonLat([options.lon, options.lat]));

    const featureBackground = new Feature({
        geometry: point
    });
    
    const featureIcon = new Feature({
        geometry: point
    });

    featureBackground.setStyle(new Style({
        image: new CircleStyle({
            radius: options.radius,
            fill: new Fill({color: options.backgroundColor}),
            stroke: new Stroke({
                color: options.backgroundColor.slice(0, -2) + '66',
                width: options.width,
            })
        })
    }));
    
    featureIcon.setStyle(new Style({
        image: new Icon({
            src: 'data:image/svg+xml;utf8,' + options.icon,
            scale: options.scale,
            color: options.color
        })
    }));

    const commonProperties = {
        notSelectable: options.notSelectable, 
        infoWindow: options.infoWindow,
        name: options.name,
        info: options.info,
        backgroundColor: options.backgroundColor,
        color: options.color,
        icon: options.iconName
    };

    featureBackground.setProperties({
        ...commonProperties,
        partner: featureIcon
    });

    featureIcon.setProperties({
        ...commonProperties,
        partner: featureBackground
    });

    return [featureBackground, featureIcon];
}

export { generateMarker };