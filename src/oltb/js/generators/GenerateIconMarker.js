import _ from 'lodash';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { hasNestedProperty } from '../helpers/browser/HasNestedProperty';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { Circle, Fill, Icon, Text, Stroke, Style } from 'ol/style';

const DefaultOptions = Object.freeze({
    lon: undefined,
    lat: undefined,
    title: '',
    description: '',
    width: 14,
    radius: 14,
    markerFill: '#0166A5FF',
    markerStroke: '#FFFFFFFF',
    icon: 'geoPin.filled',
    iconWidth: 14,
    iconHeight: 14,
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

const generateIconMarker = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    const marker = new Feature({
        geometry: new Point(fromLonLat([
            options.lon, 
            options.lat
        ]))
    });

    const [ iconName, iconVersion ] = options.icon.split('.');
    const [ defaultIconName, defaultIconVersion ] = DefaultOptions.icon.split('.');

    const path = hasNestedProperty(SvgPaths, iconName, iconVersion)
        ? SvgPaths[iconName][iconVersion]
        : SvgPaths[defaultIconName][defaultIconVersion];

    const icon = getIcon({
        path: path,
        width: options.iconWidth,
        height: options.iconHeight,
        fill: '#FFFFFFFF',
        stroke: 'none',
        replaceHashtag: options.replaceHashtag
    });

    const circleStyle = new Style({
        image: new Circle({
            radius: options.radius,
            fill: new Fill({
                color: options.markerFill
            }),
            stroke: new Stroke({
                color: `${options.markerFill.slice(0, -2)}66`,
                width: options.width,
            })
        })
    });

    const iconStyle = new Style({
        image: new Icon({
            src: `data:image/svg+xml;utf8,${icon}`,
            color: options.markerStroke
        })
    });

    const label = options.labelUseUpperCase 
        ? options.label.toUpperCase() 
        : options.label;
        
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
            offsetY: -(options.radius * 2.5)
        })
    });

    const style = [circleStyle, iconStyle, labelStyle];

    marker.setStyle(style);
    marker.setProperties({
        oltb: {
            lon: options.lon,
            lat: options.lat,
            type: FeatureProperties.type.marker,
            notSelectable: options.notSelectable,
            infoWindow: options.infoWindow,
            marker: {
                icon: options.icon,
                title: options.title,
                description: options.description,
                label: options.label
            },
            style: {
                width: options.width,
                radius: options.radius,
                markerFill: options.markerFill,
                markerStroke: options.markerStroke,
                labelFill: options.labelFill,
                labelStroke: options.labelStroke,
                labelStrokeWidth: options.labelStrokeWidth,
                labelFont: options.labelFont
            }
        }
    });

    return marker;
}

export { generateIconMarker };