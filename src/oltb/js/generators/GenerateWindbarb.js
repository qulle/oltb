import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { getWindBarb } from '../core/icons/GetWindBarb';
import { degreesToRadians } from '../helpers/Conversions';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';

const FILENAME = 'generators/generateWindBarb.js';
const DEFAULT_OPTIONS = Object.freeze({
    lon: undefined,
    lat: undefined,
    windSpeed: 0,
    rotation: 0,
    width: 250,
    height: 250,
    fill: 'rgb(59, 67, 82)',
    stroke: 'rgb(59, 67, 82)',
    strokeWidth: 3,
    scale: 1,
    notSelectable: false,
    infoWindow: undefined
});

const generateWindBarb = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };

    const windBarb = new Feature({
        geometry: new Point(fromLonLat([
            options.lon, 
            options.lat
        ]))
    });

    const icon = getWindBarb({
        windSpeed: options.windSpeed,
        width: options.width,
        height: options.height,
        fill: options.fill,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth
    });

    windBarb.setStyle([
        new Style({
            image: new Icon({
                src: `data:image/svg+xml;utf8,${icon}`,
                rotation: degreesToRadians(options.rotation),
                scale: options.scale
            })
        })
    ]);

    windBarb.setProperties({
        oltb: {
            type: FEATURE_PROPERTIES.Type.WindBarb,
            lon: options.lon,
            lat: options.lat,
            notSelectable: options.notSelectable, 
            infoWindow: options.infoWindow
        }
    });

    return windBarb;
}

export { generateWindBarb };