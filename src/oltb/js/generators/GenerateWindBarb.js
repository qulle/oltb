import _ from 'lodash';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { getWindBarb } from '../core/icons/GetWindBarb';
import { degreesToRadians } from '../helpers/Conversions';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { Fill, Icon, Text, Stroke, Style } from 'ol/style';

const DefaultOptions = Object.freeze({
    lon: undefined,
    lat: undefined,
    title: '',
    description: '',
    width: 250,
    height: 250,
    markerFill: '#3B4352FF',
    markerStroke: '#3B4352FF',
    markerStrokeWidth: 3,
    windSpeed: 0,
    rotation: 0,
    scale: 1,
    label: '',
    labelFill: '#FFFFFF',
    labelStroke: '#3B4352CC',
    labelStrokeWidth: 12,
    labelFont: '14px Calibri',
    labelUseEllipsisAfter: 20,
    labelUseUpperCase: false,
    notSelectable: true,
    infoWindow: undefined,
    replaceHashtag: true
});

const generateWindBarb = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

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
        fill: options.markerFill,
        stroke: options.markerStroke,
        strokeWidth: options.markerStrokeWidth,
        replaceHashtag: options.replaceHashtag
    });

    const iconStyle = new Style({
        image: new Icon({
            src: `data:image/svg+xml;utf8,${icon}`,
            rotation: degreesToRadians(options.rotation),
            scale: options.scale
        })
    });

    const label = options.labelUseUpperCase 
        ? options.label.toUpperCase() 
        : options.label;

    const labelOffsetY = 20;
    const labelOffsetDirection = (
        options.rotation >= 90 && options.rotation <= 270
    ) ? -1 : 1;

    const labelStyle =  new Style({
        text: new Text({
            font: options.labelFont,
            text: label.ellipsis(options.labelUseEllipsisAfter),
            placement: 'point',
            fill: new Fill({
                color: options.labelFill
            }),
            stroke: new Stroke({
                color: options.labelStroke,
                width: options.labelStrokeWidth
            }),
            offsetY: labelOffsetY * labelOffsetDirection
        })
    });

    const style = [iconStyle, labelStyle];

    windBarb.setStyle(style);
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
                label: options.label,
            },
            style: {
                width: options.width,
                height: options.height,
                markerFill: options.markerFill,
                markerStroke: options.markerStroke,
                markerStrokeWidth: options.markerStrokeWidth,
                labelFill: options.labelFill,
                labelStroke: options.labelStroke,
                labelStrokeWidth: options.labelStrokeWidth,
                labelFont: options.labelFont
            }
        }
    });

    return windBarb;
}

export { generateWindBarb };