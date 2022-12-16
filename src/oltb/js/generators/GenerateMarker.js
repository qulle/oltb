import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';

const DEFAULT_ICON = getIcon({
    path: SVG_PATHS.GeoPin,
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)',
    stroke: 'none'
});

const DEFAULT_OPTIONS = Object.freeze({
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
});

const generateMarker = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };

    const marker = new Feature({
        geometry: new Point(fromLonLat([
            options.lon, 
            options.lat
        ]))
    });

    marker.setStyle([
        new Style({
            image: new Circle({
                radius: options.radius,
                fill: new Fill({color: options.backgroundColor}),
                stroke: new Stroke({
                    color: `${options.backgroundColor.slice(0, -2)}66`,
                    width: options.width,
                })
            })
        }), 
        new Style({
            image: new Icon({
                src: `data:image/svg+xml;utf8,${options.icon}`,
                scale: options.scale,
                color: options.color
            })
        })
    ]);

    marker.setProperties({
        oltb: {
            type: FEATURE_PROPERTIES.type.marker,
            notSelectable: options.notSelectable, 
            infoWindow: options.infoWindow,
            name: options.name,
            info: options.info,
            backgroundColor: options.backgroundColor,
            color: options.color,
            icon: options.iconName
        }
    });

    return marker;
}

export { generateMarker };