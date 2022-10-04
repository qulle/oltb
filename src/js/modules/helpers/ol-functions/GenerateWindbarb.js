import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getWindBarb } from '../../core/SVGWindbarbs';
import { degreesToRadians } from '../Conversions';

const DEFAULT_OPTIONS = {
    lat: undefined,
    lon: undefined,
    windSpeed: 0,
    rotation: 0,
    notSelectable: false,
    infoWindow: undefined
};

const generateWindbarb = function(options = {}) {
    options = { ...DEFAULT_OPTIONS, ...options };

    const windbarb = new Feature({
        geometry: new Point(fromLonLat([options.lon, options.lat]))
    });

    windbarb.setStyle([
        new Style({
            image: new Icon({
                src: 'data:image/svg+xml;utf8,' + getWindBarb(options.windSpeed),
                rotation: degreesToRadians(options.rotation)
            })
        })
    ]);

    windbarb.setProperties({
        notSelectable: options.notSelectable, 
        infoWindow: options.infoWindow
    });

    return windbarb;
}

export { generateWindbarb };