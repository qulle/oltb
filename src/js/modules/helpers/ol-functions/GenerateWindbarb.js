import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getWindBarb } from '../../core/SVGWindbarbs';
import { degreesToRadians } from '../Conversions';
import { FEATURE_PROPERTIES } from '../constants/FeatureProperties';

const DEFAULT_OPTIONS = {
    lat: undefined,
    lon: undefined,
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
};

const generateWindbarb = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };

    const windbarb = new Feature({
        geometry: new Point(fromLonLat([options.lon, options.lat]))
    });

    const icon = getWindBarb({
        windSpeed: options.windSpeed,
        width: options.width,
        height: options.height,
        fill: options.fill,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth
    });

    windbarb.setStyle([
        new Style({
            image: new Icon({
                src: 'data:image/svg+xml;utf8,' + icon,
                rotation: degreesToRadians(options.rotation),
                scale: options.scale
            })
        })
    ]);

    windbarb.setProperties({
        oltb: {
            type: FEATURE_PROPERTIES.type.windbarb,
            notSelectable: options.notSelectable, 
            infoWindow: options.infoWindow
        }
    });

    return windbarb;
}

export { generateWindbarb };