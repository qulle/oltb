import _ from 'lodash';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { hasNestedProperty } from '../helpers/browser/HasNestedProperty';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';

const DefaultOptions = Object.freeze({
    lon: undefined,
    lat: undefined,
    title: undefined,
    description: undefined,
    width: 14,
    radius: 14,
    fill: '#0166A5FF',
    stroke: '#FFFFFFFF',
    icon: 'geoPin.filled',
    iconWidth: 14,
    iconHeight: 14,
    notSelectable: true,
    infoWindow: undefined,
    replaceHashtag: true
});

const generateMarker = function(options = {}) {
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

    marker.setStyle([
        new Style({
            image: new Circle({
                radius: options.radius,
                fill: new Fill({
                    color: options.fill
                }),
                stroke: new Stroke({
                    color: `${options.fill.slice(0, -2)}66`,
                    width: options.width,
                })
            })
        }), 
        new Style({
            image: new Icon({
                src: `data:image/svg+xml;utf8,${icon}`,
                color: options.stroke
            })
        })
    ]);

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
            },
            style: {
                width: options.width,
                radius: options.radius,
                fill: options.fill,
                stroke: options.stroke
            }
        }
    });

    return marker;
}

export { generateMarker };