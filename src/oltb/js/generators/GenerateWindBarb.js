import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { getWindBarb } from '../core/icons/GetWindBarb';
import { degreesToRadians } from '../helpers/Conversions';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';

const DefaultOptions = Object.freeze({
    lon: undefined,
    lat: undefined,
    title: undefined,
    description: undefined,
    width: 250,
    height: 250,
    fill: '#3B4352FF',
    stroke: '#3B4352FF',
    windSpeed: 0,
    rotation: 0,
    strokeWidth: 3,
    scale: 1,
    notSelectable: true,
    infoWindow: undefined,
    replaceHashtag: true
});

const generateWindBarb = function(options = {}) {
    options = { ...DefaultOptions, ...options };

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
        strokeWidth: options.strokeWidth,
        replaceHashtag: options.replaceHashtag
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
            lon: options.lon,
            lat: options.lat,
            type: FeatureProperties.type.windBarb,
            notSelectable: options.notSelectable, 
            infoWindow: options.infoWindow,
            windBarb: {
                windSpeed: options.windSpeed,
                title: options.title,
                description: options.description,
            },
            style: {
                width: options.width,
                height: options.height,
                fill: options.fill,
                stroke: options.stroke,
                strokeWidth: options.strokeWidth
            }
        }
    });

    return windBarb;
}

export { generateWindBarb };