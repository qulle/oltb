import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';

const FILENAME = 'generators/GenerateMarker.js';
const DEFAULT_OPTIONS = Object.freeze({
    lat: undefined,
    lon: undefined,
    title: undefined,
    description: undefined,
    backgroundColor: '#0166A5FF',
    color: '#FFFFFFFF',
    width: 15,
    radius: 15,
    icon: 'GeoPin.Filled',
    iconWidth: 14,
    iconHeight: 14,
    notSelectable: true,
    infoWindow: undefined
});

const generateMarker = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };

    const [ iconName, iconVersion ] = options.icon.split('.');
    const icon = getIcon({
        path: SVG_PATHS[iconName][iconVersion],
        width: options.iconWidth,
        height: options.iconHeight,
        fill: 'rgb(255, 255, 255)',
        stroke: 'none'
    });

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
                fill: new Fill({
                    color: options.backgroundColor
                }),
                stroke: new Stroke({
                    color: `${options.backgroundColor.slice(0, -2)}66`,
                    width: options.width,
                })
            })
        }), 
        new Style({
            image: new Icon({
                src: `data:image/svg+xml;utf8,${icon}`,
                color: options.color
            })
        })
    ]);

    marker.setProperties({
        oltb: {
            type: FEATURE_PROPERTIES.Type.Marker,
            title: options.title,
            description: options.description,
            icon: options.icon,
            backgroundColor: options.backgroundColor,
            color: options.color,
            notSelectable: options.notSelectable, 
            infoWindow: options.infoWindow
        }
    });

    return marker;
}

export { generateMarker };